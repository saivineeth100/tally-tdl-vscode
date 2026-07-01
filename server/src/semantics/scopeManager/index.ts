import { SymbolInfo, SymbolKind, VariableSymbol, DefinitionSymbol } from 'tally-tdl-shared';
import { SourceFile } from '../../core/ast/ast';
import { normalizeTypeName } from '../../utils/normalizeUtils';
import { Scope, ScopeKind, OffsetRange, ScopeNodeDTO, ScopeTreeDTO, PaginatedSymbolsDTO, getSemanticTypeFromSymbol, ModifierContribution, GlobalScope, ProjectScope, WorkspaceScope, FileScope, DefinitionScope, FunctionScope, BlockScope, hasDefinitions, hasFunctionsAndActions, hasAttributes, hasSchemas } from './types';
import { ScopeViewerService } from './scopeViewerService';
import { IScopeManager, buildFileScope } from './scopeBuilder';
import { IScopeResolverState, resolveVariable, resolveFormula, resolveFunction, resolveAction, resolveDefinition, resolveAttribute, resolveSchema, getAllVariablesInScope, getAllFormulasInScope, getReachableChildren, getDefinitionsInScope, ResolutionContext } from './scopeResolver';
import { ReferenceIndex } from '../symbols/referenceIndex';

export * from './types';
export * from './scopeBuilder';
export * from './scopeResolver';

/**
 * Manages the scope hierarchy and symbol resolution
 */
export class ScopeManager implements IScopeManager, IScopeResolverState {
    public globalScope: GlobalScope;
    public readonly projectScope: ProjectScope;
    public readonly workspaceScope: WorkspaceScope;
    public fileMap = new Map<string, Scope>(); // URI -> FileScope
    public metadata: any;

    public definitionTypeLabels = new Map<string, string>(); // normalized -> Original Casing
    public keywordSets = new Map<string, string[]>();
    public primarySchemaNames: string[] = [];

    public scopeIndex = new Map<string, Map<string, Scope[]>>();
    public workspaceIndex = new Map<string, Map<string, Scope[]>>();
    public nameIndex = new Map<string, DefinitionSymbol[]>();

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

    // Performance cache for getDefinitionsInScope
    public definitionsInScopeCache = new Map<string, import('tally-tdl-shared').SymbolInfo[]>();

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

    public getProjectDefinition(defType: string, name: string): DefinitionSymbol[] {
        const normalizedType = this.getCanonicalTypeName(normalizeTypeName(defType));
        const projectDefs = this.scopeIndex.get(normalizedType);
        if (projectDefs) {
            const syms = projectDefs.get(normalizeTypeName(name));
            if (syms && syms.length > 0) {
                return syms
                    .filter(s => s.kind === ScopeKind.Definition)
                    .map(s => (s as DefinitionScope).definition)
                    .filter(d => !!d) as DefinitionSymbol[];
            }
        }
        return [];
    }

    public getWorkspaceDefinition(defType: string, name: string): DefinitionSymbol[] {
        const normalizedType = this.getCanonicalTypeName(normalizeTypeName(defType));
        const workspaceDefs = this.workspaceIndex.get(normalizedType);
        if (workspaceDefs) {
            const syms = workspaceDefs.get(normalizeTypeName(name));
            if (syms && syms.length > 0) {
                return syms
                    .filter(s => s.kind === ScopeKind.Definition)
                    .map(s => (s as DefinitionScope).definition)
                    .filter(d => !!d) as DefinitionSymbol[];
            }
        }
        return [];
    }

    public getCanonicalTypeName(normalizedType: string): string {
        const canonical = this.globalScope.interchangeableTypesMap?.get(normalizedType);
        return canonical || normalizedType;
    }

    public getCanonicalAttributeName(normalizedAttributeName: string): string | undefined {
        return this.globalScope.interchangeableAttributesMap?.get(normalizedAttributeName);
    }

