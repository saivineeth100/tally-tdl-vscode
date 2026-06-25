import { SymbolInfo, SymbolKind, FunctionSymbol, VariableSymbol, FormulaSymbol, DefinitionSymbol, AttributeSymbol, ActionSymbol, SchemaSymbol } from '../symbolTable';
import { Scope, ScopeKind, definitionTypeToSymbolKind, hasFunctionsAndActions, hasDefinitions, hasAttributes, hasSchemas, GlobalScope, ProjectScope } from './types';
import { normalizeTypeName, getInterchangeableTypes } from '../utils';

export interface IScopeResolverState {
    useInheritance: Map<string, Set<string>>;
    inUseInheritance: Map<string, Set<string>>;
    parentDefinitions: Map<string, Set<string>>;
    childDefinitions: Map<string, Set<string>>;
    metadata?: any;
    existingDefinitions?: Map<string, Set<string>>;
    modifierContributions?: Map<string, import('./types').ModifierContribution[]>;
    
    findDefinitionScope(id: string): Scope | undefined;
    findGlobalSymbolsByName(name: string, projectScope?: Set<string>): SymbolInfo[];
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

    const searchScopeAndParents = (scope: Scope): T | undefined => {
        if (visitedScopes.has(scope.id)) return undefined;
        visitedScopes.add(scope.id);

        const result = strategy(scope);
        if (result !== undefined) return result;

        // Check Use inheritance first
        const uses = state.useInheritance.get(scope.id.toLowerCase());
        if (uses) {
            for (const useId of uses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    const res = searchScopeAndParents(useScope);
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
                    const res = searchScopeAndParents(useScope);
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
                    const res = searchScopeAndParents(mod.scope);
                    if (res !== undefined) return res;
                }
            }
        }
        
