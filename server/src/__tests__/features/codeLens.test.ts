import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideCodeLens, resolveCodeLens, clearCodeLensCache } from '../../features/codeLens';
import { Parser } from '../../core/parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ScopeManager } from '../../semantics/scopeManager';
import { Position } from 'vscode-languageserver';
import { buildFileScope } from '../../semantics/scopeManager/scopeBuilder';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { normalizeUri } from '../../utils/uri';
import { URI } from 'vscode-uri';

function createCodeLensContext(text: string) {
    const parser = new Parser(text);
    const sourceFile = parser.parse();
    const uri = URI.file('d:/test.txt').toString();
    const doc = TextDocument.create(uri, 'tdl', 1, text);
    const scopeManager = new ScopeManager();
    
    // Mock global attributes for 'field' so that 'Set As' is known but 'LF1' is unknown (implicit formula)
    const fieldAttrs = new Map<string, any>();
    fieldAttrs.set('setas', { name: 'setas' });
    scopeManager.globalScope.attributes.set('field', fieldAttrs as any);
    
    // Build real scope
    buildFileScope(scopeManager, normalizeUri(uri), sourceFile);
    
    return { sourceFile, doc, scopeManager, uri };
}

describe('Code Lens Provider', () => {
    it('should provide CodeLens for regular definitions', () => {
        const text = `[Form: My Form]`;
        const { sourceFile, doc, scopeManager } = createCodeLensContext(text);
        
        const lenses = provideCodeLens(sourceFile, doc, scopeManager);
        expect(lenses.length).toBe(1);
        expect(lenses[0].data.name).toBe('My Form');
    });

    it('should provide CodeLens for modifier definitions', () => {
        const text = `[#Form: My Form]
        
[Part: SomeReport]
    Form : My Form`;
        const { sourceFile, doc, scopeManager } = createCodeLensContext(text);
        
        const lenses = provideCodeLens(sourceFile, doc, scopeManager);
        
        // Should provide a single lens for the modifier form AND the part, both usages
        // because we don't mock modifierContributions yet.
        expect(lenses.length).toBe(2);
        
        const names = lenses.map(l => l.data.name);
        expect(names).toContain('My Form');
        expect(names).toContain('SomeReport');
    });

    it('should provide CodeLens for implicit local formulas', () => {
        const text = `[Field: Local Formula]
            Set As: @LF1 + @LF2
            LF1: "Hello"
            LF2: "World"`;
        const { sourceFile, doc, scopeManager } = createCodeLensContext(text);
        
        const lenses = provideCodeLens(sourceFile, doc, scopeManager);
        expect(lenses.length).toBe(3);
        
        const names = lenses.map(l => l.data.name);
        expect(names).toContain('Local Formula');
        expect(names).toContain('LF1');
        expect(names).toContain('LF2');
    });

    describe('CodeLens Resolution', () => {
        let harness: ServerTestHarness;
        
        beforeEach(() => {
            clearCodeLensCache();
            harness = new ServerTestHarness();
        });

        it('should resolve lens with usages type and cache the result', async () => {
            const text = `[Report: Test]`;
            const { sourceFile, doc, scopeManager, uri } = createCodeLensContext(text);
            const normUri = normalizeUri(uri);
            
            harness.documents.set(uri, doc);
            harness.runtime.services.documentStateStore.setOpen(normUri, { sourceFile, diagnostics: [] } as any);
            harness.runtime.services.documentStateStore.tdlScopeManager = scopeManager;
            
            const lens = {
                range: { start: Position.create(0, 0), end: Position.create(0, 10) },
                data: { uri: doc.uri, name: 'Test', position: Position.create(0, 9), type: 'usages' }
            } as any;

            const resolved = await resolveCodeLens(
                lens, 
                harness.runtime.services.contextResolver, 
                harness.runtime.services.documentLoader
            );
            expect(resolved.command).toBeDefined();
            expect(resolved.command?.title).toContain('usage');
            
            // Run again to hit cache
            const resolved2 = await resolveCodeLens(
                lens, 
                harness.runtime.services.contextResolver, 
                harness.runtime.services.documentLoader
            );
            expect(resolved2.command?.title).toContain('usage');
        });

        it('should resolve lens with modifiers type', async () => {
            const text = `[Report: Test]`;
            const { sourceFile, doc, scopeManager, uri } = createCodeLensContext(text);
            const normUri = normalizeUri(uri);
            
            harness.documents.set(uri, doc);
            harness.runtime.services.documentStateStore.setOpen(normUri, { sourceFile, diagnostics: [] } as any);
            harness.runtime.services.documentStateStore.tdlScopeManager = scopeManager;

            const lens = {
                range: { start: Position.create(0, 0), end: Position.create(0, 10) },
                data: { uri: doc.uri, name: 'Test', position: Position.create(0, 9), type: 'modifiers', expectedType: 'report' }
            } as any;

            const resolved = await resolveCodeLens(
                lens, 
                harness.runtime.services.contextResolver, 
                harness.runtime.services.documentLoader
            );
            expect(resolved.command).toBeDefined();
            expect(resolved.command?.title).toContain('modifier');
        });
    });
});
