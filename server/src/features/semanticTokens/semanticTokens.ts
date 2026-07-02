import {
    SemanticTokenTypes,
    SemanticTokensBuilder,
    SemanticTokensLegend,
    SemanticTokens,
    SemanticTokensDelta,
    CancellationToken
} from 'vscode-languageserver';
import {
    SourceFile,
    FunctionCallNode,
    IdentifierNode,
    VariableReferenceNode,
    FormulaReferenceNode,
    ListNode,
    LiteralNode,
    SyntaxKind,
    AttributeNode
} from '../../core/ast/ast';
import { TokenKind } from '../../core/lexer/tokenKind';
import { ScopeManager, getSemanticTypeFromSymbol } from '../../semantics/scopeManager';
import { areTypesCompatible, inferExpressionType, STRUCTURAL_DEFINITION_TYPES } from '../../validation/validationUtils';
import { normalizeTypeName } from '../../utils/normalizeUtils';
import { SymbolKind } from 'tally-tdl-shared';
import { getExpectedTypeForMenuItem } from '../../utils/attributeUtils';
import { resolveModifierChain } from '../../utils/modifierUtils';

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

// Helper mapping for RefersTo/DataType to SemanticTokenTypes
function mapMetaTypeToToken(refersTo?: string, dataType?: string, scopeManager?: ScopeManager): string | undefined {
    if (refersTo) {
        refersTo = normalizeTypeName(refersTo);
        // Use metadata to check if it's a valid definition type
        if (scopeManager) {
            if (scopeManager.globalScope.attributes.has(refersTo)) {
                return SemanticTokenTypes.class;
            }
        }

        // If refers to Function?
        if (refersTo === 'function') return SemanticTokenTypes.function;
        if (refersTo === 'systemformulae' || refersTo === 'formula' || refersTo === 'formulae') return SemanticTokenTypes.macro;
        if (refersTo === 'variable' || refersTo === 'systemvariable') return SemanticTokenTypes.variable;
    }

    if (dataType) {
        if (dataType.toLowerCase() === 'string') return SemanticTokenTypes.string;
    }
    return undefined;
}


// Map function names to expected token types for their arguments (by index)
const FUNCTION_PARAMETER_CONTEXT: Record<string, string[]> = {
    'CollectionField': [SemanticTokenTypes.class, SemanticTokenTypes.class], // Field, Collection
    'SysName': [SemanticTokenTypes.class] // System Name
};


/**
 * Provide semantic tokens for LSP request
 */
const tokenBuilders = new Map<string, SemanticTokensBuilder>();

/**
 * Provide semantic tokens for LSP request
 */
export function provideSemanticTokens(sourceFile: SourceFile, doc: any, scopeManager?: ScopeManager, token?: CancellationToken): SemanticTokens {
    const t0 = Date.now();
    const tokens = getSemanticTokens(sourceFile, scopeManager, doc.uri, token); // Assuming Doc has URI, or pass explicitly
    const t1 = Date.now();

    let builder = new SemanticTokensBuilder();
    tokenBuilders.set(doc.uri, builder);

    tokens.sort((a, b) => a.startChar - b.startChar);

    interface TokenSegment { line: number, char: number, len: number, typeIdx: number }
    const segments: TokenSegment[] = [];

    for (const t of tokens) {
        const startPos = doc.positionAt(t.startChar);
        const endPos = doc.positionAt(t.startChar + t.length);
        const typeIdx = TOKEN_TYPE_MAP[t.type] ?? 0;

        if (startPos.line === endPos.line) {
            segments.push({ line: startPos.line, char: startPos.character, len: t.length, typeIdx });
        } else {
            for (let line = startPos.line; line <= endPos.line; line++) {
                const lineOffsets = (sourceFile as any).lineOffsets;
                let lineStartOffset = 0, lineEndOffset = 0;

                if (lineOffsets && line < lineOffsets.length) {
                    lineStartOffset = lineOffsets[line];
                    if (line < lineOffsets.length - 1) {
                        lineEndOffset = lineOffsets[line + 1] - 1;
                    } else {
                        lineEndOffset = (sourceFile as any).end || (t.startChar + t.length + 100);
                    }
                } else continue;

                const intersectionStart = Math.max(t.startChar, lineStartOffset);
                const nextLineStart = (lineOffsets && line < lineOffsets.length - 1) ? lineOffsets[line + 1] : ((sourceFile as any).end || t.startChar + t.length) + 1;
                const effectiveTokenEnd = Math.min(t.startChar + t.length, nextLineStart);
                const pos = doc.positionAt(intersectionStart);
                const len = effectiveTokenEnd - intersectionStart;

                if (len > 0) {
                    segments.push({ line: pos.line, char: pos.character, len, typeIdx });
                }
            }
        }
    }

    segments.sort((a, b) => a.line !== b.line ? a.line - b.line : a.char - b.char);
    for (const s of segments) {
        builder.push(s.line, s.char, s.len, s.typeIdx, 0);
    }

    const res = builder.build();
    const t2 = Date.now();
    console.info(`[Perf] provideSemanticTokens for ${doc.uri}: Total=${t2-t0}ms (getSemanticTokens=${t1-t0}ms, build=${t2-t1}ms)`);
    if (res.resultId) {
        builder.previousResult(res.resultId);
    }
    return res;
}

