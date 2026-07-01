import { describe, it, expect } from 'vitest';
import { findReferenceAtOffset } from '../../../features/definition';
import { parseXmlToAst } from '../../../core/xml/xmlAdapter';
import { ScopeManager } from '../../../semantics/scopeManager';

// Mock Metadata
const mockScopeManager = new ScopeManager();

// Add 'use' attribute to REPORT
const reportAttrs = new Map<string, any>();
reportAttrs.set('use', {
    name: 'Use',
    parameters: [{ RefersTo: 'Report' }]
});
mockScopeManager.globalScope.attributes.set('REPORT', reportAttrs);

// Add 'parts' attribute to FORM
const formAttrs = new Map<string, any>();
formAttrs.set('parts', {
    name: 'Parts',
    parameters: [{ IsList: true, RefersTo: 'Part' }]
});
mockScopeManager.globalScope.attributes.set('FORM', formAttrs);

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
        
        const ref = findReferenceAtOffset(sourceFile, offset, xmlContent, mockScopeManager);
        expect(ref).toBeDefined();
        // The rename feature relies on exactly this reference to determine what text to replace
        expect(ref?.start).toBeDefined();
        expect(ref?.end).toBeDefined();
        
        // Assert the range precisely maps to the "MyOtherReport" string
        const extractedStr = xmlContent.substring(ref!.start, ref!.end);
        expect(extractedStr).toBe('MyOtherReport');
    });

    it('Finds exact rename range for list items in XML', () => {
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
        
        const ref = findReferenceAtOffset(sourceFile, offset, xmlContent, mockScopeManager);
        expect(ref).toBeDefined();
        expect(ref?.name).toBe('Part2');
        expect(ref?.expectedType).toBe('Part');
        
        // Assert the range precisely maps to the "Part2" string
        const extractedStr = xmlContent.substring(ref!.start, ref!.end);
        expect(extractedStr).toBe('Part2');
    });
});
