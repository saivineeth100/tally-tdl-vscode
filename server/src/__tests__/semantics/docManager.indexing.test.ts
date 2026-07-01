import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DocManager } from '../../docManager';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import fs from 'fs';
import { normalizeUri } from '../../utils/uri';

describe('DocManager indexed document state', () => {
    let docManager: DocManager;
    let mockConnection: any;
    let mockDocuments: any;
    
    beforeEach(() => {
        mockConnection = {
            console: { log: vi.fn(), warn: vi.fn(), error: vi.fn(), info: vi.fn() },
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

    afterEach(() => {
        vi.restoreAllMocks();
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
        
        expect(docManager.getIndexed(uriOutside)).toBeDefined();
    });

    describe('indexFile caching (mtime)', () => {
        it('skips re-reading when file mtime is unchanged', async () => {
            const fsPath = __filename;
            const uri = URI.file(fsPath).toString();
            
            // Mock stat to return constant mtime
            vi.spyOn(fs.promises, 'stat').mockResolvedValue({ mtimeMs: 12345 } as any);
            // Mock readFile to monitor calls
            const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from(''));
            
            await docManager.indexFile(fsPath);
            expect(readFileSpy).toHaveBeenCalledTimes(1);
            
            // Should skip the second time
            await docManager.indexFile(fsPath);
            expect(readFileSpy).toHaveBeenCalledTimes(1); // Call count remains 1
        });

        it('re-reads when mtime changes', async () => {
            const fsPath = __filename;
            const uri = URI.file(fsPath).toString();
            
            const statSpy = vi.spyOn(fs.promises, 'stat');
            statSpy.mockResolvedValueOnce({ mtimeMs: 1000 } as any);
            statSpy.mockResolvedValueOnce({ mtimeMs: 2000 } as any); // Changed
            
            const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockResolvedValue(Buffer.from(''));
            
            await docManager.indexFile(fsPath);
            expect(readFileSpy).toHaveBeenCalledTimes(1);
            
            // Should re-read
            await docManager.indexFile(fsPath);
            expect(readFileSpy).toHaveBeenCalledTimes(2);
        });

        it('rebuild doesn\'t trigger cascading indexFile calls for unchanged includes', async () => {
            const fsPath = __filename;
            const doc = TextDocument.create('file:///main.tdl', 'tally', 1, '[Include: test.tdl]');
            
            // Mock indexFile behavior to register it in includeGraph (which actual indexFile does)
            const indexFileSpy = vi.spyOn(docManager as any, 'indexFile').mockImplementation(async (fsPath: any) => {
                (docManager as any).includeGraph.set(normalizeUri(URI.file(fsPath).toString()), new Set());
            });
            
            docManager.resolveIncludePath = () => fsPath;
            
            // Mock cached timestamps so it thinks the file hasn't changed
            (docManager as any).fileTimestamps = new Map([[normalizeUri(URI.file(fsPath).toString()), 1000]]);
            vi.spyOn(fs, 'statSync').mockReturnValue({ mtimeMs: 1000 } as any);

            await docManager.rebuild(doc);
            
            expect(indexFileSpy).toHaveBeenCalledTimes(1);
            
            // Second rebuild
            await docManager.rebuild(doc);
            expect(indexFileSpy).toHaveBeenCalledTimes(1);
        });

        it('should handle Windows case-insensitive paths correctly in project nodes', async () => {
            const fsPathUppercase = '/C:/Program Files/Test/FuncContextKeyword.txt';
            const uriUppercase = URI.file(fsPathUppercase).toString();

            const doc = TextDocument.create('file:///c%3a/program%20files/test/rel1.5.txt', 'tally', 1, '[Include: FuncContextKeyword.txt]');
            
            // Mock resolveIncludePath to return uppercase path
            docManager.resolveIncludePath = () => fsPathUppercase;

            vi.spyOn(docManager as any, 'indexFile').mockImplementation(async (fsPath: any) => {
                (docManager as any).includeGraph.set(normalizeUri(URI.file(fsPath).toString()), new Set());
            });

            await docManager.rebuild(doc);

            // getProjectNodes is called with the lowercased document URI and should return the lowercase URI of the included file
            const nodes = docManager.getProjectNodes(doc.uri);
            expect(nodes.has(normalizeUri(uriUppercase))).toBe(true);
            expect(nodes.has(normalizeUri(doc.uri))).toBe(true);

            // Verify isUriActive handles lowercase docs correctly
            expect(docManager.isUriActive(uriUppercase)).toBe(true);
            expect(docManager.isUriActive(doc.uri)).toBe(true);
        });
    });
});
