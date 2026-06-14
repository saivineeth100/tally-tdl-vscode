import { describe, it, expect, beforeEach } from 'vitest';
import { registerCompletion } from '../../../features/completion';
import { TdlMetadata, TDLSchema, TDLSchemaProperty } from '../../../tdlMetaData';
import { CompletionItemKind, InsertTextFormat, CompletionList, CompletionItem } from 'vscode-languageserver';
import { SymbolTable } from '../../../services/symbolTable';

describe('XML Schema Completion', () => {
    let mockMetadata: TdlMetadata;
    let symbolTable: SymbolTable;
    let onCompletionCallback: (params: any) => CompletionList;

    beforeEach(() => {
        symbolTable = new SymbolTable();
        
        mockMetadata = new TdlMetadata('');
        mockMetadata.primarySchemaNames = ['VOUCHER'];
        
        const voucherSchema = new TDLSchema();
        voucherSchema.Name = 'Voucher';
        
        const prop1 = new TDLSchemaProperty();
        prop1.Name = 'Party Ledger Name';
        prop1.DataType = 'String';
        
        const prop2 = new TDLSchemaProperty();
        prop2.Name = 'Is Optional';
        prop2.DataType = 'Logical';
        
        voucherSchema.Properties.set('Party Ledger Name', prop1);
        voucherSchema.Properties.set('Is Optional', prop2);
        
        voucherSchema.ComplexProperties.set('All Ledger Entries', 'Ledger Entry');
        mockMetadata.schemas.set('Voucher', voucherSchema);
        
        const ledgerSchema = new TDLSchema();
        ledgerSchema.Name = 'Ledger Entry';
        
        const lprop = new TDLSchemaProperty();
        lprop.Name = 'Ledger Name';
        lprop.DataType = 'String';
        
        ledgerSchema.Properties.set('Ledger Name', lprop);
        mockMetadata.schemas.set('Ledger Entry', ledgerSchema);

        (globalThis as any).TDL_METADATA = mockMetadata;
    });

    const getItems = (xmlText: string, offset: number): CompletionItem[] => {
        const dummyDoc = {
            getText: () => xmlText,
            offsetAt: () => offset,
            languageId: 'xml',
            uri: 'test.xml'
        };

        const dummyDocs = { get: () => dummyDoc };
        const dummyManager = { 
            get: () => ({ sourceFile: { definitions: [] } }),
            getSymbolTable: () => symbolTable
        };
        
        const dummyConnection = {
            onCompletion: (cb: any) => {
                onCompletionCallback = cb;
            }
        };
        registerCompletion(dummyConnection as any, dummyDocs as any, dummyManager as any);

        const list = onCompletionCallback({ textDocument: { uri: 'test.xml' }, position: { line: 0, character: offset } });
        return list.items;
    };

    it('suggests properties for primary schema root tag', () => {
        const xml = `<VOUCHER><`;
        const offset = xml.length;
        const items = getItems(xml, offset);
        
        expect(items.find(i => i.label === 'PARTYLEDGERNAME')).toBeDefined();
        expect(items.find(i => i.label === 'ISOPTIONAL')).toBeDefined();
        
        const p = items.find(i => i.label === 'PARTYLEDGERNAME')!;
        expect(p.kind).toBe(CompletionItemKind.Property);
        expect(p.insertTextFormat).toBe(InsertTextFormat.Snippet);
        expect(p.insertText).toBe('PARTYLEDGERNAME>$0</PARTYLEDGERNAME>');
    });

    it('suggests properties for nested schema tag using normalized names', () => {
        // Here we use ALLLEDGERENTRIES.LIST which maps to 'Ledger Entries' schema
        const xml = `<TALLYMESSAGE>
            <VOUCHER>
                <ALLLEDGERENTRIES.LIST>
                    <`;
        
        const offset = xml.length;
        const items = getItems(xml, offset);
        expect(items.find(i => i.label === 'LEDGERNAME')).toBeDefined();
    });

    it('suggests Yes/No for Logical datatype properties', () => {
        const xml = `<VOUCHER><ISOPTIONAL>`;
        const offset = xml.length;
        const items = getItems(xml, offset);
        expect(items.find(i => i.label === 'Yes')).toBeDefined();
        expect(items.find(i => i.label === 'No')).toBeDefined();
    });
});
