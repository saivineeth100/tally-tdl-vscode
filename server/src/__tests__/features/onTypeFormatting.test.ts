import { describe, it, expect, vi } from 'vitest';
import { provideOnTypeFormatting } from '../../features/onTypeFormatting';
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

    it('should auto-increment alphanumeric label formats', () => {
        const doc = createMockDocument('[Function: Test]\nStep05 : Statement\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);

        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('Step06 : ');
    });

    it('should auto-increment uppercase alphabetic label formats', () => {
        const doc = createMockDocument('[Function: Test]\nZ : Statement\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);

        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('AA : ');
    });

    it('should auto-increment mixed case alphabetic label formats', () => {
        const doc = createMockDocument('[Function: Test]\naZ : Statement\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);

        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('bA : ');
    });

    it('should auto-close IF block and indent body', () => {
        const doc = createMockDocument('[Function: Test]\n005 : IF ##Condition\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);

        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('006 :     ');
        expect(edits[1].newText).toBe('007 : ENDIF\n');
    });

    it('should auto-close WHILE block', () => {
        const doc = createMockDocument('[Function: Test]\naa : WHILE ##Condition\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);

        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('ab :     ');
        expect(edits[1].newText).toBe('ac : ENDWHILE\n');
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
            expect(edits[0].newText).toBe('02 :     ');
            expect(edits[1].newText).toBe(`03 : ${block.close}\n`);
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

    it('should suggest correct indentation on enter inside nested blocks', () => {
        const doc = createMockDocument(
            '[Function: Test]\n' +
            '01 : IF ##Condition\n' +
            '02 :     IF ##Inner\n' +
            '03 :         SET : Val : 10\n' +
            '04 :     ENDIF\n' +
            '05 : ENDIF\n' +
            ']\n'
        );
        // User hits Enter after line 3 (SET statement)
        const edits = provideOnTypeFormatting(doc, Position.create(4, 0), '\n', defaultOptions);

        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('04 :         '); // 2 tabs/8 spaces of action indent
    });

    it('should suggest correct indentation on enter after ELSE', () => {
        const doc = createMockDocument(
            '[Function: Test]\n' +
            '01 : IF ##Condition\n' +
            '02 :     SET : Val : 10\n' +
            '03 : ELSE :\n' +
            '04 : ENDIF\n' +
            ']\n'
        );
        // User hits Enter after ELSE (line 3)
        const edits = provideOnTypeFormatting(doc, Position.create(4, 0), '\n', defaultOptions);

        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe('04 :     '); // 1 indent (4 spaces) for else body
    });

    it('should auto-reduce indentation when typing ELSE', () => {
        const doc = createMockDocument(
            '[Function: Test]\n' +
            '01 : IF ##Condition\n' +
            '02 :     SET : Val : 10\n' +
            '03 :     ELSE :\n' +
            '04 : ENDIF\n' +
            ']\n'
        );
        const edits = provideOnTypeFormatting(doc, Position.create(3, 15), ':', defaultOptions);

        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe(' : ');
    });



    it('should cascade sequence labels when hitting Enter after IF block opener with existing downstream statements', () => {
        const doc = createMockDocument(
            '[Function: Test]\n' +
            '00 : IF ##Condition\n' +
            '\n' +
            '01 :     log : "fgf"\n' +
            '02 : ELSE :\n' +
            '03 :     Log : fdgdr\n' +
            '04 : ENDIF\n' +
            ']\n'
        );
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);

        expect(edits.length).toBe(5);
        expect(edits[0].newText).toBe('01 :     ');
        expect(edits[1].newText).toBe('02');
        expect(edits[2].newText).toBe('03');
        expect(edits[3].newText).toBe('04');
        expect(edits[4].newText).toBe('05');
    });

    it('should cascade sequence labels when hitting Enter after IF block opener with simple log and ENDIF downstream', () => {
        const doc = createMockDocument(
            '[Function: Test]\n' +
            '00 : IF ##Condition\n' +
            '\n' +
            '01 :     log : "hello"\n' +
            '02 : ENDIF\n' +
            ']\n'
        );
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);

        expect(edits.length).toBe(3);
        expect(edits[0].newText).toBe('01 :     ');
        expect(edits[1].newText).toBe('02');
        expect(edits[2].newText).toBe('03');
    });
    it('should auto-close START BLOCK and indent its body', () => {
        const doc = createMockDocument('[Function: Test]\n005 : START BLOCK\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('006 :     ');
        expect(edits[1].newText).toBe('007 : END BLOCK\n');
    });

    it('should auto-reduce indentation when typing END BLOCK', () => {
        const doc = createMockDocument(
            '[Function: Test]\n' +
            '01 : START BLOCK\n' +
            '02 :     SET : Val : 10\n' +
            '03 :     END BLOCK :\n' +
            ']\n'
        );
        const edits = provideOnTypeFormatting(doc, Position.create(3, 21), ':', defaultOptions);
        
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe(' : ');
    });

    it('should auto-reduce indentation when typing CASE', () => {
        const doc = createMockDocument(
            '[Function: Test]\n' +
            '01 : SWITCH : ##Condition\n' +
            '02 :     CASE : 1\n' +
            '03 :         SET : Val : 10\n' +
            '04 :         CASE :\n' +
            '05 : END SWITCH\n' +
            ']\n'
        );
        const edits = provideOnTypeFormatting(doc, Position.create(4, 19), ':', defaultOptions);
        
        expect(edits.length).toBe(1);
        expect(edits[0].newText).toBe(' :     ');
    });

    it('should auto-close IF block and indent body when using lowercase if without spaces', () => {
        const doc = createMockDocument('[Function: Test]\n00 : if :Yes\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);
        
        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('01 :     ');
        expect(edits[1].newText).toBe('02 : ENDIF\n');
    });

    it('should notify client of the cursor position when auto-closing blocks', () => {
        const doc = createMockDocument('[Function: Test]\n00 : if :Yes\n]\n');
        const mockClient = {
            notify: vi.fn(),
            showInformationMessage: vi.fn(),
            showErrorMessage: vi.fn(),
            refreshSemanticTokens: vi.fn(),
            refreshCodeLens: vi.fn(),
            getConfiguration: vi.fn(),
            getWorkspaceFolders: vi.fn()
        };
        
        provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions, undefined, mockClient);
        
        expect(mockClient.notify).toHaveBeenCalledWith('tdl/setCursorPosition', {
            line: 2,
            character: 9 // '01 :     '.length
        });
    });

    it('should auto-close INSERT COLLECTION OBJECT block and indent body', () => {
        const doc = createMockDocument('[Function: Test]\n10 : INSERT COLLECTION OBJECT : INVENTORYENTRIES\n]\n');
        const edits = provideOnTypeFormatting(doc, Position.create(2, 0), '\n', defaultOptions);

        expect(edits.length).toBe(2);
        expect(edits[0].newText).toBe('11 :     ');
        expect(edits[1].newText).toBe('12 : SET TARGET : ..\n');
    });
});
