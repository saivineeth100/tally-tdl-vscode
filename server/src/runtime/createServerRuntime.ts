import { ServerRuntimeDependencies, ServerRuntime } from './serverRuntime';
import { DocumentStateStore } from '../services/documentStateStore';
import { IncludeGraphManager } from '../services/includeGraphManager';
import { WorkspaceScanner } from '../services/workspaceScanner';
import { DocumentLifecycleService } from '../services/documentLifecycleService';
import { DocumentContextResolver } from '../services/documentContextResolver';
import { createDocumentFeatures } from '../services/documentFeatures';
import { CompletionService } from '../services/completionService';
import { NavigationService } from '../services/navigationService';
import { WorkspaceLifecycleService } from '../services/workspaceLifecycleService';
import { CustomRequestsService } from '../services/customRequestsService';

import { DocumentLoader } from '../services/documentLoader';

export function createServerRuntime(dependencies: ServerRuntimeDependencies): ServerRuntime {
    
    const stateStore = new DocumentStateStore();
    const graphManager = new IncludeGraphManager(stateStore, dependencies.client);
    
    // We instantiate WorkspaceLifecycleService early to get resolveIncludePath
    const workspaceLifecycleService = new WorkspaceLifecycleService(dependencies.client, stateStore);
    
    // Wire up the circular dependencies for include resolution
    graphManager.resolveIncludePath = workspaceLifecycleService.resolveIncludePath.bind(workspaceLifecycleService);
    
    const documentLoader = new DocumentLoader(dependencies.documents, dependencies.files);
    
    const workspaceScanner = new WorkspaceScanner(
        stateStore, 
        graphManager, 
        dependencies.files, 
        dependencies.diagnostics, 
        workspaceLifecycleService.resolveIncludePath.bind(workspaceLifecycleService),
        documentLoader
    );
    
    const documentLifecycle = new DocumentLifecycleService(
        stateStore, 
        graphManager, 
        workspaceScanner, 
        dependencies.diagnostics, 
        dependencies.scheduler, 
        workspaceLifecycleService.resolveIncludePath.bind(workspaceLifecycleService),
        documentLoader
    );

    // Provide the scanner back to the workspace lifecycle service
    (workspaceLifecycleService as any).scanner = workspaceScanner;
    (workspaceLifecycleService as any).documentLifecycle = documentLifecycle;

    const contextResolver = new DocumentContextResolver(dependencies.documents, stateStore, graphManager);
    const documentFeatures = createDocumentFeatures(contextResolver, documentLoader, workspaceLifecycleService.resolveIncludePath.bind(workspaceLifecycleService), documentLifecycle);
    const completionService = new CompletionService(stateStore, graphManager, contextResolver, () => workspaceLifecycleService.globalWorkspaceFolders);
    const navigationService = new NavigationService(stateStore, graphManager, dependencies.documents, documentLoader, workspaceLifecycleService.resolveIncludePath.bind(workspaceLifecycleService));
    const customRequestsService = new CustomRequestsService(stateStore, graphManager, dependencies.documents, dependencies.client, workspaceLifecycleService.resolveIncludePath.bind(workspaceLifecycleService));

    return {
        completion: completionService,
        navigation: navigationService,
        documentFeatures: documentFeatures,
        documentLifecycle: documentLifecycle,
        workspaceLifecycle: workspaceLifecycleService,
        customRequests: customRequestsService,
        
        services: {
            documentStateStore: stateStore,
            includeGraphManager: graphManager,
            workspaceScanner,
            documentLoader,
            contextResolver
        },

        dispose: () => {
            documentLifecycle.dispose();
        }
    };
}
