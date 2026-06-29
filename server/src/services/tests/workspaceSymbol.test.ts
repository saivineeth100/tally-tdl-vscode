import { describe, it, expect, beforeEach } from 'vitest';
import { getWorkspaceSymbols } from '../workspaceSymbol';
import { SymbolKind } from '../symbolTable';
import { WorkspaceSymbolParams, SymbolKind as LSPSymbolKind } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('Workspace Symbols', () => {
    let mockDocManager: any;
    let mockDocuments: any;
    let tdlMockScopeManager: any;
    let xmlMockScopeManager: any;

    let mockSymbols: any[] = [];
    beforeEach(() => {
        mockSymbols = [];
        tdlMockScopeManager = { 
            searchWorkspaceSymbols: (query: string, typeFilter?: string) => {
                return mockSymbols.filter(s => {
                    if (query && !s.name.toLowerCase().includes(query.toLowerCase())) return false;
                    if (typeFilter && s.definitionType.toLowerCase() !== typeFilter.toLowerCase()) return false;
                    return true;
                });
            }
        };
        xmlMockScopeManager = { searchWorkspaceSymbols: () => [] };
        
        mockDocManager = {
            tdlScopeManager: tdlMockScopeManager,
            xmlScopeManager: xmlMockScopeManager
        };

        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, '');
        mockDocuments = {
            get: () => doc
        };
    });

    function addSymbol(name: string, kind: SymbolKind, definitionType: string = 'Report') {
        mockSymbols.push({ name, kind, uri: 'file:///test.tdl', start: 0, end: 10, definitionType });
    }

    it('Search by name returns matches', async () => {
        addSymbol('MyReport', SymbolKind.Report);
        addSymbol('MyField', SymbolKind.Field);
        
        const params: WorkspaceSymbolParams = { query: 'MyRep' };
        const symbols = await getWorkspaceSymbols(params, mockDocManager, mockDocuments);
        
        expect(symbols.length).toBe(1);
        expect(symbols[0].name).toBe('MyReport');
        expect(symbols[0].kind).toBe(LSPSymbolKind.Class);
    });

    it('Type filter syntax', async () => {
        addSymbol('MyReport', SymbolKind.Report, 'Report');
        addSymbol('MyField', SymbolKind.Field, 'Field');
        
        // #type:query
        const params1: WorkspaceSymbolParams = { query: '#report:My' };
        const symbols1 = await getWorkspaceSymbols(params1, mockDocManager, mockDocuments);
        expect(symbols1.length).toBe(1);
        expect(symbols1[0].name).toBe('#report: MyReport');

        // type:query
        const params2: WorkspaceSymbolParams = { query: 'field:My' };
        const symbols2 = await getWorkspaceSymbols(params2, mockDocManager, mockDocuments);
        expect(symbols2.length).toBe(1);
        expect(symbols2[0].name).toBe('field: MyField');
    });

    it('Empty query', async () => {
        addSymbol('MyReport', SymbolKind.Report);
        addSymbol('MyField', SymbolKind.Field);
        
        const params: WorkspaceSymbolParams = { query: '' };
        const symbols = await getWorkspaceSymbols(params, mockDocManager, mockDocuments);
        
        expect(symbols.length).toBe(2);
    });

    it('Case-insensitive matching',async () => {
        addSymbol('MyReport', SymbolKind.Report);
        
        const params: WorkspaceSymbolParams = { query: 'myreport' };
        const symbols = await getWorkspaceSymbols(params, mockDocManager, mockDocuments);
        
        expect(symbols.length).toBe(1);
        expect(symbols[0].name).toBe('MyReport');
    });
});
