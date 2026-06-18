import { SymbolInfo, SymbolKind, FunctionSymbol, VariableSymbol, DefinitionSymbol, AttributeSymbol, ActionSymbol, SchemaSymbol } from '../symbolTable';
import { Scope, ScopeKind, definitionTypeToSymbolKind } from './types';
import { normalizeTypeName, getInterchangeableTypes } from '../utils';

export interface IScopeResolverState {
    useInheritance: Map<string, Set<string>>;
    parentDefinitions: Map<string, Set<string>>;
    childDefinitions: Map<string, Set<string>>;
    metadata?: any;
    
    findDefinitionScope(id: string): Scope | undefined;
    findGlobalSymbolsByName(name: string, projectScope?: Set<string>): SymbolInfo[];
}

export interface ResolutionContext {
    visitedScopes: Set<string>;
    state: IScopeResolverState;
    initialScope: Scope;
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
    return undefined;
}

/**
 * Core traversal engine for aggregations (collecting all matches).
 */
function visitScopes(context: ResolutionContext, visitor: VisitorStrategy): void {
    const { visitedScopes, state, initialScope } = context;

    const walkScopeAndParents = (scope: Scope): void => {
        if (visitedScopes.has(scope.id)) return;
        visitedScopes.add(scope.id);

        visitor(scope);

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
        if (current.kind === ScopeKind.Definition) {
            walkScopeAndParents(current);
        } else {
            visitor(current);
        }
        current = current.parent;
    }
}

// ---- SPECIFIC RESOLVERS ----

export function resolveVariable(state: IScopeResolverState, name: string, initialScope: Scope, projectScope?: Set<string>): VariableSymbol | undefined {
    const lowerName = name.toLowerCase();
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope };
    
    // 1. Traverse structured scopes
    const match = traverseScopes(context, scope => scope.variables.get(lowerName));
    if (match) return match;

    // 2. Global fallback
    return state.findGlobalSymbolsByName(name, projectScope).find(s => s.kind === SymbolKind.Variable) as VariableSymbol | undefined;
}

export function resolveFunction(state: IScopeResolverState, name: string, initialScope: Scope, projectScope?: Set<string>): FunctionSymbol | ActionSymbol | undefined {
    const lowerName = name.toLowerCase();
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope };
    
    const match = traverseScopes(context, scope => scope.functions.get(lowerName) || scope.actions.get(lowerName));
    if (match) return match;

    return state.findGlobalSymbolsByName(name, projectScope).find(s => s.kind === SymbolKind.Function) as FunctionSymbol | ActionSymbol | undefined;
}

export function resolveDefinition(state: IScopeResolverState, name: string, defType: string, initialScope: Scope, projectScope?: Set<string>): DefinitionSymbol | undefined {
    const lowerName = name.toLowerCase();
    const normalizedType = normalizeTypeName(defType);
    const typesToCheck = getInterchangeableTypes(normalizedType);

    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope };
    
    const match = traverseScopes(context, scope => {
        for (const t of typesToCheck) {
            const sym = scope.definitions.get(t)?.get(lowerName);
            if (sym) return sym;
        }
        return undefined;
    });
    if (match) return match;

    // Metadata fallback for existing system definitions
    if (state.metadata && state.metadata.existingDefinitions) {
        const checkName = normalizeTypeName(name);
        for (const t of typesToCheck) {
            const typeSet = state.metadata.existingDefinitions.get(t);
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

    return state.findGlobalSymbolsByName(name, projectScope).find(s => {
        if (!s.definitionType) return false;
        return typesToCheck.includes(normalizeTypeName(s.definitionType));
    }) as DefinitionSymbol | undefined;
}

export function resolveAttribute(state: IScopeResolverState, name: string, defType: string, initialScope: Scope, projectScope?: Set<string>): AttributeSymbol | undefined {
    const lowerName = name.toLowerCase();
    const normalizedType = normalizeTypeName(defType);
    const typesToCheck = getInterchangeableTypes(normalizedType);

    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope };
    
    const match = traverseScopes(context, scope => {
        for (const t of typesToCheck) {
            const sym = scope.attributes.get(t)?.get(lowerName);
            if (sym) return sym;
        }
        return undefined;
    });
    if (match) return match;

    return undefined; // Attributes are fully cached in scopes, no global SymbolTable fallback needed
}

export function resolveSchema(state: IScopeResolverState, name: string, initialScope: Scope, projectScope?: Set<string>): SchemaSymbol | undefined {
    const lowerName = name.toLowerCase();
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope };
    
    const match = traverseScopes(context, scope => scope.schemas.get(lowerName));
    if (match) return match;

    return state.findGlobalSymbolsByName(name, projectScope).find(s => s.kind === SymbolKind.Object && s.definitionType === 'Schema') as SchemaSymbol | undefined;
}

export function resolveSymbol(state: IScopeResolverState, name: string, initialScope: Scope, projectScope?: Set<string>): SymbolInfo | undefined {
    // Legacy generic resolve method when the exact type is unknown
    const lowerName = name.toLowerCase();
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope };
    
    const match = traverseScopes(context, scope => {
        const sym = scope.variables.get(lowerName) 
            || scope.functions.get(lowerName)
            || scope.actions.get(lowerName)
            || scope.schemas.get(lowerName);
        if (sym) return sym;

        for (const attrMap of scope.attributes.values()) {
            const attrSym = attrMap.get(lowerName);
            if (attrSym) return attrSym;
        }
        
        for (const defMap of scope.definitions.values()) {
            const defSym = defMap.get(lowerName);
            if (defSym) return defSym;
        }
        return undefined;
    });
    if (match) return match;

    const globalSymbols = state.findGlobalSymbolsByName(name, projectScope);
    if (globalSymbols.length > 0) return globalSymbols[0];

    // Check Metadata Definitions if not found
    if (state.metadata && state.metadata.existingDefinitions) {
        const normalizedName = normalizeTypeName(name);
        for (const [defType, names] of state.metadata.existingDefinitions) {
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

export function getAllVariablesInScope(state: IScopeResolverState, initialScope: Scope): Map<string, VariableSymbol> {
    const variables = new Map<string, VariableSymbol>();
    const context: ResolutionContext = { visitedScopes: new Set(), state, initialScope };

    visitScopes(context, scope => {
        for (const [key, sym] of scope.variables) {
            if (!variables.has(key)) {
                variables.set(key, sym);
            }
        }
    });

    return variables;
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
