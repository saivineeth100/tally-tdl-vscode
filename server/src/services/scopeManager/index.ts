import { SymbolInfo, SymbolKind, SymbolTable } from '../symbolTable';
import { SourceFile } from '../../parser/ast';
import { getInterchangeableTypes, normalizeTypeName } from '../utils';
import { Scope, ScopeKind, OffsetRange, ScopeNodeDTO, ScopeTreeDTO, PaginatedSymbolsDTO, getSemanticTypeFromSymbol, ModifierContribution, GlobalScope, ProjectScope, FileScope, DefinitionScope, FunctionScope, BlockScope, hasDefinitions, hasFunctionsAndActions, hasAttributes, hasSchemas } from './types';
import { IScopeManager, buildFileScope } from './scopeBuilder';
import { IScopeResolverState, resolveSymbol, resolveVariable, resolveFunction, resolveAction, resolveDefinition, resolveAttribute, resolveSchema, getAllVariablesInScope, getReachableChildren, ResolutionContext } from './scopeResolver';

export * from './types';
export * from './scopeBuilder';
export * from './scopeResolver';

/**
 * Manages the scope hierarchy and symbol resolution
 */
export class ScopeManager implements IScopeManager, IScopeResolverState {
    public globalScope: GlobalScope;
    public projectScope: ProjectScope;
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
    
    /** URI -> Set of graph relationship keys contributed by that URI */
    public uriGraphContributions = new Map<string, {
        parentDefs: Set<string>;
        childDefs: Set<string>;
        useInherit: Set<string>;
        includes: Set<string>;
        modifiers: Set<string>;
    }>();

    /** Modifier contributions indexed by target definition ID */
    public modifierContributions = new Map<string, ModifierContribution[]>();

