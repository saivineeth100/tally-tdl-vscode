import { SymbolInfo, SymbolKind } from '../symbolTable';
import { Scope, ScopeKind, definitionTypeToSymbolKind } from './types';
import { normalizeTypeName } from '../utils';

export interface IScopeResolverState {
    useInheritance: Map<string, Set<string>>;
    parentDefinitions: Map<string, Set<string>>;
    childDefinitions: Map<string, Set<string>>;
    metadata?: any;
    
    findDefinitionScope(id: string): Scope | undefined;
    findGlobalSymbolsByName(name: string): SymbolInfo[];
}

export function resolveSymbol(state: IScopeResolverState, name: string, initialScope: Scope): SymbolInfo | undefined {
    const lowerName = name.toLowerCase();
    const visitedScopes = new Set<string>();
    
    const searchScopeAndParents = (scope: Scope): SymbolInfo | undefined => {
        if (visitedScopes.has(scope.id)) return undefined;
        visitedScopes.add(scope.id);
        
        // Check symbol map
        for (const [key, sym] of scope.symbols) {
            if (key.toLowerCase() === lowerName) return sym;
        }

        // Check Use inheritance first
        const uses = state.useInheritance.get(scope.id.toLowerCase());
        if (uses) {
            for (const useId of uses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    const result = searchScopeAndParents(useScope);
                    if (result) return result;
                }
            }
        }
        
        // If this is a Definition scope, structurally search upwards
        if (scope.kind === ScopeKind.Definition) {
            const parentIds = state.parentDefinitions.get(scope.id.toLowerCase());
            if (parentIds) {
                for (const pid of parentIds) {
                    const parentScope = state.findDefinitionScope(pid);
                    if (parentScope) {
                        const result = searchScopeAndParents(parentScope);
                        if (result) return result;
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
            if (result) return result;
        } else {
            for (const [key, sym] of current.symbols) {
                if (key.toLowerCase() === lowerName) return sym;
            }
        }
        current = current.parent;
    }

    // Fallback to SymbolTable's global index 
    const globalSymbols = state.findGlobalSymbolsByName(name);
    if (globalSymbols.length > 0) {
        return globalSymbols[0];
    }

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

export function getAllVariablesInScope(state: IScopeResolverState, initialScope: Scope): Map<string, SymbolInfo> {
    const variables = new Map<string, SymbolInfo>();
    const visitedScopes = new Set<string>();

    const collectVariables = (scope: Scope) => {
        if (visitedScopes.has(scope.id)) return;
        visitedScopes.add(scope.id);

        // Collect local variables
        for (const [key, sym] of scope.symbols) {
            if (sym.kind === SymbolKind.Variable || sym.definitionType === 'Variable') {
                if (!variables.has(key.toLowerCase())) {
                    variables.set(key.toLowerCase(), sym);
                }
            }
        }

        // Check Use inheritance
        const uses = state.useInheritance.get(scope.id.toLowerCase());
        if (uses) {
            for (const useId of uses) {
                const useScope = state.findDefinitionScope(useId);
                if (useScope) {
                    collectVariables(useScope);
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
                        collectVariables(parentScope);
                    }
                }
            }
        }
    };

    let current: Scope | undefined = initialScope;
    while (current) {
        if (current.kind === ScopeKind.Definition) {
            collectVariables(current);
        } else {
            for (const [key, sym] of current.symbols) {
                if (sym.kind === SymbolKind.Variable || sym.definitionType === 'Variable') {
                    if (!variables.has(key.toLowerCase())) {
                        variables.set(key.toLowerCase(), sym);
                    }
                }
            }
        }
        current = current.parent;
    }

    return variables;
}

export function getReachableChildren(state: IScopeResolverState, scope: Scope, targetType: string): SymbolInfo[] {
    const results: SymbolInfo[] = [];
    const visitedScopes = new Set<string>();
    const targetTypeLower = targetType.toLowerCase();

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
