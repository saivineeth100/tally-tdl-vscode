import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { detectCompletionContext, findDefinitionAtCursor } from '../completion';

describe('Completion Attribute Value Context', () => {

    it('should detect attribute_value context', () => {
        // [Report: MyReport]
        //      Form: MyForm
        const input = `[Report: MyReport]\n    Form: My`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        // findDefinitionAtCursor relies on line mapping which might not be perfect with single string
        // but let's try.
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);

        // Mock textBefore as the line text up to cursor
        const textBefore = '    Form: My';

        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);

        expect(context.type).toBe('attribute_value');
        expect(context.attributeName).toBe('Form');
        expect(context.paramIndex).toBe(0);
        expect(context.partial).toBe('My');
    });

    it('should detect attribute_value context for second parameter', () => {
        // [Report: MyReport]
        //      Title: "My Title", "Subtitle"
        const input = `[Report: MyReport]\n    Title: "My Title", Sub`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);

        const textBefore = '    Title: "My Title", Sub';

        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);

        expect(context.type).toBe('attribute_value');
        expect(context.attributeName).toBe('Title');
        expect(context.paramIndex).toBe(1);
        expect(context.partial).toBe('Sub');
    });

    it('should detect formula context with @@', () => {
        const input = `[Report: MyReport]\n    Set As : @@My`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Set As : @@My';

        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);

        expect(context.type).toBe('formula');
        expect(context.partial).toBe('My');
    });
});
