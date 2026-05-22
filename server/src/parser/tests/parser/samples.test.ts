
import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { DefinitionNode } from '../../ast';

describe('Parser - Sample Files', () => {
    it('should parse Simple Var.txt structure', () => {
        const input = `
[Function: Simple Var in Func]
    Variable    : Simple Var : String
    01: SET     : Simple Var : "Variable value set within Function"
    02: DISPLAY : SimpleReport

[Report: Simple Report]
    Form    : Simple Report
    Title   : "Function Scope"

[Form: Simple Report]
    Parts   : Simple Report

[Part: Simple Report]
    Lines   : Simple Report Info
    Width   : 60% Page
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile.definitions.length).toBe(4);
        expect(sourceFile.definitions[0].type.text).toBe("Function");
        expect(sourceFile.definitions[1].type.text).toBe("Report");
        expect(sourceFile.definitions[2].type.text).toBe("Form");
        expect(sourceFile.definitions[3].type.text).toBe("Part");
    });

    it('should parse Collection with Filter attribute', () => {
        const input = `
[Collection: CAF My Ledgers]
    Type        : Ledger
    Child of    : $$GroupSundryDebtors
    Belongs to  : Yes
    Filter      : CAF Ledger Filter
    Fetch       : Name, STPartyFullAdd, StateName

[System: Formula]
    CAF Ledger Filter : $Name CONTAINS "Ltd"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile.definitions.length).toBe(2);
        expect(sourceFile.definitions[0].type.text).toBe("Collection");
        expect(sourceFile.definitions[0].attributes.length).toBeGreaterThan(3);
        expect(sourceFile.definitions[1].type.text).toBe("System");
    });

    it('should parse Variable and Button definitions', () => {
        const input = `
[Variable: Smp Show Master]
    Type    : String

[Button: Smp Show Group]
    Key     : Ctrl + R
    Action  : Set : Smp ShowMaster : "Groups"
    Title   : "Show Groups"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile.definitions.length).toBe(2);
        expect(sourceFile.definitions[0].type.text).toBe("Variable");
        expect(sourceFile.definitions[1].type.text).toBe("Button");
    });

    it('should parse Switch attribute in Collection', () => {
        const input = `
[Collection: My Coll]
    Use     : Alias Collection
    Switch  : OptCase : MyLed Coll : ##SmpShowMaster = "Ledgers"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile.definitions.length).toBe(1);
        const coll = sourceFile.definitions[0];
        expect(coll.attributes.some(a => a.name.text === "Switch")).toBe(true);
    });
});
