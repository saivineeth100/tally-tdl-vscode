import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { ScopeManager } from '../../../services/scopeManager/index';
import { normalizeTypeName, normalizeXMLTypeName } from '../../../services/utils';
import { getFunctionSuggestions } from './functionProvider';
import { getSuggestionsForDefinitionType } from './definitionProvider';
import { CompletionContext } from '../contextAnalyzer';
import { DefinitionScope, Scope } from '../../../services/scopeManager/types';
import { IScopeResolverState } from '../../../services/scopeManager/scopeResolver';
import { resolveSchema } from '../../../services/scopeManager/scopeResolver';
import { SymbolKind } from '../../../models/symbols';
import { getExpectedTypeForMenuItem } from '../../../services/attributeUtils';

export function provideAttributeCompletions(
    scopeManager: ScopeManager,
    defTypeName: string,
    partial: string,
    isXml: boolean,
    hasTrailingColon?: boolean
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedDefType = normalizeTypeName(defTypeName);

    const matchingDefAttributes = scopeManager.globalScope.attributes.get(normalizedDefType);

    if (matchingDefAttributes) {
        const lowerPartial = normalizeTypeName(partial);
        const addedAttrs = new Set<string>();

        for (const [key, attr] of matchingDefAttributes) {
            if (addedAttrs.has(attr.name)) continue;

            const nameMatches = lowerPartial === '' || key.includes(lowerPartial);

            if (nameMatches) {
                addedAttrs.add(attr.name);
                const displayAttr = isXml ? normalizeXMLTypeName(attr.name) : attr.name;
                items.push({
                    label: displayAttr,
                    kind: CompletionItemKind.Property,
                    detail: `${defTypeName} attribute`,
                    insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr}${hasTrailingColon ? '' : ' : '}`,
                    insertTextFormat: isXml ? 2 : undefined,
                    data: { type: 'attribute', defType: defTypeName, name: attr.name },
                    sortText: '1_' + attr.name.toLowerCase(),
                });
            }
        }
    }
    return items;
}

export function provideAttributeValueCompletions(
    scopeManager: ScopeManager,
    defTypeName: string,
    context: CompletionContext,
    scope?: Set<string>,
    currentScope?: Scope
): CompletionItem[] {
    const items: CompletionItem[] = [];
    if (!context.attributeName || context.paramIndex === undefined) return items;

    // Use scopeManager to resolve attribute 
    // Usually attributes exist globally per definition type, so we can just check globalScope.attributes
    const normalizedDefType = normalizeTypeName(defTypeName);
    const normalizedAttr = normalizeTypeName(context.attributeName);

    const attrMap = scopeManager.globalScope.attributes.get(normalizedDefType);

    // Collection Fetch/Compute autocomplete
    if (normalizedDefType === 'collection' && (normalizedAttr === 'fetch' || normalizedAttr === 'compute') && currentScope) {
        let objectScopeName: string | undefined;
        if ('objectScope' in currentScope) {
            objectScopeName = (currentScope as any).objectScope;
        }

        if (objectScopeName) {
            const mockState: IScopeResolverState = {
                useInheritance: scopeManager.useInheritance,
                inUseInheritance: scopeManager.inUseInheritance,
                parentDefinitions: scopeManager.parentDefinitions,
                childDefinitions: scopeManager.childDefinitions,
                globalScope: scopeManager.globalScope,
                projectScope: scopeManager.projectScope,
                findDefinitionScope: (id) => scopeManager.findDefinitionScope(id),
                findGlobalSymbolsByName: (name, projectNodes) => scopeManager.findGlobalSymbolsByName(name, projectNodes),
                getCanonicalTypeName: (n) => scopeManager.getCanonicalTypeName(n),
                normalizeScopeId: (id) => scopeManager.normalizeScopeId(id),
                getProjectDefinition: (d, n) => scopeManager.getProjectDefinition(d, n)
            };
            const schema = resolveSchema(mockState, objectScopeName, currentScope, scope);

            if (schema) {
                for (const prop of schema.properties.values()) {
                    // Support nested property completion if the user typed "Ledger."
                    const typedPath = context.partial.split('.');
                    if (typedPath.length > 1) {
                        const rootProp = typedPath[0].toLowerCase();
                        if (prop.Name.toLowerCase() === rootProp && prop.IsComplex && prop.ObjectName) {
                                const mockState2: IScopeResolverState = {
                                    useInheritance: scopeManager.useInheritance,
                                    inUseInheritance: scopeManager.inUseInheritance,
                                    parentDefinitions: scopeManager.parentDefinitions,
                                    childDefinitions: scopeManager.childDefinitions,
                                    globalScope: scopeManager.globalScope,
                                    projectScope: scopeManager.projectScope,
                                    findDefinitionScope: (id) => scopeManager.findDefinitionScope(id),
                                    findGlobalSymbolsByName: (name, projectNodes) => scopeManager.findGlobalSymbolsByName(name, projectNodes),
                                    getCanonicalTypeName: (n) => scopeManager.getCanonicalTypeName(n),
                                    normalizeScopeId: (id) => scopeManager.normalizeScopeId(id),
                                    getProjectDefinition: (d, n) => scopeManager.getProjectDefinition(d, n)
                                };
                                const subSchema = resolveSchema(mockState2, prop.ObjectName, currentScope, scope);
                            if (subSchema) {
                                for (const subProp of subSchema.properties.values()) {
                                    const fullSubPath = `${prop.Name}.${subProp.Name}`;
                                    if (context.partial === '' || fullSubPath.toLowerCase().includes(context.partial.toLowerCase())) {
                                        items.push({
                                            label: fullSubPath,
                                            kind: CompletionItemKind.Field,
                                            detail: 'Nested Schema Property',
                                            insertText: fullSubPath,
                                            sortText: '0_' + fullSubPath.toLowerCase()
                                        });
                                    }
                                }
                                items.push({
                                    label: `${prop.Name}.*`,
                                    kind: CompletionItemKind.Keyword,
                                    detail: 'All Nested Properties',
                                    insertText: `${prop.Name}.*`,
                                    sortText: '0_' + prop.Name.toLowerCase() + '.*'
                                });
                            }
                        }
                    } else if (context.partial === '' || prop.Name.toLowerCase().includes(context.partial.toLowerCase())) {
                        items.push({
                            label: prop.Name,
                            kind: CompletionItemKind.Field,
                            detail: 'Schema Property',
                            insertText: prop.Name,
                            sortText: '0_' + prop.Name.toLowerCase()
                        });
                    }
                }
                
                // Add * for fetch
                if (normalizedAttr === 'fetch') {
                    items.push({
                        label: '*',
                        kind: CompletionItemKind.Keyword,
                        detail: 'All Properties',
                        insertText: '*',
                        sortText: '0_*'
                    });
                }
            }

            // Also add #Object extensions
            const globalSymbols = scopeManager.findGlobalSymbolsByName(objectScopeName, scope);
            const objDefs = globalSymbols.filter(s => s.definitionType?.toLowerCase() === 'object' || s.kind === SymbolKind.Object);
            for (const objDef of objDefs) {
                const objScope = scopeManager.findDefinitionScope(`object:${objDef.name}`.toLowerCase());
                if (objScope) {
                    if (objScope.formulas) {
                        for (const [formulaName, sym] of objScope.formulas.entries()) {
                            if (context.partial === '' || formulaName.toLowerCase().includes(context.partial.toLowerCase())) {
                                items.push({
                                    label: sym.name || formulaName,
                                    kind: CompletionItemKind.Field,
                                    detail: 'Object Extension Property',
                                    insertText: sym.name || formulaName,
                                    sortText: '0_' + formulaName.toLowerCase()
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    if ((normalizedDefType === 'collection' && normalizedAttr === 'type') || normalizedAttr === 'object') {
        const addedSchemas = new Set<string>();
        // Suggest Schema names
        for (const [schemaName, schema] of scopeManager.globalScope.schemas.entries()) {
            if (context.partial === '' || schemaName.toLowerCase().includes(context.partial.toLowerCase())) {
                addedSchemas.add(schemaName.toLowerCase());
                items.push({
                    label: schema.name || schemaName,
                    kind: CompletionItemKind.Class,
                    detail: 'Schema',
                    insertText: schema.name || schemaName,
                    sortText: '0_' + schemaName.toLowerCase()
                });
            }
        }
        
        // Also suggest Object definitions
        const addObjects = (defs: Map<string, Map<string, import('../../../models/symbols').DefinitionSymbol>>) => {
            const objects = defs.get('object');
            if (objects) {
                for (const [objName, objDef] of objects.entries()) {
                    if (!addedSchemas.has(objName.toLowerCase())) {
                        if (context.partial === '' || objName.toLowerCase().includes(context.partial.toLowerCase())) {
                            addedSchemas.add(objName.toLowerCase());
                            items.push({
                                label: objDef.name || objName,
                                kind: CompletionItemKind.Class,
                                detail: 'Object Definition',
                                insertText: objDef.name || objName,
                                sortText: '1_' + objName.toLowerCase()
                            });
                        }
                    }
                }
            }
        };

        addObjects(scopeManager.globalScope.definitions);
        if (scopeManager.projectScope) {
            const projectObjects = scopeManager.scopeIndex.get('object');
            if (projectObjects) {
                for (const [objName, objScope] of projectObjects.entries()) {
                    if (objScope.kind === 'Definition') {
                        const ds = objScope as import('../../../services/scopeManager').DefinitionScope;
                        if (ds.definition) {
                            if (!addedSchemas.has(objName.toLowerCase())) {
                                if (context.partial === '' || objName.toLowerCase().includes(context.partial.toLowerCase())) {
                                    addedSchemas.add(objName.toLowerCase());
                                    items.push({
                                        label: ds.definition.name || objName,
                                        kind: CompletionItemKind.Class,
                                        detail: 'Object Definition',
                                        insertText: ds.definition.name || objName,
                                        sortText: '1_' + objName.toLowerCase()
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    if (!attrMap) return items;

    const attrDef = attrMap.get(normalizedAttr);
    
    // Special handling for Menu Item List attributes
    const isMenuItemList = attrDef?.type?.toLowerCase() === 'menu item list' && normalizedAttr !== 'indent';
    if (isMenuItemList) {
        const isKeyItem = normalizedAttr === 'keyitem';
        const actionIndex = isKeyItem ? 2 : 1;
        let actionName = '';
        if (context.valueParts && context.valueParts.length > actionIndex) {
            actionName = normalizeTypeName(context.valueParts[actionIndex]);
        }
        
        const expectedTypeStr = getExpectedTypeForMenuItem(attrDef.name, context.paramIndex, actionName, scopeManager);
        
        if (expectedTypeStr === 'Action') {
            const added = new Set<string>();
            for (const [key, action] of scopeManager.globalScope.actions) {
                if (added.has(action.name)) continue;
                
                if (context.partial === '' || action.name.toLowerCase().includes(context.partial.toLowerCase())) {
                    added.add(action.name);
                    items.push({
                        label: action.name,
                        kind: CompletionItemKind.Function,
                        detail: action.description || 'Action',
                        insertText: action.name,
                        sortText: '0_' + action.name.toLowerCase(),
                    });
                }
            }
            return items;
        } else if (expectedTypeStr && expectedTypeStr !== 'String') {
            items.push(...getSuggestionsForDefinitionType(expectedTypeStr, context.partial, scopeManager, scope));
            return items;
        } else if (expectedTypeStr === 'String') {
            return items;
        }
    }

    if (attrDef && attrDef.parameters && attrDef.parameters.length > context.paramIndex) {
        const param = attrDef.parameters[context.paramIndex];

        // 1. If parameter has Keywords, suggest them
         if (param.KeywordSet  && param.KeywordSet === 'tdlactions') {
                const added = new Set<string>();
                for (const [key, action] of scopeManager.globalScope.actions) {
                    if (added.has(action.name)) continue;
                    
                    if (context.partial === '' || action.name.toLowerCase().includes(context.partial.toLowerCase())) {
                        added.add(action.name);
                        items.push({
                            label: action.name,
                            kind: CompletionItemKind.Function,
                            detail: action.description || 'Action',
                            insertText: action.name,
                            sortText: '0_' + action.name.toLowerCase(),
                        });
                    }
                }
            }
        else if (param.Keywords) {
            const keywords = param.Keywords.map((k: string) => k.trim());
            for (const keyword of keywords) {
                if (context.partial === '' || keyword.toLowerCase().includes(context.partial.toLowerCase())) {
                    items.push({
                        label: keyword,
                        kind: CompletionItemKind.EnumMember,
                        detail: `Keyword: ${param.KeywordSet || 'Value'}`,
                        insertText: keyword,
                        sortText: '0_' + keyword.toLowerCase(),
                    });
                }
            }
        } else if (param.KeywordSet) {
            // Check keywordSets in scopeManager
            const keywords = scopeManager.keywordSets.get(param.KeywordSet);
            if (keywords) {
                for (const keyword of keywords) {
                    if (context.partial === '' || keyword.toLowerCase().includes(context.partial.toLowerCase())) {
                        items.push({
                            label: keyword,
                            kind: CompletionItemKind.EnumMember,
                            detail: `Keyword: ${param.KeywordSet}`,
                            insertText: keyword,
                            sortText: '0_' + keyword.toLowerCase(),
                        });
                    }
                }
            }

            // 1.5. If Datatype is Action, ALSO suggest all actions from metadata

        }

        // 2. If Datatype is Logical, suggest Yes/No
        if (param.DataType?.toLowerCase() === 'logical') {
            const logicalValues = ['Yes', 'No'];
            for (const val of logicalValues) {
                if (context.partial === '' || val.toLowerCase().includes(context.partial.toLowerCase())) {
                    items.push({
                        label: val,
                        kind: CompletionItemKind.Value,
                        detail: 'Logical value',
                        insertText: val,
                        sortText: '0_' + val.toLowerCase(),
                    });
                }
            }
        }
        // 3. If parameter refers to a definition, suggest matching definitions
        else if (param.RefersTo) {
            const refersToType = param.RefersTo.trim();
            if (refersToType.toLowerCase() === 'system formulae') {
                const addGlobalFormulas = (formulas: Map<string, import('../../../models/symbols').FormulaSymbol>) => {
                    for (const [formulaName, formula] of formulas.entries()) {
                        if (context.partial === '' || formulaName.toLowerCase().includes(context.partial.toLowerCase())) {
                            items.push({
                                label: formula.name || formulaName,
                                kind: CompletionItemKind.Value,
                                detail: 'Global Formula',
                                insertText: formula.name || formulaName,
                                sortText: '0_' + formulaName.toLowerCase()
                            });
                        }
                    }
                };
                if (scopeManager.projectScope) addGlobalFormulas(scopeManager.projectScope.formulas);
                if (scopeManager.globalScope) addGlobalFormulas(scopeManager.globalScope.formulas);
            } else if (refersToType) {
                items.push(...getSuggestionsForDefinitionType(refersToType, context.partial, scopeManager, scope));
            }
        }
        // 4. If Datatype is String, add a hint
        else if (param.DataType?.toLowerCase() === 'string') {
            items.push({
                label: '"..."',
                kind: CompletionItemKind.Snippet,
                detail: 'Expects a quoted string',
                insertText: '"$0"',
                insertTextFormat: 2, // Snippet
                sortText: '0_string',
            });
        }

        // 5. Add function suggestions
        if (context.partial.startsWith('$$') || context.partial === '$') {
            const funcPartial = context.partial.startsWith('$$')
                ? context.partial.substring(2)
                : '';
            const expectedType = param.DataType;
            items.push(...getFunctionSuggestions(scopeManager, funcPartial, expectedType));
        }
    }

    return items;
}
