import { describe, expect, it } from "vitest";
import { Parser } from "../../parser";
import { cleanAST } from "./utils";
import { InUseDirectiveNode, UnknownDirectiveNode, DefTypeDirectiveNode } from "../../ast";

describe("Parser - Inline Directives", () => {
    it("should correctly parse inline directives inside definitions", () => {
        const tdl = `
[Function: Test Directives]
    <InUse: Collection: RMColl>
    01: SET: MyVar: 10
`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        expect(sourceFile.errors.length).toBe(0);
        
        const def = sourceFile.definitions[0];
        expect(def.directives.length).toBe(1);
        
        const dir1 = def.directives[0] as InUseDirectiveNode;
        expect(dir1.name).toBe("InUse");
        expect(dir1.targets.length).toBe(1);
        expect(dir1.targets[0].typeName).toBe("Collection");
        expect(dir1.targets[0].defName).toBe("RMColl");

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    it("should not confuse relational operators for directives", () => {
        const tdl = `
[Function: Relational Check]
    01: IF: $$Value < 10
    02:     SET: Status: "Low"
    03: END IF
`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        expect(sourceFile.errors.length).toBe(0);
        
        const def = sourceFile.definitions[0];
        expect(def.directives.length).toBe(0); // `<` here is a math operator
        
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });

    it("should correctly parse file level directives", () => {
        const tdl = `
<Deftype: Variable>
<Deftype: Function>

[Variable: MyVar]
    Type: String
`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        expect(sourceFile.errors.length).toBe(0);
        
        expect(sourceFile.directives.length).toBe(2);
        
        const dir1 = sourceFile.directives[0] as DefTypeDirectiveNode;
        expect(dir1.name).toBe("Deftype");
        expect(dir1.defType).toBe("Variable");

        const dir2 = sourceFile.directives[1] as DefTypeDirectiveNode;
        expect(dir2.name).toBe("Deftype");
        expect(dir2.defType).toBe("Function");

        const def = sourceFile.definitions[0];
        expect(def.type.text).toBe("Variable");

        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });
});
