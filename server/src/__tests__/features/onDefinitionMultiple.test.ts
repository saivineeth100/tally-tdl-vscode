import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SymbolKind } from 'tally-tdl-shared';
import { ScopeKind } from '../../semantics/scopeManager/types';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { loadMetadata } from '../../semantics/metadataLoader';
import * as path from 'path';

describe('onDefinition Multiple (Duplicates and Modifiers)', () => {
    let harness: ServerTestHarness;

    beforeEach(async () => {
        harness = new ServerTestHarness();
        const scopeMgr = harness.runtime.services.documentStateStore.tdlScopeManager;
        const metadataPath = path.join(__dirname, '..', '..', '..', 'data');
        await loadMetadata(metadataPath, "7.0", scopeMgr, false, false);
    });

    afterEach(() => {
        harness.dispose();
    });

    it('should return multiple definition locations when resolving duplicates and modifiers', () => {
        const scopeMgr = harness.runtime.services.documentStateStore.tdlScopeManager;

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
        const mods = scopeMgr.modifierContributions.get(`${ref.expectedType.toLowerCase()}|${ref.name.toLowerCase().replace(/\\s+/g, '')}`);
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

    it('should resolve modifier definitions through actual NavigationService.definition', async () => {
        const uri = 'file:///active1.tdl';
        const doc = TextDocument.create(uri, 'tdl', 1, '[Part: MyPart]\n[#Part: MyPart]\n[Form: MyForm]\n    Part: MyPart');
        harness.documents.set(uri, doc);
        
        // Load the document using documentLifecycle so it is parsed and indexed
        await harness.runtime.documentLifecycle.onDidOpen(doc);
        
        // Click position on "MyPart" in normal usage (inside Form)
        const params = {
            textDocument: { uri },
            position: { line: 3, character: 10 }
        };
        
        const locs = await harness.runtime.navigation.definition(params) as any[];
        
        // Both the base definition and the modifier should be returned
        expect(locs).toBeDefined();
        expect(locs.length).toBe(2);
        
        const targetUris = (locs as any[]).map(l => l.targetUri || l.uri);
        expect(targetUris).toContain('file:///active1.tdl');
    });

    it('should navigate to base definition when clicking on a modifier itself', async () => {
        const uri = 'file:///active1.tdl';
        const doc = TextDocument.create(uri, 'tdl', 1, '[Part: MyPart]\n[#Part: MyPart]');
        harness.documents.set(uri, doc);
        
        await harness.runtime.documentLifecycle.onDidOpen(doc);
        
        // Click position on "MyPart" inside "[#Part: MyPart]" (line 1, char 8)
        const params = {
            textDocument: { uri },
            position: { line: 1, character: 8 }
        };
        
        const locs = await harness.runtime.navigation.definition(params) as any[];
        
        // It should only return the base definition, not the modifier itself
        expect(locs).toBeDefined();
        // Since both are in same file, if isFromModifier=true, filterDefinitionLocations only returns baseDefinitions.
        expect(locs.length).toBe(1);
        
        const targetUri = (locs as any[])[0].targetUri || (locs as any[])[0].uri;
        expect(targetUri).toBe('file:///active1.tdl');
    });

    it('should resolve definitions through Use attribute references', async () => {
        const uri = 'file:///active1.tdl';
        const doc = TextDocument.create(
            uri,
            'tdl',
            1,
            '[Report: BaseReport]\n[Report: MyReport]\n    Use: BaseReport'
        );
        harness.documents.set(uri, doc);
        
        await harness.runtime.documentLifecycle.onDidOpen(doc);
        
        // Position of "BaseReport" in "    Use: BaseReport" (line 2, char 9)
        const params = {
            textDocument: { uri },
            position: { line: 2, character: 9 }
        };
        
        const locs = await harness.runtime.navigation.definition(params) as any[];
        
        expect(locs).toBeDefined();
        expect(locs.length).toBe(1);
        
        const targetUri = (locs as any[])[0].targetUri || (locs as any[])[0].uri;
        expect(targetUri).toBe('file:///active1.tdl');
    });

    it('should resolve definitions from other files for loose/inactive files when tpj projects are present', async () => {
        const uriA = 'file:///active_proj.tdl';
        const uriB = 'file:///loose.tdl';
        
        // Active file defining the base Line
        const docA = TextDocument.create(uriA, 'tdl', 1, '[Line: CollAmtTotalLine]\n    Fields: Long Prompt, CollAmtTotal');
        // Inactive loose file inheriting from it
        const docB = TextDocument.create(uriB, 'tdl', 1, '[Line: NumItemsLine]\n    Use: CollAmtTotalLine');
        
        harness.documents.set(uriA, docA);
        harness.documents.set(uriB, docB);
        
        // Add active_proj.tdl to tpj files to force loose.tdl to be inactive
        harness.runtime.services.includeGraphManager.tpjFiles.add(uriA);
        
        await harness.runtime.documentLifecycle.onDidOpen(docA);
        await harness.runtime.documentLifecycle.onDidOpen(docB);
        
        // Position of "CollAmtTotalLine" in "    Use: CollAmtTotalLine" (line 1, char 9)
        const params = {
            textDocument: { uri: uriB },
            position: { line: 1, character: 9 }
        };
        
        const locs = await harness.runtime.navigation.definition(params) as any[];
        
        expect(locs).toBeDefined();
        expect(locs.length).toBe(1);
        expect((locs as any[])[0].targetUri || (locs as any[])[0].uri).toBe('file:///active_proj.tdl');
    });
});
