import { ScopeManager } from './index';
import { 
    Scope, ScopeKind, ScopeNodeDTO, ScopeTreeDTO, 
    PaginatedSymbolsDTO, ScopeDetailsDTO, ScopeDetailVariable, ScopeDetailFormula, ScopeDetailChild,
    hasFunctionsAndActions, hasAttributes, hasSchemas, hasDefinitions, DefinitionScope 
} from './types';
import { SymbolInfo } from 'tally-tdl-shared';
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
        if (scopeId === 'project_Files') {
            return this.manager.projectScope.childScopes.map(c => this.serializeNode(c, 0, 0));
        }

        const target = this.manager.getScopeById(scopeId) || (scopeId === 'global' ? this.manager.globalScope : undefined) || (scopeId === 'project' ? this.manager.projectScope : undefined);
        
        if (target) {
            // Serialize node with maxDepth=1 to get its immediate children
            const serialized = this.serializeNode(target, 0, 1);
            return serialized.children;
        }
        return [];
    }

    public getScopeNode(scopeId: string): ScopeNodeDTO | undefined {
        const target = this.manager.getScopeById(scopeId) || (scopeId === 'global' ? this.manager.globalScope : undefined) || (scopeId === 'project' ? this.manager.projectScope : undefined);
        
        if (target) {
            return this.serializeNode(target, 0, 0);
        }
        return undefined;
    }

    /**
     * Get a comprehensive breakdown of a scope for definition-level inspection
     * (variables, formulas, structural children grouped by type, fetched/computed fields, uses, etc.)
     */
    public getScopeDetails(scopeId: string): ScopeDetailsDTO | undefined {
        let realScopeId = scopeId;
        if (realScopeId.endsWith('_Attributes')) realScopeId = realScopeId.replace('_Attributes', '');
        if (realScopeId.endsWith('_Schemas')) realScopeId = realScopeId.replace('_Schemas', '');
        if (realScopeId.endsWith('_Definitions')) realScopeId = realScopeId.replace('_Definitions', '');

        const target = this.manager.getScopeById(realScopeId) 
            || (realScopeId === 'global' ? this.manager.globalScope : undefined) 
            || (realScopeId === 'project' ? this.manager.projectScope : undefined)
            || this.findScopeById(this.manager.globalScope, realScopeId)
            || this.findScopeById(this.manager.projectScope, realScopeId);

        if (!target) return undefined;

        const defSymbol = (target as any).definition;
        const parts = target.id.split(':');
        const defaultType = parts.length > 1 ? parts[0] : target.kind;
        const defaultName = parts.length > 1 ? parts.slice(1).join(':') : target.id;

        const name = defSymbol?.name || defaultName;
        const definitionType = defSymbol?.definitionType || defaultType;
        const nameLower = name.toLowerCase();
        const idLower = target.id.toLowerCase();

        // 1. Variables
        const variables: ScopeDetailVariable[] = [];
        for (const v of target.variables.values()) {
            variables.push({
                name: v.name,
                dataType: (v as any).dataType || (v as any).valueType,
                value: (v as any).value,
                isSystemVariable: (v as any).isSystemVariable,
                description: v.description,
                range: (v as any).start !== undefined && (v as any).end !== undefined ? { start: (v as any).start, end: (v as any).end } : undefined
            });
        }
        variables.sort((a, b) => a.name.localeCompare(b.name));

        // 2. Formulas
        const formulas: ScopeDetailFormula[] = [];
        for (const f of target.formulas.values()) {
            formulas.push({
                name: f.name,
                value: (f as any).value,
                parameters: (f as any).parameters,
                range: (f as any).start !== undefined && (f as any).end !== undefined ? { start: (f as any).start, end: (f as any).end } : undefined
            });
        }
        formulas.sort((a, b) => a.name.localeCompare(b.name));

        // 3. Fetched and Computed Fields, Object/Collection Scopes
        let fetchedFields: string[] = [];
        let computedFields: string[] = [];
        let objectScope: string | undefined;
        let collectionScope: string | undefined;

        if (target.kind === ScopeKind.Definition) {
            const defNode = target as DefinitionScope;
            if (defNode.fetchedFields) fetchedFields = Array.from(defNode.fetchedFields);
            if (defNode.computedFields) computedFields = Array.from(defNode.computedFields);
            objectScope = defNode.objectScope;
            collectionScope = defNode.collectionScope;
        } else if (target.kind === ScopeKind.Function) {
            const fnNode = target as any;
            objectScope = fnNode.objectScope;
            collectionScope = fnNode.collectionScope;
        }

        // 4. Parents & Uses & Modifiers
        const parentIds = this.manager.parentDefinitions.get(idLower) || this.manager.parentDefinitions.get(nameLower);
        const structuralParents = parentIds ? Array.from(parentIds) : undefined;

        const useIds = this.manager.useInheritance.get(idLower) 
            || this.manager.useInheritance.get(nameLower) 
            || ((target as any).uses ? (target as any).uses : undefined);
        const usedDefinitions: string[] = useIds ? (Array.from(useIds) as string[]) : [];

        const mods = this.manager.modifierContributions.get(nameLower) || this.manager.modifierContributions.get(idLower);
        const modifiersCount = mods ? mods.length : 0;

        // 5. Structural Children Grouped by Type
        const childrenByType: Record<string, ScopeDetailChild[]> = {};
        
        const addChild = (childType: string, childName: string, childId: string, childUri?: string, childStart?: number, childEnd?: number, childDesc?: string) => {
            const normalizedChildType = childType ? (childType.charAt(0).toUpperCase() + childType.slice(1)) : 'Unknown';
            if (!childrenByType[normalizedChildType]) {
                childrenByType[normalizedChildType] = [];
            }
            if (!childrenByType[normalizedChildType].some(c => c.id.toLowerCase() === childId.toLowerCase() || c.name.toLowerCase() === childName.toLowerCase())) {
                const childChildIds = this.manager.childDefinitions.get(childId.toLowerCase()) || this.manager.childDefinitions.get(childName.toLowerCase());
                const childCount = childChildIds ? childChildIds.size : undefined;

                childrenByType[normalizedChildType].push({
                    name: childName,
                    id: childId,
                    definitionType: normalizedChildType,
                    description: childDesc,
                    uri: childUri,
                    start: childStart,
                    end: childEnd,
                    childCount
                });
            }
        };

        // Source A: childDefinitions map from manager
        const managerChildIds = this.manager.childDefinitions.get(idLower) || this.manager.childDefinitions.get(nameLower);
        if (managerChildIds) {
            for (const childId of managerChildIds) {
                const childScope = this.manager.getScopeById(childId);
                const cParts = childId.split(':');
                const cType = (childScope as any)?.definition?.definitionType || (cParts.length > 1 ? cParts[0] : 'Child');
                const cName = (childScope as any)?.definition?.name || (cParts.length > 1 ? cParts.slice(1).join(':') : childId);
                const cUri = childScope?.uri || (childScope as any)?.definition?.uri;
                const cStart = childScope?.range?.start ?? (childScope as any)?.definition?.start;
                const cEnd = childScope?.range?.end ?? (childScope as any)?.definition?.end;
                const cDesc = (childScope as any)?.definition?.description;
                addChild(cType, cName, childId, cUri, cStart, cEnd, cDesc);
            }
        }

        // Source B: DefinitionScope.structuralChildren map
        if (target.kind === ScopeKind.Definition) {
            const defScope = target as DefinitionScope;
            if (defScope.structuralChildren) {
                for (const [type, names] of defScope.structuralChildren.entries()) {
                    for (const childName of names) {
                        const childId = `${type}:${childName}`;
                        const childScope = this.manager.getScopeById(childId);
                        const cUri = childScope?.uri || (childScope as any)?.definition?.uri;
                        const cStart = childScope?.range?.start ?? (childScope as any)?.definition?.start;
                        const cEnd = childScope?.range?.end ?? (childScope as any)?.definition?.end;
                        const cDesc = (childScope as any)?.definition?.description;
                        addChild(type, childName, childId, cUri, cStart, cEnd, cDesc);
                    }
                }
            }
        }

        // Source C: direct childScopes
        if (target.childScopes && target.childScopes.length > 0) {
            for (const cs of target.childScopes) {
                if (cs.kind === ScopeKind.Definition || cs.kind === ScopeKind.Function) {
                    const csDef = (cs as any).definition;
                    const csParts = cs.id.split(':');
                    const csType = csDef?.definitionType || (csParts.length > 1 ? csParts[0] : cs.kind);
                    const csName = csDef?.name || (csParts.length > 1 ? csParts.slice(1).join(':') : cs.id);
                    addChild(csType, csName, cs.id, cs.uri || csDef?.uri, cs.range?.start ?? csDef?.start, cs.range?.end ?? csDef?.end, csDef?.description);
                }
            }
        }

        // Sort children in each category alphabetically
        for (const type of Object.keys(childrenByType)) {
            childrenByType[type].sort((a, b) => a.name.localeCompare(b.name));
        }

        return {
            id: target.id,
            name,
            kind: target.kind,
            definitionType,
            objectScope,
            collectionScope,
            structuralParents,
            childrenByType,
            variables,
            formulas,
            fetchedFields,
            computedFields,
            usedDefinitions,
            modifiersCount,
            uri: target.uri || defSymbol?.uri,
            start: target.range?.start ?? defSymbol?.start,
            end: target.range?.end ?? defSymbol?.end
        };
    }


    private findScopeById(node: Scope, id: string): Scope | undefined {
        if (node.id.toLowerCase() === id.toLowerCase()) return node;
        for (const child of node.childScopes) {
            const found = this.findScopeById(child, id);
            if (found) return found;
        }
        return undefined;
    }

    private serializeNode(node: Scope, currentDepth: number, maxDepth: number): ScopeNodeDTO {
        const symbolGroups: { kind: string, count: number }[] = [];
        this.addBasicGroups(node, symbolGroups);
        this.addDefinitionGroups(node, symbolGroups);

        let children: ScopeNodeDTO[] = [];

        const childIds = this.manager.childDefinitions.get(node.id.toLowerCase());
        const structuralChildren = childIds ? Array.from(childIds) : undefined;
        const hasStructuralChildrenNode = structuralChildren && structuralChildren.length > 0;

        const hasRealChildren = node.childScopes.length > 0;
        const hasAttributesNode = hasAttributes(node);
        const hasSchemasNode = hasSchemas(node);
        const hasDefinitionsNode = hasDefinitions(node);
        const hasChildren = hasRealChildren || hasAttributesNode || hasSchemasNode || hasDefinitionsNode || !!hasStructuralChildrenNode;

        if (currentDepth < maxDepth) {
            this.addAttributeGroups(node, children);
            this.addSchemaGroups(node, children);
            this.addDefinitionsGroups(node, children);
            if (structuralChildren) {
                const structuralChildNodes = structuralChildren
                    .map(id => this.manager.getScopeById(id))
                    .filter(s => s !== undefined) as Scope[];
                
                // Group structural children logically under a "Structural Hierarchy" folder
                if (structuralChildNodes.length > 0) {
                    children.push({
                        id: `${node.id}_Structural`,
                        kind: `Structural Hierarchy`,
                        range: undefined,
                        children: structuralChildNodes.map(c => this.serializeNode(c, currentDepth + 1, maxDepth)),
                        hasChildren: true,
                        _childrenLoaded: true,
                        symbolGroups: []
                    } as any);
                }
            }

            const rawChildren = node.childScopes;
            if (node.kind === ScopeKind.Project && rawChildren.length > 0) {
                children.push({
                    id: `${node.id}_Files`,
                    kind: 'FilesCategory',
                    name: 'Files',
                    range: undefined,
                    children: [],
                    hasChildren: true,
                    _childrenLoaded: false,
                    symbolGroups: []
                } as any);
            } else {
                children.push(...rawChildren.map(c => this.serializeNode(c, currentDepth + 1, maxDepth)));
            }
        }

        const parentIds = this.manager.parentDefinitions.get(node.id.toLowerCase());
        const structuralParents = parentIds ? Array.from(parentIds) : undefined;

        const useIds = this.manager.useInheritance.get(node.id.toLowerCase());
        const usedDefinitions = useIds ? Array.from(useIds) : undefined;

        let objectScope: string | undefined;
        let collectionScope: string | undefined;
        if (node.kind === ScopeKind.Definition) {
            const defNode = node as DefinitionScope;
            objectScope = defNode.objectScope;
            collectionScope = defNode.collectionScope;
        }

        return {
            id: node.id,
            kind: node.kind,
            range: node.range,
            structuralParents,
            structuralChildren,
            usedDefinitions,
            objectScope,
            collectionScope,
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
            if (defNode.fetchedFields && defNode.fetchedFields.size > 0) {
                symbolGroups.push({ kind: 'FetchedFields', count: defNode.fetchedFields.size });
            }
            if (defNode.computedFields && defNode.computedFields.size > 0) {
                symbolGroups.push({ kind: 'ComputedFields', count: defNode.computedFields.size });
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
                    const propCount = schemaObj.properties.size + (schemaObj.complexProperties?.size || 0);
                    schemaGroups.push({ kind: `Schema_${schemaObj.name}`, count: propCount });
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

    private addDefinitionsGroups(node: Scope, children: ScopeNodeDTO[]) {
        if (hasDefinitions(node)) {
            const defGroups: { kind: string, count: number }[] = [];
            for (const [defType, defMap] of node.definitions.entries()) {
                if (defMap.size > 0) {
                    defGroups.push({ kind: defType, count: defMap.size });
                }
            }
            if (defGroups.length > 0) {
                children.push({
                    id: `${node.id}_Definitions`,
                    kind: 'DefinitionsCategory',
                    range: undefined,
                    children: [],
                    symbolGroups: defGroups
                } as any);
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
        if (realScopeId.endsWith('_Definitions')) realScopeId = realScopeId.replace('_Definitions', '');
        
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
                        const mapMatch = this.manager.scopeIndex.get(typeLower);
                        if (mapMatch) {
                            const defScopes = mapMatch.get(nameLower);
                            if (defScopes) {
                                for (const defScope of defScopes) {
                                    if (defScope.kind === ScopeKind.Definition) {
                                        const ds = defScope as DefinitionScope;
                                        if (ds.definition) symbols.push(ds.definition);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else if (lowerKind === 'structuralchildren' && scope.kind === ScopeKind.Definition) {
            const defScope = scope as DefinitionScope;
            if (defScope.structuralChildren) {
                for (const [type, set] of defScope.structuralChildren.entries()) {
                    const mapMatch = this.manager.scopeIndex.get(type.toLowerCase());
                    if (mapMatch) {
                        for (const childName of set) {
                            const defScopes = mapMatch.get(childName.toLowerCase());
                            if (defScopes) {
                                for (const defScope of defScopes) {
                                    if (defScope.kind === ScopeKind.Definition) {
                                        const ds = defScope as DefinitionScope;
                                        if (ds.definition) symbols.push(ds.definition);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else if (lowerKind === 'fetchedfields' && scope.kind === ScopeKind.Definition) {
            const defScope = scope as DefinitionScope;
            if (defScope.fetchedFields) {
                for (const field of defScope.fetchedFields) {
                    symbols.push({ name: field, kind: SymbolKind.Field, uri: scope.uri || '', start: 0, end: 0, definitionType: 'Field' });
                }
            }
        } else if (lowerKind === 'computedfields' && scope.kind === ScopeKind.Definition) {
            const defScope = scope as DefinitionScope;
            if (defScope.computedFields) {
                for (const field of defScope.computedFields) {
                    symbols.push({ name: field, kind: SymbolKind.Field, uri: scope.uri || '', start: 0, end: 0, definitionType: 'Field' });
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
                    serializedProperties: Array.from(schema.properties.entries()).map((entry: any) => ({ name: entry[0], ...entry[1] })),
                    serializedComplexProperties: Array.from(schema.complexProperties.entries()).map((entry: any) => ({ name: entry[0], type: entry[1] }))
                } as any);
            }
        } else if (hasDefinitions(scope) && scope.definitions) {
            for (const [defType, defMap] of scope.definitions.entries()) {
                if (defType.toLowerCase() === lowerKind || defType === kind) {
                    symbols.push(...defMap.values());
                }
            }
        } else if (scope.kind === ScopeKind.Project) {
            // Project definitions are now in scopeIndex
            for (const [defType, defMap] of this.manager.scopeIndex.entries()) {
                if (defType.toLowerCase() === lowerKind || defType === kind) {
                    for (const defScopes of defMap.values()) {
                        for (const defScope of defScopes) {
                            if (defScope.kind === ScopeKind.Definition) {
                                const ds = defScope as DefinitionScope;
                                if (ds.definition) symbols.push(ds.definition);
                            }
                        }
                    }
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
