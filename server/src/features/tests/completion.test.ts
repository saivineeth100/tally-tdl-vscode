import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { detectCompletionContext, findDefinitionAtCursor } from '../completion';

describe('Completion Context Detection', () => {

    it('should detect definition name context with modifier (#)', () => {
        const input = `[#Report: `;
        const cursor = input.length;

        const context = detectCompletionContext(input, undefined, cursor, undefined);
        expect(context.type).toBe('definition_name');
        expect(context.defType).toBe('Report');
        expect(context.hasModifier).toBe(true);
        expect(context.modifier).toBe('#');
    });

    it('should detect definition name context without modifier', () => {
        const input = `[Report: `;
        const cursor = input.length;

        const context = detectCompletionContext(input, undefined, cursor, undefined);
        expect(context.type).toBe('definition_name');
        expect(context.defType).toBe('Report');
        expect(context.hasModifier).toBe(false);
    });

    it('should detect attribute context in empty line', () => {
        const input = `
[Report: MyReport]
    
`; // Cursor at indentation
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        // locate cursor at end of indentation (line 3)
        const lines = input.split('\n');
        const cursor = lines[0].length + 1 + lines[1].length + 1 + 4; // approximate
        // Better: use input.indexOf('    ') + 4
        // But input has multiple spaces.
        // Let's use simpler input.

        const inputSimple = `[Report: R]\n   `;
        const parserSimple = new Parser(inputSimple);
        const sourceFileSimple = parserSimple.parse();
        const cursorSimple = inputSimple.length;

        const currentDef = findDefinitionAtCursor(sourceFileSimple, cursorSimple);
        expect(currentDef).toBeDefined();
        expect(currentDef?.type.text).toBe('Report');

        const context = detectCompletionContext('   ', sourceFileSimple, cursorSimple, currentDef);
        expect(context.type).toBe('attribute');
    });
});
