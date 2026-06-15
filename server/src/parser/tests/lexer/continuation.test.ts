import { describe, it, expect } from 'vitest';
import { Lexer } from '../../lexer';
import { Token } from '../../token';
import { TokenKind } from '../../tokenKind';


describe('Lexer - Line Continuation', () => {
    it('should tokenize + and newlines correctly', () => {
        const input = `01 : Action : Arg1, Arg2, +
                  Arg3`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(Token.mapTokens(tokens, input)).toMatchSnapshot();
    });
});
