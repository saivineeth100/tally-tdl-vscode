import { DefinitionNode, FunctionCallNode } from '../../parser/ast';
import { findFunctionAtOffset, findAttributeAtOffset, findStatementAtOffset } from '../../parser/astQuery';

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
    const attr = findAttributeAtOffset(def, offset);
    if (attr) {
        const result = findFunctionAtOffset(attr.value, offset);
        if (result) return result;
    }
    
    const stmt = findStatementAtOffset(def, offset);
    if (stmt) {
        const result = findFunctionAtOffset(stmt.args, offset);
        if (result) return result;
    }

    return null;
}
