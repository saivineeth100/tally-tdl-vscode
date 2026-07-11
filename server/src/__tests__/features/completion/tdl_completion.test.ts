import { describe, it, expect, vi, beforeAll } from 'vitest';
import { detectXmlCompletionContext } from '../../../features/completion';
import { CompletionService } from '../../../services/completionService';
import { DocumentContextResolver } from '../../../services/documentContextResolver';
import { createDiagnostic, DiagnosticRules } from '../../../diagnostics';

import { ServerTestHarness } from '../../harness/serverTestHarness';
import { CompletionParams, Position } from 'vscode-languageserver';
import { testScopeManager, ensureBaseTdlLoaded, populateMetadata } from '../../test-setup';

describe('XML Completion Context Detection', () => {

    describe('detectXmlCompletionContext', () => {
        it('should detect schema_type context inside TALLYMESSAGE', () => {
            const xml = `<ENVELOPE>
                <BODY>
                    <TALLYMESSAGE>
                        <
                    </TALLYMESSAGE>
                </BODY>
            </ENVELOPE>`;

            // Cursor is after the < inside TALLYMESSAGE
            const offset = xml.indexOf('<', xml.indexOf('<TALLYMESSAGE>') + 10) + 1;

            const context = detectXmlCompletionContext(xml, offset, undefined);

            expect(context.type).toBe('schema_type');
            expect(context.hasModifier).toBe(false);
        });

        it('should detect xml_schema_attribute context for primary schema tags', () => {
            const xml = `<ENVELOPE>
                <BODY>
                    <TALLYMESSAGE>
                        <VOUCHER>
                            <
                        </VOUCHER>
                    </TALLYMESSAGE>
                </BODY>
            </ENVELOPE>`;

            const offset = xml.indexOf('<', xml.indexOf('<VOUCHER>') + 5) + 1;

            const context = detectXmlCompletionContext(xml, offset, undefined);

            expect(context.type).toBe('xml_schema_attribute');
            expect((context as any).tagPath).toEqual(['ENVELOPE', 'BODY', 'TALLYMESSAGE', 'VOUCHER']);
        });

        it('should detect deeply nested xml_schema_attribute context', () => {
            const xml = `<TALLYMESSAGE>
                <VOUCHER>
                    <ALLLEDGERENTRIES.LIST>
                        <
                    </ALLLEDGERENTRIES.LIST>
                </VOUCHER>
            </TALLYMESSAGE>`;

            const offset = xml.indexOf('<', xml.indexOf('<ALLLEDGERENTRIES.LIST>') + 10) + 1;

            const context = detectXmlCompletionContext(xml, offset, undefined);

            expect(context.type).toBe('xml_schema_attribute');
            expect((context as any).tagPath).toEqual(['TALLYMESSAGE', 'VOUCHER', 'ALLLEDGERENTRIES.LIST']);
        });

        describe('Attributes', () => {
            it('detects attribute value context for tag body content', () => {
                const xml = `<ENVELOPE><BODY><TALLYMESSAGE><VOUCHER><PARTYLEDGERNAME>Cash`;
                // Cursor after Cash
                const offset = xml.indexOf('Cash') + 4;

                const context = detectXmlCompletionContext(xml, offset, undefined);

                expect(context.type).toBe('attribute_value');
                if (context.type === 'attribute_value') {
                    expect(context.tagPath).toEqual(['ENVELOPE', 'BODY', 'TALLYMESSAGE', 'VOUCHER', 'PARTYLEDGERNAME']);
                    expect(context.attributeName).toBe('PARTYLEDGERNAME');
                }
            });

            it('detects property value context for standard XML attributes', () => {
                const xml = `<TALLYMESSAGE><VOUCHER><ALLLEDGERENTRIES.LIST ISDEEMEDPOSITIVE="`;
                // Cursor inside quotes
                const offset = xml.length;

                const context = detectXmlCompletionContext(xml, offset, undefined);

                expect(context.type).toBe('xml_schema_attribute');
                if (context.type === 'xml_schema_attribute') {
                    expect((context as any).tagPath).toEqual(['TALLYMESSAGE', 'VOUCHER']);
                }
            });

            it('handles incomplete tags', () => {
                const xml = `<VOUCHER><PARTYLEDGERNAME>Cash</PARTYLEDGERNAME><`;
                // Cursor after <
                const offset = xml.length;

                const context = detectXmlCompletionContext(xml, offset, undefined);

                expect(context.type).toBe('xml_schema_attribute'); // Fallback logic usually pushes it as attribute of parent
                if (context.type === 'xml_schema_attribute') {
                    expect((context as any).tagPath).toEqual(['VOUCHER']);
                }
            });
        });
    });



    describe('TDL Completion', () => {
        beforeAll(async () => {
            await ensureBaseTdlLoaded();
        }, 60000);

        it('suggests strictly in-scope targets for Local chains', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Report: myreport]
Use: BaseReport

[Form: myform]
Part: mypart, otherpart
Local : Part : 

[Part: mypart]
[Part: otherpart]
`;

            harness.files.set('d:/test.tdl', tdlContent);
            const uri = 'file:///d:/test.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            const offset = tdlContent.indexOf('Local : Part : ') + 'Local : Part : '.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offset)
            });

            const myPartItem = result.items.find((i) => i.label === 'mypart');
            const otherPartItem = result.items.find((i) => i.label === 'otherpart');

            // Should ONLY suggest definitions in scope!
            expect(myPartItem).toBeDefined();
            expect(otherPartItem).toBeDefined();
        });

        it('suggests Option definitions for Option attribute completions', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Option: MyOpt]
[Part: MyPart]
Option : 
`;
            harness.files.set('d:/test_opt.tdl', tdlContent);
            const uri = 'file:///d:/test_opt.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            const offset = tdlContent.indexOf('Option : ') + 'Option : '.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offset)
            });

            const optionItem = result.items.find((i) => i.label === 'MyOpt');
            expect(optionItem).toBeDefined();
        });

        it('suggests Option definitions for Switch attribute completions at parameter index 1', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Option: TargetOpt]
