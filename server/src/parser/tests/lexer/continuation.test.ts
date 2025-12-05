
import { describe, it, expect } from 'vitest';
import { Lexer } from '../../lexer';
import { TokenKind } from '../../tokenKind';

describe('Lexer - Line Continuation', () => {
    it('should tokenize + and newlines correctly', () => {
        const input = `01 : Action : Arg1, Arg2, +
                  Arg3`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        // Log all tokens for debugging
        tokens.forEach((t, i) => {
            console.log(`Token ${i}: Kind=${TokenKind[t.Kind]} Text='${t.Text}' Leading=${t.Leading?.map(l => TokenKind[l.Kind]).join(',')} Trailing=${t.Trailing?.map(l => TokenKind[l.Kind]).join(',')}`);
        });

        // Basic assertions
        expect(tokens.some(t => t.Kind === TokenKind.PlusToken)).toBe(true);
    });
});
