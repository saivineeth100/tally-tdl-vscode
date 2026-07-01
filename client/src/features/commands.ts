import * as path from 'path';
import { ExtensionContext, window, workspace, commands, Uri, OutputChannel, Location, Position, Range } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { spawn } from 'child_process';
import { setupTallyPath, setupOdbcPort } from './onboarding';
import { ResponsePanel } from './responsePanel';
import { extractVariables, substituteVariables } from '../utils/templateEngine';
import { sendXmlRequest, checkTallyRunning, launchTallyAndWait } from '../services/tallyClient';
import { ScopeExplorer } from './scopeExplorer';
import { getStoredVariables, updatePanelVariables } from './xmlVariables';

export function registerCommands(
    context: ExtensionContext,
    outputChannel: OutputChannel,
    getDefaultClient: () => LanguageClient | undefined,
    getClients: () => Map<string, LanguageClient>,
    getOuterMostWorkspaceFolder: (folder: any) => any,
    restartServers: () => Promise<void>
) {
    context.subscriptions.push(
        commands.registerCommand('tally-tdl.runCurrentFile', () => {
            const editor = window.activeTextEditor;
            if (!editor) {
                window.showErrorMessage('No active editor found.');
                return;
            }

            const document = editor.document;
            if (document.languageId === 'xml') {
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

        commands.registerCommand('tally-tdl.showScopeTree', async () => {
            const editor = window.activeTextEditor;
            if (!editor) {
                window.showErrorMessage('No active editor found.');
                return;
            }
            
            const uri = editor.document.uri.toString();
            let client = getDefaultClient();
            const folder = workspace.getWorkspaceFolder(editor.document.uri);
            if (folder) {
                client = getClients().get(folder.uri.toString()) || client;
            }
            
            if (client) {
                await ScopeExplorer.show(client, uri, context);
            }
        }),

        commands.registerCommand('tally-tdl.buildCustomLibraryCache', async () => {
            const options = {
                canSelectMany: false,
                openLabel: 'Select Custom TDL Library Folder',
                canSelectFiles: false,
                canSelectFolders: true
            };
            const fileUri = await window.showOpenDialog(options);
            if (fileUri && fileUri[0]) {
                const folderPath = fileUri[0].fsPath;
                let client = getDefaultClient();
                // Send notification to language server to build it
                if (client) {
                    client.sendNotification('tdl/buildCustomLibraryCache', { folderPath });
                    window.showInformationMessage(`Building cache for ${folderPath}... Please check the Output window for progress.`);
                } else {
                    window.showErrorMessage('TDL Language Server is not running.');
                }
            }
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

            let client = getDefaultClient();
            const folder = workspace.getWorkspaceFolder(document.uri);
            if (folder) {
                const outerFolder = getOuterMostWorkspaceFolder(folder);
                client = getClients().get(outerFolder.uri.toString()) || client;
            }

            if (!client) {
                window.showErrorMessage('TDL Language Server is not running.');
                return;
            }

            try {
                const xmlString = await client.sendRequest<string>('tdl/convertToXml', { uri: document.uri.toString() });
                
                if (!xmlString) {
                    window.showErrorMessage('Failed to convert to XML.');
                    return;
                }

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
                content = arg;
            } else if (arg && arg.fsPath) {
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

            panel.onDidLogError = (errorMsg, stack) => {
                outputChannel.appendLine(`[Webview Error] ${errorMsg}`);
                if (stack) {
                    outputChannel.appendLine(stack);
                }
            };

            panel.onDidSaveDefault = async (varName: string, value: string) => {
                await context.globalState.update(`xmlVars:workspace:${varName}`, value);
                await context.workspaceState.update(`xmlVars:${document.uri.toString()}:${varName}`, undefined);
                updatePanelVariables(document, context);
            };
            
            panel.onDidRefresh = () => {
                updatePanelVariables(document, context);
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
                const fileKeyPrefix = `xmlVars:${document.uri.toString()}:`;
                for (const [k, v] of submittedVars.entries()) {
                    await context.workspaceState.update(fileKeyPrefix + k, v);
                }
                
                await executeRequest(submittedVars);
            };

            const storedVars = getStoredVariables(document.uri, variables, context);
            updatePanelVariables(document, context);

            const hasEmptyVars = Array.from(storedVars.values()).some(v => !v.value);
            if (variables.length === 0 || !hasEmptyVars) {
                const varsMap = new Map<string, string>();
                for (const [k, v] of storedVars.entries()) {
                    varsMap.set(k, v.value);
                }
                await executeRequest(varsMap);
            }
        }),

        commands.registerCommand('tally-tdl.setupTallyPath', setupTallyPath),
        commands.registerCommand('tally-tdl.setupOdbcPort', setupOdbcPort),
        commands.registerCommand('tally-tdl.restartServer', restartServers),
        commands.registerCommand('tally-tdl.showReferences', (uriStr: string, position: any, locations: any[]) => {
            const uri = Uri.parse(uriStr);
            const pos = new Position(position.line, position.character);
            const locs = locations.map(loc => {
                return new Location(
                    Uri.parse(loc.uri),
                    new Range(
                        new Position(loc.range.start.line, loc.range.start.character),
                        new Position(loc.range.end.line, loc.range.end.character)
                    )
                );
            });
            commands.executeCommand('editor.action.showReferences', uri, pos, locs);
        }),
        commands.registerCommand('tally-tdl.disableDiagnostic', async (code: string) => {
            const config = workspace.getConfiguration('tallyTDL');
            const severityConfig = { ...(config.get<Record<string, string>>('diagnostics.severity') || {}) };
            severityConfig[code] = 'none';
            await config.update('diagnostics.severity', severityConfig, workspace.workspaceFolders ? 2 : 1); // ConfigurationTarget.Workspace = 2, Global = 1
            window.showInformationMessage(`Diagnostic ${code} has been disabled for this project.`);
        })
    );
}
