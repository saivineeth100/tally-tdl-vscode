import { describe, expect, test } from 'vitest';
import { Token } from '../../../core/lexer/token';
import { TokenKind } from '../../../core/lexer/tokenKind';

describe('Token Class', () => {
    test('GetText and GetFullText with valid string', () => {
        // constructor(kind: TokenKind, fullStart: number, start: number, length: number)
        const token = new Token(TokenKind.IdentifierToken, 5, 10, 8);
        token.Text = "foo";
        const input = "0123456789foo_test";
        
        // start is 10, Text.length is 3. So substring(10, 13) -> "foo"
        expect(token.GetText(input)).toBe("foo");
        
        // fullStart is 5, length is 8. substring(5, 13) -> "56789foo"
        expect(token.GetFullText(input)).toBe("56789foo");
    });

    test('GetText and GetFullText with null string', () => {
        const token = new Token(TokenKind.IdentifierToken, 5, 10, 8);
        token.Text = "foo";
        
        // Should return token.Text or empty string based on implementation
        expect(token.GetText(null as any)).toBe("foo");
        expect(token.GetFullText(null as any)).toBe("foo");
    });
});
