import { getMetadata, setMetadata } from '../metadataService';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideCodeActions } from '../codeActions';
import { CodeActionParams, Diagnostic, CodeActionKind, Range, DiagnosticSeverity } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { BROKEN_SEQUENCE_DIAGNOSTIC_CODE } from '../sequenceValidator';
import { MISSING_DEFINITION_DIAGNOSTIC_CODE, UNKNOWN_ATTRIBUTE_DIAGNOSTIC_CODE } from '../validation';
import { Parser } from '../../parser/parser';

describe('Code Actions', () => {
    let mockDocManager: any;
    let mockDocuments: any;
    
    beforeEach(() => {
        // Setup mock metadata
        setMetadata({
            definitions: new Map([
                ['Report', [{ Name: 'Form' }, { Name: 'Title' }]]
            ]),
            schemas: new Map()
        } as any);
    });

    function setup(tdl: string) {
        const uri = 'file:///test.tdl';
        const document = TextDocument.create(uri, 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        mockDocManager = {
            get: vi.fn().mockReturnValue({ sourceFile })
        };
        
        mockDocuments = {
            get: vi.fn().mockReturnValue(document)
        };
        
        return { uri, document, sourceFile };
    }

    it('QuickFix for unknown attribute suggests closest match', () => {
        const tdl = `[Report: Test]\nTitl: My Report`;
        const { uri } = setup(tdl);
        
        const diagnostic: Diagnostic = {
            range: Range.create(1, 0, 1, 4),
            message: 'Unknown attribute Titl',
            severity: DiagnosticSeverity.Error,
            code: UNKNOWN_ATTRIBUTE_DIAGNOSTIC_CODE,
            data: { attrName: 'Titl', defTypeName: 'Report' }
        };
        
        const params: CodeActionParams = {
            textDocument: { uri },
            range: diagnostic.range,
            context: { diagnostics: [diagnostic] }
        };
        
        const actions = provideCodeActions(params, mockDocManager, mockDocuments);
        
        expect(actions.length).toBe(1);
        expect(actions[0].kind).toBe(CodeActionKind.QuickFix);
        expect(actions[0].title).toBe("Change to 'Title'");
        expect(actions[0].edit?.changes?.[uri]).toBeDefined();
        expect(actions[0].edit?.changes?.[uri][0].newText).toBe('Title');
    });

    it('QuickFix for missing definition creates definition', () => {
        const tdl = `[Report: Test]\nForm: MyForm`;
        const { uri } = setup(tdl);
        
        const diagnostic: Diagnostic = {
            range: Range.create(1, 6, 1, 12),
            message: 'Missing definition',
            severity: DiagnosticSeverity.Error,
            code: MISSING_DEFINITION_DIAGNOSTIC_CODE,
            data: { name: 'MyForm', type: 'Form' }
        };
        
        const params: CodeActionParams = {
            textDocument: { uri },
            range: diagnostic.range,
            context: { diagnostics: [diagnostic] }
        };
        
        const actions = provideCodeActions(params, mockDocManager, mockDocuments);
        
        expect(actions.length).toBe(1);
        expect(actions[0].kind).toBe(CodeActionKind.QuickFix);
        expect(actions[0].title).toContain("Create missing 'Form' definition 'MyForm'");
        expect(actions[0].edit?.changes?.[uri]).toBeDefined();
        expect(actions[0].edit?.changes?.[uri][0].newText).toContain('[Form: MyForm]');
    });

    it('QuickFix for broken label sequence cascades correctly', () => {
        const tdl = `[Function: MyFunc]\n10: MsgBox: "Hello"\n30: MsgBox: "World"\n40: Return`;
        const { uri, document } = setup(tdl);
        
        const offset = tdl.indexOf('30:');
        const pos = document.positionAt(offset);
        
        const diagnostic: Diagnostic = {
            range: Range.create(pos, document.positionAt(offset + 2)),
            message: 'Broken sequence',
            severity: DiagnosticSeverity.Error,
            code: BROKEN_SEQUENCE_DIAGNOSTIC_CODE,
            data: { expectedLabel: '20' }
        };
        
        const params: CodeActionParams = {
            textDocument: { uri },
            range: diagnostic.range,
            context: { diagnostics: [diagnostic] }
        };
        
        const actions = provideCodeActions(params, mockDocManager, mockDocuments);
        
        expect(actions.length).toBe(1);
        expect(actions[0].kind).toBe(CodeActionKind.QuickFix);
        expect(actions[0].title).toBe("Fix downstream label sequence");
        const edits = actions[0].edit?.changes?.[uri];
        expect(edits).toBeDefined();
        expect(edits?.length).toBe(2);
        expect(edits![0].newText).toBe('20');
        expect(edits![1].newText).toBe('21');
    });

    it('No code actions for diagnostics without fixes', () => {
        const tdl = `[Report: Test]`;
        const { uri } = setup(tdl);
        
        const diagnostic: Diagnostic = {
            range: Range.create(0, 0, 0, 0),
            message: 'Some other error',
            severity: DiagnosticSeverity.Error,
            code: 9999
        };
        
        const params: CodeActionParams = {
            textDocument: { uri },
            range: diagnostic.range,
            context: { diagnostics: [diagnostic] }
        };
        
        const actions = provideCodeActions(params, mockDocManager, mockDocuments);
        expect(actions.length).toBe(0);
    });
});
