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
        let result = "";
        let start_pos = this.state._pos;
        while (this.state._pos < this.state._endOfFilePos) {
            const char = this.state.Peek();

            if (char === '+') {
                // Check if it's a line continuation (TDL allows splitting strings across lines using +)
                let lookaheadPos = this.state._pos + 1;
                let isLineContinuation = false;
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

                if (isLineContinuation || lookaheadPos === this.state._endOfFilePos) {
                    // It's a line continuation inside a string! Skip past the newline.
                    this.state._pos = lookaheadPos;
                    if (this.state._pos < this.state._endOfFilePos && this.state._contents[this.state._pos] === ';') {
                        // Skip the comment
                        while (this.state._pos < this.state._endOfFilePos) {
                            const c = this.state._contents[this.state._pos];
                            if (c === '\n' || c === '\r') break;
                            this.state._pos++;
                        }
                    }
                    if (this.state._pos < this.state._endOfFilePos && this.state._contents[this.state._pos] === '\r') this.state._pos++;
                    if (this.state._pos < this.state._endOfFilePos && this.state._contents[this.state._pos] === '\n') this.state._pos++;
                    
                    // SKIP leading whitespace on the new line!
                    while (this.state._pos < this.state._endOfFilePos) {
                        const c = this.state.Peek();
                        if (c === ' ' || c === '\t') {
                            this.state._pos++;
                        } else {
                            break;
                        }
                    }
                    continue; // Skip appending anything to result!
                }
            }

            if (char === '\n' || char === '\r') {
                this.state.diagnostics.push({ message: 'Unclosed string literal', start: start_pos - 1, length: this.state._pos - start_pos + 1 });
                break; // Unclosed string, stop at newline
            }
            if (char === quoteChar) {
                if (this.state._pos + 1 < this.state._endOfFilePos && this.state._contents[this.state._pos + 1] === char) {
                    // Escaped quote ("" or ''), consume both
                    result += char + char;
                    this.state._pos += 2;
                    continue;
                }
                break; // Found closing quote, lexer.ts will consume it
            } else {
                result += char;
                this.state._pos++;
            }
        }
        
        // If we reached EOF without a closing quote or a newline
        if (this.state._pos >= this.state._endOfFilePos) {
            const lastChar = this.state._contents[this.state._pos - 1];
            if (lastChar !== '\n' && lastChar !== '\r' && lastChar !== quoteChar) {
                this.state.diagnostics.push({ message: 'Unclosed string literal', start: start_pos - 1, length: this.state._pos - start_pos + 1 });
            }
        }
        
        return result;
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
