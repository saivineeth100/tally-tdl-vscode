import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocManager } from '../../../src/docManager';
import { Connection, TextDocuments, TextDocument } from 'vscode-languageserver';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import * as path from 'path';

// Mock dependencies
const mockConnection = {
    sendDiagnostics: vi.fn(),
    sendNotification: vi.fn(),
    console: { log: vi.fn(), error: vi.fn(), warn: vi.fn() }
} as unknown as Connection;

const mockDocuments = {
    onDidOpen: vi.fn(),
    onDidChangeContent: vi.fn(),
    onDidClose: vi.fn(),
    get: vi.fn(),
    all: vi.fn().mockReturnValue([]),
    keys: vi.fn().mockReturnValue([])
} as unknown as TextDocuments<TextDocument>;

describe('Workspace Partitioning and isUriActive Propagation', () => {
    let docManager: DocManager;

    beforeEach(() => {
        vi.clearAllMocks();
        docManager = new DocManager(mockConnection, mockDocuments);
        // Suppress logs during tests
        vi.spyOn(console, 'log').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    it('should assign a loose file to workspaceScope and an active file to projectScope', async () => {
        // Mock fs.promises.stat and readFile
        vi.spyOn(fs.promises, 'stat').mockResolvedValue({ mtimeMs: 1 } as any);
        const mockContent = `[Report: MyReport]\n`;
        vi.spyOn(fs.promises, 'readFile').mockResolvedValue(mockContent as any);

        // Parse a loose file (isActive = false)
        await docManager.indexFile('/workspace/loose.tdl', new Set(), false, false, false);

        // Verify it went to workspaceScope
        const scopeMgr = docManager.getScopeManager(URI.file('/workspace/loose.tdl').toString());
        const looseScope = scopeMgr.fileMap.get(URI.file('/workspace/loose.tdl').toString());
        expect(looseScope?.parent).toBe(scopeMgr.workspaceScope);

        // Verify definition is in workspaceIndex
        const workspaceReport = scopeMgr.workspaceIndex.get('report')?.get('myreport');
        expect(workspaceReport).toBeDefined();
        expect(workspaceReport?.length).toBe(1);

        // Verify it is NOT in projectScope
        const projectReport = scopeMgr.scopeIndex.get('report')?.get('myreport');
        expect(projectReport).toBeUndefined();

        // Now parse an active file (isActive = true)
        await docManager.indexFile('/workspace/active.tdl', new Set(), false, false, true);

        // Verify it went to projectScope
        const activeScope = scopeMgr.fileMap.get(URI.file('/workspace/active.tdl').toString());
        expect(activeScope?.parent).toBe(scopeMgr.projectScope);

        // Verify definition is in scopeIndex
        const activeReport = scopeMgr.scopeIndex.get('report')?.get('myreport');
        expect(activeReport).toBeDefined();
        expect(activeReport?.length).toBe(1);
    });

    it('should correctly store duplicate definitions as arrays in both scopes', async () => {
        vi.spyOn(fs.promises, 'stat').mockResolvedValue({ mtimeMs: 1 } as any);
        const mockContent = `[Report: DuplicateReport]\n`;
        vi.spyOn(fs.promises, 'readFile').mockResolvedValue(mockContent as any);

        const scopeMgr = docManager.getScopeManager('dummy');

        // Parse two active files with the same report name
        await docManager.indexFile('/active1.tdl', new Set(), false, false, true);
        await docManager.indexFile('/active2.tdl', new Set(), false, false, true);

        const activeDuplicates = scopeMgr.scopeIndex.get('report')?.get('duplicatereport');
        expect(activeDuplicates?.length).toBe(2);

        // Parse two inactive files with the same report name
        await docManager.indexFile('/inactive1.tdl', new Set(), false, false, false);
        await docManager.indexFile('/inactive2.tdl', new Set(), false, false, false);

        const inactiveDuplicates = scopeMgr.workspaceIndex.get('report')?.get('duplicatereport');
        expect(inactiveDuplicates?.length).toBe(2);
    });

    it('should propagate isActive down the include graph during tpj processing', async () => {
        vi.spyOn(fs.promises, 'stat').mockResolvedValue({ mtimeMs: 1 } as any);
        
        // Root includes Child, Child includes Grandchild
        const contentMap: Record<string, string> = {
            [URI.file('/root.tdl').toString()]: `[Include: child.tdl]`,
            [URI.file('/child.tdl').toString()]: `[Include: grandchild.tdl]`,
            [URI.file('/grandchild.tdl').toString()]: `[Report: DeepReport]`
        };

        vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
            const normalizedPath = URI.file(path).toString();
            return contentMap[normalizedPath] || '';
        });

        // Mock resolveIncludePath to easily resolve paths
        (docManager as any).resolveIncludePath = (currentFsPath: string, includeName: string) => {
            return `/${includeName}`;
        };

        // Parse root as ACTIVE
        await docManager.indexFile('/root.tdl', new Set(), false, false, true);

        const scopeMgr = docManager.getScopeManager('dummy');

        // Verify grandchild went to projectScope because isActive propagated!
        const deepScope = scopeMgr.fileMap.get(URI.file('/grandchild.tdl').toString());
        expect(deepScope).toBeDefined();
        expect(deepScope?.parent).toBe(scopeMgr.projectScope);

        const deepReport = scopeMgr.scopeIndex.get('report')?.get('deepreport');
        expect(deepReport?.length).toBe(1);
    });

    it('should strictly determine isUriActive via ProjectScope, falling back to open docs if no tpj', () => {
        const scopeMgr = docManager.getScopeManager('dummy');
        
        // Setup mock file scope attached to projectScope
        scopeMgr.fileMap.set(URI.file('/active.tdl').toString(), { parent: scopeMgr.projectScope } as any);
        expect(docManager.isUriActive(URI.file('/active.tdl').toString())).toBe(true);

        // Setup mock file scope attached to workspaceScope
        scopeMgr.fileMap.set(URI.file('/inactive.tdl').toString(), { parent: scopeMgr.workspaceScope } as any);
        expect(docManager.isUriActive(URI.file('/inactive.tdl').toString())).toBe(false);

        // If file not indexed yet, but tpj exists -> false
        docManager.tpjFiles.add(URI.file('/some.tpj').toString());
        expect(docManager.isUriActive(URI.file('/new.tdl').toString())).toBe(false);

        // If file not indexed yet, NO tpj exists -> true ONLY IF open in editor
        docManager.tpjFiles.clear();
        (docManager as any).docs.set(URI.file('/open.tdl').toString(), {} as any);
        expect(docManager.isUriActive(URI.file('/open.tdl').toString())).toBe(true);
        expect(docManager.isUriActive(URI.file('/closed.tdl').toString())).toBe(false);
    });
});
