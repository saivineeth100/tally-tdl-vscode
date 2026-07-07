import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkspaceScanner } from '../../services/workspaceScanner';
import { DocumentStateStore } from '../../services/documentStateStore';
import { IncludeGraphManager } from '../../services/includeGraphManager';
import { DocumentLifecycleService } from '../../services/documentLifecycleService';
import { MockClientGateway, MockDiagnosticPublisher, InMemoryFileAccess, DeterministicScheduler } from '../harness/testAdapters';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';

describe('Phase 1: Workspace Scanner - Open File Scope Migration', () => {
    let stateStore: DocumentStateStore;
    let graphManager: IncludeGraphManager;
    let fileAccess: InMemoryFileAccess;
    let diagnostics: MockDiagnosticPublisher;
    let client: MockClientGateway;
    let scanner: WorkspaceScanner;
    let lifecycle: DocumentLifecycleService;
    let scheduler: DeterministicScheduler;

    beforeEach(() => {
        stateStore = new DocumentStateStore();
        client = new MockClientGateway();
        diagnostics = new MockDiagnosticPublisher();
        fileAccess = new InMemoryFileAccess();
        scheduler = new DeterministicScheduler();

        graphManager = new IncludeGraphManager(stateStore, client);
        graphManager.resolveIncludePath = (currentPath: string, includeName: string) => {
            if (includeName === 'child.tdl') return 'z:\\test_workspace\\child.tdl';
            return null;
        };
        
        scanner = new WorkspaceScanner(stateStore, graphManager, fileAccess, diagnostics);

        lifecycle = new DocumentLifecycleService(
            stateStore,
            graphManager,
            scanner,
            diagnostics,
            scheduler,
            client
        );
        scanner.documentLifecycle = lifecycle;
    });

    it('correctly migrates an already open file to project scope during a workspace scan (via include)', async () => {
        // Setup file system with a .tpj file and a child file
        const rootUri = URI.file('z:/test_workspace').toString();
        const tpjPath = 'z:/test_workspace/project.tpj';
        const childPath = 'z:/test_workspace/child.tdl';
        
        fileAccess.set(tpjPath, 'Project File=child.tdl');
        fileAccess.set(childPath, '[Report: ChildReport]');

        // 1. Simulate the user opening the child file BEFORE the workspace scan starts.
        // Because there are no .tpj files known yet, this will be placed in project scope (as a standalone file).
        const childDoc = TextDocument.create(URI.file(childPath).toString(), 'tdl', 1, '[Report: ChildReport]');
        lifecycle.onDidOpen(childDoc);

        // Manually flush the pending open documents queue to simulate completion of the workspace scan
        lifecycle.processPendingDocuments();

        // Verify it was opened and has definitions in the tdlScopeManager
        expect(stateStore.getOpen(childDoc.uri)).toBeDefined();
        const initialSymbolCount = stateStore.tdlScopeManager.getSymbolCount();
        expect(initialSymbolCount).toBeGreaterThan(0);

        // 2. Simulate the workspace scan starting
        await scanner['scanWorkspaceFolders']([rootUri]);

        // 3. Verify the file scope was successfully reconstructed and inserted into projectScope
        const finalSymbolCount = stateStore.tdlScopeManager.getSymbolCount();
        expect(finalSymbolCount).toBeGreaterThan(0);

        // Explicitly check that the child's definitions are still accessible in the scopeIndex
        const defs = stateStore.tdlScopeManager.getGlobalDefinitionsByType('report', true);
        const childReportDef = defs.find(d => d.name.toLowerCase() === 'childreport');
        expect(childReportDef).toBeDefined();
        expect(childReportDef?.uri).toBe(URI.file(childPath).toString());
    });

    it('correctly migrates an already open root project file to project scope during a workspace scan', async () => {
        const rootUri = URI.file('z:/test_workspace').toString();
        const tpjPath = 'z:/test_workspace/project.tpj';
        const mainPath = 'z:/test_workspace/main.tdl';
        
        fileAccess.set(tpjPath, 'Project File=main.tdl');
        fileAccess.set(mainPath, '[Report: MainReport]');

        // 1. Simulate the user opening the main file BEFORE the workspace scan starts.
        const mainDoc = TextDocument.create(URI.file(mainPath).toString(), 'tdl', 1, '[Report: MainReport]');
        lifecycle.onDidOpen(mainDoc);

        // 2. Simulate the workspace scan starting
        scanner.scanWorkspaceFolders([rootUri]);

        // 2.5 Manually flush pending open documents
        lifecycle.processPendingDocuments();

        // 3. Verify the file was migrated to (or remained in) ProjectScope
        expect(stateStore.tdlScopeManager.isFileWorkspaceScope(mainDoc.uri)).toBe(false);

        // Verify that getScopeAt correctly finds the inner scope (since [Report: MainReport] starts at offset 0)
        const scopeAt = stateStore.tdlScopeManager.getScopeAt(mainDoc.uri, 0);
        expect(scopeAt).toBeDefined();
        expect(scopeAt?.kind).toBe('Definition');
        expect(scopeAt?.id).toBe('Report:MainReport');

        // Explicitly check that the main's definitions are accessible in the project scope index
        const defs = stateStore.tdlScopeManager.getGlobalDefinitionsByType('report', true);
        const mainReportDef = defs.find(d => d.name.toLowerCase() === 'mainreport');
        expect(mainReportDef).toBeDefined();
        expect(mainReportDef?.uri).toBe(URI.file(mainPath).toString());
    });

    it('correctly traverses a nested "samples" directory collecting projects and standalone files', async () => {
        const rootUri = URI.file('z:/test_workspace').toString();
        
        // Setup a complex folder structure with a "samples" directory
        // root/
        //   samples/
        //     projectA/
        //       main.tpj
        //       foo.tdl
        //     standalone/
        //       bar.tdl
        //   standalone_root.tdl
        
        fileAccess.set('z:/test_workspace/samples/projectA/main.tpj', 'Project File=foo.tdl');
        fileAccess.set('z:/test_workspace/samples/projectA/foo.tdl', '[Report: FooReport]');
        fileAccess.set('z:/test_workspace/samples/standalone/bar.tdl', '[Report: BarReport]');
        fileAccess.set('z:/test_workspace/standalone_root.tdl', '[Report: RootReport]');

        // 1. Simulate the workspace scan starting
        await scanner['scanWorkspaceFolders']([rootUri]);

        // Verify the scanner processed all files across the deep folder hierarchy
        
        // 2. Project file should have been indexed (Phase 1)
        const fooUri = URI.file('z:/test_workspace/samples/projectA/foo.tdl').toString();
        const fooScope = stateStore.tdlScopeManager.isFileWorkspaceScope(fooUri);
        expect(fooScope).toBe(false); // In ProjectScope because it was included

        // 3. Standalone files should have been indexed (Phase 2)
        const barUri = URI.file('z:/test_workspace/samples/standalone/bar.tdl').toString();
        const barScope = stateStore.tdlScopeManager.isFileWorkspaceScope(barUri);
        expect(barScope).toBe(true); // In WorkspaceScope because it was standalone

        const rootStandaloneUri = URI.file('z:/test_workspace/standalone_root.tdl').toString();
        const rootScope = stateStore.tdlScopeManager.isFileWorkspaceScope(rootStandaloneUri);
        expect(rootScope).toBe(true); // In WorkspaceScope because it was standalone

        // 4. Verify definitions are globally accessible
        const defs = stateStore.tdlScopeManager.getGlobalDefinitionsByType('report', true);
        expect(defs.find(d => d.name.toLowerCase() === 'fooreport')).toBeDefined();
        expect(defs.find(d => d.name.toLowerCase() === 'barreport')).toBeDefined();
        expect(defs.find(d => d.name.toLowerCase() === 'rootreport')).toBeDefined();
    });
});
