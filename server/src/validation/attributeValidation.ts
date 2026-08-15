import { Diagnostic, DiagnosticSeverity, Position } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DefinitionNode, SyntaxKind, IdentifierNode, LiteralNode, FunctionCallNode, ListNode } from '../core/ast/ast';

import { normalizeTypeName } from '../utils/normalizeUtils';
import { normalizeUri } from '../utils/uri';
import { areTypesCompatible, inferExpressionType, STRUCTURAL_DEFINITION_TYPES } from "./validationUtils";
import { validateFunctionCall, validateBinaryExpression, walkAndValidateExpression } from "./expressionValidation";
import { DiagnosticRules, createDiagnostic, createDiagnosticWithData, UnknownAttributeData, MissingDefinitionData, DefinitionNotInScopeData, UnknownSchemaPropertyData } from '../diagnostics';
import { ScopeManager } from '../semantics/scopeManager';
import { getExpectedTypeForMenuItem } from '../utils/attributeUtils';
import { URI } from 'vscode-uri';
import { isValidDataType, isValidSubType, isValidFormat } from '../utils/dataTypeUtils';

export function validateDefinitionAttributes(
    def: DefinitionNode,
    doc: TextDocument,
    scopeManager: ScopeManager,
    projectNodes?: Set<string>
): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const defTypeName = def.type.text;
    const DefTypeNorm = normalizeTypeName(defTypeName);
    const allowedAttrs = scopeManager.globalScope.attributes.get(DefTypeNorm);

    // Skip validation if we don't have metadata for this definition type
    if (!allowedAttrs || ["collection", "object"].includes(DefTypeNorm)) {
        return diagnostics;
    }

    const declaredVariables = new Set<string>();
    const seenAttributes = new Map<string, number>();

    const typeAttr = def.attributes.find(a => normalizeTypeName(a.name.text) === 'type');
    let declaredDataType: string | undefined;
    if (typeAttr && typeAttr.value.length > 0) {
        const firstVal = typeAttr.value[0];
        if (firstVal.kind === SyntaxKind.Identifier) {
            declaredDataType = (firstVal as IdentifierNode).text;
        } else if (firstVal.kind === SyntaxKind.Literal) {
            declaredDataType = (firstVal as LiteralNode).value.toString();
        } else if (firstVal.kind === SyntaxKind.List) {
            declaredDataType = doc.getText({ start: doc.positionAt(firstVal.start), end: doc.positionAt(firstVal.end) });
        }
        if (declaredDataType) {
            declaredDataType = declaredDataType.replace(/^["']|["']$/g, '').trim();
        }
    }

    for (const attr of def.attributes) {
        const attrName = attr.name.text;
        const attrNameLower = normalizeTypeName(attrName);

        // Validate DataType and SubTypes for Type attribute
        if (attrNameLower === 'type' && attr.value.length > 0) {
            const firstVal = attr.value[0];
            const cleanVal = doc.getText({ start: doc.positionAt(firstVal.start), end: doc.positionAt(firstVal.end) }).replace(/^["']|["']$/g, '').trim();
            if (firstVal.kind !== SyntaxKind.Empty && !cleanVal.startsWith('##') && !cleanVal.startsWith('$') && !cleanVal.startsWith('@')) {
                if (!isValidDataType(cleanVal)) {
                    const currentScope = scopeManager.getScopeAt(doc.uri, firstVal.start) || scopeManager.projectScope;
                    const defs = scopeManager.resolveDefinition(cleanVal, 'Variable', currentScope, projectNodes);
                    if (!defs || defs.length === 0) {
                        diagnostics.push(createDiagnostic(
                            DiagnosticRules.InvalidDataType,
                            { start: doc.positionAt(firstVal.start), end: doc.positionAt(firstVal.end) },
                            cleanVal
                        ));
                    }
                } else {
                    declaredDataType = cleanVal;
                    if (attr.value.length > 1) {
                        const subVal = attr.value[1];
                        const cleanSub = doc.getText({ start: doc.positionAt(subVal.start), end: doc.positionAt(subVal.end) }).replace(/^["']|["']$/g, '').trim();
                        if (subVal.kind !== SyntaxKind.Empty && !cleanSub.startsWith('##') && !cleanSub.startsWith('$') && !cleanSub.startsWith('@')) {
                            if (!isValidSubType(cleanVal, cleanSub)) {
                                diagnostics.push(createDiagnostic(
                                    DiagnosticRules.InvalidSubType,
                                    { start: doc.positionAt(subVal.start), end: doc.positionAt(subVal.end) },
                                    cleanSub, cleanVal
                                ));
                            }
                        }
                    }
                }
            }
        }

        // Validate Format keywords against the declared field type
        if (attrNameLower === 'format' && declaredDataType && isValidDataType(declaredDataType)) {
            const validateSingleFormat = (formatToken: string, startPos: Position, endPos: Position) => {
                const cleanToken = formatToken.trim();
                if (!cleanToken || cleanToken.startsWith('##') || cleanToken.startsWith('$') || cleanToken.startsWith('@')) {
                    return;
                }
                const baseKeyword = cleanToken.includes(':') ? cleanToken.split(':')[0].trim() : cleanToken;
                if (!baseKeyword || baseKeyword.startsWith('##') || baseKeyword.startsWith('$') || baseKeyword.startsWith('@')) {
                    return;
                }
                if (!isValidFormat(declaredDataType!, baseKeyword)) {
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.InvalidFormat,
                        { start: startPos, end: endPos },
                        baseKeyword, declaredDataType!
                    ));
                }
            };

            for (let i = 0; i < attr.value.length; i++) {
                const valNode = attr.value[i];
                if (i > 0) {
                    const prevNode = attr.value[i - 1];
                    const prevPos = doc.positionAt(prevNode.end);
                    const valPos = doc.positionAt(valNode.start);
                    const textBetween = doc.getText({ start: prevPos, end: valPos });
                    if (textBetween.includes(':')) {
                        // This value is a parameter of the preceding format keyword (e.g. 'Decimal: 2' or 'Separator: "/"'), so skip it
                        continue;
                    }
                }
                if (valNode.kind === SyntaxKind.Literal) {
                    const rawText = doc.getText({ start: doc.positionAt(valNode.start), end: doc.positionAt(valNode.end) });
                    const isQuoted = (rawText.startsWith('"') && rawText.endsWith('"')) || (rawText.startsWith("'") && rawText.endsWith("'"));
                    const unquotedText = isQuoted ? rawText.slice(1, -1) : rawText;

                    if (unquotedText.includes(',')) {
                        let currentOffset = isQuoted ? 1 : 0;
                        const parts = unquotedText.split(',');
                        for (const part of parts) {
                            const leadingSpaces = part.length - part.trimStart().length;
                            const trimmed = part.trim();
                            const partStart = valNode.start + currentOffset + leadingSpaces;
                            const partEnd = partStart + trimmed.length;
                            if (trimmed) {
                                validateSingleFormat(trimmed, doc.positionAt(partStart), doc.positionAt(partEnd));
                            }
                            currentOffset += part.length + 1; // +1 for comma
                        }
                    } else {
                        validateSingleFormat(unquotedText, doc.positionAt(valNode.start), doc.positionAt(valNode.end));
                    }
                } else if (valNode.kind === SyntaxKind.Identifier) {
                    const formatVal = (valNode as IdentifierNode).text;
                    validateSingleFormat(formatVal, doc.positionAt(valNode.start), doc.positionAt(valNode.end));
                } else if (valNode.kind === SyntaxKind.List) {
                    const formatVal = doc.getText({ start: doc.positionAt(valNode.start), end: doc.positionAt(valNode.end) }).trim();
                    validateSingleFormat(formatVal, doc.positionAt(valNode.start), doc.positionAt(valNode.end));
                }
            }
        }

        if (['local', 'add', 'replace', 'delete'].includes(attrNameLower)) {
            // Validate Local targets dynamically
            let currentScopeDefType = defTypeName;
            let currentScopeDefName = def.name?.text || '';
            let validSoFar = true;
            let targetAttribute: IdentifierNode | undefined;
            let targetAttributeIndex = -1;
            let previousWasModifier = false;
            let currentModifierKind = attrNameLower;

            for (let i = 0; i < attr.value.length; i++) {
                const val = attr.value[i];
                if (val.kind !== SyntaxKind.Identifier) {
                    break;
                }

                const tDefTypeNode = val as IdentifierNode;
                const tDefType = tDefTypeNode.text.toLowerCase();

                if (['local', 'add', 'replace', 'delete'].includes(tDefType)) {
                    currentModifierKind = tDefType;
                    previousWasModifier = true;
                    continue;
                }

                if (['before', 'after', 'at beginning', 'at end'].includes(tDefType)) {
                    if (tDefType === 'before' || tDefType === 'after') {
                        i++; // Skip the position reference
                    }
                    continue;
                }

                const currentAttrs = scopeManager.globalScope.attributes.get(normalizeTypeName(currentScopeDefType));
                const isTargetAttribute = currentAttrs && currentAttrs.has(normalizeTypeName(tDefType));
                const canonicalDefType = scopeManager.globalScope.interchangeableAttributesMap?.get(tDefType) || tDefType;
                const isStructuralChild = STRUCTURAL_DEFINITION_TYPES.includes(canonicalDefType);
                let treatAsChainedTarget = false;

                // Check if tDefType is a known definition type in the global scope
                if (currentModifierKind === 'local' && scopeManager.globalScope.attributes.has(normalizeTypeName(tDefType))) {
                    if (i + 1 < attr.value.length && attr.value[i + 1].kind === SyntaxKind.Identifier) {
                        if (previousWasModifier) {
                            treatAsChainedTarget = true;
                        } else if (isTargetAttribute && !isStructuralChild) {
                            treatAsChainedTarget = false;
                        } else if (isTargetAttribute && isStructuralChild) {
                            treatAsChainedTarget = (i + 2 < attr.value.length);
                        } else {
                            treatAsChainedTarget = true;
                        }
                    }
                }

                previousWasModifier = false;

                if (treatAsChainedTarget) {
                    if (validSoFar && currentModifierKind === 'local' && !['form', 'part', 'line', 'field'].includes(tDefType)) {
                        diagnostics.push(createDiagnosticWithData(
                            DiagnosticRules.InvalidKeyword,
                            { start: doc.positionAt(tDefTypeNode.start), end: doc.positionAt(tDefTypeNode.end) },
                            {} as any,
                            tDefTypeNode.text,
                            'Form, Part, Line, Field'
                        ));
                        validSoFar = false;
                    }
                    const tDefNameNode = attr.value[i + 1] as IdentifierNode;
                    const tDefName = tDefNameNode.text;

                    if (tDefName.toLowerCase() === 'default' || tDefName.toLowerCase() === 'd') {
                        // Wildcards are valid
                    } else if (validSoFar) {
                        const dummyScopeId = `${currentScopeDefType.toLowerCase()}:${currentScopeDefName}`;
                        const dummyScope = scopeManager.findDefinitionScope(dummyScopeId);

                        if (dummyScope) {
                            const reachableChildren = scopeManager.getDefinitionsInScope(dummyScope, tDefType);
                            let found = false;
                            for (const child of reachableChildren) {
                                if (normalizeTypeName(child.name) === normalizeTypeName(tDefName)) {
                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                const attrScope = dummyScope || scopeManager.getScopeAt(doc.uri, tDefNameNode.start) || scopeManager.projectScope;
                                const resolvedDefs = scopeManager.resolveDefinition(tDefName, tDefType, attrScope, projectNodes);
                                const existsAnywhere = resolvedDefs && resolvedDefs.length > 0;

                                if (existsAnywhere) {
                                    const isMockScope = !dummyScope.range || dummyScope.range.start === -1 || dummyScope.uri === 'global:metadata';
                                    if (!isMockScope) {
                                        diagnostics.push(createDiagnosticWithData(
                                            DiagnosticRules.DefinitionNotInScope,
                                            { start: doc.positionAt(tDefNameNode.start), end: doc.positionAt(tDefNameNode.end) },
                                            { type: tDefType, name: tDefName } as DefinitionNotInScopeData,
                                            tDefType,
                                            tDefName
                                        ));
                                        validSoFar = false; // Stop validating deeper if parent is broken
                                    }
                                } else {
                                    diagnostics.push(createDiagnosticWithData(
                                        DiagnosticRules.MissingDefinition,
                                        { start: doc.positionAt(tDefNameNode.start), end: doc.positionAt(tDefNameNode.end) },
                                        { type: tDefType, name: tDefName } as MissingDefinitionData,
                                        tDefType,
                                        tDefName
                                    ));
                                }
                                validSoFar = false; // Stop validating deeper if parent is broken
                            }
                        } else {
                            validSoFar = false;
                        }
                    }

                    currentScopeDefType = tDefType;
                    currentScopeDefName = tDefName;
                    i += 1; // Skip the paired name
                    continue;
                }

                // If not a definition type or no paired name, it's the target attribute
                targetAttribute = val as IdentifierNode;
                targetAttributeIndex = i;
                break;
            }

            // Once targets are validated, validate the target attribute
            if (targetAttribute && validSoFar && !['delete', 'replace'].includes(currentModifierKind)) {
                const targetAttrs = scopeManager.globalScope.attributes.get(normalizeTypeName(currentScopeDefType));
                const targetAttrName = targetAttribute.text;
                const targetAttrNameLower = normalizeTypeName(targetAttrName);

                if (targetAttrs && !targetAttrs.has(targetAttrNameLower)) {
                    // Implicitly Local Formula, no unknown attribute warning
                } else if (targetAttrs && targetAttrs.has(targetAttrNameLower)) {
                    let mockValue = attr.value.slice(targetAttributeIndex + 1);
                    if (currentModifierKind === 'add' && mockValue.length > 0) {
                        const firstVal = mockValue[0];
                        if (firstVal.kind === SyntaxKind.Identifier) {
                            const firstValText = (firstVal as IdentifierNode).text.toLowerCase();
                            if (['before', 'after', 'at beginning', 'at end'].includes(firstValText)) {
                                if (firstValText === 'before' || firstValText === 'after') {
                                    mockValue = mockValue.slice(2);
                                } else {
                                    mockValue = mockValue.slice(1);
                                }
                            }
                        }
                    }
                    // We need a mock attribute node that uses targetAttribute as name and the rest as value
                    const mockAttr = {
                        ...attr,
                        name: targetAttribute,
                        value: mockValue
                    };
                    validateAttributeParameters(
                        mockAttr,
                        targetAttrs.get(targetAttrNameLower)!,
                        doc,
                        diagnostics,
                        scopeManager,
                        currentScopeDefType,
                        currentScopeDefName,
                        projectNodes
                    );
                }
            }

            continue;
        }

        // Check for duplicate variables
        if (attrNameLower === 'variable' || attrNameLower === 'listvariable') {
            if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                const identifierNode = attr.value[0] as any;
                const varName = identifierNode.text || '';
                const lowerVarName = varName.toLowerCase();
                if (declaredVariables.has(lowerVarName)) {
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.DuplicateVariableDeclaration,
                        { start: doc.positionAt(attr.value[0].start), end: doc.positionAt(attr.value[0].end) },
                        varName
                    ));
                } else {
                    declaredVariables.add(lowerVarName);
                }
            }
        }

        // Check if this attribute is allowed for the definition type
        const attrDef = allowedAttrs.get(attrNameLower);

        if (!attrDef) {
            // In TDL, any unknown attribute is implicitly treated as a Local Formula declaration.
            // Therefore, we do not emit an UnknownAttribute diagnostic.
            continue;
        }

        // Check for discrete attribute duplicates
        if (attrDef.isDiscrete) {
            let hasParameters = attrDef.parameters && attrDef.parameters.length > 0;
            let valuesToCheck: { text: string, start: number, end: number }[] = [];

            if (hasParameters && attr.value && attr.value.length > 0) {
                // If the first parameter is a list or variable argument and it's the only parameter,
                // or if the attribute itself is a 'Single List', all values belong to it.
                // Otherwise, only the first value belongs to it.
                let firstParam = attrDef.parameters![0];
                let isOnlyParamList = attrDef.parameters!.length === 1 &&
                    (firstParam.IsList || firstParam.IsVariableArgument || attrDef.type?.toLowerCase() === 'single list');

                let maxIndex = isOnlyParamList ? attr.value.length : 1;
                for (let i = 0; i < maxIndex; i++) {
                    if (attr.value[i].kind !== SyntaxKind.Empty) {
                        const valStart = doc.positionAt(attr.value[i].start);
                        const valEnd = doc.positionAt(attr.value[i].end);
                        const text = doc.getText({ start: valStart, end: valEnd });
                        valuesToCheck.push({ text: text, start: attr.value[i].start, end: attr.value[i].end });
                    }
                }
            } else {
                // For attributes without parameters or if no value is provided
                valuesToCheck.push({ text: attrName, start: attr.name.start, end: attr.name.end });
            }

            for (const val of valuesToCheck) {
                const normalizedVal = val.text.toLowerCase();
                const uniqueKey = `${attrNameLower}:${normalizedVal}`;
                const prevCount = seenAttributes.get(uniqueKey) || 0;

                if (prevCount > 0) {
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.DuplicateDiscreteAttribute,
                        { start: doc.positionAt(val.start), end: doc.positionAt(val.end) },
                        attrName,
                        val.text
                    ));
                }
                seenAttributes.set(uniqueKey, prevCount + 1);
            }
        }

        // Validate Parameters
        if (attrDef && attrDef.parameters && attrDef.parameters.length > 0) {
            validateAttributeParameters(
                attr as import('../core/ast/ast').AttributeNode,
                attrDef,
                doc,
                diagnostics,
                scopeManager,
                defTypeName,
                def.name?.text || '',
                projectNodes
            );
        }
    }

    return diagnostics;
}

