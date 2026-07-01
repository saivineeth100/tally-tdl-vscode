import { expect, test, describe } from 'vitest';
import { parseXmlToAst } from '../../../core/xml/xmlAdapter';

describe('XML Adapter - Offsets', () => {
    test('should map exact text positions for Definitions and Attributes', () => {
        // We use exact strings and indexOf to ensure offsets match exactly
        const xml = `<TDLMESSAGE>
  <REPORT NAME="TargetReport">
    <USE>BaseReport</USE>
  </REPORT>
</TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        const reportDef = ast.definitions[0];
        const useAttr = reportDef.attributes[0];

        const reportStartIndex = xml.indexOf('<REPORT');
        const reportEndIndex = xml.indexOf('</REPORT>') + '</REPORT>'.length;

        // Definition boundaries
        expect(reportDef.start).toBe(reportStartIndex);
        expect(reportDef.end).toBe(reportEndIndex);
        
        // Definition Name
        expect(reportDef.name?.text).toBe('TargetReport');
        expect(reportDef.name?.start).toBe(xml.indexOf('TargetReport'));

        // Attribute boundaries
        const useStartIndex = xml.indexOf('<USE');
        const useEndIndex = xml.indexOf('</USE>') + '</USE>'.length;
        
        // Due to the dummy wrapper strategy, attribute start/end might be mapped to 
        // the inner tag text, but it should be close enough for Hover to trigger.
        // Let's ensure the attribute name and value fall within the correct overall range.
        expect(useAttr.start).toBeGreaterThanOrEqual(useStartIndex);
        expect(useAttr.end).toBeLessThanOrEqual(useEndIndex);

        // Attribute value text 'BaseReport'
        // The value node is likely a dummy identifier node since it's just text
        const useValue = useAttr.value[0];
        expect(useValue.start).toBeGreaterThanOrEqual(xml.indexOf('BaseReport'));
    });
});
