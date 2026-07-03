import { describe, it, expect, beforeAll } from 'vitest';
import { Parser } from '../../../core/parser/parser';
import { detectCompletionContext, findDefinitionAtCursor } from '../../../features/completion';
import { CompletionService } from '../../../services/completionService';
import { DocumentContextResolver } from '../../../services/documentContextResolver';import { buildFunctionDocumentation } from '../../../features/completion';
import { FunctionSymbol, SymbolKind } from 'tally-tdl-shared';

describe('Function Documentation Builder', () => {
    it('should build proper markdown documentation for functions', () => {
        const func: FunctionSymbol = {
            name: 'AmountAdd',
            kind: SymbolKind.Function,
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Function',
            description: 'This function adds the two amount values passed as parameters.',
            returnType: 'Amount',
            parameters: [
                {
                    ParameterType: 'Value1',
                    DataType: 'Amount',
                    IsMandatory: true,
                    IsConstant: false,
                    IsList: false,
                    IsVariableArgument: false,
                    DimensionExpression: false
                },
                {
                    ParameterType: 'Value2',
                    DataType: 'Amount',
                    IsMandatory: false,
                    IsConstant: false,
                    IsList: false,
                    IsVariableArgument: false,
                    DimensionExpression: false
                }
            ]
        };

        const doc = buildFunctionDocumentation(func);
        expect(doc).toContain('```tdl');
        expect(doc).toContain('$$AmountAdd(Value1: Amount, [Value2: Amount]): Amount');
        expect(doc).toContain('This function adds the two amount values passed as parameters.');
        expect(doc).toContain('**Required**');
        expect(doc).toContain('*Optional*');
    });
});

describe('TDL Suggestions Tests', () => {
    let mockConnection: any;
    let mockDocuments: any;
    let mockManager: any;
    let defaultCreateConnection: () => void;
    let completionCallback: Function;

    it('returns formula names for @@ context', async () => {
        const { TextDocument } = await import('vscode-languageserver-textdocument');

        const { ScopeManager } = await import('../../../semantics/scopeManager');

        const tdlContent = '[Report: MyReport]\n    Set As: @@';
        
        mockConnection = {
            onCompletion: (cb: any) => { completionCallback = cb; },
            onCompletionResolve: () => {},
            console: { log: () => {}, error: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-1', 'tdl', 1, tdlContent);
        mockDocuments = {
            get: () => doc
        };
        
        const scopeManager = new ScopeManager();
        scopeManager.initializeGlobalScope();
        
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
        fileScope.formulas.set('mylocalformula', {
            name: 'MyLocalFormula',
            kind: SymbolKind.Formula,
            uri: 'untitled:Untitled-1',
            start: 0,
            end: 0,
            definitionType: 'Formula'
        });
        
        const globalSymbol = {
            name: 'GlobalFormula',
            kind: SymbolKind.Formula,
            uri: 'test',
            start: 0,
            end: 0,
            definitionType: 'Formula'
        };
        (scopeManager as any).projectScope = { formulas: new Map([['globalformula', globalSymbol]]) };
        mockManager = {
            get: () => ({
                sourceFile: mockSourceFile
            }),

            getScopeManager: () => scopeManager,
            getProjectNodes: () => new Set(['untitled:Untitled-1', 'test'])
        };
        
        const contextResolver = new DocumentContextResolver(mockDocuments as any, mockManager as any, mockManager as any);
        const completionService = new CompletionService(mockManager as any, mockManager as any, contextResolver, () => []);
        
        const result = await completionService.complete({
            textDocument: { uri: 'untitled:Untitled-1' },
            position: doc.positionAt(tdlContent.length)
        });
        
        const localFormulaItem = result.items.find((i: any) => i.label === 'MyLocalFormula');
        const globalFormulaItem = result.items.find((i: any) => i.label === 'GlobalFormula');

        expect(localFormulaItem).toBeUndefined();
        expect(globalFormulaItem).toBeDefined();
    });

    it('returns local formula names for @ context', async () => {
        const { TextDocument } = await import('vscode-languageserver-textdocument');

        const { ScopeManager } = await import('../../../semantics/scopeManager');

        const tdlContent = '[Report: MyReport]\n    Set As: @';
        
        let completionCb: Function = () => {};
        const mockConn = {
            onCompletion: (cb: any) => { completionCb = cb; },
            onCompletionResolve: () => {},
            console: { log: () => {}, error: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-2', 'tdl', 1, tdlContent);
        const mockDocs = { get: () => doc };
        const scopeManager = new ScopeManager();
        scopeManager.initializeGlobalScope();
        
        const mockSourceFile = {
            definitions: [],
            errors: [],
            start: 0,
            end: tdlContent.length,
            uri: 'untitled:Untitled-2'
        } as any;
        const fileScope = scopeManager.buildFileScope('untitled:Untitled-2', mockSourceFile);
        
        // Definition scope to hold the local formula
        const defScope = scopeManager.createDefinitionScope('myreport', fileScope, { start: 0, end: tdlContent.length }, 'untitled:Untitled-2');
        
        defScope.formulas.set('mylocalformula', {
            name: 'MyLocalFormula',
            kind: SymbolKind.Formula,
            uri: 'untitled:Untitled-2',
            start: 0,
            end: 0,
            definitionType: 'Formula'
        });
        
        const globalSymbol = {
            name: 'GlobalFormula',
            kind: SymbolKind.Formula,
            uri: 'test',
            start: 0,
            end: 0,
            definitionType: 'Formula'
        };
        (scopeManager as any).projectScope.formulas.set('globalformula', globalSymbol);

        const mockMgr = {
            get: () => ({ sourceFile: mockSourceFile }),

            getScopeManager: () => scopeManager,
            getProjectNodes: () => new Set(['untitled:Untitled-2', 'test'])
        };
        
        const contextResolver = new DocumentContextResolver(mockDocs as any, mockMgr as any, mockMgr as any);
        const completionService = new CompletionService(mockMgr as any, mockMgr as any, contextResolver, () => []);
        
        const result = await completionService.complete({
            textDocument: { uri: 'untitled:Untitled-2' },
            position: doc.positionAt(tdlContent.length)
        });
        
        const localFormulaItem = result.items.find((i: any) => i.label === 'MyLocalFormula');
        const globalFormulaItem = result.items.find((i: any) => i.label === 'GlobalFormula');

        expect(localFormulaItem).toBeDefined();
        expect(globalFormulaItem).toBeUndefined(); // Shouldn't suggest global formulae in @
    });
});
