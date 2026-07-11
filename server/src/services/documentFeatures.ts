import { DocumentSymbolParams, FoldingRangeParams, SignatureHelpParams, InlayHintParams, HoverParams, CodeLensParams, CodeLens, DocumentFormattingParams, DocumentOnTypeFormattingParams, DocumentLinkParams, CodeActionParams, SemanticTokensParams, SemanticTokensDeltaParams, MarkupKind, DocumentHighlightParams, RenameParams, WorkspaceEdit, PrepareRenameParams, Range } from 'vscode-languageserver';
import { createDocumentSymbols } from '../features/documentSymbol';
import { provideFoldingRanges } from '../features/foldingRange';
import { provideSignatureHelp } from '../features/signatureHelp';
import { provideInlayHints } from '../features/inlayHints';
import { provideCodeLens, resolveCodeLens } from '../features/codeLens';
import { getHoverInfo } from '../features/hover';
import { getDocumentHighlights } from '../features/documentHighlight';
import { formatDocument } from '../features/formatting';
import { provideOnTypeFormatting } from '../features/onTypeFormatting';
import { provideDocumentLinks } from '../features/documentLinks';
import { provideCodeActions } from '../features/codeActions';
import { renameSymbol, prepareRename } from '../features/rename';
import { provideSemanticTokens, provideSemanticTokensEdits } from '../features/semanticTokens/semanticTokens';
import { DocumentContextResolver, ParsedDocumentContext, PositionedDocumentContext } from './documentContextResolver';
import { DocumentLoader } from './documentLoader';
import { DocumentLifecycleService } from './documentLifecycleService';
import { getFormattingRules } from '../utils/settingsManager';
import { ClientGateway } from '../ports/clientGateway';

export function createDocumentFeatures(
    resolver: DocumentContextResolver, 
    documentLoader: DocumentLoader, 
    resolveIncludePath: (currentPath: string, includeName: string) => string | null,
    documentLifecycle: DocumentLifecycleService,
    client: ClientGateway
) {
    const withParsed = <T, P extends { textDocument: { uri: string } }>(
        fallback: T,
        handler: (ctx: ParsedDocumentContext, params: P) => T | Promise<T>
    ) => {
        return (params: P): T | Promise<T> => {
            const ctx = resolver.resolveParsed(params.textDocument.uri);
            if (!ctx) return fallback;
            return handler(ctx, params);
        };
    };

    const withPositioned = <T, P extends { textDocument: { uri: string }, position: any }>(
        fallback: T,
        handler: (ctx: PositionedDocumentContext, params: P) => T | Promise<T>
    ) => {
        return (params: P): T | Promise<T> => {
            const ctx = resolver.resolveAtPosition(params.textDocument.uri, params.position);
            if (!ctx) return fallback;
            return handler(ctx, params);
        };
    };

    return {
        documentSymbols: withParsed([], (ctx, params: DocumentSymbolParams) => {
            return createDocumentSymbols(ctx.sourceFile, ctx.document.getText(), ctx.scopeManager);
        }),
        
        foldingRanges: withParsed(null, (ctx, params: FoldingRangeParams) => {
            return provideFoldingRanges(ctx.sourceFile, ctx.document);
        }),
        
        signatureHelp: withPositioned(null, (ctx, params: SignatureHelpParams) => {
            return provideSignatureHelp(ctx.document, ctx.position, ctx.scopeManager);
        }),
        
        inlayHints: withParsed(null, (ctx, params: InlayHintParams) => {
            return provideInlayHints(ctx.sourceFile, ctx.document, params.range, ctx.scopeManager);
        }),
        
        hover: withPositioned(null, (ctx, params: HoverParams) => {
            const hoverResult = getHoverInfo(ctx.sourceFile, ctx.offset, ctx.scopeManager, ctx.uri, ctx.projectNodes);
            if (!hoverResult) return null;
            return {
                contents: {
                    kind: MarkupKind.Markdown,
                    value: hoverResult.content
                }
            };
        }),

        codeLens: withParsed(null, (ctx, params: CodeLensParams) => {
            return provideCodeLens(ctx.sourceFile, ctx.document, ctx.scopeManager);
        }),
        
        resolveCodeLens: (lens: CodeLens): Promise<CodeLens> => {
            return resolveCodeLens(lens, resolver, documentLoader);
        },

        formatDocument: withParsed([], (ctx, params: DocumentFormattingParams) => {
            return formatDocument(ctx.document.getText(), ctx.sourceFile, params.options, getFormattingRules());
        }),

        formatOnType: withParsed([], (ctx, params: DocumentOnTypeFormattingParams) => {
            return provideOnTypeFormatting(ctx.document, params.position, params.ch, params.options, getFormattingRules(), client);
        }),

        documentHighlight: (params: DocumentHighlightParams) => {
            return getDocumentHighlights(params, resolver.stateStore, resolver.documents, documentLoader, resolver.graphManager);
        },

        rename: (params: RenameParams): Promise<WorkspaceEdit | null> => {
            return renameSymbol(params, resolver.stateStore, resolver.documents, documentLoader, resolver.graphManager);
        },

        prepareRename: (params: PrepareRenameParams): Promise<Range | { range: Range, placeholder: string } | null> => {
            return prepareRename(params, resolver.stateStore, resolver.documents, documentLoader, resolver.graphManager);
        },

        codeActions: (params: CodeActionParams) => {
            return provideCodeActions(params, resolver.stateStore, resolver.documents);
        },

        documentLinks: withParsed([], (ctx, params: DocumentLinkParams) => {
            return provideDocumentLinks(ctx.sourceFile, ctx.document, resolveIncludePath);
        }),

        semanticTokens: withParsed({ data: [] }, (ctx, params: SemanticTokensParams) => {
            return provideSemanticTokens(ctx.sourceFile, ctx.document, ctx.scopeManager);
        }),

        semanticTokensDelta: withParsed({ edits: [] }, (ctx, params: SemanticTokensDeltaParams) => {
            return provideSemanticTokensEdits(ctx.sourceFile, ctx.document, params.previousResultId, ctx.scopeManager);
        })
    };
}
