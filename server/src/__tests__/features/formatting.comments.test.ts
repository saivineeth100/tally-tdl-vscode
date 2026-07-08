import { describe, it, expect } from 'vitest';
import { formatDocument } from '../../features/formatting';
import { FormattingOptions } from 'vscode-languageserver';
import { Parser } from '../../core/parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DEFAULT_FORMATTING_RULES } from '../../features/formatting/formattingRules';

describe('Formatting - User Snippets', () => {
    const options: FormattingOptions = {
        tabSize: 4,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true
    };

    it('should preserve comments with colons and empty multi-line comments', () => {
        const input = `;; Sri Ganeshji : Sri Balaji : Sri Pitreshwarji : Sri Durgaji : Sri Venkateshwara

/*
*/`;

        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const edits = formatDocument(input, sourceFile, options, DEFAULT_FORMATTING_RULES);

        const doc = TextDocument.create('file://test', 'tdl', 1, input);
        const output = TextDocument.applyEdits(doc, edits);

        // Expect exact preservation (maybe with final newline adjustment if configured)
        // options has trimFinalNewlines: true
        const expected = `;; Sri Ganeshji : Sri Balaji : Sri Pitreshwarji : Sri Durgaji : Sri Venkateshwara

/*
*/
`;
        expect(output).toBe(expected);
    });
});
