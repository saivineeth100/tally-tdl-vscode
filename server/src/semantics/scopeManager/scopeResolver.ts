import { SymbolInfo, SymbolKind, FunctionSymbol, VariableSymbol, FormulaSymbol, DefinitionSymbol, AttributeSymbol, ActionSymbol, SchemaSymbol } from 'tally-tdl-shared';
import { Scope, ScopeKind, hasFunctionsAndActions, hasDefinitions, hasAttributes, hasSchemas, GlobalScope, ProjectScope } from './types';
import { normalizeTypeName } from '../../utils/normalizeUtils';
import { normalizeUri } from '../../utils/uri';

export interface IScopeResolverState {
    useInheritance: Map<string, Set<string>>;
    inUseInheritance: Map<string, Set<string>>;
    parentDefinitions: Map<string, Set<string>>;
    childDefinitions: Map<string, Set<string>>;
    globalScope: GlobalScope;
    projectScope: ProjectScope;
    metadata?: any;

    modifierContributions?: Map<string, import('./types').ModifierContribution[]>;
    
    definitionsInScopeCache?: Map<string, import('tally-tdl-shared').SymbolInfo[]>;
    
    findDefinitionScope(id: string): Scope | undefined;
    findGlobalSymbolsByName(name: string, projectScope?: Set<string>): SymbolInfo[];
    getCanonicalTypeName(normalizedType: string): string;
    normalizeScopeId(id: string): string;
    getProjectDefinition(defType: string, name: string): DefinitionSymbol[];
    getWorkspaceDefinition(defType: string, name: string): DefinitionSymbol[];

}

export interface ResolutionContext {
    visitedScopes: Set<string>;
    state: IScopeResolverState;
    initialScope: Scope;
    caller?: ResolutionContext;
    invocationKind?: 'function' | 'report' | 'collection' | 'action' | 'block' | 'root';
    visitedDefinitions?: Set<string>;
}

type SearchStrategy<T> = (scope: Scope) => T | undefined;
type VisitorStrategy = (scope: Scope) => void;

/**
 * Core traversal engine that walks up the lexical and structural scope chains.
 */
function traverseScopes<T>(context: ResolutionContext, strategy: SearchStrategy<T>): T | undefined {
    const { visitedScopes, state, initialScope } = context;

    const searchScopeAndParents = (scope: Scope, isUseChain: boolean = false): T | undefined => {
        // We use a composite key for visited to allow a scope to be visited structurally 
        // even if it was previously visited via a use chain (though rare).
        const visitKey = `${scope.id}|${isUseChain}`;
        if (visitedScopes.has(visitKey)) return undefined;
        visitedScopes.add(visitKey);

        const result = strategy(scope);
        if (result !== undefined) return result;

        // Check Use inheritance first
        const uses = state.useInheritance.get(scope.id.toLowerCase());
        if (uses) {
            for (const useId of uses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    const res = searchScopeAndParents(useScope, true);
                    if (res !== undefined) return res;
                }
            }
        }
        
        // Check InUse inheritance
        const inUses = state.inUseInheritance.get(scope.id.toLowerCase());
        if (inUses) {
            for (const useId of inUses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    const res = searchScopeAndParents(useScope, true);
                    if (res !== undefined) return res;
                }
            }
        }
        
        // Check Modifier contributions
        if (state.modifierContributions) {
            const modifiers = state.modifierContributions.get(scope.id.toLowerCase());
            if (modifiers) {
                // Sort by order so earlier modifiers are visited first
                const sortedMods = [...modifiers].sort((a, b) => a.order - b.order);
                for (const mod of sortedMods) {
                    const res = searchScopeAndParents(mod.scope, isUseChain);
                    if (res !== undefined) return res;
                }
            }
        }
        
        // Check collectionScope link
        if ('collectionScope' in scope && scope.collectionScope) {
            const collId = `collection:${scope.collectionScope}`.toLowerCase();
            const collScope = state.findDefinitionScope(collId);
            if (collScope) {
                const res = searchScopeAndParents(collScope, isUseChain);
                if (res !== undefined) return res;
            }
        }
        
        // Structurally search upwards
        // CRITICAL FIX: Only traverse structural parents if we are NOT inside a Use/Inheritance chain.
        // If A uses B, B's structural parents are irrelevant to A and would cause a massive fan-out.
        if (!isUseChain && scope.kind === ScopeKind.Definition) {
            const parentIds = state.parentDefinitions.get(scope.id.toLowerCase());
            if (parentIds) {
                for (const pid of parentIds) {
                    const parentScope = state.findDefinitionScope(pid);
                    if (parentScope) {
                        const res = searchScopeAndParents(parentScope, false);
                        if (res !== undefined) return res;
                    }
                }
            }
        }
        return undefined;
    };

    let current: Scope | undefined = initialScope;
    while (current) {
        if (current.kind === ScopeKind.Definition) {
            const result = searchScopeAndParents(current);
            if (result !== undefined) return result;
        } else {
            const result = strategy(current);
            if (result !== undefined) return result;
        }
        current = current.parent;
    }

    // Follow caller context if provided
    if (context.caller) {
        return traverseScopes(context.caller, strategy);
    }

    return undefined;
}

