import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { normalizeUri } from '../../utils/uri';

describe('Workspace Partitioning and isUriActive Propagation', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        vi.clearAllMocks();
        harness = new ServerTestHarness();
    });

    it('should partition a project into one active project ScopeManager', async () => {
        // Create 3 files in the same project
        const rootUri = URI.file('d:/project/root.tdl').toString();
        const child1Uri = URI.file('d:/project/child1.tdl').toString();
        const child2Uri = URI.file('d:/project/child2.tdl').toString();

        harness.files.set(URI.parse(rootUri).fsPath, `
            [Include: child1.tdl]
            [Include: child2.tdl]
        `);
        harness.files.set(URI.parse(child1Uri).fsPath, `
            [Variable: Var1]
        `);
        harness.files.set(URI.parse(child2Uri).fsPath, `
            [System: Formula]
            child2Formula: 2
        `);
        
        (harness.client as any).workspaceFolders = [{ uri: 'file:///d:/project', name: 'project' }];
        
        await harness.runtime.services.workspaceScanner.indexFile(URI.parse(rootUri).fsPath, new Set(), true, false, false);
        await harness.runtime.services.workspaceScanner.indexFile(URI.parse(child1Uri).fsPath, new Set(), true, false, false);
        await harness.runtime.services.workspaceScanner.indexFile(URI.parse(child2Uri).fsPath, new Set(), true, false, false);

        // Open the root file
        const rootDoc = TextDocument.create(rootUri, 'tdl', 1, harness.files.files.get(harness.files.canonicalize(URI.parse(rootUri).fsPath))!);
        harness.documents.set(rootUri, rootDoc);
        await harness.runtime.documentLifecycle.rebuild(rootDoc);

        // Wait a little for any async include resolution
        await new Promise(r => setTimeout(r, 50));

        // All 3 files should be in the same project scope
        const scopeManager = harness.runtime.services.documentStateStore.getScopeManager(rootUri);
        
        const normRoot = normalizeUri(rootUri);
        const normChild1 = normalizeUri(child1Uri);
        const normChild2 = normalizeUri(child2Uri);

        expect(scopeManager.fileMap.get(normRoot)?.parent).toBe(scopeManager.projectScope);
        expect(scopeManager.fileMap.get(normChild1)?.parent).toBe(scopeManager.projectScope);
        expect(scopeManager.fileMap.get(normChild2)?.parent).toBe(scopeManager.projectScope);
        
        // All files in the scope should be marked active because root is active
        const rootScope = scopeManager.fileMap.get(normRoot);
        const child1Scope = scopeManager.fileMap.get(normChild1);
        const child2Scope = scopeManager.fileMap.get(normChild2);
        
        expect(rootScope?.parent).toBe(scopeManager.projectScope);
        expect(child1Scope?.parent).toBe(scopeManager.projectScope);
        expect(child2Scope?.parent).toBe(scopeManager.projectScope);
    });

    it('should transition closed files from inactive to active when a project file is opened', async () => {
        // Setup a closed project
        const rootUri = URI.file('d:/project2/root.tdl').toString();
        const childUri = URI.file('d:/project2/child.tdl').toString();
        
        harness.files.set(URI.parse(rootUri).fsPath, `
            [Include: child.tdl]
        `);
        harness.files.set(URI.parse(childUri).fsPath, `
            [Variable: Var1]
        `);
        
        (harness.client as any).workspaceFolders = [{ uri: 'file:///d:/project2', name: 'project2' }];
        
        // Directly index files (simulating a workspace scan)
        await harness.runtime.services.workspaceScanner.indexFile(URI.parse(rootUri).fsPath, new Set(), true, false, false);
        await harness.runtime.services.workspaceScanner.indexFile(URI.parse(childUri).fsPath, new Set(), true, false, false);
        
        const normRoot = normalizeUri(rootUri);
        const normChild = normalizeUri(childUri);

        // Verify they are inactive initially
        let scopeManager = harness.runtime.services.documentStateStore.tdlScopeManager;
        expect(scopeManager.fileMap.get(normRoot)?.parent).toBe(scopeManager.workspaceScope);
        expect(scopeManager.fileMap.get(normChild)?.parent).toBe(scopeManager.workspaceScope);

        // Open one of the files
        const rootDoc = TextDocument.create(rootUri, 'tdl', 1, harness.files.files.get(harness.files.canonicalize(URI.parse(rootUri).fsPath))!);
        harness.documents.set(rootUri, rootDoc);
        await harness.runtime.documentLifecycle.rebuild(rootDoc);

        // Wait a little for any async include resolution
        await new Promise(r => setTimeout(r, 50));

        // Now they should be active
        scopeManager = harness.runtime.services.documentStateStore.getScopeManager(rootUri);
        expect(scopeManager.fileMap.get(normRoot)?.parent).toBe(scopeManager.projectScope);
        expect(scopeManager.fileMap.get(normChild)?.parent).toBe(scopeManager.projectScope);
    });
});
