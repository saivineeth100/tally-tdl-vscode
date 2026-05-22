import { describe, it, expect } from 'vitest';
import { provideOnTypeFormatting } from './onTypeFormatting';
import { Position } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

function createMockDocument(text: string) {
    return TextDocument.create('file://test.tdl', 'tdl', 1, text);
}

const defaultOptions = { tabSize: 4, insertSpaces: true };

describe('onTypeFormatting', () => {
    it('should ignore characters other than newline', () => {
        const doc = createMockDocument('[Function: Test]\n001 : Statement\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), ' ', defaultOptions);
        expect(edits).toEqual([]);
    });

    it('should auto-increment simple label', () => {
        const doc = createMockDocument('[Function: Test]\n005 : Statement\n]\n');
        // position.line = 2 means the user just pressed Enter at the end of line 1
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('006 : ');
    });

    it('should auto-close IF block and indent body', () => {
        const doc = createMockDocument('[Function: Test]\n005 : IF ##Condition\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('006 : ');
        expect(edits[1].newText).toBe('\n007 : ENDIF');
    });

    it('should auto-close WHILE block', () => {
        const doc = createMockDocument('[Function: Test]\naa : WHILE ##Condition\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('ab : ');
        expect(edits[1].newText).toBe('\nac : ENDWHILE');
    });

    it('should cascade downstream sequence labels', () => {
        const doc = createMockDocument('[Function: Test]\n001 : First\n\n002 : Second\n003 : Third\n]\n');
        
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(3);
        
        expect(edits[0].newText).toBe('002 : ');
        
        expect(edits[1].newText).toBe('003'); // Now replacing ONLY the label node text
        expect(edits[1].range.start.line).toBe(3);
        
        expect(edits[2].newText).toBe('004'); // Now replacing ONLY the label node text
        expect(edits[2].range.start.line).toBe(4);
    });

    it('should stop cascade at function boundary', () => {
        const doc = createMockDocument('[Function: Test]\n001 : First\n\n002 : Second\n]\n[Function: Other]\n003 : Unrelated\n]\n');
        
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('002 : ');
        expect(edits[1].newText).toBe('003');
    });
});
