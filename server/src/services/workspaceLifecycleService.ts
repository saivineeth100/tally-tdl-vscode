import { Connection, InitializeParams, InitializeResult, TextDocumentSyncKind, TextDocuments, ProposedFeatures, FileChangeType, DidChangeConfigurationParams, WorkspaceFoldersChangeEvent } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from 'vscode-uri';
import * as path from 'path';
import * as fs from 'fs';

import { DocumentStateStore } from './documentStateStore';
import { logger } from '../logger';
import { updateSettings } from '../utils/settingsManager';
import { loadMetadata as loadNewMetadata, loadExternalLibraries } from '../semantics/metadataLoader';
import { TDL_SEMANTIC_TOKENS_LEGEND } from '../features/semanticTokens/semanticTokens';
import { getServerCapabilities } from '../protocol/capabilities';

export class WorkspaceLifecycleService {
    public globalWorkspaceFolders: string[] = [];
    public hasWorkspaceFolderCapability: boolean = false;
    public initParams: InitializeParams | undefined;
    public currentTargetVersion: string = "7.0";

    // Set by createServerRuntime to resolve circular dependency during construction
    public scanner?: import('./workspaceScanner').WorkspaceScanner;
    public documentLifecycle?: import('./documentLifecycleService').DocumentLifecycleService;

    constructor(
        private client: import('../ports/clientGateway').ClientGateway,
        private stateStore: DocumentStateStore,
        private fileAccess: import('../ports/fileAccess').FileAccess
    ) {
        // Bind functions so they can be easily passed to connection.onX
        this.resolveIncludePath = this.resolveIncludePath.bind(this);
    }

    public resolveIncludePath(currentPath: string, includeName: string): string | null {
        // 1. Try relative to current file's directory
        const relativePath = path.resolve(path.dirname(currentPath), includeName);
        if (this.fileAccess.existsSync(relativePath)) {
            try {
                return fs.realpathSync.native(relativePath);
            } catch {
                return relativePath;
            }
        }

        // 2. Try relative to each workspace folder root
        for (const folder of this.globalWorkspaceFolders) {
            const rootPath = path.resolve(folder, includeName);
            if (this.fileAccess.existsSync(rootPath)) {
                try {
                    return fs.realpathSync.native(rootPath);
                } catch {
                    return rootPath;
                }
            }
        }

        // File not found
        return null;
    }

    public async loadMetadata(version: string) {
        // When bundled to dist/, __dirname is dist/. When running from src/, __dirname is src/.
        const dataDir = __dirname.endsWith('src') || __dirname.endsWith('src\\') || __dirname.endsWith('src/')
            ? path.resolve(__dirname, '../../data') // Adjusted because this file is in services/ 
            : path.resolve(__dirname, './data');

        // Initialize Global Scope in ScopeManagers
        this.stateStore.tdlScopeManager.initializeGlobalScope();
        this.stateStore.xmlScopeManager.initializeGlobalScope();

        // NEW WAY: Load directly into the TDL scope manager
        await loadNewMetadata(dataDir, version, this.stateStore.tdlScopeManager, false);

        // Share the loaded global read-only metadata with the XML scope manager
        // to avoid deserializing the massive binary cache twice.
        this.stateStore.xmlScopeManager.globalScope = this.stateStore.tdlScopeManager.globalScope;
        this.stateStore.xmlScopeManager.keywordSets = this.stateStore.tdlScopeManager.keywordSets;
        this.stateStore.xmlScopeManager.primarySchemaNames = this.stateStore.tdlScopeManager.primarySchemaNames;
        this.stateStore.xmlScopeManager.definitionTypeLabels = this.stateStore.tdlScopeManager.definitionTypeLabels;
    }

    public async initialize(params: InitializeParams): Promise<InitializeResult> {
        this.initParams = params;

        if (params.workspaceFolders) {
            this.globalWorkspaceFolders = params.workspaceFolders.map(f => URI.parse(f.uri).fsPath);
            if (this.scanner) this.scanner.workspaceFolders = this.globalWorkspaceFolders;
        }

        const capabilities = params.capabilities;
        this.hasWorkspaceFolderCapability = !!(
            capabilities.workspace && !!capabilities.workspace.workspaceFolders
        );

        return {
            capabilities: getServerCapabilities()
        };
    }

    public async initialized() {
        if (this.scanner) {
            this.scanner.onScanComplete = () => {
                this.client.refreshSemanticTokens();
            };
        }

        // Sync settings and external libraries first
        const settings = await this.client.getConfiguration<any>('tallyTDL');
        if (settings) {
            updateSettings(settings);
            if (settings.targetVersion) {
                this.currentTargetVersion = settings.targetVersion;
            }
        }

        // Load metadata in background so we don't block the initial LSP connection
        await this.loadMetadata(this.currentTargetVersion);
        this.stateStore.isMetadataLoaded = true;
        
        // If workspace scanning finished before metadata loaded, we must trigger revalidation
        // Otherwise, the end of scanWorkspaceFolders will handle it.
        if (this.scanner && !this.scanner.scanningInProgress) {
            this.scanner.revalidateAll(Array.from(this.stateStore.getAllDocs()).map(d => ({ uri: d[0] })))
                .catch(e => logger.error(`Revalidation failed after metadata load: ${e}`));
        }
        
        // Tell client to refresh semantic tokens since we now have base symbols
        this.client.refreshSemanticTokens();
        
        if (settings) {
            if (settings.excludePaths && Array.isArray(settings.excludePaths)) {
                if (this.scanner) this.scanner.setExcludePaths(settings.excludePaths);
            }
            if (settings.externalLibraries && Array.isArray(settings.externalLibraries)) {
                await loadExternalLibraries(settings.externalLibraries, this.stateStore.tdlScopeManager);
                await loadExternalLibraries(settings.externalLibraries, this.stateStore.xmlScopeManager);
            }
        }

        if (this.initParams && this.initParams.workspaceFolders && this.initParams.workspaceFolders.length > 0) {
            this.globalWorkspaceFolders = this.initParams.workspaceFolders.map(f => URI.parse(f.uri).fsPath);
            if (this.scanner) {
                this.scanner.workspaceFolders = this.globalWorkspaceFolders;
                const folderUris = this.initParams.workspaceFolders.map(f => f.uri);
                this.scanner.scanWorkspaceFolders(folderUris);
            }
        } else if (this.hasWorkspaceFolderCapability) {
            this.client.getWorkspaceFolders().then(folders => {
                if (folders && folders.length > 0) {
                    this.globalWorkspaceFolders = folders.map(f => URI.parse(f.uri).fsPath);
                    if (this.scanner) {
                        this.scanner.workspaceFolders = this.globalWorkspaceFolders;
                        const folderUris = folders.map(f => f.uri);
                        this.scanner.scanWorkspaceFolders(folderUris);
                    }
                } else {
                    this.fallbackInitParams(this.initParams);
                }
            });
        } else {
            this.fallbackInitParams(this.initParams);
        }
    }

