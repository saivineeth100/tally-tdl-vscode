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
