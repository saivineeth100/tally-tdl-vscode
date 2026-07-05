/**
 * Tests for definition header validation and diagnostics.
 * Validates that definition types, definition names (with or without spaces),
 * modifiers, duplicate definitions, and whitespace edge cases are properly checked.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { validateSourceFile } from '../../validation';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver';
import { DiagnosticRules } from '../../diagnostics';
import { ServerTestHarness } from '../harness/serverTestHarness';

describe('Validation - [deftype:defname]', () => {
    let harness: ServerTestHarness;
    let mockScopeManager: any;

    beforeEach(() => {
        harness = new ServerTestHarness();
        mockScopeManager = harness.runtime.services.documentStateStore.tdlScopeManager;
        
        // Setup initial global definitions
        mockScopeManager.globalScope.definitions = new Map([
            ['report', new Map([
                ['balancesheet', { name: 'balancesheet', kind: 0, uri: '', start: 0, end: 0, definitionType: 'report' } as any],
                ['trialbalance', { name: 'trialbalance', kind: 0, uri: '', start: 0, end: 0, definitionType: 'report' } as any]
            ])],
            ['menu', new Map()],
            ['form', new Map()]
        ]);

        mockScopeManager.definitionTypeLabels.set('report', 'Report');

        // Add attributes map in globalScope
        const reportAttrs = new Map<string, any>();
        reportAttrs.set('use', {
            name: 'Use',
            parameters: [{ RefersTo: 'Report' }]
        });
        mockScopeManager.globalScope.attributes.set('report', reportAttrs);
    });

    afterEach(() => {
        harness.dispose();
    });

    // Relocated / generic validation tests
    it('should detect duplicate Report definition', async () => {
        const tdl = `[Report: Balance Sheet]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);

        const error = diagnostics.find(d => d.code === DiagnosticRules.DuplicateDefinition.code);
        expect(error).toBeDefined();
        expect(error?.severity).toBe(DiagnosticSeverity.Error);
    });

    it('should allow modified definition (#)', async () => {
        const tdl = `[#Report: Balance Sheet]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diagnostics.length).toBe(0);
    });

    it('should NOT allow ! modifier for existing definition', async () => {
        const tdl = `[!Report: Balance Sheet]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe(DiagnosticRules.InvalidOptionalModifier.code);
    });

    it('should NOT report ModifierMissingTarget for ! modifier if definition does not exist', async () => {
        const tdl = `[!Report: New Report]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diagnostics.length).toBe(0);
    });

    it('should allow new definition', async () => {
        const tdl = `[Report: My New Report]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diagnostics.length).toBe(0);
    });

    it('should detect duplicate Menu definition', async () => {
        const tdl = `[Menu: Gateway of Tally]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        mockScopeManager.globalScope.definitions.get('menu')?.set('gatewayoftally', { name: 'gatewayoftally', kind: 2, uri: '', start: 0, end: 0, definitionType: 'menu' } as any);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const error = diagnostics.find(d => d.code === DiagnosticRules.DuplicateDefinition.code);
        expect(error).toBeDefined();
    });

    it('should validate file-level Deftype directive', async () => {
        const tdl = `<Deftype: Report>\n[MyReport]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(warning).toBeUndefined();
    });

    it('should emit warning for file-level Deftype directive with invalid type', async () => {
        const tdl = `<Deftype: InvalidDefType>\n[MyReport]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });

    it('should detect unknown definition type diagnostic', async () => {
        const tdl = `[InvalidType: MyName]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
        expect(warning?.message).toContain('InvalidType');
    });

    it('should flag duplicate definition even if name has spaces', async () => {
        const tdl = `[Report: Trial Balance]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        // Preload another definition of the same type and name (trialbalance is in setup)
        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const error = diagnostics.find(d => d.code === DiagnosticRules.DuplicateDefinition.code);
        expect(error).toBeDefined();
        expect(error?.severity).toBe(DiagnosticSeverity.Error);
    });

    it('should ignore case differences in definition types', async () => {
        const tdl = `[report: Balance Sheet]`; // lowercase report
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        // It detects the duplicate because report is a duplicate (Balance Sheet)
        const error = diagnostics.find(d => d.code === DiagnosticRules.DuplicateDefinition.code);
        expect(error).toBeDefined();
    });

    it('should handle whitespace in definition headers correctly', async () => {
        const tdl = `[   Report   :   New Sheet   ]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diagnostics.length).toBe(0);
    });

    it('should validate System: Formula and System: Variable headers and not flag duplicate errors for multiple blocks', async () => {
        const tdl = `
        [System: Formula]
            MyURL1 : "http://localhost"
        [System: Formula]
            MyURL2 : "http://localhost2"
        [System: Variable]
            MyVar1 : "Value"
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        // None of these headers should flag duplicate or unknown definition type warnings
        const error = diagnostics.find(d => d.code === DiagnosticRules.DuplicateDefinition.code || d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(error).toBeUndefined();
    });
    it('should detect unknown definition type diagnostic for invalid System definition names', async () => {
        const tdl = `[System: InvalidName]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
        expect(warning?.message).toContain('InvalidName');
    });
    it('should flag errors when modifiers are used on System definitions', async () => {
        const tdl = `[#System: Formula]\n[!System: Variable]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const errors = diagnostics.filter(d => d.code === DiagnosticRules.InvalidModifierForSystem.code);
        
        expect(errors.length).toBe(2);
        errors.forEach(err => {
            expect(err.severity).toBe(DiagnosticSeverity.Error);
            expect(err.message).toBe("Modifiers are not allowed on System definitions.");
        });
    });
    it('should handle incomplete definitions safely', async () => {
        const tdl = `[Report:`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        // It might report syntax/missing bracket error, but should not crash or throw exceptions
        expect(diagnostics).toBeDefined();
    });
});
