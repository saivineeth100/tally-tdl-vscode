import { describe, it, expect } from 'vitest';
import { detectXmlCompletionContext } from '../../features/completion';

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

        it('should detect attribute_value context', () => {
            const xml = `<VOUCHER>
                <PARTYLEDGERNAME>Cash</
            </VOUCHER>`;
            
            // Cursor after Cash
            const offset = xml.indexOf('Cash') + 4;
            
            const context = detectXmlCompletionContext(xml, offset, undefined);
            
            expect(context.type).toBe('attribute_value');
            expect((context as any).attributeName).toBe('PARTYLEDGERNAME');
            expect((context as any).tagPath).toEqual(['VOUCHER', 'PARTYLEDGERNAME']);
        });
    });
});
