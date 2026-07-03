import { describe, it, expect } from 'vitest';
import { getServerCapabilities } from '../../protocol/capabilities';
import { ServerTestHarness } from '../harness/serverTestHarness';

describe('Runtime and Capabilities', () => {
    it('constructs runtime and harness without a VS Code instance', () => {
        const harness = new ServerTestHarness();
        expect(harness.runtime).toBeDefined();
        
        // This ensures the test doesn't crash trying to connect to LSP
        expect(() => harness.dispose()).not.toThrow();
    });

    it('returns the expected stable capabilities', () => {
        const capabilities = getServerCapabilities();
        expect(capabilities.textDocumentSync).toBe(2); // Incremental
        expect(capabilities.completionProvider?.resolveProvider).toBe(true);
        expect(capabilities.workspace?.workspaceFolders?.supported).toBe(true);
        // The snapshot proves it doesn't change unexpectedly over time
        expect(capabilities).toMatchSnapshot();
    });
});
