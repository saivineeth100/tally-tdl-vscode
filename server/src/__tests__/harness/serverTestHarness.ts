import { ServerRuntimeDependencies, ServerRuntime } from '../../runtime/serverRuntime';
import { createServerRuntime } from '../../runtime/createServerRuntime';
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

    dispose() {
        return this.runtime.dispose();
    }
}
