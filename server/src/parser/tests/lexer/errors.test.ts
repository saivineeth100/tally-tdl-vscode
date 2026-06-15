import { describe, expect, test } from 'vitest';
import { Lexer } from '../../lexer';
import { Token } from '../../token';
import { TokenKind } from '../../tokenKind';

describe('Lexer Error and Edge Cases', () => {

    test('Unclosed String Literal', () => {
        const tdl = `[Report: Test]\nTitle: "Unclosed string \nVariable: Test`;
        const lexer = new Lexer(tdl);
        const tokens = lexer.Generate();
        expect(lexer.diagnostics).toMatchSnapshot();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });

    test('Unclosed Multi Line Comment', () => {
        const tdl = `/* This comment never ends
[Report: Trial Balance]
Title: "Hello"`;
        const lexer = new Lexer(tdl);
        const tokens = lexer.Generate();
        expect(lexer.diagnostics).toMatchSnapshot();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });

    test('Illegal Characters', () => {
        // TDL doesn't formally use tilde or caret in standard syntax
        const tdl = `[Report: ~Test^]`;
        const lexer = new Lexer(tdl);
        const tokens = lexer.Generate();
        expect(lexer.diagnostics).toMatchSnapshot();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });

    test('Empty File', () => {
        const tdl = ``;
        const lexer = new Lexer(tdl);
        const tokens = lexer.Generate();
        expect(lexer.diagnostics).toMatchSnapshot();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });

    test('Only Whitespace and Comments', () => {
        const tdl = `   \n\n;; Just a comment\n\n   /* block \n */ \n`;
        const lexer = new Lexer(tdl);
        const tokens = lexer.Generate();
        expect(lexer.diagnostics).toMatchSnapshot();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });

});
