/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as path from 'path';
import {
    workspace, window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri, commands
} from 'vscode';

import {
    LanguageClient, LanguageClientOptions, TransportKind
} from 'vscode-languageclient/node';
import { spawn } from 'child_process';

let defaultClient: LanguageClient;
const clients = new Map<string, LanguageClient>();

let _sortedWorkspaceFolders: string[] | undefined;
function sortedWorkspaceFolders(): string[] {
    if (_sortedWorkspaceFolders === void 0) {
        _sortedWorkspaceFolders = workspace.workspaceFolders ? workspace.workspaceFolders.map(folder => {
            let result = folder.uri.toString();
            if (result.charAt(result.length - 1) !== '/') {
                result = result + '/';
            }
            return result;
        }).sort(
            (a, b) => {
                return a.length - b.length;
            }
        ) : [];
    }
    return _sortedWorkspaceFolders;
}
workspace.onDidChangeWorkspaceFolders(() => _sortedWorkspaceFolders = undefined);

function getOuterMostWorkspaceFolder(folder: WorkspaceFolder): WorkspaceFolder {
    const sorted = sortedWorkspaceFolders();
    for (const element of sorted) {
        let uri = folder.uri.toString();
        if (uri.charAt(uri.length - 1) !== '/') {
            uri = uri + '/';
        }
        if (uri.startsWith(element)) {
            return workspace.getWorkspaceFolder(Uri.parse(element))!;
        }
    }
    return folder;
}

export function activate(context: ExtensionContext) {

    // Server is implemented in node
    // The server lives in server/out/server.js
    const module = context.asAbsolutePath(path.join('server', 'out', 'server.js'));
    const outputChannel: OutputChannel = window.createOutputChannel('tally-tdl-server');

    function didOpenTextDocument(document: TextDocument): void {
        // We are only interested in language mode text
        if ((document.languageId !== 'tdl' && document.languageId !== 'xml') || (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled')) {
            return;
        }

        const uri = document.uri;
        // Untitled files go to a default client.
        if (uri.scheme === 'untitled' && !defaultClient) {
            const serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: { 
                    module, 
                    transport: TransportKind.ipc,
                    options: { execArgv: ['--nolazy', '--inspect=6009'] }
                }
            };
            const clientOptions: LanguageClientOptions = {
                documentSelector: [
                    { scheme: 'untitled', language: 'tdl' },
                    { scheme: 'untitled', language: 'xml' }
                ],
                diagnosticCollectionName: 'tally-tdl-server',
                outputChannel: outputChannel
            };
            defaultClient = new LanguageClient('tally-tdl-server', 'Tally TDL Language Server', serverOptions, clientOptions);
            defaultClient.start();
            return;
        }
        
        let folder = workspace.getWorkspaceFolder(uri);
        // Files outside a folder get their own client scoped to their directory
        if (!folder && uri.scheme === 'file') {
            const dir = path.dirname(uri.fsPath);
            folder = { uri: Uri.file(dir), name: path.basename(dir), index: -1 };
        }
        
        if (!folder) {
            return;
        }
        // If we have nested workspace folders we only start a server on the outer most workspace folder.
        folder = getOuterMostWorkspaceFolder(folder);

        if (!clients.has(folder.uri.toString())) {
            const serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: { 
                    module, 
                    transport: TransportKind.ipc,
                    options: { execArgv: ['--nolazy', '--inspect=6009'] }
                }
            };
            const clientOptions: LanguageClientOptions = {
                documentSelector: [
                    { scheme: 'file', language: 'tdl', pattern: `${folder.uri.fsPath}/**/*` },
                    { scheme: 'file', language: 'xml', pattern: `${folder.uri.fsPath}/**/*.xml` },
                    { scheme: 'file', language: 'xml', pattern: `${folder.uri.fsPath}/**/*.tdlxml` }
                ],
                diagnosticCollectionName: 'tally-tdl-server',
                workspaceFolder: folder,
                outputChannel: outputChannel
            };
            const client = new LanguageClient('tally-tdl-server', 'Tally TDL Language Server', serverOptions, clientOptions);
            client.start();
            clients.set(folder.uri.toString(), client);
        }
    }

    workspace.onDidOpenTextDocument(didOpenTextDocument);
    workspace.textDocuments.forEach(didOpenTextDocument);
    workspace.onDidChangeWorkspaceFolders((event) => {
        for (const folder of event.removed) {
            const client = clients.get(folder.uri.toString());
            if (client) {
                clients.delete(folder.uri.toString());
                client.stop();
            }
        }
    });

    context.subscriptions.push(
        commands.registerCommand('tally-tdl.runCurrentFile', () => {
            const editor = window.activeTextEditor;
            if (!editor) {
                window.showErrorMessage('No active editor found.');
                return;
            }

            const document = editor.document;
            if (document.languageId !== 'tdl' && document.languageId !== 'xml') {
                window.showErrorMessage('The current file is not a TDL or XML file.');
                return;
            }

            const config = workspace.getConfiguration('tallyTDL');
            const tallyExePath = config.get<string>('tallyExePath');
            if (!tallyExePath) {
                window.showErrorMessage('Tally executable path is not configured. Please set tallyTDL.tallyExePath in settings.');
                return;
            }

            let userArgs = config.get<string[]>('tallyCommandLineArgs') || [];
            userArgs = userArgs.map(arg => arg.replace('${file}', document.uri.fsPath));

            const finalArgs = ['/TDL', document.uri.fsPath, ...userArgs];

            window.showInformationMessage(`Launching Tally with ${path.basename(document.fileName)}...`);
            const child = spawn(tallyExePath, finalArgs, { detached: true, stdio: 'ignore' });
            child.unref();
            child.on('error', (err) => {
                window.showErrorMessage(`Failed to launch Tally: ${err.message}`);
            });
        }),
        commands.registerCommand('tally-tdl.convertToXml', async () => {
            const editor = window.activeTextEditor;
            if (!editor) {
                window.showErrorMessage('No active editor found.');
                return;
            }

            const document = editor.document;
            if (document.languageId !== 'tdl' && document.languageId !== 'xml') {
                window.showErrorMessage('The current file is not a TDL or XML file.');
                return;
            }

            // Find the appropriate client for the current file
            let client = defaultClient;
            const folder = workspace.getWorkspaceFolder(document.uri);
            if (folder) {
                const outerFolder = getOuterMostWorkspaceFolder(folder);
                client = clients.get(outerFolder.uri.toString()) || defaultClient;
            }

            if (!client) {
                window.showErrorMessage('TDL Language Server is not running.');
                return;
            }

            try {
                // Request the server to generate XML
                const xmlString = await client.sendRequest<string>('tdl/convertToXml', { uri: document.uri.toString() });
                
                if (!xmlString) {
                    window.showErrorMessage('Failed to convert to XML.');
                    return;
                }

                // Open an untitled document with the generated XML
                const xmlDoc = await workspace.openTextDocument({ content: xmlString, language: 'xml' });
                await window.showTextDocument(xmlDoc);
            } catch (err: any) {
                window.showErrorMessage(`Error converting to XML: ${err.message}`);
            }
        })
    );
}

export function deactivate(): Thenable<void> {
    const promises: Thenable<void>[] = [];
    if (defaultClient) {
        promises.push(defaultClient.stop());
    }
    for (const client of clients.values()) {
        promises.push(client.stop());
    }
    return Promise.all(promises).then(() => undefined);
}
