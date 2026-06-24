import { ScopeManager } from './index';
import { 
    Scope, ScopeKind, ScopeNodeDTO, ScopeTreeDTO, 
    PaginatedSymbolsDTO, hasFunctionsAndActions, 
    hasAttributes, hasSchemas, hasDefinitions, DefinitionScope 
} from './types';
import { SymbolInfo } from '../../models/symbols';
import { SymbolKind } from 'tally-tdl-shared';

export class ScopeViewerService {
    private manager: ScopeManager;

    constructor(manager: ScopeManager) {
        this.manager = manager;
    }

    /**
     * Serialize the entire scope hierarchy relevant to a file for debugging/visualization
     */
    public serializeScopeTree(uri: string): ScopeTreeDTO {
        return [
            this.serializeNode(this.manager.globalScope, 0, 0),
            this.serializeNode(this.manager.projectScope, 0, 0)
        ];
    }

    public getScopeChildren(scopeId: string): ScopeNodeDTO[] {
        const target = this.findScopeById(this.manager.globalScope, scopeId) || 
                       this.findScopeById(this.manager.projectScope, scopeId);
        
        if (target) {
            // Serialize node with maxDepth=1 to get its immediate children
            const serialized = this.serializeNode(target, 0, 1);
            return serialized.children;
        }
        return [];
    }

    private findScopeById(node: Scope, id: string): Scope | undefined {
        if (node.id === id) return node;
        for (const child of node.childScopes) {
            const found = this.findScopeById(child, id);
            if (found) return found;
        }
        return undefined;
    }

    private serializeNode(node: Scope, currentDepth: number, maxDepth: number): ScopeNodeDTO {
        const symbolGroups: { kind: string, count: number }[] = [];
        let children: ScopeNodeDTO[] = [];

        this.addBasicGroups(node, symbolGroups);
        this.addDefinitionGroups(node, symbolGroups);
        this.addDefinitionsGroups(node, symbolGroups);

        const hasRealChildren = node.childScopes.length > 0;
        const hasAttributesNode = hasAttributes(node);
        const hasSchemasNode = hasSchemas(node);
        const hasDefinitionsNode = hasDefinitions(node);
        const hasChildren = hasRealChildren || hasAttributesNode || hasSchemasNode || hasDefinitionsNode;

        if (currentDepth < maxDepth) {
            this.addAttributeGroups(node, children);
            this.addSchemaGroups(node, children);
            
            const rawChildren = node.childScopes;
            children.push(...rawChildren.map(c => this.serializeNode(c, currentDepth + 1, maxDepth)));
        }

        const parentIds = this.manager.parentDefinitions.get(node.id.toLowerCase());
        const structuralParents = parentIds ? Array.from(parentIds) : undefined;

        const childIds = this.manager.childDefinitions.get(node.id.toLowerCase());
        const structuralChildren = childIds ? Array.from(childIds) : undefined;

        const useIds = this.manager.useInheritance.get(node.id.toLowerCase());
        const usedDefinitions = useIds ? Array.from(useIds) : undefined;

        return {
            id: node.id,
            kind: node.kind,
            range: node.range,
            structuralParents,
            structuralChildren,
            usedDefinitions,
            symbolGroups,
            children,
            hasChildren
        };
    }

    private addBasicGroups(node: Scope, symbolGroups: { kind: string, count: number }[]) {
        if (node.variables.size > 0) symbolGroups.push({ kind: 'Variables', count: node.variables.size });
        if (node.formulas.size > 0) symbolGroups.push({ kind: 'Formulas', count: node.formulas.size });
        if (hasFunctionsAndActions(node)) {
            if (node.functions.size > 0) symbolGroups.push({ kind: 'Functions', count: node.functions.size });
            if (node.actions.size > 0) symbolGroups.push({ kind: 'Actions', count: node.actions.size });
        }
    }

    private addDefinitionGroups(node: Scope, symbolGroups: { kind: string, count: number }[]) {
        if (node.kind === ScopeKind.Definition) {
            const defNode = node as DefinitionScope;
            if (defNode.uses && defNode.uses.size > 0) symbolGroups.push({ kind: 'Uses', count: defNode.uses.size });
            if (defNode.structuralChildren) {
                let childCount = 0;
                for (const set of defNode.structuralChildren.values()) childCount += set.size;
                if (childCount > 0) symbolGroups.push({ kind: 'StructuralChildren', count: childCount });
            }
        }
    }

