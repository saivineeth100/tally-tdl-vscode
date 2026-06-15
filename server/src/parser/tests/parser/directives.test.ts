import { describe, expect, it } from "vitest";
import { Parser } from "../../parser";
import { cleanAST } from "./utils";
import { DirectiveNode } from "../../ast";

describe("Parser - Inline Directives", () => {
    it("should correctly parse inline directives inside definitions", () => {
        const tdl = `
[Function: Test Directives]
    <InUse: Collection: RMColl>
    <Delete: Part: HeaderPart>
    01: SET: MyVar: 10
`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        expect(sourceFile.errors.length).toBe(0);
        
        const def = sourceFile.definitions[0];
        expect(def.directives.length).toBe(2);
        
        const dir1 = def.directives[0] as DirectiveNode;
        expect(dir1.name).toBe("InUse");
        expect(dir1.value).toBe("Collection:RMColl");

        const dir2 = def.directives[1] as DirectiveNode;
        expect(dir2.name).toBe("Delete");
        expect(dir2.value).toBe("Part:HeaderPart");

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
});
