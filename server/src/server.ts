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
import { loadMetadata as loadNewMetadata } from './services/metadataLoader';
import { registerCompletion, buildFunctionDocumentation, buildAttributeDocumentation } from "./features/completion";
import { createDocumentSymbols } from "./services/documentSymbol";
import { getHoverInfo } from "./services/hover";
import { findReferenceAtOffset, findDefinitionByName, getDefinitionLocation } from "./services/definition";
import { provideFoldingRanges } from "./services/foldingRange";
import { updateSettings } from "./services/settingsManager";
import { normalizeTypeName } from "./services/utils";

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

    // Initialize Global Scope in ScopeManagers
    docManager.tdlScopeManager.initializeGlobalScope();
    docManager.xmlScopeManager.initializeGlobalScope();

    // NEW WAY: Load directly into the scope manager
    await loadNewMetadata(dataDir, version, docManager.tdlScopeManager);
    await loadNewMetadata(dataDir, version, docManager.xmlScopeManager);
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
let hasWorkspaceFolderCapability: boolean = false;

// Handle initialization
connection.onInitialize(async (params: InitializeParams): Promise<InitializeResult> => {
    initParams = params;

    if (params.workspaceFolders) {
        globalWorkspaceFolders = params.workspaceFolders.map(f => URI.parse(f.uri).fsPath);
        docManager.workspaceFolders = globalWorkspaceFolders;
    }

    const capabilities = params.capabilities;
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );

    // Block initialization until metadata is loaded to ensure handlers don't fail
    await loadMetadata("7.0");

    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ['.', ':', '=', '"', ',', '(', '[', '$', '<', '>']
            },
            foldingRangeProvider: true,
            documentSymbolProvider: true,
            semanticTokensProvider: {
                legend: TDL_SEMANTIC_TOKENS_LEGEND,
                full: {
                    delta: true
                }
            },
            documentFormattingProvider: true,
            hoverProvider: true,
            definitionProvider: true,
            renameProvider: { prepareProvider: true },
            referencesProvider: true,
            documentLinkProvider: { resolveProvider: false },
            signatureHelpProvider: { triggerCharacters: [':'] },
            inlayHintProvider: { resolveProvider: false },
            codeLensProvider: { resolveProvider: true },
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
    // Try to get workspace folders (may not be supported by client)
    if (hasWorkspaceFolderCapability) {
        try {
            const folders = await connection.workspace.getWorkspaceFolders();
            if (folders && folders.length > 0) {
                globalWorkspaceFolders = folders.map(f => URI.parse(f.uri).fsPath);
                const folderUris = folders.map(f => f.uri);
                docManager.scanWorkspaceFolders(folderUris);
            }
        } catch {
            // Workspace folders not supported, fall through to rootUri
        }

        // Handle Workspace folder changes
        connection.workspace.onDidChangeWorkspaceFolders((event) => {
            // Remove folders
            for (const folder of event.removed) {
                const folderPath = URI.parse(folder.uri).fsPath;
                globalWorkspaceFolders = globalWorkspaceFolders.filter(f => f !== folderPath);
                docManager.clearFolderSymbols(folderPath);
            }

            // Add folders
            const addedUris: string[] = [];
            for (const folder of event.added) {
                const folderPath = URI.parse(folder.uri).fsPath;
                if (!globalWorkspaceFolders.includes(folderPath)) {
                    globalWorkspaceFolders.push(folderPath);
                    addedUris.push(folder.uri);
                }
            }

            if (addedUris.length > 0) {
                docManager.scanWorkspaceFolders(addedUris);
            }
        });
    } else {
        // Fallback: use the folders/rootUri provided in initialization params
        if (initParams.workspaceFolders && initParams.workspaceFolders.length > 0) {
            const folderUris = initParams.workspaceFolders.map(f => f.uri);
            docManager.scanWorkspaceFolders(folderUris);
        } else if (initParams.rootUri) {
            docManager.scanWorkspaceFolders([initParams.rootUri]);
        } else if (initParams.rootPath) {
            docManager.scanWorkspaceFolders([URI.file(initParams.rootPath).toString()]);
        }
    }
});

