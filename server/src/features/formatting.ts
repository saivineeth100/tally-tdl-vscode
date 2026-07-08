import { TextEdit, FormattingOptions, Range, Position, CancellationToken } from 'vscode-languageserver';
import { SourceFile, DefinitionNode, AttributeNode, ComplexObjectNode, StatementNode, BlockStatementNode, Node, SyntaxKind } from '../core/ast/ast';
import { TokenKind } from '../core/lexer/tokenKind';
import { Token } from '../core/lexer/token';
import { FormattingRules } from './formatting/formattingRules';

interface TokenContext {
    indentDepth: number;
    isDefinitionHeader: boolean;
    casing: "definitionType" | "attributeName" | "boolean" | "none";
    isDefinitionColon: boolean;
    isAttributeColon: boolean;
    isOperator: boolean;
    isComma: boolean;
    blankLinesBefore: number;
}

const defaultContext: TokenContext = {
    indentDepth: 0,
    isDefinitionHeader: false,
    casing: "none",
    isDefinitionColon: false,
    isAttributeColon: false,
    isOperator: false,
    isComma: false,
    blankLinesBefore: -1
};

function isOperatorToken(token: Token): boolean {
    return [
        TokenKind.PlusToken,
        TokenKind.MinusToken,
        TokenKind.AsteriskToken,
        TokenKind.MultiplyToken,
        TokenKind.SlashToken,
        TokenKind.DivisionToken,
        TokenKind.PercentToken,
        TokenKind.EqualsToken,
        TokenKind.NotEqualsToken,
        TokenKind.LessThanToken,
        TokenKind.GreaterThanToken,
        TokenKind.LessThanEqualsToken,
        TokenKind.GreaterThanEqualsToken,
        TokenKind.OrToken,
        TokenKind.AndToken,
        TokenKind.NotToken
    ].includes(token.Kind);
}

function getTokensInRange(tokens: Token[], start: number, end: number): Token[] {
    return tokens.filter(t => t.Start >= start && t.Start < end);
}

function applyCasing(text: string, casing: "preserve" | "uppercase" | "lowercase" | "titlecase"): string {
    if (casing === "preserve") return text;
    if (casing === "uppercase") return text.toUpperCase();
    if (casing === "lowercase") return text.toLowerCase();
    if (casing === "titlecase") {
        return text.split(/\s+/).map(word => {
            if (word.length === 0) return word;
            return word[0].toUpperCase() + word.substring(1).toLowerCase();
        }).join(" ");
    }
    return text;
}

