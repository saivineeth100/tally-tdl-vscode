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
    symbolTable?: SymbolTable
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const scopeMgr = manager.getScopeManager(uri);
    const currentScope = scopeMgr.getScopeAt(uri, offset);
    
    if (currentScope) {
        const reachableVars = scopeMgr.getAllVariablesInScope(currentScope);
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
    
    // 2. Global formula definitions
    const projectScope = manager.getProjectNodes(uri);
    items.push(...getSuggestionsForDefinitionType('Formula', partial, scopeMgr, symbolTable, projectScope));
    items.push(...getSuggestionsForDefinitionType('Formulae', partial, scopeMgr, symbolTable, projectScope));
    items.push(...getSuggestionsForDefinitionType('Formulas', partial, scopeMgr, symbolTable, projectScope));
    items.push(...getSuggestionsForDefinitionType('System Formula', partial, scopeMgr, symbolTable, projectScope));
    items.push(...getSuggestionsForDefinitionType('System Formulae', partial, scopeMgr, symbolTable, projectScope));
    items.push(...getSuggestionsForDefinitionType('System Formulas', partial, scopeMgr, symbolTable, projectScope));

    return items;
}
