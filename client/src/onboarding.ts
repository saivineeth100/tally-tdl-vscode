import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import * as net from 'net';

export async function setupTallyPath() {
    const defaultPath = 'C:\\Program Files\\TallyPrime\\tally.exe';
    const config = vscode.workspace.getConfiguration('tallyTDL');
    const currentConfiguredPath = config.get<string>('tallyExePath');
    let selectedPath: string | undefined;

    const options: string[] = [];
    if (currentConfiguredPath && fs.existsSync(currentConfiguredPath)) {
        options.push(`Keep Configured: ${currentConfiguredPath}`);
    }
    if (fs.existsSync(defaultPath) && currentConfiguredPath !== defaultPath) {
        options.push(`Use Default: ${defaultPath}`);
    }
    options.push('Search Running & Installed Tally Applications...', 'Browse File System...');

    const option = await vscode.window.showQuickPick(options, { placeHolder: 'Select how to find Tally executable' });

    if (!option || option.startsWith('Keep Configured:')) {
        return;
    }

    if (option.startsWith('Use Default:')) {
        selectedPath = defaultPath;
    } else if (option === 'Search Running & Installed Tally Applications...') {
        selectedPath = await new Promise<string | undefined>((resolve) => {
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Searching for Tally applications...",
                cancellable: false
            }, async () => {
                return new Promise<string | undefined>((res) => {
                    const script = `
$runningPaths = @()
$running = Get-Process | Where-Object {$_.Name -match 'tally'} | Select-Object -ExpandProperty Path -ErrorAction SilentlyContinue
if ($running) { foreach ($p in $running) { $runningPaths += $p } }

$installedPaths = @()
$installed = Get-ChildItem -Path HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall, HKLM:\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall, HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall -ErrorAction SilentlyContinue | Get-ItemProperty | Where-Object { $_.DisplayName -match 'Tally' } | Select-Object -ExpandProperty InstallLocation -ErrorAction SilentlyContinue
if ($installed) {
    foreach ($path in $installed) {
        if ($path) {
            $exe = Join-Path $path "tally.exe"
            if (Test-Path $exe) {
                $installedPaths += $exe
            }
        }
    }
}

$allPaths = @()
$allPaths += $runningPaths
$allPaths += $installedPaths
$uniquePaths = $allPaths | Select-Object -Unique

foreach ($p in $uniquePaths) {
    $isRunning = if ($runningPaths -contains $p) { "1" } else { "0" }
    "$p|$isRunning"
}
`;
                    const base64Script = Buffer.from(script, 'utf16le').toString('base64');
                    const cmd = `powershell -EncodedCommand ${base64Script}`;
                    exec(cmd, async (error, stdout, stderr) => {
                        if (error || !stdout.trim()) {
                            vscode.window.showWarningMessage('No Tally processes or installations found. Please browse manually.');
                            res(undefined);
                            return;
                        }
                        const lines = stdout.trim().split(/\r?\n/).filter(p => p.trim() !== '');
                        if (lines.length === 0) {
                            vscode.window.showWarningMessage('No Tally processes or installations found. Please browse manually.');
                            res(undefined);
                            return;
                        }
                        
                        const items: vscode.QuickPickItem[] = lines.map(line => {
                            const [p, isRunning] = line.split('|');
                            const status = isRunning === "1" ? " (Running)" : "";
                            const icon = isRunning === "1" ? "$(play-circle)" : "$(stop-circle)";
                            return {
                                label: `${icon} ${path.basename(path.dirname(p))}${status}`,
                                description: p
                            };
                        });
                        
                        if (items.length === 1) {
                            res(items[0].description);
                        } else {
                            const chosen = await vscode.window.showQuickPick(items, { placeHolder: 'Select a Tally application' });
                            res(chosen ? chosen.description : undefined);
                        }
                    });
                });
            }).then(resolve);
        });
        if (!selectedPath) {
            // Fallback to browse if not found or cancelled
            const browseOption = await vscode.window.showQuickPick(['Browse File System...'], { placeHolder: 'Fallback to manual selection' });
            if (browseOption) {
                const uri = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: { 'Executables': ['exe'] }
                });
                if (uri && uri[0]) {
                    selectedPath = uri[0].fsPath;
                }
            }
        }
    } else if (option === 'Browse File System...') {
        const uri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: { 'Executables': ['exe'] }
        });
        if (uri && uri[0]) {
            selectedPath = uri[0].fsPath;
        }
    }

    if (selectedPath) {
        let target = vscode.ConfigurationTarget.Global;
        if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
            const saveOption = await vscode.window.showQuickPick([
                { label: 'Save to Workspace Settings', description: 'For this project only' },
                { label: 'Save to Global Settings', description: 'For all projects' }
            ], { placeHolder: 'Where would you like to save this Tally path configuration?' });
            
            if (!saveOption) {
                return;
            }
            if (saveOption.label.includes('Workspace')) {
                target = vscode.ConfigurationTarget.Workspace;
            }
        }

        await config.update('tallyExePath', selectedPath, target);
        vscode.window.showInformationMessage(`Tally path configured to: ${selectedPath} (${target === vscode.ConfigurationTarget.Workspace ? 'Workspace' : 'Global'})`);
    }
}

