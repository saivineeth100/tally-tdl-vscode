import { Token } from "../lexer/token";
import { TokenKind } from "../lexer/tokenKind";
import { TokenStringMaps } from "./TokenStringMaps";
import { LexerState, LexicalDiagnostic } from "../scanner/LexerState";
import { TriviaScanner } from "../scanner/TriviaScanner";
import { TokenScanner } from "../scanner/TokenScanner";

export { LexicalDiagnostic } from "../scanner/LexerState";

/**
 * The Lexer is responsible for converting raw TDL source code text into an array of structural Tokens.
 * It identifies basic syntax elements (Identifiers, Strings, Numbers, Comments, Symbols) but does NOT
 * understand TDL semantics or grammar rules. It intentionally emits generic `IdentifierToken`s rather
 * than context-specific tokens to allow the Parser to handle structural lookahead.
 * 
 * This class serves as the orchestrator for the LexerState, TriviaScanner, and TokenScanner.
 */
export class Lexer {
    private state: LexerState;
    private triviaScanner: TriviaScanner;
    private tokenScanner: TokenScanner;
    
    /**
     * Initializes a new Lexer with the given content.
     * @param content The raw TDL source code string.
     */
    constructor(content: string) {
        this.state = new LexerState(content);
        this.triviaScanner = new TriviaScanner(this.state);
        this.tokenScanner = new TokenScanner(this.state);
    }

    /**
     * Retrieves the collection of lexical errors encountered during tokenization.
     */
    public get diagnostics(): LexicalDiagnostic[] {
        return this.state.diagnostics;
    }

    /**
     * Consumes the entire source text and generates a complete array of tokens.
     * @returns An array of Tokens ending with an EndOfFileToken.
     */
    public Generate(): Token[] {
        let token: Token;
        do {
            token = this.ScanNextToken();
            this.state.tokens.push(token);
        } while (token.Kind !== TokenKind.EndOfFileToken);
        return this.state.tokens;
    }

    /**
     * Scans and returns the next token from the input stream.
     * Handles attaching leading and trailing trivia (whitespace/comments) to the token.
     */
    private ScanNextToken(): Token {
        let token = this.Scan();
        return token;
    }

