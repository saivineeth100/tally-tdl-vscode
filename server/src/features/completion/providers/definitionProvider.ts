import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { SymbolTable, definitionTypeToSymbolKind } from '../../../services/symbolTable';
import { normalizeTypeName, getInterchangeableTypes } from '../../../services/utils';
import { ScopeManager } from '../../../services/scopeManager';

/**
 * Get suggestions for a specific definition type
 */
export function getSuggestionsForDefinitionType(
    defType: string,
    partial: string,
    scopeManager: ScopeManager,
    symbolTable?: SymbolTable,
    scope?: Set<string>
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = normalizeTypeName(partial);

    const typesToSearch = getInterchangeableTypes(normalizeTypeName(defType));

    // Keep track of added names to avoid duplicates if they exist in both
    const addedNames = new Set<string>();

    for (const type of typesToSearch) {
        // 1. Check Symbol Table (user code)
        if (symbolTable) {
            const kind = definitionTypeToSymbolKind(type);
            const existingNames = symbolTable.getNamesByKind(kind, scope);

            for (const name of existingNames) {
                if (normalizedPartial === '' || normalizeTypeName(name).includes(normalizedPartial)) {
                    if (!addedNames.has(name.toLowerCase())) {
                        addedNames.add(name.toLowerCase());
                        items.push({
                            label: name,
                            kind: CompletionItemKind.Reference,
                            detail: `Existing ${defType} definition`,
                            insertText: name,
                            sortText: '0_' + name.toLowerCase(), // Prioritize user symbols
                        });
                    }
                }
            }
        }

        // 2. Check ExistingDefinitions (default TDL)
        const defaultNames = scopeManager.existingDefinitions.get(normalizeTypeName(type));
        if (defaultNames) {
            for (const name of defaultNames) {
                if (normalizedPartial === '' || normalizeTypeName(name).includes(normalizedPartial)) {
                    if (!addedNames.has(name.toLowerCase())) {
                        addedNames.add(name.toLowerCase());
                        items.push({
                            label: name,
                            kind: CompletionItemKind.Reference,
                            detail: `Default TDL ${defType}`,
                            insertText: name,
                            sortText: '1_' + name.toLowerCase(), // Lower priority than user symbols
                        });
                    }
                }
            }
        }
    }

    return items;
}

export function provideDefinitionTypeCompletions(partial: string, isXml: boolean, defTypes: string[], scopeManager: ScopeManager, directiveName?: string): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = normalizeTypeName(partial);

    for (const defType of defTypes) {
        if (normalizedPartial === '' || normalizeTypeName(defType).includes(normalizedPartial)) {
            let formattedType = scopeManager.definitionTypeLabels?.get(defType) || defType;
            if (formattedType === defType) {
                // Fallback to title case
                formattedType = defType.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }
            const displayType = isXml ? formattedType.toUpperCase().replace(/\s+/g, '') : formattedType;
            
            const isDeftype = directiveName === 'deftype';
            const insertSuffix = isDeftype ? '' : ': ';
            const insertText = isXml ? `${displayType} NAME="$1">\n\t$0\n</${displayType}>` : `${displayType}${insertSuffix}`;
            
            // Only trigger auto-suggest if we appended a colon
            const command = (!isXml && !isDeftype) ? { title: 'Suggest', command: 'editor.action.triggerSuggest' } : undefined;

            items.push({
                label: displayType,
                kind: CompletionItemKind.Class,
                detail: 'TDL Definition Type',
                insertText,
                insertTextFormat: isXml ? 2 : undefined,
                sortText: defType.toLowerCase(),
                command
            });
        }
    }
    return items;
}
