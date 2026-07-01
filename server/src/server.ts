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
import { normalizeUri } from './utils/uri';
import { logger } from './logger';
import { loadMetadata as loadNewMetadata, loadExternalLibraries } from './semantics/metadataLoader';
import { registerCompletion } from "./features/completion";
import { createDocumentSymbols } from "./features/documentSymbol";
import { getHoverInfo } from "./features/hover";
import { findReferenceAtOffset, findDefinitionByName, getDefinitionLocation } from "./features/definition";
import { provideFoldingRanges } from "./features/foldingRange";
import { updateSettings } from './utils/settingsManager';
import { normalizeTypeName } from './utils/normalizeUtils';
import { buildCustomLibraryCache } from "./semantics/cacheBuilder";

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

    if (initParams && initParams.workspaceFolders && initParams.workspaceFolders.length > 0) {
        globalWorkspaceFolders = initParams.workspaceFolders.map(f => URI.parse(f.uri).fsPath);
        docManager.workspaceFolders = globalWorkspaceFolders;
        const folderUris = initParams.workspaceFolders.map(f => f.uri);
        docManager.scanWorkspaceFolders(folderUris);
    } else if (hasWorkspaceFolderCapability) {
        connection.workspace.getWorkspaceFolders().then(folders => {
            if (folders && folders.length > 0) {
                globalWorkspaceFolders = folders.map(f => URI.parse(f.uri).fsPath);
                docManager.workspaceFolders = globalWorkspaceFolders;
                const folderUris = folders.map(f => f.uri);
                docManager.scanWorkspaceFolders(folderUris);
            } else {
                fallbackInitParams(initParams);
            }
        });
    } else {
        fallbackInitParams(initParams);
    }

    function fallbackInitParams(params: InitializeParams) {
        if (params && params.rootUri) {
            const fsPath = URI.parse(params.rootUri).fsPath;
            globalWorkspaceFolders = [fsPath];
            docManager.workspaceFolders = globalWorkspaceFolders;
            docManager.scanWorkspaceFolders([params.rootUri]);
        } else if (params && params.rootPath) {
            const fsPath = URI.file(params.rootPath).fsPath;
            globalWorkspaceFolders = [fsPath];
            docManager.workspaceFolders = globalWorkspaceFolders;
            docManager.scanWorkspaceFolders([URI.file(params.rootPath).toString()]);
        }
    }

    if (hasWorkspaceFolderCapability) {
        // Handle Workspace folder changes
        connection.workspace.onDidChangeWorkspaceFolders((event) => {
            // Remove folders
            for (const folder of event.removed) {
                const folderPath = URI.parse(folder.uri).fsPath;
                globalWorkspaceFolders = globalWorkspaceFolders.filter(f => f !== folderPath);
                docManager.workspaceFolders = globalWorkspaceFolders;
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
                docManager.workspaceFolders = globalWorkspaceFolders;
            }

            if (addedUris.length > 0) {
                docManager.scanWorkspaceFolders(addedUris);
            }
        });
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
import { provideSignatureHelp } from "./features/signatureHelp";
connection.onSignatureHelp((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;
    return provideSignatureHelp(doc, params.position, docManager.getScopeManager(params.textDocument.uri));
});

// Handle Inlay Hints
import { provideInlayHints } from "./features/inlayHints";
connection.languages.inlayHint.on((params) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return null;

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return null;

    return provideInlayHints(docState.sourceFile, doc, params.range, docManager.getScopeManager(params.textDocument.uri));
});

// Handle Code Lens
import { provideCodeLens, resolveCodeLens } from "./features/codeLens";
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
        try {
            return fs.realpathSync.native(relativePath);
        } catch {
            return relativePath;
        }
    }

    // 2. Try relative to each workspace folder root
    for (const folder of globalWorkspaceFolders) {
        const rootPath = path.resolve(folder, includeName);
        if (fs.existsSync(rootPath)) {
            try {
                return fs.realpathSync.native(rootPath);
            } catch {
                return rootPath;
            }
        }
    }

    // File not found
    return null;
}

