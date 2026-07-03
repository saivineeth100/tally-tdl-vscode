import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerTestHarness } from '../harness/serverTestHarness';

describe('Active URIs IPC', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        harness = new ServerTestHarness();
        vi.spyOn(harness.client, 'notify');
    });

    it('should correctly notify the client with the list of active URIs', () => {
        const scopeMgr = harness.runtime.services.documentStateStore.tdlScopeManager;

        // Set up active files in projectScope
        scopeMgr.fileMap.set('file:///active1.tdl', { isUriActive: true } as any);
        scopeMgr.fileMap.set('file:///active2.tdl', { isUriActive: true } as any);

        // Set up inactive file in workspaceScope
        scopeMgr.fileMap.set('file:///inactive.tdl', { isUriActive: false } as any);

        // Call the notification method
        harness.runtime.workspaceLifecycle.notifyActiveUrisChanged();

        // Verify the clientGateway.notify was called with the correct payload
        expect(harness.client.notify).toHaveBeenCalledWith('tdl/activeUrisChanged', {
            activeUris: expect.arrayContaining(['file:///active1.tdl', 'file:///active2.tdl'])
        });
    });
});
