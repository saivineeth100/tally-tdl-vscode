import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { renameSymbol, prepareRename } from '../../features/rename';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { RenameParams, PrepareRenameParams, Position } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import { normalizeUri } from '../../utils/uri';

async function setupHarness(files: Record<string, string>) {
    const harness = new ServerTestHarness();
    let targetUri = '';
    let position = Position.create(0, 0);
    
    // Force all files into a single mock project so cross-file tests work without explicit Include statements
    harness.runtime.services.includeGraphManager.getProjectNodes = () => new Set(Array.from(harness.files.files.keys()).map(p => 'file:///' + p));

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

    // Map mock URIs to valid absolute URIs so path.resolve works consistently
    const absoluteFiles: Record<string, string> = {};
    for (const [uri, content] of Object.entries(files)) {
        const absUri = uri.replace('file:///', 'file:///d:/');
        absoluteFiles[absUri] = content;
    }

    for (const [uri, content] of Object.entries(absoluteFiles)) {
        let cleanContent = content;
        let filePosition: Position | undefined;
        
        if (content.includes('|')) {
            const offset = content.indexOf('|');
            cleanContent = content.replace('|', '');
            targetUri = normalizeUri(uri);
            filePosition = TextDocument.create(targetUri, 'tdl', 1, cleanContent).positionAt(offset);
            position = filePosition;
        }
        
        const fsPath = URI.parse(uri).fsPath;
        const canonicalPath = harness.files.canonicalize(fsPath);
        const normUri = normalizeUri(uri);
        
        harness.files.files.set(canonicalPath, cleanContent);
        harness.simulateOpen(normUri, 'tdl', cleanContent);
        harness.runtime.documentLifecycle.processPendingDocuments();
    }

    return { harness, targetUri, position };
}

