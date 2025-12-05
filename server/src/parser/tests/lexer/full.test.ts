import { describe, expect, test } from 'vitest';
import { Lexer } from '../../lexer';
import { TokenKind } from '../../tokenKind';

describe('Lexer Full Tests', () => {

    test('Symbols and Prefixes', () => {
        const input = `# ## $ $$ @ @@ * ! _`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(tokens[0].Kind).toBe(TokenKind.HashToken);
        expect(tokens[1].Kind).toBe(TokenKind.DoubleHashToken);
        expect(tokens[2].Kind).toBe(TokenKind.DollarToken);
        expect(tokens[3].Kind).toBe(TokenKind.DoubleDollarToken);
        expect(tokens[4].Kind).toBe(TokenKind.AtTheRateToken);
        expect(tokens[5].Kind).toBe(TokenKind.DoubleAtTheRateToken);
        expect(tokens[6].Kind).toBe(TokenKind.AsteriskToken);
        expect(tokens[7].Kind).toBe(TokenKind.ExclamationToken);
    });

    test('Operators', () => {
        const input = `+ - / * = > < >= <= !=`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(tokens[0].Kind).toBe(TokenKind.PlusToken);
        expect(tokens[1].Kind).toBe(TokenKind.MinusToken);
        expect(tokens[2].Kind).toBe(TokenKind.DivisionToken);
        expect(tokens[3].Kind).toBe(TokenKind.AsteriskToken);
        expect(tokens[4].Kind).toBe(TokenKind.EqualsToken);
        expect(tokens[5].Kind).toBe(TokenKind.GreaterThanToken);
        expect(tokens[6].Kind).toBe(TokenKind.LessThanToken);
        expect(tokens[7].Kind).toBe(TokenKind.GreaterThanEqualsToken);
        expect(tokens[8].Kind).toBe(TokenKind.LessThanEqualsToken);
        expect(tokens[9].Kind).toBe(TokenKind.NotEqualsToken);
    });

    test('Identifiers', () => {
        const input = `MyReport My_Report report123`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        // MyReport
        expect(tokens[0].Kind).toBe(TokenKind.IdentifierToken);
        expect(tokens[0].Text).toBe('MyReport');
        // Space is leading for next token? No, Lexer typically consumes TRAILING whitespace.
        // Let's verify: Scan calls ScanLeadingOrTrailing(..., true, trailingTokens) at end.
        // So tokens[0] should have trailing space.
        expect(tokens[0].Trailing.length).toBeGreaterThan(0);
        expect(tokens[0].Trailing[0].Kind).toBe(TokenKind.SpaceToken);

        // My_Report
        expect(tokens[1].Kind).toBe(TokenKind.IdentifierToken);
        expect(tokens[1].Text).toBe('My_Report');
        expect(tokens[1].Trailing.length).toBeGreaterThan(0);
        expect(tokens[1].Trailing[0].Kind).toBe(TokenKind.SpaceToken);

        // report123
        expect(tokens[2].Kind).toBe(TokenKind.IdentifierToken);
        expect(tokens[2].Text).toBe('report123');
    });

    test('Literals', () => {
        const input = `"Hello World" "Escaped "" Quote" 12345`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(tokens[0].Kind).toBe(TokenKind.StringLiteralToken);
        expect(tokens[0].Text).toBe('Hello World');
        expect(tokens[0].Trailing.length).toBeGreaterThan(0);
        expect(tokens[0].Trailing[0].Kind).toBe(TokenKind.SpaceToken);

        expect(tokens[1].Kind).toBe(TokenKind.StringLiteralToken);
        expect(tokens[1].Text).toBe('Escaped "" Quote');
        expect(tokens[1].Trailing.length).toBeGreaterThan(0);
        expect(tokens[1].Trailing[0].Kind).toBe(TokenKind.SpaceToken);

        expect(tokens[2].Kind).toBe(TokenKind.NumberToken);
        expect(tokens[2].Text).toBe('12345');
    });

    test('Comments', () => {
        const input = `;; This is a comment
        /* Multi
           Line */
        `;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        const eofToken = tokens[0];
        expect(eofToken.Kind).toBe(TokenKind.EndOfFileToken);
        expect(eofToken.Leading.length).toBeGreaterThan(0);

        const singleLineComment = eofToken.Leading.find(t => t.Kind === TokenKind.SingleLineComment);
        expect(singleLineComment).toBeDefined();
        expect(singleLineComment?.Text).toContain('This is a comment');

        const multiLineComment = eofToken.Leading.find(t => t.Kind === TokenKind.MultiLineComment);
        expect(multiLineComment).toBeDefined();
        expect(multiLineComment?.Text).toContain('Multi');
    });

    test('Complex Definition', () => {
        const input = `[Report: MyReport]`;
        const lexer = new Lexer(input);
        const tokens = lexer.Generate();

        expect(tokens[0].Kind).toBe(TokenKind.OpenSquareBracketToken);
        expect(tokens[1].Text).toBe('Report');

        expect(tokens[2].Kind).toBe(TokenKind.ColonToken);
        expect(tokens[2].Trailing.length).toBeGreaterThan(0);
        expect(tokens[2].Trailing[0].Kind).toBe(TokenKind.SpaceToken);

        expect(tokens[3].Text).toBe('MyReport');

        expect(tokens[4].Kind).toBe(TokenKind.CloseSquareBracketToken);
    });
});
