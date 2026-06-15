import { getMetadata, setMetadata } from './services/metadataService';
import { beforeAll } from 'vitest';
import { TdlMetadata } from './tdlMetaData';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as v8 from 'v8';

/**
 * Global metadata instance shared across all tests
 */
export let testMetadata: TdlMetadata | undefined = getMetadata();

/**
 * Setup runs once before all tests
 * Loads TDL metadata for use in semantic token tests
 */
beforeAll(async () => {
    if (getMetadata()) {
        testMetadata = getMetadata();
        return; // Already loaded in this worker thread
    }

    try {
        const cachePath = path.join(os.tmpdir(), 'tdl-metadata-cache.bin');
        if (fs.existsSync(cachePath)) {
            const buffer = fs.readFileSync(cachePath);
            const md = v8.deserialize(buffer);
            Object.setPrototypeOf(md, TdlMetadata.prototype);
            testMetadata = md;
            setMetadata(md as any);
            return;
        }

        console.log('Loading TDL metadata for tests (fallback)...');
        const metadataPath = path.join(__dirname, '..', 'data');
        testMetadata = new TdlMetadata(metadataPath, "7.0");
        await testMetadata.load();
        setMetadata(testMetadata as any);
        console.log('✓ TDL metadata loaded successfully');
    } catch (error) {
        console.warn('⚠ Failed to load metadata, tests will run without it:', error);
        testMetadata = undefined;
    }
}, 60000); // Increase timeout to 60s for slow environments
