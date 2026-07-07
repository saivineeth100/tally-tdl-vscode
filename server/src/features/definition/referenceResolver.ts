import { SourceFile, SyntaxKind, IdentifierNode, LiteralNode } from '../../core/ast/ast';
import { ScopeManager } from '../../semantics/scopeManager';
import { getExpectedTypeForMenuItem } from '../../utils/attributeUtils';
import { normalizeTypeName } from '../../utils/normalizeUtils';
import { findDefinitionAtOffset, findAttributeAtOffset, findStatementAtOffset, findNodeAtOffset } from '../../core/ast/astQuery';
import { DefinitionSymbol } from 'tally-tdl-shared';
import { resolveModifierChain } from '../../utils/modifierUtils';


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
    /** True if this reference is actually the name of a modifier definition (e.g. #Part: Name) */
    isModifier?: boolean;
}

/**
 * Filters and combines base definitions and modifiers based on the navigation context.
 */
export function filterDefinitionLocations(
    baseDefinitions: DefinitionSymbol[],
    modifiers: DefinitionSymbol[],
    isFromModifier: boolean
): DefinitionSymbol[] {
    let result = [...baseDefinitions];

    if (isFromModifier) {
        // The user clicked on the modifier itself (e.g. [#Part: BasePart])
        // They want to go to the base definition! We DO NOT add the modifiers to result.
        // This allows them to jump straight to the base definition (or Virtual Document).
    } else {
        // The user clicked a normal usage.
        // If they have local modifiers, they want to go to THEIR local modifiers.
        if (modifiers.length > 0) {
            // Exclude Base TDL definitions so it jumps to the local modifier instead of the Virtual Document
            result = result.filter(item => !item.uri.startsWith('basetdl://'));
        }
        // Add the local modifiers to the results
        result.push(...modifiers);
    }

    return result;
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
export function getExpectedTypeForAttribute(attrName: string, scopeManager?: ScopeManager): string | undefined {
    const lower = attrName.toLowerCase();

    if (lower === 'filter' || lower === 'filters') return 'Formula';

    // First try static map (reliable casing, available before metadata)
    if (ATTRIBUTE_REFERENCE_MAP[lower]) return ATTRIBUTE_REFERENCE_MAP[lower];

    // Fallback to dynamic metadata map if available
    return scopeManager ? scopeManager.getCanonicalAttributeName(lower) : undefined;
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
    // Helper to check directives for reference
    const checkDirective = (dir: any): ReferenceInfo | undefined => {
        if (dir.kind === SyntaxKind.InUseDirective) {
            for (const target of dir.targets) {
                if (target.defName && offset >= target.defNameStart && offset <= target.defNameEnd) {
                    return {
                        name: target.defName,
                        expectedType: target.typeName || '',
                        start: target.defNameStart,
                        end: target.defNameEnd
                    };
                }
            }
        } else if (dir.kind === SyntaxKind.DefTypeDirective) {
            if (dir.defName && dir.defNameStart !== undefined && dir.defNameEnd !== undefined) {
                if (offset >= dir.defNameStart && offset <= dir.defNameEnd) {
                    return {
                        name: dir.defName,
                        expectedType: dir.defType || '',
                        start: dir.defNameStart,
                        end: dir.defNameEnd
                    };
                }
            }
        }
        return undefined;
    };

    // First check file-level directives
    for (const dir of sourceFile.directives) {
        const ref = checkDirective(dir);
        if (ref) return ref;
    }

    const def = findDefinitionAtOffset(sourceFile, offset);
    if (!def) return undefined;

    // Check definition-level directives
    for (const dir of def.directives) {
        const ref = checkDirective(dir);
        if (ref) return ref;
    }

    // Check if cursor is on the definition name of a modifier definition (#, !, *)
    if (def.modifier && def.name) {
        const nameStart = def.name.start;
        const nameEnd = def.name.end;

        if (offset >= nameStart && offset <= nameEnd) {
            return {
                name: def.name.text,
                expectedType: def.type.text,
                start: nameStart,
                end: nameEnd,
                isModifier: true
            };
        }
    }

    // Check if we are on an Include definition
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

    // Also check if we are on an argument in statements (blocks)
    if (uri && def.statements) {
        const stmt = findStatementAtOffset(def, offset);
        if (stmt) {
            for (let i = 0; i < stmt.args.length; i++) {
                const arg = stmt.args[i];
                if (offset >= arg.start && offset <= arg.end) {
                    if (arg.kind === SyntaxKind.Identifier) {
                        const foundText = (arg as IdentifierNode).text;
                        if (foundText.startsWith('##') || foundText.startsWith('#')) {
                            const isVariable = foundText.startsWith('##');
                            const varName = foundText.replace(/^##?/, '');
                            if (scopeManager) {
                                const scope = scopeManager.getScopeAt(uri, offset);
                                if (scope) {
                                    let resolved;
                                    if (isVariable) {
                                        resolved = scopeManager.resolveVariable(varName, scope);
                                        if (resolved) {
                                            return {
                                                name: varName,
                                                expectedType: resolved.definitionType || 'Variable',
                                                start: arg.start,
                                                end: arg.end
                                            };
                                        }
                                    } else {
                                        // For # (Field references), we don't need to resolve, we just return the expected type
                                        return {
                                            name: varName,
                                            expectedType: 'Field',
                                            start: arg.start,
                                            end: arg.end
                                        };
                                    }
                                }
                            } else if (!isVariable) {
                                return {
                                    name: varName,
                                    expectedType: 'Field',
                                    start: arg.start,
                                    end: arg.end
                                };
                            }
                        }
                    }

                    if (scopeManager && stmt.action) {
                        const actionName = stmt.action.text;
                        const actionDef = scopeManager.globalScope.actions.get(normalizeTypeName(actionName));

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

    // Check attribute value references
    const attr = findAttributeAtOffset(def, offset);

    if (attr && attr.colon && offset >= attr.colon.Start && offset <= attr.end) {
        let expectedType: string | undefined;
        let paramIndex = -1;
        let foundValueNode: any = undefined;
        let localAttrDef: any = undefined;

        const attrNameLower = attr.name.text.toLowerCase();
        if (['add', 'replace', 'delete', 'local'].includes(attrNameLower) && scopeManager) {
            const resolved = resolveModifierChain(attrNameLower, attr.value, def.type.text, def.name?.text || '', scopeManager, offset);

            if (resolved.cursorSegment) {
                switch (resolved.cursorSegment) {
                    case 'defName':
                    case 'positionReference': {
                        // It's referring to an existing definition of the effective type (or target attribute's type)
                        let expectedType = resolved.effectiveDefType;

                        if (resolved.cursorSegment === 'positionReference') {
                            // Position reference refers to the type that the target attribute accepts
                            if (resolved.targetAttributeMeta && resolved.targetAttributeMeta.parameters && resolved.targetAttributeMeta.parameters.length > 0) {
                                const param = resolved.targetAttributeMeta.parameters[0];
                                if (param.RefersTo) {
                                    expectedType = param.RefersTo;
                                }
                            } else if (resolved.targetAttribute) {
                                expectedType = resolved.targetAttribute.text;
                            }
                        }

                        // Find the node at the offset to get its name
                        let name = '';
                        let start = 0;
                        let end = 0;
                        for (const node of attr.value) {
                            if (offset >= node.start && offset <= node.end) {
                                if (node.kind === SyntaxKind.Identifier) {
                                    name = (node as any).text;
                                } else if ('text' in node) {
                                    name = (node as any).text;
                                } else if ('value' in node) {
                                    name = String((node as any).value);
                                }
                                name = name.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
                                start = node.start;
                                end = node.end;
                                break;
                            }
                        }

                        if (name && name.toLowerCase() !== 'default') {
                            return {
                                name,
                                expectedType: expectedType,
                                start: start,
                                end: end
                            };
                        }
                        break;
                    }
                    case 'value': {
                        paramIndex = resolved.cursorIndexInValues !== undefined ? resolved.cursorIndexInValues : -1;
                        localAttrDef = resolved.targetAttributeMeta;
                        if (paramIndex >= 0) {
                            foundValueNode = resolved.values[paramIndex];
                        }
                        break;
                    }
                }

                // If it's a modifierKeyword, defType, targetAttribute, positionModifier, we don't resolve references (it's part of the language keywords)
                if (resolved.cursorSegment !== 'value') {
                    return undefined;
                }
            }
        } else {
            for (let i = 0; i < attr.value.length; i++) {
                const val = attr.value[i];
                if (offset >= val.start && offset <= val.end) {
                    paramIndex = i;
                    foundValueNode = val;
                    break;
                }
            }
        }

        if (paramIndex >= 0 && scopeManager) {
            let attrDef = localAttrDef;
            if (!attrDef) {
                const defTypeName = normalizeTypeName(def.type.text);
                const attrMap = scopeManager.globalScope.attributes.get(defTypeName);
                if (attrMap) {
                    attrDef = attrMap.get(normalizeTypeName(attr.name.text));
                }
            }
            if (attrDef?.type?.toLowerCase() === 'menu item list' && normalizeTypeName(attr.name.text) !== 'indent') {
                const isKeyItem = normalizeTypeName(attr.name.text) === 'keyitem';
                const actionIndex = isKeyItem ? 2 : 1;
                let actionName = '';
                if (attr.value.length > actionIndex) {
                    const actionNode = attr.value[actionIndex];
                    if (actionNode.kind === SyntaxKind.Identifier) {
                        actionName = normalizeTypeName((actionNode as any).text);
                    }
                }
                const menuItemExpected = getExpectedTypeForMenuItem(attr.name.text, paramIndex, actionName, scopeManager);
                if (menuItemExpected && menuItemExpected !== 'Action' && menuItemExpected !== 'String') {
                    expectedType = menuItemExpected;
                }
            } else if (attrDef && attrDef.parameters && attrDef.parameters.length > 0) {
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
                        const lowerType = expectedType?.toLowerCase();
                        if (lowerType === 'system formulae' || lowerType === 'system formula' || lowerType === 'formulae') {
                            expectedType = 'Formula';
                        }
                    }
                }
            }

            if (!expectedType && attrDef) {
                expectedType = getExpectedTypeForAttribute(attrDef.name, scopeManager);
            }
        }

        if (!expectedType) {
            expectedType = getExpectedTypeForAttribute(attr.name.text, scopeManager);
        }

        // 'Use' attribute always refers to the same definition type as the current definition
        if (!expectedType && attr.name.text.toLowerCase() === 'use') {
            expectedType = def.type.text;
        }

        if (foundValueNode) {
            // Find the deepest node at this offset, in case foundValueNode is a complex expression
            // DO NOT drill down if it's a ListNode, because ListNodes represent space-separated multi-word identifiers!
            let deepestNode = foundValueNode;
            if (foundValueNode.kind !== SyntaxKind.List) {
                deepestNode = findNodeAtOffset([foundValueNode], offset) || foundValueNode;
            }

            let name: string = '';
            if (deepestNode.kind === SyntaxKind.List) {
                name = (deepestNode as any).values.map((v: any) => v.text || v.value || '').join(' ');
            } else if (deepestNode.kind === SyntaxKind.VariableReference) {
                name = '##' + (deepestNode as any).variableName.text;
            } else if (deepestNode.kind === SyntaxKind.FieldReference) {
                name = '#' + (deepestNode as any).fieldName.text;
            } else if (deepestNode.kind === SyntaxKind.MethodReference) {
                name = '$' + (deepestNode as any).methodName.text;
            } else if (deepestNode.kind === SyntaxKind.FormulaReference) {
                const node = deepestNode as any;
                name = (node.isGlobal ? '@@' : '@') + node.formulaName.text;
            } else if ('text' in deepestNode) {
                name = (deepestNode as IdentifierNode).text;
            } else if ('value' in deepestNode) {
                name = String((deepestNode as LiteralNode).value);
            }

            name = name.replace(/^"|"$|^'|'$/g, '');
            if (!name) return undefined;

            if (name.startsWith('##') || name.startsWith('#')) {
                const isVariable = name.startsWith('##');
                const varName = name.replace(/^##?/, '');
                if (scopeManager && uri) {
                    const scope = scopeManager.getScopeAt(uri, offset);
                    if (scope) {
                        let resolved;
                        if (isVariable) {
                            resolved = scopeManager.resolveVariable(varName, scope);
                        }
                        if (resolved) {
                            return {
                                name: varName,
                                expectedType: resolved.definitionType || 'Variable',
                                start: deepestNode.start,
                                end: deepestNode.end
                            };
                        }
                    }
                } 
                
                return {
                    name: varName,
                    expectedType: isVariable ? 'Variable' : 'Field',
                    start: deepestNode.start,
                    end: deepestNode.end
                };
            } else if (name.startsWith('@@') || name.startsWith('@')) {
                const formulaName = name.replace(/^@@?/, '');
                return {
                    name: formulaName,
                    expectedType: 'Formula',
                    start: deepestNode.start,
                    end: deepestNode.end
                };
            }

            if (expectedType) {
                return {
                    name,
                    expectedType,
                    start: deepestNode.start,
                    end: deepestNode.end
                };
            }

            // Fallback: Check if it's an action argument (e.g. 01: Alter: Part: My Part Name)
            if (!expectedType && attr.value.length > 0 && scopeManager) {
                const firstVal = attr.value[0];
                if ('text' in firstVal) {
                    const actionName = (firstVal as IdentifierNode).text;
                    const actionDef = scopeManager.globalScope.actions.get(normalizeTypeName(actionName));

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

    return undefined;
}

