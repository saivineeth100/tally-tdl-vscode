import { describe, it, expect } from 'vitest';
import { parseXmlToAst } from '../../../parser/xmlAdapter';
import { SyntaxKind } from '../../../parser/ast';

describe('XML Adapter Parsing Tests', () => {
    it('Parses definitions properly when wrapped in TDLMESSAGE', () => {
        const xmlContent = `
<TDL>
  <TDLMESSAGE>
    <FORM NAME="MyForm">
      <PARTS>MyPart</PARTS>
    </FORM>
  </TDLMESSAGE>
</TDL>`;
        const ast = parseXmlToAst(xmlContent);
        
        expect(ast.definitions.length).toBe(1);
        const formDef = ast.definitions[0];
        
        expect(formDef.type.text).toBe('FORM');
        expect(formDef.name?.text).toBe('MyForm');
        expect(formDef.attributes.length).toBe(1);
        
        const partAttr = formDef.attributes[0];
        expect(partAttr.name.text).toBe('PARTS');
        expect(partAttr.value.length).toBe(1);
        expect((partAttr.value[0] as any).text).toBe('MyPart');
    });

    it('Parses definitions properly when NOT wrapped in TDLMESSAGE (raw tags)', () => {
        // This tests the robust detection logic for snippets
        const xmlContent = `
<PART NAME="Simple TB Part" ISMODIFY="No" ISFIXED="No">
   <LINES>Simple TB Title, Simple TB Details</LINES>
   <REPEAT>Simple TB Details : Simple TB Ledgers</REPEAT>
</PART>`;
        
        const ast = parseXmlToAst(xmlContent);
        
        expect(ast.definitions.length).toBe(1);
        const partDef = ast.definitions[0];
        
        expect(partDef.type.text).toBe('PART');
        expect(partDef.name?.text).toBe('Simple TB Part');
        expect(partDef.attributes.length).toBe(2);
        
        // Lines
        const linesAttr = partDef.attributes[0];
        expect(linesAttr.name.text).toBe('LINES');
        expect(linesAttr.value.length).toBe(2); // Comma separated list
        
        // Repeat
        const repeatAttr = partDef.attributes[1];
        expect(repeatAttr.name.text).toBe('REPEAT');
        expect(repeatAttr.value.length).toBe(2); // Colon separated list
        expect((repeatAttr.value[0] as any).text).toBe('Simple TB Details');
        expect((repeatAttr.value[1] as any).text).toBe('Simple TB Ledgers');
    });

    it('Parses definitions based on known definition types without NAME attribute', () => {
        const xmlContent = `
<SYSTEM>
  <VARIABLE>MyVar : String</VARIABLE>
</SYSTEM>`;
        
        const ast = parseXmlToAst(xmlContent);
        
        // <SYSTEM> should be detected as a definition because it's a known definition type
        expect(ast.definitions.length).toBe(1);
        const sysDef = ast.definitions[0];
        
        expect(sysDef.type.text).toBe('SYSTEM');
        expect(sysDef.name).toBeUndefined();
        
        expect(sysDef.attributes.length).toBe(1);
        expect(sysDef.attributes[0].name.text).toBe('VARIABLE');
    });

    it('Safely ignores wrapper tags outside TDLMESSAGE', () => {
        const xmlContent = `
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Export Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <DATA>
      <TALLYMESSAGE>
         <FORM NAME="Hello"></FORM>
      </TALLYMESSAGE>
    </DATA>
  </BODY>
</ENVELOPE>`;
        
        const ast = parseXmlToAst(xmlContent);
        
        // It should traverse ENVELOPE -> BODY -> DATA -> TALLYMESSAGE to find FORM
        // HEADER -> TALLYREQUEST should NOT be parsed as definitions
        expect(ast.definitions.length).toBe(1);
        expect(ast.definitions[0].type.text).toBe('FORM');
        expect(ast.definitions[0].name?.text).toBe('Hello');
    });

    it('Maps XML definition attributes to AST definition modifiers correctly', () => {
        const xmlContent = `
<TDL>
  <TDLMESSAGE>
    <FORM NAME="ModifyForm" ISMODIFY="Yes"></FORM>
    <PART NAME="OptionPart" ISOPTION="Yes"></PART>
    <LINE NAME="InitLine" ISINITIALIZE="Yes"></LINE>
    <FIELD NAME="NormalField" ISMODIFY="No"></FIELD>
  </TDLMESSAGE>
</TDL>`;
        
        const ast = parseXmlToAst(xmlContent);
        expect(ast.definitions.length).toBe(4);
        
        // ISMODIFY="Yes" -> #
        expect(ast.definitions[0].name?.text).toBe('ModifyForm');
        expect(ast.definitions[0].modifier).toBeDefined();
        expect(ast.definitions[0].modifier?.Text).toBe('#');
        
        // ISOPTION="Yes" -> !
        expect(ast.definitions[1].name?.text).toBe('OptionPart');
        expect(ast.definitions[1].modifier).toBeDefined();
        expect(ast.definitions[1].modifier?.Text).toBe('!');
        
        // ISINITIALIZE="Yes" -> *
        expect(ast.definitions[2].name?.text).toBe('InitLine');
        expect(ast.definitions[2].modifier).toBeDefined();
        expect(ast.definitions[2].modifier?.Text).toBe('*');
        
        // ISMODIFY="No" -> no modifier
        expect(ast.definitions[3].name?.text).toBe('NormalField');
        expect(ast.definitions[3].modifier).toBeUndefined();
    });
});
