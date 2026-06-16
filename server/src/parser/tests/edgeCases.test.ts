import { describe, expect, test } from 'vitest';
import { Lexer } from '../lexer';
import { TokenKind } from '../tokenKind';
import { Parser } from '../parser';
import { SyntaxKind, DefinitionNode, SwitchNode, CaseNode, DefaultNode } from '../ast';

describe('Plan 4 Verification Tests', () => {

    describe('Lexer', () => {
        test('Decimal number lexing (PARSE-01)', () => {
            const lexer = new Lexer('1.52 0.5 100.00');
            const tokens = lexer.Generate();
            // Expected tokens: 1.52 (Number), Space, 0.5 (Number), Space, 100.00 (Number), EOF
            expect(tokens.filter(t => t.Kind === TokenKind.NumberToken).length).toBe(3);
            const numberTokens = tokens.filter(t => t.Kind === TokenKind.NumberToken);
            expect(numberTokens[0].Text).toBe('1.52');
            expect(numberTokens[1].Text).toBe('0.5');
            expect(numberTokens[2].Text).toBe('100.00');
        });

        test('Unterminated strings (PARSE-07)', () => {
            const lexer = new Lexer('Title: "Unterminated string');
            const tokens = lexer.Generate();
            // Should not hang or crash
            const stringToken = tokens.find(t => t.Kind === TokenKind.StringLiteralToken);
            expect(stringToken).toBeDefined();
            expect(stringToken?.Text).toBe('"Unterminated string');
        });

        test('Single-line comment at EOF', () => {
            const lexer = new Lexer(';; comment at EOF');
            const tokens = lexer.Generate();
            // Should be SingleLineComment token, not Unknown
            const eofToken = tokens.find(t => t.Kind === TokenKind.EndOfFileToken);
            expect(eofToken).toBeDefined();
            const commentTrivia = eofToken?.Leading?.find(t => t.Kind === TokenKind.SingleLineComment);
            expect(commentTrivia).toBeDefined();
            expect(commentTrivia?.Text).toBe(';; comment at EOF');
        });

        test('Single quotes for StringLiterals', () => {
            const lexer = new Lexer(`'Echo "Completed Successfully"'`);
            const tokens = lexer.Generate();
            const stringToken = tokens.find(t => t.Kind === TokenKind.StringLiteralToken);
            expect(stringToken).toBeDefined();
            expect(stringToken?.Text).toBe(`'Echo "Completed Successfully"'`);
        });
    });

    describe('Parser', () => {
        test('Parent reference population (PARSE-05)', () => {
            const parser = new Parser('[Report: Test]\nUse: Base');
            const file = parser.parse();
            expect(file.definitions.length).toBe(1);
            const def = file.definitions[0];
            expect(def.parent).toBe(file);
            
            const attr = def.attributes[0];
            expect(attr.parent).toBe(def);
            expect(attr.name.parent).toBe(attr);
        });

        test('Switch/case parsing (PARSE-09)', () => {
            const parser = new Parser(`[Function: TestFunc]
            00 : Switch : ##Var
            01 : Case : 1
            01a : Set : X : 10
            02 : Case : 2
            02a : Set : X : 20
            03 : Default
            03a : Set : X : 30
            04 : End Switch
            `);
            const file = parser.parse();
            const def = file.definitions[0] as DefinitionNode;
            
            const stmts = def.statements;
            expect(stmts.length).toBe(1); // One block statement (SwitchNode)
            const switchNode = stmts[0] as SwitchNode;
            expect(switchNode.kind).toBe(SyntaxKind.Statement);
            expect(switchNode.action.text.toUpperCase()).toBe('SWITCH');
            expect(switchNode.cases.length).toBe(2);
            expect(switchNode.defaultCase).toBeDefined();
            
            const case1 = switchNode.cases[0];
            expect(case1.value?.kind).toBe(SyntaxKind.Literal);
            expect(case1.statements.length).toBe(1); // Set statement
            
            const defCase = switchNode.defaultCase!;
            expect(defCase.statements.length).toBe(1); // Set statement
        });
        
        test('Starting With / Ending With operator (PARSE-02)', () => {
            const parser = new Parser('[Function: TestFunc]\n01: If: ##Var Starting With "A"\n02: End If');
            const file = parser.parse();
            expect(file.definitions.length).toBe(1);
        });

        test('Object Context in expressions', () => {
            const parser = new Parser(`[Report: Test]
            Form : (Ledger, ##LedName).Address[Last].Address`);
            const file = parser.parse();
            expect(file.errors.length).toBe(0);
        });

        test('Complex Array Index inside identifiers', () => {
            const parser = new Parser(`[Function: TSPL Smp NLQ CreateLedger]
            010 : New Object : Ledger : ##TSPLSmpNLQSMSStrings[##Counter]`);
            const file = parser.parse();
            expect(file.errors.length).toBe(0);
        });

        test('Unknown tokens inside unquoted attribute values', () => {
            const parser = new Parser(`[Menu: TSPL Smp Dimensions and Formatting]
            Key Item : Form Height & Width : E : Display : Form Height Width`);
            const file = parser.parse();
            expect(file.errors.length).toBe(0);
        });

        test('Logical operators as identifiers in actions (e.g., FOR IN)', () => {
            const parser = new Parser(`[Function: TSPL Smp NLQ CreateLedger]
            20 : FOR IN : KeyVar : CVEmp
            30  : END FOR`);
            const file = parser.parse();
            expect(file.errors.length).toBe(0);
        });
    });
});