    constructor(private symbolTable: SymbolTable) {
        // Initialize Root Scopes
        this.globalScope = this.createGlobalScope('global');
        this.projectScope = this.createProjectScope('project', this.globalScope);
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
    createGlobalScope(id: string): GlobalScope {
        return {
            id,
            kind: ScopeKind.Global,
            childScopes: [],
            variables: new Map(),
            functions: new Map(),
            actions: new Map(),
            attributes: new Map(),
            schemas: new Map(),
            definitions: new Map()
        };
    }

    createProjectScope(id: string, parent: GlobalScope): ProjectScope {
        const scope: ProjectScope = {
            id,
            kind: ScopeKind.Project,
            parent,
            childScopes: [],
            variables: new Map(),
            definitions: new Map()
        };
        parent.childScopes.push(scope);
        return scope;
    }

    createFileScope(id: string, parent: ProjectScope, range: OffsetRange, uri: string): FileScope {
        const scope: FileScope = {
            id,
            kind: ScopeKind.File,
            parent,
            childScopes: [],
            variables: new Map(),
            range,
            uri
        };
        parent.childScopes.push(scope);
        return scope;
    }

    createDefinitionScope(id: string, parent: Scope, range: OffsetRange, uri: string): DefinitionScope {
        const scope: DefinitionScope = {
            id,
            kind: ScopeKind.Definition,
            parent,
            childScopes: [],
            variables: new Map(),
            structuralChildren: new Map(),
            uses: new Set(),
            range,
            uri
        };
        parent.childScopes.push(scope);
        return scope;
    }

    createFunctionScope(id: string, parent: Scope, range: OffsetRange, uri: string): FunctionScope {
        const scope: FunctionScope = {
            id,
            kind: ScopeKind.Function,
            parent,
            childScopes: [],
            variables: new Map(),
            range,
            uri
        };
        parent.childScopes.push(scope);
        return scope;
    }

    createBlockScope(id: string, parent: Scope, range: OffsetRange, uri: string): BlockScope {
        const scope: BlockScope = {
            id,
            kind: ScopeKind.Block,
            parent,
            childScopes: [],
            variables: new Map(),
            range,
            uri
        };
        parent.childScopes.push(scope);
        return scope;
    }

    /**
     * Remove scopes associated with a file
     */
    removeFileScope(uri: string): void {
        const fileScope = this.fileMap.get(uri);
        if (fileScope) {
            this.projectScope.childScopes = this.projectScope.childScopes.filter(c => c !== fileScope);
            this.fileMap.delete(uri);
        }
        
        // Remove global symbols that were defined in this file
        const clearFlatMap = (map: Map<string, any>) => {
            for (const [key, sym] of map.entries()) {
                if (sym?.uri === uri) map.delete(key);
            }
        };
        const clearNestedMap = (outerMap: Map<string, Map<string, any>>) => {
            for (const [outerKey, innerMap] of outerMap.entries()) {
                for (const [innerKey, sym] of innerMap.entries()) {
                    if (sym?.uri === uri) innerMap.delete(innerKey);
                }
                if (innerMap.size === 0) outerMap.delete(outerKey);
            }
        };
        clearFlatMap(this.projectScope.variables);
        clearNestedMap(this.projectScope.definitions);

        if (!this.uriGraphContributions) this.uriGraphContributions = new Map();

        // Clean graph contributions owned by this URI
        const contributions = this.uriGraphContributions.get(uri);
        if (contributions) {
            for (const item of contributions.parentDefs) {
                const [childId, parentId] = item.split('::');
                const set = this.parentDefinitions.get(childId);
                if (set) {
                    set.delete(parentId);
                    if (set.size === 0) this.parentDefinitions.delete(childId);
                }
            }
            for (const item of contributions.childDefs) {
                const [parentId, childId] = item.split('::');
                const set = this.childDefinitions.get(parentId);
                if (set) {
                    set.delete(childId);
                    if (set.size === 0) this.childDefinitions.delete(parentId);
                }
            }
            for (const item of contributions.useInherit) {
                const [defId, parentDefId] = item.split('::');
                const set = this.useInheritance.get(defId);
                if (set) {
                    set.delete(parentDefId);
                    if (set.size === 0) this.useInheritance.delete(defId);
                }
            }
            for (const inc of contributions.includes) {
                this.includedFiles.delete(inc);
            }
            for (const targetDefId of contributions.modifiers) {
                const existing = this.modifierContributions.get(targetDefId);
                if (existing) {
                    const filtered = existing.filter(c => c.uri !== uri);
                    if (filtered.length > 0) {
                        this.modifierContributions.set(targetDefId, filtered);
                    } else {
                        this.modifierContributions.delete(targetDefId);
                    }
                }
            }
            this.uriGraphContributions.delete(uri);
        }
    }

    public registerModifierContribution(contribution: ModifierContribution): void {
        const key = contribution.targetDefinitionId.toLowerCase();
        const existing = this.modifierContributions.get(key) || [];
        existing.push(contribution);
        this.modifierContributions.set(key, existing);
        this.recordGraphContribution(contribution.uri, 'modifier', key);
    }

    public recordGraphContribution(uri: string, type: 'parentDef' | 'childDef' | 'useInherit' | 'include' | 'modifier', key1: string, key2?: string): void {
        if (!this.uriGraphContributions) this.uriGraphContributions = new Map();
        let contrib = this.uriGraphContributions.get(uri);
        if (!contrib) {
            contrib = {
                parentDefs: new Set<string>(),
                childDefs: new Set<string>(),
                useInherit: new Set<string>(),
                includes: new Set<string>(),
                modifiers: new Set<string>()
            };
            this.uriGraphContributions.set(uri, contrib);
        }
        
        if (type === 'parentDef' && key2) contrib.parentDefs.add(`${key1}::${key2}`);
        if (type === 'childDef' && key2) contrib.childDefs.add(`${key1}::${key2}`);
        if (type === 'useInherit' && key2) contrib.useInherit.add(`${key1}::${key2}`);
        if (type === 'include') contrib.includes.add(key1);
        if (type === 'modifier') contrib.modifiers.add(key1);
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
        for (const child of scope.childScopes) {
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
            const found = fileScope.childScopes.find(c => c.id.toLowerCase() === lowerId);
            if (found) return found;
        }
        return undefined;
    }

    public findGlobalSymbolsByName(name: string, projectScope?: Set<string>): SymbolInfo[] {
        return this.symbolTable.findAllByName(name, projectScope);
    }

    /**
     * Resolve a symbol name generically when the exact type is unknown (legacy)
     */
    resolve(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext): SymbolInfo | undefined {
        return resolveSymbol(this, name, initialScope, projectScope, callerContext);
    }

    public resolveVariable(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext) {
        return resolveVariable(this, name, initialScope, projectScope, callerContext);
    }

    public resolveFunction(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext) {
        return resolveFunction(this, name, initialScope, projectScope, callerContext);
    }

    public resolveAction(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext) {
        return resolveAction(this, name, initialScope, projectScope, callerContext);
    }

    public resolveDefinition(name: string, defType: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext) {
        return resolveDefinition(this, name, defType, initialScope, projectScope, callerContext);
    }

    public resolveAttribute(name: string, defType: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext) {
        return resolveAttribute(this, name, defType, initialScope, projectScope, callerContext);
    }

    public resolveSchema(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext) {
        return resolveSchema(this, name, initialScope, projectScope, callerContext);
    }

    /**
     * Get all variables reachable from a specific scope (for completion)
     */
    public getAllVariablesInScope(initialScope: Scope, callerContext?: ResolutionContext): Map<string, SymbolInfo> {
        return getAllVariablesInScope(this, initialScope, callerContext);
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
            if (hasFunctionsAndActions(node)) {
                if (node.functions.size > 0) symbolGroups.push({ kind: 'Functions', count: node.functions.size });
                if (node.actions.size > 0) symbolGroups.push({ kind: 'Actions', count: node.actions.size });
            }
            if (hasAttributes(node)) {
                let attrCount = 0;
                for (const attrMap of node.attributes.values()) {
                    attrCount += attrMap.size;
                }
                if (attrCount > 0) symbolGroups.push({ kind: 'Attributes', count: attrCount });
            }
            if (hasSchemas(node) && node.schemas.size > 0) symbolGroups.push({ kind: 'Schemas', count: node.schemas.size });
            if (hasDefinitions(node)) {
                for (const [defType, defMap] of node.definitions.entries()) {
                    if (defMap.size > 0) {
                        symbolGroups.push({ kind: defType, count: defMap.size });
                    }
                }
            }

            let children = node.childScopes;
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
            } else if (lowerKind === 'functions' && hasFunctionsAndActions(scope)) {
                symbols = Array.from(scope.functions.values());
            } else if (lowerKind === 'actions' && hasFunctionsAndActions(scope)) {
                symbols = Array.from(scope.actions.values());
            } else if (lowerKind === 'attributes' && hasAttributes(scope)) {
                for (const attrMap of scope.attributes.values()) {
                    symbols.push(...Array.from(attrMap.values()));
                }
            } else if (lowerKind === 'schemas' && hasSchemas(scope)) {
                symbols = Array.from(scope.schemas.values());
            } else if (hasDefinitions(scope)) {
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

    /**
     * Search for symbols matching a query and optional type filter
     * @param query Search query (name match)
     * @param typeFilter Optional type filter (e.g. "Report", "Field")
     * @param maxResults Maximum number of results to return
     * @returns Array of matching symbols
     */
    public searchWorkspaceSymbols(query: string, typeFilter?: string, maxResults: number = 100): SymbolInfo[] {
        const result: SymbolInfo[] = [];
        const lowerQuery = query.toLowerCase();
        const lowerTypeFilter = typeFilter ? normalizeTypeName(typeFilter) : undefined;

        for (const [defType, defMap] of this.projectScope.definitions.entries()) {
            const normalizedDefType = normalizeTypeName(defType);
            if (lowerTypeFilter && normalizedDefType !== lowerTypeFilter) {
                continue;
            }

            for (const [name, sym] of defMap.entries()) {
                if (!lowerQuery || name.toLowerCase().includes(lowerQuery)) {
                    result.push(sym);
                    if (result.length >= maxResults) {
                        return result;
                    }
                }
            }
        }
        return result;
    }
}
