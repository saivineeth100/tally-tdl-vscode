import { describe, it, expect, beforeAll } from 'vitest';
import { ScopeKind } from '../scopeManager';
import { buildFileScope } from '../scopeManager/scopeBuilder';
import { Parser } from '../../parser/parser';
import { FunctionSymbol, SymbolKind } from '../../models/symbols';
import {
    validateDefinitionAttributes
} from '../validation';
import { DiagnosticRules } from '../../diagnostics';
import { normalizeTypeName } from '../utils';
import { definitionTypeToSymbolKind } from '../symbolTable';
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

    describe('Menu Item List Validation', () => {
        it('should bypass strict mandatory parameter checks and validate Actions dynamically for Item', async () => {
            const tdl = `[Menu: MyMenu]
                Item: My Item : Display : SomeReport
                Item: Another : Quit
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const itemErrors = diagnostics.filter(d => 
                d.code === DiagnosticRules.MissingParameters.code || 
                d.code === DiagnosticRules.MissingMandatoryParameter.code ||
                d.code === DiagnosticRules.TypeMismatch.code
            );
            // It should not throw missing parameter errors because Menu Item List handles dynamic parameters
            expect(itemErrors.length).toBe(0);
        });

        it('should validate Key Item correctly', async () => {
            const tdl = `[Menu: MyMenu]
                Key Item: First : A : Menu : SubMenu
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const itemErrors = diagnostics.filter(d => 
                d.code === DiagnosticRules.MissingParameters.code || 
                d.code === DiagnosticRules.MissingMandatoryParameter.code ||
                d.code === DiagnosticRules.TypeMismatch.code
            );
            expect(itemErrors.length).toBe(0);
        });

        it('should report missing definitions for invalid Action Parameters in Menu Item Lists', async () => {
            const tdl = `[Menu: MyMenu]
                Item: Invalid Item : Display : NonExistentReport
                Key Item: Invalid Key Item : B : Menu : NonExistentMenu
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            
            const missingDefs = diagnostics.filter(d => d.code === DiagnosticRules.MissingDefinition.code);
            
            // Should report 2 missing definitions: NonExistentReport (Report) and NonExistentMenu (Menu)
            expect(missingDefs.length).toBe(2);
            expect(missingDefs[0].message).toContain('NonExistentReport');
            expect(missingDefs[1].message).toContain('NonExistentMenu');
        });
    });

    describe('Reference Validation', () => {
        beforeAll(() => {
            if (testScopeManager) {
                let typeMap = testScopeManager.scopeIndex.get('form');
                if (!typeMap) { typeMap = new Map(); testScopeManager.scopeIndex.set('form', typeMap); }
                typeMap.set('existingform', {
                    kind: ScopeKind.Definition,
                    definition: {
                        name: 'ExistingForm',
                        kind: definitionTypeToSymbolKind('Form', testScopeManager),
                        definitionType: 'Form',
                        uri: 'file:///other.tdl',
                        start: 0,
                        end: 10
                    }
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

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
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

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);

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

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const refError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            expect(refError).toBeUndefined();
        });

        it('should validate reference to existing system definition', async () => {
            // Set up existing system definitions
            let sysDefMap = testScopeManager!.globalScope.definitions.get('form');
            if (!sysDefMap) { sysDefMap = new Map(); testScopeManager!.globalScope.definitions.set('form', sysDefMap); }
            sysDefMap.set('systemform', { name: 'systemform', kind: 0, uri: '', start: 0, end: 0, definitionType: 'form' } as any);

            const tdl = `[Report: SysRefReport]
                Form: SystemForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const refError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            expect(refError).toBeUndefined();
        });
        it('should validate reference to existing system formulae', async () => {
            // Set up a system formula
            if (!testScopeManager!.globalScope.formulas) {
                testScopeManager!.globalScope.formulas = new Map();
            }
            testScopeManager!.globalScope.formulas.set('myformula', {
                name: 'MyFormula',
                kind: SymbolKind.Formula,
                uri: 'global:metadata',
                start: 0,
                end: 10
            } as any);

            // Set up an attribute that refers to System Formulae
            let typeMap = testScopeManager!.globalScope.attributes.get('report');
            typeMap!.set('myformulaattr', {
                name: 'MyFormulaAttr',
                parameters: [{ RefersTo: 'System Formulae' }]
            } as any);

            const tdl = `[Report: SysFormulaRefReport]
                MyFormulaAttr: MyFormula
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
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

    describe('Local Attribute Validation', () => {
        beforeAll(() => {
            if (testScopeManager) {
                let typeMap = testScopeManager.globalScope.definitions.get('field');
                if (!typeMap) { typeMap = new Map(); testScopeManager.globalScope.definitions.set('field', typeMap); }
                typeMap.set('mediumprompt', { name: 'Medium Prompt', kind: SymbolKind.Field, uri: 'global:metadata', start: 0, end: 10 } as any);
                typeMap.set('shortprompt', { name: 'Short Prompt', kind: SymbolKind.Field, uri: 'global:metadata', start: 0, end: 10 } as any);
                typeMap.set('finalledreportname', { name: 'Final Led ReportName', kind: SymbolKind.Field, uri: 'global:metadata', start: 0, end: 10 } as any);

                testScopeManager.recordGraphContribution = (uri, type, key1, key2) => {
                    let contribs = testScopeManager!.uriGraphContributions.get(uri);
                    if (!contribs) {
                        contribs = { parentDefs: new Set(), childDefs: new Set(), useInherit: new Set(), inUseInherit: new Set(), includes: new Set(), modifiers: new Set() };
                        testScopeManager!.uriGraphContributions.set(uri, contribs);
                    }
                    if (type === 'parentDef' && key2) contribs.parentDefs.add(`${key1}::${key2}`);
                    if (type === 'childDef' && key2) contribs.childDefs.add(`${key1}::${key2}`);
                    if (type === 'useInherit' && key2) contribs.useInherit.add(`${key1}::${key2}`);
                    if (type === 'inUseInherit' && key2) contribs.inUseInherit.add(`${key1}::${key2}`);
                    if (type === 'include') contribs.includes.add(key1);
                    if (type === 'modifier') contribs.modifiers.add(key1);
                };
            }
        });

        it('validates nested definition types and attributes inside Local and handles circular dependencies (e.g. Collection and Report cycles)', () => {
            const tdl = `
                [Line: Final Led ReportName]
                    Fields: Medium Prompt, Final Led ReportName
                    Local: Field: Final Led ReportName  : Set as        : "Name :"
                    Local: Field: Medium Prompt     : Inactive      : $$Line > 1

                [Collection: Ledger Coll]
                    Report: Triggered Led Report

                [Report: Triggered Led Report]
                    Form: Triggered Led Report
                    Local: Field: Ledger Coll: Set as: "Override"

                [Form: Triggered Led Report]
                    Part: Triggered Led Report

                [Part: Triggered Led Report]
                    Line: Triggered Led Report

                [Line: Triggered Led Report]
                    Fields: Ledger Coll

                [Field: Ledger Coll]
                    Set as: "Default"
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const scope = buildFileScope(testScopeManager!, 'file:///test.tdl', sourceFile);
            testScopeManager!.indexScope(scope);

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const diagnostics2 = validateDefinitionAttributes(sourceFile.definitions[2], docReal, testScopeManager!); // Validate the Report
            
            const notInScopeErrors = [...diagnostics, ...diagnostics2].filter(d => d.code === DiagnosticRules.DefinitionNotInScope.code);
            const missingErrors = [...diagnostics, ...diagnostics2].filter(d => d.code === DiagnosticRules.MissingDefinition.code);
            
            testScopeManager!.unindexScope(scope);

            expect(notInScopeErrors.length).toBe(0);
            expect(missingErrors.length).toBe(0);
        });

        it('validates nested definition types and attributes inside Local', () => {
            const tdl = `[Report: MyReport]
                Local: Field: Default: Set as: "LocalValue"
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            
            // "LocalValue" is valid for "Set as" (Expression). 
            // The structure Local: Field: Default: Set as should be valid
            const attrErrors = diagnostics.filter(d => 
                d.code === DiagnosticRules.UnknownAttribute.code ||
                d.code === DiagnosticRules.TypeMismatch.code
            );
            expect(attrErrors.length).toBe(0);
        });

        it('should allow Local when definition is in scope', async () => {
            const tdl = `[Line: My Line]
                Fields: Medium Prompt
                Local: Field: Medium Prompt: Set as: "Hello"
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test.tdl', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const scope = buildFileScope(testScopeManager!, 'file:///test.tdl', sourceFile);
            testScopeManager!.indexScope(scope);

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const notInScopeError = diagnostics.find(d => d.code === DiagnosticRules.DefinitionNotInScope.code);
            const missingError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            
            testScopeManager!.unindexScope(scope);
            
            expect(notInScopeError).toBeUndefined();
            expect(missingError).toBeUndefined();
        });
        
        it('should be space and case insensitive for Local targets', async () => {
            const tdl = `[Line: My Line 2]
                Fields: Medium Prompt
                Local: Field: mediumprompt: Set as: "Hello"
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test2.tdl', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const scope = buildFileScope(testScopeManager!, 'file:///test2.tdl', sourceFile);
            testScopeManager!.indexScope(scope);

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const notInScopeError = diagnostics.find(d => d.code === DiagnosticRules.DefinitionNotInScope.code);
            
            testScopeManager!.unindexScope(scope);
            
            expect(notInScopeError).toBeUndefined();
        });

        it('should report DefinitionNotInScope if definition exists globally but is not in scope', async () => {
            const tdl = `[Line: My Line 3]
                Fields: Short Prompt
                Local: Field: Medium Prompt: Set as: "Hello"
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test3.tdl', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const scope = buildFileScope(testScopeManager!, 'file:///test3.tdl', sourceFile);
            testScopeManager!.indexScope(scope);

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const notInScopeError = diagnostics.find(d => d.code === DiagnosticRules.DefinitionNotInScope.code);
            
            testScopeManager!.unindexScope(scope);
            
            expect(notInScopeError).toBeDefined();
        });

        it('should report MissingDefinition if definition does not exist anywhere', async () => {
            const tdl = `[Line: My Line 4]
                Fields: Medium Prompt
                Local: Field: NonExistentField123: Set as: "Hello"
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test4.tdl', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const scope = buildFileScope(testScopeManager!, 'file:///test4.tdl', sourceFile);
            testScopeManager!.indexScope(scope);

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const missingError = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
            
            testScopeManager!.unindexScope(scope);
            
            expect(missingError).toBeDefined();
        });

        it('should correctly validate deep Local chaining with multiple explicit Local keywords', async () => {
            // We need some global defs so it resolves them
            if (testScopeManager) {
                // Part: TSPL Smp Info
                let partMap = testScopeManager.scopeIndex.get('part');
                if (!partMap) { partMap = new Map(); testScopeManager.scopeIndex.set('part', partMap); }
                partMap.set('tsplsmpinfo', {
                    kind: ScopeKind.Definition,
                    definition: { name: 'TSPL Smp Info', kind: SymbolKind.Part, definitionType: 'Part', uri: 'file:///test5.tdl', start: 0, end: 10 }
                } as any);

                // Line: Info
                let lineMap = testScopeManager.scopeIndex.get('line');
                if (!lineMap) { lineMap = new Map(); testScopeManager.scopeIndex.set('line', lineMap); }
                lineMap.set('info', {
                    kind: ScopeKind.Definition,
                    definition: { name: 'Info', kind: SymbolKind.Line, definitionType: 'Line', uri: 'file:///test5.tdl', start: 0, end: 10 }
                } as any);
            }

            const tdl = `[Report: Deep Local Report]
                Part: TSPL Smp Info
                Local: Part: TSPL Smp Info: Local: Line: Info: Local: Field: Default: Info: "Test"
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test5.tdl', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const scope = buildFileScope(testScopeManager!, 'file:///test5.tdl', sourceFile);
            testScopeManager!.indexScope(scope);

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
            const hasInvalidChainErrors = diagnostics.some(d => 
                d.code === DiagnosticRules.MissingDefinition.code || 
                d.code === DiagnosticRules.DefinitionNotInScope.code
            );
            
            testScopeManager!.unindexScope(scope);
            
            // There shouldn't be any false MissingDefinition or DefinitionNotInScope errors for the valid parts of the chain.
            expect(hasInvalidChainErrors).toBe(false);
        });
    });
});
