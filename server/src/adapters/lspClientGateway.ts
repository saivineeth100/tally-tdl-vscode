import { Connection, WorkspaceFolder } from 'vscode-languageserver/node';
import { ClientGateway } from '../ports/clientGateway';

export class LspClientGateway implements ClientGateway {
    constructor(private connection: Connection) {}

    notify<T>(method: string, params: T): void {
        this.connection.sendNotification(method, params);
    }

    showInformationMessage(message: string): void {
        this.connection.window.showInformationMessage(message);
    }

    showErrorMessage(message: string): void {
        this.connection.window.showErrorMessage(message);
    }

    refreshSemanticTokens(): Promise<void> | void {
        return this.connection.languages.semanticTokens.refresh();
    }

    getConfiguration<T>(section: string): Promise<T | undefined> {
        return this.connection.workspace.getConfiguration(section);
    }

    getWorkspaceFolders(): Promise<WorkspaceFolder[] | null> {
        return this.connection.workspace.getWorkspaceFolders();
    }
}
