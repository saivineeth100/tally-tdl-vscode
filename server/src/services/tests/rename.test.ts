import { describe, it, expect, beforeEach } from 'vitest';
import { renameSymbol, prepareRename } from '../rename';
import { DocManager } from '../../docManager';
import { TextDocuments, Position, RenameParams, PrepareRenameParams } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from '../../parser/parser';

const mockMetadata = {
    findDefinition: (name: string, type?: string) => {
        if (name.toLowerCase() === 'parts') {
            return {
                Name: 'Part',
                Parameters: [
                    { IsList: true, RefersTo: 'Part' }
                ]
            };
        }
        if (name.toLowerCase() === 'use') {
            return {
                Name: 'Use',
                Parameters: [
                    { RefersTo: 'Report' }
                ]
            };
        }
        if (name.toLowerCase() === 'set') {
            return {
                Name: 'Set',
                Parameters: [
                    { RefersTo: 'Variable' },
                    { RefersTo: 'Expression' }
                ]
            };
        }
        return undefined;
    },
    actions: []
} as any;

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

    const mockDocManager = {
        get: (uri: string) => docStates.get(uri),
        getAllDocs: () => docStates.entries(),
        getScopeManager: (uri: string) => ({
            getVariableScope: () => null,
            getVariables: () => [],
            getScopeAt: (uri: string, offset: number) => ({}),
            resolve: (name: string, scope: any) => ({ definitionType: 'Variable' })
        })
    } as unknown as DocManager;
    
    return { mockDocs, mockDocManager, targetUri, position };
}

describe('Rename Service', () => {
    beforeEach(() => {
        (globalThis as any).TDL_METADATA = mockMetadata;
    });

    it('should rename definition and update all references', () => {
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
        
        const edit = renameSymbol(params, mockDocManager, mockDocs);
        
        expect(edit).toBeDefined();
        expect(edit?.changes).toBeDefined();
        if (edit?.changes) {
            const edits = edit.changes[targetUri];
            expect(edits.length).toBe(2);
            expect(edits[0].newText).toBe('NewReport');
            expect(edits[1].newText).toBe('NewReport');
        }
    });

    it('should preserve prefixes for variables', () => {
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
        
        const edit = renameSymbol(params, mockDocManager, mockDocs);
        
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

    it('should reject empty names', () => {
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
        
        const edit = renameSymbol(params, mockDocManager, mockDocs);
        expect(edit).toBeNull();
    });

    it('should handle cross-file rename and produce correct WorkspaceEdit', () => {
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
        
        const edit = renameSymbol(params, mockDocManager, mockDocs);
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
});
