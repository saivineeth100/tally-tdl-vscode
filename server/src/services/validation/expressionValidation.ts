import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FunctionCallNode, BinaryExpressionNode, Node, SyntaxKind } from "../../parser/ast";
import { TdlMetadata } from "../../tdlMetaData";
import { normalizeTypeName } from "../utils";
import { areTypesCompatible, inferExpressionType } from "./validationUtils";
import { DiagnosticRules, createDiagnostic } from "../../diagnostics";

/**
 * Recursively validate function calls - checks return type and validates nested function arguments
 * @param funcNode The function call AST node to validate
 * @param expectedType The expected return type (if any)
 * @param doc The text document for position calculation
 * @param metadata TDL metadata containing function definitions
 * @param diagnostics Array to push diagnostics into
 */
export function validateFunctionCall(
    funcNode: FunctionCallNode,
    expectedType: string | undefined,
    doc: TextDocument,
    metadata: TdlMetadata,
    diagnostics: Diagnostic[]
): void {
    const funcName = funcNode.functionName?.text;
    if (!funcName) return;

    const func = metadata.functions.find(f => f.Name.toLowerCase() === funcName.toLowerCase());
    if (!func) return;

    // 1. Validate return type if expected type is provided
    if (expectedType && func.ReturnType) {
        const normalizedExpected = normalizeTypeName(expectedType);
        const normalizedReturn = normalizeTypeName(func.ReturnType);

        if (normalizedExpected !== normalizedReturn && !areTypesCompatible(normalizedExpected, normalizedReturn)) {
            const diag = createDiagnostic(
                DiagnosticRules.TypeMismatch,
                { start: doc.positionAt(funcNode.start), end: doc.positionAt(funcNode.end) },
                expectedType, func.ReturnType
            );
            diag.message = `Function '$$${funcName}' returns '${func.ReturnType}' but expected '${expectedType}'`;
            diagnostics.push(diag);
        }
    }

    // 2. Recursively validate function arguments
    if (funcNode.arguments && func.Parameters) {
        for (let i = 0; i < funcNode.arguments.length; i++) {
            const argNode = funcNode.arguments[i];
            const paramDef = func.Parameters[i];

            if (!paramDef) continue;

            // If argument is a nested function call, recursively validate
            if (argNode.kind === SyntaxKind.FunctionCall) {
                validateFunctionCall(
                    argNode as FunctionCallNode,
                    paramDef.DataType,
                    doc,
                    metadata,
                    diagnostics
                );
            }
        }
    }
}

/**
 * Validate binary expressions for type compatibility
 */
export function validateBinaryExpression(
    exprNode: Node,
    doc: TextDocument,
    metadata: TdlMetadata,
    diagnostics: Diagnostic[]
) {
    if (exprNode.kind === SyntaxKind.Statement && 'operator' in exprNode && 'left' in exprNode && 'right' in exprNode) {
        const binExpr = exprNode as BinaryExpressionNode;
        const leftType = inferExpressionType(binExpr.left, metadata);
        const rightType = inferExpressionType(binExpr.right, metadata);
        
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
        
        validateBinaryExpression(binExpr.left, doc, metadata, diagnostics);
        validateBinaryExpression(binExpr.right, doc, metadata, diagnostics);
    } else if (exprNode.kind === SyntaxKind.FunctionCall) {
        const funcNode = exprNode as FunctionCallNode;
        if (funcNode.arguments) {
            for (const arg of funcNode.arguments) {
                validateBinaryExpression(arg, doc, metadata, diagnostics);
            }
        }
    }
}
