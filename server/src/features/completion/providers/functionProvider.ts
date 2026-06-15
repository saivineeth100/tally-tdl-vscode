import { CompletionItem, CompletionItemKind, MarkupKind } from 'vscode-languageserver/node';
import { TdlMetadata } from '../../../tdlMetaData';

/**
 * Get function suggestions sorted by return type matching expected datatype
 * @param md Metadata
 * @param partial Partial text typed by user
 * @param expectedDatatype Expected return type from parameter definition
 * @returns Array of CompletionItems sorted by relevance
 */
export function getFunctionSuggestions(
    md: TdlMetadata,
    partial: string,
    expectedDatatype?: string
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = partial.toLowerCase();
    const normalizedExpected = expectedDatatype?.toLowerCase().trim();

    // Get matching functions
    for (const func of md.functions) {
        // Filter by partial match
        if (normalizedPartial && !func.Name.toLowerCase().includes(normalizedPartial)) {
            continue;
        }

        // Check if return type matches expected
        const returnTypeMatches = normalizedExpected &&
            func.ReturnType?.toLowerCase().trim() === normalizedExpected;

        // Sort prefix: matching return types come first (0_), others second (1_)
        const sortPrefix = returnTypeMatches ? '0_' : '1_';

        items.push({
            label: `$$${func.Name}`,
            kind: CompletionItemKind.Function,
            detail: func.ReturnType ? `Returns: ${func.ReturnType}${returnTypeMatches ? ' ✓' : ''}` : 'TDL Function',
            insertText: func.TotalParameters > 0 ? `$$${func.Name}($0)` : `$$${func.Name}`,
            insertTextFormat: 2, // Snippet
            data: { type: 'function', name: func.Name },
            sortText: sortPrefix + func.Name.toLowerCase(),
        });
    }

    return items;
}

export function provideFunctionCompletions(md: TdlMetadata, partial: string): CompletionItem[] {
    const items: CompletionItem[] = [];
    for (const func of md.functions) {
        if (func.Name.toLowerCase().includes(partial.toLowerCase())) {
            items.push({
                label: func.Name,
                kind: CompletionItemKind.Function,
                insertText: func.Name,
                documentation: {
                    kind: MarkupKind.Markdown,
                    value: func.Description || ''
                },
            });
        }
    }
    return items;
}
