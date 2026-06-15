import { ExtensionContext, TextDocument, Uri, workspace } from 'vscode';
import { extractVariables, extractVariableTags } from '../templateEngine';
import { fetchActiveCompanies } from '../tallyClient';
import { ResponsePanel } from './responsePanel';

export function getStoredVariables(
    documentUri: Uri,
    varNames: string[],
    context: ExtensionContext
): Map<string, { value: string, isWorkspace: boolean }> {
    const result = new Map<string, { value: string, isWorkspace: boolean }>();
    const fileKeyPrefix = `xmlVars:${documentUri.toString()}:`;
    const workspaceKeyPrefix = `xmlVars:workspace:`;

    for (const name of varNames) {
        let value = context.workspaceState.get<string>(fileKeyPrefix + name);
        if (value !== undefined) {
            result.set(name, { value, isWorkspace: false });
            continue;
        }

        value = context.globalState.get<string>(workspaceKeyPrefix + name);
        if (value !== undefined) {
            result.set(name, { value, isWorkspace: true });
            continue;
        }

        result.set(name, { value: '', isWorkspace: false });
    }
    return result;
}

export async function updatePanelVariables(document: TextDocument, context: ExtensionContext) {
    if (ResponsePanel.currentPanel && document.languageId === 'xml') {
        const text = document.getText();
        const variables = extractVariables(text);
        const variableTags = extractVariableTags(text);
        const storedVars = getStoredVariables(document.uri, variables, context);
        
        const config = workspace.getConfiguration('tallyTDL');
        const port = config.get<number>('tallyPort') || 9000;
        const variableTypes = { ...config.get<Record<string, string>>('variableTypes') || {} };
        
        for (const varName of variables) {
            const tag = variableTags[varName] || varName;
            const normalized = tag.toUpperCase().replace(/[^A-Z0-9]/g, '');
            
            if (normalized.includes('SVCURRENTCOMPANY')) {
                variableTypes[varName] = 'company';
            } else if (normalized.includes('SVFROM') || normalized.includes('SVTO')) {
                variableTypes[varName] = 'date';
            }
        }
        
        let activeCompanies: string[] = [];
        if (Object.values(variableTypes).includes('company')) {
            activeCompanies = await fetchActiveCompanies(port);
        }
        
        ResponsePanel.currentPanel?.updateVariables(variables, storedVars, variableTypes, activeCompanies);
    }
}
