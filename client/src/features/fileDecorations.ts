import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';

/**
 * Provides file decorations (badges, colors) in the VS Code explorer tree.
 * Decorates files that are NOT part of the active .tpj include graph.
 */
export class TdlFileDecorationProvider implements vscode.FileDecorationProvider {
    private activeUris: Set<string> = new Set();
    private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    
    readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> = this._onDidChangeFileDecorations.event;

    constructor(private client: LanguageClient) {
        // Listen for the custom active URIs notification from the language server
        this.client.onNotification('tdl/activeUrisChanged', (params: { activeUris: string[] }) => {
            this.activeUris = new Set(params.activeUris);
            // Refresh all file decorations
            this._onDidChangeFileDecorations.fire(undefined);
        });
    }

    provideFileDecoration(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<vscode.FileDecoration> {
        // Only decorate local TDL or TXT files
        if (uri.scheme !== 'file') return undefined;
        const ext = uri.fsPath.toLowerCase();
        if (!ext.endsWith('.tdl') && !ext.endsWith('.txt') && !ext.endsWith('.tdlxml') && !ext.endsWith('.dat')) {
            return undefined;
        }

        // If the file is NOT in the active URIs list, it's a loose inactive workspace file
        if (!this.activeUris.has(uri.toString())) {
            return {
                badge: 'Inactive',
                tooltip: 'This file is inactive because it is not included in any active .tpj project.',
                color: new vscode.ThemeColor('descriptionForeground') // Grayed out color
            };
        }

        return undefined; // No decoration for active files
    }
}
