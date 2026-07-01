import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renameSymbol, prepareRename } from '../../features/rename';
import { DocManager } from '../../docManager';
import { TextDocuments, Position, RenameParams, PrepareRenameParams } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from '../../core/parser/parser';
import { ScopeManager } from '../../semantics/scopeManager';
import { buildFileScope } from '../../semantics/scopeManager/scopeBuilder';
import * as fs from 'fs';

function setupMocks(files: Record<string, string>) {
    const docs = new Map<string, TextDocument>();
    const docStates = new Map<string, any>();
    let targetUri = '';
    let position = Position.create(0, 0);
    
    for (const [uri, content] of Object.entries(files)) {
        const lines = content.split('\n');
        let cursorLine = -1;
        let cursorChar = -1;
        for (let i = 0; i < lines.length; i++) {
            const idx = lines[i].indexOf('|');
            if (idx !== -1) {
                cursorLine = i;
                cursorChar = idx;
                targetUri = uri;
                break;
            }
        }
        
        const cleanContent = content.replace('|', '');
        
        const doc = TextDocument.create(uri, 'tdl', 1, cleanContent);
        docs.set(uri, doc);
        
        if (targetUri === uri && cursorLine !== -1) {
            position = Position.create(cursorLine, cursorChar);
        }
        
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


    const mockDocManager = {
        get: (uri: string) => docStates.get(uri),
        getAllDocs: () => docStates.entries(),
        getProjectNodes: (uri: string) => new Set(Array.from(docs.keys())),
        getScopeManager: (uri: string) => scopeManager} as unknown as DocManager;
    
    return { mockDocs, mockDocManager, targetUri, position };
}

describe('Rename Service', () => {

    it('should rename definition and update all references', async () => {
        const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
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
        
        const edit = await renameSymbol(params, mockDocManager, mockDocs);
        
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
        const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
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
        
        const edit = await renameSymbol(params, mockDocManager, mockDocs);
        
        expect(edit).toBeDefined();
        if (edit?.changes) {
            const edits = edit.changes[targetUri];
            expect(edits.length).toBe(3);
            
            const doc = mockDocs.get(targetUri)!;
            const originalTexts = edits.map(e => doc.getText(e.range));
            
            expect(originalTexts).toContain('MyVar');
            expect(originalTexts).not.toContain('##MyVar');
        }
    });

    it('should return null if new name is empty', async () => {
        const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
            'file:///test.tdl': `
[Report: |BaseReport]
`
        });
        
        const params: RenameParams = {
            textDocument: { uri: targetUri },
            position,
            newName: '   '
        };
        
        const edit = await renameSymbol(params, mockDocManager, mockDocs);
        expect(edit).toBeNull();
    });

    it('should handle cross-file rename and produce correct WorkspaceEdit', async () => {
        const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
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
        
        const edit = await renameSymbol(params, mockDocManager, mockDocs);
        expect(edit).toBeDefined();
        if (edit?.changes) {
            expect(edit.changes['file:///file1.tdl'].length).toBe(1);
            expect(edit.changes['file:///file2.tdl'].length).toBe(1);
        }
    });

    describe('prepareRename', () => {
        it('should return valid range and placeholder for definitions', () => {
            const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
                'file:///test.tdl': `
[Report: |BaseReport]
`
            });
            const params: PrepareRenameParams = {
                textDocument: { uri: targetUri },
                position
            };
            const result = prepareRename(params, mockDocManager, mockDocs) as any;
            expect(result).toBeDefined();
            expect(result.placeholder).toBe('BaseReport');
        });

        it('should exclude prefix from range for variables', () => {
            const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
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
            const result = prepareRename(params, mockDocManager, mockDocs) as any;
            expect(result).toBeDefined();
            expect(result.placeholder).toBe('MyVar');
            
            const range = result.range;
            const doc = mockDocs.get(targetUri)!;
            const rangeText = doc.getText(range);
            expect(rangeText).toBe('MyVar');
        });
    });
    describe('Cross-file rename in closed files', () => {
        it('should preserve # prefix in closed files', async () => {
            const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
                'file:///test.tdl': `
[Field: |MyField]
Set as: "Hello"
`,
                'file:///closed.tdl': `
[Report: Test]
Local: Field: Default: Set as: #MyField
`
            });
            
            const closedUri = 'file:///closed.tdl';
            const closedContent = (mockDocs as any).get(closedUri).getText();
            const originalGet1 = mockDocs.get;
            (mockDocs as any).get = (uri: string) => uri === closedUri ? undefined : originalGet1(uri);
            
            const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
                if (path.replace(/\\/g, '/').endsWith('closed.tdl')) {
                    return Buffer.from(closedContent, 'utf-8');
                }
                throw new Error('File not found');
            });
            
            const params: RenameParams = {
                textDocument: { uri: targetUri },
                position,
                newName: 'NewField'
            };
            
            const edit = await renameSymbol(params, mockDocManager, mockDocs);
            expect(edit).toBeDefined();
            expect(edit?.changes?.[closedUri]?.[0]?.newText).toBe('NewField');
            expect(edit?.changes?.[closedUri]?.[0]?.range.start.character).toBe(32); 
            
            readFileSpy.mockRestore();
        });

        it('should preserve ## prefix in closed files', async () => {
            const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
                'file:///test.tdl': `
[System: Variable]
|MyVar : String
`,
                'file:///closed.tdl': `
[Report: Test]
Local: Field: Default: Set as: ##MyVar
`
            });
            
            const closedUri = 'file:///closed.tdl';
            const closedContent = (mockDocs as any).get(closedUri).getText();
            const originalGet2 = mockDocs.get;
            (mockDocs as any).get = (uri: string) => uri === closedUri ? undefined : originalGet2(uri);
            
            const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
                if (path.replace(/\\/g, '/').endsWith('closed.tdl')) {
                    return Buffer.from(closedContent, 'utf-8');
                }
                throw new Error('File not found');
            });
            
            const params: RenameParams = {
                textDocument: { uri: targetUri },
                position,
                newName: 'NewVar'
            };
            
            const edit = await renameSymbol(params, mockDocManager, mockDocs);
            expect(edit).toBeDefined();
            expect(edit?.changes?.[closedUri]?.[0]?.newText).toBe('NewVar');
            expect(edit?.changes?.[closedUri]?.[0]?.range.start.character).toBe(33); // Skip `##`
            
            readFileSpy.mockRestore();
        });
    });
});
