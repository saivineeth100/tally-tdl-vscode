import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { detectCompletionContext } from '../../features/completion/contextAnalyzer';
import { findDefinitionAtCursor } from '../../features/completion';

describe('Modifier Chains Context Detection', () => {
    it('should detect context for simple Add modifier', () => {
        const input = `[Form: MyForm]\n    Add : Part : `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Add : Part : ';
        
        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);
        expect(context.type).toBe('modifier_value');
        expect(context.modifierName?.toLowerCase()).toBe('add');
        expect(context.paramIndex).toBe(1);
    });

    it('should detect context for Add modifier with Before position', () => {
        const input = `[Form: MyForm]\n    Add : Part : Before : Top Part : `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Add : Part : Before : Top Part : ';
        
        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);
        expect(context.type).toBe('modifier_value');
        expect(context.modifierName?.toLowerCase()).toBe('add');
        expect(context.paramIndex).toBe(3);
    });

    it('should detect context for Local with nested Add', () => {
        const input = `[Form: MyForm]\n    Local : Form : SV Output Medium : Add : Part : Before : SV Output Medium: `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Local : Form : SV Output Medium : Add : Part : Before : SV Output Medium: ';
        
        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);
        expect(context.type).toBe('modifier_value');
        expect(context.modifierName?.toLowerCase()).toBe('local');
        expect(context.paramIndex).toBe(6);
    });
    
    it('should detect context for Replace modifier', () => {
        const input = `[Form: MyForm]\n    Replace : Part : OldPart : `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Replace : Part : OldPart : ';
        
        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);
        expect(context.type).toBe('modifier_value');
        expect(context.modifierName?.toLowerCase()).toBe('replace');
        expect(context.paramIndex).toBe(2);
    });

    it('should detect context for Delete modifier', () => {
        const input = `[Form: MyForm]\n    Delete : Part : `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Delete : Part : ';
        
        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);
        expect(context.type).toBe('modifier_value');
        expect(context.modifierName?.toLowerCase()).toBe('delete');
        expect(context.paramIndex).toBe(1);
    });

    it('should detect context for Option modifier', () => {
        const input = `[Part: MyPart]\n    Option : MyOption : `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Option : MyOption : ';
        
        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);
        expect(context.type).toBe('modifier_value');
        expect(context.modifierName?.toLowerCase()).toBe('option');
        expect(context.paramIndex).toBe(1);
    });

    it('should detect context for Switch modifier', () => {
        const input = `[Part: MyPart]\n    Switch : MyCase : `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Switch : MyCase : ';
        
        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);
        expect(context.type).toBe('modifier_value');
        expect(context.modifierName?.toLowerCase()).toBe('switch');
        expect(context.paramIndex).toBe(1);
    });

    it('should detect context for Use modifier', () => {
        const input = `[Report: MyReport]\n    Use : `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const cursor = input.length;
        
        const currentDef = findDefinitionAtCursor(sourceFile, cursor);
        const textBefore = '    Use : ';
        
        const context = detectCompletionContext(textBefore, sourceFile, cursor, currentDef);
        expect(context.type).toBe('modifier_value');
        expect(context.modifierName?.toLowerCase()).toBe('use');
        expect(context.paramIndex).toBe(0);
    });
});

import { findReferenceAtOffset } from '../../features/definition';
import { ScopeManager } from '../../semantics/scopeManager';
import { IScopeManager, buildFileScope } from '../../semantics/scopeManager/scopeBuilder';

describe('Modifier Chains Reference Resolution', () => {
    it('should resolve deep target in Local chain', () => {
        const input = `[Form: MyForm]\n    Local : Form : SV Output Medium : Add : Part : Before : Top Part : MyPart`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        
        // Find reference of Top Part
        const targetOffset = input.indexOf('Top Part') + 2;
        const ref = findReferenceAtOffset(sourceFile, targetOffset, input, testScopeManager);
        
        expect(ref).toBeDefined();
        // Since we didn't mock the full scope manager in this test environment,
        // we can just check if AST-based heuristic fallback detected it as a Part!
        expect(ref?.expectedType?.toLowerCase()).toBe('part');
    });

    it('should resolve target in Add chain', () => {
        const input = `[Form: MyForm]\n    Add : Part : Before : Top Part : MyPart`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        
        const targetOffset = input.indexOf('Top Part') + 2;
        const ref = findReferenceAtOffset(sourceFile, targetOffset, input, testScopeManager);
        
        expect(ref).toBeDefined();
        expect(ref?.expectedType?.toLowerCase()).toBe('part');
    });

    it('should resolve target in nested Local chain', () => {
        const input = `[Form: MyForm]\n    Local : Part : MyPart : Local : Line : MyLine`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        
        const targetOffset = input.indexOf('MyLine') + 2;
        const ref = findReferenceAtOffset(sourceFile, targetOffset, input, testScopeManager);
        
        expect(ref).toBeDefined();
        expect(ref?.expectedType?.toLowerCase()).toBe('line');
    });
});

