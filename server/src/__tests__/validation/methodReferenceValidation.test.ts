import { describe, it, expect, beforeEach } from 'vitest';
import { validateSourceFile } from '../../validation';
import { ScopeManager } from '../../semantics/scopeManager';
import { Parser } from '../../core/parser/parser';
import { SchemaSymbol, SymbolKind, AttributeSymbol } from 'tally-tdl-shared';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('Method Reference Validation Tests', () => {
    let mockScopeManager: ScopeManager;

    beforeEach(() => {
        mockScopeManager = new ScopeManager();
        mockScopeManager.primarySchemaNames = ['LEDGER', 'BILL'];

        const ledgerSchema: SchemaSymbol = {
            name: 'Ledger',
            kind: SymbolKind.Object,
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['Amount', { Name: 'Amount', DataType: 'Number', IsComplex: false, IsRepeated: false }],
                ['LedgerEntries', { Name: 'LedgerEntries', DataType: 'String', IsComplex: false, IsRepeated: true }],
                ['Bills', { Name: 'Bills', DataType: 'String', IsComplex: false, IsRepeated: true }]
            ]),
            complexProperties: new Map([
                ['Bills', 'Bill'],
                ['LedgerEntries', 'LedgerEntry']
            ]),
            isPrimary: true
        };
        
        const billSchema: SchemaSymbol = {
            name: 'Bill',
            kind: SymbolKind.Object,
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['Amount', { Name: 'Amount', DataType: 'Number', IsComplex: false, IsRepeated: false }],
                ['methodName', { Name: 'methodName', DataType: 'String', IsComplex: false, IsRepeated: false }]
            ]),
            complexProperties: new Map(),
            isPrimary: false
        };
        
        mockScopeManager.globalScope.schemas.set('ledger', ledgerSchema);
        mockScopeManager.globalScope.schemas.set('bill', billSchema);

        const setAsAttr: AttributeSymbol = {
            name: 'Set As',
            kind: SymbolKind.Unknown,
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Attribute',
            isDiscrete: false,
            parameters: [{ ParameterType: 'Value', DataType: 'Any', IsMandatory: true, IsConstant: false, DimensionExpression: false, IsList: false, IsVariableArgument: false }]
        };
        const fieldAttrs = new Map<string, AttributeSymbol>();
        fieldAttrs.set('setas', setAsAttr); // Normalized key without spaces
        mockScopeManager.globalScope.attributes.set('field', fieldAttrs);
    });

    const createDummyDoc = (text: string) => TextDocument.create('file:///test.tdl', 'tdl', 1, text);

    it('Valid Method Reference', async () => {
        const input = `
        [Field: complex]
        Set As: $(Ledger, "Cash").Bills[1].methodName
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const doc = createDummyDoc(input);
        const diags = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diags).toEqual([]);
    });

    it('Invalid Method Reference - Unknown Schema', async () => {
        const input = `
        [Field: complex]
        Set As: $(UnknownSchema, "Cash").Bills[1].Amount
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const doc = createDummyDoc(input);
        const diags = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diags.length).toBeGreaterThan(0);
        expect(diags[0].message).toContain('Unknown schema type');
    });

    it('Invalid Method Reference - Unknown Property', async () => {
        const input = `
        [Field: complex]
        Set As: $(Ledger, "Cash").UnknownProperty
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const doc = createDummyDoc(input);
        const diags = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diags.length).toBeGreaterThan(0);
        expect(diags[0].message).toContain('Unknown property');
    });

    it('Invalid Method Reference - Index on Non-Repeated Property', async () => {
        const input = `
        [Field: complex]
        Set As: $(Ledger, "Cash").Amount[1]
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const doc = createDummyDoc(input);
        const diags = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diags.length).toBeGreaterThan(0);
        expect(diags[0].message).toContain('Collection index is only allowed on repeated properties');
    });

    it('Valid Reference Access Pattern', async () => {
        const input = `
        [Field: complex]
        Set As: $Bills[1].methodName : Ledger : ##SVLedgerName
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const doc = createDummyDoc(input);
        const diags = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diags).toEqual([]);
    });
});
