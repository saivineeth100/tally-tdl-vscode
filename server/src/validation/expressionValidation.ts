import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FunctionCallNode, BinaryExpressionNode, Node, SyntaxKind, MethodReferenceNode, ComplexMethodReferenceNode } from '../core/ast/ast';
import { normalizeTypeName } from '../utils/normalizeUtils';
import { areTypesCompatible, inferExpressionType } from "./validationUtils";
import { DiagnosticRules, createDiagnostic } from '../diagnostics';
import { ScopeManager, getFieldsInScope } from '../semantics/scopeManager';
import { validateFunctionArity } from "./arityValidation";

/**
 * Recursively walk an expression AST node and validate any nested functions or field references.
 */
export function walkAndValidateExpression(
    node: Node,
    doc: TextDocument,
    scopeManager: ScopeManager,
    diagnostics: Diagnostic[],
    currentDefinitionScopeId: string,
    projectScope?: Set<string>
) {
    if (!node) return;

    if (node.kind === SyntaxKind.FunctionCall) {
        validateFunctionCall(node as FunctionCallNode, undefined, doc, scopeManager, diagnostics, projectScope);
        // validateFunctionCall recurses into its arguments, but we still need to walk them for FieldReferences
        const funcNode = node as FunctionCallNode;
        if (funcNode.arguments) {
            for (const arg of funcNode.arguments) {
                walkAndValidateExpression(arg, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
            }
        }
    } else if (node.kind === SyntaxKind.FieldReference) {
        validateFieldReference(node as import('../core/ast/ast').FieldReferenceNode, doc, scopeManager, diagnostics, currentDefinitionScopeId);
    } else if (node.kind === SyntaxKind.VariableReference) {
        // Can add variable validation here in the future
    } else if (node.kind === SyntaxKind.MethodReference) {
        validateMethodReference(node as MethodReferenceNode | ComplexMethodReferenceNode, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
    }

    if ('operator' in node && 'left' in node && 'right' in node) {
        const binExpr = node as BinaryExpressionNode;
        walkAndValidateExpression(binExpr.left, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
        walkAndValidateExpression(binExpr.right, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
    } else if ('operator' in node && !('left' in node) && 'right' in node) {
        // Unary expression has operator and right
        const unExpr = node as any;
        if (unExpr.right) {
            walkAndValidateExpression(unExpr.right, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
        }
    }
}
/**
 * Recursively validate function calls - checks return type and validates nested function arguments
 * @param funcNode The function call AST node to validate
 * @param expectedType The expected return type (if any)
 * @param doc The text document for position calculation
 * @param scopeManager ScopeManager containing function definitions
 * @param diagnostics Array to push diagnostics into
 * @param projectScope Optional project scope for user-defined function validation
 */
export function validateFunctionCall(
    funcNode: FunctionCallNode,
    expectedType: string | undefined,
    doc: TextDocument,
    scopeManager: ScopeManager,
    diagnostics: Diagnostic[],
    projectScope?: Set<string>
): void {
    const funcName = funcNode.functionName?.text;
    if (!funcName) return;

    const func = scopeManager.globalScope.functions.get(normalizeTypeName(funcName));
    if (!func) return;

    // 1. Validate return type if expected type is provided
    if (expectedType && func.returnType) {
        const normalizedExpected = normalizeTypeName(expectedType);
        const normalizedReturn = normalizeTypeName(func.returnType);

        if (normalizedExpected !== normalizedReturn && !areTypesCompatible(normalizedExpected, normalizedReturn)) {
            const diag = createDiagnostic(
                DiagnosticRules.TypeMismatch,
                { start: doc.positionAt(funcNode.start), end: doc.positionAt(funcNode.end) },
                expectedType, func.returnType
            );
            diag.message = `Function '$$${funcName}' returns '${func.returnType}' but expected '${expectedType}'`;
            diagnostics.push(diag);
        }
    }

    // 2. Recursively validate function arguments
    if (funcNode.arguments && func.parameters) {
        for (let i = 0; i < funcNode.arguments.length; i++) {
            const argNode = funcNode.arguments[i];
            const paramDef = func.parameters[i];

            if (!paramDef) continue;

            // If argument is a nested function call, recursively validate
            if (argNode.kind === SyntaxKind.FunctionCall) {
                validateFunctionCall(
                    argNode as FunctionCallNode,
                    paramDef.DataType,
                    doc,
                    scopeManager,
                    diagnostics,
                    projectScope
                );
            }
        }
    }

    // 3. Validate Function Arity
    validateFunctionArity(funcNode, doc, scopeManager, diagnostics, projectScope);
}

/**
 * Validate binary expressions for type compatibility
 */
export function validateBinaryExpression(
    exprNode: Node,
    doc: TextDocument,
    scopeManager: ScopeManager,
    diagnostics: Diagnostic[]
) {
    if (exprNode.kind === SyntaxKind.Statement && 'operator' in exprNode && 'left' in exprNode && 'right' in exprNode) {
        const binExpr = exprNode as BinaryExpressionNode;
        const leftType = inferExpressionType(binExpr.left, scopeManager);
        const rightType = inferExpressionType(binExpr.right, scopeManager);
        
        if (leftType && rightType) {
            const normalizedLeft = normalizeTypeName(leftType);
            const normalizedRight = normalizeTypeName(rightType);
            if (normalizedLeft !== normalizedRight && !areTypesCompatible(normalizedLeft, normalizedRight) && !areTypesCompatible(normalizedRight, normalizedLeft)) {
                const diag = createDiagnostic(
                    DiagnosticRules.TypeMismatch,
                    { start: doc.positionAt(exprNode.start), end: doc.positionAt(exprNode.end) },
                    leftType, rightType
                );
                diag.message = `Type mismatch in binary expression: Cannot combine '${leftType}' and '${rightType}'`;
                diagnostics.push(diag);
            }
        }
        
        validateBinaryExpression(binExpr.left, doc, scopeManager, diagnostics);
        validateBinaryExpression(binExpr.right, doc, scopeManager, diagnostics);
    } else if (exprNode.kind === SyntaxKind.FunctionCall) {
        const funcNode = exprNode as FunctionCallNode;
        if (funcNode.arguments) {
            for (const arg of funcNode.arguments) {
                validateBinaryExpression(arg, doc, scopeManager, diagnostics);
            }
        }
    }
}

/**
 * Validate Field references (#FieldName) to ensure the field is in scope
 */
export function validateFieldReference(
    fieldNode: import('../core/ast/ast').FieldReferenceNode,
    doc: TextDocument,
    scopeManager: ScopeManager,
    diagnostics: Diagnostic[],
    currentDefinitionScopeId: string
) {
    if (!fieldNode.fieldName || !fieldNode.fieldName.text) return;
    const fieldName = fieldNode.fieldName.text;

    // Use our new getFieldsInScope helper
    // To do this we need a minimal ResolutionContext
    const scope = scopeManager.findDefinitionScope(currentDefinitionScopeId);
    if (!scope) return;

    const inScopeFields = getFieldsInScope({
        state: scopeManager,
        initialScope: scope,
        visitedScopes: new Set()
    }, scopeManager.globalScope, scopeManager.projectScope);

    const isFieldInScope = inScopeFields.some((f: any) => normalizeTypeName(f.name) === normalizeTypeName(fieldName));

    if (!isFieldInScope) {
        const diag = createDiagnostic(
            DiagnosticRules.UnknownFieldReference,
            { start: doc.positionAt(fieldNode.start), end: doc.positionAt(fieldNode.end) },
            fieldName
        );
        diag.message = `Field '${fieldName}' is not in scope for the current definition.`;
        diagnostics.push(diag);
    }
}

export function validateMethodReference(
    node: MethodReferenceNode | ComplexMethodReferenceNode,
    doc: TextDocument,
    scopeManager: ScopeManager,
    diagnostics: Diagnostic[],
    currentDefinitionScopeId: string,
    projectScope?: Set<string>
) {
    let currentSchemaName: string | undefined;

    if ('primaryObject' in node) {
        // ComplexMethodReferenceNode
        currentSchemaName = node.primaryObject.type?.text;
        
        // Also validate the identifier expression
        if (node.primaryObject.identifier) {
            walkAndValidateExpression(node.primaryObject.identifier, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
        }
    } else if (node.objectName) {
        // Reference access
        currentSchemaName = node.objectName.text;
    }

    if (currentSchemaName) {
        let currentSchema = scopeManager.globalScope.schemas?.get(normalizeTypeName(currentSchemaName));
        
        if (!currentSchema) {
            diagnostics.push(createDiagnostic(
                DiagnosticRules.UnknownSchemaWarning,
                { start: doc.positionAt('primaryObject' in node ? node.primaryObject.type.start : node.objectName!.start), end: doc.positionAt('primaryObject' in node ? node.primaryObject.type.end : node.objectName!.end) },
                currentSchemaName
            ));
            return;
        }

        if (node.pathSpecs) {
            for (const spec of node.pathSpecs) {
                const collectionNameText = spec.collectionName.text;
                
                // Validate index access
                let isRepeated = false;
                let prop: any = undefined;
                if (currentSchema.properties) {
                    for (const p of currentSchema.properties.values()) {
                        if (normalizeTypeName(p.Name || (p as any).name) === normalizeTypeName(collectionNameText)) {
                            prop = p;
                            break;
                        }
                    }
                }
                
                if (!prop) {
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.UnknownPropertyWarning,
                        { start: doc.positionAt(spec.collectionName.start), end: doc.positionAt(spec.collectionName.end) },
                        collectionNameText,
                        currentSchema.name
                    ));
                    return; // Stop validating path if broken
                }
                
                isRepeated = !!(prop.IsRepeated || prop.isRepeated);

                if (spec.index && !isRepeated) {
                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.IndexOnNonRepeatedWarning,
                        { start: doc.positionAt(spec.collectionName.start), end: doc.positionAt(spec.collectionName.end) },
                        collectionNameText
                    ));
                }

                if (spec.index) {
                    walkAndValidateExpression(spec.index, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
                }
                if (spec.condition) {
                    walkAndValidateExpression(spec.condition, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
                }

                let nestedSchemaName: string | undefined = undefined;
                if (currentSchema.complexProperties) {
                    for (const [key, val] of currentSchema.complexProperties.entries()) {
                        if (normalizeTypeName(key) === normalizeTypeName(collectionNameText) || 
                            normalizeTypeName(key) === normalizeTypeName(collectionNameText + 'list')) {
                            nestedSchemaName = val;
                            break;
                        }
                    }
                }
                
                if (nestedSchemaName) {
                    currentSchema = scopeManager.globalScope.schemas?.get(normalizeTypeName(nestedSchemaName));
                    if (!currentSchema) {
                        break;
                    }
                }
            }
        }

        if (node.methodName && currentSchema) {
            const methodText = node.methodName.text;
            let prop: any = undefined;
            if (currentSchema.properties) {
                for (const p of currentSchema.properties.values()) {
                    if (normalizeTypeName(p.Name || (p as any).name) === normalizeTypeName(methodText)) {
                        prop = p;
                        break;
                    }
                }
            }
            if (!prop) {
                diagnostics.push(createDiagnostic(
                    DiagnosticRules.UnknownPropertyWarning,
                    { start: doc.positionAt(node.methodName.start), end: doc.positionAt(node.methodName.end) },
                    methodText,
                    currentSchema.name
                ));
            }
        }
    }

    if (('formula' in node) && node.formula) {
        walkAndValidateExpression(node.formula, doc, scopeManager, diagnostics, currentDefinitionScopeId, projectScope);
    }
}
