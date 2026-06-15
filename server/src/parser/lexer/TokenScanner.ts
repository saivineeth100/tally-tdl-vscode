import { LexerState } from "./LexerState";

/**
 * Handles the scanning of structural tokens, such as strings, numbers, and identifiers.
 */
export class TokenScanner {
    private state: LexerState;

    /**
     * Initializes the TokenScanner with a reference to the LexerState.
     * @param state The state object managing the token stream.
     */
    constructor(state: LexerState) {
        this.state = state;
    }

    /**
     * Scans a string literal starting from the current position.
     * @param quoteChar The character used to enclose the string (usually `"`).
     * @returns The extracted string literal text, including the enclosing quotes.
     */
    public ScanText(quoteChar: string = "\""): string {
        let start_pos = this.state._pos;
        while (this.state._pos < this.state._endOfFilePos) {
            const char = this.state.Peek();
            if (char === '\n' || char === '\r') {
                this.state.diagnostics.push({ message: 'Unclosed string literal', start: start_pos - 1, length: this.state._pos - start_pos + 1 });
                break; // Unclosed string, stop at newline
            }
            if (char === quoteChar) {
                if (this.state._pos + 1 < this.state._endOfFilePos && this.state._contents[this.state._pos + 1] === char) {
                    // Escaped quote ("" or ''), consume both
                    this.state._pos += 2;
                    continue;
                }
                return this.state.GetText(start_pos);
            } else {
                this.state._pos++;
            }
        }
        return "";
    }

    /**
     * Scans a numeric sequence, including optional decimal points.
     * @returns The extracted number as a string.
     */
    public ScanDigits(): string {
        let start_pos = this.state._pos;
        while (this.state._pos < this.state._endOfFilePos && this.state.IsDigitChar(this.state.Peek())) {
            this.state._pos++;
        }
        if (this.state._pos < this.state._endOfFilePos && this.state.Peek() === '.' &&
            this.state._pos + 1 < this.state._endOfFilePos && this.state.IsDigitChar(this.state._contents[this.state._pos + 1])) {
            this.state._pos++; // consume '.'
            while (this.state._pos < this.state._endOfFilePos && this.state.IsDigitChar(this.state.Peek())) {
                this.state._pos++;
            }
        }
        return this.state.GetText(start_pos);
    }

    /**
     * Scans an identifier (e.g., keyword, definition type, or name).
     * Stops at the first non-name character (like spaces, brackets, operators).
     * @returns The extracted identifier string.
     */
    public ScanIdentifier(): string {
        let start_pos = this.state._pos;
        while (this.state._pos < this.state._endOfFilePos) {
            let charCode = this.state.Peek();
            if (this.state.IsNameNonDigitChar(charCode) || this.state.IsDigitChar(charCode) || charCode === "_") {
                this.state._pos++;
                continue;
            }
            return this.state.GetText(start_pos);
        }
        return "";
    }
}
