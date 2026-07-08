import { describe, it } from 'vitest';
import { formatDocument } from '../../features/formatting';
import { Parser } from '../../core/parser/parser';
import { DEFAULT_FORMATTING_RULES } from '../../features/formatting/formattingRules';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('Debug Single Line Definition', () => {
    it('formats single line definition', () => {
        const input = `[Report: MyReport] Title: "My Title"`;

        const parser = new Parser(input);
        const sourceFile = parser.parse();
        
        const edits = formatDocument(input, sourceFile, {
            tabSize: 4,
            insertSpaces: true,
            trimTrailingWhitespace: true,
            insertFinalNewline: true,
            trimFinalNewlines: true
        }, DEFAULT_FORMATTING_RULES);

        const doc = TextDocument.create('test://test.tdl', 'tdl', 1, input);
        const result = TextDocument.applyEdits(doc, edits);
        console.log("Input: ", JSON.stringify(input));
        console.log("Result:\n" + result);
    });
});
