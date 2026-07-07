import { describe, it, expect, beforeEach, vi } from 'vitest';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import * as path from 'path';
import { logger } from '../../logger';
import { ServerTestHarness } from '../harness/serverTestHarness';

// Mock fs to control what scanDirectoryForProjects / scanDirectoryForStandaloneFiles find
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
        existsSync: vi.fn().mockReturnValue(true)
    };
});

describe('Workspace scan and Folder cleanup', () => {
    let harness: ServerTestHarness;
    
    beforeEach(() => {
        vi.clearAllMocks();
        harness = new ServerTestHarness();
        
        // Disable real indexing so tests run fast
        vi.spyOn(harness.runtime.services.workspaceScanner, 'indexFile').mockResolvedValue(undefined);
    });

    describe('Workspace scan', () => {
        it('indexes standalone .tdl files not referenced by .tpj', async () => {
            const folderPath = 'd:\\test-workspace';
            
            // Mock readdir to return a .tdl file and a .txt file
            (fs.promises.readdir as any).mockResolvedValue([
                { name: 'standalone.tdl', isDirectory: () => false, isFile: () => true },
                { name: 'docs.txt', isDirectory: () => false, isFile: () => true }
            ]);

            const standalonePath = path.resolve(folderPath, 'standalone.tdl');
            const docsPath = path.resolve(folderPath, 'docs.txt');
            harness.files.files.set(harness.files.canonicalize(standalonePath), '');
            harness.files.files.set(harness.files.canonicalize(docsPath), '');

            const indexFileSpy = vi.spyOn(harness.runtime.services.workspaceScanner, 'indexFile');
            await (harness.runtime.services.workspaceScanner as any)['scanFolder'](URI.file(folderPath).toString());

            expect(indexFileSpy).toHaveBeenCalledTimes(2);
            expect(indexFileSpy).toHaveBeenCalledWith(path.join(folderPath, 'standalone.tdl'), expect.any(Set), true, false, false);
            expect(indexFileSpy).toHaveBeenCalledWith(path.join(folderPath, 'docs.txt'), expect.any(Set), true, false, false);
        });

        it('does not double-index files referenced by .tpj AND found standalone', async () => {
            const folderPath = 'd:\\test-workspace';
            
            // Mock readdir to return a .tpj file and the .tdl file it references
            (fs.promises.readdir as any).mockResolvedValue([
                { name: 'project.tpj', isDirectory: () => false, isFile: () => true },
                { name: 'referenced.tdl', isDirectory: () => false, isFile: () => true }
            ]);
            
            // Mock TPJ content via InMemoryFileAccess (parseProjectFile uses fileAccess.readFile)
            const tpjPath = path.resolve(folderPath, 'project.tpj');
            const refPath = path.resolve(folderPath, 'referenced.tdl');
            harness.files.files.set(harness.files.canonicalize(tpjPath), `project file=referenced.tdl`);
            // Referenced file must exist in fileAccess so fileAccess.exists() returns true
            harness.files.files.set(harness.files.canonicalize(refPath), ``);
            
            const indexFileSpy = vi.spyOn(harness.runtime.services.workspaceScanner, 'indexFile');
            await (harness.runtime.services.workspaceScanner as any)['scanFolder'](URI.file(folderPath).toString());
            
            expect(indexFileSpy).toHaveBeenCalledTimes(1);
            expect(indexFileSpy).toHaveBeenCalledWith(path.join(folderPath, 'referenced.tdl'), expect.any(Set), true, false, true);
        });
    });

    describe('Folder cleanup', () => {
        it('clearFolderSymbols removes ScopeManager scopes for folder URIs', () => {
            const folderPath = 'd:\\test-workspace\\folder1';
            const uri1 = URI.file(path.join(folderPath, 'file1.tdl')).toString();
            const uri2 = URI.file('d:\\test-workspace\\folder2\\file2.tdl').toString();
            
            // Add fake files to scope managers
            harness.runtime.services.documentStateStore.tdlScopeManager.fileMap.set(uri1, { id: 'file1', kind: 3 } as any);
            harness.runtime.services.documentStateStore.tdlScopeManager.fileMap.set(uri2, { id: 'file2', kind: 3 } as any);
            
            vi.spyOn(harness.runtime.services.documentStateStore.tdlScopeManager, 'removeFileScope');
            
            harness.runtime.services.workspaceScanner.clearFolderSymbols(folderPath);
            
            // Should only remove uri1
            expect(harness.runtime.services.documentStateStore.tdlScopeManager.removeFileScope).toHaveBeenCalledWith(uri1);
            expect(harness.runtime.services.documentStateStore.tdlScopeManager.removeFileScope).not.toHaveBeenCalledWith(uri2);
        });

        it('clearFolderSymbols cleans parent graph entries pointing to folder', () => {
            const folderPath = 'd:\\test-workspace\\folder1';
            const uriInside = URI.file(path.join(folderPath, 'file1.tdl')).toString();
            const uriOutside = URI.file('d:\\test-workspace\\folder2\\file2.tdl').toString();
            
            // uriOutside includes uriInside
            harness.runtime.services.includeGraphManager.includeGraph.set(uriOutside, new Set([uriInside, 'some-other-uri']));
            
            harness.runtime.services.workspaceScanner.clearFolderSymbols(folderPath);
            
            // The set should no longer contain uriInside
            const children = harness.runtime.services.includeGraphManager.includeGraph.get(uriOutside);
            expect(children?.has(uriInside)).toBe(false);
            expect(children?.has('some-other-uri')).toBe(true);
        });

        it('revalidateAll skips deleted files gracefully', async () => {
            const uri1 = URI.file('d:\\test-workspace\\exists.tdl').toString();
            const uri2 = URI.file('d:\\test-workspace\\deleted.tdl').toString();
            
            harness.runtime.services.includeGraphManager.tpjFiles.add(uri1);
            harness.runtime.services.includeGraphManager.tpjFiles.add(uri2);
            harness.runtime.services.includeGraphManager.includeGraph.set(uri1, new Set());
            harness.runtime.services.includeGraphManager.includeGraph.set(uri2, new Set());
            
            // Mock indexFile to throw for deleted.tdl to simulate ENOENT
            const indexFileSpy = vi.spyOn(harness.runtime.services.workspaceScanner, 'indexFile').mockImplementation(async (fsPath: any) => {
                if (fsPath.includes('deleted')) throw new Error('ENOENT');
            });
            const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

            (harness.runtime.services.workspaceScanner as any)['hasInitialScanStarted'] = true;
            await expect(harness.runtime.services.workspaceScanner.revalidateAll([])).resolves.not.toThrow();
            
            expect(indexFileSpy).toHaveBeenCalledTimes(2);
        });
    });
});
