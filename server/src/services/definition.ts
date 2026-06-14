import { DefinitionNode, SourceFile, AttributeNode, SyntaxKind, IdentifierNode, FunctionCallNode, LiteralNode } from '../parser/ast';
import { ScopeManager } from './scopeManager';

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
const ATTRIBUTE_REFERENCE_MAP: Record<string, string> = {
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
 * Find a definition by name and optionally type
 * @param sourceFile Parsed source file
 * @param name Definition name to find (case-insensitive)
 * @param type Optional definition type to filter by
 * @param skipModifiers If true, skip definitions with modifiers (#, !, *)
 * @returns DefinitionNode if found, undefined otherwise
 */
export function findDefinitionByName(
    sourceFile: SourceFile,
    name: string,
    type?: string,
    skipModifiers: boolean = false
): DefinitionNode | undefined {
    const lowerName = name.toLowerCase().replace(/\s+/g, '');

    for (const def of sourceFile.definitions) {
        // Skip modifier definitions if requested
        if (skipModifiers && def.modifier) {
            continue;
        }

        const defName = def.name?.text?.toLowerCase().replace(/\s+/g, '');
        if (defName === lowerName) {
            // If type specified, check it matches
            if (type) {
                if (def.type.text.toLowerCase() === type.toLowerCase()) {
                    return def;
                }
            } else {
                return def;
            }
        }
    }
    return undefined;
}

/**
 * Find all definitions matching a name across multiple source files
 * @param sourceFiles Array of parsed source files
 * @param name Definition name to find
 * @param type Optional definition type to filter by
 * @returns Array of matching definitions
 */
export function findAllDefinitionsByName(
    sourceFiles: SourceFile[],
    name: string,
    type?: string
): DefinitionNode[] {
    const results: DefinitionNode[] = [];
    for (const sf of sourceFiles) {
        const def = findDefinitionByName(sf, name, type);
        if (def) {
            results.push(def);
        }
    }
    return results;
}

/**
 * Determine if an attribute references a definition
 * @param attrName Attribute name
 * @returns Expected definition type or undefined
 */
function getExpectedTypeForAttribute(attrName: string): string | undefined {
    return ATTRIBUTE_REFERENCE_MAP[attrName.toLowerCase()];
}

/**
 * Find a reference at a given offset in the source file
 * Uses metadata to dynamically resolve RefersTo for attribute parameters
 * @param sourceFile Parsed source file
 * @param offset Character offset
 * @param text Full document text
 * @param metadata Optional TDL metadata for dynamic RefersTo resolution
 * @param uri Document URI
 * @returns ReferenceInfo if a reference is found, undefined otherwise
 */
export function findReferenceAtOffset(
    sourceFile: SourceFile,
    offset: number,
    text: string,
    metadata?: any,
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
                // This is a modifier definition - return reference to find original
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
                            // First check if it's a variable reference (## or #)
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
                                                expectedType: resolved.definitionType,
                                                start: arg.start,
                                                end: arg.end
                                            };
                                        }
                                    }
                                }
                            }

                            // If not a variable, check if it's a definition reference based on action metadata
                            if (metadata && stmt.action) {
                                const actionName = stmt.action.text;
                                const actionDef = metadata.actions.find((a: any) => 
                                    a.Name.toLowerCase() === actionName.toLowerCase() || 
                                    (a.Aliases && a.Aliases.toLowerCase().split(',').map((al: string) => al.trim()).includes(actionName.toLowerCase()))
                                );

                                if (actionDef && actionDef.Parameters && actionDef.Parameters[i]) {
                                    const paramDef = actionDef.Parameters[i];
                                    if (paramDef.RefersTo) {
                                        let name = '';
                                        if (arg.kind === SyntaxKind.List) {
                                            name = (arg as any).values.map((v: any) => v.text || v.value || '').join(' ');
                                        } else if ('text' in arg) {
                                            name = (arg as IdentifierNode).text;
                                        } else if ('value' in arg) {
                                            name = String((arg as any).value);
                                        }

                                        name = name.replace(/^"|"$|^'|'$/g, ''); // strip quotes
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
            // Check if we're in the value portion of the attribute
            if (offset >= attr.colon.Start && offset <= attr.end) {
                let expectedType: string | undefined;
                let paramIndex = -1;

                // Find parameter index and specific value node
                let foundValueNode: any = undefined;

                for (let i = 0; i < attr.value.length; i++) {
                    const val = attr.value[i];

                    // Treat ListNode as a single value (which represents a space-separated identifier)
                    if (offset >= val.start && offset <= val.end) {
                        paramIndex = i;
                        foundValueNode = val;
                        break;
                    }
                }

                if (paramIndex >= 0 && metadata) {
                    // Use metadata to find RefersTo for this parameter
                    const defTypeName = def.type.text;
                    const attrDef = metadata.findDefinition(attr.name.text, defTypeName);

                    if (attrDef && attrDef.Parameters && attrDef.Parameters.length > 0) {
                        // Handle standard parameters
                        let param = attrDef.Parameters[paramIndex];

                        // Handle Variable Arguments / Lists
                        // If index is out of bounds, check if the last parameter is a list/variable arg
                        if (!param) {
                            const lastParam = attrDef.Parameters[attrDef.Parameters.length - 1];
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

                    // Fallback: If metadata didn't provide RefersTo (e.g. no params defined),
                    // use the resolved Canonical Name from metadata to check the hardcoded map.
                    // This handles Aliases (e.g. "Parts" -> "Part")
                    if (!expectedType && attrDef) {
                        expectedType = getExpectedTypeForAttribute(attrDef.Name);
                    }
                }

                // Fallback to hardcoded map using raw name if metadata lookup failed completely
                if (!expectedType) {
                    expectedType = getExpectedTypeForAttribute(attr.name.text);
                }

                // Return reference info if we found a specific value node
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

                    name = name.replace(/^"|"$|^'|'$/g, ''); // strip quotes
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
                                        expectedType: resolved.definitionType,
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
                    if (!expectedType && attr.value.length > 0 && metadata) {
                        const firstVal = attr.value[0];
                        if ('text' in firstVal) {
                            const actionName = (firstVal as IdentifierNode).text;
                            const actionDef = metadata.actions.find((a: any) => 
                                a.Name.toLowerCase() === actionName.toLowerCase() || 
                                (a.Aliases && a.Aliases.toLowerCase().split(',').map((al: string) => al.trim()).includes(actionName.toLowerCase()))
                            );

                            if (actionDef && paramIndex > 0) {
                                const actionParamIndex = paramIndex - 1; // parameters start after action name
                                if (actionDef.Parameters && actionDef.Parameters[actionParamIndex]) {
                                    const paramDef = actionDef.Parameters[actionParamIndex];
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

/**
 * Get the location (start, end) of a definition for jump-to-definition
 * @param def Definition node
 * @returns Object with start and end offsets
 */
export function getDefinitionLocation(def: DefinitionNode): { start: number; end: number } {
    return {
        start: def.openBracket.Start,
        end: def.closeBracket.Start + def.closeBracket.Length
    };
}
