import { describe, it, expect } from 'vitest';
import { Parser } from '../../../core/parser/parser';
import { cleanAST } from './utils';

describe('Parser Error Recovery', () => {
    describe('Incomplete Definition Parsing', () => {
        it('should create DefinitionNode for incomplete input [Report:', () => {
            const tdl = '[Report:';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should create DefinitionNode for incomplete input [Field: Name', () => {
            const tdl = '[Field: Name';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse modifier in incomplete definition [#Report:', () => {
            const tdl = '[#Report:';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should handle empty brackets []', () => {
            const tdl = '[]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse complete definition normally', () => {
            const tdl = '[Report: MyReport]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should continue parsing after incomplete definition', () => {
            const tdl = `[Report: First
[Field: ValidField]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });
    });

    describe('Modifier Parsing', () => {
        it('should parse # modifier', () => {
            const tdl = '[#Report: Existing]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse ! modifier', () => {
            const tdl = '[!Report: ToDelete]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse * modifier', () => {
            const tdl = '[*Report: Optional]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });
    });

    describe('Procedural Block Errors', () => {
        it('should detect unclosed blocks', () => {
            const tdl = `[Function: UnclosedTest]
            01 : IF : True
            02 :   LOG : "Hello"`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should detect mismatched terminators', () => {
            const tdl = `[Function: MismatchTest]
            01 : IF : True
            02 :   LOG : "Hello"
            03 : END WHILE`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should detect unclosed FOR block', () => {
            const tdl = `[Function: UnclosedForTest]
            01 : FOR : Variable
            02 :   LOG : "Hello"`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should detect unclosed FOR RANGE block', () => {
            const tdl = `[Function: UnclosedForRangeTest]
            01 : FOR RANGE : Variable : 1 : 10
            02 :   LOG : "Hello"`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should detect unclosed WALK COLLECTION block', () => {
            const tdl = `[Function: UnclosedWalkCollectionTest]
            01 : WALK COLLECTION : MyColl
            02 :   LOG : "Hello"`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should detect mismatched END START MSG BOX', () => {
            const tdl = `[Function: MismatchMsgBoxTest]
            01 : START MSG BOX : "Message"
            02 :   LOG : "Hello"
            03 : END PROGRESS`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should detect unmatched END MSG BOX', () => {
            const tdl = `[Function: UnmatchedMsgBoxTest]
            01 : LOG : "Hello"
            02 : END MSG BOX`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should capture Expected Definition Type when inline directive `<` breaks parsing', () => {
            const tdl = `[Function: BrokenDirectiveTest]
            <InUse:Key:License>
            01 : LOG : "Hello"`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should fail gracefully when line continuation `+` is treated as operator breaking the block', () => {
            const tdl = `[Function: BrokenLineContinuationTest]
            01 : SET OBJECT VALUES : .InventoryEntries[1].StockItemName: "A", +
                                     .InventoryEntries[2].StockItemName: "B"
            02 : LOG : "Hello"`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });
    });
});
