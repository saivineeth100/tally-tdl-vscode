
import { describe, expect, test } from 'vitest';
import { Parser } from '../../../core/parser/parser';
import { cleanAST } from './utils';

describe('Parser Modifiers Tests', () => {
    test('Parse Definition with Modifier', () => {
        const input = `[#Report: MyReport]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Definition with Optional Modifier', () => {
        const input = `[!Field: MyField]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Local Modifier with Set as and Variables', () => {
        const input = `[Report: Test]
Local: Field: Default: Set as: #MyField
Local: Field: Default: Set as: ##MyVar`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });
});
