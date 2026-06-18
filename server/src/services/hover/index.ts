import { SourceFile, SyntaxKind, IdentifierNode, FunctionCallNode } from '../../parser/ast';
import { ScopeManager } from '../scopeManager';
import { findFunctionCallAtOffset } from './astResolver';
import { getDefinitionAtOffset } from '../definition';
import { 
    createHoverContent, 
    createAttributeHover, 
    createParameterHover, 
    createFunctionHover
} from './formatters';

export interface HoverResult {
    type: 'definition' | 'attribute' | 'parameter' | 'function' | 'function_parameter';
    content: string;
}

export * from './formatters';
export * from './astResolver';

/**
 * Get comprehensive hover information based on cursor position
 * Uses AST-based detection for all hover types including functions
 * @param sourceFile Parsed source file
 * @param offset Cursor offset
 * @param scopeManager Scope manager for variable resolution
 * @param uri Document URI
 * @param projectScope Optional set of URIs in project
 * @returns HoverResult with type and content
 */
export function getHoverInfo(
    sourceFile: SourceFile,
    offset: number,
    scopeManager?: ScopeManager,
    uri?: string,
    projectScope?: Set<string>
): HoverResult | null {
    // Check for variables/fields anywhere at this offset
    if (scopeManager && uri) {
        const scope = scopeManager.getScopeAt(uri, offset);
        if (scope) {
            // Traverse AST to find identifier at offset
            let foundIdent: IdentifierNode | null = null;
            let foundText = '';
            
            // A simple traversal of definitions and attributes to find the node at offset
            for (const def of sourceFile.definitions) {
                if (offset >= def.start && offset <= def.end) {
                    for (const attr of def.attributes) {
                        if (offset >= attr.start && offset <= attr.end) {
                            for (const val of attr.value) {
                                if (val.kind === SyntaxKind.Identifier && offset >= val.start && offset <= val.end) {
                                    foundIdent = val as IdentifierNode;
                                    foundText = foundIdent.text;
                                } else if (val.kind === SyntaxKind.FunctionCall) {
                                    const fn = val as FunctionCallNode;
                                    for (const arg of fn.arguments) {
                                        if (arg.kind === SyntaxKind.Identifier && offset >= arg.start && offset <= arg.end) {
                                            foundIdent = arg as IdentifierNode;
                                            foundText = foundIdent.text;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (def.statements) {
                        for (const stmt of def.statements) {
                            if (offset >= stmt.start && offset <= stmt.end) {
                                for (const arg of stmt.args) {
                                    if (arg.kind === SyntaxKind.Identifier && offset >= arg.start && offset <= arg.end) {
                                        foundIdent = arg as IdentifierNode;
                                        foundText = foundIdent.text;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (foundText.startsWith('##') || foundText.startsWith('#')) {
                const varName = foundText.replace(/^##?/, '');
                const resolved = scopeManager.resolveVariable(varName, scope, projectScope);
                if (resolved) {
                    return {
                        type: 'attribute', // legacy type naming
                        content: `**${foundText}**\n\n*Type: ${resolved.definitionType}*\n*Scope: ${resolved.uri === uri ? 'Local' : 'Project/Global'}*\n*Source: ${resolved.uri}*`
                    };
                } else {
                    return {
                        type: 'attribute',
                        content: `**${foundText}**\n\n*Unknown variable/field*`
                    };
                }
            }
        }
    }

    // Find definition at offset
    const def = getDefinitionAtOffset(sourceFile, offset);
    if (!def) {
        return null;
    }

    // Check for function calls first using AST
    if (scopeManager && uri) {
        const scope = scopeManager.getScopeAt(uri, offset);
        if (scope) {
            const funcInfo = findFunctionCallAtOffset(def, offset);
            if (funcInfo) {
                const funcName = funcInfo.funcNode.functionName?.text;
                if (funcName) {
                    // Strip the $$ prefix before resolving
                    const cleanFuncName = funcName.replace(/^\$\$/, '');
                    const func = scopeManager.resolveFunction(cleanFuncName, scope, projectScope);
                    if (func) {
                        // On function name - show function hover
                        if (funcInfo.onFuncName) {
                            return {
                                type: 'function',
                                content: createFunctionHover(func)
                            };
                        }
                        // On function parameter - show parameter hover
                        if (funcInfo.paramIndex >= 0 && func.parameters) {
                            const paramDef = func.parameters[funcInfo.paramIndex] || (func.parameters.length > 0 ? func.parameters[func.parameters.length - 1] : undefined);

                            if (paramDef) {
                                return {
                                    type: 'function_parameter',
                                    content: createParameterHover(paramDef, funcInfo.paramIndex)
                                };
                            }
                        }
                    }
                }
            }
        }
    }

    // Logic: if offset is before body starts?
    if (def.openBracket && offset >= def.openBracket.Start && offset <= (def.closeBracket.Start + def.closeBracket.Length)) {
        if (offset <= (def.closeBracket.Start + def.closeBracket.Length)) {
            return {
                type: 'definition',
                content: createHoverContent(def, scopeManager, uri)
            };
        }
    }

    // Check attributes
    if (scopeManager && uri) {
        const scope = scopeManager.getScopeAt(uri, offset);
        if (scope) {
            for (const attr of def.attributes) {
                if (offset >= attr.start && offset <= attr.end) {
                    // Check if on attribute name (before colon)
                    if (offset < attr.colon.Start) {
                        // On attribute name - show attribute info
                        const attrDef = scopeManager.resolveAttribute(attr.name.text, def.type.text, scope, projectScope);
                        if (attrDef) {
                            return {
                                type: 'attribute',
                                content: createAttributeHover(attrDef)
                            };
                        }
                        // Fallback if not found
                        return {
                            type: 'attribute',
                            content: `**${attr.name.text}**\n\nTDL attribute`
                        };
                    }

                    // Check if on a parameter value (Attribute Parameter)
                    for (let i = 0; i < attr.value.length; i++) {
                        const value = attr.value[i];
                        if (offset >= value.start && offset <= value.end) {
                            // On parameter value - show parameter info
                            const attrDef = scopeManager.resolveAttribute(attr.name.text, def.type.text, scope, projectScope);
                            if (attrDef && attrDef.parameters && attrDef.parameters[i]) {
                                const paramDef = attrDef.parameters[i];
                                return {
                                    type: 'parameter',
                                    content: createParameterHover(paramDef, i)
                                };
                            }
                        }
                    }
                }
            }
        }
    }

    // Provide default fallback if we are in a definition but not on a specific element
    return null;
}
