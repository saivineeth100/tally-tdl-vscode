import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { TdlMetadata } from '../../../tdlMetaData';
import { SymbolTable, definitionTypeToSymbolKind } from '../../../services/symbolTable';
import { normalizeTypeName } from '../../../services/utils';

/**
 * Get suggestions for a specific definition type
 */
export function getSuggestionsForDefinitionType(
    defType: string,
    partial: string,
    md: TdlMetadata,
    symbolTable?: SymbolTable
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = normalizeTypeName(partial);

    // Button and Key are used interchangeably in TDL
    const typesToSearch = [defType];
    const lowerDefType = defType.toLowerCase();
    if (lowerDefType === 'button') typesToSearch.push('Key');
    if (lowerDefType === 'key') typesToSearch.push('Button');

    // Keep track of added names to avoid duplicates if they exist in both
    const addedNames = new Set<string>();

    for (const type of typesToSearch) {
        // 1. Check Symbol Table (user code)
        if (symbolTable) {
            const kind = definitionTypeToSymbolKind(type);
            const existingNames = symbolTable.getNamesByKind(kind);

            for (const name of existingNames) {
                if (normalizedPartial === '' || normalizeTypeName(name).includes(normalizedPartial)) {
                    if (!addedNames.has(name.toLowerCase())) {
                        addedNames.add(name.toLowerCase());
                        items.push({
                            label: name,
                            kind: CompletionItemKind.Reference,
                            detail: `Existing ${type} definition`,
                            insertText: name,
                            sortText: '0_' + name.toLowerCase(), // Prioritize user symbols
                        });
                    }
                }
            }
        }

        // 2. Check ExistingDefinitions (default TDL)
        const defaultNames = md.existingDefinitions.get(normalizeTypeName(type));
        if (defaultNames) {
            for (const name of defaultNames) {
                if (normalizedPartial === '' || normalizeTypeName(name).includes(normalizedPartial)) {
                    if (!addedNames.has(name.toLowerCase())) {
                        addedNames.add(name.toLowerCase());
                        items.push({
                            label: name,
                            kind: CompletionItemKind.Reference,
                            detail: `Default TDL ${type}`,
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

export function provideDefinitionTypeCompletions(md: TdlMetadata, partial: string, isXml: boolean, defTypes: string[]): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = normalizeTypeName(partial);

    for (const defType of defTypes) {
        if (normalizedPartial === '' || normalizeTypeName(defType).includes(normalizedPartial)) {
            const displayType = isXml ? defType.toUpperCase().replace(/\s+/g, '') : defType;
            items.push({
                label: displayType,
                kind: CompletionItemKind.Class,
                detail: 'TDL Definition Type',
                insertText: isXml ? `${displayType} NAME="$1">\n\t$0\n</${displayType}>` : `${displayType} : `,
                insertTextFormat: isXml ? 2 : undefined,
                sortText: defType.toLowerCase(),
            });
        }
    }
    return items;
}
