import { describe, it, expect } from 'vitest';
import { validateLabelSequences } from '../../validation/sequenceValidator';
import { Parser } from '../../core/parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticRules } from '../../diagnostics';

function createMockDocument(text: string): TextDocument {
    return TextDocument.create('file://test.tdl', 'tdl', 1, text);
}

describe('sequenceValidator', () => {
    it('should detect broken numeric sequences', () => {
        const text = `[Function: Test]
001 : Statement 1
003 : Statement 2
`;
        const doc = createMockDocument(text);
        const parser = new Parser(text);
        const sourceFile = parser.parse();

        const diagnostics = validateLabelSequences(sourceFile, doc);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe(DiagnosticRules.BrokenLabelSeqence.code);
        expect(diagnostics[0].message).toContain("Expected: '002'");
        expect(diagnostics[0].data?.expectedLabel).toBe('002');
    });

    it('should not flag valid gaps (like jumping from numbers to letters)', () => {
        const text = `[Function: Test]
001 : Statement 1
002 : Statement 2
A : Statement A
B : Statement B
D : Statement D
`;
        const doc = createMockDocument(text);
        const parser = new Parser(text);
        const sourceFile = parser.parse();

        const diagnostics = validateLabelSequences(sourceFile, doc);
        expect(diagnostics.length).toBe(1); // Only the D after B is flagged
        expect(diagnostics[0].message).toContain("Expected: 'C'");
    });

    it('should not flag nested block statements (including ELSE and ENDIF) in valid sequences', () => {
        const text = `[Function: Test]
00 : IF ##Condition
01 :     log : "fgf"
02 : Else :
03 :     Log : "fdgdr"
04 : ENDIF
`;
        const doc = createMockDocument(text);
        const parser = new Parser(text);
        const sourceFile = parser.parse();

        const diagnostics = validateLabelSequences(sourceFile, doc);
        expect(diagnostics.length).toBe(0);
    });
});
