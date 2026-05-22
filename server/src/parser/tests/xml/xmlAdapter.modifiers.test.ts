import { expect, test, describe } from 'vitest';
import { parseXmlToAst } from '../../xmlAdapter';

describe('XML Adapter - Modifiers', () => {
    test('should parse ISMODIFY attribute to modifier token', () => {
        const xml = `<TDLMESSAGE><REPORT NAME="MyReport" ISMODIFY="Yes"></REPORT></TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions[0].modifier).toBeDefined();
        expect(ast.definitions[0].modifier?.Text).toBe('#');
    });

    test('should parse ISOPTION attribute to modifier token', () => {
        const xml = `<TDLMESSAGE><REPORT NAME="MyReport" ISOPTION="Yes"></REPORT></TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions[0].modifier).toBeDefined();
        expect(ast.definitions[0].modifier?.Text).toBe('!');
    });

    test('should parse ISINITIALIZE attribute to modifier token', () => {
        const xml = `<TDLMESSAGE><REPORT NAME="MyReport" ISINITIALIZE="Yes"></REPORT></TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions[0].modifier).toBeDefined();
        expect(ast.definitions[0].modifier?.Text).toBe('*');
    });

    test('should ignore "No" values for modifiers', () => {
        const xml = `<TDLMESSAGE><REPORT NAME="MyReport" ISMODIFY="No" ISOPTION="No" ISINITIALIZE="No"></REPORT></TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions[0].modifier).toBeUndefined();
    });
});
