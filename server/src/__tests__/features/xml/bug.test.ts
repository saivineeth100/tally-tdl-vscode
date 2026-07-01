import { describe, it, expect } from 'vitest';
import { parseXmlToAst } from '../../../core/xml/xmlAdapter';

describe('XML Partial Tag Match Bug Tests', () => {
    it('Should not confuse <LINES> with <LINE>', () => {
        const xmlContent = `
<PART NAME="Simple TB Part">
  <LINES>Simple TB Title, Simple TB Details</LINES>
</PART>
<LINE NAME="Simple TB Title">
  <USE>Simple TB Details</USE>
</LINE>
        `;
        
        const ast = parseXmlToAst(xmlContent);
        expect(ast.definitions.length).toBe(2);
        
        expect(ast.definitions[0].type.text).toBe('PART');
        expect(ast.definitions[0].name?.text).toBe('Simple TB Part');
        expect(ast.definitions[0].attributes.length).toBe(1);
        expect(ast.definitions[0].attributes[0].name.text).toBe('LINES');
        
        expect(ast.definitions[1].type.text).toBe('LINE');
        expect(ast.definitions[1].name?.text).toBe('Simple TB Title');
        expect(ast.definitions[1].attributes.length).toBe(1);
        expect(ast.definitions[1].attributes[0].name.text).toBe('USE');
        
        // Ensure that the offsets of <LINE> do not overlap with <LINES>
        const partEnd = ast.definitions[0].end;
        const lineStart = ast.definitions[1].start;
        expect(lineStart).toBeGreaterThan(partEnd);
    });
});
