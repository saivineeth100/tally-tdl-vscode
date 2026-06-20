import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DocManager } from '../../docManager';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs to control what scanDirectory finds
vi.mock('fs', async () => {
    const actualFs = await vi.importActual<typeof import('fs')>('fs');
    return {
        ...actualFs,
        promises: {
            ...actualFs.promises,
            readdir: vi.fn(),
            access: vi.fn(),
            readFile: vi.fn()
        },
        existsSync: vi.fn()
    };
});



describe('Workspace scan and Folder cleanup', () => {
    let docManager: DocManager;
    let mockConnection: any;
    let mockDocuments: any;
    
    beforeEach(() => {
        vi.clearAllMocks();
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
        
        // Disable real indexing so tests run fast
        vi.spyOn(docManager, 'indexFile').mockResolvedValue(undefined);
    });

    describe('Workspace scan', () => {
        it('indexes standalone .tdl files not referenced by .tpj', async () => {
            const folderPath = 'd:\\test-workspace';
            
            // Mock readdir to return a .tdl file and a .txt file
            (fs.promises.readdir as any).mockResolvedValue([
                { name: 'standalone.tdl', isDirectory: () => false, isFile: () => true },
                { name: 'docs.txt', isDirectory: () => false, isFile: () => true }
            ]);

            await (docManager as any).scanFolder(URI.file(folderPath).toString());

            expect(docManager.indexFile).toHaveBeenCalledTimes(2);
            expect(docManager.indexFile).toHaveBeenCalledWith(path.join(folderPath, 'standalone.tdl'), expect.any(Set));
            expect(docManager.indexFile).toHaveBeenCalledWith(path.join(folderPath, 'docs.txt'), expect.any(Set));
        });

        it('does not double-index files referenced by .tpj AND found standalone', async () => {
            const folderPath = 'd:\\test-workspace';
            
            // Mock readdir to return a .tpj file and the .tdl file it references
            (fs.promises.readdir as any).mockResolvedValue([
                { name: 'project.tpj', isDirectory: () => false, isFile: () => true },
                { name: 'referenced.tdl', isDirectory: () => false, isFile: () => true }
            ]);
            
            // Mock TPJ content reading
            (fs.promises.readFile as any).mockResolvedValue(`project file=referenced.tdl`);

            // When indexFile is called by parseProjectFile, we want it to just succeed
            // The file should NOT be indexed again by the loop because it's in the visited set
            
            await (docManager as any).scanFolder(URI.file(folderPath).toString());
            
            // It should be called ONCE for the tpj reference, and NOT AGAIN when scanDirectory sees 'referenced.tdl'
            expect(docManager.indexFile).toHaveBeenCalledTimes(1);
            expect(docManager.indexFile).toHaveBeenCalledWith(path.join(folderPath, 'referenced.tdl'), expect.any(Set));
        });
    });

    describe('Folder cleanup', () => {
        it('clearFolderSymbols removes ScopeManager scopes for folder URIs', () => {
            const folderPath = 'd:\\test-workspace\\folder1';
            const uri1 = URI.file(path.join(folderPath, 'file1.tdl')).toString();
            const uri2 = URI.file('d:\\test-workspace\\folder2\\file2.tdl').toString();
            
            // Add fake files to scope managers
            docManager.tdlScopeManager.fileMap.set(uri1, { id: 'file1', kind: 3 } as any);
            docManager.tdlScopeManager.fileMap.set(uri2, { id: 'file2', kind: 3 } as any);
            
            vi.spyOn(docManager.tdlScopeManager, 'removeFileScope');
            
            docManager.clearFolderSymbols(folderPath);
            
            // Should only remove uri1
            expect(docManager.tdlScopeManager.removeFileScope).toHaveBeenCalledWith(uri1);
            expect(docManager.tdlScopeManager.removeFileScope).not.toHaveBeenCalledWith(uri2);
        });

        it('clearFolderSymbols cleans parent graph entries pointing to folder', () => {
            const folderPath = 'd:\\test-workspace\\folder1';
            const uriInside = URI.file(path.join(folderPath, 'file1.tdl')).toString();
            const uriOutside = URI.file('d:\\test-workspace\\folder2\\file2.tdl').toString();
            
            // uriOutside includes uriInside
            (docManager as any).includeGraph.set(uriOutside, new Set([uriInside, 'some-other-uri']));
            
            docManager.clearFolderSymbols(folderPath);
            
            // The set should no longer contain uriInside
            const children = (docManager as any).includeGraph.get(uriOutside);
            expect(children?.has(uriInside)).toBe(false);
            expect(children?.has('some-other-uri')).toBe(true);
        });

        it('revalidateAll skips deleted files gracefully', async () => {
            const uri1 = URI.file('d:\\test-workspace\\exists.tdl').toString();
            const uri2 = URI.file('d:\\test-workspace\\deleted.tdl').toString();
            
            (docManager as any).includeGraph.set(uri1, new Set());
            (docManager as any).includeGraph.set(uri2, new Set());
            
            // Mock access to throw for deleted.tdl
            (fs.promises.access as any).mockImplementation(async (fsPath: string) => {
                if (fsPath.includes('deleted')) throw new Error('ENOENT');
            });

            await docManager.revalidateAll([]);
            
            expect(docManager.indexFile).toHaveBeenCalledTimes(1);
            expect(docManager.indexFile).toHaveBeenCalledWith(expect.stringContaining('exists.tdl'), expect.any(Set));
        });
    });
});
