import { describe, it, expect, vi } from 'vitest';
import { DocumentStateStore } from '../../../services/documentStateStore';
import { SymbolKind } from 'tally-tdl-shared';
import { ScopeKind } from '../../../semantics/scopeManager/types';
import { TextDocuments, TextDocument } from 'vscode-languageserver';

describe('Autocomplete Isolation', () => {
    it('should suggest from projectScope first, and then workspaceScope for active files', () => {
        const docManager = new DocumentStateStore();
        const scopeMgr = docManager.tdlScopeManager;

        // Populate ProjectScope (Active files)
        scopeMgr.scopeIndex.set('report', new Map([
            ['activereport', [
                { kind: ScopeKind.Definition, definition: { name: 'ActiveReport', kind: SymbolKind.Report } as any } as any
            ]]
        ]));

        // Populate WorkspaceScope (Inactive files)
        scopeMgr.workspaceIndex.set('report', new Map([
            ['inactivereport', [
                { kind: ScopeKind.Definition, definition: { name: 'InactiveReport', kind: SymbolKind.Report } as any } as any
            ]]
        ]));

        // Call getGlobalDefinitionsByType (used by autocomplete)
        const activeDefs = scopeMgr.getGlobalDefinitionsByType('Report', true);
        
        // We expect BOTH active and inactive reports because it's an active file
        expect(activeDefs.length).toBe(2);
        
        // ProjectScope definitions should be first
        expect(activeDefs[0].name).toBe('ActiveReport');
        // WorkspaceScope definitions should be appended at the end
        expect(activeDefs[1].name).toBe('InactiveReport');
    });

    it('should ONLY suggest from workspaceScope for inactive files', () => {
        const docManager = new DocumentStateStore();
        const scopeMgr = docManager.tdlScopeManager;

        scopeMgr.scopeIndex.set('report', new Map([
            ['activereport', [
                { kind: ScopeKind.Definition, definition: { name: 'ActiveReport', kind: SymbolKind.Report } as any } as any
            ]]
        ]));

        scopeMgr.workspaceIndex.set('report', new Map([
            ['inactivereport', [
                { kind: ScopeKind.Definition, definition: { name: 'InactiveReport', kind: SymbolKind.Report } as any } as any
            ]]
        ]));


        // Call getGlobalDefinitionsByType for an inactive file
        const inactiveDefs = scopeMgr.getGlobalDefinitionsByType('Report', false);
        
        // We expect ONLY the inactive report because we don't want to pollute inactive files with project stuff (or actually wait, the logic currently returns Workspace scope items only if isActive=false)
        expect(inactiveDefs.length).toBe(1);
        expect(inactiveDefs[0].name).toBe('InactiveReport');
    });
});
