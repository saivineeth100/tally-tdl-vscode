
import { CharacterCodes } from "./characterCodes";
import { Token } from "./token";
import { TokenKind } from "./tokenKind";
import { TokenStringMaps } from "./TokenStringMaps";

export class Lexer {
    _contents: string;
    _pos: number = 0;
    _endOfFilePos: number;
    tokens: Token[] = [];
    constructor(content: string) {
        this._contents = content;
        this._endOfFilePos = this._contents.length;
    }

    public Generate() {
        let token: Token;
        do {
            token = this.ScanNextToken();
            this.tokens.push(token);
        } while (token.Kind !== TokenKind.EndOfFileToken);
        return this.tokens;
    }
    private ScanNextToken(): Token {
        let token = this.Scan();
        return token;
    }
    private Scan(): Token {
        let fullStart = this._pos;
        let leadingTokens: Token[] = [];
        let trailingTokens: Token[] = [];
        this.ScanLeadingOrTrailing(this._pos > 0, false, leadingTokens);
        // Start should be set AFTER scanning leading trivia
        let start = this._pos;
        var token = new Token(TokenKind.Unknown, 0, 0, 0);
        if (this._pos >= this._endOfFilePos) {
            const token = new Token(TokenKind.EndOfFileToken, fullStart, start, this._pos - fullStart);
            token.Text = this.GetText(this._pos);
            token.Leading = leadingTokens;
            return token;
        }
        let char = this.Peek();
        switch (char) {
            case "!":
                this._pos++;
                if (this.Peek() === "=") {
                    this._pos++;
                    token.Kind = TokenKind.NotEqualsToken;
                } else {
                    token.Kind = TokenKind.ExclamationToken;
                }
                break;
            case "#":
                this._pos++;
                if (this.Peek() === "#") {
                    this._pos++;
                    token.Kind = TokenKind.DoubleHashToken;
                } else {
                    token.Kind = TokenKind.HashToken;
                }
                break;
            case "$":
                this._pos++;
                if (this.Peek() === "$") {
                    this._pos++;
                    token.Kind = TokenKind.DoubleDollarToken;
                } else {
                    token.Kind = TokenKind.DollarToken;
                }
                break;
            case "@":
                this._pos++;
                if (this.Peek() === "@") {
                    this._pos++;
                    token.Kind = TokenKind.DoubleAtTheRateToken;
                } else {
                    token.Kind = TokenKind.AtTheRateToken;
                }
                break;
            case "[":
                this._pos++;
                token.Kind = TokenKind.OpenSquareBracketToken;
                break;
            case "%":
                this._pos++;
                token.Kind = TokenKind.PercentToken;
                break;
            case "]":
                this._pos++;
                token.Kind = TokenKind.CloseSquareBracketToken;
                break;
            case ".":
                this._pos++;
                token.Kind = TokenKind.DotToken;
                break;
            case ":":
                this._pos++;
                token.Kind = TokenKind.ColonToken;
                break;
            case "+":
                this._pos++;
                token.Kind = TokenKind.PlusToken;
                break;
            case "(":
                this._pos++;
                token.Kind = TokenKind.OpenParenToken;
                break;
            case ")":
                this._pos++;
                token.Kind = TokenKind.CloseParenToken;
                break;
            case ",":
                this._pos++;
                token.Kind = TokenKind.CommaToken;
                break;
            case "-":
                this._pos++;
                token.Kind = TokenKind.MinusToken;
                break;
            case "/":
                this._pos++;
                token.Kind = TokenKind.DivisionToken;
                break;
            case "*":
                this._pos++;
                token.Kind = TokenKind.AsteriskToken;
                break;
            case ">":
                this._pos++;
                if (this.Peek() === "=") {
                    this._pos++;
                    token.Kind = TokenKind.GreaterThanEqualsToken;
                } else {
                    token.Kind = TokenKind.GreaterThanToken;
                }
                break;
            case "<":
                this._pos++;
                if (this.Peek() === "=") {
                    this._pos++;
                    token.Kind = TokenKind.LessThanEqualsToken;
                } else {
                    token.Kind = TokenKind.LessThanToken;
                }
                break;
            case "=":
                this._pos++;
                token.Kind = TokenKind.EqualsToken;
                break;
            case "\"":
                // Includes quotes in token.Text
                const startQuote = this._pos;
                this._pos++;
                this.ScanText(char); // Advance past content
                if (this._pos < this._endOfFilePos && this.Peek() === char) {
                    this._pos++; // Advance past closing quote
                }
                token.Kind = TokenKind.StringLiteralToken;
                token.Text = this.GetText(startQuote);
                break;
            default:
                if (this.IsNameStart(char)) {

                    token.Text = this.ScanIdentifier();
                    const trimmedText = token.Text.trim().toUpperCase();
                    // First try to match uppercase version against maps
                    let matchedKind = TokenStringMaps.KEYWORDS.get(token.Text) ?? TokenStringMaps.RESERVED_WORDS.get(trimmedText);
                    
                    // Fallback to exact match (some keywords in map might be mixed case if map is not fully uppercase)
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
                    break;
                }
                else if (this.IsDigitChar(char)) {
                    token.Kind = TokenKind.NumberToken;
                    token.Text = this.ScanDigits();
                    break;
                }
                this._pos++;
                break;
        }
        if (token.Text === "") {
            token.Text = this.GetText(start);
        }
        this.ScanLeadingOrTrailing(true, true, trailingTokens);
        token.FullStart = fullStart;
        token.Start = start;
        token.Length = this._pos - fullStart;
        token.Leading = leadingTokens;
        token.Trailing = trailingTokens;
        return token;
    }
    ScanText(quoteChar: string = "\""): string {
        let start_pos = this._pos;
        while (this._pos < this._endOfFilePos) {
            const char = this.Peek();
            if (char === quoteChar) {
                if (this._pos + 1 < this._endOfFilePos && this._contents[this._pos + 1] === char) {
                    // Escaped quote ("" or ''), consume both
                    this._pos++;
                    this._pos++;
                    continue;
                }
                return this.GetText(start_pos);
            }
            else {
                this._pos++;
            }
        }
        return "";
    }
    ScanDigits(): string {
        let start_pos = this._pos;
        while (this._pos < this._endOfFilePos && this.IsDigitChar(this.Peek())) {
            this._pos++;
        }
        if (this._pos < this._endOfFilePos && this.Peek() === '.' &&
            this._pos + 1 < this._endOfFilePos && this.IsDigitChar(this._contents[this._pos + 1])) {
            this._pos++; // consume '.'
            while (this._pos < this._endOfFilePos && this.IsDigitChar(this.Peek())) {
                this._pos++;
            }
        }
        return this.GetText(start_pos);
    }
    private GetText(start: number): string {
        return this._contents.substring(start, this._pos);
    }
    Peek(): string {
        return this._contents.substring(this._pos, this._pos + 1);
    }
    ScanLeadingOrTrailing(isFollowing: boolean, isTrailing: boolean, tokens: Token[]) {
        let onlyWhitespaceOnLine = !isTrailing;
        if (onlyWhitespaceOnLine || isFollowing) { }
        while (true) {
            let ch = this.Peek();
            if (ch === ' ') {
                tokens.push(this.ScanWhitespace());
                continue;
            }
            switch (ch) {
                case ' ':
                case '\t':       // Horizontal tab
                case '\v':       // Vertical Tab
                case '\f':       // Form-feed
                case '\u001A':
                    tokens.push(this.ScanWhitespace());
                    break;
                case '\r':
                case '\n':
                    tokens.push(this.ScanEndOfLine());
                    if (isTrailing) {
                        return;
                    }
                    break;
                case ";":
                    tokens.push(this.ScanSingleLineComment());
                    break;
                case "/":
                    if (this._pos + 1 < this._endOfFilePos && this._contents[this._pos + 1] === "*") {
                        const commentStart = this._pos;
                        this._pos++;
                        this._pos++;
                        tokens.push(this.ScanMultiLineComment(commentStart));
                        break;
                    }
                    return;
                default:
                    return;

            }


        }
    }
    ScanMultiLineComment(start: number): Token {
        while (this._pos < this._endOfFilePos) {
            let charCode = this.Peek();
            switch (charCode) {
                case '*':
                    if (this._pos + 1 < this._endOfFilePos && this._contents[this._pos + 1] === "/") {
                        this._pos++; // consume *
                        this._pos++; // consume /
                        const dtoken = new Token(TokenKind.MultiLineComment, start, start, this._pos - start);
                        dtoken.Text = this.GetText(start);
                        return dtoken;
                    }
                    this._pos++;
                    continue;
                default:
                    this._pos++;
                    continue;
            }

        }
        return new Token(TokenKind.Unknown, start, start, this._pos - start);
    }
    ScanSingleLineComment() {
        let start = this._pos;
        while (this._pos < this._endOfFilePos) {
            let charCode = this.Peek();
            switch (charCode) {
                case '\r':
                case '\n':
                    const dtoken = new Token(TokenKind.SingleLineComment, start, start, this._pos - start);
                    dtoken.Text = this.GetText(start);
                    return dtoken;
                default:
                    this._pos++;
                    continue;
            }

        }
        const token = new Token(TokenKind.SingleLineComment, start, start, this._pos - start);
        token.Text = this.GetText(start);
        return token;
    }
    ScanEndOfLine(): Token {
        let start = this._pos;
        const ch = this.Peek();
        switch (ch) {
            case '\r':
                this._pos++;
                if (this.Peek() === "\n") {
                    this._pos++;
                    const token = new Token(TokenKind.CarriageReturnLineFeed, start, start, this._pos - start);
                    token.Text = this.GetText(start);
                    return token;
                }
                else {
                    const token = new Token(TokenKind.CarriageReturn, start, start, this._pos - start);
                    token.Text = this.GetText(start);
                    return token;
                }
            case '\n':
                this._pos++;
                const token = new Token(TokenKind.LineFeed, start, start, this._pos - start);
                token.Text = this.GetText(start);
                return token;
            default:
                this._pos++;
                const dtoken = new Token(TokenKind.Unknown, start, start, this._pos - start);
                dtoken.Text = this.GetText(start);
                return dtoken;
        }

    }
    ScanWhitespace(): Token {
        let start = this._pos;
        const text = this.ScanSpaces();
        const token = new Token(TokenKind.SpaceToken, start, start, this._pos - start);
        token.Text = text;
        return token;
    }

