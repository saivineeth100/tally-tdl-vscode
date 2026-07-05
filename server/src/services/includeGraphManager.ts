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

    private activeUris = new Set<string>();
    private isActiveUrisCacheDirty = true;

    public invalidateCache(): void {
        this.isActiveUrisCacheDirty = true;
        this.projectNodesCache.clear();
    }

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
        this.invalidateCache();

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

    private rebuildActiveUrisCache(): void {
        if (!this.isActiveUrisCacheDirty) return;
        this.activeUris.clear();
        const queue: string[] = [];

        if (this.tpjFiles.size > 0) {
            // 1. If .tpj files exist, only .tpj files and their includes are active
            for (const tpj of this.tpjFiles) {
                const norm = normalizeUri(tpj);
                if (!this.activeUris.has(norm)) {
                    this.activeUris.add(norm);
                    queue.push(norm);
                }
            }
            
            // Traverse down the include graph from .tpj files
            while (queue.length > 0) {
                const curr = queue.pop()!;
                const children = this.includeGraph.get(curr);
                if (children) {
                    for (const child of children) {
                        const normChild = normalizeUri(child);
                        if (!this.activeUris.has(normChild)) {
                            this.activeUris.add(normChild);
                            queue.push(normChild);
                        }
                    }
                }
            }
        } else {
            // 2. If NO .tpj files exist, open files and their connected files (ancestors & descendants) are active.
            // First, find all ancestors (roots) of the open files
            const roots = new Set<string>();
            const visitedParents = new Set<string>();

            for (const [openUri] of this.stateStore.getAllDocs()) {
                const norm = normalizeUri(openUri);
                const queueParents = [norm];
                while (queueParents.length > 0) {
                    const curr = queueParents.pop()!;
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
            }

            // Now, traverse down from those roots
            for (const root of roots) {
                if (!this.activeUris.has(root)) {
                    this.activeUris.add(root);
                    queue.push(root);
                }
            }

            while (queue.length > 0) {
                const curr = queue.pop()!;
                const children = this.includeGraph.get(curr);
                if (children) {
                    for (const child of children) {
                        const normChild = normalizeUri(child);
                        if (!this.activeUris.has(normChild)) {
                            this.activeUris.add(normChild);
                            queue.push(normChild);
                        }
                    }
                }
            }
        }

        this.isActiveUrisCacheDirty = false;
    }

    public isUriActive(targetUri: string): boolean {
        this.rebuildActiveUrisCache();
        return this.activeUris.has(normalizeUri(targetUri));
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
            const curr = queueParents.pop()!;
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
            const curr = queueChildren.pop()!;
            if (!projectNodes.has(curr)) {
                projectNodes.add(curr);
                const children = this.includeGraph.get(curr);
                if (children) {
                    queueChildren.push(...children);
                }
            }
        }

        const lowerProjectNodes = new Set(Array.from(projectNodes).map(u => normalizeUri(u).toLowerCase()));
        this.projectNodesCache.set(normUri, lowerProjectNodes);
        return lowerProjectNodes;
    }

    public notifyActiveUrisChanged(): void {
        this.rebuildActiveUrisCache();
        const activeUris: string[] = [];
        
        for (const [uri, scope] of this.stateStore.tdlScopeManager.fileMap.entries()) {
            const isActive = this.activeUris.has(uri);
            scope.parent = isActive ? this.stateStore.tdlScopeManager.projectScope : this.stateStore.tdlScopeManager.workspaceScope;
            if (isActive) {
                activeUris.push(uri);
            }
        }
        for (const [uri, scope] of this.stateStore.xmlScopeManager.fileMap.entries()) {
            const isActive = this.activeUris.has(uri);
            scope.parent = isActive ? this.stateStore.xmlScopeManager.projectScope : this.stateStore.xmlScopeManager.workspaceScope;
            if (isActive) {
                activeUris.push(uri);
            }
        }

        this.client.notify('tdl/activeUrisChanged', { activeUris });
    }
}