/**
 * Resolves all available definitions of a specific type that are "in scope" for a given context.
 * Traverses UP to the structural roots (e.g., Form, Report) then DOWN to collect all matches.
 * Follows structural parents, Use/InUse inheritance, modifier contributions, and collectionScope links.
 */
export function getDefinitionsInScope(context: ResolutionContext, targetDefType: string, globalScope?: GlobalScope, projectScope?: ProjectScope): SymbolInfo[] {
    const t0 = Date.now();
    const { state, initialScope } = context;
    const definitions = new Map<string, SymbolInfo>();
    const visitedParents = new Set<string>();
    const roots = new Set<string>();
    
    // We start traversal from the definition ID containing the scope
    let currentDefId = '';
    
    // Find the nearest definition scope
    let currentScope: Scope | undefined = initialScope;
    while (currentScope && currentScope.kind !== ScopeKind.Definition) {
        currentScope = currentScope.parent;
    }
    
    if (currentScope && currentScope.kind === ScopeKind.Definition) {
        currentDefId = state.normalizeScopeId(currentScope.id);
    }

    if (currentDefId) {
        const findRoots = (id: string, path: Set<string> = new Set()) => {
            if (path.has(id)) {
                // Cycle detected, add this node as a root to break the cycle
                roots.add(id);
                return;
            }
            if (visitedParents.has(id)) return;
            visitedParents.add(id);
            
            path.add(id);

            const parents = state.parentDefinitions.get(id);
            const hasParents = (parents && parents.size > 0);

            if (!hasParents) {
                roots.add(id);
            } else {
                // Walk structural parents
                if (parents) {
                    for (const parentId of parents) {
                        findRoots(parentId, path);
                    }
                }
            }
            
            path.delete(id);
        };

        findRoots(currentDefId);

        // --- CACHE CHECK ---
        const rootsArray = Array.from(roots).sort();
        const targetDefTypeLower = targetDefType.toLowerCase() + ':';
        const rootsCacheKey = `${rootsArray.join(',')}::${targetDefTypeLower}`;

        if (state.definitionsInScopeCache) {
            const cached = state.definitionsInScopeCache.get(rootsCacheKey);
            if (cached) {
                const t1 = Date.now();
                if (t1 - t0 > 100) {
                    import('../../logger').then(m => m.logger.trace(`[Perf] getDefinitionsInScope (CACHED) for ${targetDefType} starting from ${currentDefId} took ${t1 - t0}ms`));
                }
                return cached;
            }
        }
        // -------------------

        const visitedChildren = new Set<string>();
        const collectDefinitions = (id: string) => {
            if (visitedChildren.has(id)) return;
            visitedChildren.add(id);

            if (id.startsWith(targetDefTypeLower)) {
                const scope = state.findDefinitionScope(id);
                if (scope && scope.kind === ScopeKind.Definition && (scope as import('./types').DefinitionScope).definition) {
                    definitions.set(id, (scope as import('./types').DefinitionScope).definition!);
                }
            }

            // Follow structural children
            const children = state.childDefinitions.get(id);
            if (children) {
                for (const childId of children) {
                    collectDefinitions(childId);
                }
            }

            // Follow Use inheritance
            const uses = state.useInheritance.get(id);
            if (uses) {
                for (const useId of uses) {
                    collectDefinitions(useId);
                }
            }

            // Follow InUse inheritance
            const inUses = state.inUseInheritance.get(id);
            if (inUses) {
                for (const useId of inUses) {
                    collectDefinitions(useId);
                }
            }

            // Follow modifier contributions
            if (state.modifierContributions) {
                const modifiers = state.modifierContributions.get(id);
                if (modifiers) {
                    for (const mod of modifiers) {
                        const modScopeId = state.normalizeScopeId(mod.scope.id);
                        if (!visitedChildren.has(modScopeId)) {
                            visitedChildren.add(modScopeId);
                            // Check if the modifier scope itself matches
                            if (modScopeId.startsWith(targetDefTypeLower)) {
                                if (mod.scope.kind === ScopeKind.Definition && (mod.scope as import('./types').DefinitionScope).definition) {
                                    definitions.set(modScopeId, (mod.scope as import('./types').DefinitionScope).definition!);
                                }
                            }
                            // Collect from modifier's children
                            const modChildren = state.childDefinitions.get(modScopeId);
                            if (modChildren) {
                                for (const childId of modChildren) {
                                    collectDefinitions(childId);
                                }
                            }
                        }
                    }
                }
            }

            // Follow collectionScope link
            const defScope = state.findDefinitionScope(id);
            if (defScope && 'collectionScope' in defScope && defScope.collectionScope) {
                const collId = `collection:${defScope.collectionScope}`.toLowerCase();
                collectDefinitions(collId);
            }
        };

        for (const root of roots) {
            collectDefinitions(root);
        }

        // --- CACHE STORE ---
        if (state.definitionsInScopeCache) {
            state.definitionsInScopeCache.set(rootsCacheKey, Array.from(definitions.values()));
        }
        // -------------------
    }

    const t1 = Date.now();
    if (t1 - t0 > 100) {
        import('../../logger').then(m => m.logger.trace(`[Perf] getDefinitionsInScope for ${targetDefType} starting from ${currentDefId} took ${t1 - t0}ms`));
    }
    return Array.from(definitions.values());
}