// Handle file watcher events
import { FileChangeType } from "vscode-languageserver/node";
connection.onDidChangeWatchedFiles((change) => {
    for (const changeEvent of change.changes) {
        if (changeEvent.type === FileChangeType.Deleted) {
            docManager.getSymbolTable(changeEvent.uri).clearDocument(changeEvent.uri);
            docManager.getScopeManager(changeEvent.uri).removeFileScope(changeEvent.uri);
        }
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

    // Use enhanced hover with AST-based detection
    const projectScope = docManager.getProjectNodes(params.textDocument.uri);
    const hoverResult = getHoverInfo(docState.sourceFile, offset, docManager.getScopeManager(params.textDocument.uri), params.textDocument.uri, projectScope);
    if (!hoverResult) return null;

    return {
        contents: {
            kind: MarkupKind.Markdown,
            value: hoverResult.content
        }
    };
});

// Handle folding ranges
connection.onFoldingRanges((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return null;

    return provideFoldingRanges(docState.sourceFile, doc);
});

// Handle Signature Help
import { provideSignatureHelp } from "./services/signatureHelp";
connection.onSignatureHelp((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;
    return provideSignatureHelp(doc, params.position, docManager.getScopeManager(params.textDocument.uri));
});

// Handle Inlay Hints
import { provideInlayHints } from "./services/inlayHints";
connection.languages.inlayHint.on((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return null;

    return provideInlayHints(docState.sourceFile, doc, params.range, docManager.getScopeManager(params.textDocument.uri));
});

// Handle Code Lens
import { provideCodeLens, resolveCodeLens } from "./services/codeLens";
connection.onCodeLens((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return null;

    return provideCodeLens(docState.sourceFile, doc);
});

connection.onCodeLensResolve((lens) => {
    return resolveCodeLens(lens, docManager, docs);
});

export function resolveIncludePath(currentPath: string, includeName: string): string | null {
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

    // File not found
    return null;
}

// Handle go-to-definition request
connection.onDefinition((params: DefinitionParams): Location | null => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return null;

    const text = doc.getText();
    const offset = doc.offsetAt(params.position);
    
    const scopeMgr = docManager.getScopeManager(params.textDocument.uri);

    // Find if we're on a reference
    const ref = findReferenceAtOffset(docState.sourceFile, offset, text, scopeMgr, params.textDocument.uri);
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

    const scope = scopeMgr.getScopeAt(params.textDocument.uri, offset);
    const projectScope = docManager.getProjectNodes(params.textDocument.uri);
    if (scope) {
        const resolved = scopeMgr.resolve(ref.name, scope, projectScope);
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
        const symbols = docManager.getSymbolTable(params.textDocument.uri).findAllByName(ref.name);
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
        if (ref.expectedType) {
            const defs = scopeMgr.existingDefinitions.get(normalizeTypeName(ref.expectedType));
            if (defs && defs.has(normalizeTypeName(ref.name))) {
                connection.window.showInformationMessage(`Definition '${ref.name}' is part of default TDL source.`);
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
import { provideSemanticTokens, provideSemanticTokensEdits, TDL_SEMANTIC_TOKENS_LEGEND } from "./services/semanticTokens/semanticTokens";

connection.languages.semanticTokens.on((params, token) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return { data: [] };

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return { data: [] };

    return provideSemanticTokens(docState.sourceFile, doc, docManager.getScopeManager(params.textDocument.uri), token);
});

connection.languages.semanticTokens.onDelta((params, token) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return { edits: [] };

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return { edits: [] };

    return provideSemanticTokensEdits(docState.sourceFile, doc, params.previousResultId, docManager.getScopeManager(params.textDocument.uri), token);
});

// Handlers registered below
// Register completion handler with symbol table for definition name suggestions
registerCompletion(connection, docs, docManager);
// Handle document formatting
import { formatDocument } from "./services/formatting";

connection.onDocumentFormatting((params, token) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return [];

    return formatDocument(doc.getText(), docState.sourceFile, params.options);
});

// Handle On-Type Formatting (Procedural labels and Auto-closing blocks)
import { provideOnTypeFormatting } from "./services/onTypeFormatting";

connection.onDocumentOnTypeFormatting((params, token) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    return provideOnTypeFormatting(doc, params.position, params.ch, params.options);
});

// Handle Rename Request
import { renameSymbol, prepareRename } from "./services/rename";
connection.onRenameRequest(async (params) => {
    return await renameSymbol(params, docManager, docs);
});
connection.onPrepareRename((params) => {
    return prepareRename(params, docManager, docs);
});

// Provide references
connection.onReferences(async (params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;
    const offset = doc.offsetAt(params.position);
    return await findReferences(docManager, docs, params.textDocument.uri, offset, params.context.includeDeclaration);
});

// Handle Document Links (for Include statements across the whole document)
import { DocumentLinkParams, DocumentLink } from "vscode-languageserver";
import { provideDocumentLinks } from "./services/documentLinks";

connection.onDocumentLinks((params: DocumentLinkParams): DocumentLink[] => {
    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return [];

    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    return provideDocumentLinks(docState.sourceFile, doc, resolveIncludePath);
});

// Handle Workspace Symbols Request
import { getWorkspaceSymbols } from "./services/workspaceSymbol";
connection.onWorkspaceSymbol(async (params, token) => {
    return await getWorkspaceSymbols(params, docManager, docs, token);
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
import { findReferences } from "./services/references";
// Handle Scope Tree Debug Request
connection.onRequest("tdl/getScopeTreeDebug", async (params: { uri: string }) => {
    const scopeMgr = docManager.getScopeManager(params.uri);
    return scopeMgr.serializeScopeTree(params.uri);
});

connection.onRequest("tdl/getScopeSymbols", async (params: { uri: string, scopeId: string, kind: string, page: number, limit: number, query?: string }) => {
    const scopeMgr = docManager.getScopeManager(params.uri);
    return scopeMgr.getSymbolsPaginated(params.scopeId, params.kind, params.page, params.limit, params.query);
});

connection.onRequest("tdl/convertToXml", async (params: { uri: string }) => {
    const doc = docs.get(params.uri);
    const docState = docManager.get(params.uri);
    if (!doc || !docState || !docState.sourceFile) return null;
    return await generateXml(docState.sourceFile, doc.getText(), URI.parse(params.uri).fsPath, resolveIncludePath);
});

// Start listening (Must be at the very end after all handlers are registered)
docs.listen(connection);

connection.onDidChangeConfiguration(change => {
    if (change.settings && change.settings.tallyTDL) {
        updateSettings(change.settings.tallyTDL);
        // Re-validate all documents (open and indexed)
        docManager.revalidateAll(docs.all());
    }
});

connection.listen();


connection.onCompletionResolve((item) => {
    if (!item.data) return item;
    // We do not have a specific docManager or scopeManager available here because it's a global completion request.
    // However, the doc uri is sometimes stored in item.data. We can use docManager.getScopeManager(item.data.uri) if available.
    // But since it's global scope functions and attributes we need, we can just use docManager.tdlScopeManager.
    const scopeMgr = docManager.tdlScopeManager;

    if (item.data.type === 'function') {
        const func = scopeMgr.globalScope.functions.get(normalizeTypeName(item.data.name));
        if (func) {
            item.documentation = {
                kind: 'markdown',
                value: buildFunctionDocumentation(func as any) // Assuming buildFunctionDocumentation handles new FunctionSymbol format
            };
        }
    } else if (item.data.type === 'attribute') {
        const targetDef = item.data.defType;
        const attrMap = scopeMgr.globalScope.attributes.get(normalizeTypeName(targetDef));
        if (attrMap) {
            const attr = attrMap.get(normalizeTypeName(item.data.name));
            if (attr) {
                item.documentation = {
                    kind: 'markdown',
                    value: buildAttributeDocumentation(attr as any) // Assuming buildAttributeDocumentation handles new AttributeSymbol format
                };
            }
        }

    }
    return item;
});