/**
 * Provide semantic token deltas for LSP request
 */
export function provideSemanticTokensEdits(sourceFile: SourceFile, doc: any, previousResultId: string, scopeManager?: ScopeManager, token?: CancellationToken): SemanticTokens | SemanticTokensDelta {
    let builder = tokenBuilders.get(doc.uri);
    if (!builder) {
        return provideSemanticTokens(sourceFile, doc, scopeManager, token);
    }

    builder.previousResult(previousResultId);

    const tokens = getSemanticTokens(sourceFile, scopeManager, doc.uri, token);
    tokens.sort((a, b) => a.startChar - b.startChar);

    interface TokenSegment { line: number, char: number, len: number, typeIdx: number }
    const segments: TokenSegment[] = [];

    for (const t of tokens) {
        const startPos = doc.positionAt(t.startChar);
        const endPos = doc.positionAt(t.startChar + t.length);
        const typeIdx = TOKEN_TYPE_MAP[t.type] ?? 0;

        if (startPos.line === endPos.line) {
            segments.push({ line: startPos.line, char: startPos.character, len: t.length, typeIdx });
        } else {
            for (let line = startPos.line; line <= endPos.line; line++) {
                const lineOffsets = (sourceFile as any).lineOffsets;
                let lineStartOffset = 0, lineEndOffset = 0;
                if (lineOffsets && line < lineOffsets.length) {
                    lineStartOffset = lineOffsets[line];
                    if (line < lineOffsets.length - 1) {
                        lineEndOffset = lineOffsets[line + 1] - 1;
                    } else {
                        lineEndOffset = (sourceFile as any).end || (t.startChar + t.length + 100);
                    }
                } else continue;

                const intersectionStart = Math.max(t.startChar, lineStartOffset);
                const nextLineStart = (lineOffsets && line < lineOffsets.length - 1) ? lineOffsets[line + 1] : ((sourceFile as any).end || t.startChar + t.length) + 1;
                const effectiveTokenEnd = Math.min(t.startChar + t.length, nextLineStart);
                const pos = doc.positionAt(intersectionStart);
                const len = effectiveTokenEnd - intersectionStart;
                if (len > 0) segments.push({ line: pos.line, char: pos.character, len, typeIdx });
            }
        }
    }

    segments.sort((a, b) => a.line !== b.line ? a.line - b.line : a.char - b.char);
    for (const s of segments) {
        builder.push(s.line, s.char, s.len, s.typeIdx, 0);
    }

    const result = builder.buildEdits();
    if (result.resultId) {
        builder.previousResult(result.resultId);
    }
    return result;
}

/**
 * Generates semantic tokens from a parsed TDL source file
 */
