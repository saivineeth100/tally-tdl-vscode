import { CompletionItem, CompletionItemKind, MarkupKind } from 'vscode-languageserver/node';
import { normalizeTypeName } from '../../../utils/normalizeUtils';
import { ScopeManager } from '../../../semantics/scopeManager';

export function provideXmlSchemaAttributeCompletions(
    scopeManager: ScopeManager,
    tagPath: string[],
    partial: string
): CompletionItem[] {
    const items: CompletionItem[] = [];

    // Find the primary schema tag in the tagPath (searching backwards from current position)
    let rootTagIdx = -1;
    let rootTag = '';
    for (let i = tagPath.length - 1; i >= 0; i--) {
        if (scopeManager.primarySchemaNames.some(s => s.toUpperCase() === tagPath[i].toUpperCase())) {
            rootTagIdx = i;
            rootTag = tagPath[i];
            break;
        }
    }

    if (rootTagIdx !== -1) {
        const rootKey = Array.from(scopeManager.globalScope.schemas.keys()).find(k => k.toUpperCase() === rootTag.toUpperCase());
        let currentSchema = rootKey ? scopeManager.globalScope.schemas.get(rootKey) : undefined;
        
        for (let i = rootTagIdx + 1; i < tagPath.length; i++) {
            const step = tagPath[i];
            const normalizedStep = step.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
            const complexPropKey = Array.from(currentSchema?.complexProperties?.keys() || []).find((k: string) => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedStep);
            if (complexPropKey) {
                const nextSchemaName = currentSchema!.complexProperties!.get(complexPropKey)!;
                const nextKey = Array.from(scopeManager.globalScope.schemas.keys()).find(k => k.toUpperCase().replace(/\s+/g, '') === nextSchemaName.toUpperCase().replace(/\s+/g, ''));
                currentSchema = nextKey ? scopeManager.globalScope.schemas.get(nextKey) : undefined;
            } else {
                currentSchema = undefined;
                break;
            }
        }

        if (currentSchema) {
            const systemAttributes = [
                { name: 'Action', type: 'String', values: ['Create', 'Alter', 'Delete'] },
                { name: 'NAME', type: 'String' }
            ];
            
            if (currentSchema.name.toUpperCase() === 'VOUCHER') {
                systemAttributes.push(
                    { name: 'VCHTYPE', type: 'String' },
                    { name: 'OBJVIEW', type: 'String', values: ['Accounting Voucher View', 'Invoice Voucher View'] }
                );
            }

            for (const sysAttr of systemAttributes) {
                if (partial === '' || sysAttr.name.toLowerCase().includes(partial.toLowerCase())) {
                    items.push({
                        label: sysAttr.name,
                        kind: CompletionItemKind.Property,
                        detail: `System Attribute (${sysAttr.type})`,
                        insertText: `${sysAttr.name}="$1"$0`,
                        insertTextFormat: 2,
                        sortText: '0_' + sysAttr.name.toLowerCase()
                    });
                }
            }

            if (currentSchema.properties) {
                for (const [propName, propDef] of currentSchema.properties) {
                    let displayProp = propName.toUpperCase().replace(/\s+/g, '');
                    let insertText = '';
                    
                    if (propDef.IsComplex) {
                        if (!displayProp.endsWith('.LIST')) {
                            displayProp += '.LIST';
                        }
                        insertText = `${displayProp}>\n\t$0\n</${displayProp}>`;
                    } else if (propDef.IsRepeated) {
                        if (!displayProp.endsWith('.LIST')) {
                            displayProp += '.LIST';
                        }
                        const innerTag = propName.toUpperCase().replace(/\s+/g, '');
                        const cleanType = propDef.DataType ? propDef.DataType.split(' ')[0] : '';
                        const typeAttr = cleanType ? ` TYPE="${cleanType}"` : '';
                        insertText = `${displayProp}${typeAttr}>\n\t<${innerTag}>$0</${innerTag}>\n</${displayProp}>`;
                    } else {
                        insertText = `${displayProp}>$0</${displayProp}>`;
                    }

                    if (partial === '' || displayProp.toLowerCase().includes(partial.toLowerCase()) || propName.toLowerCase().includes(partial.toLowerCase())) {
                        items.push({
                            label: displayProp,
                            kind: CompletionItemKind.Property,
                            detail: `Schema Property (${propDef.DataType || 'String'})`,
                            insertText: insertText,
                            insertTextFormat: 2,
                            documentation: { kind: MarkupKind.Markdown, value: `Type: ${propDef.DataType || 'String'}\nOriginal Name: ${propName}` },
                            sortText: displayProp});
                    }
                }
            }
        }
    }
    
    return items;
}

