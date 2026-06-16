import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DefinitionNode, SyntaxKind, IdentifierNode, LiteralNode, FunctionCallNode } from "../../parser/ast";
import { TdlMetadata } from "../../tdlMetaData";
import { SymbolTable, definitionTypeToSymbolKind } from "../symbolTable";
import { normalizeTypeName } from "../utils";
import {  areTypesCompatible, inferExpressionType } from "./validationUtils";
import { validateFunctionCall, validateBinaryExpression } from "./expressionValidation";
import { UNKNOWN_ATTRIBUTE_DIAGNOSTIC_CODE, MISSING_DEFINITION_DIAGNOSTIC_CODE, UNKNOWN_SCHEMA_PROPERTY_DIAGNOSTIC_CODE } from "./validationConstants";



export function validateDefinitionAttributes(
    def: DefinitionNode,
    doc: TextDocument,
    metadata: TdlMetadata,
    symbolTable?: SymbolTable,
    projectNodes?: Set<string>
): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const defTypeName = def.type.text;
    const allowedAttrs = metadata.getDefinitionsForType(defTypeName);

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
                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        range: { start: doc.positionAt(attr.value[0].start), end: doc.positionAt(attr.value[0].end) },
                        message: `Duplicate variable declaration: '${varName}' is already declared in this definition.`,
                        source: 'tdl'
                    });
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

            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: { start: startPos, end: endPos },
                message: `Unknown attribute '${attrName}' for ${defTypeName} definition`,
                code: UNKNOWN_ATTRIBUTE_DIAGNOSTIC_CODE,
                data: { attrName, defTypeName },
                source: 'tdl'
            });
            continue;
        }

        // Validate Parameters
        if (attrDef.Parameters && attrDef.Parameters.length > 0) {
            // 1. Mandatory Parameter Validation
            let lastMandatoryIndex = -1;
            for (let i = 0; i < attrDef.Parameters.length; i++) {
                if (attrDef.Parameters[i].IsMandatory) {
                    lastMandatoryIndex = i;
                }
            }
            const minRequired = lastMandatoryIndex + 1;
            const providedCount = attr.value.length;

            if (providedCount < minRequired) {
                const startPos = doc.positionAt(attr.name.start);
                const endPos = doc.positionAt(attr.name.end);
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: { start: startPos, end: endPos },
                    message: `Attribute '${attrDef.Name}' expects at least ${minRequired} parameter(s). Provided: ${providedCount}`,
                    source: 'tdl'
                });
            } else {
                // Check if any mandatory parameter is skipped (EmptyNode)
                for (let i = 0; i <= lastMandatoryIndex; i++) {
                    if (i < attr.value.length) {
                        const node = attr.value[i];
                        if (node.kind === SyntaxKind.Empty) {
                            const startPos = doc.positionAt(node.start);
                            const endPos = doc.positionAt(node.end);
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: { start: startPos, end: endPos },
                                message: `Missing mandatory parameter: ${attrDef.Parameters[i].ParameterType || `at position ${i + 1}`}`,
                                source: 'tdl'
                            });
                        }
                    }
                }
            }

            // 2. Datatype Validation (always runs)
            for (let i = 0; i < attr.value.length; i++) {
                if (i >= attrDef.Parameters.length) break;

                const paramDef = attrDef.Parameters[i];
                const paramNode = attr.value[i];

                if (paramNode.kind === SyntaxKind.Empty) continue;

                // Expression Type Validation
                const inferredType = inferExpressionType(paramNode, metadata);
                if (inferredType && paramDef.DataType) {
                    const normalizedExpected = normalizeTypeName(paramDef.DataType);
                    const normalizedInferred = normalizeTypeName(inferredType);

                    if (normalizedExpected !== normalizedInferred && !areTypesCompatible(normalizedExpected, normalizedInferred)) {
                        const startPos = doc.positionAt(paramNode.start);
                        const endPos = doc.positionAt(paramNode.end);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: startPos, end: endPos },
                            message: `Expected '${paramDef.DataType}' but provided expression evaluates to '${inferredType}'`,
                            source: 'tdl'
                        });
                    }
                }

                // Validate nested binary expressions
                validateBinaryExpression(paramNode, doc, metadata, diagnostics);

                // If it's a function call, validate arguments recursively
                if (paramNode.kind === SyntaxKind.FunctionCall) {
                    validateFunctionCall(
                        paramNode as FunctionCallNode,
                        undefined, // Return type is already checked above, just validate arguments
                        doc,
                        metadata,
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

                // Keyword Validation
                if (paramDef.ParameterType === 'Keyword' && paramDef.Keywords) {
                    const validKeywords = paramDef.Keywords.split(',').map(k => k.trim().toLowerCase());
                    if (!validKeywords.includes(cleanValue.toLowerCase())) {
                        const startPos = doc.positionAt(paramNode.start);
                        const endPos = doc.positionAt(paramNode.end);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: startPos, end: endPos },
                            message: `Invalid keyword '${cleanValue}'. Expected one of: ${paramDef.Keywords}`,
                            source: 'tdl'
                        });
                    }
                }

                // Logical Datatype Validation
                if (paramDef.DataType?.toLowerCase() === 'logical') {
                    const validLogical = ['yes', 'no', 'true', 'false', 'on', 'off', '0', '1'];
                    if (!validLogical.includes(cleanValue.toLowerCase())) {
                        const startPos = doc.positionAt(paramNode.start);
                        const endPos = doc.positionAt(paramNode.end);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: startPos, end: endPos },
                            message: `Invalid logical value '${cleanValue}'. Expected: Yes, No, True, False`,
                            source: 'tdl'
                        });
                    }
                }

                // Reference Validation (requires symbolTable)
                if (symbolTable && paramDef.RefersTo && !paramDef.KeywordSet) {
                    // Skip reference validation for Function Parameters as they define the variable
                    if (defTypeName.toLowerCase() === 'function' && attrDef.Name.toLowerCase() === 'parameter' && i === 0) {
                        continue;
                    }

                    const refersToType = paramDef.RefersTo.trim();
                    const startPos = doc.positionAt(paramNode.start);
                    const endPos = doc.positionAt(paramNode.end);

                    const existingSymbols = symbolTable.findAllByName(cleanValue);
                    const hasDefinition = existingSymbols.some(s => s.kind === definitionTypeToSymbolKind(refersToType));

                    if (!hasDefinition) {
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: startPos, end: endPos },
                            message: `Definition '${cleanValue}' of type '${refersToType}' not found`,
                            source: 'tdl',
                            code: MISSING_DEFINITION_DIAGNOSTIC_CODE,
                            data: { name: cleanValue, type: refersToType }
                        });
                    } else if (projectNodes) {
                        // Check if the definition is reachable from the project root
                        const validProjectSymbol = existingSymbols.find(s => s.kind === definitionTypeToSymbolKind(refersToType) && projectNodes.has(s.uri));
                        if (!validProjectSymbol) {
                            diagnostics.push({
                                severity: DiagnosticSeverity.Warning,
                                range: { start: startPos, end: endPos },
                                message: `Definition '${cleanValue}' is used from a file that is not included in the project`,
                                source: 'tdl',
                                code: MISSING_DEFINITION_DIAGNOSTIC_CODE,
                                data: { name: cleanValue, type: refersToType }
                            });
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
    metadata: TdlMetadata,
    diagnostics: Diagnostic[]
) {
    const schemaKey = Array.from(metadata.schemas.keys()).find(k => k.toUpperCase() === schemaName.toUpperCase());
    if (!schemaKey) return;
    const schema = metadata.schemas.get(schemaKey);
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
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                    message: `Property '${attrName}' is only valid on VOUCHER schema`,
                    source: 'tdl'
                });
            }
            // Skip further property validation for system attributes
            continue;
        }

        const propKey = Array.from(schema.Properties.keys()).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedAttrName);
        if (!propKey) {
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                message: `Unknown property '${attrName}' for schema '${schemaName}'`,
                code: UNKNOWN_SCHEMA_PROPERTY_DIAGNOSTIC_CODE,
                data: { attrName, schemaName },
                source: 'tdl'
            });
            continue;
        }

        const propDef = schema.Properties.get(propKey)!;
        if (propDef.DataType?.toLowerCase() === 'logical' && attr.value.length > 0) {
            const firstVal = attr.value[0];
            if (firstVal.kind === SyntaxKind.Identifier) {
                const valText = (firstVal as IdentifierNode).text.toLowerCase();
                if (!['yes', 'no', 'true', 'false'].includes(valText)) {
                    diagnostics.push({
                        severity: DiagnosticSeverity.Warning,
                        range: { start: doc.positionAt(firstVal.start), end: doc.positionAt(firstVal.end) },
                        message: `Invalid logical value '${valText}'. Expected: Yes, No`,
                        source: 'tdl'
                    });
                }
            }
        }
    }

    // Validate nested complex objects
    for (const complexObj of node.complexObjects || []) {
        if (!complexObj.name) continue;
        const objName = complexObj.name.text;
        const normalizedObjName = objName.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
        const complexPropKey = Array.from(schema.ComplexProperties.keys()).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedObjName);
        if (!complexPropKey) {
            const simplePropKey = Array.from(schema.Properties.keys()).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedObjName);
            const simpleProp = simplePropKey ? schema.Properties.get(simplePropKey) : undefined;
            if (simpleProp && simpleProp.IsRepeated) {
                // Validate inner tags
                for (const attr of complexObj.attributes) {
                    if (!attr.name) continue;
                    const attrName = attr.name.text;
                    const normalizedAttrName = attrName.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
                    if (normalizedAttrName !== normalizedObjName && normalizedAttrName !== 'TYPE') {
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: doc.positionAt(attr.name.start), end: doc.positionAt(attr.name.end) },
                            message: `Invalid inner tag '${attrName}'. Expected '${objName.replace(/\.LIST$/i, '')}'`,
                            source: 'tdl'
                        });
                    } else if (normalizedAttrName === normalizedObjName) {
                        // Validate data type
                        if (simpleProp.DataType?.toLowerCase() === 'logical' && attr.value.length > 0) {
                            const firstVal = attr.value[0];
                            if (firstVal.kind === 1) { // SyntaxKind.Identifier
                                const valText = (firstVal as any).text.toLowerCase();
                                if (!['yes', 'no', 'true', 'false'].includes(valText)) {
                                    diagnostics.push({
                                        severity: DiagnosticSeverity.Warning,
                                        range: { start: doc.positionAt(firstVal.start), end: doc.positionAt(firstVal.end) },
                                        message: `Invalid logical value '${valText}'. Expected: Yes, No`,
                                        source: 'tdl'
                                    });
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
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: doc.positionAt(innerObj.name.start), end: doc.positionAt(innerObj.name.end) },
                            message: `Invalid inner tag '${innerName}'. Expected '${objName.replace(/\.LIST$/i, '')}'`,
                            source: 'tdl'
                        });
                    }
                }
                continue;
            }

            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: { start: doc.positionAt(complexObj.name.start), end: doc.positionAt(complexObj.name.end) },
                message: `Unknown complex property '${objName}' for schema '${schemaName}'`,
                code: UNKNOWN_SCHEMA_PROPERTY_DIAGNOSTIC_CODE,
                data: { attrName: objName, schemaName: schemaName },
                source: 'tdl'
            });
            continue;
        }

        const nextSchemaName = schema.ComplexProperties.get(complexPropKey)!;
        validateSchemaObject(complexObj, nextSchemaName, doc, metadata, diagnostics);
    }
}
