import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { testScopeManager, ensureBaseTdlLoaded } from '../../../__tests__/test-setup';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { URI } from 'vscode-uri';

describe('XML Suggestions Tests', () => {
    let harness: ServerTestHarness;

    beforeAll(async () => {
        await ensureBaseTdlLoaded();
    }, 60000);

    beforeEach(() => {
        harness = new ServerTestHarness();
        // Use testScopeManager with loaded definition schemas
        harness.runtime.services.documentStateStore.tdlScopeManager = testScopeManager;
        harness.runtime.services.documentStateStore.xmlScopeManager = testScopeManager;
    });

    it('returns correct XML definition_type suggestion', async () => {
        const xmlContent = '<TDL><TDLMESSAGE><R';
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        
        harness.documents.set(doc.uri, doc);
        harness.runtime.services.documentStateStore.setOpen(doc.uri, { sourceFile: { definitions: [], errors: [] } } as any);
        
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(xmlContent.length)
        });
        
        const reportItem = result.items.find((i: any) => i.label === 'REPORT');

        expect(reportItem).toBeDefined();
        expect(reportItem!.insertTextFormat).toBe(2); // Snippet
        expect(reportItem!.insertText).toBe('REPORT NAME="$1">\n\t$0\n</REPORT>');
    });

    it('returns correct XML attribute suggestion', async () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport">\\n<F';
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        
        harness.documents.set(doc.uri, doc);
        harness.runtime.services.documentStateStore.setOpen(doc.uri, {
            sourceFile: {
                definitions: [
                    {
                        start: 17,
                        end: xmlContent.length + 10,
                        type: { text: 'REPORT' }
                    }
                ],
                errors: []
            }
        } as any);
        
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(xmlContent.length)
        });
        
        const formItem = result.items.find((i: any) => i.label === 'FORM');

        expect(formItem).toBeDefined();
        // Since it's an attribute in XML, we don't put < in the label anymore
        expect(formItem!.label).toBe('FORM');
    });

    it('returns XML attribute suggestions for incomplete tags', async () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport">\\n<FORM';
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        
        harness.documents.set(doc.uri, doc);
        harness.runtime.services.documentStateStore.setOpen(doc.uri, {
            sourceFile: {
                definitions: [
                    {
                        start: 17,
                        end: xmlContent.length + 10,
                        type: { text: 'REPORT' }
                    }
                ],
                errors: []
            }
        } as any);
        
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(xmlContent.length)
        });
        
        const formItem = result.items.find((i: any) => i.label === 'FORM');

        expect(formItem).toBeDefined();
    });

    it('returns definition_name suggestions', async () => {
        const xmlContent = '<FORM NAME="S"></FORM>';
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        
        // Offset inside "S|"
        const offset = xmlContent.indexOf('"S') + 2;
        
        let typeMap = testScopeManager.scopeIndex.get('form');
        if (!typeMap) { typeMap = new Map(); testScopeManager.scopeIndex.set('form', typeMap); }
        typeMap.set('simpletrialbalance', [{
            kind: 1, // ScopeKind.Definition
            definition: {
                name: 'Simple Trial Balance',
                kind: 1,
                definitionType: 'Form',
                uri: 'test://other.xml',
                start: 0,
                end: 10
            }
        }] as any);

        harness.documents.set(doc.uri, doc);
        harness.runtime.services.documentStateStore.setOpen(doc.uri, { sourceFile: { definitions: [], errors: [] } } as any);
        
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });
        
        expect(result.items.length).toBeGreaterThan(0);
        const item = result.items.find((i: any) => i.label === 'Simple Trial Balance');
        expect(item).toBeDefined();
        // The insert text is just the text because it's the value of the tag
        expect(item!.insertText).toBe('Simple Trial Balance');
    });

    it('returns definition_name suggestions when modifying a definition', async () => {
        const xmlContent = '<FORM NAME="Simp" ISMODIFY="Yes"></FORM>';
        const doc = TextDocument.create('test://test.xml', 'xml', 1, xmlContent);
        
        // Offset inside "Simp|"
        const offset = xmlContent.indexOf('"Simp') + 5; 
        
        let typeMap2 = testScopeManager.scopeIndex.get('form');
        if (!typeMap2) { typeMap2 = new Map(); testScopeManager.scopeIndex.set('form', typeMap2); }
        typeMap2.set('simpletrialbalance', [{
            kind: 1, // ScopeKind.Definition
            definition: {
                name: 'Simple Trial Balance',
                kind: 1,
                definitionType: 'Form',
                uri: 'test://other.xml',
                start: 0,
                end: 10
            }
        }] as any);

        harness.documents.set(doc.uri, doc);
        harness.runtime.services.documentStateStore.setOpen(doc.uri, { sourceFile: { definitions: [], errors: [] } } as any);
        
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        expect(result.items.length).toBeGreaterThan(0);
        const formItem = result.items.find((i: any) => i.label === 'Simple Trial Balance');
        expect(formItem).toBeDefined();
    });
});