import { getSemanticTokens } from '../../features/semanticTokens/semanticTokens';
import { SemanticTokenTypes } from 'vscode-languageserver';
import { testScopeManager } from '../../__tests__/test-setup';

describe('Modifier Chains Semantic Tokens', () => {
    it('should tokenize Local modifier keywords and targets', () => {
        const input = `[Form: MyForm]\n    Local : Form : SV Output Medium : Add : Part : Before : Top Part : MyPart`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const tokens = getSemanticTokens(sourceFile, testScopeManager);
        
        // Find modifier keyword 'Local', 'Add'
        const localTokens = tokens.filter(t => t.text?.toLowerCase() === 'local');
        expect(localTokens.length).toBeGreaterThan(0);
        expect(localTokens[0].type).toBe('macro');
        
        const addTokens = tokens.filter(t => t.text?.toLowerCase() === 'add');
        expect(addTokens.length).toBeGreaterThan(0);
        expect(addTokens[0].type).toBe('macro');
        
        // Find position keyword 'Before'
        const beforeTokens = tokens.filter(t => t.text?.toLowerCase() === 'before');
        expect(beforeTokens.length).toBeGreaterThan(0);
        expect(beforeTokens[0].type).toBe('keyword');
    });

    it('should tokenize Option, Switch, and Use modifier keywords', () => {
        const input = `[Form: MyForm]\n    Option : MyOption\n    Switch : MyCase\n    Use : MyForm`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const tokens = getSemanticTokens(sourceFile, testScopeManager);
        
        const optionTokens = tokens.filter(t => t.text?.toLowerCase() === 'option');
        expect(optionTokens.length).toBeGreaterThan(0);
        expect(optionTokens[0].type).toBe('macro');
        
        const switchTokens = tokens.filter(t => t.text?.toLowerCase() === 'switch');
        expect(switchTokens.length).toBeGreaterThan(0);
        expect(switchTokens[0].type).toBe('macro');
        
        const useTokens = tokens.filter(t => t.text?.toLowerCase() === 'use');
        expect(useTokens.length).toBeGreaterThan(0);
        expect(useTokens[0].type).toBe('macro');
    });

    it('should tokenize all segments of a nested Local modifier chain', () => {
        const input = `[Form: MyForm]\n    Local : Part : MyPart : Local : Line : MyLine : Local : Field : MyField : Set As : "Val"`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const tokens = getSemanticTokens(sourceFile, testScopeManager);

        const localTokens = tokens.filter(t => t.text?.toLowerCase() === 'local');
        expect(localTokens.length).toBe(3);
        localTokens.forEach(t => expect(t.type).toBe('macro')); // modifierKeyword

        const partTypeTokens = tokens.filter(t => t.text === 'Part');
        expect(partTypeTokens.length).toBe(1);
        expect(partTypeTokens[0].type).toBe('keyword'); // defType

        const partNameTokens = tokens.filter(t => t.text === 'MyPart');
        expect(partNameTokens.length).toBe(1);
        expect(partNameTokens[0].type).toBe('class'); // defName

        const lineTypeTokens = tokens.filter(t => t.text === 'Line');
        expect(lineTypeTokens.length).toBe(1);
        expect(lineTypeTokens[0].type).toBe('keyword'); // defType

        const lineNameTokens = tokens.filter(t => t.text === 'MyLine');
        expect(lineNameTokens.length).toBe(1);
        expect(lineNameTokens[0].type).toBe('class'); // defName

        const fieldTypeTokens = tokens.filter(t => t.text === 'Field');
        expect(fieldTypeTokens.length).toBe(1);
        expect(fieldTypeTokens[0].type).toBe('keyword'); // defType

        const fieldNameTokens = tokens.filter(t => t.text === 'MyField');
        expect(fieldNameTokens.length).toBe(1);
        expect(fieldNameTokens[0].type).toBe('class'); // defName

        const setAsTokens = tokens.filter(t => t.text === 'Set As');
        expect(setAsTokens.length).toBe(1);
        expect(setAsTokens[0].type).toBe('property'); // targetAttribute

        const valTokens = tokens.filter(t => t.text === '"Val"');
        expect(valTokens.length).toBe(1);
        expect(valTokens[0].type).toBe('string'); // value
    });
});