describe('Rename Service', () => {

    it('should rename definition and update all references', async () => {
        const { harness, targetUri, position } = await setupHarness({
            'file:///test.tdl': `
[Report: |BaseReport]
Use: BaseReport
`
        });
        
        const params: RenameParams = {
            textDocument: { uri: targetUri },
            position,
            newName: 'NewReport'
        };
        
        const edit = await renameSymbol(
            params, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager
        );
        
        expect(edit).toBeDefined();
        expect(edit?.changes).toBeDefined();

        if (edit?.changes) {
            const edits = edit.changes[targetUri];
            expect(edits.length).toBe(2);
            expect(edits[0].newText).toBe('NewReport');
            expect(edits[1].newText).toBe('NewReport');
        }
    });

    it('should preserve prefixes for variables', async () => {
        const { harness, targetUri, position } = await setupHarness({
            'file:///test.tdl': `
[System: Variable]
|MyVar : String

[Report: TestReport]
Set: MyVar: "Hello"
Local: Field: Default: Set as: ##MyVar
`
        });
        
        const params: RenameParams = {
            textDocument: { uri: targetUri },
            position,
            newName: 'NewVar'
        };
        
        const edit = await renameSymbol(
            params, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager
        );
        
        expect(edit).toBeDefined();
        if (edit?.changes) {
            const edits = edit.changes[targetUri];
            expect(edits.length).toBe(3);
            
            const doc = harness.documents.get(targetUri)!;
            const originalTexts = edits.map(e => doc.getText(e.range));
            
            expect(originalTexts).toContain('MyVar');
            expect(originalTexts).not.toContain('##MyVar');
        }
    });

    it('should return null if new name is empty', async () => {
        const { harness, targetUri, position } = await setupHarness({
            'file:///test.tdl': `
[Report: |BaseReport]
`
        });
        
        const params: RenameParams = {
            textDocument: { uri: targetUri },
            position,
            newName: '   '
        };
        
        const edit = await renameSymbol(
            params, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager
        );
        expect(edit).toBeNull();
    });

    it('should handle cross-file rename and produce correct WorkspaceEdit', async () => {
        const { harness, targetUri, position } = await setupHarness({
            'file:///file1.tdl': `
[Report: |BaseReport]
`,
            'file:///file2.tdl': `
[Report: TestReport]
Use: BaseReport
`
        });
        
        const params: RenameParams = {
            textDocument: { uri: targetUri },
            position,
            newName: 'NewReport'
        };
        
        const edit = await renameSymbol(
            params, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader, 
            harness.runtime.services.includeGraphManager
        );
        expect(edit).toBeDefined();
        if (edit?.changes) {
            expect(edit.changes['file:///d%3A/file1.tdl'].length).toBe(1);
            expect(edit.changes['file:///d%3A/file2.tdl'].length).toBe(1);
        }
    });

    describe('prepareRename', () => {
        it('prepareRename > should return valid range and placeholder for definitions', async () => {
        const { harness, targetUri, position } = await setupHarness({
            'file:///test.tdl': `
[Report: |BaseReport]
`
        });
        const params: PrepareRenameParams = {
            textDocument: { uri: targetUri },
            position: position
        };
        
        const result = await prepareRename(
            params,
            harness.runtime.services.documentStateStore,
            harness.documents,
            harness.runtime.services.documentLoader,
            harness.runtime.services.includeGraphManager
        );
        expect(result).toBeDefined();
        expect((result as any)?.placeholder).toBe('BaseReport');
    });

        it('should exclude prefix from range for variables', async () => {
            const { harness, targetUri, position } = await setupHarness({
                'file:///test.tdl': `
[System: Variable]
MyVar : String

[Report: Test]
Local: Field: Default: Set as: ##|MyVar
`
            });
            const params: PrepareRenameParams = {
                textDocument: { uri: targetUri },
                position
            };
            const result = await prepareRename(
                params,
                harness.runtime.services.documentStateStore,
                harness.documents,
                harness.runtime.services.documentLoader,
                harness.runtime.services.includeGraphManager
            ) as any;
            expect(result).toBeDefined();
            expect(result.placeholder).toBe('MyVar');
            
            const range = result.range;
            const doc = harness.documents.get(targetUri)!;
            const rangeText = doc.getText(range);
            expect(rangeText).toBe('MyVar');
        });
    });
    describe('Cross-file rename in closed files', () => {
        it('should preserve # prefix in closed files', async () => {
            const { harness, targetUri, position } = await setupHarness({
                'file:///test.tdl': `
[Field: |MyField]
Set as: "Hello"
`,
                'file:///closed.tdl': `
[Report: Test]
Local: Field: Default: Set as: #MyField
`
            });
            
            const closedUri = 'file:///d%3A/closed.tdl';
            const closedContent = harness.documents.get(closedUri)!.getText();
            harness.documents['docs'].delete(closedUri); // Simulate closed file
            
            const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
                if (path.replace(/\\\\/g, '/').endsWith('closed.tdl')) {
                    return Buffer.from(closedContent, 'utf-8');
                }
                throw new Error('File not found');
            });
            
            const params: RenameParams = {
                textDocument: { uri: targetUri },
                position,
                newName: 'NewField'
            };
            
            const edit = await renameSymbol(
                params, 
                harness.runtime.services.documentStateStore, 
                harness.documents, 
                harness.runtime.services.documentLoader, 
                harness.runtime.services.includeGraphManager
            );
            expect(edit).toBeDefined();
            expect(edit?.changes?.[closedUri]?.[0]?.newText).toBe('NewField');
            expect(edit?.changes?.[closedUri]?.[0]?.range.start.character).toBe(32); 
            
            readFileSpy.mockRestore();
        });

        it('should preserve ## prefix in closed files', async () => {
            const { harness, targetUri, position } = await setupHarness({
                'file:///test.tdl': `
[System: Variable]
|MyVar : String
`,
                'file:///closed.tdl': `
[Report: Test]
Local: Field: Default: Set as: ##MyVar
`
            });
            
            const closedUri = 'file:///d%3A/closed.tdl';
            const closedContent = harness.documents.get(closedUri)!.getText();
            harness.documents['docs'].delete(closedUri); // Simulate closed file
            
            const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
                if (path.replace(/\\\\/g, '/').endsWith('closed.tdl')) {
                    return Buffer.from(closedContent, 'utf-8');
                }
                throw new Error('File not found');
            });
            
            const params: RenameParams = {
                textDocument: { uri: targetUri },
                position,
                newName: 'NewVar'
            };
            
            const edit = await renameSymbol(
                params, 
                harness.runtime.services.documentStateStore, 
                harness.documents, 
                harness.runtime.services.documentLoader, 
                harness.runtime.services.includeGraphManager
            );
            expect(edit).toBeDefined();
            expect(edit?.changes?.[closedUri]?.[0]?.newText).toBe('NewVar');
            expect(edit?.changes?.[closedUri]?.[0]?.range.start.character).toBe(33); // Skip \`##\`
            
            readFileSpy.mockRestore();
        });
    });
});
