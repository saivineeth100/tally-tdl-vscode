import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { DocManager } from '../../../docManager';
import { Scope } from '../../../services/scopeManager';
import { CompletionContext } from '../contextAnalyzer';
import { getDefinitionTypes } from '../utils';
import { getSuggestionsForDefinitionType, provideDefinitionTypeCompletions } from './definitionProvider';
import { provideAttributeValueCompletions } from './attributeProvider';
import { normalizeTypeName } from '../../../services/utils';
import { DefinitionNode } from '../../../parser/ast';

export function provideModifierValueCompletions(
    manager: DocManager,
    uri: string,
    offset: number,
    currentDef: DefinitionNode,
    context: CompletionContext,
    isXml: boolean
): CompletionItem[] {
    const items: CompletionItem[] = [];
    if (!context.modifierName || context.paramIndex === undefined) return items;

    const modName = context.modifierName.toLowerCase();
    const partial = context.partial.toLowerCase();
    const scopeManager = manager.getScopeManager(uri);
    
    if (modName === 'local') {
        let currentScopeDefType = currentDef.type?.text || '';
        let currentScopeDefName = currentDef.name?.text || '';
        let effectiveScope: Scope | undefined = scopeManager.getScopeAt(uri, offset);
        
        const parts = context.modifierParts || [];
        
        // Dynamic state resolution
        // We evaluate all parts except the very last one (which is the one being typed)
        let expectingDefNameFor: string | undefined = undefined;
        let isAttribute = false;
        let attributeName: string | undefined = undefined;
        let valuePartIndex = -1;
        let previousWasLocal = false;

        const { STRUCTURAL_DEFINITION_TYPES } = require('../../../services/validation/validationUtils');

        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i].trim();
            
            if (expectingDefNameFor) {
                const targetDefName = p;
                // Update effective scope context
                if (effectiveScope && targetDefName) {
                    const dummyScopeId = `${expectingDefNameFor.toLowerCase()}:${targetDefName}`;
                    const exactScope = scopeManager.findDefinitionScope(dummyScopeId);
                    if (exactScope) {
                        effectiveScope = exactScope;
                    }
                }
                currentScopeDefType = expectingDefNameFor;
                currentScopeDefName = targetDefName;
                expectingDefNameFor = undefined;
            } else if (!isAttribute) {
                const pLower = p.toLowerCase();
                if (pLower === 'local') {
                    previousWasLocal = true;
                    continue;
                }

                const currentAttrs = scopeManager.globalScope.attributes.get(normalizeTypeName(currentScopeDefType));
                const isTargetAttribute = currentAttrs && currentAttrs.has(normalizeTypeName(pLower));
                const canonicalDefType = scopeManager.globalScope.interchangeableAttributesMap?.get(pLower) || pLower;
                const isStructuralChild = STRUCTURAL_DEFINITION_TYPES.includes(canonicalDefType);
                let treatAsChainedTarget = false;

                if (scopeManager.globalScope.attributes.has(normalizeTypeName(pLower))) {
                    if (i + 1 < parts.length) {
                        if (previousWasLocal) {
                            treatAsChainedTarget = true;
                        } else if (isTargetAttribute && !isStructuralChild) {
                            treatAsChainedTarget = false;
                        } else if (isTargetAttribute && isStructuralChild) {
                            treatAsChainedTarget = (i + 2 < parts.length - 1);
                        } else {
                            treatAsChainedTarget = true;
                        }
                    }
                }

                previousWasLocal = false;

                if (treatAsChainedTarget) {
                    expectingDefNameFor = pLower;
                } else {
                    // Not a chained target, so it must be the attribute!
                    isAttribute = true;
                    attributeName = p;
                    valuePartIndex = i + 1;
                }
            } else {
                // Already found attribute, we are traversing values
            }
        }

        // Now what are we suggesting?
        if (expectingDefNameFor) {
            const suffix = context.hasTrailingColon ? '' : ' : ';
            // Typing <Definition Name> for expectingDefNameFor
            items.push({
                label: 'Default',
                kind: CompletionItemKind.Keyword,
                detail: 'Wildcard',
                insertText: `Default${suffix}`,
                sortText: '0_default'
            });

            if (effectiveScope) {
                const reachable = scopeManager.getDefinitionsInScope(effectiveScope, expectingDefNameFor);
                for (const sym of reachable) {
                    if (partial === '' || sym.name.toLowerCase().includes(partial)) {
                        items.push({
                            label: sym.name,
                            kind: CompletionItemKind.Class,
                            detail: `Reachable ${expectingDefNameFor}`,
                            insertText: `${sym.name}${suffix}`
                        });
                    }
                }
            }
        } else if (!isAttribute) {
            // Typing either a <Definition Type> OR an <Attribute> for currentScopeDefType
            // 1. Suggest Definition Types
            const defTypes = scopeManager.getDefinitionTypes();
            items.push(...provideDefinitionTypeCompletions(partial, isXml, defTypes, scopeManager, undefined, context.hasTrailingColon));

            // 2. Suggest Attributes for currentScopeDefType
            if (currentScopeDefType) {
                const normalizedDefType = normalizeTypeName(currentScopeDefType);
                const matchingDefAttributes = scopeManager.globalScope.attributes.get(normalizedDefType);

                if (matchingDefAttributes) {
                    for (const [_,attr] of matchingDefAttributes) {
                        const names = [attr.name];
                        if (attr.aliases) names.push(...attr.aliases.split(',').map(a => a.trim()));
                        if (partial === '' || names.some(n => n.toLowerCase().includes(partial))) {
                            const displayAttr = isXml ? attr.name.toUpperCase().replace(/\s+/g, '') : attr.name;
                            items.push({
                                label: displayAttr,
                                kind: CompletionItemKind.Property,
                                detail: `${currentScopeDefType} attribute`,
                                insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr}${context.hasTrailingColon ? '' : ' : '}`,
                                insertTextFormat: isXml ? 2 : undefined,
                                data: { type: 'attribute', defType: currentScopeDefType, name: attr.name },
                                sortText: '2_' + attr.name.toLowerCase(),
                            });
                        }
                    }
                }
            }
        } else if (isAttribute && attributeName) {
            // We are typing the value for the attribute!
            // Delegate to provideAttributeValueCompletions by creating a mock context
            const mockContext: CompletionContext = {
                type: 'attribute_value',
                partial: context.partial,
                hasModifier: false,
                attributeName: attributeName,
                paramIndex: context.paramIndex - valuePartIndex
            };
            const currentScope = effectiveScope || scopeManager.getScopeAt(uri, offset);
            items.push(...provideAttributeValueCompletions(
                scopeManager, 
                currentScopeDefType || currentDef.type.text, 
                mockContext, 
                undefined, // projectScope not easily available here, but mostly used for formulas
                currentScope
            ));
        }
    } else if (['add', 'delete', 'replace'].includes(modName)) {
        if (context.paramIndex === 0) {
            // Suggest attributes of the current definition
            const defTypeName = currentDef.type.text;
            const normalizedDefType = normalizeTypeName(defTypeName);
            const matchingDefAttributes = scopeManager.globalScope.attributes.get(normalizedDefType);

            if (matchingDefAttributes) {
                for (const [_,attr] of matchingDefAttributes) {
                    const names = [attr.name];
                    if (attr.aliases) names.push(...attr.aliases.split(',').map(a => a.trim()));
                    if (partial === '' || names.some(n => n.toLowerCase().includes(partial))) {
                        const displayAttr = isXml ? attr.name.toUpperCase().replace(/\s+/g, '') : attr.name;
                        items.push({
                            label: displayAttr,
                            kind: CompletionItemKind.Property,
                            detail: `${defTypeName} attribute`,
                            insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr}${context.hasTrailingColon ? '' : ' : '}`,
                            insertTextFormat: isXml ? 2 : undefined,
                            data: { type: 'attribute', defType: defTypeName, name: attr.name },
                            sortText: attr.name.toLowerCase(),
                        });
                    }
                }
            }
        } else if (context.paramIndex === 1 && modName === 'add') {
            // Position modifiers for Add
            const positions = ['Before', 'After', 'At Beginning', 'At End'];
            for (const pos of positions) {
                if (partial === '' || pos.toLowerCase().includes(partial)) {
                    items.push({
                        label: pos,
                        kind: CompletionItemKind.Keyword,
                        detail: 'Position modifier',
                        insertText: `${pos} : `,
                        sortText: '0_' + pos.toLowerCase(),
                    });
                }
            }
        }
    } else if (modName === 'use') {
        // Use : <Definition Name>
        if (context.paramIndex === 0) {
            const defTypeName = currentDef.type.text;
            items.push(...getSuggestionsForDefinitionType(defTypeName, context.partial, scopeManager));
        }
    }
    return items;
}
