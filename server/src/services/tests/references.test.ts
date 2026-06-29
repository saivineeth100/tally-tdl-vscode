import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import { findReferences } from '../references';
import { DocManager } from '../../docManager';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from '../../parser/parser';
import { ScopeManager } from '../scopeManager';
import { buildFileScope } from '../scopeManager/scopeBuilder';

function setupMocks(files: Record<string, string>) {
    const docs = new Map<string, TextDocument>();
    const docStates = new Map<string, any>();
    let targetUri = '';
    let offset = -1;
    
    for (const [uri, content] of Object.entries(files)) {
        const cursorOffset = content.indexOf('|');
        if (cursorOffset !== -1) {
            targetUri = uri;
            offset = cursorOffset;
        }
        const cleanContent = content.replace('|', '');
        
        const doc = TextDocument.create(uri, 'tdl', 1, cleanContent);
        docs.set(uri, doc);
        
        const parser = new Parser(cleanContent);
        const sourceFile = parser.parse();
        
        docStates.set(uri, {
            sourceFile,
            diagnostics: []
        });
    }

    const mockDocs = {
        get: (uri: string) => docs.get(uri)
    } as unknown as TextDocuments<TextDocument>;

        const scopeManager = new ScopeManager();

    // Build scopes and index references
    for (const [uri, state] of docStates.entries()) {
        buildFileScope(scopeManager, uri, state.sourceFile);
        scopeManager.projectScope.referenceIndex.indexFile(uri, state.sourceFile);
    }

    // Mock global scope attributes
    const reportAttrs = new Map<string, any>();
    reportAttrs.set('use', { name: 'Use', parameters: [{ RefersTo: 'Report' }] });
    reportAttrs.set('set', { name: 'Set', parameters: [{ RefersTo: 'Variable' }, { RefersTo: 'Expression' }] });
    scopeManager.globalScope.attributes.set('report', reportAttrs);

    const formAttrs = new Map<string, any>();
    formAttrs.set('parts', { name: 'Parts', parameters: [{ IsList: true, RefersTo: 'Part' }] });
    scopeManager.globalScope.attributes.set('form', formAttrs);

    const fieldAttrs = new Map<string, any>();
    fieldAttrs.set('setas', { name: 'Set as', parameters: [{ RefersTo: 'Expression' }] });
    scopeManager.globalScope.attributes.set('field', fieldAttrs);

    const mockDocManager = {
        get: (uri: string) => docStates.get(uri),
        getAllDocs: () => docStates.entries(),
        getProjectNodes: (uri: string) => new Set(Array.from(docs.keys())),
        getScopeManager: (uri: string) => scopeManager
    } as unknown as DocManager;
    
    return { mockDocs, mockDocManager, targetUri, offset };
}

describe('References Service', () => {

    it('should find references within same file', async () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [Report: TestReport]
                Use: Base|Report
                
                [Report: BaseReport]
                Use: AnotherReport
            `
        });
        
        const refs = await findReferences(mockDocManager, mockDocs, targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2); 
    });

    it('should find references across multiple files', async () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///file1.tdl': `
                [Report: |BaseReport]
            `,
            'file:///file2.tdl': `
                [Report: TestReport]
                Use: BaseReport
            `
        });
        
        const refs = await findReferences(mockDocManager, mockDocs, targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2);
    });

    it('should differentiate between definition names and attribute values', async () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [Report: |MyReport]
                [Part: MyReport]
            `
        });
        
        const refs = await findReferences(mockDocManager, mockDocs, targetUri, offset, true);
        // Should only match Report: MyReport, not Part: MyReport (unless types mismatch is ignored)
        // Let's see what the implementation does. The targetType is 'Report', so Part: MyReport won't match.
        expect(refs).toBeDefined();
        expect(refs.length).toBe(1);
    });

    it('should not have false positives for substring matches', async () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [Report: |BaseReport]
                
                [Report: BaseReport123]
                Use: BaseReport123
            `
        });
        
        const refs = await findReferences(mockDocManager, mockDocs, targetUri, offset, true);
        expect(refs).toBeDefined();
        expect(refs.length).toBe(1); // Only the definition itself
    });

    it('should find variable references', async () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [System: Variable]
                MyVar : String
                
                [Report: TestReport]
                Set: MyVar: "Hello"
                Local: Field: Default: Set as: ##|MyVar
            `
        });
        
        const refs = await findReferences(mockDocManager, mockDocs, targetUri, offset, true);
        
        expect(refs).toBeDefined();
        // Variables might not have strict definition tracking without scope manager returning proper scope, but test basic
        expect(refs.length).toBeGreaterThan(0);
    });
    it('should find references in closed files', async () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
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
        const closedContent = (mockDocs as any).get(closedUri).getText();
        const originalGet = mockDocs.get;
        (mockDocs as any).get = (uri: string) => uri === closedUri ? undefined : originalGet(uri); // It is not open
        
        // Since we mock docStates in mockDocManager.get, it still returns the indexed state for closed.tdl.
        // We must mock fs.promises.readFile so references.ts can read it.
        const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
            if (path.replace(/\\/g, '/').endsWith('closed.tdl')) {
                return Buffer.from(closedContent, 'utf-8');
            }
            throw new Error('File not found');
        });
        
        const refs = await findReferences(mockDocManager, mockDocs, targetUri, offset, true);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2); // Definition + 1 usage
        
        readFileSpy.mockRestore();
    });

    it('should find references in Local attributes', async () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [Field: |MyField]
                Set as: "Hello"
                
                [Report: MyReport]
                Local: Field: MyField: Set as: "World"
            `
        });
        
        const refs = await findReferences(mockDocManager, mockDocs, targetUri, offset, true);
        
        expect(refs).toBeDefined();
        // Should find the definition (1) and the reference inside the Local attribute (1) = 2
        expect(refs.length).toBe(2);
    });
});
