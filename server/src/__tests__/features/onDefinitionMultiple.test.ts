import { describe, it, expect, vi } from 'vitest';
import { ScopeManager } from '../../../src/semantics/scopeManager';
import { DocManager } from '../../../src/docManager';
import { SymbolKind } from 'tally-tdl-shared';
import { ScopeKind } from '../../../src/semantics/scopeManager/types';
import { TextDocuments, TextDocument } from 'vscode-languageserver';

describe('onDefinition Multiple (Duplicates and Modifiers)', () => {
    it('should return multiple definition locations when resolving duplicates and modifiers', () => {
        // Mock a DocManager to intercept getScopeManager
        const mockDocuments = {
            onDidOpen: vi.fn(),
            onDidChangeContent: vi.fn(),
            onDidClose: vi.fn(),
            get: vi.fn(),
            all: vi.fn().mockReturnValue([]),
            keys: vi.fn().mockReturnValue([])
        } as unknown as TextDocuments<TextDocument>;
        
        const docManager = new DocManager({ console: { log: vi.fn(), warn: vi.fn(), error: vi.fn() } } as any, mockDocuments);
        const scopeMgr = docManager.tdlScopeManager;

        // Add 2 duplicate base definitions for Report 'MyReport'
        scopeMgr.scopeIndex.set('report', new Map([
            ['myreport', [
                {
                    kind: ScopeKind.Definition,
                    definition: { name: 'MyReport', kind: SymbolKind.Report, uri: 'file:///active1.tdl', start: 10, end: 20, definitionType: 'Report' } as any
                } as any,
                {
                    kind: ScopeKind.Definition,
                    definition: { name: 'MyReport', kind: SymbolKind.Report, uri: 'file:///active2.tdl', start: 50, end: 60, definitionType: 'Report' } as any
                } as any
            ]]
        ]));

        // Add 2 modifiers for Report 'MyReport' (#Report, !Report)
        scopeMgr.modifierContributions.set('report|myreport', [
            { targetDefinitionId: 'report|myreport', modifierKind: '#', uri: 'file:///mod1.tdl', range: { start: 100, end: 110 }, scope: {} as any, order: 0 },
            { targetDefinitionId: 'report|myreport', modifierKind: '!', uri: 'file:///mod2.tdl', range: { start: 200, end: 210 }, scope: {} as any, order: 1 }
        ]);

        // Mock the findReferenceAtOffset to simulate clicking on 'MyReport'
        const mockFindReference = vi.fn().mockReturnValue({
            name: 'MyReport',
            expectedType: 'Report'
        });

        // Simulate onDefinition handler logic:
        const ref = mockFindReference();
        const locations: any[] = [];

        // 1. Resolve Definitions
        const defs = scopeMgr.resolveDefinition(ref.name, ref.expectedType, scopeMgr.projectScope);
        if (defs) {
            for (const def of defs) {
                if (def.uri && def.start !== undefined && def.end !== undefined) {
                    locations.push({
                        uri: def.uri,
                        range: { start: def.start, end: def.end }
                    });
                }
            }
        }

        // 2. Resolve Modifiers
        const mods = scopeMgr.modifierContributions.get(`${ref.expectedType.toLowerCase()}|${ref.name.toLowerCase().replace(/\s+/g, '')}`);
        if (mods) {
            for (const mod of mods) {
                locations.push({
                    uri: mod.uri,
                    range: mod.range
                });
            }
        }

        // We expect 4 locations: 2 base duplicates, 2 modifiers
        expect(locations.length).toBe(4);
        
        // Assert base duplicates
        expect(locations[0].uri).toBe('file:///active1.tdl');
        expect(locations[1].uri).toBe('file:///active2.tdl');

        // Assert modifiers
        expect(locations[2].uri).toBe('file:///mod1.tdl');
        expect(locations[3].uri).toBe('file:///mod2.tdl');
    });
});
