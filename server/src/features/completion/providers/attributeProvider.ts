import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { ScopeManager } from '../../../services/scopeManager/index';
import { normalizeTypeName, normalizeXMLTypeName } from '../../../services/utils';
import { getFunctionSuggestions } from './functionProvider';
import { getSuggestionsForDefinitionType } from './definitionProvider';
import { SymbolTable } from '../../../services/symbolTable';
import { CompletionContext } from '../contextAnalyzer';

export function provideAttributeCompletions(
    scopeManager: ScopeManager,
    defTypeName: string,
    partial: string,
    isXml: boolean
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
                    insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr} : `,
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
    symbolTable?: SymbolTable,
    scope?: Set<string>
): CompletionItem[] {
    const items: CompletionItem[] = [];
    if (!context.attributeName || context.paramIndex === undefined) return items;

    // Use scopeManager to resolve attribute 
    // Usually attributes exist globally per definition type, so we can just check globalScope.attributes
    const normalizedDefType = normalizeTypeName(defTypeName);
    const normalizedAttr = normalizeTypeName(context.attributeName);

    const attrMap = scopeManager.globalScope.attributes.get(normalizedDefType);
    if (!attrMap) return items;

    const attrDef = attrMap.get(normalizedAttr);

    if (attrDef && attrDef.parameters && attrDef.parameters.length > context.paramIndex) {
        const param = attrDef.parameters[context.paramIndex];

        // 1. If parameter has Keywords, suggest them
        if (param.Keywords) {
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
            if (normalizeTypeName(param.KeywordSet) === 'tdlactions') {
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
                            sortText: '1_' + action.name.toLowerCase(),
                        });
                    }
                }
            }
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
            if (refersToType) {
                items.push(...getSuggestionsForDefinitionType(refersToType, context.partial, scopeManager, symbolTable, scope));
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
