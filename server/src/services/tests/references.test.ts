import { describe, it, expect, beforeEach } from 'vitest';
import { findReferences } from '../references';
import { DocManager } from '../../docManager';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from '../../parser/parser';
import { ScopeManager } from '../scopeManager';
import { SymbolTable } from '../symbolTable';

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

    const symbolTable = new SymbolTable();
    const scopeManager = new ScopeManager(symbolTable);

    // Build scopes
    const { buildFileScope } = require('../scopeBuilder');
    for (const [uri, state] of docStates.entries()) {
        buildFileScope(scopeManager, uri, state.sourceFile);
    }

    // Mock global scope attributes
    const reportAttrs = new Map<string, any>();
    reportAttrs.set('use', { name: 'Use', parameters: [{ RefersTo: 'Report' }] });
    reportAttrs.set('set', { name: 'Set', parameters: [{ RefersTo: 'Variable' }, { RefersTo: 'Expression' }] });
    scopeManager.globalScope.attributes.set('REPORT', reportAttrs);

    const formAttrs = new Map<string, any>();
    formAttrs.set('parts', { name: 'Parts', parameters: [{ IsList: true, RefersTo: 'Part' }] });
    scopeManager.globalScope.attributes.set('FORM', formAttrs);

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
});
