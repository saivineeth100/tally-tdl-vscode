import { describe, it, expect } from 'vitest';
import { getArityBounds, validateFunctionArity, validateActionArity } from '../validation/arityValidation';
import { ScopeManager } from '../scopeManager';
import { SymbolTable } from '../symbolTable';
import { FunctionCallNode, StatementNode, IdentifierNode, SyntaxKind } from '../../parser/ast';

function createMockDoc() {
    return {
        uri: 'file:///test.tdl',
        positionAt: (offset: number) => ({ line: 0, character: offset }),
        getText: () => '',
        lineCount: 1,
        version: 1
    } as any;
}

describe('Function arity validation', () => {
    it('reports too few args for function', () => {
        const symbolTable = new SymbolTable();
        const scopeManager = new ScopeManager(symbolTable);
        scopeManager.getScopeAt = () => scopeManager.globalScope as any;
        scopeManager.globalScope.functions.set('myfunc', {
            name: 'myfunc',
            parameters: [
                { ParameterType: 'P1', IsMandatory: true } as any,
                { ParameterType: 'P2', IsMandatory: true } as any
            ]
        } as any);

        const doc = createMockDoc();
        const diagnostics: any[] = [];
        const funcNode: FunctionCallNode = {
            kind: SyntaxKind.FunctionCall,
            start: 0, end: 10,
            functionName: { text: '$$MyFunc', start: 0, end: 8 } as any,
            arguments: [{ kind: SyntaxKind.Identifier } as any] // 1 argument
        };

        validateFunctionArity(funcNode, doc, scopeManager, diagnostics);
        
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe('TDL021'); // MissingParameters
    });

});

describe('Action arity validation', () => {
    it('reports missing mandatory args for action', () => {
        const symbolTable = new SymbolTable();
        const scopeManager = new ScopeManager(symbolTable);
        scopeManager.globalScope.actions.set('myaction', {
            name: 'MyAction',
            parameters: [
                { ParameterType: 'P1', IsMandatory: true } as any
            ]
        } as any);

        const doc = createMockDoc();
        const diagnostics: any[] = [];
        const stmtNode: StatementNode = {
            kind: SyntaxKind.Statement,
            start: 0, end: 10,
            action: { text: 'MyAction', start: 0, end: 8 } as any,
            args: [], // 0 arguments
            label: undefined
        } as any;

        validateActionArity(stmtNode, doc, scopeManager, diagnostics);
        
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe('TDL021'); // MissingParameters
    });
});

describe('getArityBounds', () => {
    it('returns min=0 max=0 for empty params', () => {
        const bounds = getArityBounds([]);
        expect(bounds).toEqual({ min: 0, max: 0 });
    });

    it('returns min=2 for params [mandatory, mandatory, optional]', () => {
        const bounds = getArityBounds([
            { ParameterType: 'A', IsMandatory: true } as any,
            { ParameterType: 'B', IsMandatory: true } as any,
            { ParameterType: 'C', IsMandatory: false } as any
        ]);
        expect(bounds).toEqual({ min: 2, max: 3 });
    });

    it('returns max=null for params with IsList', () => {
        const bounds = getArityBounds([
            { ParameterType: 'A', IsMandatory: true } as any,
            { ParameterType: 'B', IsList: true } as any
        ]);
        expect(bounds).toEqual({ min: 1, max: null });
    });

    it('returns max=null for params with IsVariableArgument', () => {
        const bounds = getArityBounds([
            { ParameterType: 'A', IsMandatory: true } as any,
            { ParameterType: 'B', IsVariableArgument: true } as any
        ]);
        expect(bounds).toEqual({ min: 1, max: null });
    });
});
