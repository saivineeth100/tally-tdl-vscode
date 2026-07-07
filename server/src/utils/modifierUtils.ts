import { SyntaxKind, IdentifierNode } from '../core/ast/ast';

import { normalizeTypeName } from './normalizeUtils';
import { STRUCTURAL_DEFINITION_TYPES } from '../validation/validationUtils';

export interface ModifierChainResult {
    /** The effective definition type after resolving Local chains (or the original def type) */
    effectiveDefType: string;
    /** The effective definition name (or the original def name) */
    effectiveDefName: string;
    /** The modifier kind if found */
    modifierKind?: 'add' | 'replace' | 'delete' | 'local';
    /** The target attribute being modified */
    targetAttribute?: IdentifierNode;
    /** The metadata for the target attribute */
    targetAttributeMeta?: any;
    /** Position modifier keyword if present (Before/After/At Beginning/At End) */
    positionModifier?: IdentifierNode;
    /** The reference name after position modifier */
    positionReference?: any; // IdentifierNode or other value node
    /** The actual values (could be old/new for Replace, or values for Add/Local) */
    values: any[];
    /** Index where actual values begin in the original attr.value array */
    valuesStartIndex: number;
    /** Set if there was a syntax error in the modifier chain */
    error?: string;
    
    // Cursor-specific resolution (optional, only populated if offset is provided)
    cursorSegment?: 'defType' | 'defName' | 'modifierKeyword' | 'targetAttribute' | 'positionModifier' | 'positionReference' | 'value';
    cursorIndexInValues?: number;
}

const MODIFIER_KEYWORDS = ['add', 'replace', 'delete', 'local'];
const POSITION_MODIFIERS = ['before', 'after', 'at beginning', 'at end'];

/**
 * Parses an attribute chain to determine the effective modification context.
 * Handles nested modifiers like Local -> Add.
 */
