import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import { DocManager } from '../../../docManager';
import { getSuggestionsForDefinitionType } from './definitionProvider';
import { SymbolTable } from '../../../services/symbolTable';

export function provideVariableCompletions(
    manager: DocManager,
    uri: string,
    offset: number,
    partial: string,
    symbolTable?: SymbolTable
): CompletionItem[] {
    const items: CompletionItem[] = [];
    
    // 1. All reachable variables from scope (Lexical + Structural + Use)
    const scopeManager = manager.getScopeManager(uri);
    const scope = scopeManager.getScopeAt(uri, offset);
    
    if (scope) {
        const reachableVars = scopeManager.getAllVariablesInScope(scope);
        for (const [varName, varInfo] of reachableVars.entries()) {
            if (varInfo.definitionType !== 'Formula' && varInfo.definitionType !== 'System Formula') {
                if (partial === '' || varName.toLowerCase().includes(partial.toLowerCase())) {
                    items.push({
                        label: varInfo.name || varName, // Use original casing if available
                        kind: CompletionItemKind.Variable,
                        detail: `Scoped Variable`,
                        insertText: varInfo.name || varName,
                        sortText: '0_' + varName.toLowerCase()
                    });
                }
            }
        }
    }
    
    // 2. Global definitions
    const projectScope = manager.getProjectNodes(uri);
    items.push(...getSuggestionsForDefinitionType('Variable', partial, scopeManager, symbolTable, projectScope));
    items.push(...getSuggestionsForDefinitionType('System Variable', partial, scopeManager, symbolTable, projectScope));

    return items;
}

export function provideFormulaCompletions(
    manager: DocManager,
    uri: string,
    offset: number,
    partial: string,
    symbolTable?: SymbolTable,
    isLocal: boolean = true
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const scopeMgr = manager.getScopeManager(uri);
    
    if (isLocal) {
        const currentScope = scopeMgr.getScopeAt(uri, offset);
        if (currentScope) {
            // Only fetch formulas defined directly in the current scope chain
            const reachableVars = scopeMgr.getAllFormulasInScope(currentScope, undefined, true);
            for (const [varName, varInfo] of reachableVars.entries()) {
                if (varInfo.definitionType === 'Formula' || varInfo.definitionType === 'System Formula') {
                    if (partial === '' || varName.toLowerCase().includes(partial.toLowerCase())) {
                        items.push({
                            label: varInfo.name || varName, // Use original casing if available
                            kind: CompletionItemKind.Value,
                            detail: `Formula`,
                            insertText: varInfo.name || varName,
                            sortText: '0_' + varName.toLowerCase()
                        });
                    }
                }
            }
        }
    } else {
        // Global formula definitions (for @@)
        // These are stored in projectScope and globalScope directly via [System: Formula] processing
        const addGlobalFormulas = (formulas: Map<string, import('../../../models/symbols').FormulaSymbol>) => {
            for (const [varName, varInfo] of formulas.entries()) {
                if (partial === '' || varName.toLowerCase().includes(partial.toLowerCase())) {
                    items.push({
                        label: varInfo.name || varName,
                        kind: CompletionItemKind.Value,
                        detail: `Global Formula`,
                        insertText: varInfo.name || varName,
                        sortText: '0_' + varName.toLowerCase()
                    });
                }
            }
        };

        if (scopeMgr.projectScope) {
            addGlobalFormulas(scopeMgr.projectScope.formulas);
        }
        if (scopeMgr.globalScope) {
            addGlobalFormulas(scopeMgr.globalScope.formulas);
        }
    }

    return items;
}
