import { SignatureHelp, Position, SignatureInformation, ParameterInformation } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ScopeManager } from './scopeManager';
import { normalizeTypeName } from './utils';

export function provideSignatureHelp(
    doc: TextDocument, 
    position: Position,
    scopeManager: ScopeManager
): SignatureHelp | null {
    const text = doc.getText();
    const offset = doc.offsetAt(position);
    
    // Look backwards from cursor for $$
    let currentOffset = offset - 1;
    let colonCount = 0;
    let parenCount = 0;
    
    let foundDollar = false;
    let functionNameStr = '';
    
    while (currentOffset >= 0 && offset - currentOffset < 500) {
        const char = text[currentOffset];
        
        // Break on boundaries
        if (char === '\n' || char === '\r' || char === '[' || char === ']') {
            break;
        }
        
        if (char === ')') {
            parenCount++;
        } else if (char === '(') {
            parenCount--;
        }
        
        if (parenCount <= 0) {
            if (char === ':') {
                colonCount++;
            }
            if (char === '$' && currentOffset > 0 && text[currentOffset - 1] === '$') {
                foundDollar = true;
                const startName = currentOffset + 1;
                const partial = text.substring(startName, offset);
                
                // Extract just the function name
                const match = partial.match(/^([a-zA-Z0-9_]+)/);
                if (match) {
                    functionNameStr = match[1];
                }
                break;
            }
        }
        currentOffset--;
    }
    
    if (foundDollar && functionNameStr) {
        const scope = scopeManager.getScopeAt(doc.uri, offset);
        const func = scope ? scopeManager.resolveFunction(functionNameStr, scope) : 
                             scopeManager.globalScope.functions.get(normalizeTypeName(functionNameStr));
        if (func) {
            const parameters: ParameterInformation[] = (func.parameters || []).map(p => ({
                label: p.ParameterType || 'Parameter',
                documentation: p.DataType ? `Data Type: ${p.DataType}` : undefined
            }));
            
            const signature: SignatureInformation = {
                label: `$$${func.name}${func.parameters && func.parameters.length > 0 ? ':' + func.parameters.map(p => p.ParameterType).join(':') : ''}`,
                documentation: func.description,
                parameters: parameters
            };
            
            return {
                signatures: [signature],
                activeSignature: 0,
                activeParameter: Math.min(Math.max(0, colonCount - 1), Math.max(0, parameters.length - 1))
            };
        }
    }
    
    // Look for Actions
    let lineStart = offset - 1;
    while (lineStart >= 0 && text[lineStart] !== '\n' && text[lineStart] !== '\r' && text[lineStart] !== '[') {
        lineStart--;
    }
    lineStart++;
    
    const lineText = text.substring(lineStart, offset);
    
    let parts: string[] = [];
    let currentPart = '';
    let inString = false;
    let stringChar = '';
    for (let i = 0; i < lineText.length; i++) {
        const c = lineText[i];
        if (inString) {
            currentPart += c;
            if (c === stringChar) {
                inString = false;
            }
        } else {
            if (c === '"' || c === "'") {
                inString = true;
                stringChar = c;
                currentPart += c;
            } else if (c === ':') {
                parts.push(currentPart);
                currentPart = '';
            } else {
                currentPart += c;
            }
        }
    }
    parts.push(currentPart);
    
    for (let i = parts.length - 2; i >= 0; i--) {
        const possibleActionName = parts[i].trim();
        const action = scopeManager.globalScope.actions.get(normalizeTypeName(possibleActionName));
        if (action) {
            const parameters: ParameterInformation[] = (action.parameters || []).map(p => ({
                label: p.ParameterType || 'Parameter',
                documentation: p.IsConstant ? `Constant. Type: ${p.ParameterType}` : undefined
            }));
            
            const signature: SignatureInformation = {
                label: `Action: ${action.name}${action.parameters && action.parameters.length > 0 ? ':' + action.parameters.map(p => p.ParameterType).join(':') : ''}`,
                documentation: action.description,
                parameters: parameters
            };
            
            const activeParamIndex = parts.length - 1 - i - 1;
            
            return {
                signatures: [signature],
                activeSignature: 0,
                activeParameter: Math.min(Math.max(0, activeParamIndex), Math.max(0, parameters.length - 1))
            };
        }
    }

    return null;
}
