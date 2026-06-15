import { getMetadata, setMetadata } from '../metadataService';
import { describe, it, expect, beforeEach } from 'vitest';
import { findReferences } from '../references';
import { DocManager } from '../../docManager';
import { TextDocuments } from 'vscode-languageserver';
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
                    { RefersTo: 'Report' } // Alias for Report/Form/etc inheritance
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
    
    return { mockDocs, mockDocManager, targetUri, offset };
}

describe('References Service', () => {
    beforeEach(() => {
        setMetadata(mockMetadata as any);
    });

    it('should find references within same file', () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [Report: TestReport]
                Use: Base|Report
                
                [Report: BaseReport]
                Use: AnotherReport
            `
        });
        
        const refs = findReferences(mockDocManager, mockDocs, targetUri, offset);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2); 
    });

    it('should find references across multiple files', () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///file1.tdl': `
                [Report: |BaseReport]
            `,
            'file:///file2.tdl': `
                [Report: TestReport]
                Use: BaseReport
            `
        });
        
        const refs = findReferences(mockDocManager, mockDocs, targetUri, offset);
        
        expect(refs).toBeDefined();
        expect(refs.length).toBe(2);
    });

    it('should differentiate between definition names and attribute values', () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [Report: |MyReport]
                [Part: MyReport]
            `
        });
        
        const refs = findReferences(mockDocManager, mockDocs, targetUri, offset);
        // Should only match Report: MyReport, not Part: MyReport (unless types mismatch is ignored)
        // Let's see what the implementation does. The targetType is 'Report', so Part: MyReport won't match.
        expect(refs).toBeDefined();
        expect(refs.length).toBe(1);
    });

    it('should not have false positives for substring matches', () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [Report: |BaseReport]
                
                [Report: BaseReport123]
                Use: BaseReport123
            `
        });
        
        const refs = findReferences(mockDocManager, mockDocs, targetUri, offset);
        expect(refs).toBeDefined();
        expect(refs.length).toBe(1); // Only the definition itself
    });

    it('should find variable references', () => {
        const { mockDocs, mockDocManager, targetUri, offset } = setupMocks({
            'file:///test.tdl': `
                [System: Variable]
                MyVar : String
                
                [Report: TestReport]
                Set: MyVar: "Hello"
                Local: Field: Default: Set as: ##|MyVar
            `
        });
        
        const refs = findReferences(mockDocManager, mockDocs, targetUri, offset);
        
        expect(refs).toBeDefined();
        // Variables might not have strict definition tracking without scope manager returning proper scope, but test basic
        expect(refs.length).toBeGreaterThan(0);
    });
});
