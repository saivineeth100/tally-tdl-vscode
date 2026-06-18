import { SourceFile, SyntaxKind, IdentifierNode, LiteralNode } from '../../parser/ast';
import { ScopeManager } from '../scopeManager';
import { normalizeTypeName } from '../utils';

/**
 * Information about a reference to a definition
 */
export interface ReferenceInfo {
    /** Name being referenced */
    name: string;
    /** Expected type of the referenced definition */
    expectedType: string;
    /** Start offset of the reference */
    start: number;
    /** End offset of the reference */
    end: number;
}

/**
 * Map of attribute names to the type of definition they reference
 */
export const ATTRIBUTE_REFERENCE_MAP: Record<string, string> = {
    'form': 'Form',
    'forms': 'Form',
    'part': 'Part',
    'parts': 'Part',
    'line': 'Line',
    'lines': 'Line',
    'field': 'Field',
    'fields': 'Field',
    'menu': 'Menu',
    'menus': 'Menu',
    'collection': 'Collection',
    'collections': 'Collection',
    'report': 'Report',
    'reports': 'Report',
    'use': 'Report',      // [Report: X] Use: OtherReport
    'button': 'Button',
    'buttons': 'Button',
    'key': 'Key',
    'keys': 'Key',
    'border': 'Border',
    'borders': 'Border',
    'style': 'Style',
    'styles': 'Style',
    'color': 'Color',
    'colors': 'Color',
    'object': 'Object',
    'objects': 'Object'
};

/**
 * Determine if an attribute references a definition
 * @param attrName Attribute name
 * @returns Expected definition type or undefined
 */
export function getExpectedTypeForAttribute(attrName: string): string | undefined {
    return ATTRIBUTE_REFERENCE_MAP[attrName.toLowerCase()];
}

/**
 * Find a reference at a given offset in the source file
 * Uses ScopeManager to dynamically resolve RefersTo for attribute parameters
 * @param sourceFile Parsed source file
 * @param offset Character offset
 * @param text Full document text
 * @param scopeManager Scope manager for variable resolution and metadata access
 * @param uri Document URI
 * @returns ReferenceInfo if a reference is found, undefined otherwise
 */
