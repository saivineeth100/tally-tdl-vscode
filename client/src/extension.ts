/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import * as path from 'path';
import {
    workspace, window, ExtensionContext, TextDocument, OutputChannel, WorkspaceFolder, Uri, commands, TextEdit
} from 'vscode';

import {
    LanguageClient, LanguageClientOptions, TransportKind
} from 'vscode-languageclient/node';
import { spawn } from 'child_process';
import { setupTallyPath, setupOdbcPort } from './onboarding';
import { ResponsePanel } from './responsePanel';
import { extractVariables, extractVariableTags, substituteVariables } from './templateEngine';
import { sendXmlRequest, checkTallyRunning, launchTallyAndWait, fetchActiveCompanies, cleanupTempFiles } from './tallyClient';

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
                    options: { execArgv: ['--nolazy', `--inspect=${nextDebugPort++}`] }
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
                    options: { execArgv: ['--nolazy', `--inspect=${nextDebugPort++}`] }
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

    // Helper to get stored variables
    function getStoredVariables(documentUri: Uri, varNames: string[]): Map<string, { value: string, isWorkspace: boolean }> {
        const result = new Map<string, { value: string, isWorkspace: boolean }>();
        const fileKeyPrefix = `xmlVars:${documentUri.toString()}:`;
        const workspaceKeyPrefix = `xmlVars:workspace:`;

        for (const name of varNames) {
            // Check file specific first (workspaceState)
            let value = context.workspaceState.get<string>(fileKeyPrefix + name);
            if (value !== undefined) {
                result.set(name, { value, isWorkspace: false });
                continue;
            }

            // Fallback to workspace/global default
            value = context.globalState.get<string>(workspaceKeyPrefix + name);
            if (value !== undefined) {
                result.set(name, { value, isWorkspace: true });
                continue;
            }

            // No value found
            result.set(name, { value: '', isWorkspace: false });
        }
        return result;
    }
    
    // Auto-update variables when XML file changes
    const updatePanelVariables = async (document: TextDocument) => {
        if (ResponsePanel.currentPanel && document.languageId === 'xml') {
            const text = document.getText();
            const variables = extractVariables(text);
            const variableTags = extractVariableTags(text);
            const storedVars = getStoredVariables(document.uri, variables);
            
            const config = workspace.getConfiguration('tallyTDL');
            const port = config.get<number>('tallyPort') || 9000;
            const variableTypes = { ...config.get<Record<string, string>>('variableTypes') || {} };
            
            // Auto-assign types based on enclosing XML tag or variable name itself
            for (const varName of variables) {
                const tag = variableTags[varName] || varName;
                const normalized = tag.toUpperCase().replace(/[^A-Z0-9]/g, '');
                
                if (normalized.includes('SVCURRENTCOMPANY')) {
                    variableTypes[varName] = 'company';
                } else if (normalized.includes('SVFROM') || normalized.includes('SVTO')) {
                    variableTypes[varName] = 'date';
                }
            }
            
            let activeCompanies: string[] = [];
            if (Object.values(variableTypes).includes('company')) {
                activeCompanies = await fetchActiveCompanies(port);
            }
            
            ResponsePanel.currentPanel?.updateVariables(variables, storedVars, variableTypes, activeCompanies);
        }
    };

    let xmlUpdateTimeout: NodeJS.Timeout | undefined;

    workspace.onDidChangeTextDocument(e => {
        if (window.activeTextEditor && e.document === window.activeTextEditor.document && e.document.languageId === 'xml') {
            if (xmlUpdateTimeout) clearTimeout(xmlUpdateTimeout);
            xmlUpdateTimeout = setTimeout(() => {
                updatePanelVariables(e.document);
            }, 300);
        }
    });

    window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document.languageId === 'xml') {
            updatePanelVariables(editor.document);
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
            if (document.languageId === 'xml') {
                // Route XML files to the new request runner
                commands.executeCommand('tally-tdl.sendXmlRequest');
                return;
            }

            if (document.languageId !== 'tdl') {
                window.showErrorMessage('The current file is not a TDL file.');
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
        }),
        commands.registerCommand('tally-tdl.viewXmlAsTable', async (arg?: any) => {
            let content = '';
            
            let sourceUri: Uri | undefined;
            if (typeof arg === 'string') {
                // Invoked from webview raw tab
                content = arg;
            } else if (arg && arg.fsPath) {
                // Invoked from explorer context menu or editor title with Uri
                sourceUri = arg as Uri;
                try {
                    const fileData = await workspace.fs.readFile(sourceUri);
                    let encoding: BufferEncoding = 'utf8';
                    let offset = 0;
                    
                    if (fileData.length >= 2) {
                        if (fileData[0] === 0xFF && fileData[1] === 0xFE) {
                            encoding = 'utf16le';
                            offset = 2;
                        } else if (fileData[0] === 0x3C && fileData[1] === 0x00) {
                            encoding = 'utf16le';
                            offset = 0;
                        } else if (fileData.length >= 3 && fileData[0] === 0xEF && fileData[1] === 0xBB && fileData[2] === 0xBF) {
                            encoding = 'utf8';
                            offset = 3;
                        }
                    }
                    
                    const buffer = Buffer.from(fileData);
                    content = buffer.toString(encoding, offset);
                } catch (e) {
                    window.showErrorMessage('Failed to read XML file.');
                    return;
                }
            } else {
                // Fallback to active editor
                const editor = window.activeTextEditor;
                if (!editor || editor.document.languageId !== 'xml') {
                    window.showErrorMessage('No active XML editor found.');
                    return;
                }
                sourceUri = editor.document.uri;
                content = editor.document.getText();
            }
            
            const panel = ResponsePanel.createFullScreenTable(context.extensionUri, content, sourceUri);
            panel.onDidLogError = (errorMsg, stack) => {
                outputChannel.appendLine(`[Webview Error] ${errorMsg}`);
                if (stack) {
                    outputChannel.appendLine(stack);
                }
            };
        }),
        commands.registerCommand('tally-tdl.sendXmlRequest', async () => {
            const editor = window.activeTextEditor;
            if (!editor) {
                window.showErrorMessage('No active XML editor found.');
                return;
            }

            const document = editor.document;
            if (document.languageId !== 'xml') {
                window.showErrorMessage('The current file is not an XML file.');
                return;
            }

            const config = workspace.getConfiguration('tallyTDL');
            const port = config.get<number>('tallyPort') || 9000;
            const xmlContent = document.getText();
            const variables = extractVariables(xmlContent);

            const panel = ResponsePanel.createOrShow(context.extensionUri);

            // Wire up callbacks
            panel.onDidLogError = (errorMsg, stack) => {
                outputChannel.appendLine(`[Webview Error] ${errorMsg}`);
                if (stack) {
                    outputChannel.appendLine(stack);
                }
            };

            panel.onDidSaveDefault = async (varName: string, value: string) => {
                await context.globalState.update(`xmlVars:workspace:${varName}`, value);
                await context.workspaceState.update(`xmlVars:${document.uri.toString()}:${varName}`, undefined);
                updatePanelVariables(document);
            };
            
            panel.onDidRefresh = () => {
                updatePanelVariables(document);
            };



            const executeRequest = async (finalVars: Map<string, string>) => {
                panel.setStatus('loading', 'Checking Tally connection...');
                
                let isRunning = await checkTallyRunning(port);
                if (!isRunning) {
                    const exePath = config.get<string>('tallyExePath');
                    if (!exePath) {
                        panel.setStatus('error', 'Tally not running and tallyExePath not configured.');
                        const choice = await window.showErrorMessage('Tally is not running on port ' + port + '. Please launch Tally manually or configure Tally Path.', 'Setup Path');
                        if (choice === 'Setup Path') {
                            commands.executeCommand('tally-tdl.setupTallyPath');
                        }
                        return;
                    }

                    const launchResult = await launchTallyAndWait(exePath, port, []);
                    if (!launchResult) {
                        panel.setStatus('error', 'Failed to connect to Tally.');
                        const choice = await window.showErrorMessage('Failed to connect to Tally on port ' + port + '. Make sure ODBC port is configured.', 'Setup ODBC Port');
                        if (choice === 'Setup ODBC Port') {
                            commands.executeCommand('tally-tdl.setupOdbcPort');
                        }
                        return;
                    }
                }

                panel.setStatus('loading', 'Sending request...');
                const processedXml = substituteVariables(document.getText(), finalVars);
                
                try {
                    const response = await sendXmlRequest(processedXml, port);
                    panel.setStatus('success', `Status: ${response.statusCode}`);
                    
                    // We now pass the file path instead of the entire string to avoid IPC limits
                    panel.showResponse(response.filePath, '', response.elapsed);
                } catch (err: any) {
                    panel.setStatus('error', err.message);
                    outputChannel.appendLine(`[Request Error] ${err.message}`);
                    if (err.stack) {
                        outputChannel.appendLine(err.stack);
                    }
                }
            };

            panel.onDidSendRequest = async (submittedVars: Map<string, string>) => {
                // Save specific variable values for this file
                const fileKeyPrefix = `xmlVars:${document.uri.toString()}:`;
                for (const [k, v] of submittedVars.entries()) {
                    await context.workspaceState.update(fileKeyPrefix + k, v);
                }
                
                await executeRequest(submittedVars);
            };

            const storedVars = getStoredVariables(document.uri, variables);
            updatePanelVariables(document);

            // If there are missing variables, just show the panel and wait for user to fill them
            const hasEmptyVars = Array.from(storedVars.values()).some(v => !v.value);
            if (variables.length === 0 || !hasEmptyVars) {
                // Auto-send if no vars or all vars are already filled
                const varsMap = new Map<string, string>();
                for (const [k, v] of storedVars.entries()) {
                    varsMap.set(k, v.value);
                }
                await executeRequest(varsMap);
            }
        }),
        commands.registerCommand('tally-tdl.setupTallyPath', setupTallyPath),
        commands.registerCommand('tally-tdl.setupOdbcPort', setupOdbcPort),
        commands.registerCommand('tally-tdl.restartServer', async () => {
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
            
            // Re-trigger for all open text documents
            workspace.textDocuments.forEach(didOpenTextDocument);
        })
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
