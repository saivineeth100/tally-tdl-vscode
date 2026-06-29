import { describe, it, expect } from 'vitest';
import { getDocumentHighlights } from '../documentHighlight';
import { DocManager } from '../../docManager';
import { TextDocuments, Position, DocumentHighlightParams } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from '../../parser/parser';
import { ScopeManager } from '../scopeManager';
import { buildFileScope } from '../scopeManager/scopeBuilder';

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

    const reportAttrs = new Map<string, any>();
    reportAttrs.set('use', { name: 'Use', parameters: [{ RefersTo: 'Report' }] });
    scopeManager.globalScope.attributes.set('report', reportAttrs);

    for (const [uri, state] of docStates.entries()) {
        buildFileScope(scopeManager, uri, state.sourceFile);
    }

    const mockDocManager = {
        get: (uri: string) => docStates.get(uri),
        getAllDocs: () => docStates.entries(),
        getProjectNodes: (uri: string) => new Set(Array.from(docs.keys())),
        getScopeManager: (uri: string) => scopeManager
    } as unknown as DocManager;
    
    return { mockDocs, mockDocManager, targetUri, position };
}

describe('Document Highlight Service', () => {
    it('returns highlights for a definition name and its references within the same file', async () => {
        const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
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
        
        const highlights = await getDocumentHighlights(params, mockDocManager, mockDocs);
        expect(highlights).toBeDefined();
        expect(highlights!.length).toBe(3);
    });

    it('does NOT return highlights from other files', async () => {
        const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
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
        
        const highlights = await getDocumentHighlights(params, mockDocManager, mockDocs);
        expect(highlights).toBeDefined();
        expect(highlights!.length).toBe(2); 
    });

    it('returns empty array when cursor is on whitespace/non-symbol position', async () => {
        const { mockDocs, mockDocManager, targetUri, position } = setupMocks({
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
        
        const highlights = await getDocumentHighlights(params, mockDocManager, mockDocs);
        expect(highlights).toBeDefined();
        expect(highlights!.length).toBe(0);
    });
});
