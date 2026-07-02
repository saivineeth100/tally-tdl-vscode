import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { DocManager } from '../../../docManager';
import { STRUCTURAL_DEFINITION_TYPES } from '../../../validation/validationUtils';
import { Scope } from '../../../semantics/scopeManager';
import { CompletionContext } from '../contextAnalyzer';
import { getDefinitionTypes } from '../utils';
import { getSuggestionsForDefinitionType, provideDefinitionTypeCompletions } from './definitionProvider';
import { provideAttributeValueCompletions } from './attributeProvider';
import { normalizeTypeName } from '../../../utils/normalizeUtils';
import { DefinitionNode, SyntaxKind } from '../../../core/ast/ast';
import { resolveModifierChain } from '../../../utils/modifierUtils';

export function provideModifierValueCompletions(
    manager: DocManager,
    uri: string,
    offset: number,
    currentDef: DefinitionNode,
    context: CompletionContext,
    isXml: boolean,
    isActive: boolean
): CompletionItem[] {
    const items: CompletionItem[] = [];
    if (!context.modifierName || context.paramIndex === undefined) return items;

    const modName = context.modifierName.toLowerCase();
    const partial = context.partial.toLowerCase();
    const scopeManager = manager.getScopeManager(uri);
    
    if (['local', 'add', 'replace', 'delete'].includes(modName)) {
        let currentScopeDefType = currentDef.type?.text || '';
        let currentScopeDefName = currentDef.name?.text || '';
        
        let parts = context.modifierParts || [];
        
        // Dynamic state resolution via centralized utility
        const mockNodes: any[] = parts.map((p, i) => {
            return {
                kind: SyntaxKind.Identifier,
                text: p,
                start: i * 10,
                end: i * 10 + Math.max(1, p.length)
            };
        });
        
        // Ensure the fake cursor offset falls into the last part (the one being typed)
        const fakeOffset = Math.max(0, (mockNodes.length - 1) * 10);
        
        const resolved = resolveModifierChain(modName, mockNodes, currentScopeDefType, currentScopeDefName, scopeManager, fakeOffset);

        let expectingDefNameFor = resolved.cursorSegment === 'defName' ? resolved.effectiveDefType : undefined;
        let isAttribute = resolved.cursorSegment === 'targetAttribute' || resolved.cursorSegment === 'value';
        let attributeName = resolved.targetAttribute?.text;
        
        // Get the effective scope from the resolved chain
        let effectiveScope: Scope | undefined = scopeManager.getScopeAt(uri, offset);
        if (resolved.effectiveDefType && resolved.effectiveDefName) {
            const dummyScopeId = `${resolved.effectiveDefType.toLowerCase()}:${resolved.effectiveDefName}`;
            const exactScope = scopeManager.findDefinitionScope(dummyScopeId);
            if (exactScope) {
                effectiveScope = exactScope;
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
            // Suggest Modifiers and Position Modifiers
            const modifiers = ['Local', 'Add', 'Replace', 'Delete'];
            const suffix = context.hasTrailingColon ? '' : ' : ';
            for (const m of modifiers) {
                if (partial === '' || m.toLowerCase().includes(partial)) {
                    items.push({
                        label: m,
                        kind: CompletionItemKind.Keyword,
                        detail: 'Modifier',
                        insertText: `${m}${suffix}`,
                        sortText: '0_' + m.toLowerCase()
                    });
                }
            }
            const positions = ['Before', 'After', 'At Beginning', 'At End'];
            for (const pos of positions) {
                if (partial === '' || pos.toLowerCase().includes(partial)) {
                    items.push({
                        label: pos,
                        kind: CompletionItemKind.Keyword,
                        detail: 'Position modifier',
                        insertText: `${pos}${suffix}`,
                        sortText: '0_' + pos.toLowerCase()
                    });
                }
            }

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
                        if (attr.aliases) names.push(...attr.aliases.split(',').map((a: string) => a.trim()));
                        if (partial === '' || names.some(n => n.toLowerCase().includes(partial))) {
                            const displayAttr = isXml ? attr.name.toUpperCase().replace(/\s+/g, '') : attr.name;
                            items.push({
                                label: displayAttr,
                                kind: CompletionItemKind.Property,
                                detail: `${currentScopeDefType} attribute`,
                                insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr}${context.hasTrailingColon ? '' : ' : '}`,
                                insertTextFormat: isXml ? 2 : undefined,
                                data: { type: 'attribute', defType: currentScopeDefType, name: attr.name },
                                sortText: '2_' + attr.name.toLowerCase()});
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
                paramIndex: resolved.cursorIndexInValues !== undefined ? resolved.cursorIndexInValues : 0
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
    } else if (modName === 'use') {
        // Use : <Definition Name>
        if (context.paramIndex === 0) {
            const defTypeName = currentDef.type.text;
            items.push(...getSuggestionsForDefinitionType(defTypeName, context.partial, scopeManager, isActive));
        }
    }
    return items;
}
