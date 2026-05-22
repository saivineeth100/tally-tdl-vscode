import { DefinitionNode, SourceFile, AttributeNode, SyntaxKind, IdentifierNode, FunctionCallNode } from '../parser/ast';
import { Token } from '../parser/token';
import { TdlMetadata, TDLParameter } from '../tdlMetaData';
import { TDLFunction, TDLFunctionParameter } from '../models/tdlFunction';
import { ScopeManager, ScopeKind } from './scopeManager';

/**
 * Get the actual position of a token (excluding leading trivia)
 * @param token Token to get position for
 * @returns Actual character position of the token content
 */
function getActualTokenPosition(token: Token): number {
    let position = token.FullStart;
    // Add up the lengths of all leading trivia
    for (const trivia of token.Leading) {
        position += trivia.Length;
    }
    return position;
}

/**
 * Find the definition that owns the given offset
 * optimized for TDL structure where definitions are sequential blocks
 */
export function getDefinitionAtOffset(sourceFile: SourceFile, offset: number): DefinitionNode | undefined {
    for (let i = 0; i < sourceFile.definitions.length; i++) {
        const def = sourceFile.definitions[i];
        const nextDef = sourceFile.definitions[i + 1];

        // Start of this definition
        const start = def.openBracket?.Start ?? def.start;
        const endLimit = nextDef ? (nextDef.openBracket?.Start ?? nextDef.start) : Number.MAX_SAFE_INTEGER;

        if (offset >= start && offset < endLimit) {
            return def;
        }
    }
    return undefined;
}

export interface HoverResult {
    type: 'definition' | 'attribute' | 'parameter' | 'function' | 'function_parameter';
    content: string;
}

/**
 * Create hover content for a definition
 * @param def Definition node
 * @param scopeManager Optional ScopeManager to resolve scope info
 * @param uri Optional document URI
 * @returns Markdown formatted hover content
 */
export function createHoverContent(def: DefinitionNode, scopeManager?: ScopeManager, uri?: string): string {
    const lines: string[] = [];

    // Header
    const prefix = def.modifier ? '#' : '';
    lines.push(`**${prefix}${def.type.text}**: ${def.name?.text}`);

    // If it's a modifier
    if (def.modifier) {
        lines.push('*Modified Definition*');
    }

    if (scopeManager && uri) {
        const scope = scopeManager.getScopeAt(uri, def.start);
        if (scope) {
            lines.push(`*Scope: ${scope.kind}*`);
        }
    }

    // List attributes (first few)
    if (def.attributes.length > 0) {
        lines.push('');
        lines.push('Attributes:');
        def.attributes.slice(0, 5).forEach(attr => {
            lines.push(`- ${attr.name.text}`);
        });
        if (def.attributes.length > 5) {
            lines.push(`- ... (${def.attributes.length - 5} more)`);
        }
    }

    return lines.join('\n');
}

/**
 * Create hover content for an attribute
 * @param attrDef Attribute definition from metadata
 * @returns Markdown formatted hover content
 */
function createAttributeHover(attrDef: any): string {
    const lines: string[] = [];

    lines.push(`**${attrDef.Name}**`);

    if (attrDef.Description) {
        lines.push('');
        lines.push(attrDef.Description);
    }

    if (attrDef.Type) {
        lines.push('');
        lines.push(`*Type: ${attrDef.Type}*`);
    }

    if (attrDef.Parameters && attrDef.Parameters.length > 0) {
        lines.push('');
        lines.push('**Parameters:**');
        attrDef.Parameters.forEach((param: TDLParameter, idx: number) => {
            const parts: string[] = [];
            if (param.IsMandatory) parts.push('**Required**');
            if (param.DataType) parts.push(`Type: ${param.DataType}`);
            if (param.RefersTo) parts.push(`Refers to: ${param.RefersTo.trim()}`);
            if (param.Keywords) parts.push(`Keywords: ${param.Keywords}`);
            lines.push(`${idx + 1}. ${parts.join(', ') || 'Value'}`);
        });
    }

    if (attrDef.Aliases && attrDef.Aliases !== attrDef.Name) {
        lines.push('');
        lines.push(`*Aliases: ${attrDef.Aliases}*`);
    }

    return lines.join('\n');
}

