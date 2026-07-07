import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { normalizeUri } from '../utils';

/**
 * Provides file decorations (badges, colors) in the VS Code explorer tree.
 * Decorates files that are NOT part of the active .tpj include graph.
 */
export class TdlFileDecorationProvider implements vscode.FileDecorationProvider {
    private activeUris: Set<string> = new Set();
    private activeUrisLower: Set<string> = new Set();
    private _onDidChangeFileDecorations: vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined> = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
    
    readonly onDidChangeFileDecorations: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> = this._onDidChangeFileDecorations.event;

    constructor(private client: LanguageClient) {
        // Listen for the custom active URIs notification from the language server
        this.client.onNotification('tdl/activeUrisChanged', (params: { activeUris: string[] }) => {
            this.activeUris.clear();
            this.activeUrisLower.clear();
            for (const u of params.activeUris) {
                const norm = normalizeUri(u);
                this.activeUris.add(norm);
                this.activeUrisLower.add(norm.toLowerCase());
            }
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

        const normUri = normalizeUri(uri.toString());

        // 1. Fast O(1) exact-casing lookup
        if (this.activeUris.has(normUri)) {
            return undefined;
        }

        // 2. Fast O(1) case-insensitive fallback lookup
        if (this.activeUrisLower.has(normUri.toLowerCase())) {
            return undefined;
        }

        // If the file is NOT in the active URIs list, it's a loose inactive workspace file
        return {
            badge: 'I',
            tooltip: 'This file is inactive because it is not included in any active .tpj project.',
            color: new vscode.ThemeColor('descriptionForeground') // Grayed out color
        };
    }
}
