import { describe, it, expect, beforeAll } from 'vitest';
import { registerCompletion } from '../../../features/completion';
import { DocManager } from '../../../docManager';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SymbolKind } from '../../../services/symbolTable';
import { ScopeKind } from '../../../services/scopeManager/types';

import { testScopeManager, ensureBaseTdlLoaded } from '../../../test-setup';

describe('XML Suggestions Tests', () => {
    let mockConnection: any;
    let mockDocuments: any;
    let mockManager: any;
    let completionCallback: Function;

    beforeAll(async () => {
        await ensureBaseTdlLoaded();
    }, 60000);

    it('returns correct XML definition_type suggestion', async () => {
        const xmlContent = '<TDL><TDLMESSAGE><R';
        
        mockConnection = {
            onCompletion: (cb: any) => { completionCallback = cb; },
            console: { log: () => {}, error: () => {}, info: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        mockDocuments = {
            get: () => doc
        };
        
        mockManager = {
            get: () => ({ sourceFile: { definitions: [], errors: [] } }),
                        getScopeManager: () => testScopeManager,
            getProjectNodes: () => new Set([doc.uri])
        };
        
        registerCompletion(mockConnection, mockDocuments as any, mockManager as any);
        
        const result = await completionCallback({
            textDocument: { uri: 'untitled:Untitled-1' },
            position: doc.positionAt(xmlContent.length)
        });
        
    const reportItem = result.items.find((i: any) => i.label === 'REPORT');
    // console.log('DefTypes length:', testScopeManager?.getDefinitionTypes().length);
    // console.log('Items length:', result.items.length);

        expect(reportItem).toBeDefined();
        expect(reportItem.insertTextFormat).toBe(2); // Snippet
        expect(reportItem.insertText).toBe('REPORT NAME="$1">\n\t$0\n</REPORT>');
    });

    it('returns correct XML attribute suggestion', async () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport">\\n<F';
        
        mockConnection = {
            onCompletion: (cb: any) => { completionCallback = cb; },
            console: { log: () => {}, error: () => {}, info: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        mockDocuments = {
            get: () => doc
        };
        
        // We must mock the active definition to REPORT
        mockManager = {
            get: () => ({
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
            }),
                        getScopeManager: () => testScopeManager,
            getProjectNodes: () => new Set([doc.uri])
        };
        
        registerCompletion(mockConnection, mockDocuments as any, mockManager as any);
        
        const result = await completionCallback({
            textDocument: { uri: 'untitled:Untitled-1' },
            position: doc.positionAt(xmlContent.length)
        });
        
        const formItem = result.items.find((i: any) => i.label === 'FORM');

        expect(formItem).toBeDefined();
        // Since it's an attribute in XML, we don't put < in the label anymore
        expect(formItem.label).toBe('FORM');
        // The insert text for attributes should be property snippet:
        expect(formItem.insertTextFormat).toBe(2);
        expect(formItem.insertText).toBe('FORM>$0</FORM>');
    });

    it('returns correct XML attribute_value suggestion from symbol table', async () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport">\\n<FORM>simp';
        
        mockConnection = {
            onCompletion: (cb: any) => { completionCallback = cb; },
            console: { log: () => {}, error: () => {}, info: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        mockDocuments = {
            get: () => doc
        };
        
        let typeMap = testScopeManager!.scopeIndex.get('form');
        if (!typeMap) { typeMap = new Map(); testScopeManager!.scopeIndex.set('form', typeMap); }
        typeMap.set('simpletrialbalance', {
            kind: ScopeKind.Definition,
            definition: {
                name: 'Simple Trial Balance',
                kind: 1,
                definitionType: 'Form',
                uri: 'untitled:Untitled-1',
                start: 0,
                end: 10
            }
        } as any);

        mockManager = {
            get: () => ({
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
            }),
            getScopeManager: () => testScopeManager,
            getProjectNodes: () => new Set([doc.uri, 'test'])
        };
        
        registerCompletion(mockConnection, mockDocuments as any, mockManager as any);
        //console.log('Keys in form map 1:', Array.from(testScopeManager!.scopeIndex.get('form')?.keys() || []));
        const result = await completionCallback({
            textDocument: { uri: 'untitled:Untitled-1' },
            position: doc.positionAt(xmlContent.length)
        });
        
        expect(result.items.length).toBeGreaterThan(0);
        expect(result.items.length).toBeGreaterThan(0);
        const item = result.items.find((i: any) => i.label === 'Simple Trial Balance');
        //console.log('Labels found:', result.items.map((i: any) => i.label).join(', '));
        expect(item).toBeDefined();
        // The insert text is just the text because it's the value of the tag
        expect(item.insertText).toBe('Simple Trial Balance');
    });

    it('returns definition_name suggestions when modifying a definition', async () => {
        const xmlContent = '<FORM NAME="Simp" ISMODIFY="Yes"></FORM>';
        const doc = TextDocument.create('test://test.xml', 'xml', 1, xmlContent);
        
        // Offset inside "Simp|"
        const offset = xmlContent.indexOf('"Simp') + 5; 
        
        let typeMap2 = testScopeManager!.scopeIndex.get('form');
        if (!typeMap2) { typeMap2 = new Map(); testScopeManager!.scopeIndex.set('form', typeMap2); }
        typeMap2.set('simpletrialbalance', {
            kind: ScopeKind.Definition,
            definition: {
                name: 'Simple Trial Balance',
                kind: 1,
                definitionType: 'Form',
                uri: 'test://other.xml',
                start: 0,
                end: 10
            }
        } as any);

        // Mocking TextDocuments and Connection for DocManager
        mockConnection = { 
            console: { log: () => {}, error: () => {}, info: () => {} },
            sendDiagnostics: () => {},
            onCompletion: (cb: any) => { completionCallback = cb; }
        };
        mockDocuments = {
            onDidOpen: () => {},
            onDidChangeContent: () => {},
            onDidClose: () => {},
            get: () => doc
        };
        const docManager = new DocManager(mockConnection, mockDocuments as any);
        // console.log('Keys in form map:', Array.from(testScopeManager!.scopeIndex.get('form')?.keys() || []));
        (docManager as any).xmlScopeManager = testScopeManager as any;
        await docManager.rebuild(doc);
        
        
        // Add existing form
        /* removed undefined.addSymbol */

        // Mocking direct call to completion provider
        mockDocuments = { get: () => doc };
        mockManager = { 
            get: () => docManager.get(doc.uri),
            getScopeManager: () => docManager.getScopeManager(doc.uri),
            getProjectNodes: () => new Set([doc.uri, 'test', 'test2.xml', 'test://other.xml'])
        } as any;
        
        registerCompletion(mockConnection, mockDocuments, mockManager);
        
        const result = await completionCallback({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        expect(result.items.length).toBeGreaterThan(0);
        
        expect(result.items.length).toBeGreaterThan(0);
        const formItem = result.items.find((i: any) => i.label === 'Simple Trial Balance');

        expect(formItem).toBeDefined();
    });
});
