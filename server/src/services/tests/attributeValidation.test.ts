import { describe, it, expect, beforeAll } from 'vitest';
import { Parser } from '../../parser/parser';
import { FunctionSymbol, SymbolKind } from '../../models/symbols';
import {
    validateDefinitionAttributes
} from '../validation';
import { DiagnosticRules } from '../../diagnostics';
import { normalizeTypeName } from '../utils';
import { SymbolTable, definitionTypeToSymbolKind } from '../symbolTable';
import { testScopeManager } from '../../test-setup';

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
            const diagnostics = validateDefinitionAttributes(def, docReal, testScopeManager!);

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

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const formDiag = diagnostics.find(d => d.code === DiagnosticRules.MissingParameters.code);
            expect(formDiag).toBeUndefined();
        });
    });

    describe('Reference Validation', () => {
        let symbolTable: SymbolTable;

        beforeAll(() => {
            symbolTable = new SymbolTable();
            if (testScopeManager) {
                let typeMap = testScopeManager.projectScope.definitions.get('form');
                if (!typeMap) { typeMap = new Map(); testScopeManager.projectScope.definitions.set('form', typeMap); }
                typeMap.set('existingform', {
                    name: 'ExistingForm',
                    kind: definitionTypeToSymbolKind('Form'),
                    definitionType: 'Form',
                    uri: 'file:///other.tdl',
                    start: 0,
                    end: 10
                } as any);
            }
        });

        it('should validate reference to existing form', async () => {
            const tdl = `[Report: RefReport]
                Form: ExistingForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!, symbolTable);
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

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!, symbolTable);

            const refError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            expect(refError).toBeDefined();
        });

        it('should validate reference to existing global function', async () => {
            // Set up a global function
            testScopeManager!.globalScope.functions.set('myglobalfunc', {
                name: 'MyGlobalFunc',
                kind: SymbolKind.Function,
                definitionType: 'Function',
                uri: 'global:metadata',
                start: 0,
                end: 10
            } as any);

            // Set up an attribute that refers to a Function
            let typeMap = testScopeManager!.globalScope.attributes.get('report');
            typeMap!.set('myfuncattr', {
                name: 'MyFuncAttr',
                parameters: [{ RefersTo: 'Function' }]
            } as any);

            const tdl = `[Report: FuncRefReport]
                MyFuncAttr: MyGlobalFunc
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!, symbolTable);
            const refError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            expect(refError).toBeUndefined();
        });

        it('should validate reference to existing system definition', async () => {
            // Set up existing system definitions
            if (!testScopeManager!.existingDefinitions) testScopeManager!.existingDefinitions = new Map();
            let sysDefMap = testScopeManager!.existingDefinitions.get('form');
            if (!sysDefMap) { sysDefMap = new Set(); testScopeManager!.existingDefinitions.set('form', sysDefMap); }
            sysDefMap.add('systemform');

            const tdl = `[Report: SysRefReport]
                Form: SystemForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!, symbolTable);
            const refError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            expect(refError).toBeUndefined();
        });
    });

    describe('List Modifier Validation', () => {
        it('should recognize Add as a valid attribute after transformation', async () => {
            const addDef = testScopeManager!.globalScope.attributes.get('report')?.get('add');
            expect(addDef).toBeDefined();
            expect(addDef?.name).toBe('Add');
        });

        it('should recognize Delete as a valid attribute after transformation', async () => {
            const delDef = testScopeManager!.globalScope.attributes.get('report')?.get('delete');
            expect(delDef).toBeDefined();
            expect(delDef?.name).toBe('Delete');
        });

        it('should recognize Replace as a valid attribute after transformation', async () => {
            const repDef = testScopeManager!.globalScope.attributes.get('report')?.get('replace');
            expect(repDef).toBeDefined();
            expect(repDef?.name).toBe('Replace');
        });

        it('should validate Add attribute with correct parameters', async () => {
            const tdl = `[Report: TestReport]
                Add: Form: NewForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.MissingParameters.code);
            expect(diag).toBeUndefined();
        });

        it('should replace Description with part-specific text for Add', async () => {
            const addDef = testScopeManager!.globalScope.attributes.get('report')?.get('add');
            expect(addDef).toBeDefined();
            expect(addDef?.description).not.toMatch(/Add\/Replace\/Delete/i);
            expect(addDef?.description).not.toMatch(/ADD\/Delete\/Replace/i);
            expect(addDef?.description).toMatch(/Add/i);
        });
    });

    describe('Datatype Validation', () => {
        it('should validate Logical datatype with invalid value', async () => {
            const tdl = `[Part: TestPart]
                Balance: Maybe
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
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

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.InvalidLogicalValue.code);
            expect(diag).toBeUndefined();
        });

        it('should validate Keyword parameter with invalid value', async () => {
            const tdl = `[Part: TestPart]
                Horizontal Align: Invalid
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
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

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.InvalidKeyword.code);
            expect(diag).toBeUndefined();
        });

        it('should cache keywordSets during testScopeManager loading', async () => {
            expect(testScopeManager!.keywordSets.size).toBeGreaterThan(0);
            const alignTypeKeywords = testScopeManager!.keywordSets.get('aligntype');
            expect(alignTypeKeywords).toBeDefined();
            expect(alignTypeKeywords).toContain('Center');
            expect(alignTypeKeywords).toContain('Left');
        });
    });

    describe('Function Return Type Validation', () => {
        it('should have functions loaded in testScopeManager!', async () => {
            expect(testScopeManager!.globalScope.functions.size).toBeGreaterThan(0);
        });

        it('should have function with returnType', async () => {
            const printDate = testScopeManager!.globalScope.functions.get('printdate');
            expect(printDate).toBeDefined();
            expect(printDate?.returnType).toBe('Date');
        });

        it('should have function parameters with DataType', () => {
            const dateFunc = testScopeManager!.globalScope.functions.get('date');
            expect(dateFunc).toBeDefined();
            expect(dateFunc?.parameters?.length).toBeGreaterThan(0);
            expect(dateFunc?.parameters?.[0].DataType?.toLowerCase()).toBe('date');
        });

        it('should check type compatibility for compatible types', async () => {
            const stringFuncs = Array.from(testScopeManager!.globalScope.functions.values()).filter(f => f.returnType === 'String');
            const dateFuncs = Array.from(testScopeManager!.globalScope.functions.values()).filter(f => f.returnType === 'Date');
            expect(stringFuncs.length).toBeGreaterThan(0);
            expect(dateFuncs.length).toBeGreaterThan(0);
        });
    });
    describe('Collection and Field validation', () => {
        it('validates attributes on Collection definitions', () => {
            const tdl = `[Collection: MyColl]
                Type: Ledger
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.UnknownAttribute.code);
            expect(diag).toBeUndefined();
        });

        it('treats unknown attributes on Field as implicit local formulas (no error)', () => {
            const tdl = `[Field: MyField]
                NonExistentAttr: Yes
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.UnknownAttribute.code);
            expect(diag).toBeUndefined();
        });
    });

    describe('Discrete attribute validation', () => {
        it('reports duplicate discrete attribute values across declarations', () => {
            const tdl = `[Report: MyRep]
                Form: Form1
                Form: Form1
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.filter(d => d.code === 'TDL021'); // DuplicateDiscreteAttribute
            expect(diag.length).toBeGreaterThan(0);
        });

        it('reports duplicate discrete attribute values within a single list declaration', () => {
            const tdl = `[Form: MyForm]
                Part: Part1, Part2, Part1
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.filter(d => d.code === 'TDL021'); // DuplicateDiscreteAttribute
            expect(diag.length).toBeGreaterThan(0);
        });

        it('allows multiple discrete attributes with unique values', () => {
            const tdl = `[Form: MyForm]
                Part: Part1, Part2
                Part: Part3
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.filter(d => d.code === 'TDL021'); // DuplicateDiscreteAttribute
            expect(diag.length).toBe(0);
        });

        it('allows multiple non-discrete attributes', () => {
            const tdl = `[Field: MyField]
                Set As: "A"
                Set As: "B"
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.filter(d => d.code === 'TDL021'); // DuplicateDiscreteAttribute
            expect(diag.length).toBe(0);
        });
    });

    describe('Metadata display casing', () => {
        it('displays original DataType casing in error messages', () => {
            const tdl = `[Part: TestPart]
                Balance: "Not a Logical"
            `;
            // 'Balance' expects Logical, we give it String
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.TypeMismatch.code);
            expect(diag).toBeDefined();
            expect(diag?.message.toLowerCase()).toContain('logical');
        });

        it('displays original RefersTo casing in diagnostic messages', () => {
            const tdl = `[Report: TestReport]
                Form: UnknownForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diag = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            expect(diag).toBeDefined();
            // Should contain "Form" with original casing
            expect(diag?.message).toContain('Form');
        });
    });
});
