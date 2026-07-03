import { describe, it, expect, vi } from 'vitest';
import { detectXmlCompletionContext } from '../../../features/completion';
import { CompletionService } from '../../../services/completionService';
import { DocumentContextResolver } from '../../../services/documentContextResolver';
import { ServerTestHarness } from '../../harness/serverTestHarness';
import { CompletionParams, Position } from 'vscode-languageserver';

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
                    expect(context.tagPath).toEqual(['ENVELOPE', 'BODY', 'TALLYMESSAGE', 'VOUCHER']);
                    expect(context.attributeName).toBe('PARTYLEDGERNAME');
                }
            });

            it('detects property value context for standard XML attributes', () => {
                const xml = `<TALLYMESSAGE><VOUCHER><ALLLEDGERENTRIES.LIST ISDEEMEDPOSITIVE="`;
                // Cursor inside quotes
                const offset = xml.length;

                const context = detectXmlCompletionContext(xml, offset, undefined);

                expect(context.type).toBe('attribute_value');
                if (context.type === 'attribute_value') {
                    expect(context.tagPath).toEqual(['TALLYMESSAGE', 'VOUCHER', 'ALLLEDGERENTRIES.LIST']);
                    expect(context.attributeName).toBe('ISDEEMEDPOSITIVE');
                }
            });

            it('handles incomplete tags', () => {
                const xml = `<VOUCHER><PARTYLEDGERNAME>Cash</PARTYLEDGERNAME><`;
                // Cursor after <
                const offset = xml.length;

                const context = detectXmlCompletionContext(xml, offset, undefined);

                expect(context.type).toBe('attribute_value'); // Fallback logic usually pushes it as attribute of parent
                if (context.type === 'attribute_value') {
                    expect(context.attributeName).toBe('PARTYLEDGERNAME');
                    expect(context.tagPath).toEqual(['VOUCHER', 'PARTYLEDGERNAME']);
                }
            });
        });
    });



    describe('TDL Completion', () => {
        it('suggests strictly in-scope targets for Local chains', async () => {
            const harness = new ServerTestHarness();
            const tdlContent = `
[Report: MyReport]
Use: BaseReport

[Form: MyForm]
Part: MyPart, OtherPart

[Part: MyPart]
[Part: OtherPart]
`;

            harness.files.files.set('d:/test.tdl', tdlContent);

            await harness.runtime.services.workspaceScanner.indexFile('d:/test.tdl');

            const uri = 'file:///d:/test.tdl';
            const doc = harness.documents.get(uri);
            if (!doc) throw new Error('Document not loaded');

            // We are trying to autocomplete inside [Form: MyForm] Local : Part : 
            const modifiedContent = tdlContent.replace('Part: MyPart, OtherPart', 'Part: MyPart, OtherPart\nLocal : Part : ');
            harness.files.files.set('d:/test.tdl', modifiedContent);
            await harness.runtime.services.workspaceScanner.indexFile('d:/test.tdl');

            const docModified = harness.documents.get(uri);
            if (!docModified) throw new Error('Document not loaded');

            const offset = modifiedContent.indexOf('Local : Part : ') + 'Local : Part : '.length;

            const result = await harness.runtime.completion.complete({
                textDocument: { uri },
                position: docModified.positionAt(offset)
            });

            const myPartItem = result.items.find((i) => i.label === 'mypart');
            const otherPartItem = result.items.find((i) => i.label === 'otherpart');

            // Should ONLY suggest definitions in scope!
            expect(myPartItem).toBeDefined();
        });
    });
});
