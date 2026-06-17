import { DocumentHighlightParams, DocumentHighlight, DocumentHighlightKind, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager } from '../docManager';
import { findReferences } from './references';

export async function getDocumentHighlights(
    params: DocumentHighlightParams,
    docManager: DocManager,
    docs: TextDocuments<TextDocument>
): Promise<DocumentHighlight[]> {
    const uri = params.textDocument.uri;
    const doc = docs.get(uri);
    if (!doc) return [];

    const offset = doc.offsetAt(params.position);
    
    // Use findReferences but filter for the current document only
    const locations = await findReferences(docManager, docs, uri, offset, true);
    
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