/**
 * Resolves all available Fields that are "in scope" for a given context.
 * Useful for resolving `#FieldName` references.
 * Traverses UP to the structural roots (e.g., Form, Report) then DOWN to collect all Fields.
 * If the current definition is a Collection/Function, falls back to all fields in the project.
 */
export function getFieldsInScope(context: ResolutionContext, globalScope?: GlobalScope, projectScope?: ProjectScope): SymbolInfo[] {
    const { state, initialScope } = context;
    const fieldsArray = getDefinitionsInScope(context, 'field', globalScope, projectScope);
    const fields = new Map<string, SymbolInfo>();
    
    for (const field of fieldsArray) {
        fields.set(`field:${field.name.toLowerCase()}`, field);
    }


    // Also collect schema properties from objectScope/collectionScope
    traverseScopes(context, scope => {
        if ('objectScope' in scope && scope.objectScope) {
            const schema = resolveSchema(state, scope.objectScope, initialScope, undefined, context);
            if (schema) {
                const isFetched = (fieldName: string, fetchedFields?: Set<string>, computedFields?: Set<string>) => {
                    if (!fetchedFields && !computedFields) return true;
                    if (computedFields?.has(fieldName)) return true;
                    if (fetchedFields?.has(fieldName)) return true;
                    if (fetchedFields) {
                        for (const f of fetchedFields) {
                            if (f === '*') return true;
                            if (f.endsWith('.*') && fieldName.toLowerCase().startsWith(f.substring(0, f.length - 2).toLowerCase())) {
                                return true;
                            }
                        }
                    }
                    return false;
                };

                for (const [propName, prop] of schema.properties.entries()) {
                    if (isFetched(prop.Name, (scope as any).fetchedFields, (scope as any).computedFields) || 
                        isFetched('$' + prop.Name, (scope as any).fetchedFields, (scope as any).computedFields)) {
                        
                        fields.set(`schema:${propName}`, {
                            name: '$' + prop.Name, // Field references use $ prefix
                            kind: SymbolKind.Field,
                            uri: schema.uri,
                            start: schema.start,
                            end: schema.end,
                            definitionType: 'SchemaProperty'
                        });
                    }
                }
            }
            
            // Add #Object extensions
            const globalSymbols = state.findGlobalSymbolsByName(scope.objectScope, undefined);
            const objDefs = globalSymbols.filter(s => s.definitionType?.toLowerCase() === 'object' || s.kind === SymbolKind.Object);
            for (const objDef of objDefs) {
                const objScope = state.findDefinitionScope(`object:${objDef.name}`.toLowerCase());
                if (objScope) {
                    if (objScope.formulas) {
                        for (const [formulaName, sym] of objScope.formulas.entries()) {
                            // formulas in #Object act as fields
                            fields.set(`objExt:${formulaName}`, {
                                name: '$' + (sym.name || formulaName),
                                kind: SymbolKind.Field,
                                uri: sym.uri,
                                start: sym.start,
                                end: sym.end,
                                definitionType: 'ObjectExtension'
                            });
                        }
                    }
                    for (const [varName, sym] of objScope.variables.entries()) {
                        fields.set(`objExtVar:${varName}`, sym);
                    }
                }
            }
        }
        return undefined; // Continue traversal to find all scopes
    });

    return Array.from(fields.values());
}

