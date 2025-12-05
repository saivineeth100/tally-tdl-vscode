
import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { DefinitionNode, StatementNode } from '../../ast';

describe('Advanced UDF Features', () => {
    it('should parse multi-line statements with + continuation', () => {
        const input = `
[Function: MultiLine]
    01 : Action : Arg1, Arg2, +
                  Arg3
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const def = sourceFile.definitions[0] as DefinitionNode;
        const stmt = def.statements[0];
        console.log("Args found:", stmt.args.length);
        stmt.args.forEach((a, i) => console.log(`Arg ${i}:`, (a as any).text || (a as any).value));

        expect(stmt.args.length).toBe(3);
        expect((stmt.args[2] as any).text).toBe("Arg3");
    });

    it('should parse inline directives', () => {
        const input = `
[Function: WithDirective]
    <InUse: Collection: MyColl>
    00 : Log : "Test"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const def = sourceFile.definitions[0] as DefinitionNode;

        // Assuming we store directives in the definition or just skip them without error
        // For now, let's verify we at least get the statement
        expect(def.statements.length).toBe(1);
        expect(def.statements[0].label?.text).toBe("00");
    });

    it('should parse Object attribute in function', () => {
        const input = `
[Function: WithObject]
    Object : MyObj
    01 : Log : "Test"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const def = sourceFile.definitions[0] as DefinitionNode;

        expect(def.attributes.length).toBe(1);
        expect(def.attributes[0].name.text).toBe("Object");
        expect(def.statements.length).toBe(1);
    });
});
