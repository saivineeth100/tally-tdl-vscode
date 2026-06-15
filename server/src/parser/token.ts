import { TokenKind } from "./tokenKind";

export class Token {

    Kind: TokenKind;
    FullStart: number;
    Start: number;
    Length: number;
    Text: string;
    Leading: Token[];
    Trailing: Token[];

    constructor(kind: TokenKind, fullStart: number, start: number, length: number) {
        this.Kind = kind;
        this.FullStart = fullStart;
        this.Start = start;
        this.Length = length;
        this.Text = "";
        this.Leading = [];
        this.Trailing = [];

    }

    GetText(text: string) {
        if (text === null) {
            return null;
        }
        // Fallback to Length if Text is empty
        const len = this.Text.length > 0 ? this.Text.length : this.Length;
        return text.substring(this.Start, this.Start + len);
    }
    GetFullText(text: string): string {
        if (text === null) {
            return "";
        }
        return text.substring(this.FullStart, this.FullStart + this.Length);
    }

    toJSON(text: string): any {
        return {
            kind: TokenKind[this.Kind],
            text: this.GetText(text),
            start: this.Start,
            length: this.Length,
            ...(this.Leading?.length ? { leading: this.Leading.map(t => t.toJSON(text)) } : {}),
            ...(this.Trailing?.length ? { trailing: this.Trailing.map(t => t.toJSON(text)) } : {})
        };
    }

    static mapTokens(tokens: Token[], text: string): any[] {
        return tokens.map(t => t.toJSON(text));
    }
}