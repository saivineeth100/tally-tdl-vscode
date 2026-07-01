import { Connection, Diagnostic, DiagnosticSeverity, TextDocuments } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from "./core/parser/parser";
import { parseXmlToAst } from "./core/xml/xmlAdapter";
import { SourceFile } from "./core/ast/ast";
import { getDiagnosticSeverity, isDiagnosticsEnabled, shouldTreatWarningsAsErrors, shouldHideWarnings } from './utils/settingsManager';
import { ScopeManager } from "./semantics/scopeManager";
import { ReferenceIndex } from "./semantics/symbols/referenceIndex";
import * as fs from 'fs';
import * as path from 'path';
import { loadMetadata } from './semantics/metadataLoader';
import { URI } from 'vscode-uri';
import { normalizeUri } from './utils/uri';
import { logger } from './logger';
import { validateSourceFile } from './validation';

export async function readFileWithEncoding(filePath: string): Promise<string> {
    const buffer = await fs.promises.readFile(filePath);
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        return buffer.toString('utf16le');
    }
    return buffer.toString('utf-8');
}

/**
 * Document state containing parsed AST and diagnostics
 */
export interface DocState {
    /** Parsed source file AST */
    sourceFile: SourceFile;
    /** Diagnostics for the document */
    diagnostics: Diagnostic[];
}

/**
 * Manages document state including parsing, diagnostics, and symbol table.
 * Supports workspace-wide file scanning for definitions.
 *
 * ## File Parsing and Workspace Scanning Architecture
 *
 * The `DocManager` builds a complete directed graph of all TDL/TXT files in the workspace.
 * Its parsing logic operates in two phases:
 *
 * 1. Workspace Scanning (`scanWorkspaceFolders` / `scanDirectory`):
 *    - First pass: Locates all `.tpj` (Tally Project) files in the folder.
 *    - If a `.tpj` file exists, it is parsed to find its root `Project File` (usually a `.txt` or `.tdl`).
 *    - The root file is added to `this.tpjFiles`.
 *    - The root file is parsed (`indexFile`), which recursively extracts its `[Include: ...]` directives.
 *    - All included files are recursively parsed and added to the `includeGraph` and `parentGraph`.
 *    - Second pass: Scans for standalone `.txt`/`.tdl` files that were NOT referenced by any `.tpj` file.
 *    - These standalone files are parsed independently to ensure their symbols are available for auto-completion.
 *
 * 2. Diagnostics Validation (`revalidateAll`):
 *    - Diagnostics are only displayed for files that are logically connected to either an active editor window OR a `.tpj` file.
 *    - If a `.tpj` file exists, `revalidateAll` traverses down its `includeGraph` and validates all connected files (e.g., all 400+ files).
 *    - If NO `.tpj` file exists in the folder (e.g. a loose file opened from outside), `revalidateAll` only finds the active open document (`Rel 1.5.txt`),
 *      walks UP to its root via `parentGraph`, and then walks DOWN via `includeGraph`.
 *    - This guarantees that loose files only validate their immediate isolated dependency graph (e.g. 11 files) rather than the entire universe.
 */
export class DocManager {
    private docs = new Map<string, DocState>();

    /** Indexed document state for closed files (parsed but not open) */
    private indexedDocs = new Map<string, DocState>();

    /** Scope Manager for TDL files */
    public readonly tdlScopeManager = new ScopeManager();
    /** Scope Manager for XML files */
    public readonly xmlScopeManager = new ScopeManager();

    /** Flag to track if workspace scan is in progress */
    public scanningInProgress = false;
    private projectNodesCache = new Map<string, Set<string>>();
    /** Queue for workspace scan requests */
    private scanQueue: string[][] = [];
    private hasInitialScanStarted = false;

    /** Flag to indicate if base TDL metadata has finished loading */
    public isMetadataLoaded = false;

    /** Paths to exclude from scanning completely */
    public excludePaths: string[] = [];
    private excludeRegexes: { regex: RegExp | null, pattern: string }[] = [];

