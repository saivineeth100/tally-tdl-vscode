import { SymbolInfo, SymbolKind, SymbolTable, VariableSymbol } from '../symbolTable';
import { SourceFile } from '../../parser/ast';
import { getInterchangeableTypes, normalizeTypeName } from '../utils';
import { Scope, ScopeKind, OffsetRange, ScopeNodeDTO, ScopeTreeDTO, PaginatedSymbolsDTO, getSemanticTypeFromSymbol, ModifierContribution, GlobalScope, ProjectScope, FileScope, DefinitionScope, FunctionScope, BlockScope, hasDefinitions, hasFunctionsAndActions, hasAttributes, hasSchemas } from './types';
import { ScopeViewerService } from './scopeViewerService';
import { IScopeManager, buildFileScope } from './scopeBuilder';
import { IScopeResolverState, resolveSymbol, resolveVariable, resolveFormula, resolveFunction, resolveAction, resolveDefinition, resolveAttribute, resolveSchema, getAllVariablesInScope, getAllFormulasInScope, getReachableChildren, ResolutionContext } from './scopeResolver';

export * from './types';
export * from './scopeBuilder';
export * from './scopeResolver';

/**
 * Manages the scope hierarchy and symbol resolution
 */
export class ScopeManager implements IScopeManager, IScopeResolverState {
    public globalScope: GlobalScope;
    public readonly projectScope: ProjectScope;
    public fileMap = new Map<string, Scope>(); // URI -> FileScope
    public metadata: any;
    public existingDefinitions = new Map<string, Set<string>>();
    public definitionTypeLabels = new Map<string, string>(); // normalized -> Original Casing
    public keywordSets = new Map<string, string[]>();
    public primarySchemaNames: string[] = [];

    private _viewer?: ScopeViewerService;

    public get viewer(): ScopeViewerService {
        if (!this._viewer) {
            this._viewer = new ScopeViewerService(this);
        }
        return this._viewer;
    }

    /** Tracks structural usage graph (childDefinitionId -> Set of parentDefinitionIds) */
    public parentDefinitions = new Map<string, Set<string>>();
    /** Tracks structural usage graph (parentDefinitionId -> Set of childDefinitionIds) */
    public childDefinitions = new Map<string, Set<string>>();
    /** Tracks 'Use' inheritance graph (DefinitionId -> Set of ParentDefinitionIds it Uses) */
    public useInheritance = new Map<string, Set<string>>();
    public inUseInheritance = new Map<string, Set<string>>();
    /** Tracks explicitly included files across the project */
    public includedFiles = new Set<string>();
    
    /** URI -> Set of graph relationship keys contributed by that URI */
    public uriGraphContributions = new Map<string, {
        parentDefs: Set<string>;
        childDefs: Set<string>;
        useInherit: Set<string>;
        inUseInherit: Set<string>;
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
            formulas: new Map(),
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
            formulas: new Map(),
            definitions: new Map()
        };
        return scope;
    }

    createFileScope(id: string, parent: ProjectScope, range: OffsetRange, uri: string): FileScope {
        const scope: FileScope = {
            id,
            kind: ScopeKind.File,
            parent,
            childScopes: [],
            variables: new Map(),
            formulas: new Map(),
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
            formulas: new Map(),
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
            formulas: new Map(),
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
            formulas: new Map(),
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
            for (const item of contributions.inUseInherit) {
                const [defId, parentDefId] = item.split('::');
                const set = this.inUseInheritance.get(defId);
                if (set) {
                    set.delete(parentDefId);
                    if (set.size === 0) this.inUseInheritance.delete(defId);
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

    public recordGraphContribution(uri: string, type: 'parentDef' | 'childDef' | 'useInherit' | 'inUseInherit' | 'include' | 'modifier', key1: string, key2?: string): void {
        if (!this.uriGraphContributions) this.uriGraphContributions = new Map();
        let contrib = this.uriGraphContributions.get(uri);
        if (!contrib) {
            contrib = {
                parentDefs: new Set<string>(),
                childDefs: new Set<string>(),
                useInherit: new Set<string>(),
                inUseInherit: new Set<string>(),
                includes: new Set<string>(),
                modifiers: new Set<string>()
            };
            this.uriGraphContributions.set(uri, contrib);
        }
        
        if (type === 'parentDef' && key2) contrib.parentDefs.add(`${key1}::${key2}`);
        if (type === 'childDef' && key2) contrib.childDefs.add(`${key1}::${key2}`);
        if (type === 'useInherit' && key2) contrib.useInherit.add(`${key1}::${key2}`);
        if (type === 'inUseInherit' && key2) contrib.inUseInherit.add(`${key1}::${key2}`);
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

    public resolveVariable(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext): VariableSymbol | undefined {
        return resolveVariable(this, name, initialScope, projectScope, callerContext);
    }

    public resolveFormula(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext): import('../../models/symbols').FormulaSymbol | undefined {
        return resolveFormula(this, name, initialScope, projectScope, callerContext);
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
    public getAllVariablesInScope(initialScope: Scope, callerContext?: ResolutionContext): Map<string, VariableSymbol> {
        return getAllVariablesInScope(this, initialScope, callerContext);
    }

    public getAllFormulasInScope(initialScope: Scope, callerContext?: ResolutionContext, localOnly?: boolean): Map<string, import('../../models/symbols').FormulaSymbol> {
        return getAllFormulasInScope(this, initialScope, callerContext, localOnly);
    }

    /**
     * Traverse downwards from a scope to find all definitions of a specific type (e.g. 'Field').
     */
    public getReachableChildren(scope: Scope, targetType: string): SymbolInfo[] {
        return getReachableChildren(this, scope, targetType);
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

        // Search attributes
        if (!lowerTypeFilter || lowerTypeFilter === 'attribute') {
            for (const attrMap of this.globalScope.attributes.values()) {
                for (const [name, sym] of attrMap.entries()) {
                    if (!lowerQuery || name.toLowerCase().includes(lowerQuery)) {
                        result.push(sym);
                        if (result.length >= maxResults) return result;
                    }
                }
            }
        }

        // Search schemas
        if (!lowerTypeFilter || lowerTypeFilter === 'schema') {
            for (const [name, sym] of this.globalScope.schemas.entries()) {
                if (!lowerQuery || name.toLowerCase().includes(lowerQuery)) {
                    result.push(sym);
                    if (result.length >= maxResults) return result;
                }
            }
        }

        return result;
    }
}
