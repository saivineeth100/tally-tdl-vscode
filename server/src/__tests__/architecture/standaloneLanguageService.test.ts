/**
 * Tests for the standalone language service support.
 * Validates that the server functions correctly when no .tpj file is present,
 * supporting standalone/untitled files, nonstandard file extensions mapped by language ID,
 * and skipping validation for closed inactive files.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { URI } from 'vscode-uri';
import { normalizeUri } from '../../utils/uri';

describe('Standalone Language Service', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        harness = new ServerTestHarness();
    });

    it('should complete startup without workspace scan when no workspace is available', async () => {
        // Setup state indicating no workspace folders or root paths
        harness.runtime.workspaceLifecycle.globalWorkspaceFolders = [];
        
        // Invoke initialization complete flow
        harness.runtime.workspaceLifecycle.scanner?.completeInitialScan();
        
        expect(harness.runtime.workspaceLifecycle.scanner?.hasInitialScanStarted).toBe(true);
        expect(harness.runtime.workspaceLifecycle.scanner?.scanningInProgress).toBe(false);
    });

    it('should parse standalone TDL and publish diagnostics without a .tpj file', async () => {
        const uri = 'file:///test_workspace/standalone.tdl';
        const content = '[Report: StandaloneReport]\n    Title: "Standalone"';
        
        harness.simulateOpen(uri, 'tdl', content);
        harness.runtime.documentLifecycle.processPendingDocuments();

        // Standalone open files should be validated and publish diagnostics
        const docState = harness.runtime.services.documentStateStore.get(uri);
        expect(docState).toBeDefined();
        expect(docState?.sourceFile).toBeDefined();
        
        const scopeMgr = harness.runtime.services.documentStateStore.getScopeManager(uri, 'tdl');
        expect(scopeMgr).toBe(harness.runtime.services.documentStateStore.tdlScopeManager);

        // Check that definitions are added to TDL scope manager
        const defs = scopeMgr.getGlobalDefinitionsByType('report', true);
        const standaloneReportDef = defs.find(d => d.name.toLowerCase() === 'standalonereport');
        expect(standaloneReportDef).toBeDefined();
    });

    it('should select XML scope manager for a non-xml filename with language ID xml', async () => {
        const uri = 'file:///test_workspace/test.dat';
        const content = '<Form Name="XmlForm"></Form>';
        
        harness.simulateOpen(uri, 'xml', content);
        harness.runtime.documentLifecycle.processPendingDocuments();

        const scopeMgr = harness.runtime.services.documentStateStore.getScopeManager(uri, 'xml');
        expect(scopeMgr).toBe(harness.runtime.services.documentStateStore.xmlScopeManager);
    });

    it('should select TDL scope manager for a non-tdl filename with language ID tdl', async () => {
        const uri = 'file:///test_workspace/test.abc';
        const content = '[Report: MyReport]';
        
        harness.simulateOpen(uri, 'tdl', content);
        harness.runtime.documentLifecycle.processPendingDocuments();

        const scopeMgr = harness.runtime.services.documentStateStore.getScopeManager(uri, 'tdl');
        expect(scopeMgr).toBe(harness.runtime.services.documentStateStore.tdlScopeManager);
    });

    it('should support untitled TDL and XML documents immediately after initialization', async () => {
        const uri = 'untitled:Untitled-1';
        const content = '[Report: UntitledReport]';
        
        harness.simulateOpen(uri, 'tdl', content);
        harness.runtime.documentLifecycle.processPendingDocuments();

        const docState = harness.runtime.services.documentStateStore.get(uri);
        expect(docState).toBeDefined();
        expect(docState?.sourceFile).toBeDefined();
        
        const scopeMgr = harness.runtime.services.documentStateStore.getScopeManager(uri, 'tdl');
        expect(scopeMgr).toBe(harness.runtime.services.documentStateStore.tdlScopeManager);
    });

    it('should make included/imported files active in a no-.tpj workspace', async () => {
        const rootUri = 'file:///z:/test_workspace/main.tdl';
        const childUri = 'file:///z:/test_workspace/child.tdl';
        
        harness.files.set('z:/test_workspace/main.tdl', '[Include: child.tdl]');
        harness.files.set('z:/test_workspace/child.tdl', '[Report: ChildReport]');
        
        harness.runtime.services.includeGraphManager.resolveIncludePath = (current, name) => {
            if (name === 'child.tdl') return 'z:\\test_workspace\\child.tdl';
            return null;
        };

        harness.simulateOpen(rootUri, 'tdl', '[Include: child.tdl]');
        harness.runtime.documentLifecycle.processPendingDocuments();
        
        // Wait for asynchronous validateAndPublish / updateIncludeGraph tasks to run
        await new Promise(resolve => setTimeout(resolve, 10));

        // The include graph manager should identify the include link
        const mainIncludes = harness.runtime.services.includeGraphManager.includeGraph.get(normalizeUri(rootUri));
        expect(mainIncludes?.has(normalizeUri(childUri))).toBe(true);

        // Child file should be active since it is included by an open file
        expect(harness.runtime.services.includeGraphManager.isUriActive(normalizeUri(childUri))).toBe(true);
    });

    it('should completely bypass validation for closed inactive files', async () => {
        const inactivePath = 'z:\\test_workspace\\inactive.tdl';
        const inactiveUri = 'file:///z:/test_workspace/inactive.tdl';
        const content = '[Report: InactiveReport]';
        
        // Populate file in system
        harness.files.set('z:/test_workspace/inactive.tdl', content);

        // Ensure file is not active
        expect(harness.runtime.services.includeGraphManager.isUriActive(inactiveUri)).toBe(false);

        // Simulate indexing the file (closed standalone file)
        await harness.runtime.services.workspaceScanner.indexFile(
            inactivePath, 
            new Set(), 
            false, 
            false, 
            false // isActive = false
        );

        // Since it is closed and inactive, it should not have published any diagnostics (or diagnostics list is cleared)
        const docState = harness.runtime.services.documentStateStore.get(inactiveUri);
        expect(docState?.diagnostics).toHaveLength(0);
    });
});
