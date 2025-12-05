
import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { SyntaxKind, DefinitionNode, StatementNode } from '../../ast';

describe('Parser - UDFs', () => {
    it('should parse a simple function definition with statements', () => {
        const input = `
[Function: SimpleFunction]
    01 : Log : "Hello"
    02 : Return : True
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile.definitions.length).toBe(1);
        const def = sourceFile.definitions[0] as DefinitionNode;
        expect(def.type.text).toBe("Function");
        expect(def.name?.text).toBe("SimpleFunction");

        expect(def.statements.length).toBe(2);

        const stmt1 = def.statements[0];
        expect(stmt1.label?.text).toBe("01"); // IdentifierNode or LiteralNode depending on implementation
        expect(stmt1.action.text).toBe("Log");
        // Check args
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
        const def = sourceFile.definitions[0] as DefinitionNode;

        expect(def.attributes.length).toBe(2);
        expect(def.attributes[0].name.text).toBe("Parameter");
        expect(def.attributes[1].name.text).toBe("Returns");

        expect(def.statements.length).toBe(1);
        expect(def.statements[0].label?.text).toBe("00");
    });

    it('should parse function with Start label', () => {
        const input = `
[Function: StartFunction]
    Start : Log : "Started"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const def = sourceFile.definitions[0] as DefinitionNode;

        expect(def.statements.length).toBe(1);
        expect(def.statements[0].label?.text).toBe("Start");
        expect(def.statements[0].action.text).toBe("Log");
    });
});
