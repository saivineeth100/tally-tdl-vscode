import { describe, it, expect } from 'vitest';
import { formatDocument } from '../formatting';
import { FormattingOptions } from 'vscode-languageserver';
import { Parser } from '../../parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('Document Formatting', () => {
    const options: FormattingOptions = {
        tabSize: 4,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true
    };

    function apply(input: string, expected: string) {
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const edits = formatDocument(input, sourceFile, options);
        
        const doc = TextDocument.create('test://test.tdl', 'tdl', 1, input);
        const result = TextDocument.applyEdits(doc, edits);
        expect(result).toBe(expected);
    }

    it('should indent attributes inside a definition', () => {
        const input = `[Report: MyReport]
Title: "My Title"
Form: MyForm`;

        const expected = `[Report: MyReport]
    Title: "My Title"
    Form: MyForm
`; // Expect final newline

        apply(input, expected);
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
        apply(input, expected);
    });

    it('should handle existing indentation', () => {
        const input = `[Report: MyReport]
        Title: "My Title"`;

        const expected = `[Report: MyReport]
    Title: "My Title"
`;
        apply(input, expected);
    });

    it('should preserve spacing around colons for alignment', () => {
        const input = `[Report: Report1]
    Title : "My Title"
    Form  : MyForm
    Part: MyPart`;

        // Currently alignment logic is not fully implemented in Trivia-based, 
        // but it should at least not strip spaces before colon if we handle it correctly.
        // Actually formatting.ts adds space after colon, but doesn't do column alignment yet.
        // We'll just check it formats basic stuff.
        
        const expectedBasic = `[Report: Report1]
    Title : "My Title"
    Form  : MyForm
    Part: MyPart
`;
        apply(input, expectedBasic);
    });
});