    private fallbackInitParams(params: InitializeParams | undefined) {
        if (params && params.rootUri) {
            const fsPath = URI.parse(params.rootUri).fsPath;
            this.globalWorkspaceFolders = [fsPath];
            if (this.scanner) {
                this.scanner.workspaceFolders = this.globalWorkspaceFolders;
                this.scanner.scanWorkspaceFolders([params.rootUri]);
            }
        } else if (params && params.rootPath) {
            const fsPath = URI.file(params.rootPath).fsPath;
            this.globalWorkspaceFolders = [fsPath];
            if (this.scanner) {
                this.scanner.workspaceFolders = this.globalWorkspaceFolders;
                this.scanner.scanWorkspaceFolders([URI.file(params.rootPath).toString()]);
            }
        }
    }

    private onDidChangeWorkspaceFolders(event: WorkspaceFoldersChangeEvent) {
        // Remove folders
        for (const folder of event.removed) {
            const folderPath = URI.parse(folder.uri).fsPath;
            this.globalWorkspaceFolders = this.globalWorkspaceFolders.filter(f => f !== folderPath);
            if (this.scanner) {
                this.scanner.workspaceFolders = this.globalWorkspaceFolders;
                this.scanner.clearFolderSymbols(folderPath);
            }
        }

        // Add folders
        const addedUris: string[] = [];
        for (const folder of event.added) {
            const folderPath = URI.parse(folder.uri).fsPath;
            if (!this.globalWorkspaceFolders.includes(folderPath)) {
                this.globalWorkspaceFolders.push(folderPath);
                addedUris.push(folder.uri);
            }
        }
        if (addedUris.length > 0 && this.scanner) {
            this.scanner.workspaceFolders = this.globalWorkspaceFolders;
        }

        if (addedUris.length > 0 && this.scanner) {
            this.scanner.scanWorkspaceFolders(addedUris);
        }
    }

    public async onDidChangeConfiguration(change: DidChangeConfigurationParams) {
        if (change.settings && change.settings.tallyTDL) {
            updateSettings(change.settings.tallyTDL);
            
            if (change.settings.tallyTDL.excludePaths && Array.isArray(change.settings.tallyTDL.excludePaths) && this.scanner) {
                this.scanner.setExcludePaths(change.settings.tallyTDL.excludePaths);
            }
            
            let requiresMetadataReload = false;
            if (change.settings.tallyTDL.targetVersion && change.settings.tallyTDL.targetVersion !== this.currentTargetVersion) {
                this.currentTargetVersion = change.settings.tallyTDL.targetVersion;
                requiresMetadataReload = true;
            }

            if (requiresMetadataReload) {
                this.client.showInformationMessage(`Tally TDL: Loading metadata for version ${this.currentTargetVersion}...`);
                this.stateStore.isMetadataLoaded = false;
                
                // Clear existing global scopes
                this.stateStore.tdlScopeManager.globalScope.definitions.clear();
                this.stateStore.tdlScopeManager.globalScope.variables.clear();
                this.stateStore.tdlScopeManager.globalScope.formulas.clear();
                this.stateStore.xmlScopeManager.globalScope.definitions.clear();
                
                await this.loadMetadata(this.currentTargetVersion);
                this.stateStore.isMetadataLoaded = true;
                this.client.refreshSemanticTokens();
            }

            // Reload external libraries if configured
            if (change.settings.tallyTDL.externalLibraries && Array.isArray(change.settings.tallyTDL.externalLibraries)) {
                await loadExternalLibraries(change.settings.tallyTDL.externalLibraries, this.stateStore.tdlScopeManager);
                await loadExternalLibraries(change.settings.tallyTDL.externalLibraries, this.stateStore.xmlScopeManager);
                this.client.refreshSemanticTokens();
            }

            // Re-validate all documents (open and indexed)
            if (this.scanner) {
                this.scanner.revalidateAll(Array.from(this.stateStore.getAllDocs()).map(d => ({ uri: d[0] })));
            }
        }
    }

    public onDidChangeWatchedFiles(change: { changes: { uri: string, type: FileChangeType }[] }) {
        for (const changeEvent of change.changes) {
            if (changeEvent.type === FileChangeType.Deleted) {
                this.stateStore.getScopeManager(changeEvent.uri).removeFileScope(changeEvent.uri);
            }
        }
    }
}
