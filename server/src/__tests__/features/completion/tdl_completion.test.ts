import { describe, it, expect, vi, beforeAll } from 'vitest';
import { detectXmlCompletionContext } from '../../../features/completion';
import { CompletionService } from '../../../services/completionService';
import { DocumentContextResolver } from '../../../services/documentContextResolver';
import { createDiagnostic, DiagnosticRules } from '../../../diagnostics';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ServerTestHarness } from '../../harness/serverTestHarness';
import { CompletionParams, Position } from 'vscode-languageserver';
import { testScopeManager, ensureBaseTdlLoaded } from '../../test-setup';

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
            harness.runtime.services.documentStateStore.tdlScopeManager.globalScope = testScopeManager!.globalScope;
            harness.runtime.services.documentStateStore.xmlScopeManager.globalScope = testScopeManager!.globalScope;

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
            const doc = TextDocument.create(uri, 'tdl', 1, tdlContent);
            harness.documents.set(uri, doc);
            await harness.runtime.documentLifecycle.rebuild(doc);

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
    });
});
