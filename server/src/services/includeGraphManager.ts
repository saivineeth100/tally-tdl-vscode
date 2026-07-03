import { URI } from 'vscode-uri';
import { SourceFile } from '../core/ast/ast';
import { normalizeUri } from '../utils/uri';
import { DocumentStateStore } from './documentStateStore';
import { ClientGateway } from '../ports/clientGateway';

/**
 * Manages the include relationships between files in the workspace.
 * Builds a directed graph to track which files include which other files,
 * enabling intelligent workspace scanning and scoped validations.
 */
export class IncludeGraphManager {
    /** Directed graph: URI -> Set of URIs it explicitly includes via [Include: ...] */
    public includeGraph = new Map<string, Set<string>>();
    
    /** Reverse directed graph: URI -> Set of URIs that include it */
    public parentGraph = new Map<string, Set<string>>();
    
    /** Cache of all files that belong to the same project (reachable graph) */
    public projectNodesCache = new Map<string, Set<string>>();
    
    /** Set of root project files discovered during workspace scan (.tpj files) */
    public tpjFiles = new Set<string>();

    constructor(
        private stateStore: DocumentStateStore,
        private client: ClientGateway,
        public resolveIncludePath: (currentPath: string, includeName: string) => string | null = () => null
    ) {}

    public updateIncludeGraph(uri: string, sourceFile: SourceFile): Set<string> {
        const includes = new Set<string>();
        const currentFsPath = URI.parse(uri).fsPath;

        for (const def of sourceFile.definitions) {
            const normalizedType = def.type?.text?.toLowerCase();
            if ((normalizedType === 'include' || normalizedType === 'import') && def.name) {
                let includeName = def.name.text;
                if (includeName.startsWith('"') && includeName.endsWith('"')) {
                    includeName = includeName.slice(1, -1);
                }

                if (this.resolveIncludePath) {
                    const targetPath = this.resolveIncludePath(currentFsPath, includeName);
                    if (targetPath) {
                        includes.add(normalizeUri(URI.file(targetPath).toString()));
                    }
                }
            }
        }
        
        // Remove old parent links
        const oldIncludes = this.includeGraph.get(uri) || new Set<string>();
        for (const inc of oldIncludes) {
            const parents = this.parentGraph.get(inc);
            if (parents) {
                parents.delete(uri);
                if (parents.size === 0) this.parentGraph.delete(inc);
            }
        }

        this.includeGraph.set(uri, includes);

        // Add new parent links
        for (const inc of includes) {
            const parents = this.parentGraph.get(inc) || new Set<string>();
            parents.add(uri);
            this.parentGraph.set(inc, parents);
        }

        // Clear project nodes cache as graph has changed
        this.projectNodesCache.clear();

        return includes;
    }

    public hasCircularIncludes(startUri: string): boolean {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const dfs = (currentUri: string): boolean => {
            if (recursionStack.has(currentUri)) return true;
            if (visited.has(currentUri)) return false;

            visited.add(currentUri);
            recursionStack.add(currentUri);

            const includes = this.includeGraph.get(currentUri) || new Set<string>();
            for (const nextUri of includes) {
                if (dfs(nextUri)) return true;
            }

            recursionStack.delete(currentUri);
            return false;
        };

        return dfs(startUri);
    }

    public isUriActive(targetUri: string): boolean {
        const normUri = normalizeUri(targetUri);
        const fileScope = this.stateStore.tdlScopeManager.fileMap.get(normUri);
        if (fileScope) {
            return fileScope.parent === this.stateStore.tdlScopeManager.projectScope;
        }
        
        if (this.tpjFiles.size > 0) {
            return this.tpjFiles.has(normUri);
        }
        return this.stateStore.getOpen(normUri) !== undefined;
    }

    public getProjectNodes(targetUri: string): Set<string> {
        const normUri = normalizeUri(targetUri);
        if (this.projectNodesCache.has(normUri)) {
            return this.projectNodesCache.get(normUri)!;
        }

        const roots = new Set<string>();
        const visitedParents = new Set<string>();
        
        const queueParents = [normUri];
        while (queueParents.length > 0) {
            const curr = queueParents.shift()!;
            if (!visitedParents.has(curr)) {
                visitedParents.add(curr);
                const parents = this.parentGraph.get(curr);
                if (!parents || parents.size === 0) {
                    roots.add(curr);
                } else {
                    queueParents.push(...parents);
                }
            }
        }

        if (roots.size === 0) {
            roots.add(normUri);
        }

        const projectNodes = new Set<string>();
        const queueChildren = Array.from(roots);
        while (queueChildren.length > 0) {
            const curr = queueChildren.shift()!;
            if (!projectNodes.has(curr)) {
                projectNodes.add(curr);
                const children = this.includeGraph.get(curr);
                if (children) {
                    queueChildren.push(...children);
                }
            }
        }

        this.projectNodesCache.set(normUri, projectNodes);
        return projectNodes;
    }

    public notifyActiveUrisChanged(): void {
        const activeUris: string[] = [];
        
        for (const [uri, scope] of this.stateStore.tdlScopeManager.fileMap.entries()) {
            if (scope.parent === this.stateStore.tdlScopeManager.projectScope) {
                activeUris.push(uri);
            }
        }
        for (const [uri, scope] of this.stateStore.xmlScopeManager.fileMap.entries()) {
            if (scope.parent === this.stateStore.xmlScopeManager.projectScope) {
                activeUris.push(uri);
            }
        }

        this.client.notify('tdl/activeUrisChanged', { activeUris });
    }
}
