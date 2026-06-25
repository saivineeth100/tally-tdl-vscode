import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FunctionCallNode, BinaryExpressionNode, Node, SyntaxKind } from "../../parser/ast";
import { normalizeTypeName } from "../utils";
import { areTypesCompatible, inferExpressionType } from "./validationUtils";
import { DiagnosticRules, createDiagnostic } from "../../diagnostics";
import { ScopeManager, getFieldsInScope } from "../scopeManager";
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
        validateFieldReference(node as import("../../parser/ast").FieldReferenceNode, doc, scopeManager, diagnostics, currentDefinitionScopeId);
    } else if (node.kind === SyntaxKind.VariableReference) {
        // Can add variable validation here in the future
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
    fieldNode: import("../../parser/ast").FieldReferenceNode,
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
