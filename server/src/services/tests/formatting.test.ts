import { describe, it, expect } from 'vitest';
import { formatDocument } from '../formatting';
import { FormattingOptions } from 'vscode-languageserver';
import { Parser } from '../../parser/parser';

describe('Document Formatting', () => {
    const options: FormattingOptions = {
        tabSize: 4,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true
    };

    it('should indent attributes inside a definition', () => {
        const input = `[Report: MyReport]
Title: "My Title"
Form: MyForm`;

        const expected = `[Report: MyReport]
    Title: "My Title"
    Form: MyForm
`; // Expect final newline

        const parser = new Parser(input);
        const sourceFile = parser.parse();

        const edits = formatDocument(input, sourceFile, options);
        expect(edits).toBeDefined();
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe(expected);
    });

    it('should indent comments inside a definition', () => {
        const input = `[Report: MyReport]
Title: "My Title"
;; This is a comment inside
Form: MyForm`;

        const expected = `[Report: MyReport]
    Title: "My Title"
    ;; This is a comment inside
    Form: MyForm
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        const edits = formatDocument(input, sourceFile, options);
        expect(edits[0].newText).toBe(expected);
    });

    it('should handle existing indentation', () => {
        const input = `[Report: MyReport]
        Title: "My Title"`;

        const expected = `[Report: MyReport]
    Title: "My Title"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        const edits = formatDocument(input, sourceFile, options);
        expect(edits[0].newText).toBe(expected);
    });

    it('should preserve spacing around colons for alignment', () => {
        const input = `[Report: Report1]
    Title : "My Title"
    Form  : MyForm
    Part: MyPart`;

        const expected = `[Report: Report1]
    Title : "My Title"
    Form  : MyForm
    Part: MyPart
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        const edits = formatDocument(input, sourceFile, options);
        expect(edits[0].newText).toBe(expected);
    });
});
