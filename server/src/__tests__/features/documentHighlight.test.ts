import { describe, it, expect } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getDocumentHighlights } from '../../../src/features/documentHighlight';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { DocumentHighlightParams, Position } from 'vscode-languageserver';

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

    for (const [uri, content] of Object.entries(files)) {
        let cleanContent = content;
        if (content.includes('|')) {
            const offset = content.indexOf('|');
            cleanContent = content.replace('|', '');
            targetUri = uri;
            position = TextDocument.create(uri, 'tdl', 1, cleanContent).positionAt(offset);
        }
        
        const fsPath = uri.replace('file:///', ''); // Naive uri to path conversion
        const canonicalPath = harness.files.canonicalize(fsPath);
        
        harness.files.files.set(canonicalPath, cleanContent);
        harness.simulateOpen(uri, 'tdl', cleanContent);
        harness.runtime.documentLifecycle.processPendingDocuments();
    }

    return { harness, targetUri, position };
}

describe('Document Highlight Service', () => {
    it('returns highlights for a definition name and its references within the same file', async () => {
        const { harness, targetUri, position } = await setupHarness({
            'file:///test.tdl': `
[Report: |BaseReport]
Use: BaseReport
Use: BaseReport
`
        });
        
        const params: DocumentHighlightParams = {
            textDocument: { uri: targetUri },
            position
        };
        
        const highlights = await getDocumentHighlights(
            params, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            harness.runtime.services.includeGraphManager
        );
        expect(highlights).toBeDefined();
        expect(highlights!.length).toBe(3);
    });

    it('does NOT return highlights from other files', async () => {
        const { harness, targetUri, position } = await setupHarness({
            'file:///file1.tdl': `
[Report: |TestReport]
Use: TestReport
`,
            'file:///file2.tdl': `
[Report: AnotherReport]
Use: TestReport
`
        });
        
        const params: DocumentHighlightParams = {
            textDocument: { uri: targetUri },
            position
        };
        
        const highlights = await getDocumentHighlights(
            params, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            harness.runtime.services.includeGraphManager
        );
        expect(highlights).toBeDefined();
        expect(highlights!.length).toBe(2); 
    });

    it('returns empty array when cursor is on whitespace/non-symbol position', async () => {
        const { harness, targetUri, position } = await setupHarness({
            'file:///test.tdl': `
[Report: BaseReport]
|   
Use: BaseReport
`
        });
        
        const params: DocumentHighlightParams = {
            textDocument: { uri: targetUri },
            position
        };
        
        const highlights = await getDocumentHighlights(
            params, 
            harness.runtime.services.documentStateStore, 
            harness.documents, 
            harness.runtime.services.documentLoader,
            harness.runtime.services.includeGraphManager
        );
        expect(highlights).toBeDefined();
        expect(highlights!.length).toBe(0);
    });
});

