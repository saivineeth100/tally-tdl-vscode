import {
    SemanticTokenTypes,
    SemanticTokensBuilder,
    SemanticTokensLegend,
    SemanticTokens
} from 'vscode-languageserver';
import {
    SourceFile,
    FunctionCallNode,
    IdentifierNode,
    VariableReferenceNode,
    FormulaReferenceNode,
    ListNode,
    LiteralNode,
    SyntaxKind
} from '../../parser/ast';
import { TokenKind } from '../../parser/tokenKind';
import { ScopeManager, getSemanticTypeFromSymbol } from '../scopeManager';
import { normalizeTypeName } from '../utils';
import { SymbolKind, SymbolTable } from '../symbolTable';

export interface SemanticToken {
    line: number;
    startChar: number; // This holds the ABSOLUTE OFFSET from the start of the file
    length: number;
    type: string;
    modifiers?: string[];
    text?: string;
}

// Define the legend used by the server
export const TDL_SEMANTIC_TOKENS_LEGEND: SemanticTokensLegend = {
    tokenTypes: [
        SemanticTokenTypes.class,     // 0
        SemanticTokenTypes.property,  // 1
        SemanticTokenTypes.function,  // 2
        SemanticTokenTypes.variable,  // 3
        SemanticTokenTypes.macro,     // 4
        SemanticTokenTypes.number,    // 5
        SemanticTokenTypes.string,    // 6
        SemanticTokenTypes.keyword,   // 7
        SemanticTokenTypes.operator,  // 8
        SemanticTokenTypes.comment,   // 9
        SemanticTokenTypes.type       // 10
    ],
    tokenModifiers: []
};

// Map string types to indices in the legend
const TOKEN_TYPE_MAP: Record<string, number> = {
    [SemanticTokenTypes.class]: 0,
    [SemanticTokenTypes.property]: 1,
    [SemanticTokenTypes.function]: 2,
    [SemanticTokenTypes.variable]: 3,
    [SemanticTokenTypes.macro]: 4,
    [SemanticTokenTypes.number]: 5,
    [SemanticTokenTypes.string]: 6,
    [SemanticTokenTypes.keyword]: 7,
    [SemanticTokenTypes.operator]: 8,
    [SemanticTokenTypes.comment]: 9,
    [SemanticTokenTypes.type]: 10
};

/**
 * Map SymbolKind to SemanticTokenTypes
 */
function symbolKindToTokenType(kind: SymbolKind): string {
    switch (kind) {
        case SymbolKind.Report:
        case SymbolKind.Form:
        case SymbolKind.Part:
        case SymbolKind.Line:
        case SymbolKind.Field:
        case SymbolKind.Menu:
        case SymbolKind.Collection:
        case SymbolKind.Button:
        case SymbolKind.Key:
        case SymbolKind.Border:
        case SymbolKind.Style:
        case SymbolKind.Color:
        case SymbolKind.Object: // Generic object
            return SemanticTokenTypes.class; // Or type
        case SymbolKind.Function:
            return SemanticTokenTypes.function;
        case SymbolKind.Variable:
            return SemanticTokenTypes.variable;
        default:
            return SemanticTokenTypes.variable; // Default fallback
    }
}

// Define local interface for Metadata Context
export interface TdlMetadataContext {
    findDefinition(name: string): { Name: string; Parameters?: { RefersTo?: string; DataType?: string; IsList?: boolean }[] } | undefined;
    findFunction(name: string): { Name: string; Parameters?: { RefersTo?: string; DataType?: string; IsList?: boolean }[] } | undefined;
    existingDefinitions?: Map<string, string[]>;
    definitions?: Map<string, any[]>;
}