export function validateAttributeParameters(
    attr: { name: IdentifierNode, value: any[] },
    attrDef: import('tally-tdl-shared').AttributeSymbol,
    doc: TextDocument,
    diagnostics: Diagnostic[],
    scopeManager: ScopeManager,
    defTypeName: string,
    defName: string,
    projectNodes?: Set<string>
) {
    const isMenuItemList = attrDef.type?.toLowerCase() === 'menu item list' && normalizeTypeName(attr.name.text) !== 'indent';

    // 1. Mandatory Parameter Validation
    let lastMandatoryIndex = -1;
    let minRequired = 0;
    const providedCount = attr.value.length;

    if (!isMenuItemList) {
        for (let i = 0; i < attrDef.parameters!.length; i++) {
            if (attrDef.parameters![i].IsMandatory) {
                lastMandatoryIndex = i;
            }
        }
        minRequired = lastMandatoryIndex + 1;
    }

    if (!isMenuItemList && providedCount < minRequired) {
        const startPos = doc.positionAt(attr.name.start);
        const endPos = doc.positionAt(attr.name.end);
        diagnostics.push(createDiagnostic(
            DiagnosticRules.MissingParameters,
            { start: startPos, end: endPos },
            attrDef.name, minRequired, providedCount
        ));
    } else if (!isMenuItemList) {
        // Check if any mandatory parameter is skipped (EmptyNode)
        for (let i = 0; i <= lastMandatoryIndex; i++) {
            if (i < attr.value.length) {
                const node = attr.value[i];
                if (node.kind === SyntaxKind.Empty) {
                    const startPos = doc.positionAt(node.start);
                    const endPos = doc.positionAt(node.end);
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.MissingMandatoryParameter,
                        { start: startPos, end: endPos },
                        attrDef.parameters![i].ParameterType || `at position ${i + 1}`
                    ));
                }
            }
        }
    }

    // 2. Datatype Validation (always runs)
    const isKeyItem = normalizeTypeName(attr.name.text) === 'keyitem';
    const actionIndex = isKeyItem ? 2 : 1;
    let actionName = '';
    if (isMenuItemList && attr.value.length > actionIndex) {
        const actionNode = attr.value[actionIndex];
        if (actionNode.kind === SyntaxKind.Identifier) {
            actionName = normalizeTypeName((actionNode as any).text);
        }
    }

    let currentParamIndex = 0;
    for (let i = 0; i < attr.value.length; i++) {
        if (i > 0) {
            const prevNode = attr.value[i - 1];
            const currNode = attr.value[i];
            const prevPos = doc.positionAt(prevNode.end);
            const currPos = doc.positionAt(currNode.start);
            const textBetween = doc.getText({ start: prevPos, end: currPos });
            if (textBetween.includes(':')) {
                currentParamIndex++;
            }
        }

        if (!isMenuItemList && currentParamIndex >= attrDef.parameters!.length) break;

        let paramDef: import('tally-tdl-shared').TDLParameter | undefined = undefined;
        if (isMenuItemList) {
            const expectedTypeStr = getExpectedTypeForMenuItem(attr.name.text, currentParamIndex, actionName, scopeManager);
            if (expectedTypeStr) {
                paramDef = {
                    IsMandatory: false,
                    IsConstant: false,
                    DimensionExpression: false,
                    DataType: expectedTypeStr === 'Action' ? 'Action' : (expectedTypeStr === 'String' ? 'String' : undefined),
                    RefersTo: (expectedTypeStr !== 'Action' && expectedTypeStr !== 'String') ? expectedTypeStr : undefined,
                    KeywordSet: expectedTypeStr === 'Action' ? 'tdlactions' : undefined,
                    IsList: false,
                    IsVariableArgument: false
                };
            }
        } else {
            paramDef = attrDef.parameters![currentParamIndex];
        }

        if (!paramDef) continue;

        const paramNode = attr.value[i];

        if (paramNode.kind === SyntaxKind.Empty) continue;

        // Expression Type Validation
        const inferredType = inferExpressionType(paramNode, scopeManager);
        if (inferredType && paramDef.DataType) {
            const normalizedExpected = normalizeTypeName(paramDef.DataType || '');
            const normalizedInferred = normalizeTypeName(inferredType);

            if (normalizedExpected !== normalizedInferred && !areTypesCompatible(normalizedExpected, normalizedInferred)) {
                const startPos = doc.positionAt(paramNode.start);
                const endPos = doc.positionAt(paramNode.end);
                diagnostics.push(createDiagnostic(
                    DiagnosticRules.TypeMismatch,
                    { start: startPos, end: endPos },
                    paramDef.DataType, inferredType
                ));
            }
        }

        // Validate nested binary expressions
        validateBinaryExpression(paramNode, doc, scopeManager, diagnostics);

        // Use the new AST walker to recursively validate nested function calls and field references
        walkAndValidateExpression(
            paramNode,
            doc,
            scopeManager,
            diagnostics,
            defTypeName + ':' + defName,
            projectNodes
        );

        // If it's another expression (binary/unary), we skip keyword/logical validation for the node itself
        if ('operator' in paramNode) {
            continue;
        }

        let paramValue = '';
        if (paramNode.kind === SyntaxKind.Identifier) {
            paramValue = (paramNode as IdentifierNode).text;
        } else if (paramNode.kind === SyntaxKind.Literal) {
            paramValue = (paramNode as LiteralNode).value.toString();
        } else {
            continue;
        }

        if (!paramValue || paramValue.startsWith('##') || paramValue.startsWith('$') || paramValue.startsWith('@')) continue;

        const cleanValue = paramValue.replace(/^["']|["']$/g, '');
        if (!cleanValue) continue;

        // Action Validation (if it's not a Keyword ParameterType but still DataType is Action)
        if (paramDef.KeywordSet) {
            if (paramDef.KeywordSet === 'tdlactions') {
                const isValidAction = scopeManager.globalScope.actions.has(normalizeTypeName(cleanValue));
                if (!isValidAction) {
                    const startPos = doc.positionAt(paramNode.start);
                    const endPos = doc.positionAt(paramNode.end);
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.UnknownAction,
                        { start: startPos, end: endPos },
                        cleanValue
                    ));
                }
            }
            else {

                let isValidKeyword = paramDef.Keywords?.some((k: string) => normalizeTypeName(k) === normalizeTypeName(cleanValue));
                if (!isValidKeyword) {
                    const cachedKeywords = scopeManager.keywordSets.get(normalizeTypeName(paramDef.KeywordSet || ''));
                    isValidKeyword = cachedKeywords?.some((k: string) => normalizeTypeName(k) === normalizeTypeName(cleanValue));
                }
                if (!isValidKeyword) {
                    const startPos = doc.positionAt(paramNode.start);
                    const endPos = doc.positionAt(paramNode.end);
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.InvalidKeyword,
                        { start: startPos, end: endPos },
                        cleanValue
                    ));
                }
            }
        }
        // Logical Datatype Validation
        if (paramDef.DataType?.toLowerCase() === 'logical') {
            const validLogical = ['yes', 'no', 'true', 'false', 'on', 'off', '0', '1'];
            if (!validLogical.includes(cleanValue.toLowerCase())) {
                const startPos = doc.positionAt(paramNode.start);
                const endPos = doc.positionAt(paramNode.end);
                diagnostics.push(createDiagnostic(
                    DiagnosticRules.InvalidLogicalValue,
                    { start: startPos, end: endPos },
                    cleanValue
                ));
            }
        }

        // Reference Validation (uses scopeManager)
        if (paramDef.RefersTo && !paramDef.KeywordSet) {
            // Skip reference validation for Function Parameters as they define the variable
            if (defTypeName.toLowerCase() === 'function' && attrDef.name.toLowerCase() === 'parameter' && i === 0) {
                continue;
            }

            const refersToType = paramDef.RefersTo.trim();
            const startPos = doc.positionAt(paramNode.start);
            const endPos = doc.positionAt(paramNode.end);

            let resolvedDef: any;
            const refersToLower = refersToType.toLowerCase();
            const currentScope = scopeManager.getScopeAt(doc.uri, paramNode.start) || scopeManager.projectScope;

            if (refersToLower === 'system formulae' || refersToLower === 'formula' || refersToLower === 'formulae') {
                resolvedDef = scopeManager.resolveFormula(cleanValue, currentScope, projectNodes);
            } else if (refersToLower === 'variable' && isValidDataType(cleanValue)) {
                // Bypass reference validation for built-in TDL data type keywords
                continue;
            } else if (refersToLower === 'variable' || refersToLower === 'system variable') {
                resolvedDef = scopeManager.resolveVariable(cleanValue, currentScope, projectNodes);
            } else {
                const defs = scopeManager.resolveDefinition(cleanValue, refersToType, currentScope, projectNodes);
                if (defs && defs.length > 0) {
                    resolvedDef = defs[0];
                }
            }

            if (!resolvedDef) {
                const diag = createDiagnosticWithData<MissingDefinitionData>(
                    DiagnosticRules.MissingDefinition,
                    { start: startPos, end: endPos },
                    { name: cleanValue, type: refersToType },
                    cleanValue,
                    refersToType
                );
                diagnostics.push(diag);
            } else if (resolvedDef.uri !== 'global:metadata' && !resolvedDef.uri.startsWith('basetdl://') && projectNodes) {
                // Check if the resolved definition is within the project
                const normUri = normalizeUri(resolvedDef.uri);
                if (!projectNodes.has(normUri)) {
                    const diag = createDiagnosticWithData<MissingDefinitionData>(
                        DiagnosticRules.MissingDefinition,
                        { start: startPos, end: endPos },
                        { name: cleanValue, type: refersToType },
                        cleanValue,
                        refersToType
                    );
                    diag.message = `Definition '${cleanValue}' is used from a file that is not included in the project`;
                    diagnostics.push(diag);
                }
            }
        }
    }
}

