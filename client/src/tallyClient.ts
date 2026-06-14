import * as http from 'http';
import * as net from 'net';
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { spawn } from 'child_process';

export async function checkTallyRunning(port: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(2000);
        
        socket.on('connect', () => {
            socket.destroy();
            resolve(true);
        });
        
        socket.on('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        
        socket.on('error', () => {
            socket.destroy();
            resolve(false);
        });
        
        socket.connect(port, '127.0.0.1');
    });
}

export async function launchTallyAndWait(exePath: string, port: number, args: string[]): Promise<boolean> {
    return vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Launching Tally and waiting for ODBC port...",
        cancellable: false
    }, async (progress) => {
        try {
            const child = spawn(exePath, args, { detached: true, stdio: 'ignore' });
            child.unref();
        } catch (e) {
            vscode.window.showErrorMessage(`Failed to launch Tally: ${e instanceof Error ? e.message : String(e)}`);
            return false;
        }

        const startTime = Date.now();
        const timeout = 45000; // 45 seconds max wait
        
        while (Date.now() - startTime < timeout) {
            const isRunning = await checkTallyRunning(port);
            if (isRunning) {
                return true;
            }
            // Wait 1 second before next check
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        vscode.window.showErrorMessage(`Tally launched, but failed to connect to port ${port} within timeout.`);
        return false;
    });
}

export interface TallyResponse {
    filePath: string;
    statusCode: number;
    elapsed: number;
}

export async function sendXmlRequest(xmlBody: string, port: number): Promise<TallyResponse> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        let isDone = false;
        
        const timeoutId = setTimeout(() => {
            if (!isDone) {
                isDone = true;
                reject(new Error('Request to Tally timed out after 30 seconds.'));
            }
        }, 30000);
        
        const options: http.RequestOptions = {
            hostname: '127.0.0.1',
            port: port,
            path: '/',
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml',
                'Content-Length': Buffer.byteLength(xmlBody)
            }
        };
        
        const req = http.request(options, (res) => {
            const responsesDir = path.join(os.tmpdir(), 'tally-tdl-responses');
            if (!fs.existsSync(responsesDir)) {
                fs.mkdirSync(responsesDir, { recursive: true });
            }
            const tmpFilePath = path.join(responsesDir, `tally_response_${Date.now()}.xml`);
            const writeStream = fs.createWriteStream(tmpFilePath);
            
            res.pipe(writeStream);
            
            writeStream.on('finish', () => {
                if (isDone) return;
                isDone = true;
                clearTimeout(timeoutId);
                resolve({
                    filePath: tmpFilePath,
                    statusCode: res.statusCode || 200,
                    elapsed: Date.now() - startTime
                });
            });

            writeStream.on('error', (e) => {
                if (isDone) return;
                isDone = true;
                clearTimeout(timeoutId);
                reject(e);
            });
        });
        
        req.on('error', (e) => {
            if (isDone) return;
            isDone = true;
            clearTimeout(timeoutId);
            reject(e);
        });
        
        req.write(xmlBody);
        req.end();
    });
}

export async function fetchActiveCompanies(port: number): Promise<string[]> {
    const xml = `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>Company</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>`;

    try {
        const response = await sendXmlRequest(xml, port);
        const companies: string[] = [];
        const regex = /<COMPANY[^>]+NAME="([^"]+)"/gi;
        
        // Read file content for companies (this is small enough to load entirely)
        const responseBody = await fs.promises.readFile(response.filePath, 'utf8');
        
        let match;
        while ((match = regex.exec(responseBody)) !== null) {
            const name = match[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'");
            companies.push(name);
        }
        
        // Clean up temp file
        fs.unlink(response.filePath, () => {});
        
        return [...new Set(companies)];
    } catch (e) {
        console.error('Failed to fetch companies', e);
        return [];
    }
}