// Helper mapping for RefersTo/DataType to SemanticTokenTypes
function mapMetaTypeToToken(refersTo?: string, dataType?: string, metadata?: TdlMetadataContext): string | undefined {
    if (refersTo) {
        refersTo = normalizeTypeName(refersTo);
        // Use metadata to check if it's a valid definition type
        if (metadata && metadata.definitions) {
            // Check if refersTo is a key in the definitions map (e.g., "Report", "Collection")
            // Keys are usually preserved case, so we might need case-insensitive check 
            // OR normalize if map uses normalized keys.
            // Based on tdlMetaData.ts, keys match file names (e.g. "Collection").
            // We can iterate or check specific cases. TDL is case-insensitive.

            // Let's assume exact match or normalized check. 
            // Ideally tdlMetaData should expose `hasDefinitionType(type)`.
            // But we can check keys.

            for (const key of metadata.definitions.keys()) {
                if (key.toLowerCase() === refersTo) {
                    return SemanticTokenTypes.class;
                }
            }
        }

        // If refers to Function?
        if (refersTo === 'Function') return SemanticTokenTypes.function;
    }

    if (dataType) {
        if (dataType === 'String') return SemanticTokenTypes.string;
    }
    return undefined;
}


// Map attribute names to expected token types for their values
const ATTRIBUTE_CONTEXT: Record<string, string> = {
    'Collection': SemanticTokenTypes.class,
    'Collections': SemanticTokenTypes.class,
    'Part': SemanticTokenTypes.class,
    'Parts': SemanticTokenTypes.class,
    'Line': SemanticTokenTypes.class,
    'Lines': SemanticTokenTypes.class,
    'Field': SemanticTokenTypes.class,
    'Fields': SemanticTokenTypes.class,
    'Form': SemanticTokenTypes.class,
    'Forms': SemanticTokenTypes.class,
    'Report': SemanticTokenTypes.class,
    'Reports': SemanticTokenTypes.class,
    'Menu': SemanticTokenTypes.class,
    'Menus': SemanticTokenTypes.class,
    'Button': SemanticTokenTypes.class,
    'Buttons': SemanticTokenTypes.class,
    'Key': SemanticTokenTypes.class,
    'Keys': SemanticTokenTypes.class,
    'System': SemanticTokenTypes.class,
    'Object': SemanticTokenTypes.class,
    'Objects': SemanticTokenTypes.class,
    // Flexible types
    'Type': SemanticTokenTypes.keyword,
    'Mode': SemanticTokenTypes.keyword
};

// Map function names to expected token types for their arguments (by index)
const FUNCTION_PARAMETER_CONTEXT: Record<string, string[]> = {
    'CollectionField': [SemanticTokenTypes.class, SemanticTokenTypes.class], // Field, Collection
    'SysName': [SemanticTokenTypes.class] // System Name
};


/**
 * Provide semantic tokens for LSP request
 */