    private addAttributeGroups(node: Scope, children: ScopeNodeDTO[]) {
        if (hasAttributes(node)) {
            const attrGroups: { kind: string, count: number }[] = [];
            for (const [defType, attrMap] of node.attributes.entries()) {
                if (attrMap.size > 0) {
                    attrGroups.push({ kind: `Attribute_${defType}`, count: attrMap.size });
                }
            }
            if (attrGroups.length > 0) {
                children.push({
                    id: `${node.id}_Attributes`,
                    kind: 'AttributesCategory',
                    range: undefined,
                    children: [],
                    symbolGroups: attrGroups
                } as any);
            }
        }
    }

    private addSchemaGroups(node: Scope, children: ScopeNodeDTO[]) {
        if (hasSchemas(node) && node.schemas.size > 0) {
            const schemaGroups: { kind: string, count: number }[] = [];
            for (const [schemaName, schemaObj] of node.schemas.entries()) {
                if (schemaObj.isPrimary) {
                    const propCount = schemaObj.properties.size;
                    schemaGroups.push({ kind: `Schema_${schemaName}`, count: propCount });
                }
            }
            children.push({
                id: `${node.id}_Schemas`,
                kind: 'SchemasCategory',
                range: undefined,
                children: [],
                symbolGroups: schemaGroups
            } as any);
        }
    }

    private addDefinitionsGroups(node: Scope, symbolGroups: { kind: string, count: number }[]) {
        if (hasDefinitions(node)) {
            for (const [defType, defMap] of node.definitions.entries()) {
                if (defMap.size > 0) {
                    symbolGroups.push({ kind: defType, count: defMap.size });
                }
            }
        }
    }

    /**
     * Get paginated symbols for a specific scope and kind
     */
    public getSymbolsPaginated(scopeId: string, kind: string, page: number, limit: number, query?: string): PaginatedSymbolsDTO {
        let realScopeId = scopeId;
        if (realScopeId.endsWith('_Attributes')) realScopeId = realScopeId.replace('_Attributes', '');
        if (realScopeId.endsWith('_Schemas')) realScopeId = realScopeId.replace('_Schemas', '');
        
        const scope = this.manager.getScopeById(realScopeId) || (realScopeId === 'global' ? this.manager.globalScope : this.manager.projectScope);
        let symbols: SymbolInfo[] = [];

        if (scope) {
            symbols = this.collectSymbols(scope, kind);
        }

        if (query) {
            symbols = this.filterSymbols(symbols, query);
        }

        // Sort by name for consistent pagination
        symbols.sort((a, b) => {
            const nameA = a.name || '';
            const nameB = b.name || '';
            return nameA.localeCompare(nameB);
        });

        const totalCount = symbols.length;
        
        const lowerKind = kind.toLowerCase();
        if (lowerKind.startsWith('schema_') || lowerKind.startsWith('attribute_')) {
            limit = totalCount > 0 ? totalCount : 1;
            page = 1;
        }

        const startIndex = (page - 1) * limit;
        let paginatedSymbols = symbols.slice(startIndex, startIndex + limit);

        // Enrich definition symbols with structural data if they are definitions
        if (kind !== 'Variables' && kind !== 'Functions' && kind !== 'Actions' && kind !== 'Attributes' && kind !== 'Schemas' && !lowerKind.startsWith('attribute_') && !lowerKind.startsWith('schema_')) {
            paginatedSymbols = this.enrichSymbols(paginatedSymbols);
        }

        return {
            symbols: paginatedSymbols,
            totalCount,
            page,
            limit,
            kind
        };
    }

