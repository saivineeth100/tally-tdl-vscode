import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { DocumentRepository } from '../ports/documentRepository';
import { FileAccess } from '../ports/fileAccess';
import { normalizeUri } from '../utils/uri';

/**
 * Returns an open document when available and otherwise reads it through FileAccess,
 * detects the appropriate language identifier, and creates a temporary TextDocument.
 * Used by definition, references, rename, workspace symbols, and code-lens resolution.
 */
export class DocumentLoader {
    constructor(
        private documents: DocumentRepository,
        private fileAccess: FileAccess
    ) {}

    /**
     * Loads a document from the open workspace or reads it from disk.
     * If reading from disk, the document version is set to 0.
     */
    async loadDocument(uri: string): Promise<TextDocument | undefined> {
        const normUri = normalizeUri(uri);
        
        // 1. Check open documents
        const openDoc = this.documents.get(normUri) || this.documents.get(uri);
        if (openDoc) {
            return openDoc;
        }

        // 2. Read from disk
        try {
            const fsPath = URI.parse(uri).fsPath;
            if (await this.fileAccess.exists(fsPath)) {
                const content = await this.fileAccess.readFile(fsPath, 'utf-16le');
                
                let languageId = 'tally';
                const lowerPath = fsPath.toLowerCase();
                if (lowerPath.endsWith('.xml') || lowerPath.endsWith('.tdlxml')) {
                    languageId = 'xml';
                }
                
                return TextDocument.create(uri, languageId, 0, content);
            }
        } catch {
            return undefined;
        }

        return undefined;
    }
}
