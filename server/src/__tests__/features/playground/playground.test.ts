/**
 * Tests for the API Playground LSP custom request handlers.
 * Validates on-demand suggestions for definition types, schema types, collections, reports,
 * as well as attribute and schema property lookups.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ServerTestHarness } from '../../harness/serverTestHarness';
import { populateMetadata } from '../../test-setup';

describe('API Playground LSP Services', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        harness = new ServerTestHarness();
        populateMetadata(harness);
    });

    it('should return definition types for on-demand suggestions', async () => {
        const result = await harness.runtime.customRequests.getPlaygroundSuggestions({
            category: 'definitionType',
            query: 'col',
            limit: 10
        });

        expect(result.category).toBe('definitionType');
        expect(result.items).toBeInstanceOf(Array);
        const lowerItems = result.items.map(i => i.toLowerCase());
        expect(lowerItems).toContain('collection');
    });

    it('should return schema types for on-demand suggestions', async () => {
        const result = await harness.runtime.customRequests.getPlaygroundSuggestions({
            category: 'schemaType',
            query: 'led',
            limit: 10
        });

        expect(result.category).toBe('schemaType');
        expect(result.items).toBeInstanceOf(Array);
        const lowerItems = result.items.map(i => i.toLowerCase());
        expect(lowerItems).toContain('ledger');
    });

    it('should return workspace collections for on-demand suggestions', async () => {
        const tdl = `[Collection: MyTestCollection]\n    Type: Ledger`;
        harness.simulateOpen('file:///test_collection.tdl', 'tdl', tdl);
        harness.runtime.documentLifecycle.processPendingDocuments();

        const result = await harness.runtime.customRequests.getPlaygroundSuggestions({
            category: 'collection',
            query: 'MyTest',
            limit: 10
        });

        expect(result.category).toBe('collection');
        expect(result.items).toContain('MyTestCollection');
    });

    it('should return workspace reports for on-demand suggestions', async () => {
        const tdl = `[Report: MyCustomReport]\n    Form: MyCustomForm`;
        harness.simulateOpen('file:///test_report.tdl', 'tdl', tdl);
        harness.runtime.documentLifecycle.processPendingDocuments();

        const result = await harness.runtime.customRequests.getPlaygroundSuggestions({
            category: 'report',
            query: 'MyCustom',
            limit: 10
        });

        expect(result.category).toBe('report');
        expect(result.items).toContain('MyCustomReport');
    });

    it('should return attributes for a definition type', async () => {
        const result = await harness.runtime.customRequests.getAttributesForDefType({
            defType: 'Collection'
        });

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThan(0);
        const attrNames = result.map(a => a.name.toLowerCase());
        expect(attrNames).toContain('type');
    });

    it('should return schema properties for a schema object', async () => {
        const result = await harness.runtime.customRequests.getSchemaProperties({
            schemaType: 'Ledger'
        });

        expect(result).toBeInstanceOf(Array);
        if (result.length > 0) {
            expect(result[0]).toHaveProperty('name');
            expect(result[0]).toHaveProperty('isComplex');
        }
    });

    it('should parse an XML envelope into playground state using xmlAdapter AST parser', async () => {
        const { parseXmlEnvelopeToPlaygroundState } = await import('../../../core/xml/xmlAdapter');

        const xml = `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>CustomLedgers</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVCURRENTCOMPANY>Demo Company</SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="CustomLedgers" ISMODIFY="No">
                        <TYPE>Ledger</TYPE>
                        <NATIVEMETHOD>Name, ClosingBalance</NATIVEMETHOD>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`;

        const state = parseXmlEnvelopeToPlaygroundState(xml);
        expect(state.tallyRequest).toBe('Export');
        expect(state.type).toBe('Collection');
        expect(state.id).toBe('CustomLedgers');
        expect(state.staticVariables).toHaveLength(2);
        expect(state.staticVariables[0].name).toBe('SVEXPORTFORMAT');
        expect(state.staticVariables[0].value).toBe('$$SysName:XML');
        expect(state.staticVariables[1].name).toBe('SVCURRENTCOMPANY');
        expect(state.staticVariables[1].value).toBe('Demo Company');

        expect(state.definitions).toHaveLength(1);
        expect(state.definitions[0].defType.toUpperCase()).toBe('COLLECTION');
        expect(state.definitions[0].name).toBe('CustomLedgers');
        expect(state.definitions[0].attributes.length).toBeGreaterThanOrEqual(2);
        const typeAttr = state.definitions[0].attributes.find(a => a.name.toUpperCase() === 'TYPE');
        expect(typeAttr?.values).toContain('Ledger');
        const methodAttr = state.definitions[0].attributes.find(a => a.name.toUpperCase() === 'NATIVEMETHOD');
        expect(methodAttr?.values).toContain('Name');
    });

    it('should return attribute value suggestions for Type attribute on Collection', async () => {
        const result = await harness.runtime.customRequests.getPlaygroundSuggestions({
            category: 'attributeValue',
            defType: 'Collection',
            attributeName: 'Type',
            query: 'Ledger',
            limit: 10
        });

        expect(result.category).toBe('attributeValue');
        expect(result.items).toBeInstanceOf(Array);
        const lowerItems = result.items.map(i => i.toLowerCase());
        expect(lowerItems).toContain('ledger');
    });

    it('should return attribute value suggestions for Fetch/NativeMethod based on currentDefinition Type', async () => {
        const result = await harness.runtime.customRequests.getPlaygroundSuggestions({
            category: 'attributeValue',
            defType: 'Collection',
            attributeName: 'Fetch',
            currentDefinition: {
                defType: 'Collection',
                name: 'MyLedgers',
                attributes: [
                    { name: 'Type', values: ['Ledger'] }
                ]
            },
            query: '',
            limit: 20
        });

        expect(result.category).toBe('attributeValue');
        expect(result.items).toBeInstanceOf(Array);
        expect(result.items.length).toBeGreaterThan(0);
    });

    it('should return cross-definition suggestions for Form attribute on Report', async () => {
        const tdl = `[Form: MySpecialForm]\n    Part: MySpecialPart`;
        harness.simulateOpen('file:///test_form.tdl', 'tdl', tdl);
        harness.runtime.documentLifecycle.processPendingDocuments();

        const result = await harness.runtime.customRequests.getPlaygroundSuggestions({
            category: 'attributeValue',
            defType: 'Report',
            attributeName: 'Form',
            query: 'MySpecial',
            limit: 10
        });

        expect(result.category).toBe('attributeValue');
        expect(result.items).toContain('MySpecialForm');
    });

    it('should suggest * wildcard and nested properties for Collection Fetch', async () => {
        const result = await harness.runtime.customRequests.getPlaygroundSuggestions({
            category: 'attributeValue',
            defType: 'Collection',
            attributeName: 'Fetch',
            currentDefinition: {
                defType: 'Collection',
                name: 'MyVouchers',
                attributes: [
                    { name: 'Type', values: ['Voucher'] }
                ]
            },
            query: '',
            limit: 50
        });

        expect(result.items).toContain('*');
        // Should contain nested wildcard e.g. LedgerEntries.* or Address.* if available on Voucher/Ledger
        const hasNestedStar = result.items.some(i => i.endsWith('.*'));
        expect(hasNestedStar).toBe(true);
    });
});
