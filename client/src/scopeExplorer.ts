import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as path from 'path';
import * as fs from 'fs';

export class ScopeExplorer {
    public static async show(client: LanguageClient, uri: string, context: vscode.ExtensionContext) {
        const scopeTree = await client.sendRequest<any>('tdl/getScopeTreeDebug', { uri });

        const panel = vscode.window.createWebviewPanel(
            'scopeExplorer',
            `Scope Explorer`,
            vscode.ViewColumn.Two,
            { 
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'client', 'media'))]
            }
        );

        panel.webview.html = this.getHtmlForWebview(panel.webview, context.extensionPath);
        
        // Send data to the webview
        panel.webview.postMessage({ command: 'render', data: scopeTree });

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async message => {
                switch (message.command) {
                    case 'goToDefinition':
                        vscode.commands.executeCommand('tdl.goToDefinition', message.text);
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
                }
            },
            undefined,
            context.subscriptions
        );
    }

    private static getHtmlForWebview(webview: vscode.Webview, extensionPath: string): string {
        const htmlPath = path.join(extensionPath, 'client', 'media', 'scopeExplorer', 'index.html');
        let html = fs.readFileSync(htmlPath, 'utf8');

        const stylePathOnDisk = vscode.Uri.file(path.join(extensionPath, 'client', 'media', 'scopeExplorer', 'style.css'));
        const scriptPathOnDisk = vscode.Uri.file(path.join(extensionPath, 'client', 'media', 'scopeExplorer', 'main.js'));

        const styleUri = webview.asWebviewUri(stylePathOnDisk);
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

        // Inject URIs
        html = html.replace('{{styleUri}}', styleUri.toString());
        html = html.replace('{{scriptUri}}', scriptUri.toString());

        return html;
    }
}
