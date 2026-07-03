import { URI } from 'vscode-uri';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Connection } from 'vscode-languageserver/node';
import { DocumentStateStore } from './documentStateStore';
import { IncludeGraphManager } from './includeGraphManager';
import { DocumentRepository } from '../ports/documentRepository';
import { generateXml } from '../features/xmlGenerator';
import { buildCustomLibraryCache } from '../semantics/cacheBuilder';

export class CustomRequestsService {
    constructor(
        private stateStore: DocumentStateStore,
        private graphManager: IncludeGraphManager,
        private docs: DocumentRepository,
        private client: import('../ports/clientGateway').ClientGateway,
        private resolveIncludePath: (currentPath: string, includeName: string) => string | null
    ) {}

    public async getScopeTreeDebug(params: { uri: string }) {
        const scopeMgr = this.stateStore.getScopeManager(params.uri);
        return scopeMgr.viewer.serializeScopeTree(params.uri);
    }

    public async getScopeChildren(params: { uri: string, scopeId: string }) {
        const scopeMgr = this.stateStore.getScopeManager(params.uri);
        return scopeMgr.viewer.getScopeChildren(params.scopeId);
    }

    public async getScopeNode(params: { uri: string, scopeId: string }) {
        const scopeMgr = this.stateStore.getScopeManager(params.uri);
        return scopeMgr.viewer.getScopeNode(params.scopeId);
    }

    public async getScopeSymbols(params: { uri: string, scopeId: string, kind: string, page: number, limit: number, query?: string }) {
        const scopeMgr = this.stateStore.getScopeManager(params.uri);
        return scopeMgr.viewer.getSymbolsPaginated(params.scopeId, params.kind, params.page, params.limit, params.query);
    }

    public async resolveGlobalSymbol(params: { uri: string, name: string, expectedType: string }) {
        const scopeMgr = this.stateStore.getScopeManager(params.uri);
        const projectScope = this.graphManager.getProjectNodes(params.uri);
        return scopeMgr.resolveDefinition(params.name, params.expectedType, scopeMgr.globalScope, projectScope);
    }

    public async convertToXml(params: { uri: string }) {
        const doc = this.docs.get(params.uri);
        const docState = this.stateStore.get(params.uri);
        if (!doc || !docState || !docState.sourceFile) return null;
        return await generateXml(docState.sourceFile, doc.getText(), URI.parse(params.uri).fsPath, this.resolveIncludePath);
    }

    public async buildCustomLibraryCache(params: { folderPath: string }) {
        try {
            const cacheFile = await buildCustomLibraryCache(params.folderPath);
            this.client.showInformationMessage(`Successfully generated custom library cache at: ${cacheFile}. You can add this path to 'tallyTDL.externalLibraries' in your settings.`);
        } catch (err) {
            this.client.showErrorMessage(`Failed to build custom library cache: ${err}`);
        }
    }
}
