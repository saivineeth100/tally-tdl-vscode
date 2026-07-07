import { describe, it, expect, beforeEach } from 'vitest';
import { WorkspaceScanner } from '../../services/workspaceScanner';
import { DocumentStateStore } from '../../services/documentStateStore';
import { IncludeGraphManager } from '../../services/includeGraphManager';
import { URI } from 'vscode-uri';
import { InMemoryFileAccess, MockClientGateway, MockDiagnosticPublisher, InMemoryDocumentRepository } from '../harness/testAdapters';
import { ScopeManager } from '../../semantics/scopeManager';
import { DocumentLoader } from '../../services/documentLoader';
import { Parser } from '../../core/parser/parser';

describe('WorkspaceScanner Open File Includes', () => {
    let stateStore: DocumentStateStore;
    let graphManager: IncludeGraphManager;
    let fileAccess: InMemoryFileAccess;
    let scanner: WorkspaceScanner;

    beforeEach(() => {
        stateStore = new DocumentStateStore();
        graphManager = new IncludeGraphManager(stateStore, new MockClientGateway());
        fileAccess = new InMemoryFileAccess();

        // Bind resolveIncludePath
        graphManager.resolveIncludePath = (currentPath, includeName) => {
            const path = require('path');
            return path.resolve(path.dirname(currentPath), includeName);
        };

        scanner = new WorkspaceScanner(
            stateStore,
            graphManager,
            fileAccess,
            new MockDiagnosticPublisher(),
            graphManager.resolveIncludePath,
            new DocumentLoader(new InMemoryDocumentRepository(), fileAccess)
        );
    });

    it('should index files included by an open file when scanning .tpj', async () => {
        // Setup mock file system
        const tpjUri = URI.file('c:/project/test.tpj').toString();
        const aUri = URI.file('c:/project/A.txt').toString();
        const bUri = URI.file('c:/project/B.txt').toString();

        fileAccess.set('c:/project/test.tpj', 'Project File=A.txt');
        fileAccess.set('c:/project/A.txt', '[Include: B.txt]\n[Report: ReportA]');
        fileAccess.set('c:/project/B.txt', '[Report: ReportB]');

        // Simulate A.txt being open (as if updateAstAndScope ran)
        const scopeMgr = stateStore.tdlScopeManager;
        const parserA = new Parser('[Include: B.txt]\n[Report: ReportA]');
        const sourceFileA = parserA.parse();

        stateStore.setOpen(aUri, { sourceFile: sourceFileA, diagnostics: [], document: {} as any });
        
        // When A.txt was opened, it built file scope for A.txt in WorkspaceScope
        scopeMgr.buildFileScope(aUri, sourceFileA, true);

        // Also it would have indexed B.txt in WorkspaceScope
        const parserB = new Parser('[Report: ReportB]');
        const sourceFileB = parserB.parse();
        scanner.fileTimestamps.set(bUri, 100);
        stateStore.setIndexed(bUri, { sourceFile: sourceFileB, diagnostics: [] });
        scopeMgr.buildFileScope(bUri, sourceFileB, true);

        expect(scopeMgr.isFileWorkspaceScope(aUri)).toBe(true);
        expect(scopeMgr.isFileWorkspaceScope(bUri)).toBe(true);

        // Now run the workspace scan
        scanner.workspaceFolders = ['c:/project'];
        await new Promise<void>((resolve) => {
            scanner.onScanComplete = () => resolve();
            scanner.scanWorkspaceFolders([URI.file('c:/project').toString()]);
        });

        // Check if A.txt and B.txt are in ProjectScope now
        expect(scopeMgr.isFileWorkspaceScope(aUri)).toBe(false);
        expect(scopeMgr.isFileWorkspaceScope(bUri)).toBe(false);
        
        // Check if B.txt's definitions are in ProjectScope
        const reportB = scopeMgr.findDefinitionScope('Report:ReportB');
        expect(reportB).toBeDefined();
        
        // Wait, where does B.txt get added to ProjectScope?
        expect(scopeMgr.isFileWorkspaceScope(bUri)).toBe(false);
    });
});