/**
 * Recursively validate schema object nodes and their properties
 */
export function validateSchemaObject(
    node: DefinitionNode | import('../core/ast/ast').ComplexObjectNode,
    schemaName: string,
    doc: TextDocument,
    scopeManager: ScopeManager,
    diagnostics: Diagnostic[]
) {
    const schema = scopeManager.globalScope.schemas.get(normalizeTypeName(schemaName));
    if (!schema) return;

    // Validate simple attributes
    for (const attr of node.attributes) {
        if (!attr.name) continue;
        const attrName = attr.name.text;
        const normalizedAttrName = normalizeTypeName(attrName).replace(/\.list$/, '');

        // System attributes allowed on schemas in XML payloads
        const systemAttributes = ['action', 'vchtype', 'objview', 'name'];
        if (systemAttributes.includes(normalizedAttrName)) {
            // For VCHTYPE and OBJVIEW, these are typically only valid on VOUCHER.
            if ((normalizedAttrName === 'vchtype' || normalizedAttrName === 'objview') && normalizeTypeName(schemaName) !== 'voucher') {
                diagnostics.push(createDiagnostic(
                    DiagnosticRules.InvalidSystemAttributeUsage,
                    { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                    attrName
                ));
            }
            // Skip further property validation for system attributes
            continue;
        }

        const propKey = Array.from(schema.properties.keys()).find((k: string) => normalizeTypeName(k).replace(/\.list$/, '') === normalizedAttrName);
        if (!propKey) {
            const diag = createDiagnosticWithData<UnknownSchemaPropertyData>(
                DiagnosticRules.UnknownSchemaProperty,
                { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                { attrName, schemaName },
                attrName
            );
            diagnostics.push(diag);
            continue;
        }

        const propDef = schema.properties.get(propKey)!;
        if (propDef.DataType?.toLowerCase() === 'logical' && attr.value.length > 0) {
            const firstVal = attr.value[0];
            if (firstVal.kind === SyntaxKind.Identifier) {
                const valText = (firstVal as IdentifierNode).text.toLowerCase();
                if (!['yes', 'no', 'true', 'false'].includes(valText)) {
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.InvalidLogicalValue,
                        { start: doc.positionAt(firstVal.start), end: doc.positionAt(firstVal.end) },
                        valText
                    ));
                }
            }
        }
    }

    // Validate nested complex objects
    for (const complexObj of node.complexObjects || []) {
        if (!complexObj.name) continue;
        const objName = complexObj.name.text;
        const normalizedObjName = normalizeTypeName(objName).replace(/\.list$/, '');
        const complexPropKey = Array.from(schema.complexProperties.keys()).find((k: string) => normalizeTypeName(k).replace(/\.list$/, '') === normalizedObjName);
        if (!complexPropKey) {
            const simplePropKey = Array.from(schema.properties.keys()).find((k: string) => normalizeTypeName(k).replace(/\.list$/, '') === normalizedObjName);
            const simpleProp = simplePropKey ? schema.properties.get(simplePropKey) : undefined;
            if (simpleProp && simpleProp.IsRepeated) {
                // Validate inner tags
                for (const attr of complexObj.attributes) {
                    if (!attr.name) continue;
                    const attrName = attr.name.text;
                    const normalizedAttrName = normalizeTypeName(attrName).replace(/\.list$/, '');
                    if (normalizedAttrName !== normalizedObjName && normalizedAttrName !== 'type') {
                        diagnostics.push(createDiagnostic(
                            DiagnosticRules.InvalidInnerTag,
                            { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                            attrName
                        ));
                    } else if (normalizedAttrName === normalizedObjName) {
                        // Validate data type
                        if (simpleProp.DataType?.toLowerCase() === 'logical' && attr.value.length > 0) {
                            const firstVal = attr.value[0];
                            if (firstVal.kind === SyntaxKind.Identifier) {
                                const valText = (firstVal as any).text.toLowerCase();
                                if (!['yes', 'no', 'true', 'false'].includes(valText)) {
                                    diagnostics.push(createDiagnostic(
                                        DiagnosticRules.InvalidLogicalValue,
                                        { start: doc.positionAt(firstVal.start), end: doc.positionAt(firstVal.end) },
                                        valText
                                    ));
                                }
                            }
                        }
                    }
                }

                for (const innerObj of complexObj.complexObjects || []) {
                    if (!innerObj.name) continue;
                    const innerName = innerObj.name.text;
                    const normalizedInnerName = normalizeTypeName(innerName).replace(/\.list$/, '');
                    if (normalizedInnerName !== normalizedObjName) {
                        diagnostics.push(createDiagnostic(
                            DiagnosticRules.InvalidInnerTag,
                            { start: doc.positionAt(innerObj.name.start), end: doc.positionAt(innerObj.name.end) },
                            innerName
                        ));
                    }
                }
                continue;
            }

            const diag = createDiagnosticWithData<UnknownSchemaPropertyData>(
                DiagnosticRules.UnknownSchemaProperty,
                { start: doc.positionAt(complexObj.name.start), end: doc.positionAt(complexObj.name.end) },
                { attrName: objName, schemaName: schemaName },
                objName
            );
            diagnostics.push(diag);
            continue;
        }

        const nextSchemaName = schema.complexProperties.get(complexPropKey)!;
        validateSchemaObject(complexObj, nextSchemaName, doc, scopeManager, diagnostics);
    }
}

import { definitionTypeToSymbolKind } from '../semantics/scopeManager/types';
