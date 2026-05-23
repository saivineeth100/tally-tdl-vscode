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

    /** Global symbol table for all documents */
    public readonly symbolTable = new SymbolTable();

    /** Scope Manager for handling hierarchical scopes */
    public readonly scopeManager = new ScopeManager(this.symbolTable);

    /** Flag to track if workspace scan is in progress */
    private scanningInProgress = false;

    constructor(
        private connection: Connection, 
        private documents: TextDocuments<TextDocument>,
        public resolveIncludePath?: (currentPath: string, name: string) => string | null
    ) {
        documents.onDidOpen(e => this.rebuild(e.document));
        documents.onDidChangeContent(e => this.rebuild(e.document));
        documents.onDidClose(e => {
            this.docs.delete(e.document.uri);
            this.symbolTable.clearDocument(e.document.uri);
            this.connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] });
        });
    }

    /**
     * Get document state for a URI
     */
    get(uri: string): DocState | undefined {
        return this.docs.get(uri);
    }

    /**
     * Scan workspace folders for TDL files (async, non-blocking)
     * @param workspaceFolders Array of workspace folder URIs
     */
    scanWorkspaceFolders(workspaceFolders: string[]): void {
        if (this.scanningInProgress) return;
        this.scanningInProgress = true;

        // Use setImmediate to not block the event loop
        setImmediate(async () => {
            try {
                for (const folderUri of workspaceFolders) {
                    await this.scanFolder(folderUri);
                }
                this.connection.console.log(`Workspace scan complete. ${this.symbolTable.getSymbolCount()} definitions indexed.`);
            } catch (error) {
                this.connection.console.error(`Workspace scan error: ${error}`);
            } finally {
                this.scanningInProgress = false;
            }
        });
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
                // Skip node_modules, .git, etc8888888.
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
                    this.symbolTable.addSymbol(symbolInfo);
                }
            }
        } catch {
            // Silently skip files that can't be read
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
        this.symbolTable.clearDocument(doc.uri);
        for (const def of sourceFile.definitions) {
            if (!def.isIncomplete && def.name) {
                const symbolInfo: SymbolInfo = {
                    name: def.name.text,
                    kind: definitionTypeToSymbolKind(def.type.text),
                    uri: doc.uri,
                    start: def.start,
                    end: def.end,
                    definitionType: def.type.text,
                    isModifier: !!def.modifier
                };
                this.symbolTable.addSymbol(symbolInfo);
            }
        }

        // Build Scope Tree for the file
        this.scopeManager.buildFileScope(doc.uri, sourceFile);

        // Run metadata-based validations if metadata is available
        if (metadata) {
            diagnostics.push(...validateSourceFile(sourceFile, doc, metadata, this.symbolTable, this.scopeManager, this.resolveIncludePath));
        }

        // Store document state and send diagnostics
        this.docs.set(doc.uri, { sourceFile, diagnostics });
        this.connection.sendDiagnostics({ uri: doc.uri, diagnostics });
    }
}