import { describe, it, expect, beforeEach } from 'vitest';
import { registerCompletion } from '../../../features/completion';
import { ScopeManager } from '../../../semantics/scopeManager';
import { CompletionItemKind, InsertTextFormat, CompletionList, CompletionItem } from 'vscode-languageserver';
import { SchemaSymbol, SymbolKind } from 'tally-tdl-shared';

describe('XML Schema Completion', () => {
    let scopeManager: ScopeManager;
    
    let onCompletionCallback: (params: any) => Promise<CompletionList>;

    beforeEach(() => {
        
        scopeManager = new ScopeManager();
        scopeManager.primarySchemaNames = ['VOUCHER'];
        
        const voucherSchema: SchemaSymbol = {
            name: 'Voucher',
            kind: SymbolKind.Object,
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['Party Ledger Name', { Name: 'Party Ledger Name', DataType: 'String', IsComplex: false, IsRepeated: false }],
                ['Is Optional', { Name: 'Is Optional', DataType: 'Logical', IsComplex: false, IsRepeated: false }]
            ]),
            complexProperties: new Map([
                ['All Ledger Entries', 'Ledger Entry']
            ]),
            isPrimary: true
        };
        
        scopeManager.globalScope.schemas.set('VOUCHER', voucherSchema);
        
        const ledgerSchema: SchemaSymbol = {
            name: 'Ledger Entry',
            kind: SymbolKind.Object,
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['Ledger Name', { Name: 'Ledger Name', DataType: 'String', IsComplex: false, IsRepeated: false }]
            ]),
            complexProperties: new Map(),
            isPrimary: false
        };
        
        scopeManager.globalScope.schemas.set('LEDGERENTRY', ledgerSchema);
    });

    const getItems = async (xmlText: string, offset: number): Promise<CompletionItem[]> => {
        const dummyDoc = {
            languageId: 'xml',
            getText: (range?: any) => {
                if (range) {
                    if (range.start.line === range.end.line) {
                        return xmlText.substring(range.start.character, range.end.character);
                    }
                }
                return xmlText;
            },
            offsetAt: (pos: any) => pos.character
        };

        const dummyDocs = {
            get: () => dummyDoc
        };

        const dummyManager = {
            get: () => ({ sourceFile: { definitions: [] } }),
                        getScopeManager: () => scopeManager,
            getProjectNodes: () => new Set(['test://file.xml'])
        };
        
        const dummyConnection = {
            onCompletion: (cb: any) => {
                onCompletionCallback = cb;
            },
            onCompletionResolve: () => {}
        };
        registerCompletion(dummyConnection as any, dummyDocs as any, dummyManager as any);

        const list = await onCompletionCallback({ textDocument: { uri: 'test.xml' }, position: { line: 0, character: offset } });
        return list.items;
    };

    it('suggests properties for primary schema root tag', async () => {
        const xml = `<VOUCHER><`;
        const offset = xml.length;
        const items = await getItems(xml, offset);
        
        expect(items.find(i => i.label === 'PARTYLEDGERNAME')).toBeDefined();
        expect(items.find(i => i.label === 'ISOPTIONAL')).toBeDefined();
        
        const p = items.find(i => i.label === 'PARTYLEDGERNAME')!;
        expect(p.kind).toBe(CompletionItemKind.Property);
        expect(p.insertTextFormat).toBe(InsertTextFormat.Snippet);
        expect(p.insertText).toBe('PARTYLEDGERNAME>$0</PARTYLEDGERNAME>');
    });

    it('suggests properties for nested schema tag using normalized names', async () => {
        // Here we use ALLLEDGERENTRIES.LIST which maps to 'Ledger Entries' schema
        const xml = `<TALLYMESSAGE>
            <VOUCHER>
                <ALLLEDGERENTRIES.LIST>
                    <`;
        
        const offset = xml.length;
        const items = await getItems(xml, offset);
        expect(items.find(i => i.label === 'LEDGERNAME')).toBeDefined();
    });

    it('suggests Yes/No for Logical datatype properties', async () => {
        const xml = `<VOUCHER><ISOPTIONAL>`;
        const offset = xml.length;
        const items = await getItems(xml, offset);
        expect(items.find(i => i.label === 'Yes')).toBeDefined();
        expect(items.find(i => i.label === 'No')).toBeDefined();
    });
});