    constructor() {
        // Initialize Root Scopes
        this.globalScope = this.createGlobalScope('global');
        this.projectScope = this.createProjectScope('project', this.globalScope);
        this.workspaceScope = this.createWorkspaceScope('workspace', this.globalScope);
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
        const scope: GlobalScope = {
            id,
            kind: ScopeKind.Global,
            childScopes: [],
            variables: new Map(),
            formulas: new Map(),
            functions: new Map(),
            actions: new Map(),
            attributes: new Map(),
            schemas: new Map(),
            definitions: new Map(),
            
            interchangeableAttributesMap: new Map(),
            interchangeableTypesMap: new Map(),
            referenceIndex: new ReferenceIndex()
        };
        
        return scope;
    }

    createProjectScope(id: string, parent: GlobalScope): ProjectScope {
        const scope: ProjectScope = {
            id,
            kind: ScopeKind.Project,
            parent,
            childScopes: [],
            variables: new Map(),
            formulas: new Map(),
            referenceIndex: new ReferenceIndex()
        };
        return scope;
    }

    createWorkspaceScope(id: string, parent: GlobalScope): WorkspaceScope {
        const scope: WorkspaceScope = {
            id,
            kind: ScopeKind.Workspace,
            parent,
            childScopes: [],
            variables: new Map(),
            formulas: new Map(),
            referenceIndex: new ReferenceIndex()
        };
        return scope;
    }