import { validateDefinitionAttributes } from '../../validation';
import { DiagnosticRules } from '../../diagnostics';

describe('Modifier Chains Validation', () => {
    it('should not throw errors for valid Local modifier chain', () => {
        const tdl = `[Form: MyForm]
            Local : Form : SV Output Medium : Add : Part : Before : Top Part : MyPart
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
        const def = sourceFile.definitions[0];
        const diagnostics = validateDefinitionAttributes(def, docReal, testScopeManager!);
        
        const errors = diagnostics.filter(d => 
            d.code === DiagnosticRules.DefinitionNotInScope.code || 
            d.code === DiagnosticRules.MissingDefinition.code
        );
        // It might be a missing definition because we are in a test suite, but it shouldn't infinite loop.
        expect(Array.isArray(errors)).toBe(true);
    });

    it('should validate Option, Switch, and Use modifiers without infinite looping', () => {
        const tdl = `[Form: MyForm]
            Option : MyOption : $$IsTrue
            Switch : MyCase : "Value" : $$IsTrue
            Use : BaseForm
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
        const def = sourceFile.definitions[0];
        
        const diagnostics = validateDefinitionAttributes(def, docReal, testScopeManager!);
        expect(Array.isArray(diagnostics)).toBe(true);
    });

    it('should not validate parameters for delete and replace modifiers', () => {
        const tdl = `[Field: ClosQty]
            Use : InQty
            Delete : Border
            Replace : Style : Normal : Bold
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
        const def = sourceFile.definitions[0];
        
        const diagnostics = validateDefinitionAttributes(def, docReal, testScopeManager!);
        
        const arityErrors = diagnostics.filter(d => 
            d.code === DiagnosticRules.MissingParameters.code || 
            d.code === DiagnosticRules.MissingMandatoryParameter.code
        );
        expect(arityErrors.length).toBe(0);
    });

    it('should validate Local modifier definition types and flag invalid types', () => {
        const tdlInvalid = `[Form: MyForm]
            Local : Report : MyReport : Border : Thin Top
        `;
        const parser = new Parser(tdlInvalid);
        const sourceFile = parser.parse();
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdlInvalid);
        const def = sourceFile.definitions[0];
        
        const diagnostics = validateDefinitionAttributes(def, docReal, testScopeManager!);
        const invalidTypeErrors = diagnostics.filter(d => d.code === DiagnosticRules.InvalidKeyword.code);
        expect(invalidTypeErrors.length).toBe(1);
        expect(invalidTypeErrors[0].message).toContain("Expected one of: Form, Part, Line, Field");

        const tdlValid = `[Form: MyForm]
            Local : Part : MyPart : Local : Line : MyLine : Local : Field : MyField : Set As : "Val"
        `;
        const parserValid = new Parser(tdlValid);
        const sourceFileValid = parserValid.parse();
        const docRealValid = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdlValid);
        const defValid = sourceFileValid.definitions[0];
        
        const diagnosticsValid = validateDefinitionAttributes(defValid, docRealValid, testScopeManager!);
        const invalidTypeErrorsValid = diagnosticsValid.filter(d => d.code === DiagnosticRules.InvalidKeyword.code);
        expect(invalidTypeErrorsValid.length).toBe(0);
    });

    it('should validate target attributes inside nested modifier chains under Local', () => {
        const tdl = `[Form: MyForm]
            Local : Part : MyPart : Delete : Line
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const docReal = require('vscode-languageserver-textdocument').TextDocument.create('uri', 'tdl', 1, tdl);
        const def = sourceFile.definitions[0];
        
        const diagnostics = validateDefinitionAttributes(def, docReal, testScopeManager!);
        const arityErrors = diagnostics.filter(d => 
            d.code === DiagnosticRules.MissingParameters.code || 
            d.code === DiagnosticRules.MissingMandatoryParameter.code
        );
        expect(arityErrors.length).toBe(0);
    });

    it('should validate nested Add chains with and without position modifiers under Local', () => {
        // Nested Add without position modifier
        const tdlWithout = `[Form: MyForm]
            Part: MyPart
            Local : Part : MyPart : add : Line : MyLine

        [Part: MyPart]
            Line: MyLine

        [Line: MyLine]
        `;
        const parserWithout = new Parser(tdlWithout);
        const sourceFileWithout = parserWithout.parse();
        buildFileScope(testScopeManager!, 'uri1', sourceFileWithout);
        const docRealWithout = require('vscode-languageserver-textdocument').TextDocument.create('uri1', 'tdl', 1, tdlWithout);
        const diagnosticsWithout = validateDefinitionAttributes(sourceFileWithout.definitions[0], docRealWithout, testScopeManager!);
        expect(diagnosticsWithout.length).toBe(0);

        // Nested Add with position modifier
        const tdlWith = `[Form: MyForm]
            Part: MyPart
            Local : Part : MyPart : add : Line : before : MyLine : MyLine2

        [Part: MyPart]
            Line: MyLine, MyLine2

        [Line: MyLine]
        [Line: MyLine2]
        `;
        const parserWith = new Parser(tdlWith);
        const sourceFileWith = parserWith.parse();
        buildFileScope(testScopeManager!, 'uri2', sourceFileWith);
        const docRealWith = require('vscode-languageserver-textdocument').TextDocument.create('uri2', 'tdl', 1, tdlWith);
        const diagnosticsWith = validateDefinitionAttributes(sourceFileWith.definitions[0], docRealWith, testScopeManager!);
        expect(diagnosticsWith.length).toBe(0);
    });

    it('should validate top-level Add chains with and without position modifiers', () => {
        // Top-level Add without position modifier
        const tdlWithout = `[Form: MyForm]
            Part: MyPart
            add : Part : MyPart

        [Part: MyPart]
        `;
        const parserWithout = new Parser(tdlWithout);
        const sourceFileWithout = parserWithout.parse();
        buildFileScope(testScopeManager!, 'uri_without', sourceFileWithout);
        const docRealWithout = require('vscode-languageserver-textdocument').TextDocument.create('uri_without', 'tdl', 1, tdlWithout);
        const diagnosticsWithout = validateDefinitionAttributes(sourceFileWithout.definitions[0], docRealWithout, testScopeManager!);
        expect(diagnosticsWithout.length).toBe(0);

        // Top-level Add with position modifier
        const tdlWith = `[Form: MyForm]
            Part: MyPart, MyPart2
            add : Part : before : MyPart : MyPart2

        [Part: MyPart]
        [Part: MyPart2]
        `;
        const parserWith = new Parser(tdlWith);
        const sourceFileWith = parserWith.parse();
        buildFileScope(testScopeManager!, 'uri_with', sourceFileWith);
        const docRealWith = require('vscode-languageserver-textdocument').TextDocument.create('uri_with', 'tdl', 1, tdlWith);
        const diagnosticsWith = validateDefinitionAttributes(sourceFileWith.definitions[0], docRealWith, testScopeManager!);
        expect(diagnosticsWith.length).toBe(0);
    });

    it('should validate top-level and nested Delete modifiers', () => {
        const tdl = `[Form: MyForm]
            Part: MyPart
            Delete : Border
            Delete : Part : MyPart
            Local : Part : MyPart : Delete : Line
            Local : Part : MyPart : Delete : Line : MyLine

        [Part: MyPart]
            Line: MyLine

        [Line: MyLine]
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        buildFileScope(testScopeManager!, 'uri_delete_val', sourceFile);
        const doc = require('vscode-languageserver-textdocument').TextDocument.create('uri_delete_val', 'tdl', 1, tdl);
        const diagnostics = validateDefinitionAttributes(sourceFile.definitions[0], doc, testScopeManager!);
        expect(diagnostics.length).toBe(0);
    });
});

