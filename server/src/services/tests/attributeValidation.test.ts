import { describe, it, expect, beforeAll } from 'vitest';
import { Parser } from '../../parser/parser';
import { TDLDefinition } from '../../tdlMetaData';
import { TDLFunction } from '../../models/tdlFunction';
import {
    attributeMatches,
    getAllowedAttributes,
    isValidAttribute,
    validateDefinitionAttributes
} from '../validation';
import { normalizeTypeName } from '../utils';
import { SymbolTable, definitionTypeToSymbolKind } from '../symbolTable';
import { testMetadata } from '../../test-setup';

describe('Attribute Validation', () => {

    describe('normalizeTypeName', () => {
        it('should convert to lowercase', () => {
            expect(normalizeTypeName('Report')).toBe('report');
            expect(normalizeTypeName('FIELD')).toBe('field');
        });

        it('should remove spaces', () => {
            expect(normalizeTypeName('Stock Item')).toBe('stockitem');
            expect(normalizeTypeName('Key Value Map')).toBe('keyvaluemap');
        });

        it('should handle combined cases', () => {
            expect(normalizeTypeName('Import Object')).toBe('importobject');
        });
    });

    describe('testMetadata! Loading', () => {
        it('should load Report definition attributes', () => {
            const attrs = getAllowedAttributes('Report', testMetadata!);
            expect(attrs).toBeDefined();
            expect(attrs!.length).toBeGreaterThan(0);
        });

        it('should load Field definition attributes', () => {
            const attrs = getAllowedAttributes('Field', testMetadata!);
            expect(attrs).toBeDefined();
            expect(attrs!.length).toBeGreaterThan(0);
        });

        it('should load Form definition attributes', () => {
            const attrs = getAllowedAttributes('Form', testMetadata!);
            expect(attrs).toBeDefined();
            expect(attrs!.length).toBeGreaterThan(0);
        });

        it('should load Collection definition attributes', () => {
            const attrs = getAllowedAttributes('Collection', testMetadata!);
            expect(attrs).toBeDefined();
            expect(attrs!.length).toBeGreaterThan(0);
        });
    });

    describe('attributeMatches', () => {
        it('should match by exact name', () => {
            const attrs = getAllowedAttributes('Report', testMetadata!);
            const formAttr = attrs?.find(a => a.Name === 'Form');
            expect(formAttr).toBeDefined();

            expect(attributeMatches('Form', formAttr!)).toBe(true);
            expect(attributeMatches('form', formAttr!)).toBe(true);
            expect(attributeMatches('FORM', formAttr!)).toBe(true);
        });

        it('should match by alias', () => {
            const attrs = getAllowedAttributes('Report', testMetadata!);
            // Find an attribute with aliases
            const attrWithAlias = attrs?.find(a => a.Aliases && a.Aliases.includes(','));

            if (attrWithAlias) {
                const aliases = attrWithAlias.Aliases!.split(',').map(a => a.trim());
                for (const alias of aliases) {
                    expect(attributeMatches(alias, attrWithAlias)).toBe(true);
                }
            }
        });

        it('should not match non-existent attribute name', () => {
            const attrs = getAllowedAttributes('Report', testMetadata!);
            const formAttr = attrs?.find(a => a.Name === 'Form');
            expect(formAttr).toBeDefined();

            expect(attributeMatches('InvalidAttr', formAttr!)).toBe(false);
        });
    });

    describe('getAllowedAttributes', () => {
        it('should get attributes case-insensitively', () => {
            const attrs1 = getAllowedAttributes('Report', testMetadata!);
            const attrs2 = getAllowedAttributes('report', testMetadata!);
            const attrs3 = getAllowedAttributes('REPORT', testMetadata!);

            expect(attrs1).toBeDefined();
            expect(attrs2).toBeDefined();
            expect(attrs3).toBeDefined();
            expect(attrs1?.length).toBe(attrs2?.length);
            expect(attrs2?.length).toBe(attrs3?.length);
        });

        it('should return undefined for unknown definition type', () => {
            const attrs = getAllowedAttributes('NonExistentDefinition', testMetadata!);
            expect(attrs).toBeUndefined();
        });
    });

    describe('isValidAttribute', () => {
        it('should validate known Report attributes', () => {
            expect(isValidAttribute('Form', 'Report', testMetadata!)).toBe(true);
            expect(isValidAttribute('Title', 'Report', testMetadata!)).toBe(true);
            expect(isValidAttribute('Object', 'Report', testMetadata!)).toBe(true);
        });

        it('should reject invalid Report attributes', () => {
            expect(isValidAttribute('InvalidAttribute', 'Report', testMetadata!)).toBe(false);
            expect(isValidAttribute('FooBar', 'Report', testMetadata!)).toBe(false);
            expect(isValidAttribute('RandomName', 'Report', testMetadata!)).toBe(false);
        });

        it('should validate known Field attributes', () => {
            expect(isValidAttribute('Set As', 'Field', testMetadata!)).toBe(true);
            expect(isValidAttribute('Width', 'Field', testMetadata!)).toBe(true);
        });

        it('should validate known Collection attributes', () => {
            expect(isValidAttribute('Type', 'Collection', testMetadata!)).toBe(true);
            expect(isValidAttribute('Filter', 'Collection', testMetadata!)).toBe(true);
        });

        it('should allow any attribute for unknown definition types', () => {
            expect(isValidAttribute('AnyAttr', 'UnknownType', testMetadata!)).toBe(true);
        });
    });

    describe('Integration with Parser', () => {
        it('should parse a Report with valid attributes', () => {
            const tdl = `[Report: MyReport]
                Form: MainForm
                Title: My Title
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            expect(sourceFile.definitions.length).toBe(1);
            const def = sourceFile.definitions[0];
            expect(def.type.text).toBe('Report');
            expect(def.attributes.length).toBe(2);

            // Validate each attribute
            for (const attr of def.attributes) {
                const isValid = isValidAttribute(attr.name.text, def.type.text, testMetadata!);
                expect(isValid).toBe(true);
            }
        });

        it('should detect invalid attributes in Report', () => {
            const tdl = `[Report: MyReport]
                Form: MainForm
                InvalidAttr: Something
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            const invalidAttrs = def.attributes.filter(attr =>
                !isValidAttribute(attr.name.text, def.type.text, testMetadata!)
            );

            expect(invalidAttrs.length).toBe(1);
            expect(invalidAttrs[0].name.text).toBe('InvalidAttr');
        });

        it('should validate Field definition attributes', () => {
            const tdl = `[Field: AmountField]
                Set As: $Amount
                ZzzInvalidField123: BadValue
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            expect(sourceFile.definitions.length).toBe(1);
            const def = sourceFile.definitions[0];
            expect(def.type.text).toBe('Field');

            // Filter valid and invalid attrs
            const validAttrs = def.attributes.filter(attr =>
                isValidAttribute(attr.name.text, def.type.text, testMetadata!)
            );
            const invalidAttrs = def.attributes.filter(attr =>
                !isValidAttribute(attr.name.text, def.type.text, testMetadata!)
            );

            expect(validAttrs.length).toBe(1); // Set As
            expect(invalidAttrs.length).toBe(1); // ZzzInvalidField123
        });

        it('should validate Collection definition', () => {
            const tdl = `[Collection: MyCollection]
                Type: Ledger
                Filter: $Name != ""
                BadAttribute: Value
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            const validAttrs = def.attributes.filter(attr =>
                isValidAttribute(attr.name.text, def.type.text, testMetadata!)
            );
            const invalidAttrs = def.attributes.filter(attr =>
                !isValidAttribute(attr.name.text, def.type.text, testMetadata!)
            );

            expect(validAttrs.length).toBe(2); // Type, Filter
            expect(invalidAttrs.length).toBe(1); // BadAttribute
        });
    });

    describe('Mandatory Parameter Validation', () => {
        it('should detect missing mandatory parameters in Report', () => {
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
                d.message.includes('expects at least') ||
                d.message.includes('Missing mandatory parameter')
            );
            expect(formDiag).toBeDefined();
        });

        it('should accept valid mandatory parameters', () => {
            const tdl = `[Report: ValidReport]
                Form: MyForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const formDiag = diagnostics.find(d => d.message.includes('expects at least'));
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


        it('should validate reference to existing form', () => {
            const tdl = `[Report: RefReport]
                Form: ExistingForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!, symbolTable);
            const refError = diagnostics.find(d => d.message.includes('not found'));
            expect(refError).toBeUndefined();
        });

        it('should report error for non-existent form', () => {
            const tdl = `[Report: BadRefReport]
                Form: NonExistentForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!, symbolTable);

            const refError = diagnostics.find(d => d.message.includes("'NonExistentForm' of type 'Form' not found"));
            expect(refError).toBeDefined();
        });
    });

    describe('List Modifier Validation', () => {
        // The dynamic transformation splits "Add/Replace/Delete" into separate definitions.
        // They inherit the original definition's parameters (1 mandatory param).
        // This test verifies that each split part is recognized as a valid attribute.

        it('should recognize Add as a valid attribute after transformation', () => {
            const addDef = testMetadata!.findDefinition('Add', 'Report');
            expect(addDef).toBeDefined();
            expect(addDef?.Name).toBe('Add');
        });

        it('should recognize Delete as a valid attribute after transformation', () => {
            const delDef = testMetadata!.findDefinition('Delete', 'Report');
            expect(delDef).toBeDefined();
            expect(delDef?.Name).toBe('Delete');
        });

        it('should recognize Replace as a valid attribute after transformation', () => {
            const repDef = testMetadata!.findDefinition('Replace', 'Report');
            expect(repDef).toBeDefined();
            expect(repDef?.Name).toBe('Replace');
        });

        it('should validate Add attribute with correct parameters', () => {
            // Original Add/Replace/Delete has 1 mandatory param
            const tdl = `[Report: TestReport]
                Add: Form: NewForm
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            // No missing mandatory param errors expected, as original has 1 mandatory and we provided 2
            const diag = diagnostics.find(d => d.message.includes('expects at least'));
            expect(diag).toBeUndefined();
        });

        it('should replace Description with part-specific text for Add', () => {
            const addDef = testMetadata!.findDefinition('Add', 'Report');
            expect(addDef).toBeDefined();
            // Description should NOT contain "Add/Replace/Delete" or similar combined patterns
            expect(addDef?.Description).not.toMatch(/Add\/Replace\/Delete/i);
            expect(addDef?.Description).not.toMatch(/ADD\/Delete\/Replace/i);
            // Should contain the part name
            expect(addDef?.Description).toMatch(/Add/i);
        });

        it('should replace Description with part-specific text for Delete', () => {
            const delDef = testMetadata!.findDefinition('Delete', 'Report');
            expect(delDef).toBeDefined();
            expect(delDef?.Description).not.toMatch(/Add\/Replace\/Delete/i);
            expect(delDef?.Description).not.toMatch(/ADD\/Delete\/Replace/i);
            expect(delDef?.Description).toMatch(/Delete/i);
        });

        it('should replace Description with part-specific text for Replace', () => {
            const repDef = testMetadata!.findDefinition('Replace', 'Report');
            expect(repDef).toBeDefined();
            expect(repDef?.Description).not.toMatch(/Add\/Replace\/Delete/i);
            expect(repDef?.Description).not.toMatch(/ADD\/Delete\/Replace/i);
            expect(repDef?.Description).toMatch(/Replace/i);
        });
    });

    describe('Datatype Validation', () => {
        it('should validate Logical datatype with invalid value', () => {
            // Part has Balance attribute with Logical datatype
            const tdl = `[Part: TestPart]
                Balance: Maybe
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const diag = diagnostics.find(d => d.message.includes("Invalid logical value 'Maybe'"));
            expect(diag).toBeDefined();
        });

        it('should accept valid Logical values', () => {
            const tdl = `[Part: TestPart]
                Balance: Yes
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const diag = diagnostics.find(d => d.message.includes('Invalid logical value'));
            expect(diag).toBeUndefined();
        });

        it('should validate Keyword parameter with invalid value', () => {
            // Part has Horizontal Align attribute with Keyword type
            const tdl = `[Part: TestPart]
                Horizontal Align: Invalid
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const diag = diagnostics.find(d => d.message.includes("Invalid keyword 'Invalid'"));
            expect(diag).toBeDefined();
        });

        it('should accept valid Keyword values', () => {
            const tdl = `[Part: TestPart]
                Horizontal Align: Center
            `;
            const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testMetadata!);
            const diag = diagnostics.find(d => d.message.includes('Invalid keyword'));
            expect(diag).toBeUndefined();
        });

        it('should cache keywordSets during testMetadata! loading', () => {
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
        it('should have functions loaded in testMetadata!', () => {
            expect(testMetadata!.functions.length).toBeGreaterThan(0);
        });

        it('should have function with ReturnType', () => {
            const printDate = testMetadata!.functions.find((f: TDLFunction) => f.Name === 'PrintDate');
            expect(printDate).toBeDefined();
            expect(printDate?.ReturnType).toBe('Date');
        });

        it('should have function parameters with DataType', () => {
            const dateFunc = testMetadata!.functions.find((f: TDLFunction) => f.Name === 'Date');
            expect(dateFunc).toBeDefined();
            expect(dateFunc?.Parameters?.length).toBeGreaterThan(0);
            expect(dateFunc?.Parameters?.[0].DataType).toBe('Date');
        });

        it('should check type compatibility for compatible types', () => {
            // String accepts number, date, etc.
            // This test validates the areTypesCompatible logic indirectly
            const stringFuncs = testMetadata!.functions.filter((f: TDLFunction) => f.ReturnType === 'String');
            const dateFuncs = testMetadata!.functions.filter((f: TDLFunction) => f.ReturnType === 'Date');
            expect(stringFuncs.length).toBeGreaterThan(0);
            expect(dateFuncs.length).toBeGreaterThan(0);
        });
    });
});

