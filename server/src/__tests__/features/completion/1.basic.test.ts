import { describe, it, expect, beforeAll } from 'vitest';
import { detectCompletionContext, findDefinitionAtCursor } from '../../../features/completion';
import { Parser } from '../../../core/parser/parser';

describe('Completion Context Detection', () => {

    it('should detect definition name context without modifier', () => {
        const input = `[Report: `;
        const cursor = input.length;

        const context = detectCompletionContext(input, undefined, cursor, undefined);
        expect(context.type).toBe('definition_name');
        expect(context.defType).toBe('Report');
        expect(context.hasModifier).toBe(false);
    });
    
    it('should detect definition name context with modifier (#)', () => {
        const input = `[#Report: `;
        const cursor = input.length;

        const context = detectCompletionContext(input, undefined, cursor, undefined);
        expect(context.type).toBe('definition_name');
        expect(context.defType).toBe('Report');
        expect(context.hasModifier).toBe(true);
        expect(context.modifier).toBe('#');
    });

    

    it('should detect attribute context in empty line', () => {
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