export function getSemanticTokens(sourceFile: SourceFile, scopeManager?: ScopeManager, uri?: string, token?: CancellationToken): SemanticToken[] {
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

    // 1.5. Tokenize File Level Directives
    for (const dir of sourceFile.directives) {
        tokenizeDirective(dir, tokens);
    }

    for (const def of sourceFile.definitions) {
        if (token?.isCancellationRequested) return [];
        if (def.modifier) {
            tokens.push({
                line: 0,
                startChar: def.modifier.Start,
                length: def.modifier.Length,
                type: SemanticTokenTypes.keyword,
                text: def.modifier.Text
            });
        }
        if (def.type) {
            tokens.push({
                line: 0,
                startChar: def.type.start,
                length: def.type.end - def.type.start,
                type: SemanticTokenTypes.keyword,
                text: def.type?.text
            });
        }
        if (def.closeType) {
            tokens.push({
                line: 0,
                startChar: def.closeType.start,
                length: def.closeType.end - def.closeType.start,
                type: SemanticTokenTypes.keyword,
                text: def.closeType?.text
            });
        }
        if (def.name) {
            let tokenType = SemanticTokenTypes.class;
            if (def.type && (def.type?.text?.trim().toLowerCase() === 'include' || def.type?.text?.trim().toLowerCase() === 'import')) {
                tokenType = SemanticTokenTypes.string;
            }

            tokens.push({
                line: 0,
                startChar: def.name.start,
                length: def.name.end - def.name.start,
                type: tokenType,
                text: def.name?.text
            });
        }
        const defNameText = normalizeTypeName(def.name?.text || '');
        const defTypeName = normalizeTypeName(def.type?.text || '');
        
        if (def.attributes) {
            traverseAttributes(def.attributes, tokens, defTypeName, defNameText, scopeManager, uri);
        }
        
        for (const dir of def.directives) {
            tokenizeDirective(dir, tokens);
        }

        if (def.complexObjects) {
            traverseComplexObjects(def.complexObjects, tokens, defNameText, scopeManager, uri);
        }

        if (def.statements) {
            for (const stmt of def.statements) {
                traverseStatement(stmt, tokens, scopeManager, uri);
            }
        }
    }
    return tokens;
}

