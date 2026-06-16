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
        if (name.toLowerCase() === 'parts') {
            return {
                Name: 'Parts',
                Parameters: [
                    { IsList: true, RefersTo: 'Part' }
                ]
            };
        }
        return undefined;
    },
    actions: []
} as any;

describe('XML Definition Tests', () => {
    it('Finds definition reference for attribute values in XML', () => {
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
        expect(ref?.name).toBe('MyOtherReport');
        expect(ref?.expectedType).toBe('Report');
    });

    it('Finds definition reference for list item in XML', () => {
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
    });

    it('Fails gracefully if cursor is outside attribute value', () => {
        const xmlContent = `
<TDL>
  <TDLMESSAGE>
    <REPORT NAME="MyReport">
      <USE>MyOtherReport</USE>
    </REPORT>
  </TDLMESSAGE>
</TDL>`;
        
        const sourceFile = parseXmlToAst(xmlContent);
        const offset = xmlContent.indexOf('<USE>'); // cursor before attribute value
        
        const ref = findReferenceAtOffset(sourceFile, offset, xmlContent, mockMetadata);
        expect(ref).toBeUndefined();
    });
});