export function provideSemanticTokens(sourceFile: SourceFile, doc: any, scopeManager?: ScopeManager, metadata?: TdlMetadataContext): SemanticTokens {
    const tokens = getSemanticTokens(sourceFile, scopeManager, doc.uri, metadata); // Assuming Doc has URI, or pass explicitly
    const builder = new SemanticTokensBuilder();

    tokens.sort((a, b) => a.startChar - b.startChar);

    for (const token of tokens) {
        const startPos = doc.positionAt(token.startChar);
        const endPos = doc.positionAt(token.startChar + token.length);
        const typeIdx = TOKEN_TYPE_MAP[token.type] ?? 0;

        if (startPos.line === endPos.line) {
            // Single line token
            builder.push(
                startPos.line,
                startPos.character,
                token.length,
                typeIdx,
                0 // modifiers
            );
        } else {
            // Multiline token - split into multiple tokens
            // Iterate lines
            for (let line = startPos.line; line <= endPos.line; line++) {
                // Let's use sourceFile.lineOffsets if available.
                // Assuming sourceFile has lineOffsets populated by parser.
                const lineOffsets = (sourceFile as any).lineOffsets;
                let lineStartOffset = 0;
                let lineEndOffset = 0;

                if (lineOffsets && line < lineOffsets.length) {
                    lineStartOffset = lineOffsets[line];
                    if (line < lineOffsets.length - 1) {
                        lineEndOffset = lineOffsets[line + 1] - 1; // Exclude \n
                    } else {
                        lineEndOffset = (sourceFile as any).end || (token.startChar + token.length + 100);
                    }
                } else {
                    // Fallback if no lineOffsets
                    // Use doc logic?
                    const p = doc.positionAt(token.startChar); // Just to verify loop integrity
                    // Actually if we lack lineOffsets, splitting is hard.
                    // But Parser DOES provide it.
                    continue;
                }

                const tokenStart = token.startChar;
                const tokenEnd = token.startChar + token.length;

                const intersectionStart = Math.max(tokenStart, lineStartOffset);
                const intersectionEnd = Math.min(tokenEnd, lineEndOffset);

                // Usually we want to highlight until the end of the line including newline?
                // Or just content.
                // Using intersectionEnd calculated above is usually safest (excludes newline).
                // But for comments, maybe newline is irrelevant.

                const nextLineStart = (lineOffsets && line < lineOffsets.length - 1)
                    ? lineOffsets[line + 1]
                    : ((sourceFile as any).end || tokenEnd) + 1;

                const effectiveTokenEnd = Math.min(tokenEnd, nextLineStart);

                const pos = doc.positionAt(intersectionStart);
                const len = effectiveTokenEnd - intersectionStart;

                if (len > 0) {
                    builder.push(
                        pos.line,
                        pos.character,
                        len,
                        typeIdx,
                        0
                    );
                }
            }
        }
    }

    return builder.build();
}

/**
 * Generates semantic tokens from a parsed TDL source file
 */
export function getSemanticTokens(sourceFile: SourceFile, scopeManager?: ScopeManager, uri?: string, metadata?: TdlMetadataContext): SemanticToken[] {
    const tokens: SemanticToken[] = [];

    // 1. Tokenize Comments (Global)
    for (const comment of sourceFile.comments) {
        tokens.push({
            line: 0,
            startChar: comment.start,
            length: comment.end - comment.start,
            type: SemanticTokenTypes.comment,
            text: comment.text
        });
    }

    // 2. Tokenize Definitions
    for (const def of sourceFile.definitions) {
        if (def.type) {
            tokens.push({
                line: 0,
                startChar: def.type.start,
                length: def.type.end - def.type.start,
                type: SemanticTokenTypes.function,
                text: def.type.text
            });
        }
        if (def.closeType) {
            tokens.push({
                line: 0,
                startChar: def.closeType.start,
                length: def.closeType.end - def.closeType.start,
                type: SemanticTokenTypes.function,
                text: def.closeType.text
            });
        }
        if (def.name) {
            let tokenType = SemanticTokenTypes.class;
            if (def.type && (def.type.text.trim().toLowerCase() === 'include' || def.type.text.trim().toLowerCase() === 'import')) {
                tokenType = SemanticTokenTypes.string;
            }
            
            tokens.push({
                line: 0,
                startChar: def.name.start,
                length: def.name.end - def.name.start,
                type: tokenType,
                text: def.name.text
            });
        }
        traverseAttributes(def.attributes, tokens, scopeManager, uri, metadata);
        if (def.complexObjects) {
            traverseComplexObjects(def.complexObjects, tokens, scopeManager, uri, metadata);
        }

        if (def.statements) {
            for (const stmt of def.statements) {
                traverseStatement(stmt, tokens, scopeManager, uri, metadata);
            }
        }
    }
    return tokens;
}

