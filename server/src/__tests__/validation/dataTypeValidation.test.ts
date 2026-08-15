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

    it('should accept valid date format keywords including Universal Date, Short Date, Long Date, Month Ending, Separator', async () => {
        const tdl = `[Field: TestField]
            Type: Date
            Format: Short Date, Separator: "/"
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(error).toBeUndefined();
    });

    it('should accept composite DateTime formats in string literal like "24 hour,Short Date"', async () => {
        const tdl = `[Field: TSPL Smp CDT VCH DateTime]
            Type: Date Time
            Format: "24 hour,Short Date"
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(error).toBeUndefined();
    });

    it('should accept various DateTime formats such as Date Only, Time Only, and unquoted formats', async () => {
        const tdl = `[Field: TestField]
            Type: DateTime
            Format: "12 hour, With MilliSecs, Prefix AMPM, Long Date"
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(error).toBeUndefined();
    });

    it('should detect invalid format keyword in composite string literal for DateTime', async () => {
        const tdl = `[Field: TestField]
            Type: Date Time
            Format: "24 hour, InvalidFormatKeyword"
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(error).toBeDefined();
        expect(error?.message).toContain('InvalidFormatKeyword');
        expect(error?.message).toContain('Date Time');
    });

    it('should reject time format on a Date field', async () => {
        const tdl = `[Field: TestField]
            Type: Date
            Format: "24 hour"
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dt.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const error = diagnostics.find(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(error).toBeDefined();
        expect(error?.message).toContain('24 hour');
        expect(error?.message).toContain('Date');
    });

    it('should suggest correct formats for Date field with proper casing', async () => {
        const tdl = `[Field: TestField]
            Type: Date
            Format: 
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        const fileScope = buildFileScope(testScopeManager!, 'file:///test_dt_date.tdl', sourceFile);
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
        expect(formats).toContain('Universal Date');
        expect(formats).toContain('Short Date');
        expect(formats).toContain('Long Date');
        expect(formats).toContain('Month Ending');
        expect(formats).toContain('Separator');
    });

    it('should suggest correct formats for Date Time field', async () => {
        const tdl = `[Field: TestField]
            Type: Date Time
            Format: 
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        const fileScope = buildFileScope(testScopeManager!, 'file:///test_dt_dt.tdl', sourceFile);
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
        expect(formats).toContain('Universal Date');
        expect(formats).toContain('Short Date');
        expect(formats).toContain('24 Hour');
        expect(formats).toContain('Date Only');
        expect(formats).toContain('Time Only');
        expect(formats).toContain('Prefix AMPM');
    });

    it('should validate full AdvVchEntryAlteration Field definition without TDL2022 warning', async () => {
        const tdl = `
        [Field: TSPL Smp CDT VCH DateTime]
            Type        : Date Time
            Width       : 20
            Max         : 20
            Set as      : Now
            Set Always  : Yes
            Format      : "24 hour,Short Date" 
            Color       : "Red"
            Align       : Right
            Skip        : Yes
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///AdvVchEntryAlteration.txt', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const formatErrors = diagnostics.filter(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(formatErrors).toHaveLength(0);
    });

    it('should accept valid Duration formats', async () => {
        const tdl = `
        [Field: DurationField]
            Type    : Duration
            Format  : "Days"
        `;
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('file:///test_dur.tdl', 'tdl', 1, tdl);
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], docReal, testScopeManager!);
        const formatErrors = diagnostics.filter(d => d.code === DiagnosticRules.InvalidFormat.code);
        expect(formatErrors).toHaveLength(0);
    });
});
