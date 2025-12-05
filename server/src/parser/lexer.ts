
import { CharacterCodes } from "./characterCodes";
import { Token } from "./token";
import { TokenKind } from "./tokenKind";

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
        let leaingTokens: Token[] = [];
        let trailingTokens: Token[] = [];
        let start = this._pos;
        this.ScanLeadingOrTrailing(this._pos > 0, false, leaingTokens);
        var token = new Token(TokenKind.Unknown, 0, 0, 0);
        if (this._pos >= this._endOfFilePos) {
            const token = new Token(TokenKind.EndOfFileToken, fullStart, start, this._pos - fullStart);
            token.Text = this.GetText(this._pos);
            token.Leading = leaingTokens;
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
                this._pos++;
                token.Text = this.ScanText();
                token.Kind = TokenKind.StringLiteralToken;
                this._pos++;
                break;
            default:
                if (this.IsNameStart(char)) {

                    token.Kind = TokenKind.IdentifierToken;
                    token.Text = this.ScanIdentifier();
                    break;
                    //const trimmedText = token.Text.replaceAll(" ", "");
                    //token.Kind = TokenStringMaps.KEYWORDS.get(trimmedText) ?? TokenStringMaps.RESERVED_WORDS.get(trimmedText) ?? token.Kind;
                    //return new Token(TokenKind.IdentifierToken, fullStart, start, this._pos - fullStart);
                }
                else if (this.IsDigitChar(char)) {
                    token.Kind = TokenKind.NumberToken;
                    token.Text = this.ScanDigits();
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
        token.Leading = leaingTokens;
        token.Trailing = trailingTokens;
        return token;
    }
    ScanText(): string {
        let start_pos = this._pos;
        while (this._pos < this._endOfFilePos) {
            const char = this.Peek();
            if (char === "\"" || char === "\'") {
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
        while (this._pos < this._endOfFilePos) {
            if (this.IsDigitChar(this.Peek())) {
                this._pos++;
                continue;
            }
            return this.GetText(start_pos);
        }
        return "";
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
                        this._pos++;
                        this._pos++;
                        tokens.push(this.ScanMultiLineComment());
                        break;
                    }
                    return;
                default:
                    return;

            }


        }
    }
    ScanMultiLineComment(): Token {
        let start = this._pos;
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
        return new Token(TokenKind.Unknown, start, start, this._pos - start);
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


