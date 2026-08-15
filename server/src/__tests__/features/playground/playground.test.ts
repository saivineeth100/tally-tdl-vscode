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

    it('should parse Import envelope with multiple objects and nested lists into playground state', async () => {
        const { parseXmlEnvelopeToPlaygroundState } = await import('../../../core/xml/xmlAdapter');

        const xml = `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Masters</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVMSTIMPORTFORMAT>XML</SVMSTIMPORTFORMAT>
                <SVCURRENTCOMPANY>Acme Corp</SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <LEDGER NAME="Customer A" Action="Create">
                    <NAME>Customer A</NAME>
                    <PARENT>Sundry Debtors</PARENT>
                    <OPENINGBALANCE>1500.00</OPENINGBALANCE>
                    <ADDRESS.LIST>
                        <ADDRESS>123 Main Street</ADDRESS>
                        <ADDRESS>Sector 5, Industrial Area</ADDRESS>
                    </ADDRESS.LIST>
                </LEDGER>
                <LEDGER NAME="Customer B" Action="Create">
                    <NAME>Customer B</NAME>
                    <PARENT>Sundry Debtors</PARENT>
                    <OPENINGBALANCE>2500.00</OPENINGBALANCE>
                </LEDGER>
                <GROUP NAME="North Debtors" Action="Alter">
                    <NAME>North Debtors</NAME>
                    <PARENT>Sundry Debtors</PARENT>
                </GROUP>
                <VOUCHER VCHTYPE="Sales" Action="Create" OBJVIEW="Accounting Voucher View">
                    <DATE>20240401</DATE>
                    <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                    <PARTYLEDGERNAME>Customer A</PARTYLEDGERNAME>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>Customer A</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                        <AMOUNT>-1500.00</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>Sales Account</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <AMOUNT>1500.00</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                </VOUCHER>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`;

        const state = parseXmlEnvelopeToPlaygroundState(xml);
        expect(state.tallyRequest).toBe('Import');
        expect(state.type).toBe('Data');
        expect(state.id).toBe('All Masters');
        expect(state.staticVariables).toHaveLength(2);
        expect(state.staticVariables[0].name).toBe('SVMSTIMPORTFORMAT');
        expect(state.staticVariables[0].value).toBe('XML');

        expect(state.tallyObjects).toBeDefined();
        expect(state.tallyObjects).toHaveLength(4);

        // Object 1: Ledger Customer A with primitive repeated ADDRESS.LIST
        const obj0 = state.tallyObjects![0];
        expect(obj0.objectType.toUpperCase()).toBe('LEDGER');
        expect(obj0.action).toBe('Create');
        expect(obj0.name).toBe('Customer A');
        expect(obj0.properties).toHaveLength(4);
        expect(obj0.properties[0].name).toBe('NAME');
        expect(obj0.properties[0].value).toBe('Customer A');
        expect(obj0.properties[1].name).toBe('PARENT');
        expect(obj0.properties[1].value).toBe('Sundry Debtors');
        expect(obj0.properties[2].name).toBe('OPENINGBALANCE');
        expect(obj0.properties[2].value).toBe('1500.00');

        const addrList = obj0.properties.find(p => p.name === 'ADDRESS.LIST');
        expect(addrList).toBeDefined();
        expect(addrList?.isList).toBe(true);
        expect(addrList?.children).toHaveLength(2);
        expect(addrList?.children![0].name).toBe('ADDRESS');
        expect(addrList?.children![0].value).toBe('123 Main Street');
        expect(addrList?.children![1].name).toBe('ADDRESS');
        expect(addrList?.children![1].value).toBe('Sector 5, Industrial Area');

        // Object 2: Ledger Customer B
        const obj1 = state.tallyObjects![1];
        expect(obj1.objectType.toUpperCase()).toBe('LEDGER');
        expect(obj1.action).toBe('Create');
        expect(obj1.name).toBe('Customer B');

        // Object 3: Group North Debtors (Alter action)
        const obj2 = state.tallyObjects![2];
        expect(obj2.objectType.toUpperCase()).toBe('GROUP');
        expect(obj2.action).toBe('Alter');
        expect(obj2.name).toBe('North Debtors');

        // Object 4: Voucher with nested ALLLEDGERENTRIES.LIST
        const obj3 = state.tallyObjects![3];
        expect(obj3.objectType.toUpperCase()).toBe('VOUCHER');
        expect(obj3.action).toBe('Create');
        expect(obj3.vchType).toBe('Sales');
        expect(obj3.objView).toBe('Accounting Voucher View');

        const lists = obj3.properties.filter(p => p.isList);
        expect(lists).toHaveLength(2);
        expect(lists[0].name).toBe('ALLLEDGERENTRIES.LIST');
        expect(lists[0].children).toBeDefined();
        expect(lists[0].children).toHaveLength(3);
        expect(lists[0].children![0].name).toBe('LEDGERNAME');
        expect(lists[0].children![0].value).toBe('Customer A');
        expect(lists[0].children![2].name).toBe('AMOUNT');
        expect(lists[0].children![2].value).toBe('-1500.00');
    });

    it('should parse deeply nested repeated lists within complex lists', async () => {
        const { parseXmlEnvelopeToPlaygroundState } = await import('../../../core/xml/xmlAdapter');

        const xml = `<ENVELOPE>
    <HEADER>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Masters</ID>
    </HEADER>
    <BODY>
        <DESC>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER VCHTYPE="Sales" Action="Create">
                    <ALLINVENTORYENTRIES.LIST>
                        <STOCKITEMNAME>Widget A</STOCKITEMNAME>
                        <BASICUSERDESCRIPTION.LIST>
                            <BASICUSERDESCRIPTION>Line 1 description</BASICUSERDESCRIPTION>
                            <BASICUSERDESCRIPTION>Line 2 description</BASICUSERDESCRIPTION>
                        </BASICUSERDESCRIPTION.LIST>
                        <RATE>150.00</RATE>
                        <AMOUNT>1500.00</AMOUNT>
                    </ALLINVENTORYENTRIES.LIST>
                </VOUCHER>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`;

        const state = parseXmlEnvelopeToPlaygroundState(xml);
        expect(state.tallyObjects).toHaveLength(1);
        const voucher = state.tallyObjects![0];
        expect(voucher.properties).toHaveLength(1);

        const invList = voucher.properties[0];
        expect(invList.name).toBe('ALLINVENTORYENTRIES.LIST');
        expect(invList.isList).toBe(true);
        expect(invList.children).toBeDefined();
        expect(invList.children).toHaveLength(4);

        expect(invList.children![0].name).toBe('STOCKITEMNAME');
        expect(invList.children![0].value).toBe('Widget A');

        const descList = invList.children![1];
        expect(descList.name).toBe('BASICUSERDESCRIPTION.LIST');
        expect(descList.isList).toBe(true);
        expect(descList.children).toHaveLength(2);
        expect(descList.children![0].name).toBe('BASICUSERDESCRIPTION');
        expect(descList.children![0].value).toBe('Line 1 description');
        expect(descList.children![1].name).toBe('BASICUSERDESCRIPTION');
        expect(descList.children![1].value).toBe('Line 2 description');
    });

    test('should correctly parse SYSTEM Formulae and FETCH with wildcards', async () => {
        const { parseXmlEnvelopeToPlaygroundState } = await import('../../../core/xml/xmlAdapter');
        const xml = `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>SalesVoucherCollection</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="SalesVoucherCollection">
                        <TYPE>Voucher</TYPE>
                        <FETCH>Date, VoucherTypeName, VoucherNumber, PartyLedgerName, Amount, AllLedgerEntries.List.*, AllInventoryEntries.List.*</FETCH>
                        <FILTER>SalesTypeFilter</FILTER>
                    </COLLECTION>
                    <SYSTEM TYPE="Formulae" NAME="SalesTypeFilter">$VoucherTypeName = "Sales"</SYSTEM>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`;

        const state = parseXmlEnvelopeToPlaygroundState(xml);
        expect(state.definitions).toHaveLength(2);

        // Definition 1: Collection
        const colDef = state.definitions[0];
        expect(colDef.defType.toUpperCase()).toBe('COLLECTION');
        expect(colDef.name).toBe('SalesVoucherCollection');
        const fetchAttr = colDef.attributes.find(a => a.name.toUpperCase() === 'FETCH');
        expect(fetchAttr).toBeDefined();
        expect(fetchAttr!.values).toContain('AllLedgerEntries.List.*');
        expect(fetchAttr!.values).toContain('AllInventoryEntries.List.*');

        // Definition 2: System Formulae
        const sysDef = state.definitions[1];
        expect(sysDef.defType.toUpperCase()).toBe('SYSTEM');
        expect(sysDef.name).toBe('Formulae');
        expect(sysDef.attributes).toHaveLength(1);
        expect(sysDef.attributes[0].name).toBe('SalesTypeFilter');
        expect(sysDef.attributes[0].values[0]).toBe('$VoucherTypeName = "Sales"');
    });
});
