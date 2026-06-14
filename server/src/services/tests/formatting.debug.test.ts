import { describe, it } from 'vitest';
import { formatDocument } from '../formatting';
import { FormattingOptions } from 'vscode-languageserver';
import { Parser } from '../../parser/parser';

describe('Debug Formatting', () => {
    it('should print output', () => {
        const input = `[Report: Report1]
Title : "My Title"
Form  : MyForm
Part:MyPart`;

        const options: FormattingOptions = {
            tabSize: 4,
            insertSpaces: true,
            trimTrailingWhitespace: true,
            insertFinalNewline: true,
            trimFinalNewlines: true
        };

        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const edits = formatDocument(input, sourceFile, options);

    });
});
