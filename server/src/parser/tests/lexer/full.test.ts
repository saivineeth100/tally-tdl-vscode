import { describe, expect, test } from 'vitest';
import { Lexer } from '../../lexer';
import { Token } from '../../token';
import { TokenKind } from '../../tokenKind';


describe('Lexer Full Tests', () => {

    test('Symbols and Prefixes', () => {
        const input = `# ## $ $$ @ @@ * ! _`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });

    test('Operators', () => {
        const input = `+ - / * = > < >= <= !=`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });

    test('Identifiers', () => {
        const input = `MyReport My_Report report123`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });

    test('Literals', () => {
        const input = `"Hello World" "Escaped "" Quote" 12345`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });

    test('Comments', () => {
        const input = `;; This is a comment
        /* Multi
           Line */
        `;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });

    test('Complex Definition', () => {
        const input = `[Report: MyReport]`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });
});