/**
 * Create hover content for a parameter
 * @param param Parameter definition from metadata
 * @param paramIndex 0-based index of the parameter
 * @returns Markdown formatted hover content
 */
function createParameterHover(param: TDLParameter, paramIndex: number): string {
    const lines: string[] = [];

    lines.push(`**Parameter ${paramIndex + 1}**`);
    lines.push('');

    const infoLines: string[] = [];
    if (param.IsMandatory) {
        infoLines.push('- **Required**');
    } else {
        infoLines.push('- Optional');
    }

    if (param.DataType) {
        infoLines.push(`- Type: \`${param.DataType}\``);
    }

    if (param.RefersTo) {
        infoLines.push(`- Refers to: \`${param.RefersTo.trim()}\` definition`);
    }

    if (param.KeywordSet) {
        infoLines.push(`- Keyword Set: ${param.KeywordSet}`);
    }

    if (param.Keywords) {
        infoLines.push(`- Valid values: ${param.Keywords}`);
    }

    if (param.DataType?.toLowerCase() === 'logical') {
        infoLines.push('- Valid values: `Yes`, `No`');
    }

    lines.push(...infoLines);
    return lines.join('\n');
}

/**
 * Create hover content for a TDL function
 * @param func Function definition from metadata
 * @returns Markdown formatted hover content
 */
function createFunctionHover(func: TDLFunction): string {
    const lines: string[] = [];

    lines.push(`**$$${func.Name}**`);
    lines.push('');

    if (func.Description) {
        lines.push(func.Description);
        lines.push('');
    }

    // Parameter summary
    const mandatory = func.TotalMandatoryParameters;
    const optional = func.TotalParameters - mandatory;
    lines.push(`*Parameters: ${mandatory} mandatory${optional > 0 ? `, ${optional} optional` : ''}*`);

    if (func.ReturnType) {
        lines.push(`*Returns: ${func.ReturnType}*`);
    }

    if (func.Category) {
        lines.push(`*Category: ${func.Category}*`);
    }

    if (func.Mode) {
        lines.push(`*Mode: ${func.Mode}*`);
    }

    // Parameter details
    if (func.Parameters && func.Parameters.length > 0) {
        lines.push('');
        lines.push('**Parameters:**');
        func.Parameters.forEach((param, idx) => {
            const parts: string[] = [];
            if (param.IsMandatory) parts.push('**Required**');
            else parts.push('Optional');
            if (param.DataType) parts.push(`Type: ${param.DataType}`);
            if (param.RefersTo) parts.push(`Refers to: ${param.RefersTo.trim()}`);
            if (param.Keywords) parts.push(`Keywords: ${param.Keywords}`);
            lines.push(`${idx + 1}. ${parts.join(', ') || 'Value'}`);
        });
    }

    return lines.join('\n');
}

/**
 * Create hover content for a function parameter
 * @param param Function parameter definition
 * @param paramIndex 0-based index of the parameter
 * @returns Markdown formatted hover content
 */
function createFunctionParameterHover(param: TDLFunctionParameter, paramIndex: number): string {
    const lines: string[] = [];

    lines.push(`**Parameter ${paramIndex + 1}**`);
    lines.push('');

    const infoLines: string[] = [];
    if (param.IsMandatory) {
        infoLines.push('- **Required**');
    } else {
        infoLines.push('- Optional');
    }

    if (param.DataType) {
        infoLines.push(`- Type: \`${param.DataType}\``);
    }

    if (param.RefersTo) {
        infoLines.push(`- Refers to: \`${param.RefersTo.trim()}\` definition`);
    }

    if (param.KeywordSet) {
        infoLines.push(`- Keyword Set: ${param.KeywordSet}`);
    }

    if (param.Keywords) {
        infoLines.push(`- Valid values: ${param.Keywords}`);
    }

    if (param.DataType?.toLowerCase() === 'logical') {
        infoLines.push('- Valid values: `Yes`, `No`');
    }

    lines.push(...infoLines);
    return lines.join('\n');
}

