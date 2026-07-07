import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { validateDefinitionAttributes } from '../../validation';
import { DiagnosticRules } from '../../diagnostics';
import { testScopeManager } from '../../__tests__/test-setup';
import { buildFileScope } from '../../semantics/scopeManager/scopeBuilder';
import { provideAttributeValueCompletions } from '../../features/completion/providers/attributeProvider';

describe('DataType and Format Validation', () => {
    it('should validate that primary data type is valid', async () => {
        const tdl = `[Field: TestField]
            Type: InvalidType
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidDataType.code);
        expect(error).toBeDefined();
        expect(error?.message).toContain('InvalidType');
    });

    it('should accept valid TDL data types and sub-types', async () => {
        const tdl = `[Field: TestField]
            Type: Quantity : Secondary Units
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidDataType.code || d.code === DiagnosticRules.InvalidSubType.code);
        expect(error).toBeUndefined();
    });

    it('should detect invalid sub-type for a valid compound data type', async () => {
        const tdl = `[Field: TestField]
            Type: Quantity : InvalidSubName
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidSubType.code);
        expect(error).toBeDefined();
        expect(error?.message).toContain('InvalidSubName');
        expect(error?.message).toContain('Quantity');
    });

    it('should validate format keywords against the declared field type', async () => {
        const tdl = `[Field: TestField]
            Type: Date
            Format: Decimal
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(error).toBeDefined();
        expect(error?.message).toContain('Decimal');
        expect(error?.message).toContain('Date');
    });

    it('should accept valid format keywords for the declared field type', async () => {
        const tdl = `[Field: TestField]
            Type: Number
            Format: Decimal: 2, Percentage, Bracketed
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(error).toBeUndefined();
    });

    it('should suggest correct sub-types for compound datatypes with proper casing', async () => {
        const tdl = `[Field: TestField]
            Type: Quantity : 
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        const fileScope = buildFileScope(testScopeManager!, 'file:///test_dt_comp.tdl', sourceFile);
        const fieldScope = fileScope.childScopes.find(s => s.id.toLowerCase() === 'field:testfield');
        expect(fieldScope).toBeDefined();

        const context = {
            attributeName: 'Type',
            paramIndex: 1,
            valueParts: ['Quantity'],
            partial: ''
        };

        const suggestions = provideAttributeValueCompletions(testScopeManager!, 'Field', context as any, undefined, fieldScope, sourceFile.definitions[0]);
        const subTypes = suggestions.map(s => s.label);
        expect(subTypes).toContain('Secondary Units');
        expect(subTypes).toContain('Primary Units');
    });

    it('should suggest correct formats for the declared field type with proper casing', async () => {
        const tdl = `[Field: TestField]
            Type: Number
            Format: 
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        const fileScope = buildFileScope(testScopeManager!, 'file:///test_dt_comp.tdl', sourceFile);
        const fieldScope = fileScope.childScopes.find(s => s.id.toLowerCase() === 'field:testfield');
        expect(fieldScope).toBeDefined();

        const context = {
            attributeName: 'Format',
            paramIndex: 0,
            valueParts: [],
            partial: ''
        };

        const suggestions = provideAttributeValueCompletions(testScopeManager!, 'Field', context as any, undefined, fieldScope, sourceFile.definitions[0]);
        const formats = suggestions.map(s => s.label);
        expect(formats).toContain('Decimal');
        expect(formats).toContain('Percentage');
        expect(formats).toContain('Bracketed');
    });
});
