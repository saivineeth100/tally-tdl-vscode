import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocManager } from '../../docManager';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import * as fs from 'fs';

describe('DocManager indexed document state', () => {
    let docManager: DocManager;
    let mockConnection: any;
    let mockDocuments: any;
    
    beforeEach(() => {
        mockConnection = {
            console: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
            sendDiagnostics: vi.fn()
        };
        mockDocuments = {
            onDidOpen: vi.fn(),
            onDidChangeContent: vi.fn(),
            onDidClose: vi.fn(),
            get: vi.fn()
        };
        docManager = new DocManager(mockConnection, mockDocuments);
    });

    it('get() returns open doc state first', () => {
        const uri = 'file:///test.tdl';
        const openState = { sourceFile: { definitions: [] } } as any;
        const indexedState = { sourceFile: { definitions: [{ type: { text: 'Report' } }] } } as any;
        
        (docManager as any).docs.set(uri, openState);
        (docManager as any).indexedDocs.set(uri, indexedState);
        
        expect(docManager.get(uri)).toBe(openState);
        expect(docManager.getOpen(uri)).toBe(openState);
    });

    it('get() falls back to indexed state for closed files', () => {
        const uri = 'file:///test.tdl';
        const indexedState = { sourceFile: { definitions: [{ type: { text: 'Report' } }] } } as any;
        
        (docManager as any).indexedDocs.set(uri, indexedState);
        
        expect(docManager.get(uri)).toBe(indexedState);
        expect(docManager.getIndexed(uri)).toBe(indexedState);
        expect(docManager.getOpen(uri)).toBeUndefined();
    });

    it('indexed state is removed when file is opened', () => {
        const uri = 'file:///test.tdl';
        const indexedState = { sourceFile: { definitions: [{ type: { text: 'Report' } }] } } as any;
        (docManager as any).indexedDocs.set(uri, indexedState);
        
        // Find the onDidOpen handler registered by DocManager constructor
        const onDidOpenHandler = mockDocuments.onDidOpen.mock.calls[0][0];
        
        const doc = TextDocument.create(uri, 'tally', 1, '');
        // Stub rebuild to avoid complex parser operations during this test
        vi.spyOn(docManager as any, 'rebuild').mockImplementation(() => {});
        
        onDidOpenHandler({ document: doc });
        
        expect(docManager.getIndexed(uri)).toBeUndefined();
    });

    it('closing a file re-indexes from disk', async () => {
        const fsPath = __filename;
        const uri = URI.file(fsPath).toString();
        
        // Spy on indexFile
        const indexFileSpy = vi.spyOn(docManager as any, 'indexFile').mockResolvedValue(undefined);
        
        // Find the onDidClose handler
        const onDidCloseHandler = mockDocuments.onDidClose.mock.calls[0][0];
        
        const doc = TextDocument.create(uri, 'tally', 1, '');
        (docManager as any).docs.set(uri, {} as any); // mock it being open
        
        await onDidCloseHandler({ document: doc });
        
        expect((docManager as any).docs.has(uri)).toBe(false);
        expect(indexFileSpy).toHaveBeenCalledWith(expect.stringContaining('docManager.indexing.test.ts'), expect.any(Set));
    });

    it('clearFolderSymbols removes indexed docs', () => {
        const folderPath = URI.parse('file:///folder').fsPath;
        const uriInside = 'file:///folder/test.tdl';
        const uriOutside = 'file:///other/test.tdl';
        
        (docManager as any).indexedDocs.set(uriInside, {} as any);
        (docManager as any).indexedDocs.set(uriOutside, {} as any);
        
        docManager.clearFolderSymbols(folderPath);
        
        expect(docManager.getIndexed(uriInside)).toBeUndefined();
        expect(docManager.getIndexed(uriOutside)).toBeDefined();
    });
});
