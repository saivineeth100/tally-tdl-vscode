import * as vscode from 'vscode';

export class ResponsePanel {
    public static currentPanel: ResponsePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _sourceUri?: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    
    // Callbacks
    public onDidSendRequest?: (variables: Map<string, string>) => void;
    public onDidSaveDefault?: (varName: string, value: string) => void;
    public onDidRefresh?: () => void;
    public onDidLogError?: (errorMsg: string, stack: string) => void;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, sourceUri?: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._sourceUri = sourceUri;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'send':
                        if (this.onDidSendRequest) {
                            const vars = new Map<string, string>();
                            for (const [k, v] of Object.entries(message.variables)) {
                                vars.set(k, v as string);
                            }
                            this.onDidSendRequest(vars);
                        }
                        return;
                    case 'refresh':
                        if (this.onDidRefresh) {
                            this.onDidRefresh();
                        }
                        return;
                    case 'saveDefault':
                        if (this.onDidSaveDefault) {
                            this.onDidSaveDefault(message.varName, message.value);
                        }
                        return;
                    case 'openInEditor':
                        // If we have a source file URI, use it. Otherwise, use an untitled file.
                        const uri = this._sourceUri || vscode.Uri.parse('untitled:' + 'Tally Response.xml');
                        vscode.workspace.openTextDocument(uri).then(doc => {
                            vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Active }).then(editor => {
                                
                                const performSearch = () => {
                                    if (message.searchString) {
                                        const text = doc.getText();
                                        let searchStr = message.searchString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
                                        let index = text.indexOf(searchStr);
                                        
                                        if (index === -1) {
                                            index = text.indexOf(message.searchString);
                                        }
                                        
                                        if (index !== -1) {
                                            const position = doc.positionAt(index);
                                            editor.selection = new vscode.Selection(position, position);
                                            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                                        }
                                    }
                                };

                                // Only overwrite if it's an untitled response file AND content differs.
                                // If it's a real file, NEVER overwrite its contents!
                                if (!this._sourceUri && doc.getText() !== message.content) {
                                    editor.edit(editBuilder => {
                                        const fullRange = new vscode.Range(
                                            doc.positionAt(0),
                                            doc.positionAt(doc.getText().length)
                                        );
                                        editBuilder.replace(fullRange, message.content);
                                    }).then(() => {
                                        vscode.languages.setTextDocumentLanguage(doc, message.language).then(() => {
                                            performSearch();
                                        });
                                    });
                                } else {
                                    performSearch();
                                }
                            });
                        });
                        return;
                    case 'viewAsTable':
                        if (this._sourceUri) {
                            vscode.commands.executeCommand('tally-tdl.viewXmlAsTable', this._sourceUri);
                        } else {
                            vscode.commands.executeCommand('tally-tdl.viewXmlAsTable', message.content);
                        }
                        return;
                    case 'showError':
                        vscode.window.showErrorMessage(message.message);
                        return;
                    case 'logError':
                        if (this.onDidLogError) {
                            this.onDidLogError(message.message, message.stack);
                        }
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri): ResponsePanel {
        const column = vscode.ViewColumn.Beside;

        if (ResponsePanel.currentPanel) {
            ResponsePanel.currentPanel._panel.reveal(column);
            return ResponsePanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            'tallyResponse',
            'Tally XML Response',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.file(require('os').tmpdir())
                ]
            }
        );

        ResponsePanel.currentPanel = new ResponsePanel(panel, extensionUri);
        ResponsePanel.currentPanel._panel.webview.html = ResponsePanel.currentPanel._getHtmlForWebview(false);
        return ResponsePanel.currentPanel;
    }

    public static createFullScreenTable(extensionUri: vscode.Uri, xmlContent: string, sourceUri?: vscode.Uri): ResponsePanel {
        const panel = vscode.window.createWebviewPanel(
            'tallyResponseFull',
            'Tally Table View',
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(extensionUri, 'media'),
                    vscode.Uri.file(require('os').tmpdir())
                ]
            }
        );

        const responsePanel = new ResponsePanel(panel, extensionUri, sourceUri);
        panel.webview.html = responsePanel._getHtmlForWebview(true);
        
        // Wait briefly for webview to load then send the data
        setTimeout(() => {
            responsePanel.showResponse(xmlContent, '', 0);
        }, 300);
        
        return responsePanel;
    }

    public updateVariables(variables: string[], savedValues: Map<string, { value: string, isWorkspace: boolean }>, variableTypes: Record<string, string>, activeCompanies: string[]) {
        const varsObj: Record<string, { value: string, isWorkspace: boolean }> = {};
        for (const v of variables) {
            varsObj[v] = savedValues.get(v) || { value: '', isWorkspace: false };
        }
        
        this._panel.webview.postMessage({
            command: 'updateVariables',
            variables: varsObj,
            types: variableTypes || {},
            companies: activeCompanies || []
        });
    }

    public setStatus(status: 'idle' | 'loading' | 'success' | 'error', message?: string) {
        this._panel.webview.postMessage({
            command: 'setStatus',
            status,
            message
        });
    }

    public showResponse(filePathOrXml: string, prettyXml: string, elapsedMs: number) {
        // If it starts with <, it's raw XML string. Otherwise, it's a file path.
        const isFilePath = !filePathOrXml.trim().startsWith('<');
        
        let fileUrl: string | undefined = undefined;
        if (isFilePath) {
            const uri = vscode.Uri.file(filePathOrXml);
            this._sourceUri = uri; // Set sourceUri to the temp file
            fileUrl = this._panel.webview.asWebviewUri(uri).toString();
        } else {
            this._sourceUri = undefined;
        }

        this._panel.webview.postMessage({
            command: 'showResponse',
            xml: !isFilePath ? filePathOrXml : undefined,
            fileUrl: fileUrl,
            prettyXml,
            elapsedMs
        });
    }

    public dispose() {
        // If this is the main panel, clear the reference
        if (ResponsePanel.currentPanel === this) {
            ResponsePanel.currentPanel = undefined;
        }
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(isFullScreen: boolean): string {
        const htmlPath = vscode.Uri.joinPath(this._extensionUri, 'media', 'webview.html');
        let htmlContent = '';
        try {
            const fs = require('fs');
            htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');
        } catch (err) {
            return `<!DOCTYPE html><html><body>Error loading webview HTML: ${err}</body></html>`;
        }

        const saxUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'sax.js'));
        const scriptUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'webview.js'));
        const styleUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'webview.css'));

        htmlContent = htmlContent.replace('##STYLE_URI##', styleUri.toString());
        
        // Let's replace ##SCRIPT_URI## with the actual script tags
        const scriptTags = `<script src="${saxUri.toString()}"></script>\n    <script src="${scriptUri.toString()}"></script>`;
        htmlContent = htmlContent.replace('##SCRIPT_URI##', scriptTags);

        // We can pass the isFullScreen flag to the body class
        if (isFullScreen) {
            htmlContent = htmlContent.replace('<body>', '<body class="fullscreen-mode">');
        }

        return htmlContent;
    }
}
