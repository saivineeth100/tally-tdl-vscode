import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentLifecycleService } from '../../services/documentLifecycleService';
import { DocumentStateStore } from '../../services/documentStateStore';
import { IncludeGraphManager } from '../../services/includeGraphManager';
import { WorkspaceScanner } from '../../services/workspaceScanner';
import { MockClientGateway, MockDiagnosticPublisher, DeterministicScheduler, InMemoryFileAccess } from '../harness/testAdapters';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('Phase 3: Document Lifecycle', () => {
    let stateStore: DocumentStateStore;
    let graphManager: IncludeGraphManager;
    let scanner: WorkspaceScanner;
    let client: MockClientGateway;
    let diagnostics: MockDiagnosticPublisher;
    let scheduler: DeterministicScheduler;
    let lifecycle: DocumentLifecycleService;
    let fileAccess: InMemoryFileAccess;

    beforeEach(() => {
        stateStore = new DocumentStateStore();
        client = new MockClientGateway();
        diagnostics = new MockDiagnosticPublisher();
        scheduler = new DeterministicScheduler();
        fileAccess = new InMemoryFileAccess();
        
        graphManager = new IncludeGraphManager(stateStore, client);
        scanner = new WorkspaceScanner(stateStore, graphManager, fileAccess, diagnostics);
        
        // Mock scanner indexing to avoid real parsing during lifecycle tests
        vi.spyOn(scanner, 'indexFile').mockResolvedValue(undefined);
        
        lifecycle = new DocumentLifecycleService(
            stateStore,
            graphManager,
            scanner,
            diagnostics,
            scheduler,
            client
        );

        // Mock rebuild to just track calls, avoiding full AST parse in these structural tests
        vi.spyOn(lifecycle, 'rebuild').mockResolvedValue(undefined);
    });

    it('open triggers immediate rebuild', () => {
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, 'text');
        
        lifecycle.onDidOpen(doc);
        
        expect(lifecycle.rebuild).toHaveBeenCalledTimes(1);
        expect(lifecycle.rebuild).toHaveBeenCalledWith(doc);
    });

    it('rapid changes collapse into one rebuild', () => {
        const doc1 = TextDocument.create('file:///test.tdl', 'tdl', 1, 'text1');
        const doc2 = TextDocument.create('file:///test.tdl', 'tdl', 2, 'text2');
        const doc3 = TextDocument.create('file:///test.tdl', 'tdl', 3, 'text3');
        
        lifecycle.onDidChangeContent(doc1);
        lifecycle.onDidChangeContent(doc2);
        lifecycle.onDidChangeContent(doc3);
        
        // No rebuilds should have happened synchronously
        expect(lifecycle.rebuild).not.toHaveBeenCalled();
        
        // Advance timer by delay
        scheduler.flush();
        
        // Should only rebuild once with the latest document
        expect(lifecycle.rebuild).toHaveBeenCalledTimes(1);
        expect(lifecycle.rebuild).toHaveBeenCalledWith(doc3);
    });

    it('different documents use independent debounce jobs', () => {
        const docA1 = TextDocument.create('file:///a.tdl', 'tdl', 1, 'text A1');
        const docB1 = TextDocument.create('file:///b.tdl', 'tdl', 1, 'text B1');
        const docA2 = TextDocument.create('file:///a.tdl', 'tdl', 2, 'text A2');
        
        lifecycle.onDidChangeContent(docA1);
        lifecycle.onDidChangeContent(docB1);
        lifecycle.onDidChangeContent(docA2);
        
        scheduler.flush();
        
        expect(lifecycle.rebuild).toHaveBeenCalledTimes(2);
        expect(lifecycle.rebuild).toHaveBeenCalledWith(docB1);
        expect(lifecycle.rebuild).toHaveBeenCalledWith(docA2);
    });

    it('close clears open state and diagnostics and re-indexes from disk', () => {
        const uri = 'file:///test.tdl';
        const doc = TextDocument.create(uri, 'tdl', 1, 'text');
        
        // Set it as open
        stateStore.setOpen(uri, { sourceFile: {} as any, diagnostics: [] });
        
        lifecycle.onDidClose(doc);
        
        expect(stateStore.getOpen(uri)).toBeUndefined();
        expect(diagnostics.publishedDiagnostics.get(uri)).toEqual([]);
        expect(scanner.indexFile).toHaveBeenCalledTimes(1);
    });

    it('dispose cancels scheduled work', () => {
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, 'text');
        
        lifecycle.onDidChangeContent(doc);
        
        lifecycle.dispose();
        
        scheduler.flush();
        
        expect(lifecycle.rebuild).not.toHaveBeenCalled();
    });

    it('verifies that edits sync the matching document and AST to the state store', async () => {
        const rebuildSpy = vi.spyOn(lifecycle, 'rebuild');
        rebuildSpy.mockRestore();

        const uri = 'file:///test.tdl';
        const doc1 = TextDocument.create(uri, 'tdl', 1, '[Report: MyReport]');
        
        // 1. Initial open
        await lifecycle.onDidOpen(doc1);
        
        let docState = stateStore.getOpen(uri);
        expect(docState).toBeDefined();
        expect(docState?.document?.getText()).toBe('[Report: MyReport]');
        
        // 2. Make an edit (document version updates immediately in the editor)
        const doc2 = TextDocument.create(uri, 'tdl', 2, '[Report: EditedReport]');
        lifecycle.onDidChangeContent(doc2);
        
        // Immediately after change, the docState is updated to doc2 immediately so AST/document sync is instant
        let immediateDocState = stateStore.getOpen(uri);
        expect(immediateDocState?.document?.getText()).toBe('[Report: EditedReport]');

        // Using DocumentContextResolver resolves the updated doc2 immediately
        const { DocumentContextResolver } = await import('../../services/documentContextResolver');
        const resolver = new DocumentContextResolver(
            { get: () => doc2 } as any, // Simulate editor document store having doc2
            stateStore,
            graphManager
        );
        const resolvedCtx = resolver.resolveParsed(uri);
        expect(resolvedCtx?.document.getText()).toBe('[Report: EditedReport]');
        
        // 3. Flush the debounce timer for validation
        scheduler.flush();
        
        // 4. After rebuild runs, docState is verified to remain doc2
        const resolvedCtxAfterRebuild = resolver.resolveParsed(uri);
        expect(resolvedCtxAfterRebuild?.document.getText()).toBe('[Report: EditedReport]');
    });

    it('verifies IncludeGraphManager isUriActive cache and tpj project rules', () => {
        const uriA = 'file:///a.tdl';
        const uriB = 'file:///b.tdl';
        const uriC = 'file:///c.tdl';

        // Set up include graph: A -> B -> C
        graphManager.includeGraph.set(uriA, new Set([uriB]));
        graphManager.parentGraph.set(uriB, new Set([uriA]));
        graphManager.includeGraph.set(uriB, new Set([uriC]));
        graphManager.parentGraph.set(uriC, new Set([uriB]));

        // 1. Initially no open files and no tpj files -> all inactive
        expect(graphManager.isUriActive(uriA)).toBe(false);
        expect(graphManager.isUriActive(uriB)).toBe(false);

        // 2. Open A. Since no tpj files exist, A and its descendants (B, C) should be active
        stateStore.setOpen(uriA, { sourceFile: {} as any, diagnostics: [] });
        graphManager.invalidateCache();
        expect(graphManager.isUriActive(uriA)).toBe(true);
        expect(graphManager.isUriActive(uriB)).toBe(true);
        expect(graphManager.isUriActive(uriC)).toBe(true);

        // 3. Introduce a .tpj file. Once tpj files exist, only tpj files and their includes are active.
        // A is open but not in the tpjFiles, so A and its includes are no longer active!
        graphManager.tpjFiles.add('file:///tpj_root.tdl');
        graphManager.invalidateCache();
        expect(graphManager.isUriActive(uriA)).toBe(false);

        // 4. Add tpj_root -> A to graph. Now tpj_root includes A, so A, B, C become active again
        graphManager.includeGraph.set('file:///tpj_root.tdl', new Set([uriA]));
        graphManager.parentGraph.set(uriA, new Set(['file:///tpj_root.tdl']));
        graphManager.invalidateCache();
        expect(graphManager.isUriActive(uriA)).toBe(true);
        expect(graphManager.isUriActive(uriB)).toBe(true);
    });
});
