
import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { cleanAST } from './utils';

describe('Advanced UDF Features', () => {
    it('should parse multi-line statements with + continuation', () => {
        const input = `
[Function: MultiLine]
    01 : Action : Arg1, Arg2, +
                  Arg3
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    it('should parse inline directives', () => {
        const input = `
[Function: WithDirective]
    <InUse: Collection: MyColl>
    00 : Log : "Test"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    it('should parse Object attribute in function', () => {
        const input = `
[Function: WithObject]
    Object : MyObj
    01 : Log : "Test"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    it('should parse complex dotted method references', () => {
        const input = `
[Function: Test]
    01 : Log : $(Ledger, @@Party).BillAllocations[1].OpeningBalance
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    it('should parse advanced procedural blocks', () => {
        const input = `
[Function: TestBlocks]
    01 : START BATCH POST : 100
    02 : END BATCH POST
    03 : Start MSG BOX : "Title" : "Msg"
    04 : End MSG BOX
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });
});
