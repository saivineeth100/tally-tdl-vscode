import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import { normalizeUri } from '../../utils/uri';
import { ServerTestHarness } from '../harness/serverTestHarness';

vi.mock('fs', async () => {
    const actualFs = await vi.importActual<typeof import('fs')>('fs');
    return {
        ...actualFs,
        statSync: vi.fn(),
        promises: {
            ...actualFs.promises,
            stat: vi.fn(),
            readFile: vi.fn()
        }
    };
});

describe('DocumentStateStore indexed document state', () => {
    let harness: ServerTestHarness;
    
    beforeEach(() => {
        vi.clearAllMocks();
        harness = new ServerTestHarness();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('get() returns open doc state first', () => {
        const uri = 'file:///test.tdl';
        const openState = { sourceFile: { definitions: [] } } as any;
        const indexedState = { sourceFile: { definitions: [{ type: { text: 'Report' } }] } } as any;
        
        harness.runtime.services.documentStateStore.setOpen(uri, openState);
        harness.runtime.services.documentStateStore.setIndexed(uri, indexedState);
        
        expect(harness.runtime.services.documentStateStore.get(uri)).toBe(openState);
        expect(harness.runtime.services.documentStateStore.getOpen(uri)).toBe(openState);
    });

    it('get() returns indexed doc state if not open', () => {
        const uri = 'file:///test.tdl';
        const indexedState = { sourceFile: { definitions: [{ type: { text: 'Report' } }] } } as any;
        
        harness.runtime.services.documentStateStore.setIndexed(uri, indexedState);
        
        expect(harness.runtime.services.documentStateStore.get(uri)).toBe(indexedState);
        expect(harness.runtime.services.documentStateStore.getIndexed(uri)).toBe(indexedState);
        expect(harness.runtime.services.documentStateStore.getOpen(uri)).toBeUndefined();
    });

    it('deleteOpen() removes only open state', () => {
        const uri = 'file:///test.tdl';
        const openState = { sourceFile: { definitions: [] } } as any;
        const indexedState = { sourceFile: { definitions: [{ type: { text: 'Report' } }] } } as any;
        
        harness.runtime.services.documentStateStore.setOpen(uri, openState);
        harness.runtime.services.documentStateStore.setIndexed(uri, indexedState);
        
        harness.runtime.services.documentStateStore.deleteOpen(uri);
        
        expect(harness.runtime.services.documentStateStore.getOpen(uri)).toBeUndefined();
        expect(harness.runtime.services.documentStateStore.get(uri)).toBe(indexedState);
    });

    it('deleteIndexed() removes only indexed state', () => {
        const uri = 'file:///test.tdl';
        const openState = { sourceFile: { definitions: [] } } as any;
        const indexedState = { sourceFile: { definitions: [{ type: { text: 'Report' } }] } } as any;
        
        harness.runtime.services.documentStateStore.setOpen(uri, openState);
        harness.runtime.services.documentStateStore.setIndexed(uri, indexedState);
        
        harness.runtime.services.documentStateStore.deleteIndexed(uri);
        
        expect(harness.runtime.services.documentStateStore.getIndexed(uri)).toBeUndefined();
        expect(harness.runtime.services.documentStateStore.get(uri)).toBe(openState);
    });
});
