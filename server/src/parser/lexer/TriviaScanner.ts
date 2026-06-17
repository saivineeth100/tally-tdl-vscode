import { LexerState } from "./LexerState";
import { Token } from "../token";
import { TokenKind } from "../tokenKind";

/**
 * Handles the scanning of trivia elements such as whitespace, newlines, and comments.
 * These are typically attached as leading or trailing trivia to standard syntax tokens.
 */
export class TriviaScanner {
    private state: LexerState;

    /**
     * Initializes the TriviaScanner with a reference to the LexerState.
     * @param state The state object managing the token stream.
     */
    constructor(state: LexerState) {
        this.state = state;
    }

    /**
     * Scans any leading or trailing trivia from the current position.
     * @param isFollowing Whether this trivia is following another token immediately.
     * @param isTrailing Whether to scan trailing trivia (stops at first newline).
     * @param tokens The array to append the generated trivia tokens to.
     */
    public ScanLeadingOrTrailing(isFollowing: boolean, isTrailing: boolean, tokens: Token[]) {
        while (true) {
            let ch = this.state.Peek();
            switch (ch) {
                case ' ':
                case '\t':
                case '\v':
                case '\f':
                case '\u001A':
                    tokens.push(this.ScanWhitespace());
                    break;
                case '\r':
                case '\n':
                    tokens.push(this.ScanEndOfLine());
                    if (isTrailing) {
                        return; // Trailing trivia stops after the first line break
                    }
                    break;
                case ";":
                    tokens.push(this.ScanSingleLineComment());
                    break;
                case "/":
                    if (this.state._pos + 1 < this.state._endOfFilePos && this.state._contents[this.state._pos + 1] === "*") {
                        const commentStart = this.state._pos;
                        this.state._pos += 2; // consume /*
                        tokens.push(this.ScanMultiLineComment(commentStart));
                        break;
                    }
                    return; // Just a slash, not a comment
                default:
                    return; // Non-trivia character encountered, stop scanning
            }
        }
    }

    /**
     * Scans horizontal whitespace characters.
     */
    private ScanWhitespace(): Token {
        let start = this.state._pos;
        while (this.state._pos < this.state._endOfFilePos) {
            let charCode = this.state.Peek();
            switch (charCode) {
                case '\t':
                case '\v':
                case '\f':
                case '\u001A':
                case ' ':
                    this.state._pos++;
                    continue;
            }
            break;
        }
        const text = this.state.GetText(start);
        const token = new Token(TokenKind.SpaceToken, start, start, this.state._pos - start);
        token.Text = text;
        return token;
    }

    /**
     * Scans a single line comment starting with `;`.
     */
    private ScanSingleLineComment(): Token {
        let start = this.state._pos;
        while (this.state._pos < this.state._endOfFilePos) {
            let charCode = this.state.Peek();
            if (charCode === '\r' || charCode === '\n') {
                break;
            }
            this.state._pos++;
        }
        const token = new Token(TokenKind.SingleLineComment, start, start, this.state._pos - start);
        token.Text = this.state.GetText(start);
        return token;
    }

    /**
     * Scans a multi-line comment starting with `/*`.
     * @param start The starting position of the comment including the `/*`.
     */
    private ScanMultiLineComment(start: number): Token {
        while (this.state._pos < this.state._endOfFilePos) {
            let charCode = this.state.Peek();
            if (charCode === '*' && this.state._pos + 1 < this.state._endOfFilePos && this.state._contents[this.state._pos + 1] === '/') {
                this.state._pos += 2; // consume */
                const token = new Token(TokenKind.MultiLineComment, start, start, this.state._pos - start);
                token.Text = this.state.GetText(start);
                return token;
            }
            this.state._pos++;
        }
        
        // Unclosed multi-line comment
        this.state.diagnostics.push({ message: 'Unclosed multi-line comment', start, length: this.state._pos - start, code: 'TDL1000' });
        const token = new Token(TokenKind.Unknown, start, start, this.state._pos - start);
        token.Text = this.state.GetText(start);
        return token;
    }

    /**
     * Scans a line break (`\n`, `\r`, or `\r\n`).
     */
    private ScanEndOfLine(): Token {
        let start = this.state._pos;
        const ch = this.state.Peek();
        if (ch === '\r') {
            this.state._pos++;
            if (this.state.Peek() === '\n') {
                this.state._pos++;
                const token = new Token(TokenKind.CarriageReturnLineFeed, start, start, this.state._pos - start);
                token.Text = this.state.GetText(start);
                return token;
            }
            const token = new Token(TokenKind.CarriageReturn, start, start, this.state._pos - start);
            token.Text = this.state.GetText(start);
            return token;
        } else if (ch === '\n') {
            this.state._pos++;
            const token = new Token(TokenKind.LineFeed, start, start, this.state._pos - start);
            token.Text = this.state.GetText(start);
            return token;
        }
        
        this.state._pos++;
        const token = new Token(TokenKind.Unknown, start, start, this.state._pos - start);
        token.Text = this.state.GetText(start);
        return token;
    }
}
