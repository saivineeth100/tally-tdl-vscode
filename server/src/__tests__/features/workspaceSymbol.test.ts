import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getWorkspaceSymbols } from '../../features/workspaceSymbol';
import { SymbolKind } from 'tally-tdl-shared';
import { WorkspaceSymbolParams, SymbolKind as LSPSymbolKind } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { CancellationTokenSource } from 'vscode-languageserver';
import { ScopeKind } from '../../semantics/scopeManager/types';

describe('Workspace Symbols', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        harness = new ServerTestHarness();
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, '');
        harness.documents.set('file:///test.tdl', doc);
        
        // Mock indexed docs
        harness.runtime.services.documentStateStore.setIndexed('file:///test.tdl', {} as any);
    });

    function addSymbol(name: string, kind: SymbolKind, definitionType: string = 'Report') {
        const scopeMgr = harness.runtime.services.documentStateStore.tdlScopeManager;
        const normalizedType = definitionType.toLowerCase();
        const normalizedName = name.toLowerCase();
        
        if (!scopeMgr.scopeIndex.has(normalizedType)) {
            scopeMgr.scopeIndex.set(normalizedType, new Map());
        }
        
        const typeMap = scopeMgr.scopeIndex.get(normalizedType)!;
        if (!typeMap.has(normalizedName)) {
            typeMap.set(normalizedName, []);
        }
        
        typeMap.get(normalizedName)!.push({
            kind: ScopeKind.Definition,
            definition: {
                name,
                kind,
                definitionType,
                uri: 'file:///test.tdl',
                start: 0,
                end: 10
            }
        } as any);
    }

    it('Search by name returns matches', async () => {
        addSymbol('MyReport', SymbolKind.Report);
        addSymbol('MyField', SymbolKind.Field);
        
        const params: WorkspaceSymbolParams = { query: 'MyRep' };
        const symbols = await getWorkspaceSymbols(
            params.query, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            new CancellationTokenSource().token
        );
        
        expect(symbols.length).toBe(1);
        expect(symbols[0].name).toBe('MyReport');
        expect(symbols[0].kind).toBe(LSPSymbolKind.Class);
    });

    it('Type filter syntax', async () => {
        addSymbol('MyReport', SymbolKind.Report, 'Report');
        addSymbol('MyField', SymbolKind.Field, 'Field');
        
        // #type:query
        const params: WorkspaceSymbolParams = { query: '#field:MyFi' };
        const symbols = await getWorkspaceSymbols(
            params.query, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            new CancellationTokenSource().token
        );
        
        expect(symbols.length).toBe(1);
        expect(symbols[0].name).toBe('MyField');
    });

    it('Type filter without query returns all of type', async () => {
        addSymbol('MyReport', SymbolKind.Report, 'Report');
        addSymbol('MyField', SymbolKind.Field, 'Field');
        addSymbol('MyField2', SymbolKind.Field, 'Field');
        
        const params: WorkspaceSymbolParams = { query: '#field:' };
        const symbols = await getWorkspaceSymbols(
            params.query, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            new CancellationTokenSource().token
        );
        
        expect(symbols.length).toBe(2);
        expect(symbols[0].name).toBe('MyField');
        expect(symbols[1].name).toBe('MyField2');
    });

    it('Space separated type filter syntax', async () => {
        addSymbol('MyReport', SymbolKind.Report, 'Report');
        addSymbol('MyField', SymbolKind.Field, 'Field');
        
        const params: WorkspaceSymbolParams = { query: 'field MyFi' };
        const symbols = await getWorkspaceSymbols(
            params.query, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            new CancellationTokenSource().token
        );
        
        expect(symbols.length).toBe(1);
        expect(symbols[0].name).toBe('MyField');
    });

    it('Empty query returns all', async () => {
        addSymbol('MyReport', SymbolKind.Report);
        addSymbol('MyField', SymbolKind.Field);
        
        const params: WorkspaceSymbolParams = { query: '' };
        const symbols = await getWorkspaceSymbols(
            params.query, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            new CancellationTokenSource().token
        );
        
        expect(symbols.length).toBe(2);
    });

    it('Case-insensitive matching',async () => {
        addSymbol('MyReport', SymbolKind.Report);
        
        const params: WorkspaceSymbolParams = { query: 'myreport' };
        const symbols = await getWorkspaceSymbols(
            params.query, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            new CancellationTokenSource().token
        );
        
        expect(symbols.length).toBe(1);
        expect(symbols[0].name).toBe('MyReport');
    });
});
