import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { validateSourceFile } from '../../validation';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver';
import { normalizeTypeName } from '../../utils/normalizeUtils';
import { DiagnosticRules } from '../../diagnostics';
import { ScopeKind } from '../../semantics/scopeManager';
import { ScopeManager } from '../../semantics/scopeManager';
import { SymbolKind } from 'tally-tdl-shared';

describe('Definition Validation (Mocked)', () => {
    // Mock ScopeManager
        const mockScopeManager = new ScopeManager();
    
    // Add existing definitions directly to the scope manager
    mockScopeManager.globalScope.definitions = new Map([
        ['report', new Map([['balancesheet', { name: 'balancesheet', kind: 0, uri: '', start: 0, end: 0, definitionType: 'report' } as any], ['trialbalance', { name: 'trialbalance', kind: 0, uri: '', start: 0, end: 0, definitionType: 'report' } as any]])],
        ['field', new Map([['name', { name: 'name', kind: 0, uri: '', start: 0, end: 0, definitionType: 'field' } as any], ['amount', { name: 'amount', kind: 0, uri: '', start: 0, end: 0, definitionType: 'field' } as any]])],
        ['menu', new Map()],
        ['form', new Map()]
    ]);

    // Mock definitions map for attributes using attributes map in globalScope
    const reportAttrs = new Map<string, any>();
    reportAttrs.set('use', {
        name: 'Use',
        parameters: [{ RefersTo: 'Report' }]
    });
    mockScopeManager.globalScope.attributes.set('report', reportAttrs);

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

    it('should NOT allow ! modifier for existing definition (acts like no modifier)', async () => {
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

        // Add Menu to mock metadata
        mockScopeManager.globalScope.definitions.get('menu')?.set('gatewayoftally', { name: 'gatewayoftally', kind: 2, uri: '', start: 0, end: 0, definitionType: 'menu' } as any);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const error = diagnostics.find(d => d.code === DiagnosticRules.DuplicateDefinition.code);
        expect(error).toBeDefined();
    });

    it('should detect duplicate labels within a function', async () => {
        const tdl = `[Function: MyFunction]
        01 : LOG : "Hello"
        01 : LOG : "World"
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const localScopeManager = {
            getScopeAt: () => ({}), // Return a dummy scope
            resolve: () => undefined,
            globalScope: mockScopeManager.globalScope,
            findGlobalSymbolsByName: () => [{ name: 'MyFunction', definitionType: 'Function', isModifier: false }],
            projectScope: { definitions: new Map() }
        } as any;

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, localScopeManager);
        const error = diagnostics.find(d => d.code === DiagnosticRules.DuplicateLabel.code);
        expect(error).toBeDefined();
    });

    it('should detect circular includes', async () => {
        const tdl = `[Include: other.tdl]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///main.tdl', 'tally', 1, tdl);

        const mockDocManager = {
            hasCircularIncludes: () => true,
            getProjectNodes: () => new Set<string>()
        } as any;

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager, undefined, mockDocManager);
        const error = diagnostics.find(d => d.code === DiagnosticRules.CircularInclude.code);
        expect(error).toBeDefined();
        expect(error?.severity).toBe(DiagnosticSeverity.Error);
    });

    it('should flag out of project definition usage', async () => {
        const tdl = `[Report: MyReport]
        Use: OtherReport`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///main.tdl', 'tally', 1, tdl);

        const mockDocManager = {
            hasCircularIncludes: () => false,
            getProjectNodes: () => new Set<string>(['file:///main.tdl'])
        } as any;

        let typeMap = mockScopeManager.scopeIndex.get('report');
        if (!typeMap) { typeMap = new Map(); mockScopeManager.scopeIndex.set('report', typeMap); }
        typeMap.set('otherreport', [{ kind: ScopeKind.Definition, definition: { name: 'OtherReport', definitionType: 'Report', kind: SymbolKind.Report, uri: 'file:///unlinked.tdl' } }] as any);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager, undefined, mockDocManager);
        const warning = diagnostics.find(d => d.message.includes('not included in the project'));
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });

    it('should emit warning for InUse directive with missing definition', async () => {
        const tdl = `[Report: ChildReport]
            <InUse: Report: MissingReport>`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });

    it('should NOT emit warning for InUse directive with valid definition', async () => {
        const tdl = `[Report: ChildReport]
            <InUse: Report: Balance Sheet>`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code)).toBeUndefined();
    });

    it('should emit warning for InUse directive with unknown type', async () => {
        const tdl = `[Report: ChildReport]
            <InUse: InvalidType: Mixin>`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });

    it('should validate multiple comma-separated definitions in InUse directive', async () => {
        const tdl = `[Report: ChildReport]
            <InUse: Report: Balance Sheet, Form: MissingForm, MixinReport>`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        
        // Report: Balance Sheet -> valid
        // Form: MissingForm -> invalid (MissingDefinition)
        // MixinReport -> invalid (MissingDefinition for Report type)
        const warnings = diagnostics.filter(d => d.code === DiagnosticRules.MissingDefinition.code);
        expect(warnings.length).toBe(2);
        expect(warnings[0].message).toContain('MissingForm');
        expect(warnings[1].message).toContain('MixinReport');
    });

    it('should validate file-level Deftype directive', async () => {
        const tdl = `<Deftype: Report>
        [MyReport]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(warning).toBeUndefined();
    });

    it('should emit warning for file-level Deftype directive with invalid type', async () => {
        const tdl = `<Deftype: InvalidDefType>
        [MyReport]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });
});
