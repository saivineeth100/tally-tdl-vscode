import { describe, it, expect } from 'vitest';
import { Parser } from '../../../parser/parser';
import { getSemanticTokens } from '../semanticTokens';
import { SemanticTokenTypes } from 'vscode-languageserver';
import { testScopeManager } from '../../../test-setup';

/**
 * Helper to parse TDL and get tokens
 */
export function parseAndGetTokens(tdl: string) {
    const parser = new Parser(tdl);
    const sourceFile = parser.parse();
    return getSemanticTokens(sourceFile, testScopeManager);
}

describe('Semantic Tokens', () => {
    it('should tokenize Class Definitions', () => {
        const tdl = `[Report: MyReport]`;
        const tokens = parseAndGetTokens(tdl);

        // Find token for 'MyReport'
        const classToken = tokens.find(t => t.text === 'MyReport');
        expect(classToken).toBeDefined();
        expect(classToken!.type).toBe(SemanticTokenTypes.class);
    });

    it('should tokenize Class Definitions with spaces', () => {
        const tdl = `[Report: My Report Name]`;
        const tokens = parseAndGetTokens(tdl);

        const classToken = tokens.find(t => t.text === 'My Report Name');
        expect(classToken).toBeDefined();
        expect(classToken!.type).toBe(SemanticTokenTypes.class);
    });

    it('should tokenize Property Names', () => {
        const tdl = `[Report: Test]
            Title: "My Title"`;
        const tokens = parseAndGetTokens(tdl);

        const propToken = tokens.find(t => t.text === 'Title');
        expect(propToken).toBeDefined();
        expect(propToken!.type).toBe(SemanticTokenTypes.property);
    });

    it('should tokenize multiple attribute values', () => {
        const tdl = `[Form: Test]
            Parts: P1, P2
            Variable: GroupName`;
        const tokens = parseAndGetTokens(tdl);

        const p1Token = tokens.find(t => t.text === 'P1');
        expect(p1Token).toBeDefined();
        // Since Parts is not explicitly in ATTRIBUTE_CONTEXT, it might fallback to variable
        // But 'Part' is in ATTRIBUTE_CONTEXT. Let's see what it resolves to.
        expect(p1Token!.type).toBe(SemanticTokenTypes.class);

        const p2Token = tokens.find(t => t.text === 'P2');
        expect(p2Token).toBeDefined();
        expect(p2Token!.type).toBe(SemanticTokenTypes.class);
    });

    it('should tokenize boolean keywords inside definition names based on context', () => {
        const tdl = `[Part: Test]
            Lines: Input Date, No of Days`;
        const tokens = parseAndGetTokens(tdl);

        const inputDateToken = tokens.find(t => t.text === 'Input Date');
        expect(inputDateToken).toBeDefined();
        expect(inputDateToken!.type).toBe(SemanticTokenTypes.class);

        const noToken = tokens.find(t => t.text === 'No');
        expect(noToken).toBeDefined();
        expect(noToken!.type).toBe(SemanticTokenTypes.class);

        const ofDaysToken = tokens.find(t => t.text === 'of Days');
        expect(ofDaysToken).toBeDefined();
        expect(ofDaysToken!.type).toBe(SemanticTokenTypes.class);
    });

    it('should tokenize Functions ($$)', () => {
        const tdl = `[System: Formula]
            Test: $$Date`;
        const tokens = parseAndGetTokens(tdl);

        // Should tokenize 'Date' or '$$Date' effectively as function
        // Ideally we strip $$ for the token text but range covers it, or just token type matters
        const funcToken = tokens.find(t => t.text?.includes('Date'));
        expect(funcToken).toBeDefined();
        expect(funcToken!.type).toBe(SemanticTokenTypes.function);
    });

    it('should tokenize Variables (##)', () => {
        const tdl = `[System: Formula]
            Test: ##SVCurrentDate`;
        const tokens = parseAndGetTokens(tdl);

        const varToken = tokens.find(t => t.text?.includes('SVCurrentDate'));
        expect(varToken).toBeDefined();
        expect(varToken!.type).toBe(SemanticTokenTypes.variable);
    });

    it('should tokenize Formulae (@@)', () => {
        const tdl = `[Field: Test]
            Set As: @@MyFormula`;
        const tokens = parseAndGetTokens(tdl);

        const macroToken = tokens.find(t => t.text?.includes('MyFormula'));
        expect(macroToken).toBeDefined();
        // Formulae are often treated as Macros or Variables
        expect([SemanticTokenTypes.macro, SemanticTokenTypes.variable]).toContain(macroToken!.type);
    });

    it('should handle complex expressions', () => {
        const tdl = `[Field: Test]
            Set As: $$Date + ##Variable`;
        const tokens = parseAndGetTokens(tdl);

        expect(tokens.some(t => t.type === SemanticTokenTypes.function)).toBe(true);
        expect(tokens.some(t => t.type === SemanticTokenTypes.variable)).toBe(true);
    });

    it('should tokenize Fields (#) and Methods ($)', () => {
        const tdl = `[Field: Test]
            Set As: #MyField + $MyMethod`;
        const tokens = parseAndGetTokens(tdl);

        const fieldToken = tokens.find(t => t.text?.includes('MyField'));
        expect(fieldToken).toBeDefined();
        expect(fieldToken!.type).toBe(SemanticTokenTypes.variable); // Fields are variables

        const methodToken = tokens.find(t => t.text?.includes('MyMethod'));
        expect(methodToken).toBeDefined();
        expect(methodToken!.type).toBe(SemanticTokenTypes.function); // Methods are functions
    });
});
