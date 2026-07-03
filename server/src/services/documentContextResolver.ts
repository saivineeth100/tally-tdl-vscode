import { Position } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile } from '../core/ast/ast';
import { ScopeManager } from '../semantics/scopeManager';
import { DocumentRepository } from '../ports/documentRepository';
import { DocumentStateStore } from './documentStateStore';
import { IncludeGraphManager } from './includeGraphManager';
import { normalizeUri } from '../utils/uri';

export interface OpenDocumentContext {
    uri: string;
    document: TextDocument;
}

export interface ParsedDocumentContext extends OpenDocumentContext {
    sourceFile: SourceFile;
    scopeManager: ScopeManager;
    projectNodes: Set<string>;
}

export interface PositionedDocumentContext extends ParsedDocumentContext {
    position: Position;
    offset: number;
}

/**
 * Eliminates repeated combinations of document lookup, parsed-state lookup, 
 * source-file checks, URI normalization, scope-manager selection, 
 * position-to-offset conversion, and project-node resolution.
 */
export class DocumentContextResolver {
    constructor(
        public documents: DocumentRepository,
        public stateStore: DocumentStateStore,
        public graphManager: IncludeGraphManager
    ) {}

    /**
     * Resolves an open document context. Returns undefined if the document is not open.
     */
    resolveOpen(uri: string): OpenDocumentContext | undefined {
        const normUri = normalizeUri(uri);
        const document = this.documents.get(normUri) || this.documents.get(uri);
        if (!document) {
            return undefined;
        }
        return { uri: normUri, document };
    }

    /**
     * Resolves a parsed document context, ensuring the AST and scope are available.
     */
    resolveParsed(uri: string): ParsedDocumentContext | undefined {
        const openCtx = this.resolveOpen(uri);
        if (!openCtx) return undefined;

        const docState = this.stateStore.get(openCtx.uri);
        if (!docState || !docState.sourceFile) {
            return undefined;
        }

        return {
            ...openCtx,
            document: docState.document || openCtx.document,
            sourceFile: docState.sourceFile,
            scopeManager: this.stateStore.getScopeManager(openCtx.uri),
            projectNodes: this.graphManager.getProjectNodes(openCtx.uri) || new Set<string>()
        };
    }

    /**
     * Resolves a positioned context, converting the Position to an offset.
     */
    resolveAtPosition(uri: string, position: Position): PositionedDocumentContext | undefined {
        const parsedCtx = this.resolveParsed(uri);
        if (!parsedCtx) return undefined;

        const offset = parsedCtx.document.offsetAt(position);
        
        return {
            ...parsedCtx,
            position,
            offset
        };
    }
}
