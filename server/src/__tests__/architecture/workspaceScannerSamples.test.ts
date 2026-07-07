import { describe, it, expect } from 'vitest';
import { ServerTestHarness } from '../harness/serverTestHarness';
import { NodeFileAccess } from '../../adapters/nodeFileAccess';
import * as fs from 'fs';
import { URI } from 'vscode-uri';

import * as path from 'path';

const samplesPath = 'c:/Program Files/TallyPrimeDeveloper_7/Samples';
const SAMPLES_DIR = path.resolve(process.env.TDL_SAMPLES_DIR || samplesPath);
const hasSamples = fs.existsSync(SAMPLES_DIR);

describe.runIf(hasSamples)('WorkspaceScanner - Real Samples Folder', () => {

    it('should successfully scan the entire Tally samples directory', async () => {
        // Instantiate the test harness but inject a real file system adapter
        // so the scanner can read the actual sample files from disk.
        const harness = new ServerTestHarness({
            files: new NodeFileAccess() as any
        });

        const rootUri = URI.file(SAMPLES_DIR).toString();
        const startTime = Date.now();

        // 1. Initialize the workspace lifecycle (simulating VS Code flow)
        await harness.runtime.workspaceLifecycle.initialize({
            processId: null,
            rootUri: rootUri,
            capabilities: {
                workspace: {
                    workspaceFolders: true
                }
            },
            workspaceFolders: [{ uri: rootUri, name: 'Samples' }]
        });

        // 2. Start initialization (this triggers metadata load and scan)
        const initPromise = harness.runtime.workspaceLifecycle.initialized();

        // 3. Since initialized() overwrites scanner.onScanComplete, we wait for initialized() to resolve,
        // and then hook into onScanComplete to wait for the scan to finish.
        await initPromise;

        const scanPromise = new Promise<void>((resolve) => {
            const originalOnScanComplete = harness.runtime.services.workspaceScanner.onScanComplete;
            harness.runtime.services.workspaceScanner.onScanComplete = () => {
                if (originalOnScanComplete) originalOnScanComplete();
                resolve();
            };
        });

        await scanPromise;

        const duration = Date.now() - startTime;
        
        // Process any pending documents that might have been queued
        harness.runtime.documentLifecycle.processPendingDocuments();

        const symbolCount = harness.runtime.services.documentStateStore.tdlScopeManager.getSymbolCount();
        const docsCount = Array.from(harness.runtime.services.documentStateStore.getAllDocs()).length;

        console.log(`[WorkspaceScanner] Scanned samples folder in ${duration}ms`);
        console.log(`[WorkspaceScanner] Total symbols indexed: ${symbolCount}`);
        console.log(`[WorkspaceScanner] Total documents tracked: ${docsCount}`);

        expect(symbolCount).toBeGreaterThan(0);
    }, 120000); // Allow up to 2 minutes for this extensive scan

    it('should correctly migrate an already-opened sample file into the project graph', async () => {
        const harness = new ServerTestHarness({
            files: new NodeFileAccess() as any
        });

        const rootUri = URI.file(SAMPLES_DIR).toString();
        const samplesTxtUri = URI.file(SAMPLES_DIR + '/Samples.txt').toString();

        const docContent = fs.readFileSync(SAMPLES_DIR + '/Samples.txt', 'utf8');
        harness.simulateOpen(samplesTxtUri, 'tdl', docContent);

        // 2. Initialize the workspace lifecycle (simulating VS Code flow)
        await harness.runtime.workspaceLifecycle.initialize({
            processId: null,
            rootUri: rootUri,
            capabilities: {
                workspace: {
                    workspaceFolders: true
                }
            },
            workspaceFolders: [{ uri: rootUri, name: 'Samples' }]
        });

        const initPromise = harness.runtime.workspaceLifecycle.initialized();
        await initPromise;

        const scanPromise = new Promise<void>((resolve) => {
            const originalOnScanComplete = harness.runtime.services.workspaceScanner.onScanComplete;
            harness.runtime.services.workspaceScanner.onScanComplete = () => {
                if (originalOnScanComplete) originalOnScanComplete();
                resolve();
            };
        });

        const startTime = Date.now();
        await scanPromise;
        const duration = Date.now() - startTime;
        
        // 3. Process pending documents queued during the scan
        harness.runtime.documentLifecycle.processPendingDocuments();

        // 4. Verification
        console.log(`[WorkspaceScanner Migration] Scanned samples folder in ${duration}ms`);

        // Because Samples.txt is referenced in Samples.tpj, it should be marked as active and placed in the project scope
        const isWorkspaceScope = harness.runtime.services.documentStateStore.tdlScopeManager.isFileWorkspaceScope(samplesTxtUri);
        expect(isWorkspaceScope).toBe(false); 
        
        // Ensure its definitions are accessible globally via project scope
        const defs = harness.runtime.services.documentStateStore.tdlScopeManager.getGlobalDefinitionsByType('report', true);
        expect(defs.length).toBeGreaterThan(0);
        
        // 5. Verify getScopeAt at line 47, col 69 (which is line 46, character 68 0-indexed)
        const openDoc = harness.runtime.services.documentStateStore.getOpen(samplesTxtUri);
        expect(openDoc).toBeDefined();
        const docObj = openDoc?.document;
        expect(docObj).toBeDefined();
        
        // Find the offset of "TallyPrime" reference on line 47 (line index 46) dynamically
        const lineText = docObj!.getText().split(/\r?\n/)[46];
        const charIndex = lineText.indexOf('TallyPrime', lineText.indexOf('Menu'));
        console.log(`[DEBUG] lineText: "${lineText}"`);
        console.log(`[DEBUG] charIndex: ${charIndex}`);
        expect(charIndex).toBeGreaterThan(0);
        
        const position = { line: 46, character: charIndex + 2 }; // Place cursor inside "TallyPrime"
        const offset = docObj!.offsetAt(position);
        const definitionParams = {
            textDocument: { uri: samplesTxtUri },
            position
        };

        const result = await harness.runtime.navigation.definition(definitionParams);
        console.log(`[DEBUG] definition result:`, JSON.stringify(result, null, 2));
        expect(result).toBeDefined();
        
        // It should resolve to the definition in Whats New TallyPrime.txt
        const resolvedLocation = Array.isArray(result) ? result[0] : result;
        expect(resolvedLocation).toBeDefined();
        const locUri = (resolvedLocation as any).uri || (resolvedLocation as any).targetUri;
        const locRange = (resolvedLocation as any).range || (resolvedLocation as any).targetRange;
        expect(decodeURIComponent(locUri?.toLowerCase() || '')).toContain('whats new tallyprime.txt');
        
        // The start line in Whats New TallyPrime.txt should be line 5 (0-indexed line 4)
        expect(locRange.start.line).toBe(4);
    }, 120000); // Allow up to 2 minutes for this extensive scan
});
