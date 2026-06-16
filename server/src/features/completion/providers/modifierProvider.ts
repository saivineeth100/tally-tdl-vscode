import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { DocManager } from '../../../docManager';
import { TdlMetadata, TDLDefinitionAttribute } from '../../../tdlMetaData';
import { Scope } from '../../../services/scopeManager';
import { CompletionContext } from '../contextAnalyzer';
import { getDefinitionTypes } from '../utils';
import { getSuggestionsForDefinitionType } from './definitionProvider';
import { normalizeTypeName } from '../../../services/utils';
import { DefinitionNode } from '../../../parser/ast';
import { SymbolTable } from '../../../services/symbolTable';

export function provideModifierValueCompletions(
    manager: DocManager,
    uri: string,
    offset: number,
    md: TdlMetadata,
    currentDef: DefinitionNode,
    context: CompletionContext,
    isXml: boolean,
    symbolTable?: SymbolTable
): CompletionItem[] {
    const items: CompletionItem[] = [];
    if (!context.modifierName || context.paramIndex === undefined) return items;

    const modName = context.modifierName.toLowerCase();
    const partial = context.partial.toLowerCase();
    
    if (modName === 'local') {
        let state = 0; // 0: Type, 1: Name, 2: Attribute, 3: Value
        let currentMod = 'local';
        let targetDefType = '';
        let targetDefName = '';
        let effectiveDefType: string | undefined = currentDef.type?.text;
        
        const scopeManager = manager.getScopeManager(uri);
        let effectiveScope: Scope | undefined = scopeManager.getScopeAt(uri, offset);
        
        const parts = context.modifierParts || [];
        let lastAttribute = '';
        
        // Parse all parts except the very last one (which is what we are currently typing)
        for (let i = 0; i < parts.length - 1; i++) {
            const p = parts[i].trim();
            
            if (state === 0) {
                targetDefType = p;
                state = 1;
            } else if (state === 1) {
                targetDefName = p;
                // We resolved a definition. Update effective scope!
                if (effectiveScope && targetDefType && targetDefName) {
                    const exactScope = scopeManager.getScopeById(`${targetDefType}:${targetDefName}`);
                    if (exactScope) {
                        effectiveScope = exactScope;
                        effectiveDefType = targetDefType;
                    }
                }
                state = 2;
            } else if (state === 2) {
                lastAttribute = p;
                const lowerP = p.toLowerCase();
                if (lowerP === 'local') {
                    // It's a nested Local modifier! Reset state!
                    currentMod = lowerP;
                    state = 0;
                } else if (['add', 'delete', 'replace', 'option'].includes(lowerP)) {
                    // It transitioned to Add/Delete/Replace, which takes an Attribute next.
                    currentMod = lowerP;
                    state = 4; // State 4 expects an Attribute for the nested modifier
                } else {
                    state = 3; // We are in value state
                }
            } else if (state === 3) {
                // Value can contain colons.
            } else if (state === 4) {
                // We were expecting an attribute for Add/Delete/Replace
                lastAttribute = p;
                state = 5; // State 5 is value for Add/Delete/Replace
            } else if (state === 5) {
                // Value
            }
        }

        // Now what are we suggesting?
        if (state === 0) {
            // Typing <Definition Type> for Local
            const defTypes = getDefinitionTypes(md);
            const normalizedPartial = normalizeTypeName(partial);

            for (const defType of defTypes) {
                if (normalizedPartial === '' || normalizeTypeName(defType).includes(normalizedPartial)) {
                    items.push({
                        label: defType,
                        kind: CompletionItemKind.Class,
                        detail: 'TDL Definition Type',
                        insertText: `${defType} : `,
                        sortText: defType.toLowerCase(),
                    });
                }
            }
        } else if (state === 1) {
            // Typing <Definition Name> for Local
            if (targetDefType && effectiveScope) {
                const reachable = scopeManager.getReachableChildren(effectiveScope, targetDefType);
                for (const sym of reachable) {
                    if (partial === '' || sym.name.toLowerCase().includes(partial)) {
                        items.push({
                            label: sym.name,
                            kind: CompletionItemKind.Class,
                            detail: `Reachable ${targetDefType}`,
                            insertText: `${sym.name} : `
                        });
                    }
                }
                
                // Fallback to global if nothing found or to complement
                if (reachable.length === 0) {
                    items.push(...getSuggestionsForDefinitionType(targetDefType, context.partial, md, symbolTable));
                }
            }
        } else if (state === 2 || state === 4) {
            // Typing <Attribute> for the effective Definition Type
            if (effectiveDefType) {
              
                let matchingDefAttributes: Map<string, TDLDefinitionAttribute> | undefined = md.getDefinitionsForType(effectiveDefType);

                if (matchingDefAttributes) {
                    for (const [_,attr] of matchingDefAttributes) {
                        const names = [attr.Name];
                        if (attr.Aliases) names.push(...attr.Aliases.split(',').map(a => a.trim()));
                        if (partial === '' || names.some(n => n.toLowerCase().includes(partial))) {
                            const displayAttr = isXml ? attr.Name.toUpperCase().replace(/\s+/g, '') : attr.Name;
                            items.push({
                                label: displayAttr,
                                kind: CompletionItemKind.Property,
                                detail: `${effectiveDefType} attribute`,
                                insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr} : `,
                                insertTextFormat: isXml ? 2 : undefined,
                                data: { type: 'attribute', defType: effectiveDefType, name: attr.Name },
                                sortText: attr.Name.toLowerCase(),
                            });
                        }
                    }
                }
            }
        }
    } else if (['add', 'delete', 'replace'].includes(modName)) {
        if (context.paramIndex === 0) {
            // Suggest attributes of the current definition
            const defTypeName = currentDef.type.text;
           
            let matchingDefAttributes: Map<string, TDLDefinitionAttribute> | undefined = md.getDefinitionsForType(defTypeName);

            if (matchingDefAttributes) {
                for (const [_,attr] of matchingDefAttributes) {
                    const names = [attr.Name];
                    if (attr.Aliases) names.push(...attr.Aliases.split(',').map(a => a.trim()));
                    if (partial === '' || names.some(n => n.toLowerCase().includes(partial))) {
                        const displayAttr = isXml ? attr.Name.toUpperCase().replace(/\s+/g, '') : attr.Name;
                        items.push({
                            label: displayAttr,
                            kind: CompletionItemKind.Property,
                            detail: `${defTypeName} attribute`,
                            insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr} : `,
                            insertTextFormat: isXml ? 2 : undefined,
                            data: { type: 'attribute', defType: defTypeName, name: attr.Name },
                            sortText: attr.Name.toLowerCase(),
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
            items.push(...getSuggestionsForDefinitionType(defTypeName, context.partial, md, symbolTable));
        }
    }
    return items;
}
