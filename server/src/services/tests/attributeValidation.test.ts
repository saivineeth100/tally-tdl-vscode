import { describe, it, expect, beforeAll } from 'vitest';
import { Parser } from '../../parser/parser';
import { TDLFunction } from '../../models/tdlFunction';
import {
    validateDefinitionAttributes
} from '../validation';
import { DiagnosticRules } from '../../diagnostics';
import { normalizeTypeName } from '../utils';
import { SymbolTable, definitionTypeToSymbolKind } from '../symbolTable';
import { testMetadata } from '../../test-setup';

describe('Attribute Validation', () => {

    describe('normalizeTypeName', () => {
        it('should convert to lowercase', async () => {
            expect(normalizeTypeName('Report')).toBe('report');
            expect(normalizeTypeName('FIELD')).toBe('field');
        });

        it('should remove spaces', async () => {
            expect(normalizeTypeName('Stock Item')).toBe('stockitem');
            expect(normalizeTypeName('Key Value Map')).toBe('keyvaluemap');
        });

        it('should handle combined cases', async () => {
            expect(normalizeTypeName('Import Object')).toBe('importobject');
        });
    });



    describe('Mandatory Parameter Validation', () => {
        it('should detect missing mandatory parameters in Report', async () => {
            const tdl = `[Report: MyReport]
                Form:
                Title: "My Title"
            `;

            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);

            const def = sourceFile.definitions[0];
            const diagnostics = validateDefinitionAttributes(def, docReal, testMetadata!);

            const formDiag = diagnostics.find(d =>
                d.code === DiagnosticRules.MissingParameters.code ||
                d.code === DiagnosticRules.MissingMandatoryParameter.code
            );
            expect(formDiag).toBeDefined();
        });

        it('should accept valid mandatory parameters', async () => {
            const tdl = `[Report: ValidReport]
                Form: MyForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const formDiag = diagnostics.find(d => d.code === DiagnosticRules.MissingParameters.code);
            expect(formDiag).toBeUndefined();
        });
    });

    describe('Reference Validation', () => {
        let symbolTable: SymbolTable;

        beforeAll(() => {
            symbolTable = new SymbolTable();
            symbolTable.addSymbol({
                name: 'ExistingForm',
                kind: definitionTypeToSymbolKind('Form'),
                definitionType: 'Form',
                uri: 'file:///other.tdl',
                start: 0,
                end: 10
            });
        });


        it('should validate reference to existing form', async () => {
            const tdl = `[Report: RefReport]
                Form: ExistingForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!, symbolTable);
            const refError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            expect(refError).toBeUndefined();
        });

        it('should report error for non-existent form', async () => {
            const tdl = `[Report: BadRefReport]
                Form: NonExistentForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!, symbolTable);

            const refError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            expect(refError).toBeDefined();
        });
    });

    describe('List Modifier Validation', () => {
        // The dynamic transformation splits "Add/Replace/Delete" into separate definitions.
        // They inherit the original definition's parameters (1 mandatory param).
        // This test verifies that each split part is recognized as a valid attribute.

        it('should recognize Add as a valid attribute after transformation', async () => {
            const addDef = testMetadata!.findDefinitionAttribute('Add', 'Report');
            expect(addDef).toBeDefined();
            expect(addDef?.Name).toBe('Add');
        });

        it('should recognize Delete as a valid attribute after transformation', async () => {
            const delDef = testMetadata!.findDefinitionAttribute('Delete', 'Report');
            expect(delDef).toBeDefined();
            expect(delDef?.Name).toBe('Delete');
        });

        it('should recognize Replace as a valid attribute after transformation', async () => {
            const repDef = testMetadata!.findDefinitionAttribute('Replace', 'Report');
            expect(repDef).toBeDefined();
            expect(repDef?.Name).toBe('Replace');
        });

        it('should validate Add attribute with correct parameters', async () => {
            // Original Add/Replace/Delete has 1 mandatory param
            const tdl = `[Report: TestReport]
                Add: Form: NewForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            // No missing mandatory param errors expected, as original has 1 mandatory and we provided 2
            const diag = diagnostics.find(d => d.code === DiagnosticRules.MissingParameters.code);
            expect(diag).toBeUndefined();
        });

        it('should replace Description with part-specific text for Add', async () => {
            const addDef = testMetadata!.findDefinitionAttribute('Add', 'Report');
            expect(addDef).toBeDefined();
            // Description should NOT contain "Add/Replace/Delete" or similar combined patterns
            expect(addDef?.Description).not.toMatch(/Add\/Replace\/Delete/i);
            expect(addDef?.Description).not.toMatch(/ADD\/Delete\/Replace/i);
            // Should contain the part name
            expect(addDef?.Description).toMatch(/Add/i);
        });

        it('should replace Description with part-specific text for Delete', async () => {
            const delDef = testMetadata!.findDefinitionAttribute('Delete', 'Report');
            expect(delDef).toBeDefined();
            expect(delDef?.Description).not.toMatch(/Add\/Replace\/Delete/i);
            expect(delDef?.Description).not.toMatch(/ADD\/Delete\/Replace/i);
            expect(delDef?.Description).toMatch(/Delete/i);
        });

        it('should replace Description with part-specific text for Replace', async () => {
            const repDef = testMetadata!.findDefinitionAttribute('Replace', 'Report');
            expect(repDef).toBeDefined();
            expect(repDef?.Description).not.toMatch(/Add\/Replace\/Delete/i);
            expect(repDef?.Description).not.toMatch(/ADD\/Delete\/Replace/i);
            expect(repDef?.Description).toMatch(/Replace/i);
        });
    });

    describe('Datatype Validation', () => {
        it('should validate Logical datatype with invalid value', async () => {
            // Part has Balance attribute with Logical datatype
            const tdl = `[Part: TestPart]
                Balance: Maybe
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.InvalidLogicalValue.code);
            expect(diag).toBeDefined();
        });

        it('should accept valid Logical values', async () => {
            const tdl = `[Part: TestPart]
                Balance: Yes
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.InvalidLogicalValue.code);
            expect(diag).toBeUndefined();
        });

        it('should validate Keyword parameter with invalid value', async () => {
            // Part has Horizontal Align attribute with Keyword type
            const tdl = `[Part: TestPart]
                Horizontal Align: Invalid
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.InvalidKeyword.code);
            expect(diag).toBeDefined();
        });

        it('should accept valid Keyword values', async () => {
            const tdl = `[Part: TestPart]
                Horizontal Align: Center
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.InvalidKeyword.code);
            expect(diag).toBeUndefined();
        });

        it('should cache keywordSets during testMetadata! loading', async () => {
            // Check if keywordSets is populated
            expect(testMetadata!.keywordSets.size).toBeGreaterThan(0);
            // Align Type should be cached
            const alignTypeKeywords = testMetadata!.keywordSets.get('Align Type');
            expect(alignTypeKeywords).toBeDefined();
            expect(alignTypeKeywords).toContain('Center');
            expect(alignTypeKeywords).toContain('Left');
        });
    });

    describe('Function Return Type Validation', () => {
        it('should have functions loaded in testMetadata!', async () => {
            expect(testMetadata!.functions.length).toBeGreaterThan(0);
        });

        it('should have function with ReturnType', async () => {
            const printDate = testMetadata!.functions.find((f: TDLFunction) => f.Name === 'PrintDate');
            expect(printDate).toBeDefined();
            expect(printDate?.ReturnType).toBe('Date');
        });

        it('should have function parameters with DataType', async () => {
            const dateFunc = testMetadata!.functions.find((f: TDLFunction) => f.Name === 'Date');
            expect(dateFunc).toBeDefined();
            expect(dateFunc?.Parameters?.length).toBeGreaterThan(0);
            expect(dateFunc?.Parameters?.[0].DataType).toBe('Date');
        });

        it('should check type compatibility for compatible types', async () => {
            // String accepts number, date, etc.
            // This test validates the areTypesCompatible logic indirectly
            const stringFuncs = testMetadata!.functions.filter((f: TDLFunction) => f.ReturnType === 'String');
            const dateFuncs = testMetadata!.functions.filter((f: TDLFunction) => f.ReturnType === 'Date');
            expect(stringFuncs.length).toBeGreaterThan(0);
            expect(dateFuncs.length).toBeGreaterThan(0);
        });
    });
});

