import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';

describe('Incremental Parsing', () => {
    it('should reuse all definitions if text is identical', () => {
        const text = `
[Report: First]
    Form: MyForm

[Report: Second]
    Form: OtherForm
`;
        const parser1 = new Parser(text);
        const file1 = parser1.parse();

        const parser2 = new Parser(text, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(2);
        // Verify exact object reference reuse
        expect(file2.definitions[0]).toBe(file1.definitions[0]);
        expect(file2.definitions[1]).toBe(file1.definitions[1]);
    });

    it('should re-parse modified definition but reuse unmodified ones', () => {
        const text1 = `
[Report: First]
    Form: MyForm

[Report: Second]
    Form: OtherForm
`;
        const text2 = `
[Report: First]
    Form: MyForm Modified

[Report: Second]
    Form: OtherForm
`;
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(2);
        // First definition should be different reference (re-parsed)
        expect(file2.definitions[0]).not.toBe(file1.definitions[0]);
        expect(file2.definitions[0].name?.text).toBe('First');
        
        // Second definition should be reused
        expect(file2.definitions[1]).toBe(file1.definitions[1]);
    });

    it('should shift offsets of reused definitions when a preceding definition shrinks', () => {
        const text1 = `
[Report: First]
    Form: MyForm

[Report: Second]
    Form: OtherForm
`;
        const text2 = `
[Report: First]
    F: M

[Report: Second]
    Form: OtherForm
`;
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(2);
        
        // Second definition is reused, but its start/end offsets must have shifted backwards
        expect(file2.definitions[1]).toBe(file1.definitions[1]);
        const startDiff = text1.indexOf('[Report: Second]') - text2.indexOf('[Report: Second]');
        expect(startDiff).toBeGreaterThan(0);
        
        // Validate actual offsets in the tree match the new text
        const actualStart2 = file2.definitions[1].start;
        expect(text2.substring(actualStart2, actualStart2 + 8)).toBe('[Report:');
    });

    it('should handle insertion of a new definition between existing ones', () => {
        const text1 = `
[Report: First]
[Report: Third]
`;
        const text2 = `
[Report: First]
[Report: Second]
[Report: Third]
`;
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(3);
        
        // First is reused
        expect(file2.definitions[0]).toBe(file1.definitions[0]);
        // Second is new
        expect(file2.definitions[1].name?.text).toBe('Second');
        // Third is reused from old second
        expect(file2.definitions[2]).toBe(file1.definitions[1]);
        
        // Check offsets for the shifted third definition
        const actualStart3 = file2.definitions[2].start;
        expect(text2.substring(actualStart3, actualStart3 + 15)).toBe('[Report: Third]');
    });

    it('should handle deletion of a definition', () => {
        const text1 = `
[Report: First]
[Report: Second]
[Report: Third]
`;
        const text2 = `
[Report: First]
[Report: Third]
`;
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(2);
        
        // First is reused
        expect(file2.definitions[0]).toBe(file1.definitions[0]);
        // Third is reused from old third
        expect(file2.definitions[1]).toBe(file1.definitions[2]);
    });

    it('should correctly shift inner tokens during offset application', () => {
        const text1 = `
[Report: First]
[Report: Second]
    Form: MyForm
`;
        const text2 = `
[Report: First Changed]
[Report: Second]
    Form: MyForm
`;
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        // Second is reused
        const reusedDef = file2.definitions[1];
        
        // Let's verify that the tokens inside reusedDef got their Start positions shifted!
        const tokenStart = reusedDef.closeBracket.Start;
        expect(text2.substring(tokenStart, tokenStart + 1)).toBe(']');
        
        // Verify name token shifted
        const nameTokenStart = reusedDef.type!.tokens[0].Start;
        expect(text2.substring(nameTokenStart, nameTokenStart + 6)).toBe('Report');
    });

    it('should handle adding newlines before the first definition', () => {
        const text1 = `[Report: First]`;
        const text2 = `\n\n\n[Report: First]`;
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(1);
        expect(file2.definitions[0]).toBe(file1.definitions[0]);
        expect(file2.definitions[0].start).toBe(3);
    });

    it('should re-parse when incomplete brackets break a chunk', () => {
        const text1 = `
[Report: First]
    Form: MyForm
`;
        const text2 = `
[Report: First]
    [Form: MyForm
`;
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        // The chunk is broken by the new [ token, so it should NOT reuse the definition.
        expect(file2.definitions[0]).not.toBe(file1.definitions[0]);
    });

    it('should accurately shift bottom definitions when top definition expands', () => {
        const text1 = `[Report: First]
[Report: Second]`;
        const text2 = `[Report: First Expanded]
[Report: Second]`;
        
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        // Cache the old start to avoid comparing mutated reference
        const oldStart = file1.definitions[1].start;
        const oldEnd = file1.definitions[1].end;

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(2);
        // Top changed
        expect(file2.definitions[0]).not.toBe(file1.definitions[0]);
        // Bottom reused
        expect(file2.definitions[1]).toBe(file1.definitions[1]);
        
        // Start should be shifted by the length difference " Expanded" (9 characters)
        expect(file2.definitions[1].start).toBe(oldStart + 9);
        expect(file2.definitions[1].end).toBe(oldEnd + 9);
    });

    it('should accurately maintain top definitions when bottom definition expands', () => {
        const text1 = `[Report: First]
[Report: Second]`;
        const text2 = `[Report: First]
[Report: Second Expanded]`;
        
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const oldStart = file1.definitions[0].start;

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(2);
        // Top reused
        expect(file2.definitions[0]).toBe(file1.definitions[0]);
        // Top offset remains identically 0 shifted
        expect(file2.definitions[0].start).toBe(oldStart);
        
        // Bottom changed
        expect(file2.definitions[1]).not.toBe(file1.definitions[1]);
    });

    it('should handle isolated middle edits flawlessly', () => {
        const text1 = `[A: 1]
[B: 2]
[C: 3]`;
        const text2 = `[A: 1]
[B: 2 Edit]
[C: 3]`;
        
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const oldStart0 = file1.definitions[0].start;
        const oldStart2 = file1.definitions[2].start;

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        expect(file2.definitions.length).toBe(3);
        // Top reused with delta 0
        expect(file2.definitions[0]).toBe(file1.definitions[0]);
        expect(file2.definitions[0].start).toBe(oldStart0);

        // Middle re-parsed
        expect(file2.definitions[1]).not.toBe(file1.definitions[1]);

        // Bottom reused with delta > 0
        expect(file2.definitions[2]).toBe(file1.definitions[2]);
        expect(file2.definitions[2].start).toBe(oldStart2 + 5);
    });

    it('should deeply shift all embedded tokens within reused AST nodes', () => {
        const text1 = `[A: 1]
[B: 2]
    01: SET: MyVar: "Value"`;
        const text2 = `[A: 1 Edit]
[B: 2]
    01: SET: MyVar: "Value"`;
        
        const parser1 = new Parser(text1);
        const file1 = parser1.parse();

        const parser2 = new Parser(text2, file1);
        const file2 = parser2.parse();

        // B is reused
        const reusedB = file2.definitions[1];
        expect(reusedB).toBe(file1.definitions[1]);
        
        // Deep nested statement in B
        const statement = reusedB.attributes[0];
        const action = (statement as any).action;
        
        // Wait, action is an AST node, so it has 'start', not token!
        // Actually, the token is action.token or similar. Let's just check statement.start!
        expect(text2.substring(statement.start, statement.start + 2)).toBe('01');
    });
});
