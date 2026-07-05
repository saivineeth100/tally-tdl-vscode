import { DocumentRepository } from '../ports/documentRepository';
import { ClientGateway } from '../ports/clientGateway';
import { DiagnosticPublisher } from '../ports/diagnosticPublisher';
import { FileAccess } from '../ports/fileAccess';
import { Scheduler } from '../ports/scheduler';
import { ServiceLogger } from '../ports/serviceLogger';
import { CompletionService } from '../services/completionService';
import { NavigationService } from '../services/navigationService';
import { createDocumentFeatures } from '../services/documentFeatures';
import { DocumentLifecycleService } from '../services/documentLifecycleService';
import { WorkspaceLifecycleService } from '../services/workspaceLifecycleService';
import { CustomRequestsService } from '../services/customRequestsService';

/**
 * Dependencies required to construct the server runtime.
 */
export interface ServerRuntimeDependencies {
    documents: DocumentRepository;
    client: ClientGateway;
    diagnostics: DiagnosticPublisher;
    files: FileAccess;
    scheduler: Scheduler;
    logger: ServiceLogger;
}

/**
 * The composed server runtime containing all services.
 */
export interface ServerRuntime {
    completion: CompletionService;
    navigation: NavigationService;
    documentFeatures: ReturnType<typeof createDocumentFeatures>;
    documentLifecycle: DocumentLifecycleService;
    workspaceLifecycle: WorkspaceLifecycleService;
    customRequests: CustomRequestsService;
    
    services: {
        documentStateStore: import('../services/documentStateStore').DocumentStateStore;
        includeGraphManager: import('../services/includeGraphManager').IncludeGraphManager;
        workspaceScanner: import('../services/workspaceScanner').WorkspaceScanner;
        documentLoader: import('../services/documentLoader').DocumentLoader;
        contextResolver: import('../services/documentContextResolver').DocumentContextResolver;
    };

    dispose(): Promise<void> | void;
}
