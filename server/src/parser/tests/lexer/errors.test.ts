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

    test('Unclosed String Literal at EOF', () => {
        const tdl = `[Report: Test]\nTitle: "Unclosed string at EOF`;
        const lexer = new Lexer(tdl);
        const tokens = lexer.Generate();
        expect(lexer.diagnostics.length).toBe(1);
        expect(lexer.diagnostics[0].message).toBe('Unclosed string literal');
        expect(lexer.diagnostics).toMatchSnapshot();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });

    test('Unclosed Multi Line String Literal', () => {
        const tdl = `[Report: Test]
Title: "This is an unclosed +
multi-line string +
that stops here
Variable: Test`;
        const lexer = new Lexer(tdl);
        const tokens = lexer.Generate();
        
        expect(lexer.diagnostics.length).toBe(1);
        expect(lexer.diagnostics[0].message).toBe('Unclosed string literal');
        
        // The diagnostic should start on line 2 (where the quote is) and end on line 4 (where it stops).
        // Let's verify that the tokens recover and correctly parse Variable: Test
        const variableToken = tokens.find(t => t.Text === 'Variable');
        expect(variableToken).toBeDefined(); // Ensures recovery happened!

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
