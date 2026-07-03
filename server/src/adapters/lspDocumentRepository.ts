import { TextDocuments } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentRepository } from '../ports/documentRepository';

export class LspDocumentRepository implements DocumentRepository {
    constructor(private documents: TextDocuments<TextDocument>) {}

    get(uri: string): TextDocument | undefined {
        return this.documents.get(uri);
    }

    all(): readonly TextDocument[] {
        return this.documents.all();
    }
}
