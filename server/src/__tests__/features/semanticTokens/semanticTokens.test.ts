import { describe, it, expect } from 'vitest';
import { Parser } from '../../../core/parser/parser';
import { getSemanticTokens, TDL_SEMANTIC_TOKEN_ROLES } from '../../../features/semanticTokens/semanticTokens';
import { SemanticTokenTypes } from 'vscode-languageserver';
import { testScopeManager } from '../../../__tests__/test-setup';

/**
 * Helper to parse TDL and get tokens
 */
export function parseAndGetTokens(tdl: string) {
    const parser = new Parser(tdl);
    const sourceFile = parser.parse();
    return getSemanticTokens(sourceFile, testScopeManager);
}

describe('Semantic Tokens', () => {
    it('should tokenize Directives', () => {
        const tdl = `<Deftype: Report>
        [Report: MyReport]
        <InUse: Report: Balance Sheet>`;
        const tokens = parseAndGetTokens(tdl);

        const directiveTypeToken = tokens.find((t: any) => t.text === 'Deftype');
        expect(directiveTypeToken).toBeDefined();
        expect(directiveTypeToken!.type).toBe(SemanticTokenTypes.macro);

        const inUseToken = tokens.find((t: any) => t.text === 'InUse');
        expect(inUseToken).toBeDefined();
        expect(inUseToken!.type).toBe(SemanticTokenTypes.macro);
    });

    it('should tokenize Directives with spaces in definition types and names', () => {
        const tdl = `<Deftype: Report Space>
        [Report: MyReport]
        <InUse: Report Space: Some Space Name>`;
        const tokens = parseAndGetTokens(tdl);

        const deftypeTypeToken = tokens.find((t: any) => t.text === 'Report Space');
        expect(deftypeTypeToken).toBeDefined();
        expect(deftypeTypeToken!.type).toBe(SemanticTokenTypes.keyword); // Definition type is highlighted as 'keyword' to match headers

        const inUseTypeToken = tokens.find((t: any) => t.text === 'Report Space');
        expect(inUseTypeToken).toBeDefined();
        expect(inUseTypeToken!.type).toBe(SemanticTokenTypes.keyword);

        const inUseNameToken = tokens.find((t: any) => t.text === 'Some Space Name');
        expect(inUseNameToken).toBeDefined();
        expect(inUseNameToken!.type).toBe(SemanticTokenTypes.class); // Definition name is highlighted as 'class'
    });

    it('should tokenize Property Names', () => {
        const tdl = `[Report: Test]
            Title: "My Title"`;
        const tokens = parseAndGetTokens(tdl);

        const propToken = tokens.find((t: any) => t.text === 'Title');
        expect(propToken).toBeDefined();
        expect(propToken!.type).toBe(SemanticTokenTypes.macro);
    });

    it('should tokenize Menu Item List attributes correctly', () => {
        const tdl = `[Menu: Test]
            Item: My Item : Display : SomeReport
            Key Item: First : A : Menu : SubMenu`;
        const tokens = parseAndGetTokens(tdl);

        // 'Display' is an action, should be keyword
        const displayToken = tokens.find((t: any) => t.text === 'Display');
        expect(displayToken).toBeDefined();
        expect(displayToken!.type).toBe(SemanticTokenTypes.keyword);

        // 'SomeReport' is a report reference, should be class
        const reportToken = tokens.find((t: any) => t.text === 'SomeReport');
        expect(reportToken).toBeDefined();
        expect(reportToken!.type).toBe(SemanticTokenTypes.class);

        // 'Menu' is an action, should be keyword
        const menuActionToken = tokens.find((t: any) => t.text === 'Menu' && t.type === SemanticTokenTypes.keyword);
        expect(menuActionToken).toBeDefined();

        // 'SubMenu' is a menu reference, should be class
        const subMenuToken = tokens.find((t: any) => t.text === 'SubMenu');
        expect(subMenuToken).toBeDefined();
        expect(subMenuToken!.type).toBe(SemanticTokenTypes.class);
    });

    it('should tokenize multiple attribute values', () => {
        const tdl = `[Form: Test]
            Parts: P1, P2
            Variable: GroupName`;
        const tokens = parseAndGetTokens(tdl);

        const p1Token = tokens.find((t: any) => t.text === 'P1');
        expect(p1Token).toBeDefined();
        // Since Parts is not explicitly in ATTRIBUTE_CONTEXT, it might fallback to variable
        // But 'Part' is in ATTRIBUTE_CONTEXT. Let's see what it resolves to.
        expect(p1Token!.type).toBe(SemanticTokenTypes.class);

        const p2Token = tokens.find((t: any) => t.text === 'P2');
        expect(p2Token).toBeDefined();
        expect(p2Token!.type).toBe(SemanticTokenTypes.class);
    });

    it('should tokenize boolean keywords inside definition names based on context', () => {
        const tdl = `[Part: Test]
            Lines: Input Date, No of Days`;
        const tokens = parseAndGetTokens(tdl);

        const inputDateToken = tokens.find((t: any) => t.text === 'Input Date');
        expect(inputDateToken).toBeDefined();
        expect(inputDateToken!.type).toBe(SemanticTokenTypes.class);

        const noToken = tokens.find((t: any) => t.text === 'No');
        expect(noToken).toBeDefined();
        expect(noToken!.type).toBe(SemanticTokenTypes.class);

        const ofDaysToken = tokens.find((t: any) => t.text === 'of Days');
        expect(ofDaysToken).toBeDefined();
        expect(ofDaysToken!.type).toBe(SemanticTokenTypes.class);
    });

    it('should tokenize Functions ($$)', () => {
        const tdl = `[System: Formula]
            Test: $$Date`;
        const tokens = parseAndGetTokens(tdl);

        // Should tokenize 'Date' or '$$Date' effectively as function
        // Ideally we strip $$ for the token text but range covers it, or just token type matters
        const funcToken = tokens.find((t: any) => t.text?.includes('Date'));
        expect(funcToken).toBeDefined();
        expect(funcToken!.type).toBe(SemanticTokenTypes.function);
    });

    it('should tokenize Variables (##)', () => {
        const tdl = `[System: Formula]
            Test: ##SVCurrentDate`;
        const tokens = parseAndGetTokens(tdl);

        const varToken = tokens.find((t: any) => t.text?.includes('SVCurrentDate'));
        expect(varToken).toBeDefined();
        expect(varToken!.type).toBe(SemanticTokenTypes.variable);
    });

    it('should tokenize Formulae (@@)', () => {
        const tdl = `[Field: Test]
            Set As: @@MyFormula`;
        const tokens = parseAndGetTokens(tdl);

        const macroToken = tokens.find((t: any) => t.text?.includes('MyFormula'));
        expect(macroToken).toBeDefined();
        // Formulae are often treated as Macros or Variables
        expect([SemanticTokenTypes.macro, SemanticTokenTypes.variable]).toContain(macroToken!.type);
    });

    it('should handle complex expressions', () => {
        const tdl = `[Field: Test]
            Set As: $$Date + ##Variable`;
        const tokens = parseAndGetTokens(tdl);

        expect(tokens.some((t: any) => t.type === SemanticTokenTypes.function)).toBe(true);
        expect(tokens.some((t: any) => t.type === SemanticTokenTypes.variable)).toBe(true);
    });

    it('should tokenize Fields (#) and Methods ($)', () => {
        const tdl = `[Field: Test]
            Set As: #MyField + $MyMethod`;
        const tokens = parseAndGetTokens(tdl);

        const fieldToken = tokens.find((t: any) => t.text?.includes('MyField'));
        expect(fieldToken).toBeDefined();
        expect(fieldToken!.type).toBe(SemanticTokenTypes.variable); // Fields are variables

        const methodToken = tokens.find((t: any) => t.text?.includes('MyMethod'));
        expect(methodToken).toBeDefined();
        expect(methodToken!.type).toBe(SemanticTokenTypes.function); // Methods are functions
    });
});
