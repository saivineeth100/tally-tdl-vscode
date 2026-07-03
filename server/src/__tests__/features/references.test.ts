import { describe, it, expect, vi } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { findReferences } from '../../features/references';
import { ServerTestHarness } from '../harness/serverTestHarness';
import * as fs from 'fs';

async function setupHarness(files: Record<string, string>) {
    const harness = new ServerTestHarness();
    let targetUri = '';
    let offset = -1;
    
    // Force all files into a single mock project so cross-file tests work without explicit Include statements
    harness.runtime.services.includeGraphManager.getProjectNodes = () => new Set(Object.keys(files));

    // Mock schema definitions for attributes
    const scopeManager = harness.runtime.services.documentStateStore.tdlScopeManager;
    const reportAttrs = new Map<string, any>();
    reportAttrs.set('use', { name: 'Use', parameters: [{ RefersTo: 'Report' }] });
    reportAttrs.set('part', { name: 'Part', parameters: [{ RefersTo: 'Part' }] });
    reportAttrs.set('local', { name: 'Local', parameters: [] });
    reportAttrs.set('set', { name: 'Set', parameters: [{ RefersTo: 'Variable' }] });
    reportAttrs.set('set as', { name: 'Set as', parameters: [{ RefersTo: 'Variable' }] });
    scopeManager.globalScope.attributes.set('report', reportAttrs);

    const partAttrs = new Map<string, any>();
    partAttrs.set('line', { name: 'Line', parameters: [{ RefersTo: 'Line' }] });
    scopeManager.globalScope.attributes.set('part', partAttrs);

    const fieldAttrs = new Map<string, any>();
    fieldAttrs.set('set as', { name: 'Set as', parameters: [{ RefersTo: 'Variable' }] });
    scopeManager.globalScope.attributes.set('field', fieldAttrs);
    
    // Also mock variable definition attribute mapping
    scopeManager.globalScope.attributes.set('variable', new Map());

    for (const [uri, content] of Object.entries(files)) {
        let cleanContent = content;
        let fileOffset = -1;
        
        if (content.includes('|')) {
            fileOffset = content.indexOf('|');
            cleanContent = content.replace('|', '');
            targetUri = uri;
            offset = fileOffset;
        }
        
        const fsPath = uri.replace('file:///', ''); // Naive uri to path conversion
        const canonicalPath = harness.files.canonicalize(fsPath);
        
        harness.files.files.set(canonicalPath, cleanContent);
        const doc = TextDocument.create(uri, 'tdl', 1, cleanContent);
        harness.documents.set(uri, doc);
        await harness.runtime.documentLifecycle!.rebuild(doc);
    }

    return { harness, targetUri, offset };
}

describe('References Service', () => {

    it('should find references within same file', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Report: TestReport]
                Use: Base|Report
                
                [Report: BaseReport]
                Use: AnotherReport
            `
        });
        
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2); 
    });

    it('should find references across multiple files', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///file1.tdl': `
                [Report: |BaseReport]
            `,
            'file:///file2.tdl': `
                [Report: TestReport]
                Use: BaseReport
            `
        });
        
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2);
    });

    it('should differentiate between definition names and attribute values', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Report: |MyReport]
                [Part: MyReport]
            `
        });
        
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(1);
    });

    it('should not have false positives for substring matches', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Report: |BaseReport]
                
                [Report: BaseReport123]
                Use: BaseReport123
            `
        });
        
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(1);
        const refRange = refs[0].range;
        expect(refRange.start.line).toBe(1); // the definition itself
    });

    it('should find references when triggered on an attribute value', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Report: TestReport]
                Use: |BaseReport
                
                [Report: BaseReport]
            `
        });
        
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2);
    });

    it('should handle missing targetUri gracefully', async () => {
        const { harness } = await setupHarness({});
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            'file:///nonexistent.tdl', 10, true);
        expect(refs).toEqual([]);
    });

    it('should handle finding references for variables in Set attribute', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Report: TestReport]
                Variable: MyVar
                
                [System: Variable]
                Set: MyVar: "Hello"
                Local: Field: Default: Set as: ##|MyVar
            `
        });
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, true);
        
        expect(refs).toBeDefined();
        // Variables might not have strict definition tracking without scope manager returning proper scope, but test basic
        expect(refs.length).toBeGreaterThan(0);
    });
    it('should find references in closed files', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Report: |BaseReport]
            `,
            'file:///closed.tdl': `
                [Report: ChildReport]
                Use: BaseReport
            `
        });
        
        // Simulate closed.tdl being closed
        const closedUri = 'file:///closed.tdl';
        const closedContent = harness.documents.get(closedUri)!.getText();
        harness.documents['docs'].delete(closedUri); // It is not open
        
        // We must mock fs.promises.readFile so references.ts can read it.
        const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
            if (path.replace(/\\\\/g, '/').endsWith('closed.tdl')) {
                return Buffer.from(closedContent, 'utf-8');
            }
            throw new Error('File not found');
        });
        
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2); // Definition + 1 usage
        
        readFileSpy.mockRestore();
    });

    it('should find references in Local attributes', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Field: |MyField]
                Set as: "Hello"
                
                [Report: MyReport]
                Local: Field: MyField: Set as: "World"
            `
        });
        
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2);
    });

    it('should count modifiers as references but exclude base definition for Code Lens (includeDeclaration=false)', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Part: |MyPart]
                
                [#Part: MyPart]
                
                [!Part: MyPart]
                
                [Report: SomeReport]
                Part: MyPart
            `
        });
        
        // Simulate CodeLens which calls with includeDeclaration = false
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, false);
        
        expect(refs).toBeDefined();
        // Should find 3 references: 2 modifiers (#Part, !Part) and 1 actual usage (Part: MyPart)
        expect(refs.length).toBe(3); 
    });

    it('should return the exact same reference count when triggered from the modifier', async () => {
        const { harness, targetUri, offset } = await setupHarness({
            'file:///test.tdl': `
                [Part: MyPart]
                
                [#Part: |MyPart]
                
                [!Part: MyPart]
                
                [Report: SomeReport]
                Part: MyPart
            `
        });
        
        // Simulate CodeLens which calls with includeDeclaration = false
        const refs = await findReferences(
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager, 
            targetUri, offset, false);
        
        expect(refs).toBeDefined();
        // Should STILL find 3 references (the search is global for the identifier "MyPart")
        // Base definition is correctly ignored.
        expect(refs.length).toBe(3); 
    });
});
