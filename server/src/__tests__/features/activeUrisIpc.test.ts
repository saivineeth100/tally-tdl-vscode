import { describe, it, expect, vi } from 'vitest';
import { DocManager } from '../../../src/docManager';
import { ScopeManager } from '../../../src/semantics/scopeManager';
import { TextDocuments, TextDocument, Connection } from 'vscode-languageserver';

describe('Active URIs IPC', () => {
    it('should correctly notify the client with the list of active URIs', () => {
        const mockDocuments = {
            onDidOpen: vi.fn(),
            onDidChangeContent: vi.fn(),
            onDidClose: vi.fn(),
            get: vi.fn(),
            all: vi.fn().mockReturnValue([]),
            keys: vi.fn().mockReturnValue([])
        } as unknown as TextDocuments<TextDocument>;
        
        const mockConnection = {
            sendNotification: vi.fn(),
            console: { log: vi.fn(), warn: vi.fn(), error: vi.fn() }
        } as unknown as Connection;

        const docManager = new DocManager(mockConnection, mockDocuments);
        const scopeMgr = docManager.tdlScopeManager;

        // Set up active files in projectScope
        scopeMgr.fileMap.set('file:///active1.tdl', { parent: scopeMgr.projectScope } as any);
        scopeMgr.fileMap.set('file:///active2.tdl', { parent: scopeMgr.projectScope } as any);

        // Set up inactive file in workspaceScope
        scopeMgr.fileMap.set('file:///inactive.tdl', { parent: scopeMgr.workspaceScope } as any);

        // Call the notification method
        docManager.notifyActiveUrisChanged();

        // Verify the connection.sendNotification was called with the correct payload
        expect(mockConnection.sendNotification).toHaveBeenCalledWith('tdl/activeUrisChanged', {
            activeUris: ['file:///active1.tdl', 'file:///active2.tdl']
        });
    });
});
