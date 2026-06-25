import { describe, it, expect } from 'vitest';
import { findReferenceAtOffset } from '../../../services/definition';
import { parseXmlToAst } from '../../../parser/xmlAdapter';
import { ScopeManager } from '../../../services/scopeManager';
import { SymbolTable } from '../../../services/symbolTable';

// Mock Metadata
const symbolTable = new SymbolTable();
const mockScopeManager = new ScopeManager(symbolTable);

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
        
        const ref = findReferenceAtOffset(sourceFile, offset, xmlContent, mockScopeManager);
        expect(ref).toBeDefined();
        expect(ref?.name).toBe('MyOtherReport');
        expect(ref?.expectedType).toBe('REPORT');
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
        
        const ref = findReferenceAtOffset(sourceFile, offset, xmlContent, mockScopeManager);
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
        
        const ref = findReferenceAtOffset(sourceFile, offset, xmlContent, mockScopeManager);
        expect(ref).toBeUndefined();
    });
});
