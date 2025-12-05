
import { describe, expect, test } from 'vitest';
import { Parser } from '../../parser';
import { TokenKind } from '../../tokenKind';

describe('Parser Modifiers Tests', () => {
    test('Parse Definition with Modifier', () => {
        const input = `[#Report: MyReport]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile).toBeDefined();
        expect(sourceFile.definitions.length).toBeGreaterThan(0);

        const def = sourceFile.definitions[0];
        expect(def.modifier).toBeDefined();
        expect(def.modifier?.Kind).toBe(TokenKind.HashToken);
        expect(def.type.text).toBe('Report');
        expect(def.name?.text).toBe('MyReport');
    });

    test('Parse Definition with Optional Modifier', () => {
        const input = `[!Field: MyField]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile.definitions.length).toBeGreaterThan(0);
        const def = sourceFile.definitions[0];
        expect(def.modifier?.Kind).toBe(TokenKind.ExclamationToken);
        expect(def.type.text).toBe('Field');
    });
});
