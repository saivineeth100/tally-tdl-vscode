import { beforeAll } from 'vitest';
import { TdlMetadata } from './tdlMetaData';
import * as path from 'path';

/**
 * Global metadata instance shared across all tests
 */
export let testMetadata: TdlMetadata | undefined;

/**
 * Setup runs once before all tests
 * Loads TDL metadata for use in semantic token tests
 */
beforeAll(async () => {
    console.log('Loading TDL metadata for tests...');

    const metadataPath = path.join(__dirname, '..', 'data');
    testMetadata = new TdlMetadata(metadataPath, "7.0");

    try {
        await testMetadata.load();
        console.log('✓ TDL metadata loaded successfully');
    } catch (error) {
        console.warn('⚠ Failed to load metadata, tests will run without it:', error);
        testMetadata = undefined;
    }
}, 60000); // Increase timeout to 60s for slow environments
