
import { describe, expect, test } from 'vitest';
import { Parser } from '../../parser';
import { cleanAST } from './utils';

describe('Parser Complex Attributes Tests', () => {
    test('Parse Complex Attributes (Function, var, field)', () => {
        const input = `[Report: complex]
        Set As: $$IsEmpty : #FieldName
        Set By: ##Variable
        Width: 10
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Multi-line Attributes (Line Continuation)', () => {
        const input = `[System: Formula]
        My Formula : if $$IsEmpty:##MyVar +
                     then "Empty" +
                     else "Not Empty"
                     
        Another Formula: "Hello " +
            "World"`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse List Values with line breaks', () => {
        const input = `[Collection: My Coll]
        Data : "Item 1",
        "Item 2",
        "Item 3"
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('should parse Function attributes in any casing, spacing, and aliases', () => {
        const tdl = `
[Function: MultiWordTest]
    L I S T V A R I A B L E : MyListVar : String
    LocalFormula  : Formula1  : 10 + 20
    var iables    : x         : Number
    Return        : Number
    Action        : Display   : My Report
    Fetch Object  : Ledger    : ##LedgerName
    StaticVariable: SVar      : Number
    
    10 : RETURN : ##x
`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });
});
