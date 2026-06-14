import { Connection, Diagnostic, DiagnosticSeverity, TextDocuments } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from "./parser/parser";
import { parseXmlToAst } from "./parser/xmlAdapter";
import { SourceFile } from "./parser/ast";
import { TdlMetadata } from "./tdlMetaData";
import { validateSourceFile } from "./services/validation";
import { SymbolTable, SymbolInfo, definitionTypeToSymbolKind } from "./services/symbolTable";
import { ScopeManager } from "./services/scopeManager";
import * as fs from 'fs';
import * as path from 'path';
import { URI } from 'vscode-uri';

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

    constructor(
        private connection: Connection, 
        private documents: TextDocuments<TextDocument>,
        public resolveIncludePath?: (currentPath: string, name: string) => string | null
    ) {
        documents.onDidOpen(e => this.rebuild(e.document));
        documents.onDidChangeContent(e => this.rebuild(e.document));
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
                if (ext === '.tdl' || ext === '.txt') {
                    await this.indexFile(fullPath);
                }
            }
        }
    }

    /**
     * Index a single file for symbols (without storing full doc state)
     */
    private async indexFile(filePath: string): Promise<void> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const uri = URI.file(filePath).toString();

            // Skip if already in docs (open in editor)
            if (this.docs.has(uri)) return;

            const parser = new Parser(content);
            const sourceFile = parser.parse();

            // Add symbols from definitions (skip incomplete)
            for (const def of sourceFile.definitions) {
                if (!def.isIncomplete && def.name) {
                    const symbolInfo: SymbolInfo = {
                        name: def.name.text,
                        kind: definitionTypeToSymbolKind(def.type.text),
                        uri: uri,
                        start: def.start,
                        end: def.end,
                        definitionType: def.type.text
                    };
                    this.getSymbolTable(uri).addSymbol(symbolInfo);
                }
            }
        } catch (err) {
            // Silently skip files that can't be read, but log error
            this.connection.console.warn(`Error indexing file ${filePath}: ${err}`);
        }
    }

    /**
     * Rebuild document state by re-parsing the document
     */
    async rebuild(doc: TextDocument): Promise<void> {
        let sourceFile: SourceFile;
        const text = doc.getText();
        const isXml = doc.languageId === 'xml';

        const metadata = (globalThis as any).TDL_METADATA as TdlMetadata | undefined;

        if (isXml) {
            sourceFile = parseXmlToAst(text, metadata);
        } else {
            const parser = new Parser(text);
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

        // Run metadata-based validations if metadata is available
        if (metadata) {
            diagnostics.push(...validateSourceFile(sourceFile, doc, metadata, symTable, scopeMgr, this.resolveIncludePath));
        }

        // Store document state and send diagnostics
        this.docs.set(doc.uri, { sourceFile, diagnostics });
        this.connection.sendDiagnostics({ uri: doc.uri, diagnostics });
    }
}