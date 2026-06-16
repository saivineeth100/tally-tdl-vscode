import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { validateSourceFile } from '../validation';
import { TdlMetadata } from '../../tdlMetaData';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver';
import { normalizeTypeName } from '../utils';

describe('Definition Validation (Mocked)', () => {
    // Mock metadata
    const mockMetadata = {
        existingDefinitions: new Map<string, string[]>([
            ['Report', ['Balance Sheet', 'Trial Balance']],
            ['Field', ['Name', 'Amount']]
        ]),
        definitions: new Map<string, any>([
            ['Report', []],
            ['Menu', []],
            ['Function', []],
            ['Field', []]
        ]), // For attributes
        actions: [], // Add empty actions array to fix tests
        getDefinitionsForType: function(this: any, type: string) { return this.definitions?.get(type) || this.definitions?.get(normalizeTypeName(type)); }
    } as unknown as TdlMetadata;

    it('should detect duplicate Report definition', async () => {
        const tdl = `[Report: Balance Sheet]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, mockMetadata);

        const error = diagnostics.find(d => d.message.includes('exists in default TDL'));
        expect(error).toBeDefined();
        expect(error?.severity).toBe(DiagnosticSeverity.Error);
    });

    it('should allow modified definition (#)', async () => {
        const tdl = `[#Report: Balance Sheet]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, mockMetadata);
        expect(diagnostics.length).toBe(0);
    });

    it('should allow new definition', async () => {
        const tdl = `[Report: My New Report]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, mockMetadata);
        expect(diagnostics.length).toBe(0);
    });

    it('should detect duplicate Menu definition', async () => {
        const tdl = `[Menu: Gateway of Tally]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        // Add Menu to mock metadata
        mockMetadata.existingDefinitions.set('Menu', ['Gateway of Tally']);

        const diagnostics = await validateSourceFile(sourceFile, doc, mockMetadata);
        const error = diagnostics.find(d => d.message.includes('exists in default TDL'));
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

        const mockScopeManager = {
            getScopeAt: () => ({}), // Return a dummy scope
            resolve: () => undefined
        } as any;

        const diagnostics = await validateSourceFile(sourceFile, doc, mockMetadata, undefined, mockScopeManager);
        const error = diagnostics.find(d => d.message.includes("Duplicate label '01' in function"));
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

        const diagnostics = await validateSourceFile(sourceFile, doc, mockMetadata, undefined, undefined, undefined, mockDocManager);
        const error = diagnostics.find(d => d.message.includes('creates an infinite loop'));
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

        const mockSymbolTable = {
            findAllByName: (name: string) => {
                if (name === 'OtherReport') {
                    return [{
                        name: 'OtherReport',
                        kind: 'Report', // SymbolKind.Report
                        uri: 'file:///unlinked.tdl',
                        start: 0,
                        end: 10,
                        definitionType: 'Report'
                    }];
                }
                return [];
            },
            getNamesByKind: (kind: any) => {
                if (kind === 'Report') return ['OtherReport'];
                return [];
            }
        } as any;

        // Mock definitions array to include 'Use' attribute so reference validation runs
        const reportDefs = new Map<string, any>();
        reportDefs.set('use', { 
            Name: 'Use', 
            Parameters: [{ RefersTo: 'Report' } as any] 
        } as any);
        mockMetadata.definitions.set('Report', reportDefs);

        const diagnostics = await validateSourceFile(sourceFile, doc, mockMetadata, mockSymbolTable, undefined, undefined, mockDocManager);
        const warning = diagnostics.find(d => d.message.includes('not included in the project'));
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });
});
