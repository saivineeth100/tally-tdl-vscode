import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DefinitionNode, SyntaxKind, IdentifierNode, LiteralNode, FunctionCallNode } from "../../parser/ast";
import { SymbolTable, definitionTypeToSymbolKind, SymbolKind } from "../symbolTable";
import { normalizeTypeName } from "../utils";
import { areTypesCompatible, inferExpressionType } from "./validationUtils";
import { validateFunctionCall, validateBinaryExpression, walkAndValidateExpression } from "./expressionValidation";
import { DiagnosticRules, createDiagnostic, createDiagnosticWithData, UnknownAttributeData, MissingDefinitionData, DefinitionNotInScopeData, UnknownSchemaPropertyData } from "../../diagnostics";
import { ScopeManager } from "../scopeManager";

export function validateDefinitionAttributes(
    def: DefinitionNode,
    doc: TextDocument,
    scopeManager: ScopeManager,
    symbolTable?: SymbolTable,
    projectNodes?: Set<string>
): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const defTypeName = def.type.text;
    const allowedAttrs = scopeManager.globalScope.attributes.get(normalizeTypeName(defTypeName));

    // Skip validation if we don't have metadata for this definition type
    if (!allowedAttrs) {
        return diagnostics;
    }

    const declaredVariables = new Set<string>();
    const seenAttributes = new Map<string, number>();

    for (const attr of def.attributes) {
        const attrName = attr.name.text;
        const attrNameLower = normalizeTypeName(attrName);

        if (attrNameLower === 'local') {
            // Validate Local targets dynamically
            let currentScopeDefType = defTypeName;
            let currentScopeDefName = def.name?.text || '';
            let validSoFar = true;
            let i = 0;
            let targetAttribute: IdentifierNode | undefined;
            let targetAttributeIndex = -1;

            while (i < attr.value.length) {
                const val = attr.value[i];
                if (val.kind !== SyntaxKind.Identifier) {
                    break;
                }

                const tDefTypeNode = val as IdentifierNode;
                const tDefType = tDefTypeNode.text.toLowerCase();
                
                // Check if tDefType is a known definition type in the global scope
                if (scopeManager.globalScope.attributes.has(normalizeTypeName(tDefType))) {
                    if (i + 1 < attr.value.length && attr.value[i + 1].kind === SyntaxKind.Identifier) {
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
                                    const existsAnywhere = scopeManager.resolveDefinition(tDefName, tDefType, attrScope, projectNodes) !== undefined;

                                    if (existsAnywhere) {
                                        diagnostics.push(createDiagnosticWithData(
                                            DiagnosticRules.DefinitionNotInScope,
                                            { start: doc.positionAt(tDefNameNode.start), end: doc.positionAt(tDefNameNode.end) },
                                            { type: tDefType, name: tDefName } as DefinitionNotInScopeData,
                                            tDefType,
                                            tDefName
                                        ));
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
                        i += 2;
                        continue;
                    }
                }

                // If not a definition type or no paired name, it's the target attribute
                targetAttribute = val as IdentifierNode;
                targetAttributeIndex = i;
                break;
            }

            // Once targets are validated, validate the target attribute
            if (targetAttribute && validSoFar) {
                const targetAttrs = scopeManager.globalScope.attributes.get(normalizeTypeName(currentScopeDefType));
                const targetAttrName = targetAttribute.text;
                const targetAttrNameLower = normalizeTypeName(targetAttrName);
                
                if (targetAttrs && !targetAttrs.has(targetAttrNameLower)) {
                    // Implicitly Local Formula, no unknown attribute warning
                } else if (targetAttrs && targetAttrs.has(targetAttrNameLower)) {
                    // We need a mock attribute node that uses targetAttribute as name and the rest as value
                    const mockAttr = {
                        ...attr,
                        name: targetAttribute,
                        value: attr.value.slice(targetAttributeIndex + 1)
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
        if (attrDef.parameters && attrDef.parameters.length > 0) {
            validateAttributeParameters(
                attr as import('../../parser/ast').AttributeNode,
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
    attrDef: import('../../models/symbols').AttributeSymbol,
    doc: TextDocument,
    diagnostics: Diagnostic[],
    scopeManager: ScopeManager,
    defTypeName: string,
    defName: string,
    projectNodes?: Set<string>
) {
    // 1. Mandatory Parameter Validation
    let lastMandatoryIndex = -1;
    for (let i = 0; i < attrDef.parameters!.length; i++) {
        if (attrDef.parameters![i].IsMandatory) {
            lastMandatoryIndex = i;
        }
    }
    const minRequired = lastMandatoryIndex + 1;
    const providedCount = attr.value.length;

    if (providedCount < minRequired) {
        const startPos = doc.positionAt(attr.name.start);
        const endPos = doc.positionAt(attr.name.end);
        diagnostics.push(createDiagnostic(
            DiagnosticRules.MissingParameters,
            { start: startPos, end: endPos },
            attrDef.name, minRequired, providedCount
        ));
    } else {
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
    for (let i = 0; i < attr.value.length; i++) {
        if (i >= attrDef.parameters!.length) break;

        const paramDef = attrDef.parameters![i];
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

                let isValidKeyword = paramDef.Keywords?.some((k: string) => k.toLowerCase() === cleanValue.toLowerCase());
                if (!isValidKeyword) {
                    const cachedKeywords = scopeManager.keywordSets.get(normalizeTypeName(paramDef.KeywordSet || ''));
                    isValidKeyword = cachedKeywords?.some((k: string) => k.toLowerCase() === cleanValue.toLowerCase());
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
            } else if (refersToLower === 'variable' || refersToLower === 'system variable') {
                resolvedDef = scopeManager.resolveVariable(cleanValue, currentScope, projectNodes);
            } else {
                resolvedDef = scopeManager.resolveDefinition(cleanValue, refersToType, currentScope, projectNodes);
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
                if (!projectNodes.has(resolvedDef.uri)) {
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
    node: DefinitionNode | import('../../parser/ast').ComplexObjectNode,
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

        const propKey = Array.from(schema.properties.keys()).find(k => normalizeTypeName(k).replace(/\.list$/, '') === normalizedAttrName);
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
        const complexPropKey = Array.from(schema.complexProperties.keys()).find(k => normalizeTypeName(k).replace(/\.list$/, '') === normalizedObjName);
        if (!complexPropKey) {
            const simplePropKey = Array.from(schema.properties.keys()).find(k => normalizeTypeName(k).replace(/\.list$/, '') === normalizedObjName);
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
