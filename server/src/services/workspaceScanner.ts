import * as fs from 'fs';
import * as path from 'path';
import { URI } from 'vscode-uri';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { SourceFile } from '../core/ast/ast';
import { Parser } from '../core/parser/parser';
import { parseXmlToAst } from '../core/xml/xmlAdapter';
import { normalizeUri } from '../utils/uri';
import { logger } from '../logger';
import { validateSourceFile } from '../validation';
import { DocumentStateStore } from './documentStateStore';
import { IncludeGraphManager } from './includeGraphManager';
import { FileAccess } from '../ports/fileAccess';
import { DiagnosticPublisher } from '../ports/diagnosticPublisher';
import { getDiagnosticSeverity, isDiagnosticsEnabled, shouldTreatWarningsAsErrors, shouldHideWarnings } from '../utils/settingsManager';

/**
 * Handles workspace-wide file scanning, parsing, and bulk validations.
 * Builds the complete directed graph of all TDL/TXT files in the workspace.
 *
 * ## File Parsing and Workspace Scanning Architecture
 *
 * The `WorkspaceScanner` builds a complete directed graph of all TDL/TXT files in the workspace.
 * Its scanning logic operates in two globally-separated phases:
 *
 * ### Phase 1: Project Discovery (`scanDirectoryForProjects`)
 *   - Recursively walks ALL directories to locate every `.tpj` (Tally Project) file.
 *   - Each `.tpj` file is parsed (`parseProjectFile`) to find its root `Project File`
 *     entries (usually `.txt` or `.tdl` files).
 *   - Root files are added to `graphManager.tpjFiles`.
 *   - Root files are parsed via `indexFile` with `isActive=true`, which recursively
 *     extracts `[Include: ...]` / `[Import: ...]` directives.
 *   - All included files are recursively parsed and added to the `includeGraph` and `parentGraph`
 *     (managed by `IncludeGraphManager`), and placed in **project scope**.
 *   - This phase runs **sequentially** to ensure all project files are fully discovered
 *     before standalone file processing begins.
 *
 * ### Phase 2: Standalone Files (`scanDirectoryForStandaloneFiles`)
 *   - Recursively scans for `.txt`/`.tdl`/`.xml`/`.tdlxml`/`.dat` files that were:
 *     (a) NOT root entries of any `.tpj` file (checked via `tpjFiles` set), AND
 *     (b) NOT already indexed during Phase 1 (checked via shared `visited` set).
 *   - These standalone files are parsed independently with `isActive=false` and placed
 *     in **workspace scope**.
 *   - Their symbols are available for auto-completion but they receive no diagnostics.
 *   - This phase runs in parallel for performance.
 *
 * ### Why Two Global Phases?
 *   Running both phases per-directory (the old approach) created a race condition:
 *   subdirectories were scanned concurrently via `Promise.all`, so a file included
 *   by a project in `src/` could be indexed as standalone from `lib/` before the
 *   project scan discovered it — permanently placing it in workspace scope instead
 *   of project scope. Separating into two global passes ensures ALL `.tpj` files
 *   and their include chains are resolved first.
 *
 * ### Post-Scan Revalidation (`revalidateAll`)
 *   - After all scanning completes, open documents and project files are revalidated.
 *   - Diagnostics are only shown for files logically connected to an active editor
 *     window OR a `.tpj` file.
 *   - If a `.tpj` file exists, revalidation traverses its `includeGraph` and validates
 *     all connected files.
 *   - If NO `.tpj` file exists, revalidation only finds the active open document,
 *     walks UP to its root via `parentGraph`, then walks DOWN via `includeGraph`.
 *   - This guarantees loose files only validate their immediate dependency graph.
 */
export class WorkspaceScanner {
    public scanningInProgress = false;
    private hasInitialScanStarted = false;
    private scanQueue: string[][] = [];
    public workspaceFolders: string[] = [];

    public excludePaths: string[] = [];
    private excludeRegexes: { regex: RegExp | null, pattern: string }[] = [];
    public fileTimestamps = new Map<string, number>();
    public onScanComplete?: () => void;

    private revalidateTimeout: NodeJS.Timeout | null = null;

    constructor(
        private stateStore: DocumentStateStore,
        private graphManager: IncludeGraphManager,
        private fileAccess: FileAccess,
        private diagnosticPublisher: DiagnosticPublisher,
        private resolveIncludePath?: (currentPath: string, name: string) => string | null,
        private documentLoader?: import('./documentLoader').DocumentLoader
    ) {}

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

