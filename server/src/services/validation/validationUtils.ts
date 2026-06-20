import { normalizeTypeName } from "../utils";
import { SyntaxKind, LiteralNode, FunctionCallNode, BinaryExpressionNode, UnaryExpressionNode, Node } from "../../parser/ast";
import { TokenKind } from "../../parser/tokenKind";
import { ScopeManager } from "../scopeManager";

/**
 * Check if two TDL datatypes are compatible
 * Some types can be used interchangeably or are subsets of others
 */
export function areTypesCompatible(expected: string, actual: string): boolean {
    expected = normalizeTypeName(expected || '');
    actual = normalizeTypeName(actual || '');

    // Same type after normalization
    if (expected === actual) return true;

    // Compatible type pairs (expected -> allowed actuals)
    const compatibleTypes: { [key: string]: string[] } = {
        'string': ['number', 'amount', 'quantity', 'date', 'datetime', 'logical', 'long'],
        'number': ['amount', 'quantity', 'rate', 'long'],
        'datetime': ['date'],
        'date': ['datetime'],
        'long': ['number'],
        'amount': ['number'],
        'quantity': ['number'],
        'button': ['key'],
        'key': ['button'],
    };

    const allowed = compatibleTypes[expected];
    if (allowed && allowed.includes(actual)) {
        return true;
    }

    return false;
}

/**
 * Infer the return type of an expression
 */
export function inferExpressionType(exprNode: Node, scopeManager: ScopeManager): string | undefined {
    if (exprNode.kind === SyntaxKind.Literal) {
        const lit = exprNode as LiteralNode;
        const tk = lit.token?.Kind;
        if (tk === TokenKind.YesToken || tk === TokenKind.NoToken || tk === TokenKind.TrueToken ||
            tk === TokenKind.FalseToken || tk === TokenKind.OnToken || tk === TokenKind.OffToken) {
            return 'Logical';
        }
        return typeof lit.value === 'number' ? 'Number' : 'String';
    }

    if (exprNode.kind === SyntaxKind.FunctionCall) {
        const funcNode = exprNode as FunctionCallNode;
        const funcName = funcNode.functionName?.text;
        if (funcName) {
            const func = scopeManager.globalScope.functions.get(normalizeTypeName(funcName));
            if (func && func.returnType) {
                return func.returnType;
            }
        }
        return undefined;
    }

    // BinaryExpressionNode
    if ('operator' in exprNode && 'left' in exprNode) {
        const binExpr = exprNode as BinaryExpressionNode;
        const opKind = binExpr.operator.Kind;
        // Arithmetic
        if (opKind === TokenKind.PlusToken || opKind === TokenKind.MinusToken || opKind === TokenKind.MultiplyToken || opKind === TokenKind.DivisionToken || opKind === TokenKind.PercentToken) {
            return 'Number';
        }
        // Comparison & Logical & String operators
        if (opKind === TokenKind.EqualsToken || opKind === TokenKind.NotEqualsToken ||
            opKind === TokenKind.LessThanToken || opKind === TokenKind.GreaterThanToken ||
            opKind === TokenKind.LessThanEqualsToken || opKind === TokenKind.GreaterThanEqualsToken ||
            opKind === TokenKind.InToken || opKind === TokenKind.BetweenToken || opKind === TokenKind.NullToken ||
            opKind === TokenKind.AndToken || opKind === TokenKind.OrToken ||
            opKind === TokenKind.ContainsToken || opKind === TokenKind.ContainingToken ||
            opKind === TokenKind.StartingToken || opKind === TokenKind.StartingWithToken ||
            opKind === TokenKind.EndingToken || opKind === TokenKind.EndingWithToken ||
            opKind === TokenKind.LikeToken) {
            return 'Logical';
        }
    }

    // UnaryExpressionNode
    if ('operator' in exprNode && !('left' in exprNode)) {
        const unExpr = exprNode as UnaryExpressionNode;
        const opKind = unExpr.operator.Kind;
        if (opKind === TokenKind.NotToken) {
            return 'Logical';
        }
        if (opKind === TokenKind.MinusToken || opKind === TokenKind.PlusToken) {
            return 'Number';
        }
    }

    return undefined;
}
