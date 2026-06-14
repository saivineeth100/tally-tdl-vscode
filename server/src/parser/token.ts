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
        return text.substring(this.Start, this.Start + this.Text.length);
    }
    GetFullText(text: string): string {
        if (text === null) {
            return "";
        }
        return text.substring(this.FullStart, this.FullStart + this.Length);
    }

}