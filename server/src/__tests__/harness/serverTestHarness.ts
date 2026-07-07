import { ServerRuntimeDependencies, ServerRuntime } from '../../runtime/serverRuntime';
import { createServerRuntime } from '../../runtime/createServerRuntime';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { 
    InMemoryDocumentRepository, 
    MockClientGateway, 
    MockDiagnosticPublisher, 
    InMemoryFileAccess, 
    DeterministicScheduler, 
    MockServiceLogger 
} from './testAdapters';

/**
 * A shared test harness that provides a fully configured ServerRuntime using mock and in-memory adapters.
 * It replaces the need to create custom connection, document, and gateway mocks for individual tests.
 * Test scenarios can override specific dependencies (e.g., providing a custom FileAccess implementation)
 * while falling back to safe defaults for the rest.
 */
export class ServerTestHarness {
    public documents: InMemoryDocumentRepository;
    public client: MockClientGateway;
    public diagnostics: MockDiagnosticPublisher;
    public files: InMemoryFileAccess;
    public scheduler: DeterministicScheduler;
    public logger: MockServiceLogger;
    
    public runtime: ServerRuntime;

    constructor(overrides?: Partial<ServerRuntimeDependencies>) {
        this.documents = (overrides?.documents as InMemoryDocumentRepository) || new InMemoryDocumentRepository();
        this.client = (overrides?.client as MockClientGateway) || new MockClientGateway();
        this.diagnostics = (overrides?.diagnostics as MockDiagnosticPublisher) || new MockDiagnosticPublisher();
        this.files = (overrides?.files as InMemoryFileAccess) || new InMemoryFileAccess();
        this.scheduler = (overrides?.scheduler as DeterministicScheduler) || new DeterministicScheduler();
        this.logger = (overrides?.logger as MockServiceLogger) || new MockServiceLogger();

        const dependencies: ServerRuntimeDependencies = {
            documents: this.documents,
            client: this.client,
            diagnostics: this.diagnostics,
            files: this.files,
            scheduler: this.scheduler,
            logger: this.logger,
            ...overrides
        };

        this.runtime = createServerRuntime(dependencies);
        this.runtime.services.documentStateStore.tdlScopeManager.initializeGlobalScope();
        this.runtime.services.documentStateStore.xmlScopeManager.initializeGlobalScope();
    }

    /**
     * Simulates a document being opened, mirroring the production flow in server.ts:
     *   1. TextDocuments stores the document (repository update)
     *   2. TextDocuments fires onDidOpen → documentLifecycle.onDidOpen()
     * 
     * This ensures InMemoryDocumentRepository and DocumentLifecycleService stay in sync,
     * just like VS Code's TextDocuments class does in production.
     */
    simulateOpen(uri: string, languageId: string, content: string): TextDocument {
        const doc = TextDocument.create(uri, languageId, 1, content);
        this.documents.set(uri, doc);
        this.runtime.documentLifecycle.onDidOpen(doc);
        return doc;
    }

    /**
     * Simulates a document content change, mirroring the production flow:
     *   1. TextDocuments updates the stored document with new content/version
     *   2. TextDocuments fires onDidChangeContent → documentLifecycle.onDidChangeContent()
     */
    simulateChange(uri: string, content: string): TextDocument {
        const existing = this.documents.get(uri);
        const version = existing ? existing.version + 1 : 1;
        const languageId = existing ? existing.languageId : 'tdl';
        const doc = TextDocument.create(uri, languageId, version, content);
        this.documents.set(uri, doc);
        this.runtime.documentLifecycle.onDidChangeContent(doc);
        return doc;
    }

    /**
     * Simulates a document being closed, mirroring the production flow:
     *   1. TextDocuments fires onDidClose → documentLifecycle.onDidClose()
     *   2. TextDocuments removes the document from its internal store
     */
    simulateClose(uri: string): void {
        const doc = this.documents.get(uri);
        if (doc) {
            this.runtime.documentLifecycle.onDidClose(doc);
            this.documents.delete(uri);
        }
    }

    dispose() {
        return this.runtime.dispose();
    }
}
