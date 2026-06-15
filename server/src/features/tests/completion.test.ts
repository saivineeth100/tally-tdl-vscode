import { describe, it, expect, beforeAll } from 'vitest';
import { Parser } from '../../parser/parser';
import { detectCompletionContext, findDefinitionAtCursor, registerCompletion } from '../completion';
import { setMetadata } from '../../services/metadataService';

describe('Completion Context Detection', () => {

    it('should detect definition name context with modifier (#)', () => {
        const input = `[#Report: `;
        const cursor = input.length;

        const context = detectCompletionContext(input, undefined, cursor, undefined);
        expect(context.type).toBe('definition_name');
        expect(context.defType).toBe('Report');
        expect(context.hasModifier).toBe(true);
        expect(context.modifier).toBe('#');
    });

    it('should detect definition name context without modifier', () => {
        const input = `[Report: `;
        const cursor = input.length;

        const context = detectCompletionContext(input, undefined, cursor, undefined);
        expect(context.type).toBe('definition_name');
        expect(context.defType).toBe('Report');
        expect(context.hasModifier).toBe(false);
    });

    it('should detect attribute context in empty line', () => {
        const input = `
[Report: MyReport]
    
`; // Cursor at indentation
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        // locate cursor at end of indentation (line 3)
        const lines = input.split('\n');
        const cursor = lines[0].length + 1 + lines[1].length + 1 + 4; // approximate
        // Better: use input.indexOf('    ') + 4
        // But input has multiple spaces.
        // Let's use simpler input.

        const inputSimple = `[Report: R]\n   `;
        const parserSimple = new Parser(inputSimple);
        const sourceFileSimple = parserSimple.parse();
        const cursorSimple = inputSimple.length;

        const currentDef = findDefinitionAtCursor(sourceFileSimple, cursorSimple);
        expect(currentDef).toBeDefined();
        expect(currentDef?.type.text).toBe('Report');

        const context = detectCompletionContext('   ', sourceFileSimple, cursorSimple, currentDef);
        expect(context.type).toBe('attribute');
    });
});

import { buildFunctionDocumentation } from '../completion';
import { TDLFunction, TDLFunctionParameter } from '../../models/tdlFunction';

describe('Function Documentation Builder', () => {
    it('should build proper markdown documentation for functions', () => {
        const func = new TDLFunction();
        func.Name = 'AmountAdd';
        func.Description = 'This function adds the two amount values passed as parameters.';
        func.ReturnType = 'Amount';
        func.Category = 'Amount';
        func.Mode = 'Both';

        const p1 = new TDLFunctionParameter();
        p1.ParameterType = 'Value1';
        p1.DataType = 'Amount';
        p1.IsMandatory = true;
        func.Parameters.push(p1);

        const p2 = new TDLFunctionParameter();
        p2.ParameterType = 'Value2';
        p2.DataType = 'Amount';
        p2.IsMandatory = false;
        func.Parameters.push(p2);

        const doc = buildFunctionDocumentation(func);
        expect(doc).toContain('```tdl');
        expect(doc).toContain('$$AmountAdd(Value1: Amount, [Value2: Amount]): Amount');
        expect(doc).toContain('This function adds the two amount values passed as parameters.');
        expect(doc).toContain('**Required**');
        expect(doc).toContain('*Optional*');
    });
});

describe('TDL Suggestions Tests', () => {
    let md: any;
    let mockConnection: any;
    let mockDocuments: any;
    let mockManager: any;
    let completionCallback: Function;

    beforeAll(async () => {
        const { TdlMetadata } = await import('../../tdlMetaData');
        md = new TdlMetadata('');
        setMetadata(md as any);
    });

    it('returns formula names for @@ context', async () => {
        const { TextDocument } = await import('vscode-languageserver-textdocument');
        const { SymbolTable, SymbolKind } = await import('../../services/symbolTable');
        const { ScopeManager } = await import('../../services/scopeManager');

        const tdlContent = '[Report: MyReport]\n    Set As: @@';
        
        mockConnection = {
            onCompletion: (cb: any) => { completionCallback = cb; },
            console: { log: () => {}, error: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-1', 'tdl', 1, tdlContent);
        mockDocuments = {
            get: () => doc
        };
        
        const symbolTable = new SymbolTable();

        const scopeManager = new ScopeManager(symbolTable);
        scopeManager.initializeGlobalScope(md);
        
        // Build file scope so it can be resolved
        const mockSourceFile = {
            definitions: [],
            errors: [],
            start: 0,
            end: tdlContent.length,
            uri: 'untitled:Untitled-1'
        } as any;
        const fileScope = scopeManager.buildFileScope('untitled:Untitled-1', mockSourceFile);
        
        // Add local formula directly to the file scope
        fileScope.symbols.set('mylocalformula', {
            name: 'MyLocalFormula',
            kind: SymbolKind.Variable,
            uri: 'untitled:Untitled-1',
            start: 0,
            end: 0,
            definitionType: 'Formula'
        });
        
        const globalSymbol = {
            name: 'GlobalFormula',
            kind: SymbolKind.Variable,
            uri: 'test',
            start: 0,
            end: 0,
            definitionType: 'Formula'
        };
        (scopeManager as any).projectScope.symbols.set('globalformula', globalSymbol);

        mockManager = {
            get: () => ({
                sourceFile: mockSourceFile
            }),
            getSymbolTable: () => symbolTable,
            getScopeManager: () => scopeManager
        };
        
        registerCompletion(mockConnection, mockDocuments as any, mockManager as any);
        
        const result = await completionCallback({
            textDocument: { uri: 'untitled:Untitled-1' },
            position: doc.positionAt(tdlContent.length)
        });
        
        const localFormulaItem = result.items.find((i: any) => i.label === 'MyLocalFormula');
        const globalFormulaItem = result.items.find((i: any) => i.label === 'GlobalFormula');

        // MyLocalFormula will be returned because it's in the SymbolTable and getSuggestionsForDefinitionType('Formula')
        // actually finds it via SymbolTable! Wait, getSuggestionsForDefinitionType only queries SymbolTable.
        expect(localFormulaItem).toBeDefined();
        expect(globalFormulaItem).toBeDefined();
    });
});
