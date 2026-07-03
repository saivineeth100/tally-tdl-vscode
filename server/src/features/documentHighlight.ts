import { DocumentHighlightParams, DocumentHighlight, DocumentHighlightKind, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentStateStore } from '../services/documentStateStore';
import { DocumentRepository } from '../ports/documentRepository';
import { findReferences } from './references';
import { DocumentLoader } from '../services/documentLoader';
import { IncludeGraphManager } from '../services/includeGraphManager';

export async function getDocumentHighlights(
    params: DocumentHighlightParams,
    stateStore: DocumentStateStore,
    docs: DocumentRepository,
    documentLoader: DocumentLoader,
    includeGraphManager: IncludeGraphManager
): Promise<DocumentHighlight[]> {
    const uri = params.textDocument.uri;
    const doc = docs.get(uri);
    if (!doc) return [];

    const offset = doc.offsetAt(params.position);
    
    // Use findReferences but filter for the current document only
    const locations = await findReferences(stateStore, docs, documentLoader, includeGraphManager, uri, offset, true, uri);
    
    const highlights: DocumentHighlight[] = [];
    
    for (const loc of locations) {
        if (loc.uri === uri) {
            highlights.push({
                range: loc.range,
                kind: DocumentHighlightKind.Text
            });
        }
    }
    
    return highlights;
}