async function findAvailablePort(startPort: number): Promise<number> {
    const isPortAvailable = (port: number) => {
        return new Promise<boolean>((resolve) => {
            const server = net.createServer();
            server.once('error', () => {
                resolve(false);
            });
            server.once('listening', () => {
                server.close();
                resolve(true);
            });
            server.listen(port, '127.0.0.1');
        });
    };

    let port = startPort;
    const maxAttempts = 50;
    let attempts = 0;

    while (port < 65535 && attempts < maxAttempts) {
        const available = await isPortAvailable(port);
        if (available) {
            return port;
        }
        port++;
        attempts++;
    }
    throw new Error(`No available ports found after ${maxAttempts} attempts starting from ${startPort}.`);
}

export async function setupOdbcPort() {
    const config = vscode.workspace.getConfiguration('tallyTDL');
    const exePath = config.get<string>('tallyExePath');

    if (!exePath || !fs.existsSync(exePath)) {
        vscode.window.showErrorMessage('Tally path is not configured or invalid. Please run "Setup Tally Path" first.');
        return;
    }

    let port: number;
    try {
        port = await findAvailablePort(9000);
    } catch (e) {
        vscode.window.showErrorMessage('Failed to find an available port.');
        return;
    }

    const iniPath = path.join(path.dirname(exePath), 'tally.ini');
    const instructionsMsg = `Please open ${iniPath} and set:\nClient/Server=Server\nPort=${port}`;

    if (!fs.existsSync(iniPath)) {
        vscode.window.showWarningMessage(`tally.ini not found at ${iniPath}. ` + instructionsMsg);
        return;
    }

    try {
        let iniContent = fs.readFileSync(iniPath, 'utf8');
        let modified = false;

        if (/Client\/Server\s*=/i.test(iniContent)) {
            iniContent = iniContent.replace(/(Client\/Server\s*=)(.*)/i, `$1Server`);
            modified = true;
        } else {
            iniContent += `\r\nClient/Server=Server`;
            modified = true;
        }

        if (/Port\s*=/i.test(iniContent)) {
            iniContent = iniContent.replace(/(Port\s*=)(.*)/i, `$1${port}`);
            modified = true;
        } else {
            iniContent += `\r\nPort=${port}`;
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(iniPath, iniContent, 'utf8');
            vscode.window.showInformationMessage(`Successfully updated tally.ini to open ODBC port ${port}. Please restart Tally to apply changes.`);
        }
    } catch (error) {
        vscode.window.showWarningMessage(`Failed to modify tally.ini (requires Administrator privileges). ${instructionsMsg}`);
    }

    let target = vscode.ConfigurationTarget.Global;
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        const saveOption = await vscode.window.showQuickPick([
            { label: 'Save to Workspace Settings', description: 'For this project only' },
            { label: 'Save to Global Settings', description: 'For all projects' }
        ], { placeHolder: 'Where would you like to save this Tally port configuration?' });
        
        if (saveOption && saveOption.label.includes('Workspace')) {
            target = vscode.ConfigurationTarget.Workspace;
        } else if (!saveOption) {
            return;
        }
    }
    await config.update('tallyPort', port, target);
    vscode.window.showInformationMessage(`Tally ODBC port configured to: ${port} (${target === vscode.ConfigurationTarget.Workspace ? 'Workspace' : 'Global'})`);
}
