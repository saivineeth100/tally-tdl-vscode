import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { provideCodeActions } from '../../features/codeActions';
import { CodeActionParams, Diagnostic, CodeActionKind, Range, DiagnosticSeverity } from 'vscode-languageserver';
import { DiagnosticRules } from '../../diagnostics';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { Parser } from '../../core/parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('Code Actions', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        harness = new ServerTestHarness();
    });

    afterEach(() => {
        harness.dispose();
    });

    function setup(tdl: string) {
        const uri = 'file:///test.tdl';
        
        const scopeManager = harness.runtime.services.documentStateStore.tdlScopeManager;
        
        // Setup mock metadata
        const reportAttrs = new Map<string, any>();
        reportAttrs.set('form', { name: 'Form' });
        reportAttrs.set('title', { name: 'Title' });
        scopeManager.globalScope.attributes.set('report', reportAttrs);

        // Setup mock schemas
        const voucherSchema: any = {
            name: 'Voucher',
            properties: new Map([
                ['Party Ledger Name', { Name: 'Party Ledger Name' }]
            ])
        };
        scopeManager.globalScope.schemas.set('voucher', voucherSchema);

        const { documentStateStore } = harness.runtime.services;
        
        const doc = TextDocument.create(uri, 'tdl', 1, tdl);
        harness.documents.set(uri, doc);
        
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        documentStateStore.setOpen(uri, {
            sourceFile,
            document: doc,
            diagnostics: []
        });
        
        return { 
            uri, 
            documentStateStore, 
            documents: harness.documents 
        };
    }

    it('QuickFix for unknown attribute suggests closest match', () => {
        const tdl = `[Report: Test]\nTitl: My Report`;
        const { uri, documentStateStore, documents } = setup(tdl);

        const diagnostic: Diagnostic = {
            range: Range.create(1, 0, 1, 4),
            message: 'Unknown attribute Titl',
            severity: DiagnosticSeverity.Error,
            code: DiagnosticRules.UnknownAttribute.code,
            data: { attrName: 'Titl', defTypeName: 'Report' }
        };

        const params: CodeActionParams = {
            textDocument: { uri },
            range: diagnostic.range,
            context: { diagnostics: [diagnostic] }
        };

        const actions = provideCodeActions(params, documentStateStore, documents);

        expect(actions.length).toBe(2);
        expect(actions[0].kind).toBe(CodeActionKind.QuickFix);
        expect(actions[0].title).toBe("Change to 'Title'");
        expect(actions[0].edit?.changes?.[uri]).toBeDefined();
        expect(actions[0].edit?.changes?.[uri][0].newText).toBe('Title');
    });

    it('QuickFix for missing definition creates definition', () => {
        const tdl = `[Report: Test]\nForm: MyForm`;
        const { uri, documentStateStore, documents } = setup(tdl);

        const diagnostic: Diagnostic = {
            range: Range.create(1, 6, 1, 12),
            message: 'Missing definition',
            severity: DiagnosticSeverity.Error,
            code: DiagnosticRules.MissingDefinition.code,
            data: { name: 'MyForm', type: 'Form' }
        };

        const params: CodeActionParams = {
            textDocument: { uri },
            range: diagnostic.range,
            context: { diagnostics: [diagnostic] }
        };

        const actions = provideCodeActions(params, documentStateStore, documents);

        expect(actions.length).toBe(2);
        expect(actions[0].kind).toBe(CodeActionKind.QuickFix);
        expect(actions[0].title).toContain("Create missing 'Form' definition 'MyForm'");
        expect(actions[0].edit?.changes?.[uri]).toBeDefined();
        expect(actions[0].edit?.changes?.[uri][0].newText).toContain('[Form: MyForm]');
    });

    it('QuickFix for broken label sequence cascades correctly', () => {
        const tdl = `[Function: MyFunc]\n10: MsgBox: "Hello"\n30: MsgBox: "World"\n40: Return`;
        const { uri, documentStateStore, documents } = setup(tdl);

        const doc = documents.get(uri)!;
        const offset = tdl.indexOf('30:');
        const pos = doc.positionAt(offset);

        const diagnostic: Diagnostic = {
            range: { start: pos, end: doc.positionAt(offset + 2) },
            message: 'Broken label sequence',
            severity: DiagnosticSeverity.Error,
            code: DiagnosticRules.BrokenLabelSeqence.code,
            data: { expectedLabel: '20' }
        };

        const params: CodeActionParams = {
            textDocument: { uri },
            range: diagnostic.range,
            context: { diagnostics: [diagnostic] }
        };

        const actions = provideCodeActions(params, documentStateStore, documents);

        expect(actions.length).toBe(2);
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
        const { uri, documentStateStore, documents } = setup(tdl);

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

        const actions = provideCodeActions(params, documentStateStore, documents);
        expect(actions.length).toBe(0);
    });

    it('QuickFix for unknown schema property suggests closest match', () => {
        const tdl = `[Voucher: Test]\nPartyLederName: "Test"`;
        const { uri, documentStateStore, documents } = setup(tdl);

        const diagnostic: Diagnostic = {
            range: Range.create(1, 0, 1, 14),
            message: 'Unknown schema property PartyLederName',
            severity: DiagnosticSeverity.Error,
            code: DiagnosticRules.UnknownSchemaProperty.code,
            data: { attrName: 'PartyLederName', schemaName: 'Voucher' }
        };

        const params: CodeActionParams = {
            textDocument: { uri },
            range: diagnostic.range,
            context: { diagnostics: [diagnostic] }
        };

        const actions = provideCodeActions(params, documentStateStore, documents);

        expect(actions.length).toBe(2); // One for QuickFix, one for Disable Diagnostic
        expect(actions[0].kind).toBe(CodeActionKind.QuickFix);
        expect(actions[0].title).toBe("Change to 'Party Ledger Name'");
        expect(actions[0].edit?.changes?.[uri]).toBeDefined();
        expect(actions[0].edit?.changes?.[uri][0].newText).toBe('Party Ledger Name');
    });
});
