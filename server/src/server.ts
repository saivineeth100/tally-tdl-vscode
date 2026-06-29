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

import { DocManager, readFileWithEncoding } from "./docManager";
import { TextDocument } from "vscode-languageserver-textdocument";
import * as path from 'path';
import * as fs from 'fs';
import { URI } from 'vscode-uri';
import { logger } from './logger';
import { loadMetadata as loadNewMetadata, loadExternalLibraries } from './services/metadataLoader';
import { registerCompletion, buildFunctionDocumentation, buildAttributeDocumentation } from "./features/completion";
import { createDocumentSymbols } from "./services/documentSymbol";
import { getHoverInfo } from "./services/hover";
import { findReferenceAtOffset, findDefinitionByName, getDefinitionLocation } from "./services/definition";
import { provideFoldingRanges } from "./services/foldingRange";
import { updateSettings } from "./services/settingsManager";
import { normalizeTypeName } from "./services/utils";
import { buildCustomLibraryCache } from "./services/cacheBuilder";

// Create LSP connection
const connection = createConnection(ProposedFeatures.all);
logger.setConnection(connection);

const docs = new TextDocuments(TextDocument);

// Create document manager
const docManager = new DocManager(connection, docs, resolveIncludePath);

/**
 * Load TDL metadata from JSON files
 * @param version TDL version to load
 */