        setTimeout(async () => {
            const startTime = Date.now();
            logger.trace(`[Perf] Starting workspace scan for ${workspaceFolders.length} folders...`);
            try {
                for (const folderUri of workspaceFolders) {
                    await this.scanFolder(folderUri);
                }
                const count = this.stateStore.tdlScopeManager.getSymbolCount() + this.stateStore.xmlScopeManager.getSymbolCount();
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
                    const openDocs = Array.from(this.stateStore.getAllDocs()).map(([_, state]) => ({ uri: _, ...state }));
                    this.revalidateAll(openDocs).catch(e => logger.error(`Revalidation failed: ${e}`));
                    // Also notify the client of the initial active URIs list
                    this.graphManager.notifyActiveUrisChanged();
                    if (this.onScanComplete) {
                        this.onScanComplete();
                    }
                }
            }
        }, 0);
    }

    /**
     * Orchestrates scanning of a single workspace folder.
     * Splits into two global phases to prevent race conditions:
     *   Phase 1: Find and process ALL .tpj files across ALL subdirectories (sequential)
     *   Phase 2: Index standalone files not covered by any project (parallel)
     */
    private async scanFolder(folderUri: string): Promise<void> {
        const folderPath = URI.parse(folderUri).fsPath;
        try {
            const visited = new Set<string>();
            // Phase 1: Recursively find and process ALL .tpj project files first.
            // This ensures all project files and their include chains are indexed
            // with isActive=true (project scope) before any standalone files.
            // The visited set is populated with all project-referenced URIs.
            await this.scanDirectoryForProjects(folderPath, visited);
            // Phase 2: Recursively process standalone files that were not part
            // of any project. Files already in the visited set (from Phase 1)
            // are skipped via indexFile's indexed.has() guard.
            await this.scanDirectoryForStandaloneFiles(folderPath, visited);
        } catch (error) {
            logger.error(`Error scanning ${folderPath}: ${error}`);
        }
    }

    /**
     * Phase 1: Recursively scan directories to find and process ALL .tpj files.
     * Runs sequentially to ensure all project files and their full include chains
     * are indexed (with isActive=true → project scope) before standalone file
     * processing begins in Phase 2.
     *
     * For each .tpj found:
     *   1. Parse .tpj to find root `Project File` entries
     *   2. Add root files to `graphManager.tpjFiles`
     *   3. Index root files via `indexFile`, which recursively follows `[Include: ...]`
     *   4. All included files are added to `includeGraph`, `parentGraph`, and `visited`
     */
    private async scanDirectoryForProjects(dirPath: string, visited: Set<string>): Promise<void> {
        if (this.isExcluded(dirPath)) return;

        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

        // Process .tpj files in this directory
        for (const entry of entries) {
            if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (ext === '.tpj') {
                    const fullPath = path.join(dirPath, entry.name);
                    if (!this.isExcluded(fullPath)) {
                        await this.parseProjectFile(fullPath, visited);
                    }
                }
            }
        }

        // Recurse into subdirectories (sequential to ensure deterministic ordering
        // and complete project discovery before Phase 2)
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const fullPath = path.join(dirPath, entry.name);
                if (!this.isExcluded(fullPath) && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await this.scanDirectoryForProjects(fullPath, visited);
                }
            }
        }
    }

    /**
     * Phase 2: Recursively scan directories for standalone .tdl/.txt/.xml/.tdlxml/.dat
     * files that were NOT already indexed during Phase 1.
     *
     * A file is skipped if:
     *   - It is a root project entry (in `graphManager.tpjFiles`), OR
     *   - It was already indexed via a project's include chain (in `visited` set,
     *     checked by `indexFile`'s `indexed.has()` guard)
     *
     * Standalone files are indexed with isActive=false → workspace scope.
     * Their symbols are available for auto-completion but they receive no diagnostics.
     */
    private async scanDirectoryForStandaloneFiles(dirPath: string, visited: Set<string>): Promise<void> {
        if (this.isExcluded(dirPath)) return;

        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const promises: Promise<void>[] = [];

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            if (this.isExcluded(fullPath)) continue;

            if (entry.isDirectory()) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    promises.push(this.scanDirectoryForStandaloneFiles(fullPath, visited));
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (['.tdl', '.txt', '.xml', '.tdlxml', '.dat'].includes(ext)) {
                    // Skip root project files (already indexed in Phase 1)
                    if (!this.graphManager.tpjFiles.has(normalizeUri(URI.file(fullPath).toString()))) {
                        // Files already in visited (indexed via project include chains)
                        // will be skipped by indexFile's indexed.has() guard
                        promises.push(this.indexFile(fullPath, visited, true, false, false).catch(err => {
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

    private async parseProjectFile(tpjPath: string, visited: Set<string>): Promise<void> {
        try {
            const content = await this.fileAccess.readFile(tpjPath, 'utf-8');
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
                    entryFile = line;
                }

                if (entryFile) {
                    entryFile = entryFile.replace(/^["']|["']$/g, '');
                    const targetPath = path.resolve(dirPath, entryFile);
                    if (await this.fileAccess.exists(targetPath)) {
                        const targetUri = normalizeUri(URI.file(targetPath).toString());
                        this.graphManager.tpjFiles.add(targetUri);
                        promises.push(this.indexFile(targetPath, visited, true, false, true));
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
     * Index a single file: parse it, build its scope, update the include graph,
     * and recursively index any files it includes via `[Include: ...]` directives.
     *
     * @param filePath    - Absolute filesystem path to the file
     * @param indexed     - Shared visited set preventing circular includes and duplicate indexing.
     *                      This set is the bridge between Phase 1 (project) and Phase 2 (standalone):
     *                      files indexed during Phase 1 are added here, causing Phase 2 to skip them.
     * @param skipValidation  - If true, skip semantic validation (used during initial scan to
     *                          avoid incomplete-graph errors and improve scan speed)
     * @param forceValidation - If true, re-validate even if the file hasn't changed on disk
     *                          (used by revalidateAll after scan completes)
     * @param isActive    - If true, file is placed in project scope (visible for diagnostics).
     *                      If false, file is placed in workspace scope (symbols available for
     *                      auto-completion only, no diagnostics).
     */
    public async indexFile(filePath: string, indexed: Set<string> = new Set(), skipValidation: boolean = false, forceValidation: boolean = false, isActive: boolean = false): Promise<void> {
        const uri = normalizeUri(URI.file(filePath).toString());
        if (indexed.has(uri)) return;
        indexed.add(uri);
        
        // If file is open in editor, skip indexing as it's handled by rebuild()
        if (this.stateStore.getOpen(uri)) return;

        let sourceFile: SourceFile;
        let content: string;
        const ext = path.extname(filePath).toLowerCase();
        const isXml = ext === '.xml' || ext === '.tdlxml';
        const scopeMgr = this.stateStore.getScopeManager(uri);

        try {
            const stat = await this.fileAccess.stat(filePath);
            if (!stat) return;

            const lastMtime = this.fileTimestamps.get(uri);
            const cached = this.stateStore.getIndexed(uri);

            if (lastMtime !== undefined && lastMtime === stat.mtimeMs && cached) {
                if (!forceValidation) {
                    return; 
                }
                sourceFile = cached.sourceFile;
                content = await this.fileAccess.readFile(filePath, 'utf-8');
            } else {
                this.fileTimestamps.set(uri, stat.mtimeMs);
                content = await this.fileAccess.readFile(filePath, 'utf-8'); // FileAccess handles UTF-16LE BOM detection automatically
                
                // Yield to event loop right before heavy CPU work (AST parsing)
                // This prevents event loop starvation/blocking and keeps the LSP responsive
                await new Promise(resolve => setImmediate(resolve));
                
                const scopeMgr = this.stateStore.getScopeManager(uri);
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
                
                scopeMgr.buildFileScope(uri, sourceFile, !isActive);

                const includes = this.graphManager.updateIncludeGraph(uri, sourceFile);
                
                const promises: Promise<void>[] = [];
                for (const includedUri of includes) {
                    if (!this.stateStore.getOpen(includedUri)) {
                        promises.push(this.indexFile(URI.parse(includedUri).fsPath, indexed, skipValidation, forceValidation, isActive));
                    }
                }

                scopeMgr.projectScope.referenceIndex.clearFile(uri);
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
                this.diagnosticPublisher.publish(uri, finalDiagnostics);
                this.stateStore.setIndexed(uri, { sourceFile, diagnostics: finalDiagnostics });
                return;
            }

            const shouldValidate = this.stateStore.isMetadataLoaded && !this.scanningInProgress && (forceValidation || this.graphManager.isUriActive(uri));

            if (!shouldValidate) {
                diagnostics.length = 0;
                const finalDiagnostics = this.filterDiagnostics(diagnostics);
                this.diagnosticPublisher.publish(uri, finalDiagnostics);
                this.stateStore.setIndexed(uri, { sourceFile, diagnostics: finalDiagnostics });
                return;
            }
            
            // For now, we pass `this.graphManager` since validateSourceFile usages have been updated.
            diagnostics.push(...(await validateSourceFile(sourceFile, doc, undefined, scopeMgr, this.resolveIncludePath, this.graphManager)));            
            
            const finalDiagnostics = this.filterDiagnostics(diagnostics);
            this.diagnosticPublisher.publish(uri, finalDiagnostics);
            this.stateStore.setIndexed(uri, { sourceFile, diagnostics: finalDiagnostics });
        } catch (err) {
            logger.warn(`Error indexing file ${filePath}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
        }
    }

    public async revalidateAll(openDocs: {uri: string}[]): Promise<void> {
        if (this.revalidateTimeout) {
            clearTimeout(this.revalidateTimeout);
        }
        
        return new Promise((resolve) => {
            this.revalidateTimeout = setTimeout(async () => {
                this.revalidateTimeout = null;
                
                if (!this.hasInitialScanStarted || this.scanningInProgress) {
                    resolve();
                    return;
                }

                const allKnownUris = new Set<string>();

                for (const doc of openDocs) {
                    const projectNodes = this.graphManager.getProjectNodes(doc.uri);
                    for (const node of projectNodes) {
                        allKnownUris.add(node);
                    }
                }
                
                for (const tpj of this.graphManager.tpjFiles) {
                    const projectNodes = this.graphManager.getProjectNodes(tpj);
                    for (const node of projectNodes) {
                        allKnownUris.add(node);
                    }
                }

                // Since rebuild is owned by lifecycle service now, we just let it handle open docs if needed.
                // However, revalidateAll historically triggered a rebuild on open docs. 
                // That logic moves to DocumentLifecycleService. 
                // We'll just index closed files here.

                const promises: Promise<void>[] = [];
                for (const uriStr of allKnownUris) {
                    if (this.stateStore.getOpen(normalizeUri(uriStr))) continue;

                    const fsPath = URI.parse(uriStr).fsPath;
                    const isActive = this.graphManager.isUriActive(uriStr);
                    promises.push(this.indexFile(fsPath, new Set(), false, true, isActive).catch(err => {
                        logger.error(`Error indexing file ${fsPath}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
                    }));

                    if (promises.length >= 50) {
                        await Promise.all(promises);
                        promises.length = 0;
                        await new Promise(resolve => setImmediate(resolve));
                    }
                }
                if (promises.length > 0) {
                    await Promise.all(promises);
                }
                
                this.graphManager.notifyActiveUrisChanged();
                resolve();
            }, 500);
        });
    }

    public clearFolderSymbols(folderPath: string): void {
        const removeURIs: string[] = [];
        for (const [uri] of this.stateStore.tdlScopeManager.fileMap) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) removeURIs.push(uri);
        }
        for (const [uri] of this.stateStore.xmlScopeManager.fileMap) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) removeURIs.push(uri);
        }
        for (const uri of removeURIs) {
            this.stateStore.getScopeManager(uri).removeFileScope(uri);
            this.stateStore.getScopeManager(uri).projectScope.referenceIndex.clearFile(uri);
        }
        
        for (const [uri, children] of this.graphManager.includeGraph.entries()) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.graphManager.includeGraph.delete(uri);
            } else {
                for (const childUri of children) {
                    if (URI.parse(childUri).fsPath.startsWith(folderPath)) {
                        children.delete(childUri);
                    }
                }
            }
        }
        for (const [uri] of Array.from(this.stateStore.getAllDocs())) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.stateStore.deleteOpen(uri);
            }
        }
        
        for (const uri of Array.from(this.stateStore.getAllIndexedUris())) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.stateStore.deleteIndexed(uri);
            }
        }
        for (const [uri, parents] of this.graphManager.parentGraph.entries()) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.graphManager.parentGraph.delete(uri);
            } else {
                for (const parentUri of parents) {
                    if (URI.parse(parentUri).fsPath.startsWith(folderPath)) {
                        parents.delete(parentUri);
                    }
                }
                if (parents.size === 0) {
                    this.graphManager.parentGraph.delete(uri);
                }
            }
        }
    }

    private filterDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
        const treatAsError = shouldTreatWarningsAsErrors();
        const hideWarnings = shouldHideWarnings();

        return isDiagnosticsEnabled() ? diagnostics.filter(d => {
            if (d.code && typeof d.code === 'string') {
                const setting = getDiagnosticSeverity(d.code);
                if (setting === 'none') return false;
                if (setting === 'error') d.severity = DiagnosticSeverity.Error;
                if (setting === 'warning') d.severity = DiagnosticSeverity.Warning;
                if (setting === 'information') d.severity = DiagnosticSeverity.Information;
                if (setting === 'hint') d.severity = DiagnosticSeverity.Hint;
            }

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