function tokenizeDirective(dir: any, tokens: SemanticToken[]) {
    const startChar = dir.start;
    const nameStart = startChar + 1;
    
    // Tokenize < and >
    tokens.push({ line: 0, startChar: dir.start, length: 1, type: SemanticTokenTypes.operator, text: '<' });
    if (dir.end > dir.start) {
        tokens.push({ line: 0, startChar: dir.end - 1, length: 1, type: SemanticTokenTypes.operator, text: '>' });
    }

    if (dir.rawContent) {
        let i = 0;
        while ((i = dir.rawContent.indexOf(':', i)) !== -1) {
            tokens.push({ line: 0, startChar: dir.start + 1 + i, length: 1, type: SemanticTokenTypes.operator, text: ':' });
            i++;
        }
    }

    if (dir.name) {
        let nameOffset = 0;
        if (dir.rawContent) {
            nameOffset = dir.rawContent.indexOf(dir.name);
            if (nameOffset === -1) nameOffset = 0;
        }
        tokens.push({
            line: 0,
            startChar: nameStart + nameOffset,
            length: dir.name.length,
            type: SemanticTokenTypes.macro,
            text: dir.name
        });
    }

    if (dir.kind === SyntaxKind.InUseDirective) {
        for (const target of dir.targets) {
            if (target.typeName) {
                tokens.push({
                    line: 0,
                    startChar: target.typeStart,
                    length: target.typeName.length,
                    type: SemanticTokenTypes.keyword, // Match the color of definition headers (e.g. [Field: ...])
                    text: target.typeName
                });
            }
            if (target.defName) {
                let tokenType = SemanticTokenTypes.class;
                const lowerType = (target.typeName || '').toLowerCase();
                if (lowerType === 'variable') {
                    tokenType = SemanticTokenTypes.variable;
                } else if (lowerType === 'function') {
                    tokenType = SemanticTokenTypes.function;
                } else if (lowerType === 'system formula' || lowerType === 'formula') {
                    tokenType = SemanticTokenTypes.macro;
                }

                tokens.push({
                    line: 0,
                    startChar: target.defNameStart,
                    length: target.defName.length,
                    type: tokenType,
                    text: target.defName
                });
            }
        }
    } else if (dir.kind === SyntaxKind.DefTypeDirective) {
        if (dir.defType) {
            tokens.push({
                line: 0,
                startChar: dir.defTypeStart,
                length: dir.defType.length,
                type: SemanticTokenTypes.keyword, // Match the color of definition headers
                text: dir.defType
            });
        }
        if (dir.defName && dir.defNameStart !== undefined) {
            tokens.push({
                line: 0,
                startChar: dir.defNameStart,
                length: dir.defName.length,
                type: SemanticTokenTypes.class,
                text: dir.defName
            });
        }
    }
}
function traverseAttributes(attributes: AttributeNode[], tokens: SemanticToken[], defTypeName: string, defName: string, scopeManager?: ScopeManager, uri?: string) {

    for (const attr of attributes) {
        let expectedType: string | undefined;
        let defMeta: any | undefined
        if (attr.name) {
            const attrNameLower = normalizeTypeName(attr.name?.text || '');
            let tokenType = SemanticTokenTypes.macro;
            if (scopeManager && scopeManager.globalScope.attributes.has(attrNameLower)) {
                tokenType = SemanticTokenTypes.keyword;
            }

            tokens.push({
                line: 0,
                startChar: attr.name.start,
                length: attr.name.end - attr.name.start,
                type: tokenType,
                text: attr.name?.text
            });

            // Determine context for values
            if (scopeManager) {
                const attrMap = scopeManager.globalScope.attributes.get(defTypeName);
                if (attrMap) {
                    defMeta = attrMap.get(normalizeTypeName(attr.name?.text || ''));
                }
                if (defMeta && defMeta.parameters && defMeta.parameters.length > 0) {
                    const param = defMeta.parameters[0];
                    expectedType = mapMetaTypeToToken(param.RefersTo, param.DataType, scopeManager);
                }
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
            const attrNameLower = attr.name?.text?.toLowerCase();
            if (attrNameLower && ['local', 'add', 'replace', 'delete'].includes(attrNameLower) && scopeManager) {
                for (let i = 0; i < attr.value.length; i++) {
                    const paramNode = attr.value[i];
                    const offset = paramNode.start + 1;
                    const resolved = resolveModifierChain(attrNameLower, attr.value, defTypeName, defName, scopeManager, offset);
                    
                    if (resolved.cursorSegment) {
                        switch (resolved.cursorSegment) {
                            case 'modifierKeyword':
                                tokens.push({
                                    line: 0,
                                    startChar: paramNode.start,
                                    length: paramNode.end - paramNode.start,
                                    type: SemanticTokenTypes.macro,
                                    text: 'text' in paramNode ? (paramNode as any).text : ''
                                });
                                break;
                            case 'positionModifier':
                                tokens.push({
                                    line: 0,
                                    startChar: paramNode.start,
                                    length: paramNode.end - paramNode.start,
                                    type: SemanticTokenTypes.keyword,
                                    text: 'text' in paramNode ? (paramNode as any).text : ''
                                });
                                break;
                            case 'defType':
                                tokens.push({
                                    line: 0,
                                    startChar: paramNode.start,
                                    length: paramNode.end - paramNode.start,
                                    type: SemanticTokenTypes.keyword,
                                    text: 'text' in paramNode ? (paramNode as any).text : ''
                                });
                                break;
                            case 'defName':
                            case 'positionReference':
                                tokens.push({
                                    line: 0,
                                    startChar: paramNode.start,
                                    length: paramNode.end - paramNode.start,
                                    type: SemanticTokenTypes.class,
                                    text: 'text' in paramNode ? (paramNode as any).text : ''
                                });
                                break;
                            case 'targetAttribute':
                                tokens.push({
                                    line: 0,
                                    startChar: paramNode.start,
                                    length: paramNode.end - paramNode.start,
                                    type: SemanticTokenTypes.property,
                                    text: 'text' in paramNode ? (paramNode as any).text : ''
                                });
                                break;
                            case 'value':
                                let expectedType: string | undefined;
                                if (resolved.targetAttributeMeta && resolved.targetAttributeMeta.parameters && resolved.cursorIndexInValues !== undefined) {
                                    const paramMeta = resolved.targetAttributeMeta.parameters[resolved.cursorIndexInValues] || resolved.targetAttributeMeta.parameters[resolved.targetAttributeMeta.parameters.length - 1];
                                    if (paramMeta && paramMeta.RefersTo) {
                                        expectedType = paramMeta.RefersTo;
                                    }
                                }
                                traverseNode(paramNode, tokens, scopeManager, uri, expectedType);
                                break;
                        }
                    } else {
                        traverseNode(paramNode, tokens, scopeManager, uri);
                    }
                }
                continue;
            }

            for (let i = 0; i < attr.value.length; i++) {
                let argExpectedType = expectedType;
                if (defMeta && defMeta.type?.toLowerCase() === 'menu item list' && normalizeTypeName(attr.name.text) !== 'indent') {
                    const isKeyItem = normalizeTypeName(attr.name.text) === 'keyitem';
                    const actionIndex = isKeyItem ? 2 : 1;
                    let actionName = '';
                    if (attr.value.length > actionIndex) {
                        const actionNode = attr.value[actionIndex];
                        if (actionNode.kind === SyntaxKind.Identifier) {
                            actionName = normalizeTypeName((actionNode as any).text);
                        }
                    }
                    const menuItemExpected = getExpectedTypeForMenuItem(attr.name.text, i, actionName, scopeManager);
                    if (menuItemExpected) {
                        argExpectedType = mapMetaTypeToToken(menuItemExpected, undefined, scopeManager);
                        if (!argExpectedType) {
                            if (menuItemExpected === 'Action') argExpectedType = SemanticTokenTypes.keyword;
                            else if (menuItemExpected === 'String') argExpectedType = SemanticTokenTypes.string;
                        }
                    }
                } else if (defMeta && defMeta.parameters) {
                    if (i < defMeta.parameters.length) {
                        const p = defMeta.parameters[i];
                        argExpectedType = mapMetaTypeToToken(p.RefersTo, p.DataType, scopeManager);
                    } else if (defMeta.parameters.length > 0 && defMeta.parameters[defMeta.parameters.length - 1].IsList) {
                        const p = defMeta.parameters[defMeta.parameters.length - 1];
                        argExpectedType = mapMetaTypeToToken(p.RefersTo, p.DataType, scopeManager);
                    }
                }

                traverseNode(attr.value[i], tokens, scopeManager, uri, argExpectedType);
            }
        }
    }
}

function traverseComplexObjects(complexObjects: any[], tokens: SemanticToken[], defTypeName: string, scopeManager?: ScopeManager, uri?: string) {
    if (!complexObjects) return;
    for (const obj of complexObjects) {
        if (obj.name) {
            tokens.push({
                line: 0,
                startChar: obj.name.start,
                length: obj.name.end - obj.name.start,
                type: SemanticTokenTypes.class,
                text: obj.name?.text
            });
        }
        if (obj.closeName) {
            tokens.push({
                line: 0,
                startChar: obj.closeName.start,
                length: obj.closeName.end - obj.closeName.start,
                type: SemanticTokenTypes.class,
                text: obj.closeName?.text
            });
        }

        if (obj.attributes) {
            traverseAttributes(obj.attributes, tokens, normalizeTypeName(obj.name?.text || ''), '', scopeManager, uri);
        }

        if (obj.complexObjects) {
            traverseComplexObjects(obj.complexObjects, tokens, normalizeTypeName(obj.name?.text || ''), scopeManager, uri);
        }
    }
}

/**
 * Traverse a statement node and collect semantic tokens
 */
function traverseStatement(stmt: any, tokens: SemanticToken[], scopeManager?: ScopeManager, uri?: string) {
    if (!stmt) return;

    if (stmt.label) {
        tokens.push({
            line: 0,
            startChar: stmt.label.start,
            length: stmt.label.end - stmt.label.start,
            type: SemanticTokenTypes.number,
            text: stmt.label?.text || String(stmt.label.value)
        });
    }

    if (stmt.action) {
        tokens.push({
            line: 0,
            startChar: stmt.action.start,
            length: stmt.action.end - stmt.action.start,
            type: SemanticTokenTypes.keyword,
            text: stmt.action?.text
        });
    }

    if (stmt.args) {
        for (const arg of stmt.args) {
            traverseNode(arg, tokens, scopeManager, uri, undefined);
        }
    }

    if (stmt.statements) {
        for (const s of stmt.statements) {
            traverseStatement(s, tokens, scopeManager, uri);
        }
    }

    if (stmt.elseStatements) {
        for (const s of stmt.elseStatements) {
            traverseStatement(s, tokens, scopeManager, uri);
        }
    }

    if (stmt.endStatement) {
        traverseStatement(stmt.endStatement, tokens, scopeManager, uri);
    }
}

/**
 * Helper function to check if a string is a TDL keyword.
 */
function isKeyword(node: IdentifierNode): boolean {
    // Check text for common keywords that might be parsed as identifiers
    if (['Yes', 'No', 'True', 'False', 'On', 'Off'].includes(node?.text || '')) return true;

    if (!node.tokens || node.tokens.length === 0) return false;
    const firstToken = node.tokens[0];
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
        text: node?.text
    };
}

