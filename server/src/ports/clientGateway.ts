import { WorkspaceFolder } from 'vscode-languageserver';

/**
 * Contains all server-to-client effects currently performed through the LSP Connection.
 * Feature services receive this gateway only when they genuinely produce client effects.
 * Read-only feature requests must not depend on it.
 */
export interface ClientGateway {
    /**
     * Sends a custom notification to the client.
     */
    notify<T>(method: string, params: T): void;
    showInformationMessage(message: string): void;
    showErrorMessage(message: string): void;
    refreshSemanticTokens(): Promise<void> | void;
    getConfiguration<T>(section: string): Promise<T | undefined>;
    getWorkspaceFolders(): Promise<WorkspaceFolder[] | null>;
}
