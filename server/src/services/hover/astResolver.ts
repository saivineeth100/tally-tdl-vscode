import { DefinitionNode, SyntaxKind, FunctionCallNode } from '../../parser/ast';

/**
 * Find a function call at the given offset using AST traversal
 * @param def Definition node containing the cursor
 * @param offset Cursor offset
 * @returns Function call info if found (function node, param index if inside params)
 */
export function findFunctionCallAtOffset(
    def: DefinitionNode,
    offset: number
): { funcNode: FunctionCallNode; paramIndex: number; onFuncName: boolean } | null {
    // Search through all attributes
    for (const attr of def.attributes) {
        // We skip bounds check on attr to avoid issues with whitespace/newlines
        // reliance on node traversal is safer.

        // Check each value node in the attribute
        for (const valueNode of attr.value) {
            const result = findFunctionInNode(valueNode, offset);
            if (result) return result;
        }
    }
    return null;
}

/**
 * Recursively search for function call at offset within a node
 */
export function findFunctionInNode(
    node: any,
    offset: number
): { funcNode: FunctionCallNode; paramIndex: number; onFuncName: boolean } | null {
    if (!node || offset < node.start || offset > node.end) return null;

    if (node.kind === SyntaxKind.FunctionCall) {
        const funcNode = node as FunctionCallNode;

        // Check if cursor is on the function name
        if (funcNode.functionName &&
            offset >= funcNode.functionName.start &&
            offset <= funcNode.functionName.end) {
            return { funcNode, paramIndex: -1, onFuncName: true };
        }

        // Check if cursor is in one of the arguments
        if (funcNode.arguments) {
            for (let i = 0; i < funcNode.arguments.length; i++) {
                const arg = funcNode.arguments[i];
                // Check if offset is strictly within arg range
                if (offset >= arg.start && offset <= arg.end) {
                    // Recursively check if inside a nested function
                    const nested = findFunctionInNode(arg, offset);
                    if (nested) return nested;

                    // Otherwise, we're on this parameter
                    return { funcNode, paramIndex: i, onFuncName: false };
                }
            }
        }

        // Cursor is inside function call but not on name or specific argument (e.g. typing comma)
        // Find expected parameter index
        return { funcNode, paramIndex: funcNode.arguments ? funcNode.arguments.length : 0, onFuncName: false };
    }

    return null;
}
