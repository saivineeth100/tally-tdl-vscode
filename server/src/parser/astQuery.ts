import { SourceFile, DefinitionNode, AttributeNode, Node, SyntaxKind, StatementNode, FunctionCallNode } from './ast';

/**
 * Find the definition containing the given offset.
 * Uses binary search on definition start offsets for O(log n) performance.
 */
export function findDefinitionAtOffset(sourceFile: SourceFile, offset: number): DefinitionNode | undefined {
    const defs = sourceFile.definitions;
    if (defs.length === 0) return undefined;
    
    let low = 0, high = defs.length - 1;
    let result: DefinitionNode | undefined;
    
    while (low <= high) {
        const mid = (low + high) >>> 1;
        if (defs[mid].start <= offset) {
            if (defs[mid].end >= offset) result = defs[mid];
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return result;
}

/**
 * Find the attribute containing the given offset within a definition.
 */
export function findAttributeAtOffset(def: DefinitionNode, offset: number): AttributeNode | undefined {
    return def.attributes.find(a => offset >= a.start && offset <= a.end);
}

/**
 * Find the statement containing the given offset within a definition.
 * Recursively searches nested block statements.
 */
export function findStatementAtOffset(def: DefinitionNode, offset: number): StatementNode | undefined {
    if (!def.statements) return undefined;
    
    function search(stmts: StatementNode[]): StatementNode | undefined {
        for (const stmt of stmts) {
            if (offset >= stmt.start && offset <= stmt.end) {
                if ('statements' in stmt) {
                    const blockStmt = stmt as any;
                    if (blockStmt.statements) {
                        const inner = search(blockStmt.statements);
                        if (inner) return inner;
                    }
                }
                return stmt;
            }
        }
        return undefined;
    }
    
    return search(def.statements);
}

/**
 * Find the deepest AST node at the given offset.
 * Recursively traverses function arguments, binary expressions, etc.
 */
export function findNodeAtOffset(nodes: Node[], offset: number): Node | undefined {
    for (const node of nodes) {
        if (offset < node.start || offset > node.end) continue;
        
        // Recurse into children based on kind
        if (node.kind === SyntaxKind.FunctionCall) {
            const func = node as FunctionCallNode;
            const deeper = findNodeAtOffset(func.arguments || [], offset);
            if (deeper) return deeper;
            // Check function name
            if (func.functionName && offset >= func.functionName.start && offset <= func.functionName.end) {
                return func.functionName;
            }
        }
        
        if (node.kind === SyntaxKind.List) {
            const list = node as any;
            if (list.values) {
                const deeper = findNodeAtOffset(list.values, offset);
                if (deeper) return deeper;
            }
        }
        
        return node;
    }
    return undefined;
}

/**
 * Find function call at offset, including parameter index.
 * Recursively searches nested function calls.
 */
export function findFunctionAtOffset(
    nodes: Node[], 
    offset: number
): { funcNode: FunctionCallNode, paramIndex: number, onFuncName: boolean } | undefined {
    for (const node of nodes) {
        if (offset < node.start || offset > node.end) continue;
        
        if (node.kind === SyntaxKind.FunctionCall) {
            const func = node as FunctionCallNode;
            
            // Check nested function calls first
            for (let i = 0; i < (func.arguments?.length ?? 0); i++) {
                const arg = func.arguments![i];
                if (offset >= arg.start && offset <= arg.end) {
                    const deeper = findFunctionAtOffset([arg], offset);
                    if (deeper) return deeper;
                    return { funcNode: func, paramIndex: i, onFuncName: false };
                }
            }
            
            const onName = func.functionName && 
                           offset >= func.functionName.start && 
                           offset <= func.functionName.end;
            return { funcNode: func, paramIndex: -1, onFuncName: !!onName };
        }
    }
    return undefined;
}

/**
 * Walk all nodes in an AST tree, calling visitor for each.
 */
export function walkAST(
    sourceFile: SourceFile, 
    visitor: (node: Node, parent?: Node, def?: DefinitionNode) => void
): void {
    function walkNode(n: Node, parent: Node | undefined, def: DefinitionNode | undefined) {
        visitor(n, parent, def);
        if (n.kind === SyntaxKind.FunctionCall) {
            const func = n as FunctionCallNode;
            if (func.functionName) walkNode(func.functionName, n, def);
            for (const arg of func.arguments || []) walkNode(arg, n, def);
        } else if (n.kind === SyntaxKind.List) {
            for (const val of (n as any).values || []) walkNode(val, n, def);
        } else if (n.kind === SyntaxKind.BinaryExpression) {
            const bin = n as any;
            if (bin.left) walkNode(bin.left, n, def);
            if (bin.right) walkNode(bin.right, n, def);
        } else if (n.kind === SyntaxKind.UnaryExpression) {
            const un = n as any;
            if (un.right) walkNode(un.right, n, def);
        } else if (n.kind === SyntaxKind.VariableReference) {
            const v = n as any;
            if (v.variableName) walkNode(v.variableName, n, def);
        }
    }

    function walkStatement(stmt: StatementNode, parent: Node | undefined, def: DefinitionNode | undefined) {
        visitor(stmt as any, parent, def);
        if (stmt.action) walkNode(stmt.action, stmt as any, def);
        for (const arg of stmt.args || []) walkNode(arg, stmt as any, def);
        if ('statements' in stmt) {
            for (const inner of (stmt as any).statements || []) walkStatement(inner, stmt as any, def);
        }
    }

    for (const def of sourceFile.definitions) {
        visitor(def as any, undefined, def as any);
        if (def.type) visitor(def.type, def as any, def as any);
        if (def.name) visitor(def.name, def as any, def as any);
        if (def.modifier) visitor(def.modifier as any, def as any, def as any);

        for (const attr of def.attributes) {
            visitor(attr as any, def as any, def as any);
            if (attr.name) visitor(attr.name, attr as any, def as any);
            for (const val of attr.value) {
                walkNode(val, attr as any, def as any);
            }
        }
        if (def.statements) {
            for (const stmt of def.statements) {
                walkStatement(stmt, def as any, def as any);
            }
        }
    }
}
