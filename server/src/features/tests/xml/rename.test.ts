import { describe, it, expect } from 'vitest';
import { findReferenceAtOffset } from '../../../services/definition';
import { parseXmlToAst } from '../../../parser/xmlAdapter';

// Mock Metadata
const mockMetadata = {
    findDefinitionAttribute: (name: string, type?: string) => {
        if (name.toLowerCase() === 'use') {
            return {
                Name: 'Use',
                Parameters: [
                    { RefersTo: 'Report' }
                ]
            };
        }
        return undefined;
    },
    actions: []
} as any;

describe('XML Rename Tests', () => {
    it('Finds rename target correctly for attribute values in XML', () => {
        const xmlContent = `
<TDL>
  <TDLMESSAGE>
    <REPORT NAME="MyReport">
      <USE>MyOtherReport</USE>
    </REPORT>
  </TDLMESSAGE>
</TDL>`;
        
        const sourceFile = parseXmlToAst(xmlContent);
        const offset = xmlContent.indexOf('MyOtherReport') + 2; // inside <USE> tag
        
        const ref = findReferenceAtOffset(sourceFile, offset, xmlContent, mockMetadata);
        expect(ref).toBeDefined();
        // The rename feature relies on exactly this reference to determine what text to replace
        expect(ref?.start).toBeDefined();
        expect(ref?.end).toBeDefined();
        
        // Assert the range precisely maps to the "MyOtherReport" string
        const extractedStr = xmlContent.substring(ref!.start, ref!.end);
        expect(extractedStr).toBe('MyOtherReport');
    });

    it('Finds exact rename range for list items in XML', () => {
        // Expand mock metadata to handle PARTS
        mockMetadata.findDefinitionAttribute = (name: string) => {
            if (name.toLowerCase() === 'parts') {
                return { Name: 'Parts', Parameters: [{ IsList: true, RefersTo: 'Part' }] };
            }
            return undefined;
        };

        const xmlContent = `
<TDL>
  <TDLMESSAGE>
    <FORM NAME="MyForm">
      <PARTS>Part1, Part2, Part3</PARTS>
    </FORM>
  </TDLMESSAGE>
</TDL>`;
        
        const sourceFile = parseXmlToAst(xmlContent);
        const offset = xmlContent.indexOf('Part2') + 2; // inside "Part2"
        
        const ref = findReferenceAtOffset(sourceFile, offset, xmlContent, mockMetadata);
        expect(ref).toBeDefined();
        expect(ref?.name).toBe('Part2');
        expect(ref?.expectedType).toBe('Part');
        
        // Assert the range precisely maps to the "Part2" string
        const extractedStr = xmlContent.substring(ref!.start, ref!.end);
        expect(extractedStr).toBe('Part2');
    });
});