/**
 * Find a function call at the given offset using AST traversal
 * @param def Definition node containing the cursor
 * @param offset Cursor offset
 * @returns Function call info if found (function node, param index if inside params)
 */
function findFunctionCallAtOffset(
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
function findFunctionInNode(
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
        // Simple logic: if after last arg, index = args.length
        return { funcNode, paramIndex: funcNode.arguments ? funcNode.arguments.length : 0, onFuncName: false };
    }

    // Recurse into other node types if necessary? 
    // Currently only FunctionCallNode contains nested structures we care about for function parsing.

    return null;
}

/**
 * Get comprehensive hover information based on cursor position
 * Uses AST-based detection for all hover types including functions
 * @param sourceFile Parsed source file
 * @param offset Cursor offset
 * @param scopeManager Scope manager for variable resolution
 * @param metadata TDL metadata for attribute lookups
 * @param uri Document URI
 * @returns HoverResult with type and content
 */
export function getHoverInfo(
    sourceFile: SourceFile,
    offset: number,
    metadata?: TdlMetadata,
    scopeManager?: ScopeManager,
    uri?: string
): HoverResult | null {
    // Check for variables/fields anywhere at this offset
    if (scopeManager && uri) {
        const scope = scopeManager.getScopeAt(uri, offset);
        if (scope) {
            // Traverse AST to find identifier at offset
            let foundIdent: IdentifierNode | null = null;
            let foundText = '';
            
            // A simple traversal of definitions and attributes to find the node at offset
            for (const def of sourceFile.definitions) {
                if (offset >= def.start && offset <= def.end) {
                    for (const attr of def.attributes) {
                        if (offset >= attr.start && offset <= attr.end) {
                            for (const val of attr.value) {
                                if (val.kind === SyntaxKind.Identifier && offset >= val.start && offset <= val.end) {
                                    foundIdent = val as IdentifierNode;
                                    foundText = foundIdent.text;
                                } else if (val.kind === SyntaxKind.FunctionCall) {
                                    const fn = val as FunctionCallNode;
                                    for (const arg of fn.arguments) {
                                        if (arg.kind === SyntaxKind.Identifier && offset >= arg.start && offset <= arg.end) {
                                            foundIdent = arg as IdentifierNode;
                                            foundText = foundIdent.text;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (def.statements) {
                        for (const stmt of def.statements) {
                            if (offset >= stmt.start && offset <= stmt.end) {
                                for (const arg of stmt.args) {
                                    if (arg.kind === SyntaxKind.Identifier && offset >= arg.start && offset <= arg.end) {
                                        foundIdent = arg as IdentifierNode;
                                        foundText = foundIdent.text;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            if (foundText.startsWith('##') || foundText.startsWith('#')) {
                const varName = foundText.replace(/^##?/, '');
                const resolved = scopeManager.resolve(varName, scope);
                if (resolved) {
                    return {
                        type: 'attribute', // generic
                        content: `**${foundText}**\n\n*Type: ${resolved.definitionType}*\n*Scope: ${resolved.uri === uri ? 'Local/Project' : 'Global'}*\n*Source: ${resolved.uri}*`
                    };
                } else {
                    return {
                        type: 'attribute',
                        content: `**${foundText}**\n\n*Unknown variable/field*`
                    };
                }
            }
        }
    }

    // Find definition at offset
    const def = getDefinitionAtOffset(sourceFile, offset);
    if (!def) {
        return null;
    }

    // Check for function calls first using AST
    if (metadata) {
        const funcInfo = findFunctionCallAtOffset(def, offset);
        if (funcInfo) {
            const funcName = funcInfo.funcNode.functionName?.text;
            if (funcName) {
                const func = metadata.functions.find(f => f.Name.toLowerCase() === funcName.toLowerCase());
                if (func) {
                    // On function name - show function hover
                    if (funcInfo.onFuncName) {
                        return {
                            type: 'function',
                            content: createFunctionHover(func)
                        };
                    }
                    // On function parameter - show parameter hover
                    // Check bounds just in case
                    if (funcInfo.paramIndex >= 0 && func.Parameters) {
                        // Some logic to handle var args or index bounds
                        const paramDef = func.Parameters[funcInfo.paramIndex] || (func.Parameters.length > 0 ? func.Parameters[func.Parameters.length - 1] : undefined);

                        if (paramDef) {
                            return {
                                type: 'function_parameter',
                                content: createFunctionParameterHover(paramDef, funcInfo.paramIndex)
                            };
                        }
                    }
                }
            }
        }
    }

    // Check if on definition header (within open and close brackets)
    const defStart = def.start;
    // const openBracketEnd = def.openBracket.FullStart + def.openBracket.Length;
    const closeBracketStart = def.closeBracket.Start;

    // Logic: if offset is before body starts?
    // def.openBracket is guaranteed to exist for valid defs
    if (offset >= def.openBracket.Start && offset <= (def.closeBracket.Start + def.closeBracket.Length)) {
        // It might be on attribute if attribute is inside? (Not possible in TDL syntax usually)
        // But wait, attributes follow the header.

        // If we are strictly on the header line?
        if (offset <= (def.closeBracket.Start + def.closeBracket.Length)) {
            return {
                type: 'definition',
                content: createHoverContent(def, scopeManager, uri)
            };
        }
    }


    // Check attributes
    for (const attr of def.attributes) {
        if (offset >= attr.start && offset <= attr.end) {
            // Check if on attribute name (before colon)
            if (offset < attr.colon.Start) {
                // On attribute name - show attribute info
                if (metadata) {
                    const attrDef = metadata.findDefinition(attr.name.text, def.type.text);
                    if (attrDef) {
                        return {
                            type: 'attribute',
                            content: createAttributeHover(attrDef)
                        };
                    }
                }
                // Fallback if no metadata
                return {
                    type: 'attribute',
                    content: `**${attr.name.text}**\n\nTDL attribute`
                };
            }

            // Check if on a parameter value (Attribute Parameter)
            for (let i = 0; i < attr.value.length; i++) {
                const value = attr.value[i];
                if (offset >= value.start && offset <= value.end) {
                    // On parameter value - show parameter info
                    if (metadata) {
                        const attrDef = metadata.findDefinition(attr.name.text, def.type.text);
                        if (attrDef && attrDef.Parameters && attrDef.Parameters[i]) {
                            return {
                                type: 'parameter',
                                content: createParameterHover(attrDef.Parameters[i], i)
                            };
                        }
                    }
                    break;
                }
            }

            // If we are here, we are on attribute but not on specific value (e.g. whitespace)
            if (metadata) {
                const attrDef = metadata.findDefinition(attr.name.text, def.type.text);
                if (attrDef) {
                    return {
                        type: 'attribute',
                        content: createAttributeHover(attrDef)
                    };
                }
            }
        }
    }

    // Check statements
    if (def.statements) {
        let foundHover: HoverResult | null = null;
        const checkStatement = (stmt: any) => {
            if (foundHover) return;
            if (offset >= stmt.start && offset <= stmt.end) {
                if (stmt.action && offset >= stmt.action.start && offset <= stmt.action.end) {
                    if (metadata) {
                        const actionName = stmt.action.text;
                        const actionDef = metadata.actions.find(a => 
                            a.Name.toLowerCase() === actionName.toLowerCase() || 
                            (a.Aliases && a.Aliases.toLowerCase().split(',').map(al => al.trim()).includes(actionName.toLowerCase()))
                        );
                        if (actionDef) {
                            let content = `**${actionDef.Name}**\n\n${actionDef.Description || ''}`;
                            if (actionDef.Aliases) content += `\n\n*Aliases: ${actionDef.Aliases}*`;
                            foundHover = { type: 'attribute', content };
                            return;
                        }
                    }
                }
                if (stmt.statements) {
                    for (const s of stmt.statements) checkStatement(s);
                }
                if (stmt.elseStatements) {
                    for (const s of stmt.elseStatements) checkStatement(s);
                }
                if (stmt.endStatement) checkStatement(stmt.endStatement);
            }
        };
        for (const stmt of def.statements) {
            checkStatement(stmt);
            if (foundHover) return foundHover;
        }
    }

    // Default: on definition
    return {
        type: 'definition',
        content: createHoverContent(def, scopeManager, uri)
    };
}