    /**
     * The core scanning routine. Identifies the exact TokenKind based on the current character.
     */
    private Scan(): Token {
        let fullStart = this.state._pos;
        let leadingTokens: Token[] = [];
        let trailingTokens: Token[] = [];
        this.triviaScanner.ScanLeadingOrTrailing(this.state._pos > 0, false, leadingTokens);
        
        // Start should be set AFTER scanning leading trivia
        let start = this.state._pos;
        var token = new Token(TokenKind.Unknown, 0, 0, 0);
        
        if (this.state._pos >= this.state._endOfFilePos) {
            const token = new Token(TokenKind.EndOfFileToken, fullStart, start, this.state._pos - fullStart);
            token.Text = this.state.GetText(this.state._pos);
            token.Leading = leadingTokens;
            return token;
        }
        
        let char = this.state.Peek();
        switch (char) {
            case "!":
                this.state._pos++;
                if (this.state.Peek() === "=") {
                    this.state._pos++;
                    token.Kind = TokenKind.NotEqualsToken;
                } else {
                    token.Kind = TokenKind.ExclamationToken;
                }
                break;
            case "#":
                this.state._pos++;
                if (this.state.Peek() === "#") {
                    this.state._pos++;
                    token.Kind = TokenKind.DoubleHashToken;
                } else {
                    token.Kind = TokenKind.HashToken;
                }
                break;
            case "$":
                this.state._pos++;
                if (this.state.Peek() === "$") {
                    this.state._pos++;
                    token.Kind = TokenKind.DoubleDollarToken;
                } else {
                    token.Kind = TokenKind.DollarToken;
                }
                break;
            case "@":
                this.state._pos++;
                if (this.state.Peek() === "@") {
                    this.state._pos++;
                    token.Kind = TokenKind.DoubleAtTheRateToken;
                } else {
                    token.Kind = TokenKind.AtTheRateToken;
                }
                break;
            case "[":
                this.state._pos++;
                token.Kind = TokenKind.OpenSquareBracketToken;
                break;
            case "%":
                this.state._pos++;
                token.Kind = TokenKind.PercentToken;
                break;
            case "]":
                this.state._pos++;
                token.Kind = TokenKind.CloseSquareBracketToken;
                break;
            case ".":
                this.state._pos++;
                token.Kind = TokenKind.DotToken;
                break;
            case ":":
                this.state._pos++;
                token.Kind = TokenKind.ColonToken;
                break;
            case "+":
                this.state._pos++;
                let isLineContinuation = false;
                
                // Check if it's the LAST on the line
                let lookaheadPos = this.state._pos;
                while (lookaheadPos < this.state._endOfFilePos) {
                    const nextChar = this.state._contents[lookaheadPos];
                    if (nextChar === ' ' || nextChar === '\t') {
                        lookaheadPos++;
                    } else if (nextChar === '\n' || nextChar === '\r' || nextChar === ';') {
                        isLineContinuation = true;
                        break;
                    } else {
                        break;
                    }
                }
                
                // Removed incorrect 'FIRST on the line' check.
                if (isLineContinuation || lookaheadPos === this.state._endOfFilePos) {
                    token.Kind = TokenKind.LineContinuationToken;
                } else {
                    token.Kind = TokenKind.PlusToken;
                }
                break;
            case "(":
                this.state._pos++;
                token.Kind = TokenKind.OpenParenToken;
                break;
            case ")":
                this.state._pos++;
                token.Kind = TokenKind.CloseParenToken;
                break;
            case ",":
                this.state._pos++;
                token.Kind = TokenKind.CommaToken;
                break;
            case "-":
                this.state._pos++;
                token.Kind = TokenKind.MinusToken;
                break;
            case "/":
                this.state._pos++;
                token.Kind = TokenKind.DivisionToken;
                break;
            case "*":
                this.state._pos++;
                token.Kind = TokenKind.AsteriskToken;
                break;
            case ">":
                this.state._pos++;
                if (this.state.Peek() === "=") {
                    this.state._pos++;
                    token.Kind = TokenKind.GreaterThanEqualsToken;
                } else {
                    token.Kind = TokenKind.GreaterThanToken;
                }
                break;
            case "<":
                this.state._pos++;
                if (this.state.Peek() === "=") {
                    this.state._pos++;
                    token.Kind = TokenKind.LessThanEqualsToken;
                } else {
                    token.Kind = TokenKind.LessThanToken;
                }
                break;
            case "=":
                this.state._pos++;
                token.Kind = TokenKind.EqualsToken;
                break;
            case "\"":
            case "'":
                // Includes quotes in token.Text
                const startQuote = this.state._pos;
                this.state._pos++;
                let parsedStringContent = this.tokenScanner.ScanText(char);
                if (this.state._pos < this.state._endOfFilePos && this.state.Peek() === char) {
                    this.state._pos++; // Advance past closing quote
                }
                token.Kind = TokenKind.StringLiteralToken;
                token.Text = this.state.GetText(startQuote);
                token.Value = parsedStringContent;
                break;
            default:
                if (this.state.IsNameStart(char)) {

                    token.Text = this.tokenScanner.ScanIdentifier();
                    const trimmedText = token.Text.trim().toUpperCase();
                    // First try to match uppercase version against maps
                    let matchedKind = TokenStringMaps.KEYWORDS.get(token.Text) ?? TokenStringMaps.RESERVED_WORDS.get(trimmedText);
                    
                    // Fallback to exact match
                    if (matchedKind === undefined) {
                        for (const [key, val] of TokenStringMaps.KEYWORDS.entries()) {
                            if (key.toUpperCase() === trimmedText) matchedKind = val;
                        }
                        if (matchedKind === undefined) {
                            for (const [key, val] of TokenStringMaps.RESERVED_WORDS.entries()) {
                                if (key.toUpperCase() === trimmedText) matchedKind = val;
                            }
                        }
                    }

                    token.Kind = matchedKind ?? TokenKind.IdentifierToken;
                    token.Value = token.Text; // Ensure Value is populated
                    break;
                }
                else if (this.state.IsDigitChar(char)) {
                    token.Kind = TokenKind.NumberToken;
                    token.Text = this.tokenScanner.ScanDigits();
                    token.Value = token.Text; // Ensure Value is populated
                    break;
                }
                this.state.diagnostics.push({ message: `Unexpected character: ${char}`, start: this.state._pos, length: 1, code: 'TDL1000' });
                this.state._pos++;
                break;
        }
        let end = this.state._pos;
        if (token.Text === "") {
            token.Text = this.state.GetText(start);
        }
        this.triviaScanner.ScanLeadingOrTrailing(true, true, trailingTokens);
        token.FullStart = fullStart;
        token.Start = start;
        token.Length = end - start;
        token.Leading = leadingTokens;
        token.Trailing = trailingTokens;
        return token;
    }
}
