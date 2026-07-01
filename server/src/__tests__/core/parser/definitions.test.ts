
import { describe, expect, test } from 'vitest';
import { Parser } from '../../../core/parser/parser';
import { cleanAST } from './utils';

describe('Parser Definitions Tests', () => {

    test('Parse Basic Definition', () => {
        const input = `[Report: MyReport]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Definition with Attributes', () => {
        const input = `
[Report: MyReport]
    Title: "My Tally Report"
    Form: MyForm
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Definition with Spaces in Name', () => {
        const input = `[Report: My Report Name]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Definition with Symbols in Name (Include)', () => {
        const input = `[Include: file.txt]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Definition with @@include', () => {
        const input = `[@@include : license\\licfuncs.tdl]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Definition Range includes Attributes', () => {
        const input = `
[Report: MyReport]
    Title: "My Tally Report"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Menu Definition with Numbers and Decimals', () => {
        const input = `[Menu: Whats New in Rel 1.52]

	Indent		: "Dynamic Evaluation in Functions"
	Item		: Blank
	Key Item	: "Dynamic Action" 		`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });
});
