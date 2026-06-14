import { describe, it, expect, beforeEach } from 'vitest';
import { getWorkspaceSymbols } from '../workspaceSymbol';
import { SymbolTable, SymbolKind } from '../symbolTable';
import { WorkspaceSymbolParams, SymbolKind as LSPSymbolKind } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('Workspace Symbols', () => {
    let mockDocManager: any;
    let mockDocuments: any;
    let tdlSymbolTable: SymbolTable;
    let xmlSymbolTable: SymbolTable;

    beforeEach(() => {
        tdlSymbolTable = new SymbolTable();
        xmlSymbolTable = new SymbolTable();
        
        mockDocManager = {
            tdlSymbolTable,
            xmlSymbolTable
        };

        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, '');
        mockDocuments = {
            get: () => doc
        };
    });

    function addSymbol(name: string, kind: SymbolKind, definitionType: string = 'Report') {
        tdlSymbolTable.addSymbol({
            name,
            kind,
            uri: 'file:///test.tdl',
            start: 0,
            end: 10,
            definitionType
        });
    }

    it('Search by name returns matches', () => {
        addSymbol('MyReport', SymbolKind.Report);
        addSymbol('MyField', SymbolKind.Field);
        
        const params: WorkspaceSymbolParams = { query: 'MyRep' };
        const symbols = getWorkspaceSymbols(params, mockDocManager, mockDocuments);
        
        expect(symbols.length).toBe(1);
        expect(symbols[0].name).toBe('MyReport');
        expect(symbols[0].kind).toBe(LSPSymbolKind.Class);
    });

    it('Type filter syntax', () => {
        addSymbol('MyReport', SymbolKind.Report, 'Report');
        addSymbol('MyField', SymbolKind.Field, 'Field');
        
        // #type:query
        const params1: WorkspaceSymbolParams = { query: '#report:My' };
        const symbols1 = getWorkspaceSymbols(params1, mockDocManager, mockDocuments);
        expect(symbols1.length).toBe(1);
        expect(symbols1[0].name).toBe('#report: MyReport');

        // type:query
        const params2: WorkspaceSymbolParams = { query: 'field:My' };
        const symbols2 = getWorkspaceSymbols(params2, mockDocManager, mockDocuments);
        expect(symbols2.length).toBe(1);
        expect(symbols2[0].name).toBe('field: MyField');
    });

    it('Empty query', () => {
        addSymbol('MyReport', SymbolKind.Report);
        addSymbol('MyField', SymbolKind.Field);
        
        const params: WorkspaceSymbolParams = { query: '' };
        const symbols = getWorkspaceSymbols(params, mockDocManager, mockDocuments);
        
        expect(symbols.length).toBe(2);
    });

    it('Case-insensitive matching', () => {
        addSymbol('MyReport', SymbolKind.Report);
        
        const params: WorkspaceSymbolParams = { query: 'myreport' };
        const symbols = getWorkspaceSymbols(params, mockDocManager, mockDocuments);
        
        expect(symbols.length).toBe(1);
        expect(symbols[0].name).toBe('MyReport');
    });
});
