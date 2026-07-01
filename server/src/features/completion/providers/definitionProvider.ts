import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { normalizeTypeName } from '../../../utils/normalizeUtils';
import { ScopeManager } from '../../../semantics/scopeManager';


/**
 * Get suggestions for a specific definition type
 */
export function getSuggestionsForDefinitionType(
    defType: string,
    partial: string,
    scopeManager: ScopeManager,
    isActive: boolean,
    scope?: Set<string>,
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = normalizeTypeName(partial);

    const canonicalType = scopeManager.getCanonicalTypeName(normalizeTypeName(defType));

    // Keep track of added names to avoid duplicates if they exist in both
    const addedNames = new Set<string>();

    // 1. Check workspace symbols using ScopeManager
    const tableSymbols = scopeManager.searchWorkspaceSymbols(partial, canonicalType, 1000, scope);
    for (const sym of tableSymbols) {
        const lowerName = sym.name.toLowerCase();
        if (!addedNames.has(lowerName)) {
            addedNames.add(lowerName);
            items.push({
                label: sym.name,
                kind: CompletionItemKind.Reference,
                detail: `Workspace ${defType}`,
                insertText: sym.name,
                sortText: '0_' + lowerName});
        }
    }

    // 2. Check Global definitions
    const globalSymbols = scopeManager.getGlobalDefinitionsByType(canonicalType, isActive);
    for (const sym of globalSymbols) {
        const originalName = sym.name;
        const lowerName = originalName.toLowerCase();
        
        if (normalizedPartial === '' || lowerName.includes(normalizedPartial)) {
            if (!addedNames.has(lowerName)) {
                addedNames.add(lowerName);
                items.push({
                    label: originalName,
                    kind: CompletionItemKind.Reference,
                    detail: `Workspace / Base TDL ${defType}`,
                    insertText: originalName,
                    sortText: '0_' + lowerName, // Standard priority
                });
            }
        }
    }

    return items;
}

export function provideDefinitionTypeCompletions(partial: string, isXml: boolean, defTypes: string[], scopeManager: ScopeManager, directiveName?: string, hasTrailingColon?: boolean): CompletionItem[] {
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
            const insertSuffix = isDeftype || hasTrailingColon ? '' : ': ';
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
