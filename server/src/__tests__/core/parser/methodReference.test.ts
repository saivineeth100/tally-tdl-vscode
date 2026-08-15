import { describe, expect, test } from 'vitest';
import { Parser } from '../../../core/parser/parser';
import { cleanAST } from './utils';
import { SyntaxKind, MethodReferenceNode, ComplexMethodReferenceNode } from '../../../core/ast/ast';

describe('Parser Method References Tests', () => {
    test('Parse Simple Method Reference', () => {
        const input = `[Report: complex]
        Set As: $MethodName
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Complex Method Reference with Index and Property', () => {
        const input = `[Report: complex]
        Set As: $(Ledger, "Cash").Bills[1].Amount
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Simple Dotted Method Reference with Index', () => {
        const input = `[Report: complex]
        Set As: $Bills[1].Amount
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Nested Complex Dotted Method Reference with Index and Condition', () => {
        const input = `[Report: complex]
        Set As: $Group.Ledger.Bills[1, "Amount > 10"].Amount
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Reference Access with Multiple Colons', () => {
        const input = `[Report: complex]
        Set As: $Bills[index].methodName: Ledger : ##SVLedgerName
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Deep Reference Access', () => {
        const input = `[Report: complex]
        Set As: $Group:Ledger:LedgerEntries[last].ledgername
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Method Reference in Function Statement', () => {
        const input = `[Function: complexFunc]
        10 : SET : myVar : $Bills[index].methodName: Ledger : ##SVLedgerName
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    test('Parse Method Reference in Collection Statement', () => {
        const input = `[Collection: myColl]
        Walk : $Group:Ledger:LedgerEntries[last].ledgername
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(sourceFile.errors).toEqual([]);
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });
});
