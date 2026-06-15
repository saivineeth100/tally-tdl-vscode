import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { validateSourceFile } from '../validation';
import { TdlMetadata } from '../../tdlMetaData';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver';

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
        actions: [] // Add empty actions array to fix tests
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
});