// Handle go-to-definition request
connection.onDefinition(async (params: DefinitionParams): Promise<Location | Location[] | null> => {
    try {
        logger.trace(`[Trace] Server RECEIVED onDefinition for ${params.textDocument.uri}`);
        const doc = docs.get(params.textDocument.uri);
        if (!doc) return null;

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return null;

    const text = doc.getText();
    const offset = doc.offsetAt(params.position);
    
    const normUri = normalizeUri(params.textDocument.uri);
    const scopeMgr = docManager.getScopeManager(normUri);

    // Find if we're on a reference
    const ref = findReferenceAtOffset(docState.sourceFile, offset, text, scopeMgr, normUri);
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

    const scope = scopeMgr.getScopeAt(normUri, offset);
    const projectScope = docManager.getProjectNodes(normUri);
    
    if (scope) {
        let resolved: any;
        const expectedTypeLower = ref.expectedType.toLowerCase();
        
        if (expectedTypeLower === 'variable' || expectedTypeLower === 'method' || expectedTypeLower === 'system variable') {
            resolved = scopeMgr.resolveVariable(ref.name, scope, projectScope);
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

        let resolvedArray: any[] = [];
        if (resolved) {
            if (Array.isArray(resolved)) {
                resolvedArray = resolved;
            } else {
                resolvedArray = [resolved];
            }
        }

        // Add modifier contributions if it's a definition
        if (resolvedArray.length > 0 && !['variable', 'method', 'system variable', 'formula', 'system formulae', 'formulae', 'function', 'action'].includes(expectedTypeLower)) {
            const defId = scopeMgr.normalizeScopeId(ref.expectedType + ':' + ref.name);
            const mods = docManager.tdlScopeManager.modifierContributions.get(defId);
            if (mods) {
                resolvedArray.push(...mods);
            }
        }

        const locations: Location[] = [];

        for (const item of resolvedArray) {
            // Don't navigate to metadata-only definitions
            if (item.uri === 'global:metadata' || (item.start === 0 && item.end === 0)) {
                continue;
            }

            if (item.selectionRange) {
                locations.push({ uri: item.uri, range: item.selectionRange });
                continue;
            }

            const startOffset = item.range && typeof item.range.start === 'number' ? item.range.start : item.start;
            const endOffset = item.range && typeof item.range.end === 'number' ? item.range.end : item.end;

            if (startOffset !== undefined && endOffset !== undefined) {
                const targetDoc = docs.get(item.uri);
                if (targetDoc) {
                    locations.push({
                        uri: item.uri,
                        range: {
                            start: targetDoc.positionAt(startOffset),
                            end: targetDoc.positionAt(endOffset)
                        }
                    });
                    continue;
                }

                // Read from disk as fallback
                try {
                    const filePath = URI.parse(item.uri).fsPath;
                    if (fs.existsSync(filePath)) {
                        const content = await readFileWithEncoding(filePath);
                        const tempDoc = TextDocument.create(item.uri, 'tally', 1, content);
                        locations.push({
                            uri: item.uri,
                            range: {
                                start: tempDoc.positionAt(startOffset),
                                end: tempDoc.positionAt(endOffset)
                            }
                        });
                        continue;
                    }
                } catch (e) {
                    logger.error(`Error reading file for definition: ${e}`);
                }
            }

            // Try fast lookup via Scope Index first to avoid reading file
            const nameToFind = item.name || ref.name;
            const entries = docManager.tdlScopeManager.findGlobalSymbolsByName(nameToFind);
            let found = false;
            for (const entry of entries) {
                if (entry.uri === item.uri && entry.selectionRange) {
                    locations.push({ uri: item.uri, range: entry.selectionRange });
                    found = true;
                    break;
                } else if (entry.uri === item.uri && entry.range && entry.range.start.line !== undefined) {
                    locations.push({ uri: item.uri, range: entry.range as any });
                    found = true;
                    break;
                }
            }
            if (found) continue;

            // Try XML Scope Index
            const xmlEntries = docManager.xmlScopeManager.findGlobalSymbolsByName(nameToFind);
            for (const entry of xmlEntries) {
                if (entry.uri === item.uri && entry.selectionRange) {
                    locations.push({ uri: item.uri, range: entry.selectionRange });
                    break;
                } else if (entry.uri === item.uri && entry.range && entry.range.start.line !== undefined) {
                    locations.push({ uri: item.uri, range: entry.range as any });
                    break;
                }
            }
        }

        return locations.length > 0 ? locations : null;
    } // closes if (scope)
    
    return null;
    } catch (e) {
        logger.error(`Error in onDefinition for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
        return null;
    }
});

// Handle semantic tokens request
import { provideSemanticTokens, provideSemanticTokensEdits, TDL_SEMANTIC_TOKENS_LEGEND } from "./features/semanticTokens/semanticTokens";

connection.languages.semanticTokens.on((params, token) => {
    const uriStr = typeof params.textDocument.uri === 'string' ? params.textDocument.uri : (params.textDocument as any).uri;
    logger.info(`[Debug] Server RECEIVED semanticTokens/full for ${uriStr}`);

    const doc = docs.get(params.textDocument.uri);
    if (!doc) {
        logger.info(`[Debug] semanticTokens returning early: doc not found in this.docs for ${uriStr}`);
        return { data: [] };
    }

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) {
        logger.info(`[Debug] semanticTokens returning early: docState or sourceFile not found for ${uriStr}`);
        return { data: [] };
    }



    const tokens = provideSemanticTokens(docState.sourceFile, doc, docManager.getScopeManager(params.textDocument.uri), token);
    logger.info(`[Debug] semanticTokens successfully generated ${tokens.data.length} tokens for ${uriStr}`);
    return tokens;
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
import { formatDocument } from "./features/formatting";

connection.onDocumentFormatting((params, token) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return [];

    return formatDocument(doc.getText(), docState.sourceFile, params.options);
});

// Handle On-Type Formatting (Procedural labels and Auto-closing blocks)
import { provideOnTypeFormatting } from "./features/onTypeFormatting";

connection.onDocumentOnTypeFormatting((params, token) => {
    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    return provideOnTypeFormatting(doc, params.position, params.ch, params.options);
});

// Handle Rename Request
import { renameSymbol, prepareRename } from "./features/rename";
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
import { provideDocumentLinks } from "./features/documentLinks";

connection.onDocumentLinks((params: DocumentLinkParams): DocumentLink[] => {
    const docState = docManager.get(params.textDocument.uri);
    if (!docState || !docState.sourceFile) return [];

    const doc = docs.get(params.textDocument.uri);
    if (!doc) return [];

    return provideDocumentLinks(docState.sourceFile, doc, resolveIncludePath);
});

// Handle Workspace Symbols Request
import { getWorkspaceSymbols } from "./features/workspaceSymbol";
connection.onWorkspaceSymbol(async (params, token) => {
    return await getWorkspaceSymbols(params, docManager, docs, token);
});

// Handle Document Highlight Request
import { getDocumentHighlights } from "./features/documentHighlight";
connection.onDocumentHighlight((params) => {
    return getDocumentHighlights(params, docManager, docs);
});

// Handle Code Actions
import { provideCodeActions } from "./features/codeActions";
connection.onCodeAction((params) => {
    return provideCodeActions(params, docManager, docs);
});

// Handle TDL to XML Conversion
import { generateXml } from "./features/xmlGenerator";
import { findReferences } from "./features/references";
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
