
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
        expect((def.statements[0].label as any)?.text).toBe("00");
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

    it('should parse complex dotted method references', () => {
        const input = `
[Function: Test]
    01 : Log : $(Ledger, @@Party).BillAllocations[1].OpeningBalance
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const def = sourceFile.definitions[0] as DefinitionNode;
        const stmt = def.statements[0];
        const arg = stmt.args[0] as any;
        expect(arg.constructor.name).toBe("ComplexMethodReferenceNode");
        expect(arg.primaryObject.type.text).toBe("Ledger");
        expect(arg.primaryObject.identifier.formulaName.text).toBe("Party"); // Fixed to check formulaName
        expect(arg.pathSpecs.length).toBe(1);
        expect(arg.pathSpecs[0].collectionName.text).toBe("BillAllocations");
        expect(arg.pathSpecs[0].index.value).toBe(1);
        expect(arg.methodName.text).toBe("OpeningBalance");
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
        const def = sourceFile.definitions[0] as DefinitionNode;
        



        
        expect(def.statements.length).toBe(2);
        expect(def.statements[0].constructor.name).toBe("BatchPostNode");
        expect((def.statements[0] as any).batchSize.value).toBe(100);
        expect(def.statements[1].constructor.name).toBe("MsgBoxNode");
        expect((def.statements[1] as any).title.value).toBe('"Title"');
        expect((def.statements[1] as any).message.value).toBe('"Msg"');
    });
});