async function loadMetadata(version: string) {
    // When bundled to dist/, __dirname is dist/. When running from src/, __dirname is src/.
    const dataDir = __dirname.endsWith('src') || __dirname.endsWith('src\\') || __dirname.endsWith('src/')
        ? path.resolve(__dirname, '../data')
        : path.resolve(__dirname, 'data');

    // Initialize Global Scope in ScopeManagers
    docManager.tdlScopeManager.initializeGlobalScope();
    docManager.xmlScopeManager.initializeGlobalScope();

    // NEW WAY: Load directly into the TDL scope manager
    await loadNewMetadata(dataDir, version, docManager.tdlScopeManager,false);

    // Share the loaded global read-only metadata with the XML scope manager
    // to avoid deserializing the massive binary cache twice.
    docManager.xmlScopeManager.globalScope = docManager.tdlScopeManager.globalScope;
    docManager.xmlScopeManager.keywordSets = docManager.tdlScopeManager.keywordSets;
    docManager.xmlScopeManager.primarySchemaNames = docManager.tdlScopeManager.primarySchemaNames;
    docManager.xmlScopeManager.definitionTypeLabels = docManager.tdlScopeManager.definitionTypeLabels;
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

    // Removed blocking loadMetadata from here to speed up LSP startup

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

let currentTargetVersion = "7.0";

// After initialization, scan workspace for TDL files
connection.onInitialized(async () => {
    // Sync settings and external libraries first
    const settings = await connection.workspace.getConfiguration('tallyTDL');
    if (settings) {
        updateSettings(settings);
        if (settings.targetVersion) {
            currentTargetVersion = settings.targetVersion;
        }
    }

    // Load metadata in background so we don't block the initial LSP connection
    await loadMetadata(currentTargetVersion);
    docManager.isMetadataLoaded = true;
    
    // If workspace scanning finished before metadata loaded, we must trigger revalidation
    // Otherwise, the end of scanWorkspaceFolders will handle it.
    if (!docManager.scanningInProgress) {
        docManager.revalidateAll(docs.all()).catch(e => logger.error(`Revalidation failed after metadata load: ${e}`));
    }
    
    // Tell client to refresh semantic tokens since we now have base symbols
    connection.languages.semanticTokens.refresh();
    
    if (settings) {
        if (settings.excludePaths && Array.isArray(settings.excludePaths)) {
            docManager.setExcludePaths(settings.excludePaths);
        }
        if (settings.externalLibraries && Array.isArray(settings.externalLibraries)) {
            await loadExternalLibraries(settings.externalLibraries, docManager.tdlScopeManager);
            await loadExternalLibraries(settings.externalLibraries, docManager.xmlScopeManager);
        }
    }

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

    return createDocumentSymbols(docState.sourceFile, doc.getText(), docManager.getScopeManager(params.textDocument.uri));
});

// Handle hover request
connection.onHover((params: HoverParams): Hover | null => {
    try {
        logger.trace(`[Trace] Server RECEIVED onHover for ${params.textDocument.uri}`);
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
    } catch (e) {
        logger.error(`Error in onHover for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
        return null;
    }
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

    return provideCodeLens(docState.sourceFile, doc, docManager.getScopeManager(params.textDocument.uri));
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
connection.onDefinition(async (params: DefinitionParams): Promise<Location | null> => {
    try {
        logger.trace(`[Trace] Server RECEIVED onDefinition for ${params.textDocument.uri}`);
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
        let resolved: any;
        const expectedTypeLower = ref.expectedType.toLowerCase();
        
        if (expectedTypeLower === 'variable' || expectedTypeLower === 'method' || expectedTypeLower === 'system variable') {
            resolved = scopeMgr.resolve(ref.name, scope, projectScope);
        } else if (expectedTypeLower === 'formula' || expectedTypeLower === 'system formulae' || expectedTypeLower === 'formulae') {
            resolved = scopeMgr.resolveFormula(ref.name, scope, projectScope);
        } else if (expectedTypeLower === 'function') {
            resolved = scopeMgr.resolveFunction(ref.name, scope, projectScope);
        } else if (expectedTypeLower === 'action') {
            resolved = scopeMgr.resolveAction(ref.name, scope, projectScope);
        } else {
            resolved = scopeMgr.resolveDefinition(
                ref.name,
                ref.expectedType,
                scope,
                projectScope
            );
        }

        if (resolved) {
            // Don't navigate to metadata-only definitions
            if (resolved.uri === 'global:metadata' || (resolved.start === 0 && resolved.end === 0)) {
                return null; // Let hover provider show info instead
            }

            if (!docManager.isUriActive(resolved.uri)) {
                connection.window.showInformationMessage(`Definition '${ref.name}' is part of Default TDL or an External Library. Source navigation is not available.`);
                return null;
            }

            if (resolved.selectionRange) {
                return {
                    uri: resolved.uri,
                    range: resolved.selectionRange
                };
            }

            const targetDoc = docs.get(resolved.uri);
            if (targetDoc) {
                return {
                    uri: resolved.uri,
                    range: {
                        start: targetDoc.positionAt(resolved.start),
                        end: targetDoc.positionAt(resolved.end)
                    }
                };
            } else {
                // Try fast lookup via Scope Index first to avoid reading file
                const entries = docManager.tdlScopeManager.findGlobalSymbolsByName(resolved.name);
                for (const entry of entries) {
                    if (entry.uri === resolved.uri && entry.selectionRange) {
                        return {
                            uri: resolved.uri,
                            range: entry.selectionRange
                        };
                    } else if (entry.uri === resolved.uri && entry.range && entry.range.start.line !== undefined) {
                        return {
                            uri: resolved.uri,
                            range: entry.range
                        };
                    }
                }

                // Try XML Scope Index
                const xmlEntries = docManager.xmlScopeManager.findGlobalSymbolsByName(resolved.name);
                for (const entry of xmlEntries) {
                    if (entry.uri === resolved.uri && entry.selectionRange) {
                        return {
                            uri: resolved.uri,
                            range: entry.selectionRange
                        };
                    } else if (entry.uri === resolved.uri && entry.range && entry.range.start.line !== undefined) {
                        return {
                            uri: resolved.uri,
                            range: entry.range
                        };
                    }
                }

                // Read from disk as fallback
                try {
                    const filePath = URI.parse(resolved.uri).fsPath;
                    if (fs.existsSync(filePath)) {
                        const content = await readFileWithEncoding(filePath);
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
                    logger.error(`Error reading file for definition: ${e}`);
                    return null;
                }

                // Fallback
                return {
                    uri: resolved.uri,
                    range: {
                        start: { line: 0, character: 0 },
                        end: { line: 0, character: 0 }
                    }
                };
            }
        }
    }

    return null;
    } catch (e) {
        logger.error(`Error in onDefinition for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
        return null;
    }
});

// Handle semantic tokens request
import { provideSemanticTokens, provideSemanticTokensEdits, TDL_SEMANTIC_TOKENS_LEGEND } from "./services/semanticTokens/semanticTokens";

connection.languages.semanticTokens.on((params, token) => {
    const uriStr = typeof params.textDocument.uri === 'string' ? params.textDocument.uri : (params.textDocument as any).uri;
    logger.trace(`[Trace] Server RECEIVED semanticTokens/full for ${path.basename(uriStr)} at ${new Date().toISOString()}`);

    const doc = docs.get(params.textDocument.uri);
    if (!doc) return { data: [] };

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return { data: [] };

    if (!docManager.isUriActive(params.textDocument.uri)) {
        return { data: [] };
    }

    return provideSemanticTokens(docState.sourceFile, doc, docManager.getScopeManager(params.textDocument.uri), token);
});

connection.languages.semanticTokens.onDelta((params, token) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return { edits: [] };

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return { edits: [] };

    if (!docManager.isUriActive(params.textDocument.uri)) {
        return { edits: [] };
    }

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
    try {
        logger.trace(`[Trace] Server RECEIVED onRenameRequest for ${params.textDocument.uri}`);
        return await renameSymbol(params, docManager, docs);
    } catch (e) {
        logger.error(`Error in onRenameRequest for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
        return null;
    }
});
connection.onPrepareRename((params) => {
    return prepareRename(params, docManager, docs);
});

// Provide references
connection.onReferences(async (params) => {
    try {
        logger.trace(`[Trace] Server RECEIVED onReferences for ${params.textDocument.uri}`);
        const doc = docs.get(params.textDocument.uri);
        if (!doc) return null;
        const offset = doc.offsetAt(params.position);
        return await findReferences(docManager, docs, params.textDocument.uri, offset, params.context.includeDeclaration);
    } catch (e) {
        logger.error(`Error in onReferences for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
        return null;
    }
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
    return scopeMgr.viewer.serializeScopeTree(params.uri);
});

connection.onRequest("tdl/getScopeChildren", async (params: { uri: string, scopeId: string }) => {
    const scopeMgr = docManager.getScopeManager(params.uri);
    return scopeMgr.viewer.getScopeChildren(params.scopeId);
});

connection.onRequest("tdl/getScopeNode", async (params: { uri: string, scopeId: string }) => {
    const scopeMgr = docManager.getScopeManager(params.uri);
    return scopeMgr.viewer.getScopeNode(params.scopeId);
});

connection.onRequest("tdl/getScopeSymbols", async (params: { uri: string, scopeId: string, kind: string, page: number, limit: number, query?: string }) => {
    const scopeMgr = docManager.getScopeManager(params.uri);
    return scopeMgr.viewer.getSymbolsPaginated(params.scopeId, params.kind, params.page, params.limit, params.query);
});

connection.onRequest("tdl/resolveGlobalSymbol", async (params: { uri: string, name: string, expectedType: string }) => {
    const scopeMgr = docManager.getScopeManager(params.uri);
    const projectScope = docManager.getProjectNodes(params.uri);
    const resolved = scopeMgr.resolveDefinition(params.name, params.expectedType, scopeMgr.globalScope, projectScope);
    
    if (resolved && !docManager.isUriActive(resolved.uri)) {
        connection.window.showInformationMessage(`Definition '${resolved.name}' is part of Default TDL or an External Library. Source navigation is not available.`);
        return null;
    }
    
    return resolved;
});

connection.onRequest("tdl/convertToXml", async (params: { uri: string }) => {
    const doc = docs.get(params.uri);
    const docState = docManager.get(params.uri);
    if (!doc || !docState || !docState.sourceFile) return null;
    return await generateXml(docState.sourceFile, doc.getText(), URI.parse(params.uri).fsPath, resolveIncludePath);
});

connection.onNotification("tdl/buildCustomLibraryCache", async (params: { folderPath: string }) => {
    try {
        const cacheFile = await buildCustomLibraryCache(params.folderPath);
        connection.window.showInformationMessage(`Successfully generated custom library cache at: ${cacheFile}. You can add this path to 'tallyTDL.externalLibraries' in your settings.`);
    } catch (err) {
        connection.window.showErrorMessage(`Failed to build custom library cache: ${err}`);
    }
});

// Start listening (Must be at the very end after all handlers are registered)
docs.listen(connection);

connection.onDidChangeConfiguration(async (change) => {
    if (change.settings && change.settings.tallyTDL) {
        updateSettings(change.settings.tallyTDL);
        
        if (change.settings.tallyTDL.excludePaths && Array.isArray(change.settings.tallyTDL.excludePaths)) {
            docManager.setExcludePaths(change.settings.tallyTDL.excludePaths);
        }
        
        let requiresMetadataReload = false;
        if (change.settings.tallyTDL.targetVersion && change.settings.tallyTDL.targetVersion !== currentTargetVersion) {
            currentTargetVersion = change.settings.tallyTDL.targetVersion;
            requiresMetadataReload = true;
        }

        if (requiresMetadataReload) {
            connection.window.showInformationMessage(`Tally TDL: Loading metadata for version ${currentTargetVersion}...`);
            docManager.isMetadataLoaded = false;
            
            // Clear existing global scopes
            docManager.tdlScopeManager.globalScope.definitions.clear();
            docManager.tdlScopeManager.globalScope.variables.clear();
            docManager.tdlScopeManager.globalScope.formulas.clear();
            docManager.xmlScopeManager.globalScope.definitions.clear();
            
            await loadMetadata(currentTargetVersion);
            docManager.isMetadataLoaded = true;
            connection.languages.semanticTokens.refresh();
        }

        // Reload external libraries if configured
        if (change.settings.tallyTDL.externalLibraries && Array.isArray(change.settings.tallyTDL.externalLibraries)) {
            await loadExternalLibraries(change.settings.tallyTDL.externalLibraries, docManager.tdlScopeManager);
            await loadExternalLibraries(change.settings.tallyTDL.externalLibraries, docManager.xmlScopeManager);
        }

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

