import { Connection, Diagnostic, DiagnosticSeverity, TextDocuments } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from "./parser/parser";
import { parseXmlToAst } from "./parser/xmlAdapter";
import { SourceFile } from "./parser/ast";
import { TdlMetadata } from "./tdlMetaData";
import { getMetadata } from "./services/metadataService";
import { getDiagnosticSeverity, isDiagnosticsEnabled, shouldTreatWarningsAsErrors, shouldHideWarnings } from './services/settingsManager';
import { validateSourceFile } from "./services/validation";
import { SymbolTable, SymbolInfo, definitionTypeToSymbolKind } from "./services/symbolTable";
import { ScopeManager } from "./services/scopeManager";
import * as fs from 'fs';
import * as path from 'path';
import { URI } from 'vscode-uri';

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
 */
export class DocManager {
    private docs = new Map<string, DocState>();

    /** Global symbol table for TDL documents */
    public readonly tdlSymbolTable = new SymbolTable();
    /** Global symbol table for XML documents */
    public readonly xmlSymbolTable = new SymbolTable();

    /** Scope Manager for TDL files */
    public readonly tdlScopeManager = new ScopeManager(this.tdlSymbolTable);
    /** Scope Manager for XML files */
    public readonly xmlScopeManager = new ScopeManager(this.xmlSymbolTable);

    /** Flag to track if workspace scan is in progress */
    private scanningInProgress = false;
    /** Queue for workspace scan requests */
    private scanQueue: string[][] = [];

    /** Workspace root folders */
    public workspaceFolders: string[] = [];

    /** Directed graph of inclusions: URI -> Set of URIs it includes */
    private includeGraph = new Map<string, Set<string>>();

    /** Reverse graph of inclusions: URI -> Set of URIs that include it */
    private parentGraph = new Map<string, Set<string>>();

    private rebuildTimers = new Map<string, NodeJS.Timeout>();
    private readonly REBUILD_DELAY = 200; // ms

