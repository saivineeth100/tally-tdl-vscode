import { expect, test, describe } from 'vitest';
import { parseXmlToAst } from '../../../core/xml/xmlAdapter';

describe('XML Adapter - Basic Parsing', () => {
    test('should parse a basic definition', () => {
        const xml = `<TDLMESSAGE><REPORT NAME="MyReport"><USE>AnotherReport</USE></REPORT></TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions.length).toBe(1);
        expect(ast.definitions[0].type.text).toBe('REPORT');
        expect(ast.definitions[0].name?.text).toBe('MyReport');
    });

    test('should ignore root TDL tag', () => {
        const xml = `<TDL><TDLMESSAGE><FORM NAME="TestForm"></FORM></TDLMESSAGE></TDL>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions.length).toBe(1);
        expect(ast.definitions[0].type.text).toBe('FORM');
        expect(ast.definitions[0].name?.text).toBe('TestForm');
    });

    test('should parse multiple definitions', () => {
        const xml = `<TDLMESSAGE>
            <REPORT NAME="Report1"></REPORT>
            <FORM NAME="Form1"></FORM>
        </TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions.length).toBe(2);
        expect(ast.definitions[0].type.text).toBe('REPORT');
        expect(ast.definitions[1].type.text).toBe('FORM');
    });

    test('should parse attributes within definition', () => {
        const xml = `<TDLMESSAGE>
            <REPORT NAME="MyReport">
                <USE>AnotherReport</USE>
                <SET>Var : 1</SET>
            </REPORT>
        </TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions[0].attributes.length).toBe(2);
        expect(ast.definitions[0].attributes[0].name.text).toBe('USE');
        // Values in attribute nodes are complex arrays (IdentifierNode, LiteralNode, etc.)
        // But we can check that it parsed the attribute successfully.
        expect(ast.definitions[0].attributes[1].name.text).toBe('SET');
    });

    test('should parse TDLMESSAGE anywhere in the hierarchy', () => {
        const xml = `<ENVELOPE>
            <BODY>
                <TDLMESSAGE>
                    <REPORT NAME="NestedReport"></REPORT>
                </TDLMESSAGE>
            </BODY>
        </ENVELOPE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions.length).toBe(1);
        expect(ast.definitions[0].type.text).toBe('REPORT');
        expect(ast.definitions[0].name?.text).toBe('NestedReport');
    });
});
