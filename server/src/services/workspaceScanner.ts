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
import { filterDiagnostics } from '../utils/settingsManager';

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
    public hasInitialScanStarted = false;
    private scanQueue: string[][] = [];
    public workspaceFolders: string[] = [];

    public excludePaths: string[] = [];
    private excludeRegexes: { regex: RegExp | null, pattern: string }[] = [];
    public fileTimestamps = new Map<string, number>();
    public onScanComplete?: () => void;

    private revalidateTimeout: NodeJS.Timeout | null = null;
    public documentLifecycle?: import('./documentLifecycleService').DocumentLifecycleService;

    constructor(
        private stateStore: DocumentStateStore,
        private graphManager: IncludeGraphManager,
        private fileAccess: FileAccess,
        private diagnosticPublisher: DiagnosticPublisher,
        private resolveIncludePath?: (currentPath: string, name: string) => string | null,
        private documentLoader?: import('./documentLoader').DocumentLoader
    ) { }

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
        this.cleanupExcludedFiles();
    }

    private cleanupExcludedFiles(): void {
        const excludedUris: string[] = [];

        const checkAndCollect = (uri: string) => {
            try {
                const fsPath = URI.parse(normalizeUri(uri)).fsPath;
                if (this.isExcluded(fsPath)) {
                    excludedUris.push(uri);
                }
            } catch {}
        };

        for (const uri of this.stateStore.tdlScopeManager.fileMap.keys()) checkAndCollect(uri);
        for (const uri of this.stateStore.xmlScopeManager.fileMap.keys()) checkAndCollect(uri);
        for (const [uri] of this.stateStore.getAllDocs()) checkAndCollect(uri);
        for (const uri of this.stateStore.getAllIndexedUris()) checkAndCollect(uri);

        const uniqueUris = Array.from(new Set(excludedUris));
        if (uniqueUris.length === 0) return;

        logger.info(`[Exclude Cleanup] Removing ${uniqueUris.length} excluded files from state and diagnostics.`);

        for (const uri of uniqueUris) {
            // 1. Remove scopes
            this.stateStore.tdlScopeManager.removeFileScope(uri);
            this.stateStore.xmlScopeManager.removeFileScope(uri);

            // 2. Clear diagnostics in VS Code
            this.diagnosticPublisher.publish(uri, []);

            // 3. Delete from state store
            this.stateStore.deleteOpen(uri);
            this.stateStore.deleteIndexed(uri);

            // 4. Clean up include graphs
            this.graphManager.includeGraph.delete(uri);
            this.graphManager.parentGraph.delete(uri);

            // Clean up parents and children references
            for (const [parent, children] of this.graphManager.includeGraph.entries()) {
                if (children.has(uri)) {
                    children.delete(uri);
                    if (children.size === 0) this.graphManager.includeGraph.delete(parent);
                }
            }
            for (const [child, parents] of this.graphManager.parentGraph.entries()) {
                if (parents.has(uri)) {
                    parents.delete(uri);
                    if (parents.size === 0) this.graphManager.parentGraph.delete(child);
                }
            }
        }

        this.graphManager.invalidateCache();
        this.graphManager.notifyActiveUrisChanged();
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
    public scanWorkspaceFolders(workspaceFolders: string[]): Promise<void> {
        this.hasInitialScanStarted = true;
        if (this.scanningInProgress) {
            this.scanQueue.push(workspaceFolders);
            return Promise.resolve();
        }
        this.scanningInProgress = true;

        return new Promise<void>((resolve) => {
            setTimeout(async () => {
                const startTime = Date.now();
                logger.trace(`[Perf] Starting workspace scan for ${workspaceFolders.length} folders...`);
                try {
                    for (const folderUri of workspaceFolders) {
                        await this.scanFolder(folderUri);
                    }
                    const count = this.stateStore.tdlScopeManager.getSymbolCount();
                    logger.trace(`[Perf] Workspace scan complete in ${Date.now() - startTime}ms. ${count} definitions indexed.`);
                } catch (error) {
                    logger.error(`Workspace scan error: ${error}`);
                } finally {
                    this.scanningInProgress = false;

                    if (this.scanQueue.length > 0) {
                        const nextScan = this.scanQueue.shift()!;
                        await this.scanWorkspaceFolders(nextScan);
                    } else {
                        // Process any open documents that were queued during the scan
                        if (this.documentLifecycle) {
                            this.documentLifecycle.processPendingDocuments();
                        }
                        // All queued scans complete! Revalidate open docs so initial 'Missing Definition' diagnostics go away.
                        const openDocs = Array.from(this.stateStore.getAllDocs()).map(([_, state]) => ({ uri: _, ...state }));
                        this.revalidateAll(openDocs).catch(e => logger.error(`Revalidation failed: ${e}`));
                        // Also notify the client of the initial active URIs list
                        this.graphManager.notifyActiveUrisChanged();
                        if (this.onScanComplete) {
                            this.onScanComplete();
                        }
                    }
                    resolve();
                }
            }, 0);
        });
    }

    /**
     * Orchestrates scanning of a single workspace folder.
     * Performs a single directory traversal to collect all .tpj and standalone files.
     *   Phase 1: Process ALL .tpj files (sequential to ensure include chains are mapped)
     *   Phase 2: Index standalone files not covered by any project (parallel)
     */
    private async scanFolder(folderUri: string): Promise<void> {
        const folderPath = URI.parse(normalizeUri(folderUri)).fsPath;
        try {
            const visited = new Set<string>();
            const tpjList: string[] = [];
            const tdlList: string[] = [];

            // Single pass traversal to collect all relevant files
            await this.collectFiles(folderPath, tpjList, tdlList);

            // Phase 1: Process project files first to build the complete include graph
            // and determine which files are active.
            for (const tpj of tpjList) {
                await this.parseProjectFile(tpj, visited);
            }

            // Phase 2: Recursively process standalone files that were not part
            // of any project.
            const standalonePromises: Promise<void>[] = [];
            for (const tdl of tdlList) {
                const fullUri = normalizeUri(URI.file(tdl).toString());
                if (!this.graphManager.isUriActive(fullUri)) {
                    standalonePromises.push(this.indexFile(tdl, visited, true, false, false));
                }
            }

            if (standalonePromises.length > 0) {
                await Promise.all(standalonePromises);
            }
        } catch (error) {
            logger.error(`Error scanning ${folderPath}: ${error}`);
        }
    }

    private async collectFiles(dirPath: string, tpjList: string[], tdlList: string[]): Promise<void> {
        if (this.isExcluded(dirPath)) return;

        try {
            const entries = await this.fileAccess.readDirectory(dirPath);


            for (const entry of entries) {
                const entryName = typeof entry === 'string' ? entry : (entry as any).name;
                const fullPath = path.join(dirPath, entryName);
                if (this.isExcluded(fullPath)) continue;

                let isDir = false;
                let isFil = false;
                if (typeof entry !== 'string') {
                    isDir = typeof (entry as any).isDirectory === 'function' ? (entry as any).isDirectory() : false;
                    isFil = typeof (entry as any).isFile === 'function' ? (entry as any).isFile() : false;
                } else {
                    const stat = await this.fileAccess.stat(fullPath);
                    if (stat) {
                        isDir = stat.isDirectory();
                        isFil = stat.isFile();
                    }
                }

                if (isDir) {
                    if (!entryName.startsWith('.') && entryName !== 'node_modules') {
                        await this.collectFiles(fullPath, tpjList, tdlList);
                    }
                } else if (isFil) {
                    const ext = path.extname(entryName).toLowerCase();
                    if (ext === '.tpj') {
                        tpjList.push(fullPath);
                    } else if (['.txt', '.tdl', '.xml', '.tdlxml', '.dat'].includes(ext)) {
                        tdlList.push(fullPath);
                    }
                }
            }
        } catch (err) {
            logger.warn(`Could not read directory ${dirPath}: ${err}`);
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
                        this.graphManager.invalidateCache();
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

        // If file is open in editor, skip parsing but still recursively index its includes in the correct scope
        const openState = this.stateStore.getOpen(uri);
        if (openState) {
            const scopeMgr = this.stateStore.getScopeManager(uri);
            const hasScope = scopeMgr.fileMap.has(uri);
            const wasWorkspace = hasScope ? scopeMgr.isFileWorkspaceScope(uri) : undefined;
            const isWorkspace = !isActive;

            if (!hasScope || wasWorkspace !== isWorkspace) {
                scopeMgr.buildFileScope(uri, openState.sourceFile, isWorkspace);
                scopeMgr.projectScope.referenceIndex.clearFile(uri);
                if (!uri.endsWith('.xml') && !uri.endsWith('.tdlxml')) {
                    scopeMgr.projectScope.referenceIndex.indexFile(uri, openState.sourceFile);
                }
            }

            const includes = this.graphManager.updateIncludeGraph(uri, openState.sourceFile);
            const promises: Promise<void>[] = [];
            for (const includedUri of includes) {
                promises.push(this.indexFile(URI.parse(normalizeUri(includedUri)).fsPath, indexed, skipValidation, forceValidation, isActive));
            }
            if (promises.length > 0) {
                await Promise.all(promises);
            }
            return;
        }

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
            const wasWorkspace = scopeMgr.isFileWorkspaceScope(uri);
            const isWorkspace = !isActive;

            if (lastMtime !== undefined && lastMtime === stat.mtimeMs && cached && wasWorkspace === isWorkspace) {
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
                    const parser = new Parser(content, undefined, scopeMgr.getFunctionArity.bind(scopeMgr));
                    sourceFile = parser.parse();
                }

                scopeMgr.buildFileScope(uri, sourceFile, !isActive);

                const includes = this.graphManager.updateIncludeGraph(uri, sourceFile);

                const promises: Promise<void>[] = [];
                for (const includedUri of includes) {
                    promises.push(this.indexFile(URI.parse(normalizeUri(includedUri)).fsPath, indexed, skipValidation, forceValidation, isActive));
                }

                scopeMgr.projectScope.referenceIndex.clearFile(uri);
                if (!isXml) {
                    scopeMgr.projectScope.referenceIndex.indexFile(uri, sourceFile);
                }

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
                const finalDiagnostics = filterDiagnostics(diagnostics);
                this.diagnosticPublisher.publish(uri, finalDiagnostics);
                if (!isXml) {
                    this.stateStore.setIndexed(uri, { sourceFile, diagnostics: finalDiagnostics });
                }
                return;
            }

            const shouldValidate = this.stateStore.isMetadataLoaded && !this.scanningInProgress && (forceValidation || this.graphManager.isUriActive(uri));

            if (!shouldValidate) {
                diagnostics.length = 0;
                const finalDiagnostics = filterDiagnostics(diagnostics);
                this.diagnosticPublisher.publish(uri, finalDiagnostics);
                if (!isXml) {
                    this.stateStore.setIndexed(uri, { sourceFile, diagnostics: finalDiagnostics });
                }
                return;
            }

            // For now, we pass `this.graphManager` since validateSourceFile usages have been updated.
            diagnostics.push(...(await validateSourceFile(sourceFile, doc, undefined, scopeMgr, this.resolveIncludePath, this.graphManager)));

            const finalDiagnostics = filterDiagnostics(diagnostics);
            this.diagnosticPublisher.publish(uri, finalDiagnostics);
            if (!isXml) {
                this.stateStore.setIndexed(uri, { sourceFile, diagnostics: finalDiagnostics });
            }
        } catch (err) {
            logger.warn(`Error indexing file ${filePath}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
        }
    }

    public async revalidateAll(openDocs: { uri: string }[]): Promise<void> {
        if (this.revalidateTimeout) {
            clearTimeout(this.revalidateTimeout);
        }

        return new Promise((resolve) => {
            this.revalidateTimeout = setTimeout(async () => {
                this.revalidateTimeout = null;

                const t0 = Date.now();
                if (!this.hasInitialScanStarted || this.scanningInProgress) {
                    resolve();
                    return;
                }
                this.stateStore.tdlScopeManager.isBulkRevalidating = true;
                this.stateStore.xmlScopeManager.isBulkRevalidating = true;
                
                logger.trace(`[Perf] revalidateAll started for ${openDocs.length} open docs...`);

                const allKnownUris = new Set<string>();
                for (const uri of this.stateStore.getAllIndexedUris()) {
                    allKnownUris.add(uri);
                }

                // 1. Revalidate all open documents first so the user gets diagnostics immediately
                const openPromises: Promise<void>[] = [];
                for (const docInfo of openDocs) {
                    const openState = this.stateStore.getOpen(normalizeUri(docInfo.uri));
                    if (openState && openState.document && this.documentLifecycle) {
                        openPromises.push(this.documentLifecycle.rebuild(openState.document));
                    }
                }
                if (openPromises.length > 0) {
                    await Promise.all(openPromises);
                }

                // 2. Validate closed project files in the background
                const promises: Promise<void>[] = [];
                for (const uriStr of allKnownUris) {
                    const normUri = normalizeUri(uriStr);
                    if (this.stateStore.getOpen(normUri)) continue;

                    const fsPath = URI.parse(normUri).fsPath;
                    const isActive = this.graphManager.isUriActive(normUri);
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

                const elapsed = Date.now() - t0;
                logger.trace(`[Perf] revalidateAll completed in ${elapsed}ms for ${openDocs.length} open docs and ${allKnownUris.size} project nodes.`);
                
                this.stateStore.tdlScopeManager.isBulkRevalidating = false;
                this.stateStore.xmlScopeManager.isBulkRevalidating = false;
                this.stateStore.tdlScopeManager.definitionsInScopeCache.clear();
                this.stateStore.xmlScopeManager.definitionsInScopeCache.clear();
                
                this.graphManager.notifyActiveUrisChanged();
                resolve();
            }, 500);
        });
    }

    public clearFolderSymbols(folderPath: string): void {
        this.graphManager.invalidateCache();
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
                if (children.size === 0) {
                    this.graphManager.includeGraph.delete(uri);
                }
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
}