/**
 * Core traversal engine for aggregations (collecting all matches).
 */
function visitScopes(context: ResolutionContext, visitor: VisitorStrategy, localOnly: boolean = false): void {
    const { visitedScopes, state, initialScope } = context;

    const walkScopeAndParents = (scope: Scope, isUseChain: boolean = false): void => {
        const visitKey = `${scope.id}|${isUseChain}`;
        if (visitedScopes.has(visitKey)) return;
        visitedScopes.add(visitKey);

        visitor(scope);

        if (localOnly) return;

        // Check Use inheritance
        const uses = state.useInheritance.get(scope.id.toLowerCase());
        if (uses) {
            for (const useId of uses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    walkScopeAndParents(useScope, true);
                }
            }
        }

        // Check InUse inheritance
        const inUses = state.inUseInheritance.get(scope.id.toLowerCase());
        if (inUses) {
            for (const useId of inUses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    walkScopeAndParents(useScope, true);
                }
            }
        }

        // Check Modifier contributions
        if (state.modifierContributions) {
            const modifiers = state.modifierContributions.get(scope.id.toLowerCase());
            if (modifiers) {
                const sortedMods = [...modifiers].sort((a, b) => a.order - b.order);
                for (const mod of sortedMods) {
                    walkScopeAndParents(mod.scope, isUseChain);
                }
            }
        }
        
        // Structurally search upwards
        // Only traverse structural parents if we are NOT inside a Use/Inheritance chain.
        if (!isUseChain && scope.kind === ScopeKind.Definition) {
            const parentIds = state.parentDefinitions.get(scope.id.toLowerCase());
            if (parentIds) {
                for (const pid of parentIds) {
                    const parentScope = state.findDefinitionScope(pid);
                    if (parentScope) {
                        walkScopeAndParents(parentScope, false);
                    }
                }
            }
        }
    };

    let current: Scope | undefined = initialScope;
    while (current) {
        if (localOnly && (current.kind === ScopeKind.File || current.kind === ScopeKind.Project || current.kind === ScopeKind.Global)) {
            break;
        }

        if (current.kind === ScopeKind.Global) {
            // GlobalScope is excluded from standard traversal to prevent global symbols
            // from bypassing projectScope filtering. All global resolution MUST happen via fallbacks.
            break;
        }

        if (current.kind === ScopeKind.Definition) {
            walkScopeAndParents(current);
        } else {
            visitor(current);
        }
        current = current.parent;
    }

    // Follow caller context if provided
    if (context.caller) {
        visitScopes(context.caller, visitor);
    }
}

// ---- SPECIFIC RESOLVERS ----