function traverseAttributes(attributes: any[], tokens: SemanticToken[], scopeManager?: ScopeManager, uri?: string, metadata?: TdlMetadataContext) {
    for (const attr of attributes) {
        let expectedType: string | undefined;

        if (attr.name) {
            tokens.push({
                line: 0,
                startChar: attr.name.start,
                length: attr.name.end - attr.name.start,
                type: SemanticTokenTypes.property,
                text: attr.name.text
            });

            // Determine context for values
            if (metadata) {
                const defMeta = metadata.findDefinition(attr.name.text);
                if (defMeta && defMeta.Parameters && defMeta.Parameters.length > 0) {
                    const param = defMeta.Parameters[0];
                    expectedType = mapMetaTypeToToken(param.RefersTo, param.DataType, metadata);
                }
            }

            if (!expectedType) {
                const key = Object.keys(ATTRIBUTE_CONTEXT).find(k => k.toLowerCase() === attr.name.text.toLowerCase());
                if (key) expectedType = ATTRIBUTE_CONTEXT[key];
            }
        }
        
        if (attr.closeName) {
            tokens.push({
                line: 0,
                startChar: attr.closeName.start,
                length: attr.closeName.end - attr.closeName.start,
                type: SemanticTokenTypes.property,
                text: attr.closeName.text
            });
        }

        if (attr.value) {
            for (let i = 0; i < attr.value.length; i++) {
                let argExpectedType = expectedType;
                if (metadata && attr.name) {
                    const defMeta = metadata.findDefinition(attr.name.text);
                    if (defMeta && defMeta.Parameters) {
                        if (i < defMeta.Parameters.length) {
                            const p = defMeta.Parameters[i];
                            argExpectedType = mapMetaTypeToToken(p.RefersTo, p.DataType, metadata);
                        } else if (defMeta.Parameters.length > 0 && defMeta.Parameters[defMeta.Parameters.length - 1].IsList) {
                            const p = defMeta.Parameters[defMeta.Parameters.length - 1];
                            argExpectedType = mapMetaTypeToToken(p.RefersTo, p.DataType, metadata);
                        }
                    }
                }
                traverseNode(attr.value[i], tokens, scopeManager, uri, argExpectedType, metadata);
            }
        }
    }
}

function traverseComplexObjects(complexObjects: any[], tokens: SemanticToken[], scopeManager?: ScopeManager, uri?: string, metadata?: TdlMetadataContext) {
    if (!complexObjects) return;
    for (const obj of complexObjects) {
        if (obj.name) {
            tokens.push({
                line: 0,
                startChar: obj.name.start,
                length: obj.name.end - obj.name.start,
                type: SemanticTokenTypes.class,
                text: obj.name.text
            });
        }
        if (obj.closeName) {
            tokens.push({
                line: 0,
                startChar: obj.closeName.start,
                length: obj.closeName.end - obj.closeName.start,
                type: SemanticTokenTypes.class,
                text: obj.closeName.text
            });
        }
        
        if (obj.attributes) {
            traverseAttributes(obj.attributes, tokens, scopeManager, uri, metadata);
        }
        
        if (obj.complexObjects) {
            traverseComplexObjects(obj.complexObjects, tokens, scopeManager, uri, metadata);
        }
    }
}

/**
 * Traverse a statement node and collect semantic tokens
 */
function traverseStatement(stmt: any, tokens: SemanticToken[], scopeManager?: ScopeManager, uri?: string, metadata?: TdlMetadataContext) {
    if (!stmt) return;

    if (stmt.label) {
        tokens.push({
            line: 0,
            startChar: stmt.label.start,
            length: stmt.label.end - stmt.label.start,
            type: SemanticTokenTypes.number,
            text: stmt.label.text || String(stmt.label.value)
        });
    }

    if (stmt.action) {
        tokens.push({
            line: 0,
            startChar: stmt.action.start,
            length: stmt.action.end - stmt.action.start,
            type: SemanticTokenTypes.keyword,
            text: stmt.action.text
        });
    }

    if (stmt.args) {
        for (const arg of stmt.args) {
            traverseNode(arg, tokens, scopeManager, uri, undefined, metadata);
        }
    }

    if (stmt.statements) {
        for (const s of stmt.statements) {
            traverseStatement(s, tokens, scopeManager, uri, metadata);
        }
    }

    if (stmt.elseStatements) {
        for (const s of stmt.elseStatements) {
            traverseStatement(s, tokens, scopeManager, uri, metadata);
        }
    }

    if (stmt.endStatement) {
        traverseStatement(stmt.endStatement, tokens, scopeManager, uri, metadata);
    }
}