/**
 * Traverse AST node and collect semantic tokens
 */
function traverseNode(node: any, tokens: SemanticToken[], scopeManager?: ScopeManager, uri?: string, expectedType?: string) {
    if (!node) return;

    // Handle Identifiers (potential references)
    if (node.kind === SyntaxKind.Identifier) {
        const idNode = node as IdentifierNode;

        // 1. Keyword Highlighting
        if (isKeyword(idNode)) {
            tokens.push(keywordToken(idNode));
            return;
        }

        // Removed expensive Scope Resolution for semantic tokens.
        // It was causing 11+ second delays on large files due to deep inheritance tree walks.
        // We will rely on expectedType (context) which is usually 100% accurate in TDL.

        // 3. Fallback: Use Context (expectedType) if available, otherwise Variable
        tokens.push({
            line: 0,
            startChar: idNode.start,
            length: idNode.end - idNode.start,
            type: expectedType || SemanticTokenTypes.variable,
            text: idNode?.text
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
                text: funcNode.functionName?.text
            });
        }
        if (funcNode.arguments) {
            // Determine parameter contexts if function is known
            let paramContexts: string[] | undefined;
            if (scopeManager && funcNode.functionName) {
                const funcName = normalizeTypeName((funcNode.functionName?.text || '').replace(/^\$\$/, ''));
                const funcMeta = scopeManager.globalScope.functions.get(funcName);
                if (funcMeta && funcMeta.parameters) {
                    paramContexts = funcMeta.parameters.map((p: any) => mapMetaTypeToToken(p.RefersTo, p.DataType, scopeManager) || SemanticTokenTypes.variable);
                }
            }

            if (!paramContexts && funcNode.functionName) {
                const funcName = normalizeTypeName((funcNode.functionName?.text || '').replace(/^\$\$/, ''));
                // FUNCTION_PARAMETER_CONTEXT is un-normalized string array.
                // It was used un-normalized in the original implementation.
                // For 'CollectionField', etc.
                const key = Object.keys(FUNCTION_PARAMETER_CONTEXT).find(k => normalizeTypeName(k) === funcName);
                if (key) {
                     paramContexts = FUNCTION_PARAMETER_CONTEXT[key];
                }
            }

            for (let i = 0; i < funcNode.arguments.length; i++) {
                const arg = funcNode.arguments[i];
                // Use index, or last if varargs/list
                const argExpectedType = paramContexts ? paramContexts[Math.min(i, paramContexts.length - 1)] : undefined;
                traverseNode(arg, tokens, scopeManager, uri, argExpectedType);
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
                text: varNode.variableName?.text
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
                text: formulaNode.formulaName?.text
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
                text: fieldNode.fieldName?.text
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
                text: methodNode.methodName?.text
            });
        }
    } else if (node.kind === SyntaxKind.List) {
        const listNode = node as ListNode;
        if (listNode.values) {
            for (const item of listNode.values) {
                traverseNode(item, tokens, scopeManager, uri, expectedType);
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
        if (binNode.left) traverseNode(binNode.left, tokens, scopeManager, uri, expectedType);
        if (binNode.right) traverseNode(binNode.right, tokens, scopeManager, uri, expectedType);
    }
}
