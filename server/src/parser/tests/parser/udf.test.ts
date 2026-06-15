
import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { cleanAST } from './utils';

describe('Parser - UDFs', () => {
    it('should parse a simple function definition with statements', () => {
        const input = `
[Function: SimpleFunction]
    01 : Log : "Hello"
    02 : Return : True
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    it('should parse function attributes and statements mixed', () => {
        const input = `
[Function: MixedFunction]
    Parameter : P1 : String
    Returns   : Boolean
    00 : Log : ##P1
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    it('should parse function with Start label', () => {
        const input = `
[Function: StartFunction]
    Start : Log : "Started"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });
});