/**
 * Helper function to check if a string is a TDL keyword.
 */
function isKeyword(node: IdentifierNode): boolean {
    // Check text for common keywords that might be parsed as identifiers
    if (['Yes', 'No', 'True', 'False', 'On', 'Off'].includes(node.text)) return true;

    if (!node.tokens || node.tokens.length === 0) return false;
    const firstToken = node.tokens[0];
    const contextKeywords = [
        TokenKind.YesToken, TokenKind.NoToken,
        TokenKind.TrueToken, TokenKind.FalseToken,
        TokenKind.OnToken, TokenKind.OffToken,
        TokenKind.AndToken, TokenKind.OrToken, TokenKind.NotToken,
        TokenKind.InToken, TokenKind.NullToken
    ];
    // ... remove invalid additions ...
    const validKinds = [
        TokenKind.YesToken, TokenKind.NoToken,
        TokenKind.TrueToken, TokenKind.FalseToken,
        TokenKind.OnToken, TokenKind.OffToken,
        TokenKind.AndToken, TokenKind.OrToken, TokenKind.NotToken,
        TokenKind.InToken, TokenKind.NullToken,
        TokenKind.BetweenToken, TokenKind.ContainsToken, TokenKind.ContainingToken,
        TokenKind.StartingToken, TokenKind.StartingWithToken,
        TokenKind.EndingToken, TokenKind.EndingWithToken, TokenKind.LikeToken
    ];
    return validKinds.includes(firstToken.Kind);
}

/**
 * Helper function to create a keyword token.
 */
function keywordToken(node: IdentifierNode): SemanticToken {
    return {
        line: 0,
        startChar: node.start,
        length: node.end - node.start,
        type: SemanticTokenTypes.keyword,
        text: node.text
    };
}

/**
 * Traverse AST node and collect semantic tokens
 */
