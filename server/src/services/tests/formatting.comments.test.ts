import { describe, it, expect } from 'vitest';
import { formatDocument } from '../formatting';
import { FormattingOptions } from 'vscode-languageserver';
import { Parser } from '../../parser/parser';

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
        const edits = formatDocument(input, sourceFile, options);

        const output = edits[0].newText;

        // Expect exact preservation (maybe with final newline adjustment if configured)
        // options has trimFinalNewlines: true
        const expected = `;; Sri Ganeshji : Sri Balaji : Sri Pitreshwarji : Sri Durgaji : Sri Venkateshwara

/*
*/
`;
        expect(output).toBe(expected);
    });
});
