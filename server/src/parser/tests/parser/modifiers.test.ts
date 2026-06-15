
import { describe, expect, test } from 'vitest';
import { Parser } from '../../parser';
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
});
