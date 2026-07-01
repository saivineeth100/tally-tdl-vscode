import { expect, test, describe } from 'vitest';
import { parseXmlToAst } from '../../../core/xml/xmlAdapter';
import { SyntaxKind } from '../../../core/ast/ast';

describe('XML Adapter - Statements', () => {
    test('should parse simple ACTION statements', () => {
        const xml = `<TDLMESSAGE>
            <REPORT NAME="MyReport">
                <ACTION>01 : Call : MyFunc</ACTION>
            </REPORT>
        </TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions[0].statements.length).toBe(1);
        const stmt = ast.definitions[0].statements[0];
        
        expect(stmt.kind).toBe(SyntaxKind.Statement);
        expect((stmt.label as any)?.text || (stmt.label as any)?.value).toBe('01');
        expect((stmt.action as any).text).toBe('Call');
        // 'MyFunc' is in args
        expect(stmt.args.length).toBeGreaterThan(0);
    });

    test('should group IF blocks correctly', () => {
        const xml = `<TDLMESSAGE>
            <FUNCTION NAME="MyFunc">
                <ACTION>01 : IF : $$IsEmpty:$$Value</ACTION>
                <ACTION>02 :   MsgBox : "Empty"</ACTION>
                <ACTION>03 : ENDIF</ACTION>
            </FUNCTION>
        </TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        expect(ast.definitions[0].statements.length).toBe(1); // The IF block groups everything
        
        const ifStmt: any = ast.definitions[0].statements[0];
        expect((ifStmt.action as any).text.toUpperCase()).toBe('IF');
        expect(ifStmt.statements.length).toBe(1); // MsgBox
        
        const innerStmt = ifStmt.statements[0];
        expect((innerStmt.action as any).text.toUpperCase()).toBe('MSGBOX');
    });

    test('should handle multiple statements and attributes mixed', () => {
        const xml = `<TDLMESSAGE>
            <REPORT NAME="MyReport">
                <USE>BaseReport</USE>
                <ACTION>Call : Func1</ACTION>
                <SET>Var : 2</SET>
                <ACTION>Call : Func2</ACTION>
            </REPORT>
        </TDLMESSAGE>`;
        const ast = parseXmlToAst(xml);
        
        const def = ast.definitions[0];
        expect(def.attributes.length).toBe(2);
        expect(def.statements.length).toBe(2);
    });
});
