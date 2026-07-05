import { ServerCapabilities, TextDocumentSyncKind } from 'vscode-languageserver/node';
import { TDL_SEMANTIC_TOKENS_LEGEND } from '../features/semanticTokens/semanticTokens';

export function getServerCapabilities(): ServerCapabilities {
    return {
        textDocumentSync: TextDocumentSyncKind.Incremental,
        completionProvider: {
            resolveProvider: true,
            triggerCharacters: ['.', ':', '=', '"', ',', '(', '[', '$', '<', '>']
        },
        foldingRangeProvider: true,
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
    };
}
