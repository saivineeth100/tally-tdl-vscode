import { describe, it, expect } from 'vitest';
import { Lexer } from '../../../core/lexer/lexer';
import { Token } from '../../../core/lexer/token';
import { TokenKind } from '../../../core/lexer/tokenKind';


describe('Lexer - Line Continuation', () => {
    it('should tokenize + and newlines correctly', () => {
        const input = `01 : Action : Arg1, Arg2, +
                  Arg3`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });

    it('should handle + as line continuation and + as unary string concatenation correctly', () => {
        const input = `Local : Field : Purpose : Info : "Line 1 " +
            + "Line 2 " +
            + "Line 3"`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });

    it('should correctly parse multi-line strings with + continuation', () => {
        const input = `"To illustrate the functionality of Action HTTP Request, branch details are fetched using HTTP Get request in both XML +
and JSON format which  is further displayed in a report if the request is successful"`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();
        
        expect(lexer.diagnostics.length).toBe(0);
        // There should be a colon, and then a string literal
        const stringToken = tokens.find(t => t.Kind === TokenKind.StringLiteralToken);
        expect(stringToken).toBeDefined();
        
        // Ensure string literal is cleanly parsed across lines (stripped of +, newlines, and leading spaces)
        expect(stringToken?.Value).toContain('in both XML and JSON format');
        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });
});
