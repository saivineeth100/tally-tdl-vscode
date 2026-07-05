/**
 * Tests for definition header semantic token generation.
 * Validates that definition types, names (with or without spaces),
 * and modifiers in the header are correctly assigned their semantic token roles.
 */
import { describe, it, expect } from 'vitest';
import { Parser } from '../../../core/parser/parser';
import { getSemanticTokens, TDL_SEMANTIC_TOKEN_ROLES } from '../../../features/semanticTokens/semanticTokens';
import { testScopeManager } from '../../../__tests__/test-setup';

/**
 * Helper to parse TDL and get tokens
 */
function parseAndGetTokens(tdl: string) {
    const parser = new Parser(tdl);
    const sourceFile = parser.parse();
    return getSemanticTokens(sourceFile, testScopeManager);
}

describe('Semantic Tokens - [deftype:defname]', () => {
    // Relocated tests
    it('should tokenize Class Definitions', () => {
        const tdl = `[Report: MyReport]`;
        const tokens = parseAndGetTokens(tdl);

        // Find token for 'MyReport'
        const classToken = tokens.find((t: any) => t.text === 'MyReport');
        expect(classToken).toBeDefined();
        expect(classToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);

        // Find token for 'Report'
        const typeToken = tokens.find((t: any) => t.text === 'Report');
        expect(typeToken).toBeDefined();
        expect(typeToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defType);
    });

    it('should tokenize Class Definitions with spaces', () => {
        const tdl = `[Report: My Report Name]`;
        const tokens = parseAndGetTokens(tdl);

        const classToken = tokens.find((t: any) => t.text === 'My Report Name');
        expect(classToken).toBeDefined();
        expect(classToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);
    });

    it('should tokenize Modifiers', () => {
        const tdl = `[#Report: Test]`;
        const tokens = parseAndGetTokens(tdl);

        const modifierToken = tokens.find((t: any) => t.text === '#');
        expect(modifierToken).toBeDefined();
        expect(modifierToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.modifier);
    });

    // New tests for detailed roles, spaces, and whitespaces
    it('should assign correct semantic roles for exclamation modifier header [!Report: MyReport]', () => {
        const tdl = `[!Report: MyReport]`;
        const tokens = parseAndGetTokens(tdl);

        const modifierToken = tokens.find((t: any) => t.text === '!');
        const typeToken = tokens.find((t: any) => t.text === 'Report');
        const nameToken = tokens.find((t: any) => t.text === 'MyReport');

        expect(modifierToken).toBeDefined();
        expect(modifierToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.modifier);

        expect(typeToken).toBeDefined();
        expect(typeToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defType);

        expect(nameToken).toBeDefined();
        expect(nameToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);
    });

    it('should handle definition names containing spaces', () => {
        const tdl = `[Report: Balance Sheet]`;
        const tokens = parseAndGetTokens(tdl);

        const typeToken = tokens.find((t: any) => t.text === 'Report');
        const nameToken = tokens.find((t: any) => t.text === 'Balance Sheet');

        expect(typeToken).toBeDefined();
        expect(typeToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defType);

        expect(nameToken).toBeDefined();
        expect(nameToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);
    });

    it('should assign correct semantic roles for System: Formula, System: Variable, System: TDL Name and System: UDF headers', () => {
        const tdl = `[System: Formula]\n[System: Variable]\n[System: TDL Name]\n[System: UDF]`;
        const tokens = parseAndGetTokens(tdl);

        const typeTokens = tokens.filter((t: any) => t.text === 'System');
        const formulaToken = tokens.find((t: any) => t.text === 'Formula');
        const variableToken = tokens.find((t: any) => t.text === 'Variable');
        const tdlNameToken = tokens.find((t: any) => t.text === 'TDL Name');
        const udfToken = tokens.find((t: any) => t.text === 'UDF');

        expect(typeTokens.length).toBe(4);
        typeTokens.forEach(t => {
            expect(t.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defType);
        });

        expect(formulaToken).toBeDefined();
        expect(formulaToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);

        expect(variableToken).toBeDefined();
        expect(variableToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);

        expect(tdlNameToken).toBeDefined();
        expect(tdlNameToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);

        expect(udfToken).toBeDefined();
        expect(udfToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);
    });

    it('should only tokenize non-whitespace segments and ignore extra spacing', () => {
        const tdl = `[   Report   :   Balance Sheet   ]`;
        const tokens = parseAndGetTokens(tdl);

        // Verify there is no token matching any large spacing block
        const spaceTokens = tokens.filter((t: any) => t.text?.trim() === '');
        expect(spaceTokens.length).toBe(0);

        const typeToken = tokens.find((t: any) => t.text === 'Report');
        const nameToken = tokens.find((t: any) => t.text === 'Balance Sheet');

        expect(typeToken).toBeDefined();
        expect(typeToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defType);
        expect(typeToken!.length).toBe(6);

        expect(nameToken).toBeDefined();
        expect(nameToken!.type).toBe(TDL_SEMANTIC_TOKEN_ROLES.defName);
        expect(nameToken!.length).toBe(13);
    });
});