    private collectSymbols(scope: Scope, kind: string): SymbolInfo[] {
        const lowerKind = kind.toLowerCase();
        const symbols: SymbolInfo[] = [];

        if (lowerKind === 'variables') {
            symbols.push(...Array.from(scope.variables.values()));
        } else if (lowerKind === 'formulas') {
            symbols.push(...Array.from(scope.formulas.values()));
        } else if (lowerKind === 'uses' && scope.kind === ScopeKind.Definition) {
            const defScope = scope as DefinitionScope;
            if (defScope.uses) {
                for (const useId of defScope.uses) {
                    const parts = useId.split(':');
                    if (parts.length >= 2) {
                        const typeLower = parts[0];
                        const nameLower = parts.slice(1).join(':');
                        const mapMatch = Array.from(this.manager.projectScope.definitions.entries()).find(([k]) => k.toLowerCase() === typeLower);
                        if (mapMatch) {
                            const sym = mapMatch[1].get(nameLower);
                            if (sym) symbols.push(sym);
                        }
                    }
                }
            }
        } else if (lowerKind === 'structuralchildren' && scope.kind === ScopeKind.Definition) {
            const defScope = scope as DefinitionScope;
            if (defScope.structuralChildren) {
                for (const [type, set] of defScope.structuralChildren.entries()) {
                    const mapMatch = Array.from(this.manager.projectScope.definitions.entries()).find(([k]) => k.toLowerCase() === type.toLowerCase());
                    if (mapMatch) {
                        for (const childName of set) {
                            const sym = mapMatch[1].get(childName.toLowerCase());
                            if (sym) symbols.push(sym);
                        }
                    }
                }
            }
        } else if (lowerKind === 'functions' && hasFunctionsAndActions(scope)) {
            symbols.push(...Array.from(scope.functions.values()));
        } else if (lowerKind === 'actions' && hasFunctionsAndActions(scope)) {
            symbols.push(...Array.from(scope.actions.values()));
        } else if ((lowerKind === 'attributes' || lowerKind === 'attributescategory') && hasAttributes(scope)) {
            for (const [defType, attrMap] of scope.attributes.entries()) {
                if (attrMap.size > 0) {
                    symbols.push({
                        name: defType,
                        kind: SymbolKind.Unknown,
                        definitionType: 'Definition Type',
                        description: `${attrMap.size} attributes`
                    } as any);
                }
            }
        } else if (lowerKind.startsWith('attribute_') && hasAttributes(scope)) {
            const defType = kind.substring(10).trim();
            const attrMap = Array.from(scope.attributes.entries()).find(([k]) => k.toLowerCase().trim() === defType.toLowerCase())?.[1];
            if (attrMap) symbols.push(...Array.from(attrMap.values()));
        } else if ((lowerKind === 'schemas' || lowerKind === 'schemascategory') && hasSchemas(scope)) {
            symbols.push(...Array.from(scope.schemas.values()));
        } else if (lowerKind.startsWith('schema_') && hasSchemas(scope)) {
            const schemaName = kind.substring(7).trim();
            const schema = Array.from(scope.schemas.values()).find(s => s.name.toLowerCase().trim() === schemaName.toLowerCase());
            if (schema) {
                symbols.push({
                    ...schema,
                    serializedProperties: Array.from(schema.properties.entries()).map(([k, v]) => ({ name: k, ...v })),
                    serializedComplexProperties: Array.from(schema.complexProperties.entries()).map(([k, v]) => ({ name: k, type: v }))
                } as any);
            }
        } else if (hasDefinitions(scope)) {
            for (const [defType, defMap] of scope.definitions.entries()) {
                if (defType.toLowerCase() === lowerKind || defType === kind) {
                    symbols.push(...Array.from(defMap.values()));
                }
            }
        }

        return symbols;
    }

    private filterSymbols(symbols: SymbolInfo[], query: string): SymbolInfo[] {
        if (!query) return symbols;
        const lowerQuery = query.toLowerCase();
        return symbols.filter(s => {
            if (!s) return false;
            if ('serializedProperties' in s) {
                const schema = s as any;
                const props = schema.serializedProperties.filter((p: any) => 
                    (p.name && p.name.toLowerCase().includes(lowerQuery)) ||
                    (p.DataType && p.DataType.toLowerCase().includes(lowerQuery)) ||
                    (p.ObjectName && p.ObjectName.toLowerCase().includes(lowerQuery))
                );
                if (props.length > 0) {
                    schema.serializedProperties = props;
                    return true;
                }
                return false;
            }
            return (s.name && s.name.toLowerCase().includes(lowerQuery)) || 
                   (s.definitionType && s.definitionType.toLowerCase().includes(lowerQuery));
        });
    }

    private enrichSymbols(symbols: SymbolInfo[]): SymbolInfo[] {
        return symbols.map(s => {
            if (!s || !s.name) return s;
            const nameLower = s.name.toLowerCase();
            const children = this.manager.childDefinitions.get(nameLower);
            const parents = this.manager.parentDefinitions.get(nameLower);
            const uses = this.manager.useInheritance.get(nameLower);
            const mods = this.manager.modifierContributions.get(nameLower);
            
            return {
                ...s,
                structuralChildren: children ? Array.from(children) : undefined,
                structuralParents: parents ? Array.from(parents) : undefined,
                usedDefinitions: uses ? Array.from(uses) : undefined,
                modifiersCount: mods ? mods.length : 0
            } as any;
        });
    }
}
