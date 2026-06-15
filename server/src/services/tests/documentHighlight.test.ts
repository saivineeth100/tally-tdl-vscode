import { getMetadata, setMetadata } from '../metadataService';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getDocumentHighlights } from '../documentHighlight';
import { DocumentHighlightParams } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager } from '../../docManager';
import { TextDocuments } from 'vscode-languageserver';
import { TdlMetadata } from '../../tdlMetaData';

describe('Document Highlights', () => {
    let mockConnection: any;
    let mockDocuments: TextDocuments<TextDocument>;
    let docManager: DocManager;

    beforeEach(() => {
        mockConnection = {
            console: { log: vi.fn(), error: vi.fn(), warn: vi.fn() },
            sendDiagnostics: vi.fn()
        };
        mockDocuments = new TextDocuments(TextDocument);
        
        docManager = new DocManager(mockConnection, mockDocuments);

        setMetadata({
            definitions: new Map([
                ['Report', [{ Name: 'Form' }]],
                ['Form', [{ Name: 'Parts' }, { Name: 'Part' }]]
            ]),
            schemas: new Map(),
            existingDefinitions: new Map(),
            findDefinition: vi.fn((name: string) => {
                if (name.toLowerCase() === 'form') {
                    return { Name: 'Form', Parameters: [{ RefersTo: 'Form' }] };
                }
                return undefined;
            })
        } as unknown as TdlMetadata);
    });

    async function setup(tdl: string) {
        const uri = 'file:///test.tdl';
        const document = TextDocument.create(uri, 'tdl', 1, tdl);
        
        mockDocuments.get = vi.fn().mockReturnValue(document);
        
        await docManager.rebuild(document);
        
        return { uri, document };
    }

    it('Highlights all occurrences of word in document', async () => {
        const tdl = `[Report: TestReport]\nForm: MyForm\n\n[Form: MyForm]\nPart: SomePart`;
        const { uri, document } = await setup(tdl);
        
        const offset = tdl.indexOf('MyForm');
        
        const params: DocumentHighlightParams = {
            textDocument: { uri },
            position: document.positionAt(offset)
        };
        
        const highlights = getDocumentHighlights(params, docManager, mockDocuments);
        
        expect(highlights.length).toBe(2);
    });

    it('No highlights for unmatched words', async () => {
        const tdl = `;; A comment here`;
        const { uri, document } = await setup(tdl);
        
        const params: DocumentHighlightParams = {
            textDocument: { uri },
            position: document.positionAt(5)
        };
        
        const highlights = getDocumentHighlights(params, docManager, mockDocuments);
        
        expect(highlights.length).toBe(0);
    });

    it('Handles cursor at definition vs reference', async () => {
        const tdl = `[Report: TestReport]\nForm: MyForm\n\n[Form: MyForm]`;
        const { uri, document } = await setup(tdl);
        
        const refOffset = tdl.indexOf('MyForm');
        const refParams: DocumentHighlightParams = {
            textDocument: { uri },
            position: document.positionAt(refOffset)
        };
        const refHighlights = getDocumentHighlights(refParams, docManager, mockDocuments);
        
        const defOffset = tdl.lastIndexOf('MyForm');
        const defParams: DocumentHighlightParams = {
            textDocument: { uri },
            position: document.positionAt(defOffset)
        };
        const defHighlights = getDocumentHighlights(defParams, docManager, mockDocuments);
        
        expect(refHighlights.length).toBe(2);
        expect(defHighlights.length).toBe(2);
        
        // The ranges might be in different order, but their contents should be the same
        expect(refHighlights.map(h => h.range.start.line).sort()).toEqual(defHighlights.map(h => h.range.start.line).sort());
    });
});
