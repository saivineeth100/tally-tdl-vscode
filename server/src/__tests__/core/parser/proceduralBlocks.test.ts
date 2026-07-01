import { describe, it, expect } from 'vitest';
import { Parser } from '../../../core/parser/parser';
import { cleanAST } from './utils';

describe('Parser - Procedural Block Success Cases', () => {

    describe('1. Conditional Constructs', () => {
        it('should parse IF-ENDIF block', () => {
            const tdl = `
[Function : SimpleIf]
01 : IF : ##A > ##B
02 :   LOG : "A is greater"
03 : ENDIF
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse IF-ELSE-ENDIF block with nested IFs', () => {
            const tdl = `
[Function : NestedIfElse]
01 : IF : ##A > ##B
02 :   IF : ##A > ##C
03 :     RETURN : ##A
04 :   ELSE
05 :     RETURN : ##C
06 :   END IF
07 : ELSE
08 :   IF : ##B > ##C
09 :     RETURN : ##B
10 :   ELSE
11 :     RETURN : ##C
12 :   END IF
13 : END IF
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse DO IF construct', () => {
            const tdl = `
[Function: DoIfTest]
01 : DO IF : ##A > ##B : LOG : "A is greater"
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });
    });

    describe('2. Looping Constructs', () => {
        it('should parse WHILE-ENDWHILE block', () => {
            const tdl = `
[Function: WhileLoopTest]
01 : WHILE : NOT $$IsEmpty:##Row
02 :   LOG : ##Row
03 :   INCREMENT : Row
04 : END WHILE
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse WALK COLLECTION block', () => {
            const tdl = `
[Function: WalkCollTest]
01 : WALK COLLECTION : MyLedgerColl
02 :   IF : $$IsEmpty:$Name
03 :     CONTINUE
04 :   END IF
05 :   LOG : $Name
06 : END WALK
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse FOR COLLECTION block', () => {
            const tdl = `
[Function: ForCollTest]
01 : FOR COLLECTION : i : Group : $ClosingBalance > 1000
02 :   LOG : ##i
03 : END FOR
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse FOR IN block', () => {
            const tdl = `
[Function: ForInTest]
10 : FOR IN : KeyVar : CVEmp
20 :   IF : ($$IsSysName:##KeyVar)
30 :     CONTINUE
40 :   END IF
50 : END FOR
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse FOR RANGE block', () => {
            const tdl = `
[Function: ForRangeTest]
10 : FOR RANGE : IteratorVar : Number : 1 : ##CompVarCount : 1
20 :   LOG : ##IteratorVar
30 :   BREAK
40 : END FOR
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse FOR TOKEN block', () => {
            const tdl = `
[Function: ForTokenTest]
01 : FOR TOKEN : TokenVar : "Tally : Shopper" : ":"
02 :   LOG : ##TokenVar
03 : END FOR
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse FOR RANGE block', () => {
            const tdl = `
[Function: ForRangeTest]
01 : FOR RANGE : IteratorVar : Number : 2 : 10 : 2
02 :   LOG : ##IteratorVar
03 : END FOR
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse complex nested block structure', () => {
            const tdl = `
[Function: ComplexNestedTest]
01 : FOR COLLECTION : i : Group
02 :   IF : ##i > 10
03 :     WHILE : ##i < 20
04 :       LOG : ##i
05 :       INCREMENT : i
06 :     END WHILE
07 :   END IF
08 : END FOR
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });
    });

    describe('3. Control Constructs & Actions', () => {
        it('should parse START BLOCK - END BLOCK', () => {
            const tdl = `
[Function: StartBlockTest]
01 : START BLOCK
02 :   LOG : "Inside Block"
03 : END BLOCK
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse BREAK and CONTINUE and RETURN statements', () => {
            const tdl = `
[Function: ControlTest]
01 : WHILE : True
02 :   BREAK
03 :   CONTINUE
04 :   RETURN : False
05 : END WHILE
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse SET, EXCHANGE, INCREMENT, DECREMENT actions', () => {
            const tdl = `
[Function: ActionTest]
01 : SET       : MyVar : 100
02 : EXCHANGE  : Var1  : Var2
03 : INCREMENT : MyVar : 10
04 : DECREMENT : MyVar : 5
`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse WHILE Loop with LessThan operator and Progress blocks', () => {
            const input = `[Function: TSPL Smp Async MsgBox Actions]
        10: Start Msg Box : "Status" : "Message"
        20:   Start Progress : 300 : "Company" : "Creating Ledgers" : "Please wait"
        30:     While : ##Counter < 300
        40:       Log : "Doing work"
        50:     End While
        60:   End Progress
        70: End Msg Box
        `;
            const parser = new Parser(input);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });

        it('should parse all START/END block pairs correctly', () => {
            const input = `[Function: StartEndBlocksTest]
        01: Start Batch Post
        02:   Start Zip : "test.zip"
        03:     Start Unzip : "test.zip"
        04:       Start Block
        05:         Log : "Doing work"
        06:       End Block
        07:     End Unzip
        08:   End Zip
        09: End Batch Post
        `;
            const parser = new Parser(input);
            const sourceFile = parser.parse();
            expect(sourceFile.errors).toEqual([]);
            expect(cleanAST(sourceFile)).toMatchSnapshot();
        });
    });
});
