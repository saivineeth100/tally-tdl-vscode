import { CompletionItem, CompletionItemKind, MarkupKind } from 'vscode-languageserver/node';
import { ScopeManager } from '../../../services/scopeManager/index';
import { normalizeTypeName } from '../../../services/utils';

/**
 * Get function suggestions sorted by return type matching expected datatype
 * @param scopeManager ScopeManager
 * @param partial Partial text typed by user
 * @param expectedDatatype Expected return type from parameter definition
 * @returns Array of CompletionItems sorted by relevance
 */
export function getFunctionSuggestions(
    scopeManager: ScopeManager,
    partial: string,
    expectedDatatype?: string
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = partial.toLowerCase();
    const normalizedExpected = expectedDatatype?.toLowerCase().trim();

    const added = new Set<string>();

    // Get matching functions
    for (const [key, func] of scopeManager.globalScope.functions) {
        if (added.has(func.name)) continue;

        // Filter by partial match
        if (normalizedPartial && !func.name.toLowerCase().includes(normalizedPartial)) {
            continue;
        }

        added.add(func.name);

        // Check if return type matches expected
        const returnTypeMatches = normalizedExpected &&
            func.returnType?.toLowerCase().trim() === normalizedExpected;

        // Sort prefix: matching return types come first (0_), others second (1_)
        const sortPrefix = returnTypeMatches ? '0_' : '1_';

        const totalParams = func.parameters ? func.parameters.length : 0;

        items.push({
            label: `$$${func.name}`,
            kind: CompletionItemKind.Function,
            detail: func.returnType ? `Returns: ${func.returnType}${returnTypeMatches ? ' ✓' : ''}` : 'TDL Function',
            insertText: totalParams > 0 ? `$$${func.name}($0)` : `$$${func.name}`,
            insertTextFormat: 2, // Snippet
            data: { type: 'function', name: func.name },
            sortText: sortPrefix + func.name.toLowerCase(),
        });
    }

    return items;
}

export function provideFunctionCompletions(scopeManager: ScopeManager, partial: string): CompletionItem[] {
    const items: CompletionItem[] = [];
    const added = new Set<string>();

    for (const [key, func] of scopeManager.globalScope.functions) {
        if (added.has(func.name)) continue;

        if (func.name.toLowerCase().includes(partial.toLowerCase())) {
            added.add(func.name);
            items.push({
                label: func.name,
                kind: CompletionItemKind.Function,
                insertText: func.name,
                documentation: func.description ? {
                    kind: MarkupKind.Markdown,
                    value: func.description
                } : undefined,
            });
        }
    }
    return items;
}