import { provideAttributeValueCompletions } from './attributeProvider';
import { DefinitionNode } from '../../../core/ast/ast';

export function provideXmlAttributeValueCompletions(
    scopeManager: ScopeManager,
    tagPath: string[],
    attributeName: string,
    partial: string,
    currentDef?: DefinitionNode,
    scope?: Set<string>
): CompletionItem[] | null {
    const items: CompletionItem[] = [];

    let rootTagIdx = -1;
    let rootTag = '';
    for (let i = tagPath.length - 1; i >= 0; i--) {
        if (scopeManager.primarySchemaNames.some(s => s.toUpperCase() === tagPath[i].toUpperCase())) {
            rootTagIdx = i;
            rootTag = tagPath[i];
            break;
        }
    }

    if (rootTagIdx !== -1) {
        const rootKey = Array.from(scopeManager.globalScope.schemas.keys()).find(k => k.toUpperCase() === rootTag.toUpperCase());
        let currentSchema = rootKey ? scopeManager.globalScope.schemas.get(rootKey) : undefined;
        
        for (let i = rootTagIdx + 1; i < tagPath.length - 1; i++) {
            const step = tagPath[i];
            const normalizedStep = step.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
            const complexPropKey = Array.from(currentSchema?.complexProperties?.keys() || []).find((k: string) => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedStep);
            if (complexPropKey) {
                const nextSchemaName = currentSchema!.complexProperties!.get(complexPropKey)!;
                const nextKey = Array.from(scopeManager.globalScope.schemas.keys()).find(k => k.toUpperCase().replace(/\s+/g, '') === nextSchemaName.toUpperCase().replace(/\s+/g, ''));
                currentSchema = nextKey ? scopeManager.globalScope.schemas.get(nextKey) : undefined;
            } else {
                currentSchema = undefined;
                break;
            }
        }

        if (currentSchema) {
            const normalizedAttrName = attributeName.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
            
            if (normalizedAttrName === 'ACTION') {
                const actions = ['Create', 'Alter', 'Delete'];
                for (const action of actions) {
                    if (partial === '' || action.toLowerCase().includes(partial.toLowerCase())) {
                        items.push({
                            label: action,
                            kind: CompletionItemKind.Value,
                            insertText: action,
                            sortText: '0_' + action.toLowerCase()
                        });
                    }
                }
            } else if (normalizedAttrName === 'OBJVIEW' && currentSchema.name.toUpperCase() === 'VOUCHER') {
                const views = ['Accounting Voucher View', 'Invoice Voucher View'];
                for (const view of views) {
                    if (partial === '' || view.toLowerCase().includes(partial.toLowerCase())) {
                        items.push({
                            label: view,
                            kind: CompletionItemKind.Value,
                            insertText: view,
                            sortText: '0_' + view.toLowerCase()
                        });
                    }
                }
            }

            if (currentSchema.properties) {
                const propKey = Array.from(currentSchema.properties.keys()).find((k: string) => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedAttrName);
                if (propKey) {
                    const propDef = currentSchema.properties.get(propKey)!;
                    if (propDef.DataType?.toLowerCase() === 'logical') {
                        const logicalValues = ['Yes', 'No'];
                        for (const val of logicalValues) {
                            if (partial === '' || val.toLowerCase().includes(partial.toLowerCase())) {
                                items.push({
                                    label: val,
                                    kind: CompletionItemKind.Value,
                                    detail: 'Logical value',
                                    insertText: val,
                                    sortText: '0_' + val.toLowerCase()});
                            }
                        }
                    } else {
                        if (currentDef) {
                            items.push(...provideAttributeValueCompletions(scopeManager, currentDef.type.text, {
                                type: 'attribute_value',
                                attributeName: propDef.Name,
                                paramIndex: 0,
                                partial: partial,
                                hasModifier: false
                            }, scope));
                        }
                    }
                }
            }
        }
    }
    
    return rootTagIdx !== -1 ? items : null;
}

export function provideSchemaTypeCompletions(scopeManager: ScopeManager, partial: string): CompletionItem[] {
    const items: CompletionItem[] = [];
    const schemas = scopeManager.primarySchemaNames;
    const normalizedSchemaPartial = normalizeTypeName(partial);
    for (const schema of schemas) {
        if (normalizedSchemaPartial === '' || normalizeTypeName(schema).includes(normalizedSchemaPartial)) {
            const displayType = schema.toUpperCase().replace(/\s+/g, '');
            items.push({
                label: displayType,
                kind: CompletionItemKind.Class,
                detail: 'TDL Schema Type',
                insertText: `${displayType}>\n\t$0\n</${displayType}>`,
                insertTextFormat: 2,
                sortText: schema.toLowerCase()});
        }
    }
    return items;
}