    /**
     * Get all definition types from both global and project scopes
     */
    public getDefinitionTypes(): string[] {
        const types = new Set<string>();
        for (const type of this.globalScope.definitions.keys()) types.add(type);
        for (const type of this.scopeIndex.keys()) types.add(type);
        for (const type of this.definitionTypeLabels.values()) types.add(type);
        return Array.from(types);
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
    public removeFileScope(uri: string): void {
        this.definitionsInScopeCache.clear();
        
        const lowerUri = uri.toLowerCase();
        let fileScopeKeysToRemove: string[] = [];
        for (const k of this.fileMap.keys()) {
            if (k.toLowerCase() === lowerUri) fileScopeKeysToRemove.push(k);
        }

        for (const scopeUri of fileScopeKeysToRemove) {
            const fileScope = this.fileMap.get(scopeUri);
            if (fileScope) {
                // Clean up nameIndex
                if (fileScope.childScopes) {
                    for (const c of fileScope.childScopes) {
                        if (c.kind === ScopeKind.Definition || c.kind === ScopeKind.Function) {
                            const defScope = c as DefinitionScope;
                            if (defScope.definition && defScope.definition.name) {
                                const name = normalizeTypeName(defScope.definition.name);
                                const arr = this.nameIndex.get(name);
                                if (arr) {
                                    const filtered = arr.filter(s => s.uri?.toLowerCase() !== lowerUri);
                                    if (filtered.length === 0) this.nameIndex.delete(name);
                                    else this.nameIndex.set(name, filtered);
                                }
                            }
                        }
                    }
                }

                this.unindexScope(fileScope);
                this.projectScope.childScopes = this.projectScope.childScopes.filter(s => s !== fileScope);
                this.fileMap.delete(scopeUri);
            }
        }

        // Remove global symbols that were defined in this file
        const clearFlatMap = (map: Map<string, any>) => {
            for (const [key, sym] of map.entries()) {
                if (sym?.uri?.toLowerCase() === lowerUri) map.delete(key);
            }
        };
        const clearNestedMap = (outerMap: Map<string, Map<string, any>>) => {
            for (const [outerKey, innerMap] of outerMap.entries()) {
                for (const [innerKey, sym] of innerMap.entries()) {
                    if (sym?.uri?.toLowerCase() === lowerUri) innerMap.delete(innerKey);
                }
                if (innerMap.size === 0) outerMap.delete(outerKey);
            }
        };
        clearFlatMap(this.projectScope.variables);
        clearNestedMap(this.scopeIndex);

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
    buildFileScope(uri: string, sourceFile: SourceFile, isWorkspace: boolean = false): Scope {
        return buildFileScope(this, uri, sourceFile, undefined, isWorkspace ? this.workspaceScope : this.projectScope);
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

    public normalizeScopeId(id: string): string {
        const parts = id.split(':');
        if (parts.length >= 2) {
            const defType = normalizeTypeName(parts[0]);
            const defName = normalizeTypeName(parts.slice(1).join(':'));
            return `${defType}:${defName}`;
        }
        return id.toLowerCase();
    }

    private getRootKind(scope: Scope): ScopeKind {
        let current = scope;
        while (current.parent && current.kind !== ScopeKind.Project && current.kind !== ScopeKind.Workspace && current.kind !== ScopeKind.Global) {
            current = current.parent;
        }
        return current.kind;
    }

    public indexScope(scope: Scope): void {
        const isWorkspace = this.getRootKind(scope) === ScopeKind.Workspace;
        const targetIndex = isWorkspace ? this.workspaceIndex : this.scopeIndex;

        if (scope.kind === ScopeKind.Definition || scope.kind === ScopeKind.Function) {
            const defScope = scope as DefinitionScope;
            if (!defScope.definition?.isModifier && !scope.id.includes('anonymous') && !scope.id.includes('unnamed')) {
                const normalizedId = this.normalizeScopeId(scope.id);
                const parts = normalizedId.split(':');
                const type = parts.length > 1 ? parts[0] : 'unknown';
                const name = parts.length > 1 ? parts.slice(1).join(':') : normalizedId;
                
                let typeMap = targetIndex.get(type);
                if (!typeMap) {
                    typeMap = new Map<string, Scope[]>();
                    targetIndex.set(type, typeMap);
                }
                const arr = typeMap.get(name) || [];
                arr.push(scope);
                typeMap.set(name, arr);
            }
        }

        if (scope.childScopes) {
            for (const c of scope.childScopes) {
                this.indexScope(c);
            }
        }
    }

    public unindexScope(scope: Scope): void {
        const isWorkspace = this.getRootKind(scope) === ScopeKind.Workspace;
        const targetIndex = isWorkspace ? this.workspaceIndex : this.scopeIndex;

        if (scope.kind === ScopeKind.Definition || scope.kind === ScopeKind.Function) {
            if (!scope.id.includes('anonymous') && !scope.id.includes('unnamed')) {
                const normalizedId = this.normalizeScopeId(scope.id);
                const parts = normalizedId.split(':');
                const type = parts.length > 1 ? parts[0] : 'unknown';
                const name = parts.length > 1 ? parts.slice(1).join(':') : normalizedId;
                
                const typeMap = targetIndex.get(type);
                if (typeMap) {
                    const arr = typeMap.get(name);
                    if (arr) {
                        const filtered = arr.filter(s => s !== scope);
                        if (filtered.length === 0) {
                            typeMap.delete(name);
                        } else {
                            typeMap.set(name, filtered);
                        }
                    }
                    if (typeMap.size === 0) {
                        targetIndex.delete(type);
                    }
                }
            }
        }

        if (scope.childScopes) {
            for (const c of scope.childScopes) {
                this.unindexScope(c);
            }
        }
    }

    public getScopeById(id: string): Scope | undefined {
        const lowerId = id.toLowerCase();
        const normalizedId = this.normalizeScopeId(id);
        const parts = normalizedId.split(':');
        const type = parts.length > 1 ? parts[0] : 'unknown';
        const name = parts.length > 1 ? parts.slice(1).join(':') : normalizedId;
        
        const typeMap = this.scopeIndex.get(type);
        if (typeMap) {
            const arr = typeMap.get(name);
            if (arr && arr.length > 0) return arr[0];
        }

        const wsTypeMap = this.workspaceIndex.get(type);
        if (wsTypeMap) {
            const arr = wsTypeMap.get(name);
            if (arr && arr.length > 0) return arr[0];
        }

        // Search global scope just in case it's not indexed
        if (this.globalScope && this.globalScope.childScopes) {
            const foundGlobal = this.globalScope.childScopes.find(c => {
                const cNormalizedId = this.normalizeScopeId(c.id);
                const cParts = cNormalizedId.split(':');
                const cType = cParts.length > 1 ? cParts[0] : 'unknown';
                const cName = cParts.length > 1 ? cParts.slice(1).join(':') : cNormalizedId;
                return cType === type && cName === name;
            });
            if (foundGlobal) return foundGlobal;
        }

        // Fallback for global metadata definitions (which don't have AST Scopes)
        if (lowerId.includes(':') && this.globalScope) {
            const parts = lowerId.split(':');
            const defType = parts[0];
            const defName = parts.slice(1).join(':');
            const typeMap = this.globalScope.definitions.get(defType);
            if (typeMap) {
                const sym = typeMap.get(normalizeTypeName(defName));
                if (sym) {
                    return {
                        id: lowerId,
                        kind: ScopeKind.Definition,
                        parent: this.globalScope,
                        childScopes: [],
                        variables: new Map(),
                        formulas: new Map(),
                        
                        uri: sym.uri,
                        range: { start: sym.start, end: sym.end },
                        definition: sym
                    } as unknown as Scope;
                }
            }
        }

        return undefined;
    }

    public findDefinitionScope(id: string): Scope | undefined {
        return this.getScopeById(id);
    }

    public findGlobalSymbolsByName(name: string, projectScope?: Set<string>): SymbolInfo[] {
        const normalizedName = normalizeTypeName(name);
        const symbols = this.nameIndex.get(normalizedName) || [];
        if (projectScope) {
            return symbols.filter(s => projectScope.has(s.uri.toLowerCase()));
        }
        return symbols;
    }

    public getSymbolCount(): number {
        let count = 0;
        for (const typeMap of this.scopeIndex.values()) {
            count += typeMap.size;
        }
        return count;
    }

    public getSymbolsInDocument(uri: string): SymbolInfo[] {
        const results: SymbolInfo[] = [];
        const fileScope = this.fileMap.get(uri);
        if (fileScope && fileScope.childScopes) {
            for (const child of fileScope.childScopes) {
                if ((child.kind === ScopeKind.Definition || child.kind === ScopeKind.Function) && child.definition) {
                    results.push(child.definition);
                }
            }
        }
        return results;
    }



    public resolveVariable(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext): VariableSymbol | undefined {
        return resolveVariable(this, name, initialScope, projectScope, callerContext);
    }

    public resolveFormula(name: string, initialScope: Scope, projectScope?: Set<string>, callerContext?: ResolutionContext): import('tally-tdl-shared').FormulaSymbol | undefined {
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

    public getAllFormulasInScope(initialScope: Scope, callerContext?: ResolutionContext, localOnly?: boolean): Map<string, import('tally-tdl-shared').FormulaSymbol> {
        return getAllFormulasInScope(this, initialScope, callerContext, localOnly);
    }

    /**
     * Traverse downwards from a scope to find all definitions of a specific type (e.g. 'Field').
     */
    public getReachableChildren(scope: Scope, targetType: string): SymbolInfo[] {
        return getReachableChildren(this, scope, targetType);
    }

    public getDefinitionsInScope(initialScope: Scope, targetDefType: string, callerContext?: ResolutionContext): SymbolInfo[] {
        const context: ResolutionContext = { visitedScopes: new Set(), state: this, initialScope, caller: callerContext };
        return getDefinitionsInScope(context, targetDefType);
    }

    /**
     * Get all definitions globally available by type (workspace + base TDL)
     * Used for auto-completing reference attributes like 'Use' or 'Form'
     */
    public getGlobalDefinitionsByType(defType: string, isActive: boolean = true): import('tally-tdl-shared').DefinitionSymbol[] {
        const normalizedType = normalizeTypeName(defType);
        const results = new Map<string, import('tally-tdl-shared').DefinitionSymbol>();

        // 1. Get Base TDL Definitions (Global Scope)
        const globalDefs = this.globalScope.definitions.get(normalizedType);
        if (globalDefs) {
            for (const [lowerName, sym] of globalDefs.entries()) {
                results.set(lowerName, sym);
            }
        }

        // 2. If active file, get from Project Scope (active projects)
        if (isActive) {
            const projectDefs = this.scopeIndex.get(normalizedType);
            if (projectDefs) {
                for (const [lowerName, syms] of projectDefs.entries()) {
                    for (const sym of syms) {
                        if (sym.kind === ScopeKind.Definition) {
                            const ds = sym as DefinitionScope;
                            if (ds.definition) {
                                results.set(lowerName, ds.definition);
                            }
                        }
                    }
                }
            }
        }

        // 3. Get from Workspace Scope (inactive files)
        // For active files, these are added as fallback/suggestions.
        // For inactive files, this is the ONLY local scope they see.
        const workspaceDefs = this.workspaceIndex.get(normalizedType);
        if (workspaceDefs) {
            for (const [lowerName, syms] of workspaceDefs.entries()) {
                for (const sym of syms) {
                    if (sym.kind === ScopeKind.Definition) {
                        const ds = sym as DefinitionScope;
                        if (ds.definition) {
                            // Only add if not already overridden by ProjectScope (if active)
                            if (!results.has(lowerName)) {
                                results.set(lowerName, ds.definition);
                            }
                        }
                    }
                }
            }
        }

        return Array.from(results.values());
    }

    /**
     * Search for symbols matching a query and optional type filter
     * @param query Search query (name match)
     * @param typeFilter Optional type filter (e.g. "Report", "Field")
     * @param maxResults Maximum number of results to return
     * @returns Array of matching symbols
     */
    public searchWorkspaceSymbols(query: string, typeFilter?: string, maxResults: number = 100, scope?: Set<string>, sourceFilter: 'all' | 'base' | 'project' = 'all'): SymbolInfo[] {
        const result: SymbolInfo[] = [];
        const lowerQuery = query.toLowerCase();
        const normalizedQuery = query ? normalizeTypeName(query) : '';
        const lowerTypeFilter = typeFilter ? normalizeTypeName(typeFilter) : undefined;

        const processTypeMap = (typeMap: Map<string, Scope[]>, checkScope: boolean) => {
            for (const [name, defScopes] of typeMap.entries()) {
                if (!normalizedQuery || name.includes(normalizedQuery)) {
                    for (const defScope of defScopes) {
                        if (defScope.kind === ScopeKind.Global || defScope.kind === ScopeKind.Project || defScope.kind === ScopeKind.Workspace) {
                            continue;
                        }
                        if ((defScope.kind === ScopeKind.Definition || defScope.kind === ScopeKind.Function) && (defScope as DefinitionScope).definition) {
                            const def = (defScope as DefinitionScope).definition!;
                            const isBase = def.uri.startsWith('basetdl://');
                            if (sourceFilter === 'base' && !isBase) continue;
                            if (sourceFilter === 'project' && isBase) continue;

                            if (!checkScope || !scope || scope.has(def.uri) || isBase) {
                                result.push(def);
                                if (result.length >= maxResults) {
                                    return true; // Signal to stop
                                }
                            }
                        }
                    }
                }
            }
            return false;
        };

        // 1. Search Project Scope Index
        if (lowerTypeFilter) {
            const typeMap = this.scopeIndex.get(lowerTypeFilter);
            if (typeMap) processTypeMap(typeMap, true);
        } else {
            for (const typeMap of this.scopeIndex.values()) {
                if (processTypeMap(typeMap, true)) break;
            }
        }

        // 2. Search Workspace Scope Index
        if (result.length < maxResults) {
            if (lowerTypeFilter) {
                const typeMap = this.workspaceIndex.get(lowerTypeFilter);
                if (typeMap) processTypeMap(typeMap, false);
            } else {
                for (const typeMap of this.workspaceIndex.values()) {
                    if (processTypeMap(typeMap, false)) break;
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
