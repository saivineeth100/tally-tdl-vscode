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

    it('should auto-increment multi-digit label', () => {
        const doc = createMockDocument('[Function: Test]\n099 : Statement\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('100 : ');
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

    it('should auto-close all block types (IF, WHILE, FOR, WALK, StartBlock, BatchPost)', () => {
        const blocks = [
            { open: 'IF ##Condition', close: 'ENDIF' },
            { open: 'WHILE ##Condition', close: 'ENDWHILE' },
            { open: 'FOR : Var : 1 : 10', close: 'ENDFOR' },
            { open: 'WALK : Collection', close: 'ENDWALK' },
            { open: 'START BLOCK', close: 'END BLOCK' },
            { open: 'START BATCH POST', close: 'END BATCH POST' }
        ];

        for (const block of blocks) {
            const doc = createMockDocument(`[Function: Test]\n01 : ${block.open}\n]\n`);
            const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
            
            expect(edits.length).toBe(2);
            expect(edits[0].newText).toBe('02 : ');
            expect(edits[1].newText).toBe(`\n03 : ${block.close}`);
        }
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

    it('should cascade renumbering with 10+ labels', () => {
        const doc = createMockDocument(
            '[Function: Test]\n' +
            '001 : First\n\n' +
            '002 : S\n003 : S\n004 : S\n005 : S\n006 : S\n' +
            '007 : S\n008 : S\n009 : S\n010 : S\n011 : S\n]\n'
        );
        
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(11);
        expect(edits[0].newText).toBe('002 : ');
        expect(edits[1].newText).toBe('003');
        expect(edits[10].newText).toBe('012');
    });

    it('should stop cascade at function boundary', () => {
        const doc = createMockDocument('[Function: Test]\n001 : First\n\n002 : Second\n]\n[Function: Other]\n003 : Unrelated\n]\n');
        
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('002 : ');
        expect(edits[1].newText).toBe('003');
    });

    it('should not format outside Function definitions', () => {
        const doc = createMockDocument('[Report: Test]\n001 : Statement\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits).toEqual([]);
    });
});
