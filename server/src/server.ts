import {
    createConnection,
    InitializeParams,
    InitializeResult,
    ProposedFeatures,
    TextDocuments,
    TextDocumentSyncKind,
    DocumentSymbolParams,
    HoverParams,
    Hover,
    MarkupKind,
    DefinitionParams,
    Location
} from "vscode-languageserver/node";

import { DocManager } from "./docManager";
import { TextDocument } from "vscode-languageserver-textdocument";
import * as path from 'path';
import * as fs from 'fs';
import { URI } from 'vscode-uri';
import { TdlMetadata } from "./tdlMetaData";
import { registerCompletion } from "./features/completion";
import { createDocumentSymbols } from "./services/documentSymbol";
import { getDefinitionAtOffset, createHoverContent } from "./services/hover";
import { findReferenceAtOffset, findDefinitionByName, getDefinitionLocation } from "./services/definition";

// Create LSP connection
const connection = createConnection(ProposedFeatures.all);
const docs = new TextDocuments(TextDocument);

// Create document manager
const docManager = new DocManager(connection, docs, resolveIncludePath);

/**
 * Load TDL metadata from JSON files
 * @param version TDL version to load
 */
async function loadMetadata(version: string) {
    const dataDir = path.resolve(__dirname, '../data');
    const md = new TdlMetadata(dataDir, version);
    await md.load();
    (globalThis as any).TDL_METADATA = md;

    // Initialize Global Scope in ScopeManager
    docManager.scopeManager.initializeGlobalScope(md);
}

/**
 * Convert offset to Position in a document
 */
function offsetToPosition(doc: TextDocument, offset: number) {
    return doc.positionAt(offset);
}

// Store initialization params for fallback
let initParams: InitializeParams;
let globalWorkspaceFolders: string[] = [];

// Handle initialization
connection.onInitialize(async (params: InitializeParams): Promise<InitializeResult> => {
    initParams = params;

    if (params.workspaceFolders) {
        globalWorkspaceFolders = params.workspaceFolders.map(f => URI.parse(f.uri).fsPath);
    }

    // Start metadata loading in background (don't block initialization)
    setImmediate(() => loadMetadata("7.0"));

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: false,
                triggerCharacters: ['.', ':', '=', '"', ',', '(', '[', '$', '<', '>']
            },
            documentSymbolProvider: true,
            semanticTokensProvider: {
                legend: TDL_SEMANTIC_TOKENS_LEGEND,
                full: true
            },
            documentFormattingProvider: true,
            hoverProvider: true,
            definitionProvider: true,
            renameProvider: { prepareProvider: true },
            referencesProvider: true,
            documentLinkProvider: { resolveProvider: false },
            workspaceSymbolProvider: true,
            documentHighlightProvider: true,
            codeActionProvider: true,
            documentOnTypeFormattingProvider: {
                firstTriggerCharacter: '\n',
                moreTriggerCharacter: ['\r']
            },
            workspace: {
                workspaceFolders: {
                    supported: true,
                    changeNotifications: true
                }
            }
        }
    };
});

// After initialization, scan workspace for TDL files
connection.onInitialized(async () => {
    try {
        // Try to get workspace folders (may not be supported by client)
        const folders = await connection.workspace.getWorkspaceFolders();
        if (folders && folders.length > 0) {
            globalWorkspaceFolders = folders.map(f => URI.parse(f.uri).fsPath);
            const folderUris = folders.map(f => f.uri);
            docManager.scanWorkspaceFolders(folderUris);
            return;
        }
    } catch {
        // Workspace folders not supported, fall through to rootUri
    }

    // Fallback to rootUri from initialization params
    if (initParams?.rootUri) {
        docManager.scanWorkspaceFolders([initParams.rootUri]);
    } else if (initParams?.rootPath) {
        // Legacy fallback
        const { URI } = await import('vscode-uri');
        docManager.scanWorkspaceFolders([URI.file(initParams.rootPath).toString()]);
    }
});

// Handle document symbols request (Outline view)
connection.onDocumentSymbol((params: DocumentSymbolParams) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return [];

    return createDocumentSymbols(docState.sourceFile, doc.getText());
});

// Handle hover request
connection.onHover((params: HoverParams): Hover | null => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return null;

    const offset = doc.offsetAt(params.position);
    const metadata = (globalThis as any).TDL_METADATA;

    // Use enhanced hover with AST-based detection
    const { getHoverInfo } = require('./services/hover');
    const hoverResult = getHoverInfo(docState.sourceFile, offset, metadata, docManager.scopeManager, params.textDocument.uri);
    if (!hoverResult) return null;

    return {
        contents: {
            kind: MarkupKind.Markdown,
            value: hoverResult.content
        }
    };
});

export function resolveIncludePath(currentPath: string, includeName: string): string {
    // 1. Try relative to current file's directory
    const relativePath = path.resolve(path.dirname(currentPath), includeName);
    if (fs.existsSync(relativePath)) {
        return relativePath;
    }
    
    // 2. Try relative to each workspace folder root
    for (const folder of globalWorkspaceFolders) {
        const rootPath = path.resolve(folder, includeName);
        if (fs.existsSync(rootPath)) {
            return rootPath;
        }
    }
    
    // Fallback to relative path so it remains clickable even if not found
    return relativePath;
}