function traverseNode(node: any, tokens: SemanticToken[], scopeManager?: ScopeManager, uri?: string, expectedType?: string, metadata?: TdlMetadataContext) {
    if (!node) return;

    // Handle Identifiers (potential references)
    if (node.kind === SyntaxKind.Identifier) {
        const idNode = node as IdentifierNode;

        // 1. Keyword Highlighting
        if (isKeyword(idNode)) {
            tokens.push(keywordToken(idNode));
            return;
        }

        // 2. Scope Resolution (if available)
        if (scopeManager && uri) {
            const scope = scopeManager.getScopeAt(uri, idNode.start);
            if (scope) {
                const symbol = scopeManager.resolve(idNode.text, scope);
                if (symbol) {
                    const tokenType = getSemanticTypeFromSymbol(symbol);
                    tokens.push({
                        line: 0,
                        startChar: idNode.start,
                        length: idNode.end - idNode.start,
                        type: tokenType,
                        text: idNode.text
                    });
                    return;
                }
            }
        }

        // 3. Fallback: Use Context (expectedType) if available, otherwise Variable
        tokens.push({
            line: 0,
            startChar: idNode.start,
            length: idNode.end - idNode.start,
            type: expectedType || SemanticTokenTypes.variable,
            text: idNode.text
        });
    }
    // Handle Specific Note Types
    else if (node.kind === SyntaxKind.FunctionCall) {
        const funcNode = node as FunctionCallNode;
        if (funcNode.functionName) {
            tokens.push({
                line: 0,
                startChar: funcNode.functionName.start,
                length: funcNode.functionName.end - funcNode.functionName.start,
                type: SemanticTokenTypes.function,
                text: funcNode.functionName.text
            });
        }
        if (funcNode.arguments) {
            // Determine parameter contexts if function is known
            let paramContexts: string[] | undefined;
            if (metadata && funcNode.functionName) {
                const funcName = funcNode.functionName.text.replace(/^\$\$/, '');
                const funcMeta = metadata.findFunction(funcName);
                if (funcMeta && funcMeta.Parameters) {
                    paramContexts = funcMeta.Parameters.map(p => mapMetaTypeToToken(p.RefersTo, p.DataType, metadata) || SemanticTokenTypes.variable);
                }
            }

            if (!paramContexts && funcNode.functionName) {
                const funcName = funcNode.functionName.text.replace(/^\$\$/, '');
                paramContexts = FUNCTION_PARAMETER_CONTEXT[funcName];
            }

            for (let i = 0; i < funcNode.arguments.length; i++) {
                const arg = funcNode.arguments[i];
                // Use index, or last if varargs/list
                const argExpectedType = paramContexts ? paramContexts[Math.min(i, paramContexts.length - 1)] : undefined;
                traverseNode(arg, tokens, scopeManager, uri, argExpectedType, metadata);
            }
        }
    } else if (node.kind === SyntaxKind.VariableReference) {
        const varNode = node as VariableReferenceNode;
        if (varNode.variableName) {
            tokens.push({
                line: 0,
                startChar: varNode.variableName.start,
                length: varNode.variableName.end - varNode.variableName.start,
                type: SemanticTokenTypes.variable,
                text: varNode.variableName.text
            });
        }
    } else if (node.kind === SyntaxKind.FormulaReference) {
        const formulaNode = node as FormulaReferenceNode;
        if (formulaNode.formulaName) {
            tokens.push({
                line: 0,
                startChar: formulaNode.formulaName.start,
                length: formulaNode.formulaName.end - formulaNode.formulaName.start,
                type: SemanticTokenTypes.macro,
                text: formulaNode.formulaName.text
            });
        }
    } else if (node.kind === SyntaxKind.FieldReference) {
        const fieldNode = node as any;
        if (fieldNode.fieldName) {
            tokens.push({
                line: 0,
                startChar: fieldNode.fieldName.start,
                length: fieldNode.fieldName.end - fieldNode.fieldName.start,
                type: SemanticTokenTypes.variable,
                text: fieldNode.fieldName.text
            });
        }
    } else if (node.kind === SyntaxKind.MethodReference) {
        const methodNode = node as any;
        if (methodNode.methodName) {
            tokens.push({
                line: 0,
                startChar: methodNode.methodName.start,
                length: methodNode.methodName.end - methodNode.methodName.start,
                type: SemanticTokenTypes.function,
                text: methodNode.methodName.text
            });
        }
    } else if (node.kind === SyntaxKind.List) {
        const listNode = node as ListNode;
        if (listNode.values) {
            for (const item of listNode.values) {
                traverseNode(item, tokens, scopeManager, uri, expectedType, metadata);
            }
        }
    } else if (node.kind === SyntaxKind.Literal) {
        const litNode = node as LiteralNode;
        if (typeof litNode.value === 'number') {
            tokens.push({
                line: 0,
                startChar: litNode.start,
                length: litNode.end - litNode.start,
                type: SemanticTokenTypes.number,
                text: litNode.token.Text
            });
        } else {
            let type: string = SemanticTokenTypes.string;
            if (litNode.token.Kind === TokenKind.TrueToken || litNode.token.Kind === TokenKind.FalseToken ||
                litNode.token.Kind === TokenKind.YesToken || litNode.token.Kind === TokenKind.NoToken ||
                litNode.token.Kind === TokenKind.OnToken || litNode.token.Kind === TokenKind.OffToken) {
                type = expectedType || SemanticTokenTypes.keyword;
            }
            tokens.push({
                line: 0,
                startChar: litNode.start,
                length: litNode.end - litNode.start,
                type: type,
                text: litNode.token.Text
            });
        }
    } else if (node.kind === SyntaxKind.Statement || ('operator' in node)) {
        const binNode = node as any;
        if (binNode.left) traverseNode(binNode.left, tokens, scopeManager, uri, expectedType, metadata);
        if (binNode.right) traverseNode(binNode.right, tokens, scopeManager, uri, expectedType, metadata);
    }
}
