import { Parser } from './server/src/parser/parser';

const tdl1 = `[Function: UnclosedTest]
            01 : IF : True
            02 :   LOG : "Hello"`;
const parser1 = new Parser(tdl1);
const sourceFile1 = parser1.parse();
console.log("TEST 1 ERRORS:");
console.dir(sourceFile1.errors, { depth: null });

const tdl2 = `[Function: MismatchTest]
            01 : IF : True
            02 :   LOG : "Hello"
            03 : END WHILE`;
const parser2 = new Parser(tdl2);
const sourceFile2 = parser2.parse();
console.log("TEST 2 ERRORS:");
console.dir(sourceFile2.errors, { depth: null });
