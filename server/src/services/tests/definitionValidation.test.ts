import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { validateSourceFile } from '../validation';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver';
import { normalizeTypeName } from '../utils';
import { DiagnosticRules } from '../../diagnostics';
import { ScopeManager } from '../scopeManager';
import { SymbolTable, SymbolKind } from '../symbolTable';

describe('Definition Validation (Mocked)', () => {
    // Mock ScopeManager
    const symbolTable = new SymbolTable();
    const mockScopeManager = new ScopeManager(symbolTable);
    
    // Add existing definitions directly to the scope manager
    mockScopeManager.existingDefinitions = new Map<string, Set<string>>([
        ['report', new Set(['balancesheet', 'trialbalance'])],
        ['field', new Set(['name', 'amount'])],
        ['menu', new Set()]
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

    it('should allow modified definition (!)', async () => {
        const tdl = `[!Report: Balance Sheet]`;
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
        mockScopeManager.existingDefinitions.get('menu')?.add('gatewayoftally');

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
            existingDefinitions: mockScopeManager.existingDefinitions,
            globalScope: mockScopeManager.globalScope,
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

        let typeMap = mockScopeManager.projectScope.definitions.get('report');
        if (!typeMap) { typeMap = new Map(); mockScopeManager.projectScope.definitions.set('report', typeMap); }
        typeMap.set('otherreport', { name: 'OtherReport', definitionType: 'Report', kind: SymbolKind.Report, uri: 'file:///unlinked.tdl' } as any);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager, undefined, mockDocManager);
        const warning = diagnostics.find(d => d.message.includes('not included in the project'));
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });
});