export function findReferenceAtOffset(
    sourceFile: SourceFile,
    offset: number,
    text: string,
    scopeManager?: ScopeManager,
    uri?: string
): ReferenceInfo | undefined {
    // Find which definition we're in
    for (const def of sourceFile.definitions) {
        // Check if cursor is on the definition name of a modifier definition (#, !, *)
        if (def.modifier && def.name) {
            const nameStart = def.name.start;
            const nameEnd = def.name.end;

            if (offset >= nameStart && offset <= nameEnd) {
                return {
                    name: def.name.text,
                    expectedType: def.type.text,
                    start: nameStart,
                    end: nameEnd
                };
            }
        }
        
        // Also check if we are on an argument in statements (blocks)
        if (uri && def.statements) {
            for (const stmt of def.statements) {
                if (offset >= stmt.start && offset <= stmt.end) {
                    for (let i = 0; i < stmt.args.length; i++) {
                        const arg = stmt.args[i];
                        if (offset >= arg.start && offset <= arg.end) {
                            if (arg.kind === SyntaxKind.Identifier) {
                                const foundText = (arg as IdentifierNode).text;
                                if ((foundText.startsWith('##') || foundText.startsWith('#')) && scopeManager) {
                                    const varName = foundText.replace(/^##?/, '');
                                    const scope = scopeManager.getScopeAt(uri, offset);
                                    if (scope) {
                                        const resolved = scopeManager.resolve(varName, scope);
                                        if (resolved) {
                                            return {
                                                name: varName,
                                                expectedType: resolved.definitionType || 'Variable',
                                                start: arg.start,
                                                end: arg.end
                                            };
                                        }
                                    }
                                }
                            }

                            if (scopeManager && stmt.action) {
                                const actionName = stmt.action.text;
                                const actionDef = Array.from(scopeManager.globalScope.actions.values()).find(a => 
                                    a.name.toLowerCase() === actionName.toLowerCase() || 
                                    (a.aliases && a.aliases.toLowerCase().split(',').map((al: string) => al.trim()).includes(actionName.toLowerCase()))
                                );

                                if (actionDef && actionDef.parameters && actionDef.parameters[i]) {
                                    const paramDef = actionDef.parameters[i];
                                    if (paramDef.RefersTo) {
                                        let name = '';
                                        if (arg.kind === SyntaxKind.List) {
                                            name = (arg as any).values.map((v: any) => v.text || v.value || '').join(' ');
                                        } else if ('text' in arg) {
                                            name = (arg as IdentifierNode).text;
                                        } else if ('value' in arg) {
                                            name = String((arg as any).value);
                                        }

                                        name = name.replace(/^"|"$|^'|'$/g, '');
                                        if (name) {
                                            return {
                                                name,
                                                expectedType: paramDef.RefersTo.trim(),
                                                start: arg.start,
                                                end: arg.end
                                            };
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Check attribute value references
        for (const attr of def.attributes) {
            if (offset >= attr.colon.Start && offset <= attr.end) {
                let expectedType: string | undefined;
                let paramIndex = -1;
                let foundValueNode: any = undefined;

                for (let i = 0; i < attr.value.length; i++) {
                    const val = attr.value[i];
                    if (offset >= val.start && offset <= val.end) {
                        paramIndex = i;
                        foundValueNode = val;
                        break;
                    }
                }

                if (paramIndex >= 0 && scopeManager) {
                    const defTypeName = normalizeTypeName(def.type.text);
                    const attrMap = scopeManager.globalScope.attributes.get(defTypeName);
                    
                    let attrDef;
                    if (attrMap) {
                         attrDef = attrMap.get(normalizeTypeName(attr.name.text));
                    }

                    if (attrDef && attrDef.parameters && attrDef.parameters.length > 0) {
                        let param = attrDef.parameters[paramIndex];
                        if (!param) {
                            const lastParam = attrDef.parameters[attrDef.parameters.length - 1];
                            if (lastParam.IsList || lastParam.IsVariableArgument) {
                                param = lastParam;
                            }
                        }

                        if (param) {
                            const refersTo = param.RefersTo;
                            if (refersTo) {
                                expectedType = refersTo.trim();
                            }
                        }
                    }

                    if (!expectedType && attrDef) {
                        expectedType = getExpectedTypeForAttribute(attrDef.name);
                    }
                }

                if (!expectedType) {
                    expectedType = getExpectedTypeForAttribute(attr.name.text);
                }

                if (foundValueNode) {
                    let name: string = '';
                    if (foundValueNode.kind === SyntaxKind.List) {
                        name = (foundValueNode as any).values.map((v: any) => v.text || v.value || '').join(' ');
                    } else if (foundValueNode.kind === SyntaxKind.VariableReference) {
                        name = '##' + (foundValueNode as any).variableName.text;
                    } else if ('text' in foundValueNode) {
                        name = (foundValueNode as IdentifierNode).text;
                    } else if ('value' in foundValueNode) {
                        name = String((foundValueNode as LiteralNode).value);
                    }

                    name = name.replace(/^"|"$|^'|'$/g, '');
                    if (!name) continue;

                    if (name.startsWith('##') || name.startsWith('#')) {
                        if (scopeManager && uri) {
                            const varName = name.replace(/^##?/, '');
                            const scope = scopeManager.getScopeAt(uri, offset);
                            if (scope) {
                                const resolved = scopeManager.resolve(varName, scope);
                                if (resolved) {
                                    return {
                                        name: varName,
                                        expectedType: resolved.definitionType || 'Variable',
                                        start: foundValueNode.start,
                                        end: foundValueNode.end
                                    };
                                }
                            }
                        }
                    }

                    if (expectedType) {
                        return {
                            name,
                            expectedType,
                            start: foundValueNode.start,
                            end: foundValueNode.end
                        };
                    }

                    // Fallback: Check if it's an action argument (e.g. 01: Alter: Part: My Part Name)
                    if (!expectedType && attr.value.length > 0 && scopeManager) {
                        const firstVal = attr.value[0];
                        if ('text' in firstVal) {
                            const actionName = (firstVal as IdentifierNode).text;
                            const actionDef = Array.from(scopeManager.globalScope.actions.values()).find(a => 
                                a.name.toLowerCase() === actionName.toLowerCase() || 
                                (a.aliases && a.aliases.toLowerCase().split(',').map((al: string) => al.trim()).includes(actionName.toLowerCase()))
                            );

                            if (actionDef && paramIndex > 0) {
                                const actionParamIndex = paramIndex - 1; // parameters start after action name
                                if (actionDef.parameters && actionDef.parameters[actionParamIndex]) {
                                    const paramDef = actionDef.parameters[actionParamIndex];
                                    if (paramDef.RefersTo) {
                                        return {
                                            name,
                                            expectedType: paramDef.RefersTo.trim(),
                                            start: foundValueNode.start,
                                            end: foundValueNode.end
                                        };
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Check if we are on an Include definition
    for (const def of sourceFile.definitions) {
        if (def.type.text.trim().toLowerCase() === 'include' || def.type.text.trim().toLowerCase() === 'import') {
            if (def.name && offset >= def.name.start && offset <= def.name.end) {
                let name = def.name.text;
                name = name.replace(/^"|"$|^'|'$/g, ''); // strip quotes
                return {
                    name,
                    expectedType: 'File',
                    start: def.name.start,
                    end: def.name.end
                };
            }
        }
    }

    return undefined;
}
