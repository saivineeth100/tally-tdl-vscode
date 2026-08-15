import { describe, expect, it, beforeEach } from 'vitest';
import { ServerTestHarness } from '../../harness/serverTestHarness';
import { SchemaSymbol, SymbolKind } from 'tally-tdl-shared';

describe('Method Reference Completion Tests', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        harness = new ServerTestHarness();
        
        // Mock schemas for testing
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
        
        const scopeManager = harness.runtime.services.documentStateStore.tdlScopeManager;
        scopeManager.primarySchemaNames = ['LEDGER', 'BILL'];
        scopeManager.globalScope.schemas.set('ledger', ledgerSchema);
        scopeManager.globalScope.schemas.set('bill', billSchema);
    });

    it('Completion for method schema type $(|)', async () => {
        const input = `
        [Report: complex]
        Set As: $(L
        `;
        harness.simulateOpen('file:///test.tdl', 'tdl', input);
        harness.runtime.documentLifecycle.processPendingDocuments();
        const doc = harness.documents.get('file:///test.tdl')!;
        
        const pos = { line: 2, character: 19 }; // after $(L
        const items = await harness.runtime.completion.complete({ textDocument: { uri: doc.uri }, position: pos });
        
        expect(items?.items.some(i => i.label === 'LEDGER')).toBeTruthy();
    });

    it('Completion for Reference Access schema type $method:|', async () => {
        const input = `
        [Report: complex]
        Set As: $Amount : L
        `;
        harness.simulateOpen('file:///test.tdl', 'tdl', input);
        harness.runtime.documentLifecycle.processPendingDocuments();
        const doc = harness.documents.get('file:///test.tdl')!;
        
        const pos = { line: 2, character: 27 }; // after : L
        const items = await harness.runtime.completion.complete({ textDocument: { uri: doc.uri }, position: pos });
        
        expect(items?.items.some(i => i.label === 'LEDGER')).toBeTruthy();
    });

    it('Completion for nested property path after $Method.|', async () => {
        const input = `
        [Report: complex]
        Set As: $Bills.
        `;
        harness.simulateOpen('file:///test.tdl', 'tdl', input);
        harness.runtime.documentLifecycle.processPendingDocuments();
        const doc = harness.documents.get('file:///test.tdl')!;
        
        const pos = { line: 2, character: 23 }; // after .
        const items = await harness.runtime.completion.complete({ textDocument: { uri: doc.uri }, position: pos });
        
        expect(items).toBeDefined();
    });
});