        // Structurally search upwards
        if (scope.kind === ScopeKind.Definition) {
            const parentIds = state.parentDefinitions.get(scope.id.toLowerCase());
            if (parentIds) {
                for (const pid of parentIds) {
                    const parentScope = state.findDefinitionScope(pid);
                    if (parentScope) {
                        const res = searchScopeAndParents(parentScope);
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
 * Resolves all available Fields that are "in scope" for a given context.
 * Useful for resolving `#FieldName` references.
 * Traverses UP to the structural roots (e.g., Form, Report) then DOWN to collect all Fields.
 * If the current definition is a Collection/Function, falls back to all fields in the project.
 */
export function getFieldsInScope(context: ResolutionContext, globalScope?: GlobalScope, projectScope?: ProjectScope): SymbolInfo[] {
    const { state, initialScope } = context;
    const fields = new Map<string, SymbolInfo>();
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
        currentDefId = currentScope.id.toLowerCase();
    }

    if (currentDefId) {
        const findRoots = (id: string) => {
            if (visitedParents.has(id)) return;
            visitedParents.add(id);
            
            const parents = state.parentDefinitions.get(id);
            const hasParents = parents && parents.size > 0;

            if (!hasParents) {
                roots.add(id);
            } else {
                for (const parentId of parents) {
                    findRoots(parentId);
                }
            }
        };

        findRoots(currentDefId);

        const visitedChildren = new Set<string>();
        const collectFields = (id: string) => {
            if (visitedChildren.has(id)) return;
            visitedChildren.add(id);

            if (id.startsWith('field:')) {
                const scope = state.findDefinitionScope(id);
                if (scope && scope.kind === ScopeKind.Definition && (scope as import('./types').DefinitionScope).definition) {
                    fields.set(id, (scope as import('./types').DefinitionScope).definition!);
                }
            }

            const children = state.childDefinitions.get(id);
            if (children) {
                for (const childId of children) {
                    collectFields(childId);
                }
            }

            const uses = state.useInheritance.get(id);
            if (uses) {
                for (const useId of uses) {
                    collectFields(useId);
                }
            }

            const inUses = state.inUseInheritance.get(id);
            if (inUses) {
                for (const useId of inUses) {
                    collectFields(useId);
                }
            }
        };

        for (const root of roots) {
            collectFields(root);
        }
    }

    return Array.from(fields.values());
}

/**
 * Core traversal engine for aggregations (collecting all matches).
 */
function visitScopes(context: ResolutionContext, visitor: VisitorStrategy, localOnly: boolean = false): void {
    const { visitedScopes, state, initialScope } = context;

    const walkScopeAndParents = (scope: Scope): void => {
        if (visitedScopes.has(scope.id)) return;
        visitedScopes.add(scope.id);

        visitor(scope);

        if (localOnly) return;

        // Check Use inheritance
        const uses = state.useInheritance.get(scope.id.toLowerCase());
        if (uses) {
            for (const useId of uses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    walkScopeAndParents(useScope);
                }
            }
        }

        // Check InUse inheritance
        const inUses = state.inUseInheritance.get(scope.id.toLowerCase());
        if (inUses) {
            for (const useId of inUses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    walkScopeAndParents(useScope);
                }
            }
        }

        // Check Modifier contributions
        if (state.modifierContributions) {
            const modifiers = state.modifierContributions.get(scope.id.toLowerCase());
            if (modifiers) {
                const sortedMods = [...modifiers].sort((a, b) => a.order - b.order);
                for (const mod of sortedMods) {
                    walkScopeAndParents(mod.scope);
                }
            }
        }
        
        // Structurally search upwards
        if (scope.kind === ScopeKind.Definition) {
            const parentIds = state.parentDefinitions.get(scope.id.toLowerCase());
            if (parentIds) {
                for (const pid of parentIds) {
                    const parentScope = state.findDefinitionScope(pid);
                    if (parentScope) {
                        walkScopeAndParents(parentScope);
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
    
    // 1. Traverse structured scopes
    const match = traverseScopes(context, scope => scope.variables.get(normalizedName));
    if (match) return match;

    // 2. Global fallback
    return state.findGlobalSymbolsByName(name, projectScope).find(s => s.kind === SymbolKind.Variable) as VariableSymbol | undefined;
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
            return scope.formulas.get(normalizedName);
        }
        return undefined;
    });
    if (match) return match;

    // 2. Global fallback (not typically applicable for formulas as they are all cached in scopes, but check global definitions)
    return state.findGlobalSymbolsByName(name, projectScope).find(s => s.kind === SymbolKind.Formula) as FormulaSymbol | undefined;
}

export function resolveFunction(
    state: IScopeResolverState, 
    name: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): FunctionSymbol | undefined {
    const normalizedName = normalizeTypeName(name);
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    const match = traverseScopes(context, scope => {
        if (hasFunctionsAndActions(scope)) {
            return scope.functions.get(normalizedName);
        }
        return undefined;
    });
    if (match) return match;

    return state.findGlobalSymbolsByName(name, projectScope).find(s => s.kind === SymbolKind.Function) as FunctionSymbol | undefined;
}

export function resolveAction(
    state: IScopeResolverState, 
    name: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): ActionSymbol | undefined {
    const normalizedName = normalizeTypeName(name);
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    const match = traverseScopes(context, scope => {
        if (hasFunctionsAndActions(scope)) {
            return scope.actions.get(normalizedName);
        }
        return undefined;
    });
    if (match) return match;

    // Action definitions in Global fallback
    return state.findGlobalSymbolsByName(name, projectScope).find(s => s.kind === SymbolKind.Function) as ActionSymbol | undefined; // SymbolKind is shared for now
}

export function resolveDefinition(
    state: IScopeResolverState, 
    name: string, 
    defType: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): DefinitionSymbol | undefined {
    const normalizedName = normalizeTypeName(name);
    const normalizedType = normalizeTypeName(defType);
    const typesToCheck = getInterchangeableTypes(normalizedType);

    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    const match = traverseScopes(context, scope => {
        if (hasDefinitions(scope)) {
            for (const t of typesToCheck) {
                const sym = scope.definitions.get(t)?.get(normalizedName);
                if (sym) return sym;
            }
        }
        if (hasFunctionsAndActions(scope)) {
            if (typesToCheck.includes('function')) {
                const sym = scope.functions.get(normalizedName);
                if (sym) return sym as unknown as DefinitionSymbol;
            }
            if (typesToCheck.includes('action')) {
                const sym = scope.actions.get(normalizedName);
                if (sym) return sym as unknown as DefinitionSymbol;
            }
        }
        return undefined;
    });
    if (match) return match;

    // SymbolTable fallback (user definitions)
    const globalMatch = state.findGlobalSymbolsByName(name, projectScope).find(s => {
        if (!s.definitionType) return false;
        return typesToCheck.includes(normalizeTypeName(s.definitionType));
    });
    if (globalMatch) return globalMatch as DefinitionSymbol;

    // Metadata fallback for existing system definitions
    if (state.existingDefinitions) {
        const checkName = normalizeTypeName(name);
        for (const t of typesToCheck) {
            const typeSet = state.existingDefinitions.get(t);
            if (typeSet && typeSet.has(checkName)) {
                return {
                    name: name,
                    kind: definitionTypeToSymbolKind(t),
                    uri: 'global:metadata',
                    start: 0, end: 0,
                    definitionType: t
                } as DefinitionSymbol;
            }
        }
    }

    return undefined;
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
    const typesToCheck = getInterchangeableTypes(normalizedType);

    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    const match = traverseScopes(context, scope => {
        if (hasAttributes(scope)) {
            for (const t of typesToCheck) {
                const sym = scope.attributes.get(t)?.get(normalizedName);
                if (sym) return sym;
            }
        }
        return undefined;
    });
    if (match) return match;

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
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    const match = traverseScopes(context, scope => {
        if (hasSchemas(scope)) {
            return scope.schemas.get(normalizedName);
        }
        return undefined;
    });
    if (match) return match;

    return undefined; // Schemas are fully indexed in scope maps
}

export function resolveSymbol(
    state: IScopeResolverState, 
    name: string, 
    initialScope: Scope, 
    projectScope?: Set<string>,
    callerContext?: ResolutionContext
): SymbolInfo | undefined {
    // Legacy generic resolve method when the exact type is unknown
    const normalizedName = normalizeTypeName(name);
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope, caller: callerContext };
    
    const match = traverseScopes(context, scope => {
        let sym: SymbolInfo | undefined = scope.variables.get(normalizedName);
        if (sym) return sym;

        if ('formulas' in scope) {
            sym = scope.formulas.get(normalizedName);
            if (sym) return sym;
        }

        if (hasFunctionsAndActions(scope)) {
            sym = scope.functions.get(normalizedName) || scope.actions.get(normalizedName);
            if (sym) return sym;
        }

        if (hasSchemas(scope)) {
            sym = scope.schemas.get(normalizedName);
            if (sym) return sym;
        }

        if (hasAttributes(scope)) {
            for (const attrMap of scope.attributes.values()) {
                const attrSym = attrMap.get(normalizedName);
                if (attrSym) return attrSym;
            }
        }
        
        if (hasDefinitions(scope)) {
            for (const defMap of scope.definitions.values()) {
                const defSym = defMap.get(normalizedName);
                if (defSym) return defSym;
            }
        }
        return undefined;
    });
    if (match) return match;

    const globalSymbols = state.findGlobalSymbolsByName(name, projectScope);
    if (globalSymbols.length > 0) return globalSymbols[0];

    // Check Metadata Definitions if not found
    if (state.existingDefinitions) {
        const normalizedName = normalizeTypeName(name);
        for (const [defType, names] of state.existingDefinitions) {
            if (names.has(normalizedName)) {
                return {
                    name: name,
                    kind: definitionTypeToSymbolKind(defType),
                    uri: 'global:metadata',
                    start: 0,
                    end: 0,
                    definitionType: defType
                };
            }
        }
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

        const currentDefType = currentScope.id.split(':')[0].toLowerCase();
        if (currentDefType === targetTypeLower) {
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