    constructor(
        private connection: Connection, 
        private documents: TextDocuments<TextDocument>,
        public resolveIncludePath?: (currentPath: string, name: string) => string | null
    ) {
        documents.onDidOpen(e => this.rebuild(e.document));
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
            this.getSymbolTable(e.document.uri).clearDocument(e.document.uri);
            this.getScopeManager(e.document.uri).removeFileScope(e.document.uri);
            this.connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
        });
    }

    /** Helper to get the right SymbolTable for a URI */
    public getSymbolTable(uri: string): SymbolTable {
        return uri.toLowerCase().endsWith('.xml') || uri.toLowerCase().endsWith('.tdlxml') ? this.xmlSymbolTable : this.tdlSymbolTable;
    }

    /** Helper to get the right ScopeManager for a URI */
    public getScopeManager(uri: string): ScopeManager {
        return uri.toLowerCase().endsWith('.xml') || uri.toLowerCase().endsWith('.tdlxml') ? this.xmlScopeManager : this.tdlScopeManager;
    }

    /**
     * Get document state for a URI
     */
    get(uri: string): DocState | undefined {
        return this.docs.get(uri);
    }

    /**
     * Get all active document states
     */
    getAllDocs(): IterableIterator<[string, DocState]> {
        return this.docs.entries();
    }

    /**
     * Re-validate all documents (both open and closed but indexed)
     * Useful when global settings change.
     */
    public async revalidateAll(openDocsIter: Iterable<any>): Promise<void> {
        const openDocs = Array.from(openDocsIter);
        const allKnownUris = new Set<string>();

        // 1. Gather all related project nodes (tpj files, included files, parent files)
        for (const doc of openDocs) {
            const projectNodes = this.getProjectNodes(doc.uri);
            for (const node of projectNodes) {
                allKnownUris.add(node);
            }
        }

        // If no open documents, fall back to re-indexing all currently tracked/indexed files in the graph
        if (openDocs.length === 0) {
            const allTrackedUris = new Set<string>([...this.includeGraph.keys(), ...this.parentGraph.keys()]);
            for (const uriStr of allTrackedUris) {
                const fsPath = URI.parse(uriStr).fsPath;
                if (fs.existsSync(fsPath)) {
                    this.indexFile(fsPath, new Set()).catch(err => {
                        this.connection.console.error(`Error indexing file ${fsPath}: ${err}`);
                    });
                }
            }
            return;
        }

        // 2. Rebuild open documents
        for (const doc of openDocs) {
            this.rebuild(doc).catch(err => {
                this.connection.console.error(`Error rebuilding doc ${doc.uri}: ${err}`);
            });
        }

        // 3. Re-index closed but related files to update their diagnostics
        for (const uriStr of allKnownUris) {
            // indexFile internally skips if this.docs.has(uriStr)
            const fsPath = URI.parse(uriStr).fsPath;
            if (fs.existsSync(fsPath)) {
                this.indexFile(fsPath, new Set()).catch(err => {
                    this.connection.console.error(`Error indexing file ${fsPath}: ${err}`);
                });
            }
        }
    }

    /**
     * Scan workspace folders for TDL files (async, non-blocking)
     * @param workspaceFolders Array of workspace folder URIs
     */
    scanWorkspaceFolders(workspaceFolders: string[]): void {
        if (this.scanningInProgress) {
            this.scanQueue.push(workspaceFolders);
            return;
        }
        this.scanningInProgress = true;

        // Use setImmediate to not block the event loop
        setImmediate(async () => {
            try {
                for (const folderUri of workspaceFolders) {
                    await this.scanFolder(folderUri);
                }
                const count = this.tdlSymbolTable.getSymbolCount() + this.xmlSymbolTable.getSymbolCount();
                this.connection.console.log(`Workspace scan complete. ${count} definitions indexed.`);
            } catch (error) {
                this.connection.console.error(`Workspace scan error: ${error}`);
            } finally {
                this.scanningInProgress = false;
                
                if (this.scanQueue.length > 0) {
                    const nextScan = this.scanQueue.shift()!;
                    this.scanWorkspaceFolders(nextScan);
                }
            }
        });
    }

    /**
     * Clear all symbols for a specific folder path
     */
    clearFolderSymbols(folderPath: string): void {
        this.tdlSymbolTable.clearFolder(folderPath);
        this.xmlSymbolTable.clearFolder(folderPath);
        
        // Also clear include graph entries matching this folder
        for (const [uri, _] of this.includeGraph.entries()) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.includeGraph.delete(uri);
            }
        }
        for (const [uri, _] of this.parentGraph.entries()) {
            if (URI.parse(uri).fsPath.startsWith(folderPath)) {
                this.parentGraph.delete(uri);
            }
        }
    }

    /**
     * Scan a folder for TDL/TXT files
     */
    private async scanFolder(folderUri: string): Promise<void> {
        const folderPath = URI.parse(folderUri).fsPath;
        try {
            await this.scanDirectory(folderPath);
        } catch (error) {
            this.connection.console.error(`Error scanning ${folderPath}: ${error}`);
        }
    }

    /**
     * Recursively scan a directory for TDL files
     */
    private async scanDirectory(dirPath: string): Promise<void> {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);

            if (entry.isDirectory()) {
                // Skip node_modules, .git, etc.
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await this.scanDirectory(fullPath);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (ext === '.tpj') {
                    await this.parseProjectFile(fullPath);
                }
            }
        }
    }

    /**
     * Parse a .tpj file and index its entries
     */
    private async parseProjectFile(tpjPath: string): Promise<void> {
        try {
            const content = await readFileWithEncoding(tpjPath);
            const lines = content.split(/\r?\n/);
            const dirPath = path.dirname(tpjPath);
            const visited = new Set<string>();
            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith(';') || line.startsWith('[') || line.startsWith(']')) {
                    continue;
                }
                
                let entryFile = '';
                if (line.toLowerCase().startsWith('project file=')) {
                    entryFile = line.substring('project file='.length).trim();
                } else if (line.toLowerCase().endsWith('.txt') || line.toLowerCase().endsWith('.tdl')) {
                    // Lenient parsing: if the line simply names a .txt or .tdl file, use it
                    entryFile = line;
                }

                if (entryFile) {
                    // Strip any surrounding quotes just in case
                    entryFile = entryFile.replace(/^["']|["']$/g, '');
                    const targetPath = path.resolve(dirPath, entryFile);
                    if (fs.existsSync(targetPath)) {
                        await this.indexFile(targetPath, visited);
                    }
                }
            }
        } catch (err) {
            this.connection.console.warn(`Error parsing .tpj file ${tpjPath}: ${err}`);
        }
    }

    /**
     * Index a single file for symbols (without storing full doc state)
     */
    public async indexFile(filePath: string, visited: Set<string> = new Set()): Promise<void> {
        try {
            const uri = URI.file(filePath).toString();
            
            // Prevent circular/duplicate processing in the same scan chain
            if (visited.has(uri)) return;
            visited.add(uri);

            // Skip if already in docs (open in editor)
            if (this.docs.has(uri)) return;

            const content = await readFileWithEncoding(filePath);
            const ext = path.extname(filePath).toLowerCase();
            const isXml = ext === '.xml' || ext === '.tdlxml';
            const metadata = getMetadata();
            
            let sourceFile: SourceFile;
            if (isXml && metadata) {
                sourceFile = parseXmlToAst(content, metadata);
            } else {
                const parser = new Parser(content);
                sourceFile = parser.parse();
            }

            // Clear previous symbols for this document
            const symTable = this.getSymbolTable(uri);
            symTable.clearDocument(uri);

            // Add symbols from definitions (skip incomplete)
            for (const def of sourceFile.definitions) {
                if (!def.isIncomplete && def.name) {
                    const symbolInfo: SymbolInfo = {
                        name: def.name.text,
                        kind: definitionTypeToSymbolKind(def.type.text),
                        uri: uri,
                        start: def.start,
                        end: def.end,
                        definitionType: def.type.text,
                        isModifier: !!def.modifier && def.modifier.Text !== '!'
                    };
                    symTable.addSymbol(symbolInfo);
                }
            }
            
            // Build scope tree to capture global variables and formulas
            const scopeMgr = this.getScopeManager(uri);
            scopeMgr.buildFileScope(uri, sourceFile);

            // Update Include Graph
            const includes = this.updateIncludeGraph(uri, sourceFile);
            
            // Recursively index included files FIRST so their symbols exist
            for (const incUri of includes) {
                await this.indexFile(URI.parse(incUri).fsPath, visited);
            }
            
            // Run validation and send diagnostics
            if (metadata) {
                const languageId = isXml ? 'xml' : 'tdl';
                const doc = TextDocument.create(uri, languageId, 1, content);
                
                const diagnostics: Diagnostic[] = sourceFile.errors.map(error => ({
                    severity: DiagnosticSeverity.Error,
                    range: { start: doc.positionAt(error.start), end: doc.positionAt(error.end) },
                    message: error.message,
                    code: error.code,
                    source: 'tdl'
                }));
                diagnostics.push(...(await validateSourceFile(sourceFile, doc, metadata, symTable, scopeMgr, this.resolveIncludePath, this)));
                
                const treatAsError = shouldTreatWarningsAsErrors();
                const hideWarnings = shouldHideWarnings();

                const finalDiagnostics = isDiagnosticsEnabled() ? diagnostics.filter(d => {
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

                this.connection.sendDiagnostics({ uri, diagnostics: finalDiagnostics });
            }
        } catch (err) {
            // Silently skip files that can't be read, but log error
            this.connection.console.warn(`Error indexing file ${filePath}: ${err}`);
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
                        includes.add(URI.file(targetPath).toString());
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
     * Get all URIs that are in the same project as targetUri.
     * A project is defined as the set of all files reachable from any root that can reach targetUri.
     */
    public getProjectNodes(targetUri: string): Set<string> {
        // Find roots by walking UP parentGraph
        const roots = new Set<string>();
        const visitedParents = new Set<string>();
        
        const queueParents = [targetUri];
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
            roots.add(targetUri);
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

        return projectNodes;
    }

    /**
     * Rebuild document state by re-parsing the document
     */
    async rebuild(doc: TextDocument): Promise<void> {
        let sourceFile: SourceFile;
        const text = doc.getText();
        const isXml = doc.languageId === 'xml';

        const metadata = getMetadata();
        
        const oldDocState = this.docs.get(doc.uri);
        const oldSourceFile = oldDocState?.sourceFile;

        if (isXml) {
            sourceFile = parseXmlToAst(text, metadata);
        } else {
            const parser = new Parser(text, oldSourceFile);
            sourceFile = parser.parse();
        }

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

        // Update symbol table
        const symTable = this.getSymbolTable(doc.uri);
        symTable.clearDocument(doc.uri);
        for (const def of sourceFile.definitions) {
            if (!def.isIncomplete && def.name) {
                const symbolInfo: SymbolInfo = {
                    name: def.name.text,
                    kind: definitionTypeToSymbolKind(def.type.text),
                    uri: doc.uri,
                    start: def.start,
                    end: def.end,
                    definitionType: def.type.text,
                    isModifier: !!def.modifier && def.modifier.Text !== '!'
                };
                symTable.addSymbol(symbolInfo);
            }
        }

        // Build Scope Tree for the file
        const scopeMgr = this.getScopeManager(doc.uri);
        scopeMgr.buildFileScope(doc.uri, sourceFile);

        // Update Include Graph
        const includes = this.updateIncludeGraph(doc.uri, sourceFile);
        
        // Ensure new includes are indexed and diagnosed (background, non-blocking)
        const visited = new Set<string>([doc.uri]);
        for (const incUri of includes) {
            if (!this.docs.has(incUri) && !this.includeGraph.has(incUri)) {
                this.indexFile(URI.parse(incUri).fsPath, visited).catch(err => {
                    this.connection.console.warn(`Failed to index new include ${incUri}: ${err}`);
                });
            }
        }

        // Run metadata-based validations if metadata is available
        if (metadata) {
            diagnostics.push(...(await validateSourceFile(sourceFile, doc, metadata, symTable, scopeMgr, this.resolveIncludePath, this)));
        }

        // Store document state
        this.docs.set(doc.uri, { sourceFile, diagnostics });

        const treatAsError = shouldTreatWarningsAsErrors();
        const hideWarnings = shouldHideWarnings();

        // Apply user settings for diagnostic severity
        const finalDiagnostics = isDiagnosticsEnabled() ? diagnostics.filter(d => {
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

        this.connection.sendDiagnostics({ uri: doc.uri, diagnostics: finalDiagnostics });
    }
}