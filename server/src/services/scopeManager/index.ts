import { SymbolInfo, SymbolKind, SymbolTable } from '../symbolTable';
import { SourceFile } from '../../parser/ast';
import { Scope, ScopeKind, OffsetRange, ScopeNodeDTO, ScopeTreeDTO, getSemanticTypeFromSymbol } from './types';
import { IScopeManager, buildFileScope } from './scopeBuilder';
import { IScopeResolverState, resolveSymbol, getAllVariablesInScope, getReachableChildren } from './scopeResolver';

export * from './types';
export * from './scopeBuilder';
export * from './scopeResolver';

/**
 * Manages the scope hierarchy and symbol resolution
 */
export class ScopeManager implements IScopeManager, IScopeResolverState {
    private globalScope: Scope;
    public projectScope: Scope;
    public fileMap = new Map<string, Scope>(); // URI -> FileScope
    public metadata: any;

    /** Tracks structural usage graph (childDefinitionId -> Set of parentDefinitionIds) */
    public parentDefinitions = new Map<string, Set<string>>();
    /** Tracks structural usage graph (parentDefinitionId -> Set of childDefinitionIds) */
    public childDefinitions = new Map<string, Set<string>>();
    /** Tracks 'Use' inheritance graph (DefinitionId -> Set of ParentDefinitionIds it Uses) */
    public useInheritance = new Map<string, Set<string>>();
    /** Tracks explicitly included files across the project */
    public includedFiles = new Set<string>();

    constructor(private symbolTable: SymbolTable) {
        // Initialize Root Scopes
        this.globalScope = this.createScope(ScopeKind.Global, 'global');
        this.projectScope = this.createScope(ScopeKind.Project, 'project', this.globalScope);
    }

    /**
     * Initialize Global Scope with metadata (System definitions)
     */
    initializeGlobalScope(metadata: any): void {
        this.metadata = metadata;
        // Populating global scope with system functions ($$...)
        if (metadata && metadata.functions) {
            for (const func of metadata.functions) {
                const name = func.Name;
                const symbol: SymbolInfo = {
                    name,
                    kind: SymbolKind.Function,
                    uri: 'global:metadata',
                    start: 0,
                    end: 0,
                    definitionType: 'Function'
                };
                this.globalScope.symbols.set(name.toLowerCase(), symbol);
            }
        }
    }

    /**
     * Create a new scope
     */
    createScope(kind: ScopeKind, id: string, parent?: Scope, range?: OffsetRange, uri?: string): Scope {
        const scope: Scope = {
            id,
            kind,
            parent,
            children: [],
            symbols: new Map(),
            range,
            uri
        };
        if (parent) {
            parent.children.push(scope);
        }
        return scope;
    }

    /**
     * Remove scopes associated with a file
     */
    removeFileScope(uri: string): void {
        const fileScope = this.fileMap.get(uri);
        if (fileScope) {
            this.projectScope.children = this.projectScope.children.filter(c => c !== fileScope);
            this.fileMap.delete(uri);
        }
        
        // Remove global symbols that were defined in this file
        for (const [key, sym] of this.projectScope.symbols.entries()) {
            if (sym.uri === uri) {
                this.projectScope.symbols.delete(key);
            }
        }
    }

    /**
     * Build scopes for a source file
     */
    buildFileScope(uri: string, sourceFile: SourceFile): Scope {
        return buildFileScope(this, uri, sourceFile);
    }

    /**
     * Find the most specific scope at a given offset in a document
     */
    getScopeAt(uri: string, offset: number): Scope | undefined {
        const fileScope = this.fileMap.get(uri);
        if (!fileScope) return undefined;

        return this.findScopeRecursive(fileScope, offset);
    }

    private findScopeRecursive(scope: Scope, offset: number): Scope {
        for (const child of scope.children) {
            if (child.range && offset >= child.range.start && offset <= child.range.end) {
                return this.findScopeRecursive(child, offset);
            }
        }
        return scope;
    }

    public getScopeById(id: string): Scope | undefined {
        return this.findDefinitionScope(id);
    }

    public findDefinitionScope(id: string): Scope | undefined {
        const lowerId = id.toLowerCase();
        for (const fileScope of this.fileMap.values()) {
            const found = fileScope.children.find(c => c.id.toLowerCase() === lowerId);
            if (found) return found;
        }
        return this.projectScope.children.find(c => c.id.toLowerCase() === lowerId);
    }

    public findGlobalSymbolsByName(name: string, projectScope?: Set<string>): SymbolInfo[] {
        return this.symbolTable.findAllByName(name, projectScope);
    }

    /**
     * Resolve a symbol name starting from a specific scope and moving up
     */
    resolve(name: string, initialScope: Scope, projectScope?: Set<string>): SymbolInfo | undefined {
        return resolveSymbol(this, name, initialScope, projectScope);
    }

    /**
     * Get all variables reachable from a specific scope (for completion)
     */
    public getAllVariablesInScope(initialScope: Scope): Map<string, SymbolInfo> {
        return getAllVariablesInScope(this, initialScope);
    }

    /**
     * Traverse downwards from a scope to find all definitions of a specific type (e.g. 'Field').
     */
    public getReachableChildren(scope: Scope, targetType: string): SymbolInfo[] {
        return getReachableChildren(this, scope, targetType);
    }

    /**
     * Serialize the entire scope hierarchy relevant to a file for debugging/visualization
     */
    public serializeScopeTree(uri: string): ScopeTreeDTO {
        const fileScope = this.fileMap.get(uri);

        const serializeNode = (node: Scope): ScopeNodeDTO => {
            const symbols = Array.from(node.symbols.values()).map(s => ({
                name: s.name,
                kind: typeof s.kind === 'number' ? SymbolKind[s.kind] || 'Variable' : s.kind.toString(),
                definitionType: s.definitionType
            }));

            let children = node.children;
            if (node.kind === ScopeKind.Project && fileScope) {
                children = children.filter(c => c === fileScope);
            }

            const parentIds = this.parentDefinitions.get(node.id.toLowerCase());
            const structuralParents = parentIds ? Array.from(parentIds) : undefined;

            const childIds = this.childDefinitions.get(node.id.toLowerCase());
            const structuralChildren = childIds ? Array.from(childIds) : undefined;

            const useIds = this.useInheritance.get(node.id.toLowerCase());
            const usedDefinitions = useIds ? Array.from(useIds) : undefined;

            return {
                id: node.id,
                kind: node.kind,
                range: node.range,
                structuralParents,
                structuralChildren,
                usedDefinitions,
                symbols,
                children: children.map(c => serializeNode(c))
            };
        };

        return {
            globalScope: serializeNode(this.globalScope),
            projectScope: serializeNode(this.projectScope)
        };
    }
}
