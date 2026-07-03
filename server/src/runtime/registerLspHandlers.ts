import { Connection, HoverParams, Hover } from 'vscode-languageserver/node';
import { ServerRuntime } from './serverRuntime';
import { logger } from '../logger';
import { CustomRequests, CustomNotifications } from '../protocol/customProtocol';

/**
 * Maps all connection.on* methods to their respective runtime service handlers.
 * This ensures the entry point server.ts contains zero business or routing logic.
 */
export function registerLspHandlers(connection: Connection, runtime: ServerRuntime) {
    
    // 1. Workspace Lifecycle
    connection.onInitialize((params) => runtime.workspaceLifecycle.initialize(params));
    connection.onInitialized(() => runtime.workspaceLifecycle.initialized());
    connection.onDidChangeWatchedFiles((change) => runtime.workspaceLifecycle.onDidChangeWatchedFiles(change));
    connection.onDidChangeConfiguration((change) => runtime.workspaceLifecycle.onDidChangeConfiguration(change));

    // 2. Document Features
    connection.onDocumentSymbol(runtime.documentFeatures.documentSymbols);
    
    connection.onHover(async (params: HoverParams): Promise<Hover | null> => {
        try {
            logger.trace(`[Trace] Server RECEIVED onHover for ${params.textDocument.uri}`);
            return await runtime.documentFeatures.hover(params);
        } catch (e) {
            logger.error(`Error in onHover for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
            return null;
        }
    });

    connection.onFoldingRanges(runtime.documentFeatures.foldingRanges);
    connection.onSignatureHelp(runtime.documentFeatures.signatureHelp);
    connection.languages.inlayHint.on(runtime.documentFeatures.inlayHints);
    connection.onCodeLens(runtime.documentFeatures.codeLens);
    connection.onCodeLensResolve(runtime.documentFeatures.resolveCodeLens);
    connection.languages.semanticTokens.on(runtime.documentFeatures.semanticTokens);
    connection.languages.semanticTokens.onDelta(runtime.documentFeatures.semanticTokensDelta);
    connection.onDocumentFormatting(runtime.documentFeatures.formatDocument);
    connection.onDocumentOnTypeFormatting(runtime.documentFeatures.formatOnType);
    connection.onDocumentLinks(runtime.documentFeatures.documentLinks);
    connection.onCodeAction(runtime.documentFeatures.codeActions);

    // 3. Navigation
    connection.onDefinition((params) => runtime.navigation.definition(params));
    connection.onRenameRequest((params) => runtime.navigation.rename(params));
    connection.onPrepareRename((params) => runtime.navigation.prepareRename(params));
    connection.onReferences((params) => runtime.navigation.references(params));
    connection.onWorkspaceSymbol((params, token) => runtime.navigation.workspaceSymbol(params, token));
    connection.onDocumentHighlight((params) => runtime.navigation.documentHighlight(params));

    // 4. Completion
    connection.onCompletion((params) => runtime.completion.complete(params));
    if (typeof connection.onCompletionResolve === 'function') {
        connection.onCompletionResolve((item) => runtime.completion.resolve(item));
    }

    // 5. Custom Requests (TDL -> XML, Scope Viewer, etc.)
    connection.onRequest(CustomRequests.GetScopeTreeDebug, (params: { uri: string }) => runtime.customRequests.getScopeTreeDebug(params));
    connection.onRequest(CustomRequests.GetScopeChildren, (params: { uri: string, scopeId: string }) => runtime.customRequests.getScopeChildren(params));
    connection.onRequest(CustomRequests.GetScopeNode, (params: { uri: string, scopeId: string }) => runtime.customRequests.getScopeNode(params));
    connection.onRequest(CustomRequests.GetScopeSymbols, (params: { uri: string, scopeId: string, kind: string, page: number, limit: number, query?: string }) => runtime.customRequests.getScopeSymbols(params));
    connection.onRequest(CustomRequests.ResolveGlobalSymbol, (params: { uri: string, name: string, expectedType: string }) => runtime.customRequests.resolveGlobalSymbol(params));
    connection.onRequest(CustomRequests.ConvertToXml, (params: { uri: string }) => runtime.customRequests.convertToXml(params));
    connection.onNotification(CustomNotifications.BuildCustomLibraryCache, (params: { folderPath: string }) => runtime.customRequests.buildCustomLibraryCache(params));
}