export function resolveModifierChain(
    attrNameLower: string,
    attrValue: any[],
    initialDefType: string,
    initialDefName: string,
    scopeManager: any,
    offset?: number
): ModifierChainResult {
    let result: ModifierChainResult = {
        effectiveDefType: initialDefType,
        effectiveDefName: initialDefName,
        values: [],
        valuesStartIndex: 0
    };

    if (!MODIFIER_KEYWORDS.includes(attrNameLower)) {
        // Not a modifier chain
        result.values = attrValue;
        if (offset !== undefined) {
            result.cursorSegment = 'value';
            result.cursorIndexInValues = attrValue.findIndex(v => offset >= v.start && offset <= v.end);
        }
        return result;
    }

    result.modifierKind = attrNameLower as 'add' | 'replace' | 'delete' | 'local';

    let currentIndex = 0;
    
    // 1. Process Local chain
    if (result.modifierKind === 'local') {
        let expectingDefNameFor: string | undefined = undefined;
        let isAttribute = false;
        let previousWasModifier = true;

        for (; currentIndex < attrValue.length; currentIndex++) {
            const node = attrValue[currentIndex];
            let nodeText = getNodeText(node);
            let nodeTextLower = nodeText.toLowerCase();

            if (offset !== undefined && offset >= node.start && offset <= node.end) {
                if (expectingDefNameFor) result.cursorSegment = 'defName';
                else if (!isAttribute) result.cursorSegment = 'defType'; // or attribute
            }

            if (expectingDefNameFor) {
                if (nodeText === '') {
                    result.effectiveDefType = expectingDefNameFor;
                    if (offset !== undefined && offset >= node.start && offset <= node.end) {
                        result.cursorSegment = 'defName';
                    }
                    break;
                }
                result.effectiveDefType = expectingDefNameFor;
                result.effectiveDefName = nodeText;
                expectingDefNameFor = undefined;
            } else if (!isAttribute) {
                if (nodeText === '') {
                    if (offset !== undefined && offset >= node.start && offset <= node.end) {
                        result.cursorSegment = 'defType';
                    }
                    break;
                }
                if (nodeTextLower === 'local') {
                    if (offset !== undefined && offset >= node.start && offset <= node.end) {
                        result.cursorSegment = 'modifierKeyword';
                    }
                    previousWasModifier = true;
                    continue;
                }

                const currentAttrs = scopeManager.globalScope.attributes.get(normalizeTypeName(result.effectiveDefType));
                const isTargetAttribute = currentAttrs && currentAttrs.has(normalizeTypeName(nodeTextLower));
                const canonicalDefType = scopeManager.globalScope.interchangeableAttributesMap?.get(nodeTextLower) || nodeTextLower;
                const isStructuralChild = STRUCTURAL_DEFINITION_TYPES.includes(canonicalDefType);
                let treatAsChainedTarget = false;

                if (scopeManager.globalScope.attributes.has(normalizeTypeName(nodeTextLower))) {
                    if (currentIndex + 1 < attrValue.length && attrValue[currentIndex + 1].kind === SyntaxKind.Identifier) {
                        if (previousWasModifier) {
                            treatAsChainedTarget = true;
                        } else if (isTargetAttribute && !isStructuralChild) {
                            treatAsChainedTarget = false;
                        } else if (isTargetAttribute && isStructuralChild) {
                            treatAsChainedTarget = (currentIndex + 2 < attrValue.length);
                        } else {
                            treatAsChainedTarget = true;
                        }
                    }
                }
                
                previousWasModifier = false;

                if (treatAsChainedTarget) {
                    expectingDefNameFor = nodeTextLower;
                } else {
                    isAttribute = true;
                    // We found the target attribute! Check if it's ANOTHER modifier
                    if (MODIFIER_KEYWORDS.includes(nodeTextLower)) {
                        result.modifierKind = nodeTextLower as 'add' | 'replace' | 'delete' | 'local';
                        if (offset !== undefined && offset >= node.start && offset <= node.end) {
                            result.cursorSegment = 'modifierKeyword';
                        }
                        currentIndex++; // Skip the modifier keyword itself
                    } else {
                        result.targetAttribute = node as IdentifierNode;
                        result.targetAttributeMeta = currentAttrs?.get(normalizeTypeName(nodeTextLower));
                        if (offset !== undefined && offset >= node.start && offset <= node.end) {
                            result.cursorSegment = 'targetAttribute';
                        }
                        currentIndex++; // Skip the target attribute itself
                    }
                    break;
                }
            }
        }
    }

    // 2. Process Add/Replace/Delete targets
    switch (result.modifierKind) {
        case 'add':
        case 'replace':
        case 'delete': {
            // If we came from Local, we might have skipped the modifier keyword but not read the target yet
            if (!result.targetAttribute && currentIndex < attrValue.length) {
                const node = attrValue[currentIndex];
                let nodeTextLower = getNodeText(node).toLowerCase();
                result.targetAttribute = node as IdentifierNode;
                
                const currentAttrs = scopeManager.globalScope.attributes.get(normalizeTypeName(result.effectiveDefType));
                if (currentAttrs) {
                    result.targetAttributeMeta = currentAttrs.get(normalizeTypeName(nodeTextLower));
                }
                
                if (offset !== undefined && offset >= node.start && offset <= node.end) {
                    result.cursorSegment = 'targetAttribute';
                }
                currentIndex++;
            }

            // Process position modifiers for Add
            if (result.modifierKind === 'add' && currentIndex < attrValue.length) {
                const node = attrValue[currentIndex];
                let nodeTextLower = getNodeText(node).toLowerCase();
                
                // To handle space separated modifiers parsed as List:
                if (POSITION_MODIFIERS.includes(nodeTextLower)) {
                    result.positionModifier = node as IdentifierNode;
                    if (offset !== undefined && offset >= node.start && offset <= node.end) {
                        result.cursorSegment = 'positionModifier';
                    }
                    currentIndex++;

                    // If Before or After, the next value is the reference name
                    if ((nodeTextLower === 'before' || nodeTextLower === 'after') && currentIndex < attrValue.length) {
                        const refNode = attrValue[currentIndex];
                        result.positionReference = refNode;
                        if (offset !== undefined && offset >= refNode.start && offset <= refNode.end) {
                            result.cursorSegment = 'positionReference';
                        }
                        currentIndex++;
                    }
                }
            }
            break;
        }
    }

    // 3. The rest are actual values
    result.valuesStartIndex = currentIndex;
    result.values = attrValue.slice(currentIndex);
    
    if (offset !== undefined && !result.cursorSegment) {
        for (let i = 0; i < result.values.length; i++) {
            const val = result.values[i];
            if (offset >= val.start && offset <= val.end) {
                result.cursorSegment = 'value';
                result.cursorIndexInValues = i;
                break;
            }
        }
    }

    return result;
}

export function getNodeText(node: any): string {
    if (node.kind === SyntaxKind.List) {
        return node.values.map((v: any) => v.text || v.value || '').join(' ');
    } else if ('text' in node) {
        return node.text;
    } else if ('value' in node) {
        return String(node.value);
    }
    return '';
}