// Handle go-to-definition request
connection.onDefinition((params: DefinitionParams): Location | null => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return null;

    const text = doc.getText();
    const offset = doc.offsetAt(params.position);

    // Find if we're on a reference
    const metadata = (globalThis as any).TDL_METADATA;
    const ref = findReferenceAtOffset(docState.sourceFile, offset, text, metadata, docManager.scopeManager, params.textDocument.uri);
    // connection.console.log(`  Reference found: ${ref ? `${ref.name} (${ref.expectedType})` : 'none'}`);
    if (!ref) return null;

    if (ref.expectedType === 'File') {
        const targetPath = resolveIncludePath(URI.parse(params.textDocument.uri).fsPath, ref.name);
        if (targetPath) {
            return {
                uri: URI.file(targetPath).toString(),
                range: {
                    start: { line: 0, character: 0 },
                    end: { line: 0, character: 0 }
                }
            };
        }
        return null;
    }

    // Use ScopeManager to resolve first (this handles local variables, iterators, and global symbols)
    const scope = docManager.scopeManager.getScopeAt(params.textDocument.uri, offset);
    if (scope) {
        const resolved = docManager.scopeManager.resolve(ref.name, scope);
        if (resolved) {
            // Found via ScopeManager!
            const targetDoc = docs.get(resolved.uri);
            if (targetDoc) {
                return {
                    uri: resolved.uri,
                    range: {
                        start: targetDoc.positionAt(resolved.start),
                        end: targetDoc.positionAt(resolved.end)
                    }
                };
            } else if (resolved.uri !== 'global:metadata') {
                // Read from disk
                try {
                    const filePath = URI.parse(resolved.uri).fsPath;
                    if (fs.existsSync(filePath)) {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        const tempDoc = TextDocument.create(resolved.uri, 'tally', 1, content);
                        return {
                            uri: resolved.uri,
                            range: {
                                start: tempDoc.positionAt(resolved.start),
                                end: tempDoc.positionAt(resolved.end)
                            }
                        };
                    }
                } catch (e) {
                    connection.console.error(`Error reading file for definition: ${e}`);
                }
            } else if (resolved.uri === 'global:metadata') {
                 connection.window.showInformationMessage(`Definition '${ref.name}' is part of default TDL source.`);
                 return null;
            }
        }
    }

    // Look up the ORIGINAL definition in the same file (skip modifier definitions)
    let targetDef = findDefinitionByName(docState.sourceFile, ref.name, ref.expectedType, true);

    // If not found in current file, look in symbol table (cross-file)
    if (!targetDef) {
        const symbols = docManager.symbolTable.findAllByName(ref.name);
        // connection.console.log(`  Symbol table lookup: found ${symbols?.length || 0} symbols`);

        if (symbols && symbols.length > 0) {
            // Find matching symbol with correct type
            for (const symbol of symbols) {
                if (symbol.definitionType?.toLowerCase() === ref.expectedType.toLowerCase()) {
                    // Get the target document to convert offset to position
                    const targetDoc = docs.get(symbol.uri);
                    if (targetDoc) {
                        return {
                            uri: symbol.uri,
                            range: {
                                start: targetDoc.positionAt(symbol.start),
                                end: targetDoc.positionAt(symbol.end)
                            }
                        };
                    } else {
                        // Document not open - read from disk to calculate position
                        try {
                            const filePath = URI.parse(symbol.uri).fsPath;
                            if (fs.existsSync(filePath)) {
                                const content = fs.readFileSync(filePath, 'utf-8');
                                const tempDoc = TextDocument.create(symbol.uri, 'tally', 1, content);
                                return {
                                    uri: symbol.uri,
                                    range: {
                                        start: tempDoc.positionAt(symbol.start),
                                        end: tempDoc.positionAt(symbol.end)
                                    }
                                };
                            }
                        } catch (e) {
                            connection.console.error(`Error reading file for definition: ${e}`);
                        }

                        // Fallback
                        return {
                            uri: symbol.uri,
                            range: {
                                start: { line: 0, character: 0 },
                                end: { line: 0, character: 0 }
                            }
                        };
                    }
                }
            }
            // If no exact type match, return first match
            const symbol = symbols[0];
            const targetDoc = docs.get(symbol.uri);
            if (targetDoc) {
                return {
                    uri: symbol.uri,
                    range: {
                        start: targetDoc.positionAt(symbol.start),
                        end: targetDoc.positionAt(symbol.end)
                    }
                };
            } else {
                // Document not open - read from disk to calculate position
                try {
                    const filePath = URI.parse(symbol.uri).fsPath;
                    if (fs.existsSync(filePath)) {
                        const content = fs.readFileSync(filePath, 'utf-8');
                        const tempDoc = TextDocument.create(symbol.uri, 'tally', 1, content);
                        return {
                            uri: symbol.uri,
                            range: {
                                start: tempDoc.positionAt(symbol.start),
                                end: tempDoc.positionAt(symbol.end)
                            }
                        };
                    }
                } catch (e) {
                    connection.console.error(`Error reading file for definition: ${e}`);
                }

                return {
                    uri: symbol.uri,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 0 }
                    }
                };
            }
        }

        // Check Default TDL
        const md = (globalThis as any).TDL_METADATA as TdlMetadata;
        if (md && ref.expectedType) {
            // Find matching key case-insensitively
            const defTypeKey = Array.from(md.existingDefinitions.keys()).find(k => k.toLowerCase() === ref.expectedType.toLowerCase());
            if (defTypeKey) {
                const defaultNames = md.existingDefinitions.get(defTypeKey) || [];
                // Check if name exists incase-insensitively
                if (defaultNames.some(n => n.toLowerCase() === ref.name.toLowerCase())) {
                    connection.window.showInformationMessage(`Definition '${ref.name}' is part of default TDL source.`);
                }
            }
        }

        return null;
    }

    // Get the location of the definition from current file
    const loc = getDefinitionLocation(targetDef);
    return {
        uri: params.textDocument.uri,
        range: {
            start: offsetToPosition(doc, loc.start),
            end: offsetToPosition(doc, loc.end)
        }
    };
});

