import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DefinitionNode, SyntaxKind, IdentifierNode, LiteralNode, FunctionCallNode } from "../../parser/ast";
import { SymbolTable, definitionTypeToSymbolKind, SymbolKind } from "../symbolTable";
import { normalizeTypeName, getInterchangeableTypes } from "../utils";
import { areTypesCompatible, inferExpressionType } from "./validationUtils";
import { validateFunctionCall, validateBinaryExpression } from "./expressionValidation";
import { DiagnosticRules, createDiagnostic } from "../../diagnostics";
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

    for (const attr of def.attributes) {
        const attrName = attr.name.text;
        const attrNameLower = normalizeTypeName(attrName);

        // Check for duplicate variables
        if (attrNameLower === 'variable' || attrNameLower === 'listvariable') {
            if (attr.value.length > 0 && attr.value[0].kind === 3 /* SyntaxKind.Identifier */) {
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
            const startPos = doc.positionAt(attr.name.start);
            const endPos = doc.positionAt(attr.name.end);

            const diag = createDiagnostic(
                DiagnosticRules.UnknownAttribute,
                { start: startPos, end: endPos },
                attrName
            );
            (diag as any).data = { attrName, defTypeName };
            diagnostics.push(diag);
            continue;
        }

        // Validate Parameters
        if (attrDef.parameters && attrDef.parameters.length > 0) {
            // 1. Mandatory Parameter Validation
            let lastMandatoryIndex = -1;
            for (let i = 0; i < attrDef.parameters.length; i++) {
                if (attrDef.parameters[i].IsMandatory) {
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
                                attrDef.parameters[i].ParameterType || `at position ${i + 1}`
                            ));
                        }
                    }
                }
            }

            // 2. Datatype Validation (always runs)
            for (let i = 0; i < attr.value.length; i++) {
                if (i >= attrDef.parameters.length) break;

                const paramDef = attrDef.parameters[i];
                const paramNode = attr.value[i];

                if (paramNode.kind === SyntaxKind.Empty) continue;

                // Expression Type Validation
                const inferredType = inferExpressionType(paramNode, scopeManager);
                if (inferredType && paramDef.DataType) {
                    const normalizedExpected = normalizeTypeName(paramDef.DataType);
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

                // If it's a function call, validate arguments recursively
                if (paramNode.kind === SyntaxKind.FunctionCall) {
                    validateFunctionCall(
                        paramNode as FunctionCallNode,
                        undefined, // Return type is already checked above, just validate arguments
                        doc,
                        scopeManager,
                        diagnostics
                    );
                    continue; // Function handled, skip other validations for this node
                }

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
                if (paramDef.KeywordSet && normalizeTypeName( paramDef.KeywordSet) === 'tdlActions') {
                    const isValidAction = scopeManager.globalScope.actions.has(normalizeTypeName(cleanValue));
                    // Check aliases too? It's fine for now.
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

                // Reference Validation (requires symbolTable)
                if (symbolTable && paramDef.RefersTo && !paramDef.KeywordSet) {
                    // Skip reference validation for Function Parameters as they define the variable
                    if (defTypeName.toLowerCase() === 'function' && attrDef.name.toLowerCase() === 'parameter' && i === 0) {
                        continue;
                    }

                    const refersToType = paramDef.RefersTo.trim();
                    const normalizedRefersToType = normalizeTypeName(refersToType);
                    const startPos = doc.positionAt(paramNode.start);
                    const endPos = doc.positionAt(paramNode.end);

                    const interchangeableTypes = getInterchangeableTypes(normalizedRefersToType);
                    const targetKinds = interchangeableTypes.map(t => definitionTypeToSymbolKind(t));

                    const existingSymbols = symbolTable.findAllByName(cleanValue);
                    const hasDefinitionInWorkspace = existingSymbols.some(s => targetKinds.includes(s.kind));
                    const typeMap = scopeManager.existingDefinitions.get(normalizedRefersToType);
                    const hasDefinitionInMeta = typeMap ? typeMap.has(normalizeTypeName(cleanValue)) : false;

                    if (!hasDefinitionInWorkspace && !hasDefinitionInMeta) {
                        const diag = createDiagnostic(
                            DiagnosticRules.MissingDefinition,
                            { start: startPos, end: endPos },
                            cleanValue
                        );
                        (diag as any).data = { name: cleanValue, type: refersToType };
                        diagnostics.push(diag);
                    } else if (hasDefinitionInWorkspace && projectNodes) {
                        // Check if the definition is reachable from the project root
                        const validProjectSymbol = existingSymbols.find(s => targetKinds.includes(s.kind) && projectNodes.has(s.uri));
                        if (!validProjectSymbol) {
                            const diag = createDiagnostic(
                                DiagnosticRules.MissingDefinition,
                                { start: startPos, end: endPos },
                                cleanValue
                            );
                            diag.message = `Definition '${cleanValue}' is used from a file that is not included in the project`;
                            (diag as any).data = { name: cleanValue, type: refersToType };
                            diagnostics.push(diag);
                        }
                    }
                }
            }
        }
    }

    return diagnostics;
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
    const schema = scopeManager.globalScope.schemas.get(schemaName.toUpperCase());
    if (!schema) return;

    // Validate simple attributes
    for (const attr of node.attributes) {
        if (!attr.name) continue;
        const attrName = attr.name.text;
        const normalizedAttrName = attrName.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');

        // System attributes allowed on schemas in XML payloads
        const systemAttributes = ['ACTION', 'VCHTYPE', 'OBJVIEW', 'NAME'];
        if (systemAttributes.includes(normalizedAttrName)) {
            // For VCHTYPE and OBJVIEW, these are typically only valid on VOUCHER.
            if ((normalizedAttrName === 'VCHTYPE' || normalizedAttrName === 'OBJVIEW') && schemaName.toUpperCase() !== 'VOUCHER') {
                diagnostics.push(createDiagnostic(
                    DiagnosticRules.InvalidSystemAttributeUsage,
                    { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                    attrName
                ));
            }
            // Skip further property validation for system attributes
            continue;
        }

        const propKey = Array.from(schema.properties.keys()).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedAttrName);
        if (!propKey) {
            const diag = createDiagnostic(
                DiagnosticRules.UnknownSchemaProperty,
                { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                attrName
            );
            (diag as any).data = { attrName, schemaName };
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
        const normalizedObjName = objName.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
        const complexPropKey = Array.from(schema.complexProperties.keys()).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedObjName);
        if (!complexPropKey) {
            const simplePropKey = Array.from(schema.properties.keys()).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedObjName);
            const simpleProp = simplePropKey ? schema.properties.get(simplePropKey) : undefined;
            if (simpleProp && simpleProp.IsRepeated) {
                // Validate inner tags
                for (const attr of complexObj.attributes) {
                    if (!attr.name) continue;
                    const attrName = attr.name.text;
                    const normalizedAttrName = attrName.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
                    if (normalizedAttrName !== normalizedObjName && normalizedAttrName !== 'TYPE') {
                        diagnostics.push(createDiagnostic(
                            DiagnosticRules.InvalidInnerTag,
                            { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                            attrName
                        ));
                    } else if (normalizedAttrName === normalizedObjName) {
                        // Validate data type
                        if (simpleProp.DataType?.toLowerCase() === 'logical' && attr.value.length > 0) {
                            const firstVal = attr.value[0];
                            if (firstVal.kind === 1) { // SyntaxKind.Identifier
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
                    const normalizedInnerName = innerName.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
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

            const diag = createDiagnostic(
                DiagnosticRules.UnknownSchemaProperty,
                { start: doc.positionAt(complexObj.name.start), end: doc.positionAt(complexObj.name.end) },
                objName
            );
            (diag as any).data = { attrName: objName, schemaName: schemaName };
            diagnostics.push(diag);
            continue;
        }

        const nextSchemaName = schema.complexProperties.get(complexPropKey)!;
        validateSchemaObject(complexObj, nextSchemaName, doc, scopeManager, diagnostics);
    }
}