[Part: MyPart]
Switch : CaseLabel : 
`;
            harness.files.set('d:/test_sw.tdl', tdlContent);
            const uri = 'file:///d:/test_sw.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            const offset = tdlContent.indexOf('Switch : CaseLabel : ') + 'Switch : CaseLabel : '.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offset)
            });

            const optionItem = result.items.find((i) => i.label === 'TargetOpt');
            expect(optionItem).toBeDefined();
        });

        it('suggests current definition type matching items for Use completions', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Part: BasePart]
[Part: MyPart]
Use : 
`;
            harness.files.set('d:/test_use.tdl', tdlContent);
            const uri = 'file:///d:/test_use.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            const offset = tdlContent.indexOf('Use : ') + 'Use : '.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offset)
            });

            const basePartItem = result.items.find((i) => i.label === 'BasePart');
            expect(basePartItem).toBeDefined();
        });

        it('suggests restricted definition types (Form, Part, Line, Field) for Local modifier completions', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Form: MyForm]
Local : 
`;
            harness.files.set('d:/test_local_types.tdl', tdlContent);
            const uri = 'file:///d:/test_local_types.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            const offset = tdlContent.indexOf('Local : ') + 'Local : '.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offset)
            });



            const formItem = result.items.find((i) => i.label === 'Form');
            const partItem = result.items.find((i) => i.label === 'Part');
            const lineItem = result.items.find((i) => i.label === 'Line');
            const fieldItem = result.items.find((i) => i.label === 'Field');

            expect(formItem).toBeDefined();
            expect(partItem).toBeDefined();
            expect(lineItem).toBeDefined();
            expect(fieldItem).toBeDefined();

            const reportItem = result.items.find((i) => i.label === 'Report');
            const menuItem = result.items.find((i) => i.label === 'Menu');
            expect(reportItem).toBeUndefined();
            expect(menuItem).toBeUndefined();
        });

        it('suggests attribute value completions for target attribute inside Local chain', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Part: MyPart]
Local : Field : MyField : Set As : @@
`;
            harness.files.set('d:/test_local_val.tdl', tdlContent);
            const uri = 'file:///d:/test_local_val.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            const offset = tdlContent.indexOf('Set As : @@') + 'Set As : @@'.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offset)
            });

            // Should suggest formulas (such as DSPMSTNameStyleStr, etc.)
            expect(result.items.length).toBeGreaterThan(0);
            const formulaItem = result.items.find((i) => i.label.toLowerCase() === 'dspmstnamestylestr');
            expect(formulaItem).toBeDefined();
        });

        it('suggests nested modifier elements inside Local chains', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Part: MyPart]
Local : Part : MyPart : add : Line : 

[Line: MyLine]
`;
            harness.files.set('d:/test_local_nested.tdl', tdlContent);
            const uri = 'file:///d:/test_local_nested.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            const offset = tdlContent.indexOf('Line : ') + 'Line : '.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offset)
            });

            // Should suggest position modifiers (Before, After, etc.)
            const beforeItem = result.items.find((i) => i.label === 'Before');
            const afterItem = result.items.find((i) => i.label === 'After');
            expect(beforeItem).toBeDefined();
            expect(afterItem).toBeDefined();

            // Should ALSO suggest Line definition names in scope
            const lineItem = result.items.find((i) => i.label === 'MyLine');
            expect(lineItem).toBeDefined();
        });

        it('suggests top-level Add modifier elements', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Part: MyPart]
add : Line : 

[Line: MyLine]
`;
            harness.files.set('d:/test_toplevel_nested.tdl', tdlContent);
            const uri = 'file:///d:/test_toplevel_nested.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            const offset = tdlContent.indexOf('Line : ') + 'Line : '.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offset)
            });

            // Should suggest position modifiers (Before, After, etc.)
            const beforeItem = result.items.find((i) => i.label === 'Before');
            const afterItem = result.items.find((i) => i.label === 'After');
            expect(beforeItem).toBeDefined();
            expect(afterItem).toBeDefined();

            // Should ALSO suggest Line definition names in scope
            const lineItem = result.items.find((i) => i.label === 'MyLine');
            expect(lineItem).toBeDefined();
        });

        it('suggests top-level and nested Delete modifier elements', async () => {
            const harness = new ServerTestHarness();
            populateMetadata(harness);

            const tdlContent = `
[Form: MyForm]
Delete : Part : 
Local : Part : MyPart : Delete : Line : 

[Part: MyPart]
[Line: MyLine]
`;
            harness.files.set('d:/test_delete_completions.tdl', tdlContent);
            const uri = 'file:///d:/test_delete_completions.tdl';
            const doc = harness.simulateOpen(uri, 'tdl', tdlContent);
            harness.runtime.documentLifecycle.processPendingDocuments();

            // 1. Check top-level Delete : Part : 
            const offsetToplevel = tdlContent.indexOf('Delete : Part : ') + 'Delete : Part : '.length;
            const resultToplevel = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offsetToplevel)
            });
            const partItem = resultToplevel.items.find((i) => i.label === 'MyPart');
            expect(partItem).toBeDefined();

            // 2. Check nested Delete : Line : 
            const offsetNested = tdlContent.indexOf('Delete : Line : ') + 'Delete : Line : '.length;
            const resultNested = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: doc.positionAt(offsetNested)
            });
            const lineItem = resultNested.items.find((i) => i.label === 'MyLine');
            expect(lineItem).toBeDefined();
        });
    });
});
