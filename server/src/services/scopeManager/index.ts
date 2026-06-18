import { SymbolInfo, SymbolKind, SymbolTable } from '../symbolTable';
import { SourceFile } from '../../parser/ast';
import { Scope, ScopeKind, OffsetRange, ScopeNodeDTO, ScopeTreeDTO, PaginatedSymbolsDTO, getSemanticTypeFromSymbol } from './types';
import { IScopeManager, buildFileScope } from './scopeBuilder';
import { IScopeResolverState, resolveSymbol, resolveVariable, resolveFunction, resolveDefinition, resolveAttribute, resolveSchema, getAllVariablesInScope, getReachableChildren } from './scopeResolver';

export * from './types';
export * from './scopeBuilder';
export * from './scopeResolver';

/**
 * Manages the scope hierarchy and symbol resolution
 */
export class ScopeManager implements IScopeManager, IScopeResolverState {
    public globalScope: Scope;
    public projectScope: Scope;
    public fileMap = new Map<string, Scope>(); // URI -> FileScope
    public metadata: any;
    public existingDefinitions = new Map<string, Set<string>>();
    public keywordSets = new Map<string, string[]>();
    public primarySchemaNames: string[] = [];

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
    initializeGlobalScope(): void {
        // Global scope initialization is now handled directly by the Metadata Loader
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
            variables: new Map(),
            functions: new Map(),
            actions: new Map(),
            attributes: new Map(),
            schemas: new Map(),
            definitions: new Map(),
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
        const clearMap = (map: Map<string, any>) => {
            for (const [key, sym] of map.entries()) {
                if (sym.uri === uri) {
                    map.delete(key);
                }
            }
        };
        clearMap(this.projectScope.variables);
        clearMap(this.projectScope.functions);
        clearMap(this.projectScope.actions);
        for (const attrMap of this.projectScope.attributes.values()) {
            clearMap(attrMap);
        }
        clearMap(this.projectScope.schemas);
        for (const defMap of this.projectScope.definitions.values()) {
            clearMap(defMap);
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
     * Resolve a symbol name generically when the exact type is unknown (legacy)
     */
    resolve(name: string, initialScope: Scope, projectScope?: Set<string>): SymbolInfo | undefined {
        return resolveSymbol(this, name, initialScope, projectScope);
    }

    public resolveVariable(name: string, initialScope: Scope, projectScope?: Set<string>) {
        return resolveVariable(this, name, initialScope, projectScope);
    }

    public resolveFunction(name: string, initialScope: Scope, projectScope?: Set<string>) {
        return resolveFunction(this, name, initialScope, projectScope);
    }

    public resolveDefinition(name: string, defType: string, initialScope: Scope, projectScope?: Set<string>) {
        return resolveDefinition(this, name, defType, initialScope, projectScope);
    }

    public resolveAttribute(name: string, defType: string, initialScope: Scope, projectScope?: Set<string>) {
        return resolveAttribute(this, name, defType, initialScope, projectScope);
    }

    public resolveSchema(name: string, initialScope: Scope, projectScope?: Set<string>) {
        return resolveSchema(this, name, initialScope, projectScope);
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
            const symbolGroups: { kind: string, count: number }[] = [];
            if (node.variables.size > 0) symbolGroups.push({ kind: 'Variables', count: node.variables.size });
            if (node.functions.size > 0) symbolGroups.push({ kind: 'Functions', count: node.functions.size });
            if (node.actions.size > 0) symbolGroups.push({ kind: 'Actions', count: node.actions.size });
            let attrCount = 0;
            for (const attrMap of node.attributes.values()) {
                attrCount += attrMap.size;
            }
            if (attrCount > 0) symbolGroups.push({ kind: 'Attributes', count: attrCount });
            if (node.schemas.size > 0) symbolGroups.push({ kind: 'Schemas', count: node.schemas.size });
            for (const [defType, defMap] of node.definitions.entries()) {
                if (defMap.size > 0) {
                    symbolGroups.push({ kind: defType, count: defMap.size });
                }
            }


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
                symbolGroups,
                children: children.map(c => serializeNode(c))
            };
        };

        return {
            globalScope: serializeNode(this.globalScope),
            projectScope: serializeNode(this.projectScope)
        };
    }

    /**
     * Get paginated symbols for a specific scope and kind
     */
    public getSymbolsPaginated(scopeId: string, kind: string, page: number, limit: number, query?: string): PaginatedSymbolsDTO {
        const scope = this.getScopeById(scopeId) || (scopeId === 'global' ? this.globalScope : this.projectScope);
        let symbols: SymbolInfo[] = [];

        if (scope) {
            const lowerKind = kind.toLowerCase();
            if (lowerKind === 'variables') {
                symbols = Array.from(scope.variables.values());
            } else if (lowerKind === 'functions') {
                symbols = Array.from(scope.functions.values());
            } else if (lowerKind === 'actions') {
                symbols = Array.from(scope.actions.values());
            } else if (lowerKind === 'attributes') {
                for (const attrMap of scope.attributes.values()) {
                    symbols.push(...Array.from(attrMap.values()));
                }
            } else if (lowerKind === 'schemas') {
                symbols = Array.from(scope.schemas.values());
            } else {
                // Check definitions
                for (const [defType, defMap] of scope.definitions.entries()) {
                    if (defType.toLowerCase() === lowerKind || defType === kind) {
                        symbols.push(...Array.from(defMap.values()));
                    }
                }
            }
        }

        if (query) {
            const lowerQuery = query.toLowerCase();
            symbols = symbols.filter(s => s.name.toLowerCase().includes(lowerQuery));
        }

        // Sort by name for consistent pagination
        symbols.sort((a, b) => a.name.localeCompare(b.name));

        const totalCount = symbols.length;
        const startIndex = (page - 1) * limit;
        const paginatedSymbols = symbols.slice(startIndex, startIndex + limit);

        return {
            symbols: paginatedSymbols,
            totalCount,
            page,
            limit,
            kind
        };
    }
}
