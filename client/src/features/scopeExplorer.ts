import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as path from 'path';

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export class ScopeExplorer {
    public static async show(client: LanguageClient, uri: string, context: vscode.ExtensionContext) {
        const scopeTree = await client.sendRequest<any>('tdl/getScopeTreeDebug', { uri });

        const panel = vscode.window.createWebviewPanel(
            'scopeExplorer',
            `Scope Explorer`,
            vscode.ViewColumn.Active,
            { 
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'client', 'media')),
                    vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview-ui'))
                ]
            }
        );

        panel.webview.html = this.getHtmlForWebview(panel.webview, context.extensionPath);
        
        // We will send data to the webview when it sends the 'ready' command

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'ready':
                        panel.webview.postMessage({ command: 'render', data: scopeTree });
                        return;
                    case 'goToDefinition':
                        try {
                            let targetUri: string | undefined = message.uri;
                            let targetStart = message.start;
                            let targetEnd = message.end;

                            if (!targetUri && message.name && message.expectedType) {
                                // Resolve definition using server
                                const resolved = await client.sendRequest<any>('tdl/resolveGlobalSymbol', {
                                    uri,
                                    name: message.name,
                                    expectedType: message.expectedType
                                });
                                if (resolved && resolved.uri) {
                                    targetUri = resolved.uri;
                                    targetStart = resolved.start;
                                    targetEnd = resolved.end;
                                }
                            }

                            if (targetUri) {
                                const docUri = vscode.Uri.parse(targetUri);
                                const doc = await vscode.workspace.openTextDocument(docUri);
                                const editor = await vscode.window.showTextDocument(doc);
                                if (targetStart !== undefined && targetEnd !== undefined) {
                                    const startPos = doc.positionAt(targetStart);
                                    const endPos = doc.positionAt(targetEnd);
                                    const range = new vscode.Range(startPos, endPos);
                                    editor.selection = new vscode.Selection(startPos, endPos);
                                    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
                                }
                            }
                        } catch (err) {
                            console.error('Error navigating to definition:', err);
                        }
                        return;
                    case 'getSymbols':
                        try {
                            const result = await client.sendRequest<any>('tdl/getScopeSymbols', {
                                uri,
                                scopeId: message.scopeId,
                                kind: message.kind,
                                page: message.page,
                                limit: message.limit,
                                query: message.query
                            });
                            panel.webview.postMessage({ 
                                command: 'symbolsResult', 
                                data: result,
                                reqId: message.reqId 
                            });
                        } catch (err) {
                            console.error('Error fetching symbols:', err);
                        }
                        return;
                    case 'getChildren':
                        try {
                            const result = await client.sendRequest<any>('tdl/getScopeChildren', {
                                uri,
                                scopeId: message.scopeId
                            });
                            panel.webview.postMessage({
                                command: 'childrenResult',
                                scopeId: message.scopeId,
                                children: result
                            });
                        } catch (err) {
                            console.error('Error fetching children:', err);
                        }
                        return;
                    case 'getScopeNode':
                        try {
                            const result = await client.sendRequest<any>('tdl/getScopeNode', {
                                uri,
                                scopeId: message.scopeId
                            });
                            panel.webview.postMessage({
                                command: 'scopeNodeResult',
                                reqId: message.reqId,
                                data: result
                            });
                        } catch (err) {
                            console.error('Error fetching scope node:', err);
                        }
                        return;
                    case 'getScopeDetails':
                        try {
                            const result = await client.sendRequest<any>('tdl/getScopeDetails', {
                                uri,
                                scopeId: message.scopeId
                            });
                            panel.webview.postMessage({
                                command: 'scopeDetailsResult',
                                reqId: message.reqId,
                                data: result
                            });
                        } catch (err) {
                            console.error('Error fetching scope details:', err);
                        }
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    }

    private static getHtmlForWebview(webview: vscode.Webview, extensionPath: string): string {
        const stylePathOnDisk = vscode.Uri.file(path.join(extensionPath, 'dist', 'webview-ui', 'assets', 'index.css'));
        const scriptPathOnDisk = vscode.Uri.file(path.join(extensionPath, 'dist', 'webview-ui', 'assets', 'index.js'));

        const styleUri = webview.asWebviewUri(stylePathOnDisk).with({ query: `t=${Date.now()}` });
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk).with({ query: `t=${Date.now()}` });

        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                    Use a content security policy to only allow loading styles from our extension directory,
                    and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Scope Explorer</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}">
                    window.__INITIAL_VIEW__ = 'scopeExplorer';
                </script>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
