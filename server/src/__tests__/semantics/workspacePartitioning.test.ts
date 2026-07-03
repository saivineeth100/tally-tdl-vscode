import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import { ServerTestHarness } from '../harness/serverTestHarness';

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

        harness.files.files.set(URI.parse(rootUri).fsPath, `
            [Include: child1.tdl]
            [Include: child2.tdl]
        `);
        harness.files.files.set(URI.parse(child1Uri).fsPath, `
            [Variable: Var1]
        `);
        harness.files.files.set(URI.parse(child2Uri).fsPath, `
            [Variable: Var2]
        `);
        
        // Open the root file
        const rootDoc = TextDocument.create(rootUri, 'tdl', 1, harness.files.files.get(URI.parse(rootUri).fsPath)!);
        harness.documents.set(rootUri, rootDoc);
        await harness.runtime.documentLifecycle.rebuild(rootDoc);

        // All 3 files should be in the same project scope
        const scopeManager = harness.runtime.services.documentStateStore.getScopeManager(rootUri);
        
        expect(scopeManager.projectScope.has(rootUri)).toBe(true);
        expect(scopeManager.projectScope.has(child1Uri)).toBe(true);
        expect(scopeManager.projectScope.has(child2Uri)).toBe(true);
        
        // All files in the scope should be marked active because root is active
        const rootScope = scopeManager.fileMap.get(rootUri);
        const child1Scope = scopeManager.fileMap.get(child1Uri);
        const child2Scope = scopeManager.fileMap.get(child2Uri);
        
        expect(rootScope?.isUriActive).toBe(true);
        expect(child1Scope?.isUriActive).toBe(true);
        expect(child2Scope?.isUriActive).toBe(true);
    });

    it('should transition closed files from inactive to active when a project file is opened', async () => {
        // Setup a closed project
        const rootUri = URI.file('d:/project2/root.tdl').toString();
        const childUri = URI.file('d:/project2/child.tdl').toString();
        
        harness.files.files.set(URI.parse(rootUri).fsPath, `
            [Include: child.tdl]
        `);
        harness.files.files.set(URI.parse(childUri).fsPath, `
            [Variable: Var1]
        `);
        
        // Directly index files (simulating a workspace scan)
        await harness.runtime.services.workspaceScanner.indexFile(URI.parse(rootUri).fsPath, new Set(), true, false, false);
        await harness.runtime.services.workspaceScanner.indexFile(URI.parse(childUri).fsPath, new Set(), true, false, false);
        
        // Add them to project scope map manually for test since we didn't run the full scanner
        harness.runtime.services.documentStateStore.tdlScopeManager.updateProjectScope(rootUri, new Set([rootUri, childUri]));
        harness.runtime.services.documentStateStore.tdlScopeManager.updateProjectScope(childUri, new Set([rootUri, childUri]));

        // Verify they are inactive initially
        let scopeManager = harness.runtime.services.documentStateStore.tdlScopeManager;
        expect(scopeManager.fileMap.get(rootUri)?.isUriActive).toBe(false);
        expect(scopeManager.fileMap.get(childUri)?.isUriActive).toBe(false);

        // Open one of the files
        const rootDoc = TextDocument.create(rootUri, 'tdl', 1, harness.files.files.get(URI.parse(rootUri).fsPath)!);
        harness.documents.set(rootUri, rootDoc);
        await harness.runtime.documentLifecycle.rebuild(rootDoc);

        // Now they should be active
        scopeManager = harness.runtime.services.documentStateStore.getScopeManager(rootUri);
        expect(scopeManager.fileMap.get(rootUri)?.isUriActive).toBe(true);
        expect(scopeManager.fileMap.get(childUri)?.isUriActive).toBe(true);
    });
});