    /** Workspace root folders */
    public workspaceFolders: string[] = [];

    /** Files explicitly mentioned in .tpj files */
    public tpjFiles = new Set<string>();

    /** Directed graph of inclusions: URI -> Set of URIs it includes */
    private includeGraph = new Map<string, Set<string>>();

    /** Reverse graph of inclusions: URI -> Set of URIs that include it */
    private parentGraph = new Map<string, Set<string>>();

    private fileTimestamps: Map<string, number> = new Map();

    private rebuildTimers = new Map<string, NodeJS.Timeout>();
    private readonly REBUILD_DELAY = 200; // ms

    constructor(
        private connection: Connection, 
        private documents: TextDocuments<TextDocument>,
        public resolveIncludePath?: (currentPath: string, name: string) => string | null
    ) {
        documents.onDidOpen(e => {
            const uriStr = typeof e.document.uri === 'string' ? e.document.uri : (e.document as any).uri;
            logger.trace(`[Trace] Server RECEIVED onDidOpen for ${path.basename(uriStr)} at ${new Date().toISOString()}`);
            this.indexedDocs.delete(e.document.uri);
            this.rebuild(e.document);
        });
        documents.onDidChangeContent(e => {
            const uri = e.document.uri;
            const existing = this.rebuildTimers.get(uri);
            if (existing) clearTimeout(existing);
            this.rebuildTimers.set(uri, setTimeout(() => {
                this.rebuildTimers.delete(uri);
                this.rebuild(e.document);
            }, this.REBUILD_DELAY));
        });
        documents.onDidClose(e => {
            this.docs.delete(e.document.uri);
            // Re-index from disk so closed file remains available for cross-file features
            const fsPath = URI.parse(e.document.uri).fsPath;
            // Clear old index
            this.getScopeManager(e.document.uri).projectScope.referenceIndex.clearFile(e.document.uri);
            this.indexFile(fsPath, new Set()).catch(err => {
                logger.warn(`Failed to re-index closed file: ${err instanceof Error ? err.stack || err.message : String(err)}`);
            });
            this.getScopeManager(e.document.uri).removeFileScope(e.document.uri);
            this.connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
        });
    }



    /** Helper to get the right ScopeManager for a URI */
    public getScopeManager(uri: string): ScopeManager {
        const lowerUri = uri.toLowerCase();
        return lowerUri.endsWith('.xml') || lowerUri.endsWith('.tdlxml') ? this.xmlScopeManager : this.tdlScopeManager;
    }

    /**
     * Get document state for a URI
     */
    get(uri: string): DocState | undefined {
        const norm = normalizeUri(uri);
        return this.docs.get(norm) || this.indexedDocs.get(norm);
    }

    /** Get only open document state */
    getOpen(uri: string): DocState | undefined {
        return this.docs.get(normalizeUri(uri));
    }

    /** Get only indexed document state */
    getIndexed(uri: string): DocState | undefined {
        return this.indexedDocs.get(normalizeUri(uri));
    }

    /**
     * Get all active document states
     */
    getAllDocs(): IterableIterator<[string, DocState]> {
        return this.docs.entries();
    }

    /**
     * Get all known URIs (both open and closed but indexed)
     */
    getAllIndexedUris(): IterableIterator<string> {
        return this.indexedDocs.keys();
    }

    /**
     * Store patterns indicating which files/folders should be skipped during scan.
     */
    public setExcludePaths(paths: string[]): void {
        this.excludePaths = paths;
        this.excludeRegexes = [];
        for (const pattern of paths) {
            try {
                this.excludeRegexes.push({ regex: new RegExp(pattern.replace(/\\/g, '\\\\'), 'i'), pattern });
            } catch (e) {
                this.excludeRegexes.push({ regex: null, pattern });
            }
        }
    }

    private isExcluded(fullPath: string): boolean {
        for (const entry of this.excludeRegexes) {
            if (entry.regex) {
                if (entry.regex.test(fullPath)) return true;
            } else {
                if (fullPath.toLowerCase().includes(entry.pattern.toLowerCase())) return true;
            }
        }
        return false;
    }

