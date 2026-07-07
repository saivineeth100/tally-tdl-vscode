import { DocumentRepository } from '../../ports/documentRepository';
import { ClientGateway } from '../../ports/clientGateway';
import { DiagnosticPublisher } from '../../ports/diagnosticPublisher';
import { FileAccess, FileStat } from '../../ports/fileAccess';
import { Scheduler } from '../../ports/scheduler';
import { ServiceLogger } from '../../ports/serviceLogger';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, WorkspaceFolder } from 'vscode-languageserver/node';
import * as path from 'path';

export class InMemoryDocumentRepository implements DocumentRepository {
    private docs = new Map<string, TextDocument>();

    get(uri: string): TextDocument | undefined {
        return this.docs.get(uri);
    }

    all(): readonly TextDocument[] {
        return Array.from(this.docs.values());
    }

    set(uri: string, doc: TextDocument) {
        this.docs.set(uri, doc);
    }

    delete(uri: string): boolean {
        return this.docs.delete(uri);
    }
}

export class MockClientGateway implements ClientGateway {
    public notifications: { method: string, params: unknown }[] = [];
    public infoMessages: string[] = [];
    public errorMessages: string[] = [];
    public semanticTokensRefreshed = false;
    public configuration: Record<string, unknown> = {};
    public workspaceFolders: WorkspaceFolder[] | null = null;

    notify<T>(method: string, params: T): void {
        this.notifications.push({ method, params });
    }

    showInformationMessage(message: string): void {
        this.infoMessages.push(message);
    }

    showErrorMessage(message: string): void {
        this.errorMessages.push(message);
    }

    refreshSemanticTokens(): Promise<void> | void {
        this.semanticTokensRefreshed = true;
    }

    refreshCodeLens(): Promise<void> | void {
        // No-op in mock
    }

    async getConfiguration<T>(section: string): Promise<T | undefined> {
        return this.configuration[section] as any;
    }

    async getWorkspaceFolders(): Promise<WorkspaceFolder[] | null> {
        return this.workspaceFolders;
    }
}

export class MockDiagnosticPublisher implements DiagnosticPublisher {
    public publishedDiagnostics = new Map<string, Diagnostic[]>();

    publish(uri: string, diagnostics: Diagnostic[]): void {
        this.publishedDiagnostics.set(uri, diagnostics);
    }
}

export class InMemoryFileAccess implements FileAccess {
    public files = new Map<string, string>();

    set(filePath: string, content: string) {
        this.files.set(this.canonicalize(filePath), content);
    }

    async exists(filePath: string): Promise<boolean> {
        return this.existsSync(filePath);
    }

    existsSync(filePath: string): boolean {
        return this.files.has(this.canonicalize(filePath));
    }

    async readFile(filePath: string, encoding?: string): Promise<string> {
        const content = this.files.get(this.canonicalize(filePath));
        if (content === undefined) {
            throw new Error(`File not found: ${filePath}`);
        }
        return content as any;
    }

    async readDirectory(dirPath: string): Promise<string[]> {
        const canonicalDir = this.canonicalize(dirPath);
        const children = new Set<string>();
        for (const [filePath] of this.files) {
            if (filePath.startsWith(canonicalDir) && filePath !== canonicalDir) {
                const relative = filePath.substring(canonicalDir.length + 1);
                const parts = relative.split(/[\\/]/);
                if (parts.length > 0) {
                    children.add(parts[0]);
                }
            }
        }
        return Array.from(children);
    }

    async stat(filePath: string): Promise<FileStat | undefined> {
        const canonical = this.canonicalize(filePath);
        if (this.files.has(canonical)) {
            const content = this.files.get(canonical)!;
            return {
                isFile: () => true,
                isDirectory: () => false,
                size: Buffer.byteLength(content),
                mtimeMs: Date.now()
            };
        }
        for (const [p] of this.files) {
            if (p.startsWith(canonical + '/') || p.startsWith(canonical + '\\')) {
                return {
                    isFile: () => false,
                    isDirectory: () => true,
                    size: 0,
                    mtimeMs: Date.now()
                };
            }
        }
        return undefined;
    }

    canonicalize(filePath: string): string {
        return path.resolve(filePath).replace(/\\/g, '/');
    }
}

export class DeterministicScheduler implements Scheduler {
    private queue: { callback: () => void, ms: number, id: number }[] = [];
    private nextId = 1;

    setTimeout(callback: () => void, ms: number): unknown {
        const id = this.nextId++;
        this.queue.push({ callback, ms, id });
        return id;
    }

    clearTimeout(token: unknown): void {
        this.queue = this.queue.filter(q => q.id !== token);
    }

    flush() {
        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                task.callback();
            }
        }
    }
}

export class MockServiceLogger implements ServiceLogger {
    public logs: { level: string, message: string, args: unknown[] }[] = [];

    error(message: string, ...args: unknown[]): void { this.logs.push({ level: 'error', message, args }); }
    warn(message: string, ...args: unknown[]): void { this.logs.push({ level: 'warn', message, args }); }
    info(message: string, ...args: unknown[]): void { this.logs.push({ level: 'info', message, args }); }
    debug(message: string, ...args: unknown[]): void { this.logs.push({ level: 'debug', message, args }); }
    trace(message: string, ...args: unknown[]): void { this.logs.push({ level: 'trace', message, args }); }
}