export function resolveVariable(
    state: IScopeResolverState, 
    name: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): VariableSymbol | undefined {
    const normalizedName = normalizeTypeName(name);
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    const isFetched = (fieldName: string, fetchedFields?: Set<string>, computedFields?: Set<string>) => {
        if (!fetchedFields && !computedFields) return true;
        if (computedFields?.has(fieldName)) return true;
        if (fetchedFields?.has(fieldName)) return true;
        
        if (fetchedFields) {
            for (const f of fetchedFields) {
                if (f === '*') return true;
                if (f.endsWith('.*') && fieldName.toLowerCase().startsWith(f.substring(0, f.length - 2).toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    };

    // 1. Traverse structured scopes
    const match = traverseScopes(context, scope => {
        let sym = scope.variables.get(normalizedName);
        if (sym) return sym;

        if ('objectScope' in scope && scope.objectScope) {
            const fieldNameWithoutDollar = normalizedName.startsWith('$') ? normalizedName.substring(1) : normalizedName;
            
            if (isFetched(fieldNameWithoutDollar, (scope as any).fetchedFields, (scope as any).computedFields) || 
                isFetched(normalizedName, (scope as any).fetchedFields, (scope as any).computedFields)) {
                
                // 1. Schema properties
                const schema = resolveSchema(state, scope.objectScope, initialScope, projectScope, callerContext);
                if (schema && schema.properties.has(fieldNameWithoutDollar)) {
                    return {
                        name: name,
                        kind: SymbolKind.Field,
                        uri: schema.uri,
                        start: schema.start,
                        end: schema.end,
                        definitionType: 'SchemaProperty'
                    } as VariableSymbol;
                }

                // 2. #Object extensions
                const globalSymbols = state.findGlobalSymbolsByName(scope.objectScope, projectScope);
                const objDefs = globalSymbols.filter(s => s.definitionType?.toLowerCase() === 'object' || s.kind === SymbolKind.Object);
                for (const objDef of objDefs) {
                    const objScope = state.findDefinitionScope(`object:${objDef.name}`.toLowerCase());
                    if (objScope) {
                        if (objScope.variables.has(normalizedName)) return objScope.variables.get(normalizedName);
                        if (objScope.formulas && objScope.formulas.has(fieldNameWithoutDollar)) {
                            return {
                                name: name,
                                kind: SymbolKind.Field,
                                uri: objDef.uri,
                                start: objDef.start,
                                end: objDef.end,
                                definitionType: 'ObjectExtension'
                            } as VariableSymbol;
                        }
                    }
                }
            }
        }
        return undefined;
    });
    if (match) return match;

    // 2. Global fallback
    const canonicalVarType = state.getCanonicalTypeName('variable');
    const globalMatch = state.findGlobalSymbolsByName(name, projectScope).find(s => {
        if (s.kind !== SymbolKind.Variable) return false;
        if (s.definitionType) {
            return canonicalVarType === state.getCanonicalTypeName(normalizeTypeName(s.definitionType));
        }
        return true;
    }) as VariableSymbol | undefined;
    if (globalMatch) return globalMatch;

    // 3. Metadata fallback for system definitions
    const checkName = normalizeTypeName(name);
    const typesToCheck = [canonicalVarType, 'system_variable', 'system_variables'];
    const globalDefMatch = typesToCheck.map(t => {
        const typeSet = state.globalScope.definitions.get(t);
        if (typeSet && typeSet.has(checkName)) {
            return typeSet.get(checkName) as VariableSymbol;
        }
        if (state.globalScope.variables?.has(checkName)) {
            return state.globalScope.variables.get(checkName) as VariableSymbol;
        }
        return undefined;
    }).find(s => s !== undefined);
    if (globalDefMatch) return globalDefMatch;
    
    return undefined;
}

export function resolveFormula(
    state: IScopeResolverState, 
    name: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): FormulaSymbol | undefined {
    const normalizedName = normalizeTypeName(name);
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    // 1. Traverse structured scopes
    const match = traverseScopes(context, scope => {
        if ('formulas' in scope) {
            let sym = scope.formulas.get(normalizedName);
            if (sym) return sym;
        }
        return undefined;
    });
    if (match) return match;

    // 2. Global fallback
    const canonicalFormType = state.getCanonicalTypeName('formula');
    const globalMatch = state.findGlobalSymbolsByName(name, projectScope).find(s => {
        if (s.kind !== SymbolKind.Formula) return false;
        if (s.definitionType) {
            return canonicalFormType === state.getCanonicalTypeName(normalizeTypeName(s.definitionType));
        }
        return true;
    }) as FormulaSymbol | undefined;
    if (globalMatch) return globalMatch;

    // 3. Metadata fallback for system definitions
    const checkName = normalizeTypeName(name);
    const typesToCheckF = [canonicalFormType, 'system_formula', 'system_formulae', 'system_formulas'];
    const globalDefMatchF = typesToCheckF.map(t => {
        const typeSet = state.globalScope.definitions.get(t);
        if (typeSet && typeSet.has(checkName)) {
            return typeSet.get(checkName) as FormulaSymbol;
        }
        if (state.globalScope.formulas?.has(checkName)) {
            return state.globalScope.formulas.get(checkName) as FormulaSymbol;
        }
        return undefined;
    }).find(s => s !== undefined);
    if (globalDefMatchF) return globalDefMatchF;
    
    return undefined;
}

export function resolveFunction(
    state: IScopeResolverState, 
    name: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): FunctionSymbol | undefined {
    const normalizedName = normalizeTypeName(name);

    // 1. User definitions (Workspace / Project scope index)
    let syms = state.getProjectDefinition('function', name);
    if (projectScope && syms.length > 0) {
        syms = syms.filter(s => s.uri && projectScope.has(normalizeUri(s.uri)));
    }
    if (syms && syms.length > 0) return syms[0] as unknown as FunctionSymbol;

    const wsSyms = state.getWorkspaceDefinition('function', name);
    if (wsSyms && wsSyms.length > 0) return wsSyms[0] as unknown as FunctionSymbol;

    // 2. Metadata fallback for system functions
    if (state.globalScope.functions?.has(normalizedName)) {
        return state.globalScope.functions.get(normalizedName);
    }

    return undefined;
}

export function resolveAction(
    state: IScopeResolverState, 
    name: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): ActionSymbol | undefined {
    const normalizedName = normalizeTypeName(name);

    // 1. User definitions (Workspace / Project scope index)
    let syms = state.getProjectDefinition('action', name);
    if (projectScope && syms.length > 0) {
        syms = syms.filter(s => s.uri && projectScope.has(normalizeUri(s.uri)));
    }
    if (syms && syms.length > 0) return syms[0] as unknown as ActionSymbol;

    const wsSyms = state.getWorkspaceDefinition('action', name);
    if (wsSyms && wsSyms.length > 0) return wsSyms[0] as unknown as ActionSymbol;

    // 2. Metadata fallback for system actions
    if (state.globalScope.actions?.has(normalizedName)) {
        return state.globalScope.actions.get(normalizedName);
    }

    return undefined;
}

export function resolveDefinition(
    state: IScopeResolverState, 
    name: string, 
    defType: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): DefinitionSymbol[] {
    const normalizedName = normalizeTypeName(name);
    const normalizedType = normalizeTypeName(defType);
    const canonicalType = state.getCanonicalTypeName(normalizedType);

    // 1. User definitions (Workspace / Project scope index)
    let syms = state.getProjectDefinition(canonicalType, normalizedName);
    if (projectScope && syms.length > 0) {
        // If projectScope is specified, filter by active URIs
        syms = syms.filter(s => s.uri && projectScope.has(normalizeUri(s.uri)));
    }
    if (syms && syms.length > 0) return syms;

    // Check workspace definition index
    const wsSyms = state.getWorkspaceDefinition(canonicalType, normalizedName);
    if (wsSyms && wsSyms.length > 0) return wsSyms;

    // 2. Metadata fallback for system definitions
    const typeSet = state.globalScope.definitions.get(canonicalType);
    if (typeSet && typeSet.has(normalizedName)) {
        return [typeSet.get(normalizedName) as DefinitionSymbol];
    }
    
    // Functions/Actions/Formulas fallbacks
    if (canonicalType === state.getCanonicalTypeName('function')) {
        if (state.globalScope.functions?.has(normalizedName)) {
            return [state.globalScope.functions.get(normalizedName) as unknown as DefinitionSymbol];
        }
    }
    if (canonicalType === state.getCanonicalTypeName('action')) {
        if (state.globalScope.actions?.has(normalizedName)) {
            return [state.globalScope.actions.get(normalizedName) as unknown as DefinitionSymbol];
        }
    }
    if (canonicalType === state.getCanonicalTypeName('formula')) {
        if (state.globalScope.formulas?.has(normalizedName)) {
            return [state.globalScope.formulas.get(normalizedName) as unknown as DefinitionSymbol];
        }
    }

    // 3. Fallback to ProjectScope (scopeIndex) unfiltered if not found in active project scope
    const unfilteredSyms = state.getProjectDefinition(canonicalType, normalizedName);
    if (unfilteredSyms && unfilteredSyms.length > 0) return unfilteredSyms;

    return [];
}

export function resolveAttribute(
    state: IScopeResolverState, 
    name: string, 
    defType: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): AttributeSymbol | undefined {
    const normalizedName = normalizeTypeName(name);
    const normalizedType = normalizeTypeName(defType);
    const canonicalType = state.getCanonicalTypeName(normalizedType);

    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    const match = traverseScopes(context, scope => {
        if (hasAttributes(scope)) {
            const sym = scope.attributes.get(canonicalType)?.get(normalizedName);
            if (sym) return sym;
        }
        return undefined;
    });
    if (match) return match;

    // Metadata fallback for system attributes (since traverseScopes no longer hits GlobalScope)
    const globalTypeSet = state.globalScope.attributes?.get(canonicalType);
    if (globalTypeSet && globalTypeSet.has(normalizedName)) {
        return globalTypeSet.get(normalizedName);
    }

    return undefined; // Attributes are fully cached in scopes, no global SymbolTable fallback needed
}

export function resolveSchema(
    state: IScopeResolverState, 
    name: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): SchemaSymbol | undefined {
    const normalizedName = normalizeTypeName(name);
    if (state.globalScope.schemas?.has(normalizedName)) {
        return state.globalScope.schemas.get(normalizedName);
    }
    return undefined;
}

export function getAllVariablesInScope(
    state: IScopeResolverState, 
    initialScope: Scope,
    callerContext?: ResolutionContext
): Map<string, VariableSymbol> {
    const variables = new Map<string, VariableSymbol>();
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };

    visitScopes(context, scope => {
        for (const [key, sym] of scope.variables) {
            if (!variables.has(key)) {
                variables.set(key, sym);
            }
        }
    });

    return variables;
}

export function getAllFormulasInScope(
    state: IScopeResolverState, 
    initialScope: Scope,
    callerContext?: ResolutionContext,
    localOnly: boolean = false
): Map<string, FormulaSymbol> {
    const formulas = new Map<string, FormulaSymbol>();
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };

    visitScopes(context, scope => {
        if ('formulas' in scope) {
            for (const [key, sym] of scope.formulas) {
                if (!formulas.has(key)) {
                    formulas.set(key, sym);
                }
            }
        }
    }, localOnly);

    return formulas;
}

export function getReachableChildren(state: IScopeResolverState, scope: Scope, targetType: string): SymbolInfo[] {
    const results: SymbolInfo[] = [];
    const visitedScopes = new Set<string>();
    const targetTypeLower = targetType.toLowerCase();

    // Note: getReachableChildren walks DOWNWARDS (childDefinitions) instead of upwards, 
    // so it uses a custom traversal instead of the generic visitScopes.
    const collectChildren = (currentScope: Scope) => {
        if (visitedScopes.has(currentScope.id)) return;
        visitedScopes.add(currentScope.id);

        const currentDefType = state.getCanonicalTypeName(currentScope.id.split(':')[0].toLowerCase());
        const targetCanonical = state.getCanonicalTypeName(targetTypeLower);
        if (currentDefType === targetCanonical) {
            const defName = currentScope.id.substring(currentScope.id.indexOf(':') + 1);
            results.push({
                name: defName,
                kind: SymbolKind.Object,
                uri: currentScope.uri || '',
                start: currentScope.range?.start || 0,
                end: currentScope.range?.end || 0,
                definitionType: targetType
            });
        }

        const uses = state.useInheritance.get(currentScope.id.toLowerCase());
        if (uses) {
            for (const useId of uses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    collectChildren(useScope);
                }
            }
        }

        const childIds = state.childDefinitions.get(currentScope.id.toLowerCase());
        if (childIds) {
            for (const cid of childIds) {
                const childScope = state.findDefinitionScope(cid);
                if (childScope) {
                    collectChildren(childScope);
                }
            }
        }
    };

    collectChildren(scope);
    return results;
}

import { definitionTypeToSymbolKind } from '../../semantics/scopeManager/types';
