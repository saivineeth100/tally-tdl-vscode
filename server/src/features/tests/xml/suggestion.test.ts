import { describe, it, expect, beforeAll } from 'vitest';
import { detectXmlCompletionContext, registerCompletion } from '../../../features/completion';
import { DocManager } from '../../../docManager';
import { TdlMetadata } from '../../../tdlMetaData';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as path from 'path';
import { SymbolTable, SymbolKind } from '../../../services/symbolTable';

import { testMetadata } from '../../../test-setup';

describe('XML Suggestions Tests', () => {
    let md: TdlMetadata;
    let mockConnection: any;
    let mockDocuments: any;
    let mockManager: any;
    let mockSymbolTable: SymbolTable;
    let completionCallback: Function;

    beforeAll(async () => {
        md = testMetadata!;
        (globalThis as any).TDL_METADATA = md;
    });

    it('returns correct XML definition_type suggestion', async () => {
        const xmlContent = '<TDL><TDLMESSAGE><R';
        
        mockConnection = {
            onCompletion: (cb: any) => { completionCallback = cb; },
            console: { log: () => {}, error: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        mockDocuments = {
            get: () => doc
        };
        
        mockManager = {
            get: () => ({ sourceFile: { definitions: [], errors: [] } }),
            getSymbolTable: () => new SymbolTable()
        };
        
        registerCompletion(mockConnection, mockDocuments as any, mockManager as any);
        
        const result = await completionCallback({
            textDocument: { uri: 'untitled:Untitled-1' },
            position: doc.positionAt(xmlContent.length)
        });
        
        console.log('Test 1 MD keys:', md.existingDefinitions.size);
        
        const reportItem = result.items.find((i: any) => i.label === 'REPORT');
        console.log('Test 1 Items:', result.items.length, result.items.slice(0, 2));
        expect(reportItem).toBeDefined();
        expect(reportItem.insertTextFormat).toBe(2); // Snippet
        expect(reportItem.insertText).toBe('REPORT NAME="$1">\n\t$0\n</REPORT>');
    });

    it('returns correct XML attribute suggestion', async () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport">\\n<F';
        
        mockConnection = {
            onCompletion: (cb: any) => { completionCallback = cb; },
            console: { log: () => {}, error: () => {} }
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
            getSymbolTable: () => new SymbolTable()
        };
        
        registerCompletion(mockConnection, mockDocuments as any, mockManager as any);
        
        const result = await completionCallback({
            textDocument: { uri: 'untitled:Untitled-1' },
            position: doc.positionAt(xmlContent.length)
        });
        
        const formItem = result.items.find((i: any) => i.label === 'FORM');
        console.log('Test 2 Items:', result.items.length, result.items.slice(0, 2));
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
            console: { log: () => {}, error: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-1', 'xml', 1, xmlContent);
        mockDocuments = {
            get: () => doc
        };
        
        const symbolTable = new SymbolTable();
        symbolTable.addSymbol({
            name: 'Simple Trial Balance',
            kind: SymbolKind.Form,
            uri: 'test',
            start: 0,
            end: 0,
            definitionType: 'Form'
        });

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
            getSymbolTable: () => symbolTable
        };
        
        registerCompletion(mockConnection, mockDocuments as any, mockManager as any);
        
        const result = await completionCallback({
            textDocument: { uri: 'untitled:Untitled-1' },
            position: doc.positionAt(xmlContent.length)
        });
        
        const item = result.items.find((i: any) => i.label === 'Simple Trial Balance');
        console.log('Test 3 Items:', result.items.length, result.items.slice(0, 2));
        expect(item).toBeDefined();
        // The insert text is just the text because it's the value of the tag
        expect(item.insertText).toBe('Simple Trial Balance');
    });

    it('returns definition_name suggestions when modifying a definition', async () => {
        const xmlContent = '<FORM NAME="Simp" ISMODIFY="Yes"></FORM>';
        const doc = TextDocument.create('test://test.xml', 'xml', 1, xmlContent);
        
        // Offset inside "Simp|"
        const offset = xmlContent.indexOf('"Simp') + 5; 
        
        // Mocking TextDocuments and Connection for DocManager
        mockConnection = { 
            console: { log: () => {}, error: () => {} },
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
        await docManager.rebuild(doc);
        
        const symbolTable = docManager.getSymbolTable(doc.uri);
        // Add existing form
        symbolTable.addSymbol({
            name: 'Simple Trial Balance',
            kind: SymbolKind.Form,
            uri: 'test2.xml',
            start: 0,
            end: 0,
            definitionType: 'Form'
        });

        // Mocking direct call to completion provider
        mockDocuments = { get: () => doc };
        mockManager = { 
            get: () => docManager.get(doc.uri),
            getSymbolTable: () => docManager.getSymbolTable(doc.uri)
        };
        
        registerCompletion(mockConnection, mockDocuments, mockManager);
        
        const result = await completionCallback({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        expect(result.items.length).toBeGreaterThan(0);
        
        const formItem = result.items.find((i: any) => i.label === 'Simple Trial Balance');
        console.log('Test 4 Items:', result.items.length, result.items.slice(0, 2));
        expect(formItem).toBeDefined();
    });
});