function applyCasingToIdentifier(text: string, casing: "preserve" | "uppercase" | "lowercase" | "titlecase"): string {
    if (casing === "preserve") return text;
    const prefixMatch = text.match(/^([#$@!]+)/);
    const prefix = prefixMatch ? prefixMatch[1] : "";
    const wordPart = text.substring(prefix.length);
    return prefix + applyCasing(wordPart, casing);
}

function getSpacingString(spacing: "space" | "tab" | "none", indentString: string): string {
    if (spacing === "space") return " ";
    if (spacing === "tab") return indentString;
    return "";
}

export function formatDocument(
    text: string, 
    sourceFile: SourceFile, 
    options: FormattingOptions, 
    rules: FormattingRules,
    cancelToken?: CancellationToken
): TextEdit[] {
    const lineIndents: (number | string)[] = new Array(sourceFile.lineOffsets.length).fill(0);
    const indentString = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';

    const originalLines = text.split(/\r?\n/);
    function getOriginalLeadingWhitespace(lineNum: number): string {
        if (lineNum >= 0 && lineNum < originalLines.length) {
            const line = originalLines[lineNum];
            const match = line.match(/^([ \t]*)/);
            return match ? match[1] : "";
        }
        return "";
    }

    function getRelativeIndent(lineNum: number, startLineNum: number, formattedDepth: number): string {
        const startIndent = getOriginalLeadingWhitespace(startLineNum);
        const lineIndent = getOriginalLeadingWhitespace(lineNum);
        
        let extra = "";
        if (lineIndent.startsWith(startIndent)) {
            extra = lineIndent.substring(startIndent.length);
        } else {
            extra = lineIndent;
        }
        
        const baseIndent = indentString.repeat(formattedDepth);
        return baseIndent + extra;
    }



    function getLineFromOffset(offset: number) {
        let low = 0;
        let high = sourceFile.lineOffsets.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (sourceFile.lineOffsets[mid] > offset) high = mid - 1;
            else low = mid + 1;
        }
        return high;
    }

    const contextMap = new Map<Token, TokenContext>();

    function traverseAST(node: Node, depth: number) {
        if (!node) return;

        if (node.kind === SyntaxKind.Definition) {
            const def = node as DefinitionNode;
            const headerEnd = def.closeBracket ? def.closeBracket.Start + def.closeBracket.Text.length : def.end;
            const headerTokens = getTokensInRange(sourceFile.tokens, def.start, headerEnd);
            for (const token of headerTokens) {
                contextMap.set(token, {
                    indentDepth: 0,
                    isDefinitionHeader: true,
                    casing: token === def.type?.tokens?.[0] ? "definitionType" : "none",
                    isDefinitionColon: token === def.colon,
                    isAttributeColon: false,
                    isOperator: false,
                    isComma: false,
                    blankLinesBefore: -1
                });
            }

            if (headerTokens.length > 0) {
                const first = headerTokens[0];
                const ctx = contextMap.get(first);
                if (ctx) {
                    ctx.blankLinesBefore = rules.blankLinesBetweenDefinitions;
                }
            }

            const bodyDepth = rules.indentDefinitionBody ? 1 : 0;
            const startLine = getLineFromOffset(def.start);
            const endLine = getLineFromOffset(def.end);
            for (let j = startLine + 1; j <= endLine; j++) {
                lineIndents[j] = Math.max(lineIndents[j] || 0, bodyDepth);
            }

            const children = [
                ...def.attributes,
                ...def.complexObjects,
                ...def.statements,
                ...def.directives
            ].sort((a, b) => a.start - b.start);

            let isFirstChild = true;
            for (const child of children) {
                traverseAST(child, bodyDepth);
                const childTokens = getTokensInRange(sourceFile.tokens, child.start, child.end);
                if (childTokens.length > 0) {
                    const first = childTokens[0];
                    const ctx = contextMap.get(first);
                    if (ctx) {
                        if (isFirstChild) {
                            ctx.blankLinesBefore = rules.blankLinesAfterDefinitionHeader;
                        } else if (child.kind === SyntaxKind.Attribute) {
                            ctx.blankLinesBefore = rules.blankLinesBetweenAttributes;
                        }
                    }
                }
                isFirstChild = false;
            }
        } else if (node.kind === SyntaxKind.Attribute) {
            const attr = node as AttributeNode;
            const attrTokens = getTokensInRange(sourceFile.tokens, attr.start, attr.end);
            for (const token of attrTokens) {
                let casing: "attributeName" | "boolean" | "none" = "none";
                if (attr.name && token.Start >= attr.name.start && token.Start < attr.name.end) {
                    casing = "attributeName";
                } else if (token.Kind === TokenKind.YesToken || token.Kind === TokenKind.NoToken || token.Kind === TokenKind.TrueToken || token.Kind === TokenKind.FalseToken) {
                    casing = "boolean";
                }

                const isOperator = isOperatorToken(token);
                const isComma = token.Kind === TokenKind.CommaToken;

                contextMap.set(token, {
                    indentDepth: depth,
                    isDefinitionHeader: false,
                    casing,
                    isDefinitionColon: false,
                    isAttributeColon: token === attr.colon,
                    isOperator,
                    isComma,
                    blankLinesBefore: -1
                });
            }

            const startLine = getLineFromOffset(attr.start);
            const endLine = getLineFromOffset(attr.end);
            if (startLine <= endLine) {
                lineIndents[startLine] = Math.max((lineIndents[startLine] as number) || 0, depth);
                for (let j = startLine + 1; j <= endLine; j++) {
                    lineIndents[j] = getRelativeIndent(j, startLine, depth);
                }
            }
        } else if (node.kind === SyntaxKind.ComplexObject) {
            const obj = node as ComplexObjectNode;
            const headerTokens = getTokensInRange(sourceFile.tokens, obj.start, obj.name ? obj.name.end : obj.start + 10);
            for (const token of headerTokens) {
                contextMap.set(token, {
                    indentDepth: depth,
                    isDefinitionHeader: false,
                    casing: "none",
                    isDefinitionColon: false,
                    isAttributeColon: false,
                    isOperator: false,
                    isComma: false,
                    blankLinesBefore: -1
                });
            }

            const startLine = getLineFromOffset(obj.start);
            const endLine = getLineFromOffset(obj.end);
            for (let j = startLine; j <= endLine; j++) {
                lineIndents[j] = Math.max(lineIndents[j] || 0, depth);
            }

            const bodyDepth = rules.indentComplexObjectBody ? depth + 1 : depth;
            const children = [
                ...obj.attributes,
                ...obj.complexObjects
            ].sort((a, b) => a.start - b.start);

            for (const child of children) {
                traverseAST(child, bodyDepth);
            }
        } else if (node instanceof StatementNode) {
            const stmt = node as StatementNode;
            const stmtTokens = getTokensInRange(sourceFile.tokens, stmt.start, stmt.end);

            let bodyDepth = depth;
            if (stmt instanceof BlockStatementNode) {
                bodyDepth = rules.indentBlockStatementBody ? depth + 1 : depth;
                const block = stmt as BlockStatementNode;
                for (const subStmt of block.statements) {
                    traverseAST(subStmt, bodyDepth);
                }
                if (block.endStatement) {
                    traverseAST(block.endStatement, depth);
                }
            }

            for (const token of stmtTokens) {
                if (!contextMap.has(token)) {
                    let casing: "boolean" | "none" = "none";
                    if (token.Kind === TokenKind.YesToken || token.Kind === TokenKind.NoToken || token.Kind === TokenKind.TrueToken || token.Kind === TokenKind.FalseToken) {
                        casing = "boolean";
                    }
                    const isOperator = isOperatorToken(token);
                    const isComma = token.Kind === TokenKind.CommaToken;

                    contextMap.set(token, {
                        indentDepth: depth,
                        isDefinitionHeader: false,
                        casing,
                        isDefinitionColon: false,
                        isAttributeColon: false,
                        isOperator,
                        isComma,
                        blankLinesBefore: -1
                    });
                }
            }

            const startLine = getLineFromOffset(stmt.start);
            if (stmt instanceof BlockStatementNode) {
                lineIndents[startLine] = Math.max((lineIndents[startLine] as number) || 0, depth);
            } else {
                const endLine = getLineFromOffset(stmt.end);
                for (let j = startLine; j <= endLine; j++) {
                    lineIndents[j] = Math.max((lineIndents[j] as number) || 0, depth);
                }
            }
        } else if (node.kind === SyntaxKind.Directive) {
            const dirTokens = getTokensInRange(sourceFile.tokens, node.start, node.end);
            for (const token of dirTokens) {
                contextMap.set(token, {
                    indentDepth: depth,
                    isDefinitionHeader: false,
                    casing: "none",
                    isDefinitionColon: false,
                    isAttributeColon: false,
                    isOperator: false,
                    isComma: false,
                    blankLinesBefore: -1
                });
            }

            const startLine = getLineFromOffset(node.start);
            const endLine = getLineFromOffset(node.end);
            for (let j = startLine; j <= endLine; j++) {
                lineIndents[j] = Math.max((lineIndents[j] as number) || 0, depth);
            }
        }
    }

    let isFirstDef = true;
    for (const def of sourceFile.definitions) {
        traverseAST(def, 0);
        if (isFirstDef) {
            const firstToken = getTokensInRange(sourceFile.tokens, def.start, def.end)[0];
            if (firstToken) {
                const ctx = contextMap.get(firstToken);
                if (ctx) ctx.blankLinesBefore = 0;
            }
            isFirstDef = false;
        }
    }
    for (const dir of sourceFile.directives) {
        traverseAST(dir, 0);
    }

    let formattedText = "";
    let atLineStart = true;
    let multilineIndentString = "";
    let multilineStartLine = -1;
    let skipNextSpace = false;
    let consecutiveNewlines = 0;

    // Detect newline type from source text
    const usesCRLF = text.includes('\r\n');
    const newlineType = usesCRLF ? '\r\n' : '\n';

    function processTrivia(triviaList: Token[], contextLine: number) {
        if (!triviaList) return;

        for (let i = 0; i < triviaList.length; i++) {
            const trivia = triviaList[i];
            switch (trivia.Kind) {
                case TokenKind.LineFeed:
                case TokenKind.CarriageReturn:
                case TokenKind.CarriageReturnLineFeed:
                    if (rules.trimTrailingWhitespace) {
                        while (formattedText.endsWith(' ') || formattedText.endsWith('\t')) {
                            formattedText = formattedText.slice(0, -1);
                        }
                    }
                    
                    const maxNewlines = rules.maxConsecutiveBlankLines + 1;
                    if (consecutiveNewlines >= maxNewlines) {
                        continue;
                    }
                    
                    formattedText += trivia.Text;
                    atLineStart = true;
                    skipNextSpace = false;
                    consecutiveNewlines++;
                    break;

                case TokenKind.SpaceToken:
                    if (skipNextSpace) {
                        skipNextSpace = false;
                        continue;
                    }
                    if (atLineStart) {
                        // ignore leading space
                    } else {
                        formattedText += trivia.Text;
                    }
                    break;

                case TokenKind.SingleLineComment:
                case TokenKind.MultiLineComment:
                    consecutiveNewlines = 0;
                    if (atLineStart) {
                        const line = getLineFromOffset(trivia.Start);
                        const level = lineIndents[line] || 0;
                        if (level > 0) formattedText += indentString.repeat(level);
                        atLineStart = false;
                    }
                    formattedText += trivia.Text;
                    if (trivia.Text.endsWith('\n') || trivia.Text.endsWith('\r')) {
                        atLineStart = true;
                    }
                    break;

                default:
                    formattedText += trivia.Text;
            }
        }
    }

    for (const token of sourceFile.tokens) {
        if (cancelToken?.isCancellationRequested) return [];

        const tokenLine = getLineFromOffset(token.Start);
        const ctx = contextMap.get(token) || defaultContext;

        // A. Leading Trivia
        processTrivia(token.Leading, tokenLine);

        // B. Apply Indentation (if still at start after leading trivia)
        if (atLineStart && token.Kind !== TokenKind.EndOfFileToken) {
            // Enforce blank lines before this token if requested
            if (ctx.blankLinesBefore >= 0 && formattedText.length > 0) {
                const neededNewlines = ctx.blankLinesBefore + 1;
                if (consecutiveNewlines < neededNewlines) {
                    const diff = neededNewlines - consecutiveNewlines;
                    formattedText += newlineType.repeat(diff);
                    consecutiveNewlines = neededNewlines;
                } else if (consecutiveNewlines > neededNewlines) {
                    const diff = consecutiveNewlines - neededNewlines;
                    for (let d = 0; d < diff; d++) {
                        if (formattedText.endsWith('\r\n')) {
                            formattedText = formattedText.slice(0, -2);
                        } else if (formattedText.endsWith('\n') || formattedText.endsWith('\r')) {
                            formattedText = formattedText.slice(0, -1);
                        }
                    }
                    consecutiveNewlines = neededNewlines;
                }
            }
            const indent = lineIndents[tokenLine];
            if (typeof indent === 'string') {
                formattedText += indent;
            } else if (typeof indent === 'number' && indent > 0) {
                formattedText += indentString.repeat(indent);
            }
            atLineStart = false;
            consecutiveNewlines = 0;
        }

        // C. Token Text
        if (token.Kind === TokenKind.EndOfFileToken) {
            continue;
        }

        consecutiveNewlines = 0;

        // Custom spacing: spacing around operators
        if (ctx.isOperator && rules.spaceAroundOperators) {
            if (!formattedText.endsWith(' ') && !formattedText.endsWith('\t') && !formattedText.endsWith('\n') && !atLineStart) {
                formattedText += " ";
            }
        }

        // Custom spacing: spacing before colons
        if (token.Kind === TokenKind.ColonToken) {
            let spaceBefore = " ";
            let spaceAfter = " ";
            if (ctx.isDefinitionColon) {
                spaceBefore = getSpacingString(rules.spaceBeforeDefinitionColon, indentString);
                spaceAfter = getSpacingString(rules.spaceAfterDefinitionColon, indentString);
            } else if (ctx.isAttributeColon) {
                spaceBefore = getSpacingString(rules.spaceBeforeColon, indentString);
                spaceAfter = getSpacingString(rules.spaceAfterColon, indentString);
            }

            if (spaceBefore === "") {
                while (formattedText.endsWith(' ') || formattedText.endsWith('\t')) {
                    formattedText = formattedText.slice(0, -1);
                }
            } else if (spaceBefore === "\t") {
                while (formattedText.endsWith(' ') || formattedText.endsWith('\t')) {
                    formattedText = formattedText.slice(0, -1);
                }
                if (!formattedText.endsWith('\n') && !atLineStart) {
                    formattedText += "\t";
                }
            } else {
                if (!formattedText.endsWith(spaceBefore) && !formattedText.endsWith('\n') && !atLineStart) {
                    formattedText += spaceBefore;
                }
            }

            formattedText += token.Text;

            if (spaceAfter !== "") {
                formattedText += spaceAfter;
            }
            skipNextSpace = true; // Always tell next trivia to skip its first space to discard original spacing
            
            // D. Trailing Trivia
            processTrivia(token.Trailing, tokenLine);
            continue;
        }

        // Apply casing
        let tokenText = token.Text;
        if (ctx.casing === "definitionType") {
            tokenText = applyCasingToIdentifier(tokenText, rules.definitionTypeCasing);
        } else if (ctx.casing === "attributeName") {
            tokenText = applyCasingToIdentifier(tokenText, rules.attributeNameCasing);
        } else if (ctx.casing === "boolean") {
            tokenText = applyCasingToIdentifier(tokenText, rules.booleanKeywordCasing);
        }

        formattedText += tokenText;

        // Custom spacing: spacing after operator/comma
        if (ctx.isOperator && rules.spaceAroundOperators) {
            formattedText += " ";
            skipNextSpace = true;
        }
        if (ctx.isComma && rules.spaceAfterComma) {
            formattedText += " ";
            skipNextSpace = true;
        }

        // D. Trailing Trivia
        processTrivia(token.Trailing, tokenLine);
    }

    // Ensure final newline
    if (rules.insertFinalNewline) {
        if (formattedText.length > 0 && !formattedText.endsWith('\n')) {
            formattedText += newlineType;
        }
    }

    const lines = text.split(/\r?\n/);
    const lastLine = lines[lines.length - 1];
    const endPosition = Position.create(lines.length - 1, lastLine.length);
    
    return [
        TextEdit.replace(
            Range.create(Position.create(0, 0), endPosition),
            formattedText
        )
    ];
}