// Handle semantic tokens request
import { provideSemanticTokens, TDL_SEMANTIC_TOKENS_LEGEND } from "./services/semanticTokens/semanticTokens";

connection.languages.semanticTokens.on((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return { data: [] };

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return { data: [] };

    const metadata = (globalThis as any).TDL_METADATA;
    return provideSemanticTokens(docState.sourceFile, doc, docManager.scopeManager, metadata);
});

// Handlers registered below
// Register completion handler with symbol table for definition name suggestions
registerCompletion(connection, docs, docManager, docManager.symbolTable);

// Handle document formatting
import { formatDocument } from "./services/formatting";

connection.onDocumentFormatting((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return [];

    return formatDocument(doc.getText(), docState.sourceFile, params.options);
});

// Handle On-Type Formatting (Procedural labels and Auto-closing blocks)
import { provideOnTypeFormatting } from "./services/onTypeFormatting";

connection.onDocumentOnTypeFormatting((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    return provideOnTypeFormatting(doc, params.position, params.ch, params.options);
});

// Handle Rename Request
import { renameSymbol, prepareRename } from "./services/rename";
connection.onRenameRequest((params) => {
    return renameSymbol(params, docManager, docs);
});
connection.onPrepareRename((params) => {
    return prepareRename(params, docManager, docs);
});

// Handle References Request
import { findReferences } from "./services/references";
connection.onReferences((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;
    const offset = doc.offsetAt(params.position);
    return findReferences(docManager, docs, params.textDocument.uri, offset);
});

// Handle Document Links (for Include statements across the whole document)
import { DocumentLinkParams, DocumentLink } from "vscode-languageserver";
connection.onDocumentLinks((params: DocumentLinkParams): DocumentLink[] => {
    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return [];
    
    const links: DocumentLink[] = [];
    const currentPath = URI.parse(params.textDocument.uri).fsPath;
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    for (const def of docState.sourceFile.definitions) {
        if ((def.type.text.trim().toLowerCase() === 'include' || def.type.text.trim().toLowerCase() === 'import') && def.name) {
            let name = def.name.text;
            name = name.replace(/^"|"$|^'|'$/g, '');
            const targetPath = resolveIncludePath(currentPath, name);
            if (targetPath) {
                links.push({
                    range: {
                        start: doc.positionAt(def.name.start),
                        end: doc.positionAt(def.name.end)
                    },
                    target: URI.file(targetPath).toString()
                });
            }
        }
    }
    return links;
});

// Handle Workspace Symbols Request
import { getWorkspaceSymbols } from "./services/workspaceSymbol";
connection.onWorkspaceSymbol((params) => {
    return getWorkspaceSymbols(params, docManager, docs);
});

// Handle Document Highlight Request
import { getDocumentHighlights } from "./services/documentHighlight";
connection.onDocumentHighlight((params) => {
    return getDocumentHighlights(params, docManager, docs);
});

// Handle Code Actions
import { provideCodeActions } from "./services/codeActions";
connection.onCodeAction((params) => {
    return provideCodeActions(params, docManager, docs);
});

// Handle TDL to XML Conversion
import { generateXml } from "./services/xmlGenerator";
connection.onRequest("tdl/convertToXml", async (params: { uri: string }) => {
    const doc = docs.get(params.uri);
    const docState = docManager.get(params.uri);
    if (!doc || !docState || !docState.sourceFile) return null;
    return await generateXml(docState.sourceFile, doc.getText(), URI.parse(params.uri).fsPath, resolveIncludePath);
});

// Start listening (Must be at the very end after all handlers are registered)
docs.listen(connection);
connection.listen();
