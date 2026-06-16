import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { TdlMetadata, TDLDefinitionAttribute } from '../../../tdlMetaData';
import { normalizeTypeName, normalizeXMLTypeName } from '../../../services/utils';
import { getFunctionSuggestions } from './functionProvider';
import { getSuggestionsForDefinitionType } from './definitionProvider';
import { SymbolTable } from '../../../services/symbolTable';
import { CompletionContext } from '../contextAnalyzer';

export function provideAttributeCompletions(
    md: TdlMetadata,
    defTypeName: string,
    partial: string,
    isXml: boolean
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedDefType = normalizeTypeName(defTypeName);

    let matchingDefAttributes: Map<string, TDLDefinitionAttribute> | undefined = md.getDefinitionsForType(defTypeName);

    if (matchingDefAttributes) {
        const lowerPartial = normalizeTypeName(partial);
        const addedAttrs = new Set<string>();
        
        for (const [key, attr] of matchingDefAttributes) {
            if (addedAttrs.has(attr.Name)) continue;
            
            const nameMatches = lowerPartial === '' || key.includes(lowerPartial);

            if (nameMatches) {
                addedAttrs.add(attr.Name);
                const displayAttr = isXml ? normalizeXMLTypeName(attr.Name) : attr.Name;
                items.push({
                    label: displayAttr,
                    kind: CompletionItemKind.Property,
                    detail: `${defTypeName} attribute`,
                    insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr} : `,
                    insertTextFormat: isXml ? 2 : undefined,
                    data: { type: 'attribute', defType: defTypeName, name: attr.Name },
                    sortText: '1_' + attr.Name.toLowerCase(),
                });
            }
        }
    }
    return items;
}

export function provideAttributeValueCompletions(
    md: TdlMetadata,
    defTypeName: string,
    context: CompletionContext,
    symbolTable?: SymbolTable
): CompletionItem[] {
    const items: CompletionItem[] = [];
    if (!context.attributeName || context.paramIndex === undefined) return items;

    const attrDef = md.findDefinitionAttribute(context.attributeName, defTypeName)

    if (attrDef && attrDef.Parameters && attrDef.Parameters.length > context.paramIndex) {
        const param = attrDef.Parameters[context.paramIndex];

        // 1. If parameter has Keywords, suggest them
        if (param.Keywords) {
            const keywords = param.Keywords.split(',').map(k => k.trim());
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
        }
        // 2. If Datatype is Logical, suggest Yes/No
        else if (param.DataType?.toLowerCase() === 'logical') {
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
            items.push(...getSuggestionsForDefinitionType(refersToType, context.partial, md, symbolTable));
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
            items.push(...getFunctionSuggestions(md, funcPartial, expectedType));
        }
    }

    return items;
}
