import { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * Owns access to open LSP documents without exposing handler registration.
 * Document lifecycle events are passed explicitly to DocumentLifecycleService
 * and are not part of this read interface.
 */
export interface DocumentRepository {
    /**
     * Retrieves an open document by its URI.
     */
    get(uri: string): TextDocument | undefined;

    /**
     * Retrieves all currently open documents.
     */
    all(): readonly TextDocument[];
}
