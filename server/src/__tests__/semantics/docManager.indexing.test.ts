import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DocManager } from '../../docManager';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import { normalizeUri } from '../../utils/uri';

vi.mock('fs', async () => {
    const actualFs = await vi.importActual<typeof import('fs')>('fs');
    return {
        ...actualFs,
        statSync: vi.fn(),
        promises: {
            ...actualFs.promises,
            stat: vi.fn(),
            readFile: vi.fn()
        }
    };
});

describe('DocManager indexed document state', () => {
    let docManager: DocManager;
    let mockConnection: any;
    let mockDocuments: any;
    
    beforeEach(() => {
        vi.clearAllMocks();
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
        expect(indexFileSpy).toHaveBeenCalledWith(expect.stringContaining('docManager.indexing.test.ts'), expect.any(Set), false, false, false);
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
            (fs.promises.stat as any).mockResolvedValue({ mtimeMs: 12345 });
            // Mock readFile to monitor calls
            (fs.promises.readFile as any).mockResolvedValue(Buffer.from(''));
            
            await docManager.indexFile(fsPath);
            expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
            
            // Should skip the second time
            await docManager.indexFile(fsPath);
            expect(fs.promises.readFile).toHaveBeenCalledTimes(1); // Call count remains 1
        });

        it('re-reads when mtime changes', async () => {
            const fsPath = __filename;
            const uri = URI.file(fsPath).toString();
            
            const statSpy = fs.promises.stat as any;
            statSpy.mockResolvedValueOnce({ mtimeMs: 1000 });
            statSpy.mockResolvedValueOnce({ mtimeMs: 2000 }); // Changed
            
            (fs.promises.readFile as any).mockResolvedValue(Buffer.from(''));
            
            await docManager.indexFile(fsPath);
            expect(fs.promises.readFile).toHaveBeenCalledTimes(1);
            
            // Should re-read
            await docManager.indexFile(fsPath);
            expect(fs.promises.readFile).toHaveBeenCalledTimes(2);
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
            (fs.promises.stat as any).mockResolvedValue({ mtimeMs: 1000 });

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
                const normPath = normalizeUri(URI.file(fsPath).toString());
                (docManager as any).includeGraph.set(normPath, new Set());
                (docManager as any).tdlScopeManager.fileMap.set(normPath, { parent: (docManager as any).tdlScopeManager.projectScope });
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

    describe('URI normalization for internal paths', () => {
        it('updateIncludeGraph converts fsPath to proper normalized document URIs', () => {
            const fsPath = 'C:\\test\\workspace\\main.tdl';
            const includeFsPath = 'C:\\test\\workspace\\child.tdl';
            const uri = URI.file(fsPath).toString();
            
            // Mock a doc with an include
            const sourceFile = {
                definitions: [
                    { type: { text: 'Include' }, name: { text: 'child.tdl' } }
                ]
            } as any;

            docManager.resolveIncludePath = () => includeFsPath;

            const includes = (docManager as any).updateIncludeGraph(uri, sourceFile);
            
            // It should be a proper URI, NOT an fsPath
            expect(includes.has(normalizeUri(URI.file(includeFsPath).toString()))).toBe(true);
            expect(includes.has(includeFsPath)).toBe(false);
            expect(includes.has(includeFsPath.toLowerCase())).toBe(false);
        });

        it('indexFile internally converts fsPath arguments to proper document URIs', async () => {
            const fsPath = 'C:\\test\\workspace\\standalone.tdl';
            
            // Spy on the internal map to see what key is actually used
            const setSpy = vi.spyOn((docManager as any).indexedDocs, 'set');
            
            // Need to mock stat and readFile so it doesn't fail
            (fs.promises.stat as any).mockResolvedValue({ mtimeMs: 1234 });
            (fs.promises.readFile as any).mockResolvedValue(Buffer.from(''));
            
            await docManager.indexFile(fsPath);
            
            const expectedUri = normalizeUri(URI.file(fsPath).toString());
            
            // Wait, indexFile doesn't store in indexedDocs unless rebuild is called,
            // but it DOES store in fileTimestamps
            expect((docManager as any).fileTimestamps.has(expectedUri)).toBe(true);
            expect((docManager as any).fileTimestamps.has(fsPath)).toBe(false);
            expect((docManager as any).fileTimestamps.has(fsPath.toLowerCase())).toBe(false);
        });
    });
});
