import { Connection, Diagnostic } from 'vscode-languageserver/node';
import { DiagnosticPublisher } from '../ports/diagnosticPublisher';

export class LspDiagnosticPublisher implements DiagnosticPublisher {
    constructor(private connection: Connection) {}

    publish(uri: string, diagnostics: Diagnostic[]): void {
        this.connection.sendDiagnostics({ uri, diagnostics });
    }
}