    /**
     * Re-validate all documents (both open and closed but indexed)
     * Useful when global settings change.
     */
    private revalidateTimeout: NodeJS.Timeout | null = null;

    public async revalidateAll(openDocsIter: Iterable<any>): Promise<void> {
        const openDocs = Array.from(openDocsIter);
        if (this.revalidateTimeout) {
            clearTimeout(this.revalidateTimeout);
        }
        
        return new Promise((resolve) => {
            this.revalidateTimeout = setTimeout(async () => {
                this.revalidateTimeout = null;
                
                // If a workspace scan is currently running, it will automatically
                // trigger revalidateAll when it finishes, so we can safely abort this run.
                if (!this.hasInitialScanStarted || this.scanningInProgress) {
                    resolve();
                    return;
                }

                const startTime = Date.now();
                logger.trace(`[Perf] Starting revalidateAll for ${openDocs.length} open documents...`);
        const allKnownUris = new Set<string>();

        // 1. Gather all related project nodes (tpj files, included files, parent files)
        for (const doc of openDocs) {
            const projectNodes = this.getProjectNodes(doc.uri);
            for (const node of projectNodes) {
                allKnownUris.add(node);
            }
        }
        
        for (const tpj of this.tpjFiles) {
            const projectNodes = this.getProjectNodes(tpj);
            for (const node of projectNodes) {
                allKnownUris.add(node);
            }
        }

        // 2. Rebuild open documents
        const openDocPromises: Promise<void>[] = [];
        for (const doc of openDocs) {
            openDocPromises.push(this.rebuild(doc).catch(err => {
                logger.error(`Error rebuilding doc ${doc.uri}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
            }));
        }
        await Promise.all(openDocPromises);

        // 3. Re-validate closed but related files to update their diagnostics
        const promises: Promise<void>[] = [];
        for (const uriStr of allKnownUris) {
            // Skip if the file is already open (handled by rebuild)
            if (this.docs.has(normalizeUri(uriStr))) continue;

            const fsPath = URI.parse(uriStr).fsPath;
            
            // forceValidation = true so that indexFile runs validation even if unchanged
            promises.push(this.indexFile(fsPath, new Set(), false, true).catch(err => {
                logger.error(`Error indexing file ${fsPath}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
            }));

            if (promises.length >= 50) {
                await Promise.all(promises);
                promises.length = 0;
                // Yield to the event loop
                await new Promise(resolve => setImmediate(resolve));
            }
        }
        if (promises.length > 0) {
            await Promise.all(promises);
        }
        
        const endTime = Date.now();
        logger.trace(`[Perf] Finished revalidateAll in ${endTime - startTime}ms. (Open docs: ${openDocs.length}, Closed known URIs: ${allKnownUris.size - openDocs.length})`);
        
        resolve();
            }, 500); // 500ms debounce
        });
    }

    /**
     * Scan workspace folders for TDL files (async, non-blocking)
     * @param workspaceFolders Array of workspace folder URIs
     */
    public scanWorkspaceFolders(workspaceFolders: string[]): void {
        this.hasInitialScanStarted = true;
        if (this.scanningInProgress) {
            this.scanQueue.push(workspaceFolders);
            return;
        }
        this.scanningInProgress = true;

        // Use setTimeout to not block the event loop
        setTimeout(async () => {
            const startTime = Date.now();
            logger.trace(`[Perf] Starting workspace scan for ${workspaceFolders.length} folders...`);
            try {
                for (const folderUri of workspaceFolders) {
                    await this.scanFolder(folderUri);
                }
                const count = this.tdlScopeManager.getSymbolCount() + this.xmlScopeManager.getSymbolCount();
                logger.trace(`[Perf] Workspace scan complete in ${Date.now() - startTime}ms. ${count} definitions indexed.`);
            } catch (error) {
                logger.error(`Workspace scan error: ${error}`);
            } finally {
                this.scanningInProgress = false;
                
                if (this.scanQueue.length > 0) {
                    const nextScan = this.scanQueue.shift()!;
                    this.scanWorkspaceFolders(nextScan);
                } else {
                    // All queued scans complete! Revalidate open docs so initial 'Missing Definition' diagnostics go away.
                    this.revalidateAll(this.documents.all()).catch(e => logger.error(`Revalidation failed: ${e}`));
                }
            }
        }, 0);
    }

    /**
     * Clear all symbols for a specific folder path
     */
    clearFolderSymbols(folderPath: string): void {
        // Clean ScopeManager state for all URIs in this folder
        const removeURIs: string[] = [];
        for (const [uri] of this.tdlScopeManager.fileMap) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) removeURIs.push(uri);
        }
        for (const [uri] of this.xmlScopeManager.fileMap) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) removeURIs.push(uri);
        }
        for (const uri of removeURIs) {
            this.getScopeManager(uri).removeFileScope(uri);
            this.getScopeManager(uri).projectScope.referenceIndex.clearFile(uri);
        }
        
        // Also clear include graph entries matching this folder
        for (const [uri, children] of this.includeGraph.entries()) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.includeGraph.delete(uri);
            } else {
                // Clean parent graph entries pointing to removed files
                for (const childUri of children) {
                    if (URI.parse(childUri).fsPath.startsWith(folderPath)) {
                        children.delete(childUri);
                    }
                }
            }
        }
        for (const [uri] of this.docs.entries()) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.docs.delete(uri);
            }
        }
        
        for (const [uri] of this.indexedDocs.entries()) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.indexedDocs.delete(uri);
            }
        }
        for (const [uri, parents] of this.parentGraph.entries()) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.parentGraph.delete(uri);
            } else {
                for (const parentUri of parents) {
                    if (URI.parse(parentUri).fsPath.startsWith(folderPath)) {
                        parents.delete(parentUri);
                    }
                }
                if (parents.size === 0) {
                    this.parentGraph.delete(uri);
                }
            }
        }
    }



    /**
     * Scan a folder for TDL/TXT files
     */
    private async scanFolder(folderUri: string): Promise<void> {
        const folderPath = URI.parse(folderUri).fsPath;
        try {
            const visited = new Set<string>();
            await this.scanDirectory(folderPath, visited);
        } catch (error) {
            logger.error(`Error scanning ${folderPath}: ${error}`);
        }
    }

    private async scanDirectory(dirPath: string, visited: Set<string>): Promise<void> {
        // Check if dirPath matches any exclude pattern
        if (this.isExcluded(dirPath)) return;

        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        
        // Pass 1: Parse all .tpj files first so this.tpjFiles is populated
        for (const entry of entries) {
            if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (ext === '.tpj') {
                    const fullPath = path.join(dirPath, entry.name);
                    // Check exclusion
                    if (!this.isExcluded(fullPath)) {
                        await this.parseProjectFile(fullPath, visited);
                    }
                }
            }
        }

        const promises: Promise<void>[] = [];

        // Pass 2: Process directories and standalone files
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            // Check if file matches any exclude pattern
            if (this.isExcluded(fullPath)) continue;

            if (entry.isDirectory()) {
                // Skip node_modules, .git, etc.
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    promises.push(this.scanDirectory(fullPath, visited));
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (['.tdl', '.txt', '.xml', '.tdlxml', '.dat'].includes(ext)) {
                    // Only index if it wasn't already added by a .tpj file
                    if (!this.tpjFiles.has(normalizeUri(URI.file(fullPath).toString()))) {
                        // Pass skipValidation=true during scan to avoid incomplete graph errors and slowness
                        promises.push(this.indexFile(fullPath, visited, true).catch(err => {
                            logger.error(`Error indexing standalone file ${fullPath}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
                        }));
                    }
                }
            }

            if (promises.length >= 50) {
                await Promise.all(promises);
                promises.length = 0;
            }
        }

        if (promises.length > 0) {
            await Promise.all(promises);
        }
    }

    /**
     * Parse a .tpj file and index its entries
     */
    private async parseProjectFile(tpjPath: string, visited: Set<string>): Promise<void> {
        try {
            const content = await readFileWithEncoding(tpjPath);
            const lines = content.split(/\r?\n/);
            const dirPath = path.dirname(tpjPath);
            const promises: Promise<void>[] = [];
            
            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith(';') || line.startsWith('[') || line.startsWith(']')) {
                    continue;
                }
                
                let entryFile = '';
                if (line.toLowerCase().startsWith('project file=')) {
                    entryFile = line.substring('project file='.length).trim();
                } else if (line.toLowerCase().endsWith('.txt') || line.toLowerCase().endsWith('.tdl') || line.toLowerCase().endsWith('.dat')) {
                    // Lenient parsing: if the line simply names a .txt, .tdl, or .dat file, use it
                    entryFile = line;
                }

                if (entryFile) {
                    // Strip any surrounding quotes just in case
                    entryFile = entryFile.replace(/^["']|["']$/g, '');
                    const targetPath = path.resolve(dirPath, entryFile);
                    if (fs.existsSync(targetPath)) {
                        const targetUri = normalizeUri(URI.file(targetPath).toString());
                        this.tpjFiles.add(targetUri);
                        // Pass skipValidation=true during scan to avoid incomplete graph errors and slowness
                        promises.push(this.indexFile(targetPath, visited, true));
                    }
                }

                if (promises.length >= 50) {
                    await Promise.all(promises);
                    promises.length = 0;
                }
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }
        } catch (err) {
            logger.warn(`Error parsing .tpj file ${tpjPath}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
        }
    }

    /**
     * Index a single file for symbols (without storing full doc state)
     */
    public async indexFile(filePath: string, indexed: Set<string> = new Set(), skipValidation: boolean = false, forceValidation: boolean = false): Promise<void> {
        

        const uri = normalizeUri(filePath);
        if (indexed.has(uri)) return;
        indexed.add(uri);
        // If file is open in editor, skip indexing as it's handled by rebuild()
        if (this.docs.has(uri)) return;

        let sourceFile: SourceFile;
        let content: string;
        const ext = path.extname(filePath).toLowerCase();
        const isXml = ext === '.xml' || ext === '.tdlxml';
        const scopeMgr = this.getScopeManager(uri);

        try {
            const stat = await fs.promises.stat(filePath);
            const lastMtime = this.fileTimestamps.get(uri);
            const cached = this.indexedDocs.get(uri);

            if (lastMtime !== undefined && lastMtime === stat.mtimeMs && cached) {
                if (!forceValidation) {
                    return; // File unchanged, skip re-read and re-parse
                }
                // If forcing validation, we only need to read content for diagnostics positions, skip parsing
                sourceFile = cached.sourceFile;
                content = await readFileWithEncoding(filePath);
            } else {
                this.fileTimestamps.set(uri, stat.mtimeMs);
                content = await readFileWithEncoding(filePath);
                
                // YIELD to the event loop right before heavy CPU work (parsing)
                // This prevents event loop starvation during bulk indexing on startup
                await new Promise(resolve => setImmediate(resolve));
                
                if (isXml) {
                    sourceFile = parseXmlToAst(content, scopeMgr);
                } else {
                    const getFunctionArity = (name: string): number | null => {
                        const func = scopeMgr.globalScope.functions.get(name.toLowerCase());
                        if (!func || !func.parameters) return null;
                        let hasVarArgs = false;
                        for (const p of func.parameters) {
                            if (p.IsList || p.IsVariableArgument) hasVarArgs = true;
                        }
                        return hasVarArgs ? null : func.parameters.length;
                    };
                    const parser = new Parser(content, undefined, getFunctionArity);
                    sourceFile = parser.parse();
                }
                
                const languageId = isXml ? 'xml' : 'tdl';
                const doc = TextDocument.create(uri, languageId, 1, content);

                // Build scope tree to capture global variables and formulas
                scopeMgr.buildFileScope(uri, sourceFile);

                // Update Include Graph
                const includes = this.updateIncludeGraph(uri, sourceFile);
                
                const promises: Promise<void>[] = [];
                // Recursively index included files FIRST so their symbols exist
                for (const includedUri of includes) {
                    if (!this.docs.has(includedUri)) {
                        promises.push(this.indexFile(URI.parse(includedUri).fsPath, indexed, skipValidation));
                    }
                }

                // Clear the old file from the reference index
                scopeMgr.projectScope.referenceIndex.clearFile(uri);
                
                // Index identifiers for fast Find References
                scopeMgr.projectScope.referenceIndex.indexFile(uri, sourceFile);

                if (promises.length > 0) {
                    await Promise.all(promises);
                }
            }

            const doc = TextDocument.create(uri, isXml ? 'xml' : 'tdl', 1, content);
            
            const diagnostics: Diagnostic[] = sourceFile.errors.map(error => ({
                severity: DiagnosticSeverity.Error,
                range: { start: doc.positionAt(error.start), end: doc.positionAt(error.end) },
                message: error.message,
                code: error.code,
                source: 'tdl'
            }));

            if (skipValidation) {
                diagnostics.length = 0;
                const finalDiagnostics = this.filterDiagnostics(diagnostics);
                this.connection.sendDiagnostics({ uri, diagnostics: finalDiagnostics });
                this.indexedDocs.set(uri, { sourceFile, diagnostics: finalDiagnostics });
                return;
            }

            // Check if file should be validated
            const shouldValidate = this.isMetadataLoaded && !this.scanningInProgress && (forceValidation || this.isUriActive(uri));

            if (!shouldValidate) {
                diagnostics.length = 0;
                const finalDiagnostics = this.filterDiagnostics(diagnostics);
                this.connection.sendDiagnostics({ uri, diagnostics: finalDiagnostics });
                this.indexedDocs.set(uri, { sourceFile, diagnostics: finalDiagnostics });
                return;
            }
            const t0 = Date.now();
            diagnostics.push(...(await validateSourceFile(sourceFile, doc, undefined, scopeMgr, this.resolveIncludePath, this)));            
            const t1 = Date.now();
            if (t1 - t0 > 500) {
                logger.trace(`[Perf] validateSourceFile for ${uri} took ${t1 - t0}ms`);
            }
            const finalDiagnostics = this.filterDiagnostics(diagnostics);

            this.connection.sendDiagnostics({ uri, diagnostics: finalDiagnostics });
            this.indexedDocs.set(uri, { sourceFile, diagnostics: finalDiagnostics });
        } catch (err) {
            // Silently skip files that can't be read, but log error
            logger.warn(`Error indexing file ${filePath}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
        }
    }

    /**
     * Updates the include graph for a given document.
     */
    private updateIncludeGraph(uri: string, sourceFile: SourceFile): Set<string> {
        const includes = new Set<string>();
        const currentFsPath = URI.parse(uri).fsPath;

        for (const def of sourceFile.definitions) {
            const normalizedType = def.type?.text?.toLowerCase();
            if ((normalizedType === 'include' || normalizedType === 'import') && def.name) {
                let includeName = def.name.text;
                if (includeName.startsWith('"') && includeName.endsWith('"')) {
                    includeName = includeName.slice(1, -1);
                }

                if (this.resolveIncludePath) {
                    const targetPath = this.resolveIncludePath(currentFsPath, includeName);
                    if (targetPath) {
                        includes.add(normalizeUri(targetPath));
                    }
                }
            }
        }
        // Remove old parent links
        const oldIncludes = this.includeGraph.get(uri) || new Set<string>();
        for (const inc of oldIncludes) {
            const parents = this.parentGraph.get(inc);
            if (parents) {
                parents.delete(uri);
                if (parents.size === 0) this.parentGraph.delete(inc);
            }
        }

        this.includeGraph.set(uri, includes);

        // Add new parent links
        for (const inc of includes) {
            const parents = this.parentGraph.get(inc) || new Set<string>();
            parents.add(uri);
            this.parentGraph.set(inc, parents);
        }

        // Clear project nodes cache as graph has changed
        this.projectNodesCache.clear();

        return includes;
    }

    /**
     * Check if there are circular includes starting from the given URI
     */
    public hasCircularIncludes(startUri: string): boolean {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const dfs = (currentUri: string): boolean => {
            if (recursionStack.has(currentUri)) return true; // Cycle detected
            if (visited.has(currentUri)) return false; // Already checked

            visited.add(currentUri);
            recursionStack.add(currentUri);

            const includes = this.includeGraph.get(currentUri) || new Set<string>();
            for (const nextUri of includes) {
                if (dfs(nextUri)) return true;
            }

            recursionStack.delete(currentUri);
            return false;
        };

        return dfs(startUri);
    }

    /**
     * Check if a URI is actively used in the workspace.
     * A URI is active if it is:
     * 1. Currently open in the editor (or is a .tpj file explicitly added)
     * 2. An included file of an active file (reachable by going UP parentGraph)
     * 3. A file that includes an active file (reachable by going DOWN includeGraph)
     */
    public isUriActive(targetUri: string): boolean {
        const normUri = normalizeUri(targetUri);
        if (this.docs.has(normUri) || this.tpjFiles.has(normUri)) return true;

        // Check if it's included by an active file (traverse UP parentGraph)
        const visitedParents = new Set<string>();
        const queueParents = [normUri];
        while (queueParents.length > 0) {
            const curr = queueParents.shift()!;
            if (!visitedParents.has(curr)) {
                visitedParents.add(curr);
                if (this.docs.has(curr) || this.tpjFiles.has(curr)) {
                    return true;
                }
                const parents = this.parentGraph.get(curr);
                if (parents) queueParents.push(...parents);
            }
        }

        // Check if it includes an active file (traverse DOWN includeGraph)
        const visitedChildren = new Set<string>();
        const queueChildren = [targetUri];
        while (queueChildren.length > 0) {
            const curr = queueChildren.shift()!;
            if (!visitedChildren.has(curr)) {
                visitedChildren.add(curr);
                if (this.docs.has(curr) || this.tpjFiles.has(curr)) {
                    return true;
                }
                const children = this.includeGraph.get(curr);
                if (children) queueChildren.push(...children);
            }
        }

        return false;
    }

    /**
     * Get all URIs that are in the same project as targetUri.
     * A project is defined as the set of all files reachable from any root that can reach targetUri.
     */
    public getProjectNodes(targetUri: string): Set<string> {
        const normUri = normalizeUri(targetUri);
        if (this.projectNodesCache.has(normUri)) {
            return this.projectNodesCache.get(normUri)!;
        }

        // Find roots by walking UP parentGraph
        const roots = new Set<string>();
        const visitedParents = new Set<string>();
        
        const queueParents = [normUri];
        while (queueParents.length > 0) {
            const curr = queueParents.shift()!;
            if (!visitedParents.has(curr)) {
                visitedParents.add(curr);
                const parents = this.parentGraph.get(curr);
                if (!parents || parents.size === 0) {
                    roots.add(curr);
                } else {
                    queueParents.push(...parents);
                }
            }
        }

        // If isolated or part of disjoint cycle, ensure targetUri itself acts as root
        if (roots.size === 0) {
            roots.add(normUri);
        }

        // Walk DOWN includeGraph from all roots
        const projectNodes = new Set<string>();
        const queueChildren = Array.from(roots);
        while (queueChildren.length > 0) {
            const curr = queueChildren.shift()!;
            if (!projectNodes.has(curr)) {
                projectNodes.add(curr);
                const children = this.includeGraph.get(curr);
                if (children) {
                    queueChildren.push(...children);
                }
            }
        }

        this.projectNodesCache.set(normUri, projectNodes);
        return projectNodes;
    }

    /**
     * Rebuild document state by re-parsing the document
     */
    async rebuild(doc: TextDocument): Promise<void> {
        const t0 = Date.now();
        let sourceFile: SourceFile;
        const text = doc.getText();
        const isXml = doc.languageId === 'xml';

        const normUri = normalizeUri( doc.uri);
        const scopeMgr = this.getScopeManager(normUri);
        
        const oldDocState = this.docs.get(normUri);
        const oldSourceFile = oldDocState?.sourceFile;

        if (isXml) {
            sourceFile = parseXmlToAst(text, scopeMgr);
        } else {
            const getFunctionArity = (name: string): number | null => {
                const func = scopeMgr.globalScope.functions.get(name.toLowerCase());
                if (!func || !func.parameters) return null;
                let hasVarArgs = false;
                for (const p of func.parameters) {
                    if (p.IsList || p.IsVariableArgument) hasVarArgs = true;
                }
                return hasVarArgs ? null : func.parameters.length;
            };
            const parser = new Parser(text, oldSourceFile, getFunctionArity);
            sourceFile = parser.parse();
        }
        const t1 = Date.now();

        // Convert parser errors to LSP diagnostics
        const diagnostics: Diagnostic[] = sourceFile.errors.map(error => {
            const startPos = doc.positionAt(error.start);
            const endPos = doc.positionAt(error.end);
            return {
                severity: DiagnosticSeverity.Error,
                range: { start: startPos, end: endPos },
                message: error.message,
                code: error.code,
                source: 'tdl'
            };
        });

        // Build Scope Tree for the file
        scopeMgr.buildFileScope(normUri, sourceFile);
        const t2 = Date.now();

        // Update Include Graph
        const includes = this.updateIncludeGraph(normUri, sourceFile);
        
        // Ensure new includes are indexed and diagnosed (background, non-blocking)
        const visited = new Set<string>([doc.uri]);
        for (const incUri of includes) {
            if (!this.docs.has(incUri) && !this.includeGraph.has(incUri)) {
                this.indexFile(URI.parse(incUri).fsPath, visited).catch(err => {
                    logger.warn(`Failed to index new include ${incUri}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
                });
            }
        }

        const t3 = Date.now();
        // Run cross-file validations only if workspace scan is complete and metadata is loaded
        if (!this.scanningInProgress && this.isMetadataLoaded) {
            diagnostics.push(...(await validateSourceFile(sourceFile, doc, undefined, scopeMgr, this.resolveIncludePath, this)));
        }
        const t4 = Date.now();

        // Store document state
        if (!this.isUriActive(normUri)) {
            diagnostics.length = 0; // Clear diagnostics for non-target files
        }
        this.docs.set(normUri, { sourceFile, diagnostics });

        const finalDiagnostics = this.filterDiagnostics(diagnostics);

        this.connection.sendDiagnostics({ uri: doc.uri, diagnostics: finalDiagnostics });
        
        logger.trace(`[Perf] rebuild ${path.basename(doc.uri)}: Total=${t4-t0}ms (Parse=${t1-t0}ms, Sym/Scope=${t2-t1}ms, Includes=${t3-t2}ms, Validate=${t4-t3}ms)`);
    }

    private filterDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
        const treatAsError = shouldTreatWarningsAsErrors();
        const hideWarnings = shouldHideWarnings();

        return isDiagnosticsEnabled() ? diagnostics.filter(d => {
            // Check individual overrides first
            if (d.code && typeof d.code === 'string') {
                const setting = getDiagnosticSeverity(d.code);
                if (setting === 'none') return false;
                if (setting === 'error') d.severity = DiagnosticSeverity.Error;
                if (setting === 'warning') d.severity = DiagnosticSeverity.Warning;
                if (setting === 'information') d.severity = DiagnosticSeverity.Information;
                if (setting === 'hint') d.severity = DiagnosticSeverity.Hint;
            }

            // Apply global warning settings
            if (d.severity === DiagnosticSeverity.Warning) {
                if (treatAsError) {
                    d.severity = DiagnosticSeverity.Error;
                } else if (hideWarnings) {
                    return false;
                }
            }
            return true;
        }) : [];
    }
}