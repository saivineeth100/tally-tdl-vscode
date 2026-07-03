import { Diagnostic } from 'vscode-languageserver';

/**
 * Owns only diagnostic publication to decouple feature validation from the LSP Connection.
 */
export interface DiagnosticPublisher {
    publish(uri: string, diagnostics: Diagnostic[]): void;
}
