/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as path from 'path';
import {
    workspace, window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri,
    TextDocumentContentProvider, EventEmitter, Event, RelativePattern
} from 'vscode';

import {
    LanguageClient, LanguageClientOptions, TransportKind
} from 'vscode-languageclient/node';
import { cleanupTempFiles } from './tallyClient';
import { updatePanelVariables } from './features/xmlVariables';
import { registerCommands } from './commands';

class BaseTDLDocumentProvider implements TextDocumentContentProvider {
    onDidChangeEmitter = new EventEmitter<Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    provideTextDocumentContent(uri: Uri): string {
        return `/* 
 * This is a Base TDL definition.
 * 
 * The source file is physically located in the Tally installation directory.
 * It is loaded directly into the TDL cache for lightning-fast autocomplete and validation.
 * 
 * We do not load the source code here to reduce the memory footprint of the extension.
 */
`;
    }
}

let defaultClient: LanguageClient;
const clients = new Map<string, LanguageClient>();
let nextDebugPort = 6009;

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
    // Register basetdl virtual document provider
    context.subscriptions.push(
        workspace.registerTextDocumentContentProvider('basetdl', new BaseTDLDocumentProvider())
    );

    const module = context.asAbsolutePath(path.join('dist', 'server.js'));
    const outputChannel: OutputChannel = window.createOutputChannel('tally-tdl-server');

    function didOpenTextDocument(document: TextDocument): void {
        if (document.uri.scheme === 'basetdl') return; // Handled by our virtual document provider

        if ((document.languageId !== 'tdl' && document.languageId !== 'xml') || (document.uri.scheme !== 'file' && document.uri.scheme !== 'untitled')) {
            return;
        }
        
        outputChannel.appendLine(`[Extension] didOpenTextDocument triggered for: ${document.uri.toString()} (Language: ${document.languageId})`);

        const uri = document.uri;
        if (uri.scheme === 'untitled' && !defaultClient) {
            const serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: { 
                    module, 
                    transport: TransportKind.ipc,
                    options: { execArgv: ['--nolazy', `--inspect=${nextDebugPort++}`] }
                }
            };
            const clientOptions: LanguageClientOptions = {
                documentSelector: [
                    { scheme: 'untitled', language: 'tdl' },
                    { scheme: 'untitled', language: 'xml' }
                ],
                diagnosticCollectionName: 'tally-tdl-server',
                outputChannel: outputChannel,
                synchronize: {
                    configurationSection: 'tallyTDL'
                }
            };
            defaultClient = new LanguageClient('tally-tdl-server', 'Tally TDL Language Server', serverOptions, clientOptions);
            defaultClient.start();
            return;
        }
        
        let folder = workspace.getWorkspaceFolder(uri);
        if (!folder && uri.scheme === 'file') {
            const dir = path.dirname(uri.fsPath);
            folder = { uri: Uri.file(dir), name: path.basename(dir), index: -1 };
        }
        
        if (!folder) {
            return;
        }
        folder = getOuterMostWorkspaceFolder(folder);

        if (!clients.has(folder.uri.toString())) {
            const serverOptions = {
                run: { module, transport: TransportKind.ipc },
                debug: { 
                    module, 
                    transport: TransportKind.ipc,
                    options: { execArgv: ['--nolazy', `--inspect=${nextDebugPort++}`] }
                }
            };
            const clientOptions: LanguageClientOptions = {
                documentSelector: [
                    { scheme: 'file', language: 'tdl', pattern: new (RelativePattern as any)(folder.uri, '**/*') },
                    { scheme: 'file', language: 'xml', pattern: new (RelativePattern as any)(folder.uri, '**/*.xml') },
                    { scheme: 'file', language: 'xml', pattern: new (RelativePattern as any)(folder.uri, '**/*.tdlxml') }
                ],
                diagnosticCollectionName: 'tally-tdl-server',
                workspaceFolder: folder,
                outputChannel: outputChannel,
                synchronize: {
                    configurationSection: 'tallyTDL'
                }
            };
            const client = new LanguageClient('tally-tdl-server', 'Tally TDL Language Server', serverOptions, clientOptions);
            client.start();
            clients.set(folder.uri.toString(), client);
        }
    }

    workspace.onDidOpenTextDocument(didOpenTextDocument);
    workspace.textDocuments.forEach(didOpenTextDocument);

    // Eagerly start clients for all workspace folders so scanning begins immediately
    if (workspace.workspaceFolders) {
        for (const folder of workspace.workspaceFolders) {
            const outerFolder = getOuterMostWorkspaceFolder(folder);
            if (!clients.has(outerFolder.uri.toString())) {
                const serverOptions = {
                    run: { module, transport: TransportKind.ipc },
                    debug: { 
                        module, 
                        transport: TransportKind.ipc,
                        options: { execArgv: ['--nolazy', `--inspect=${nextDebugPort++}`] }
                    }
                };
                const clientOptions: LanguageClientOptions = {
                    documentSelector: [
                        { scheme: 'file', language: 'tdl', pattern: new (RelativePattern as any)(outerFolder.uri, '**/*') },
                        { scheme: 'file', language: 'xml', pattern: new (RelativePattern as any)(outerFolder.uri, '**/*.xml') },
                        { scheme: 'file', language: 'xml', pattern: new (RelativePattern as any)(outerFolder.uri, '**/*.tdlxml') }
                    ],
                    diagnosticCollectionName: 'tally-tdl-server',
                    workspaceFolder: outerFolder,
                    outputChannel: outputChannel,
                    synchronize: {
                        configurationSection: 'tallyTDL'
                    }
                };
                const client = new LanguageClient('tally-tdl-server', 'Tally TDL Language Server', serverOptions, clientOptions);
                client.start();
                clients.set(outerFolder.uri.toString(), client);
            }
        }
    }

    workspace.onDidChangeWorkspaceFolders((event) => {
        for (const folder of event.removed) {
            const client = clients.get(folder.uri.toString());
            if (client) {
                clients.delete(folder.uri.toString());
                client.stop();
            }
        }
    });

    let xmlUpdateTimeout: NodeJS.Timeout | undefined;

    workspace.onDidChangeTextDocument(e => {
        if (window.activeTextEditor && e.document === window.activeTextEditor.document && e.document.languageId === 'xml') {
            if (xmlUpdateTimeout) clearTimeout(xmlUpdateTimeout);
            xmlUpdateTimeout = setTimeout(() => {
                updatePanelVariables(e.document, context);
            }, 300);
        }
    });

    window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'xml') {
            updatePanelVariables(editor.document, context);
        }
    });

    const restartServers = async () => {
        const promises: Thenable<void>[] = [];
        if (defaultClient) {
            promises.push(defaultClient.stop());
            (defaultClient as any) = undefined;
        }
        for (const client of clients.values()) {
            promises.push(client.stop());
        }
        clients.clear();
        await Promise.all(promises);
        
        window.showInformationMessage('Tally TDL Language Server restarted.');
        workspace.textDocuments.forEach(didOpenTextDocument);
    };

    registerCommands(
        context,
        outputChannel,
        () => defaultClient,
        () => clients,
        getOuterMostWorkspaceFolder,
        restartServers
    );
}

export function deactivate(): Thenable<void> {
    cleanupTempFiles();
    const promises: Thenable<void>[] = [];
    if (defaultClient) {
        promises.push(defaultClient.stop());
    }
    for (const client of clients.values()) {
        promises.push(client.stop());
    }
    return Promise.all(promises).then(() => undefined);
}
