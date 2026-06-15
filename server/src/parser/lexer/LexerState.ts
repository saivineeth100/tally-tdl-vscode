import { Token } from "../token";
import { CharacterCodes } from "../characterCodes";

/**
 * Represents a diagnostic error or warning generated during lexical analysis.
 * Useful for highlighting illegal characters or unclosed strings in the editor.
 */
export interface LexicalDiagnostic {
    message: string;
    start: number;
    length: number;
}

/**
 * Manages the core state of the lexer, including the raw character stream, current position,
 * and diagnostic tracking. Also provides low-level character inspection utilities.
 */
export class LexerState {
    public _contents: string;
    public _pos: number = 0;
    public _endOfFilePos: number;
    public tokens: Token[] = [];
    
    /** Collection of lexical errors encountered during tokenization */
    public diagnostics: LexicalDiagnostic[] = [];

    /**
     * Initializes a new LexerState with the given source content.
     * @param content The raw TDL source code string.
     */
    constructor(content: string) {
        this._contents = content;
        this._endOfFilePos = this._contents.length;
    }

    /**
     * Retrieves the character at the current position.
     * @returns A single character string, or an empty string if at EOF.
     */
    public Peek(): string {
        return this._pos < this._endOfFilePos ? this._contents.substring(this._pos, this._pos + 1) : "";
    }

    /**
     * Retrieves a substring of the contents from the given start position to the current position.
     * @param start The starting index.
     * @returns The extracted substring.
     */
    public GetText(start: number): string {
        return this._contents.substring(start, this._pos);
    }

    /**
     * Checks if the character is a valid starting character for an identifier.
     * @param char The character to check.
     */
    public IsNameStart(char: string): boolean {
        return this._pos < this._endOfFilePos && this.IsNameNonDigitChar(char);
    }

    /**
     * Checks if the character is a valid non-digit character for an identifier.
     * @param char The character to check.
     */
    public IsNameNonDigitChar(char: string): boolean {
        return this.IsNonDigitChar(char);
    }

    /**
     * Checks if the character is a basic alphabet letter or underscore.
     * @param char The character to check.
     */
    public IsNonDigitChar(char: string): boolean {
        return (
            (char >= "a" && char <= "z") ||
            (char >= "A" && char <= "Z") ||
            (char === "_")
        );
    }

    /**
     * Checks if the character is a numeric digit (0-9).
     * @param char The character to check.
     */
    public IsDigitChar(char: string): boolean {
        return (char >= "0" && char <= "9");
    }

    /**
     * Checks if the numeric character code is a non-zero digit (1-9).
     * @param charcode The character code.
     */
    public IsNonZeroDigitChar(charcode: number): boolean {
        return (charcode > CharacterCodes._0 && charcode <= CharacterCodes._9);
    }
}
