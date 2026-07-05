/**
 * Tests for definition type, name, and modifier completion features.
 * Validates that the completion provider correctly suggests definition types
 * and definition names, handling modifiers and spaces as expected.
 */
import { describe, it, expect } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ServerTestHarness } from '../../harness/serverTestHarness';
import { testScopeManager } from '../../test-setup';
import { SymbolKind } from 'tally-tdl-shared';
import { SYSTEM_DEFINITION_NAMES } from '../../../semantics/scopeManager/types';
import { CompletionItemKind } from 'vscode-languageserver';

describe('Completion Provider - [deftype:defname]', () => {

    /**
     * Helper to setup a test harness preloaded with a file and global scope
     */
    async function setupHarness(content: string, uri: string = 'file:///d:/test.tdl') {
        const harness = new ServerTestHarness();
        // Bind global scope from global setup
        if (testScopeManager) {
            harness.runtime.services.documentStateStore.tdlScopeManager.globalScope = testScopeManager.globalScope;
            harness.runtime.services.documentStateStore.tdlScopeManager.definitionTypeLabels = testScopeManager.definitionTypeLabels;
        }
        
        // Add some mock definitions for definition name suggestions
        const scopeManager = harness.runtime.services.documentStateStore.getScopeManager(uri);
        scopeManager.definitionTypeLabels.set('report', 'Report');
        scopeManager.definitionTypeLabels.set('system', 'System');
        
        const reportDefs = new Map();
        reportDefs.set('balancesheet', { name: 'Balance Sheet', kind: SymbolKind.Report, uri, start: 0, end: 10, definitionType: 'Report' });
        reportDefs.set('trialbalance', { name: 'Trial Balance', kind: SymbolKind.Report, uri, start: 10, end: 20, definitionType: 'Report' });
        scopeManager.globalScope.definitions.set('report', reportDefs);

        const systemDefs = new Map();
        systemDefs.set('formula', { name: 'Formula', kind: SymbolKind.Formula, uri, start: 0, end: 0, definitionType: 'System' });
        systemDefs.set('variable', { name: 'Variable', kind: SymbolKind.Variable, uri, start: 0, end: 0, definitionType: 'System' });
        scopeManager.globalScope.definitions.set('system', systemDefs);

        const cleanContent = content.replace('|', '');
        harness.files.set(uri.replace('file:///', ''), cleanContent);
        const doc = TextDocument.create(uri, 'tdl', 1, cleanContent);
        harness.documents.set(uri, doc);

        // Rebuild/parse the document to populate stateStore
        await harness.runtime.documentLifecycle.rebuild(doc);

        return { harness, doc, offset: content.indexOf('|'), uri };
    }

    it('should suggest definition types on typing [', async () => {
        const { harness, doc, offset } = await setupHarness('[|');
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        expect(result.items.length).toBeGreaterThan(0);
        const reportItem = result.items.find(i => i.label === 'Report');
        expect(reportItem).toBeDefined();
        expect(reportItem?.insertText).toBe('Report : ');
    });



    it('should suggest definition types when modifier is present', async () => {
        const { harness, doc, offset } = await setupHarness('[#|');
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        expect(result.items.length).toBeGreaterThan(0);
        const reportItem = result.items.find(i => i.label === 'Report');
        expect(reportItem).toBeDefined();
        expect(reportItem?.label).toBe('Report');
    });

    it('should suggest definition types after exclamation modifier [!Re', async () => {
        const { harness, doc, offset } = await setupHarness('[!Re|');
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        const reportItem = result.items.find(i => i.label === 'Report');
        expect(reportItem).toBeDefined();
    });

    it('should suggest definition names after colon when modifier is present [#Report: ]', async () => {
        const { harness, doc, offset } = await setupHarness('[#Report: |]');
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        expect(result.items.length).toBeGreaterThan(0);
        const balanceSheetItem = result.items.find(i => i.label === 'Balance Sheet');
        const trialBalanceItem = result.items.find(i => i.label === 'Trial Balance');
        expect(balanceSheetItem).toBeDefined();
        expect(trialBalanceItem).toBeDefined();
    });

    it('should suggest built-in system sub-types after System type [System: ] without modifier', async () => {
        const { harness, doc, offset } = await setupHarness('[System: |]');
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        const expectedNames = ['Formula', 'Formulae', 'Variable', 'Variables', 'TDL Name', 'TDL Names', 'UDF'];
        for (const name of expectedNames) {
            const item = result.items.find(i => i.label === name);
            expect(item).toBeDefined();
            expect(item?.kind).toBe(CompletionItemKind.Keyword);
            expect(item?.detail).toBe('System Type');
        }
    });

    it('should suggest definition names with spaces matching partial typed input [#Report: She]', async () => {
        const { harness, doc, offset } = await setupHarness('[#Report: She|]');
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        const balanceSheetItem = result.items.find(i => i.label === 'Balance Sheet');
        const trialBalanceItem = result.items.find(i => i.label === 'Trial Balance');
        expect(balanceSheetItem).toBeDefined();
        expect(trialBalanceItem).toBeUndefined(); // Should filter out 'Trial Balance' since it does not contain 'she'
    });

    it('should suggest direct System: <subtype> combinations when typing definition type (e.g. [For)', async () => {
        const { harness, doc, offset } = await setupHarness('[For|');
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        const systemFormulaItem = result.items.find(i => i.label === 'System : Formula');
        expect(systemFormulaItem).toBeDefined();
        expect(systemFormulaItem?.insertText).toBe('System : Formula');
        expect(systemFormulaItem?.kind).toBe(CompletionItemKind.Keyword);
        expect(systemFormulaItem?.detail).toBe('System Definition Type');
    });

    it('should suggest all SYSTEM_DEFINITION_NAMES direct combinations when triggering type completion [|', async () => {
        const { harness, doc, offset } = await setupHarness('[|');
        const result = await harness.runtime.completion.complete({
            textDocument: { uri: doc.uri },
            position: doc.positionAt(offset)
        });

        for (const subtype of SYSTEM_DEFINITION_NAMES) {
            const expectedLabel = `System : ${subtype}`;
            const item = result.items.find(i => i.label === expectedLabel);
            expect(item).toBeDefined();
            expect(item?.insertText).toBe(expectedLabel);
            expect(item?.kind).toBe(CompletionItemKind.Keyword);
            expect(item?.detail).toBe('System Definition Type');
        }
    });
});