    // private peek(offset: number = 0): string {
    //     if (this._pos + offset < this._endOfFilePos) {
    //         return this._contents[this._pos + offset];
    //     }
    //     return "";
    // }
    // private consume(): string {
    //     if (this._pos < this._endOfFilePos) {
    //         return this._contents[this._pos++];
    //     }
    //     return "";
    // }
    ScanAttributeType() {
        let text = this._contents;
        while (this._pos < this._endOfFilePos) {
            let charCode = text.codePointAt(this._pos)!;
            if (charCode === CharacterCodes.Colon) {
                return;
            }
            this._pos++;
        }
    }
    ScanSpaces(): string {
        let start_pos = this._pos;
        while (this._pos < this._endOfFilePos) {
            let charCode = this.Peek();
            switch (charCode) {
                case '\t':       // Horizontal tab
                case '\v':       // Vertical Tab
                case '\f':       // Form-feed
                case '\u001A':
                    this._pos++;
                    continue;
                case ' ':
                    this._pos++;
                    continue;
            }
            return this.GetText(start_pos);
        }
        return "";
    }
    ScanIdentifier(): string {
        let start_pos = this._pos;
        while (this._pos < this._endOfFilePos) {
            let charCode = this.Peek();
            if (this.IsNameNonDigitChar(charCode) || this.IsDigitChar(charCode) || charCode === "_") {
                this._pos++;
                continue;
            }
            return this.GetText(start_pos);
        }
        return "";
    }
    IsNameStart(char: string): boolean {
        return this._pos < this._endOfFilePos && this.IsNameNonDigitChar(char);
    }
    IsNameNonDigitChar(char: string): boolean {
        return this.IsNonDigitChar(char);
    }

    IsValidNameUnicodeChar(_charcode: number): boolean {
        // TODO
        return true;
    }
    /**
     * 
     * @param char 
     * @returns 
     */
    IsNonDigitChar(char: string): boolean {

        return (
            (char >= "a" && char <= "z") ||
            (char >= "A" && char <= "Z") ||
            (char === "_")
        );
    }
    IsDigitChar(char: string): boolean {
        return (
            (char >= "0") &&
            (char <= "9")
        );
    }
    IsNonZeroDigitChar(charcode: number): boolean {
        return (
            (charcode > CharacterCodes._0) &&
            (charcode <= CharacterCodes._9)
        );
    }

}


