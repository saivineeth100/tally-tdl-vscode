import { beforeAll } from 'vitest';
import { ScopeManager } from './services/scopeManager/index';
import { SymbolTable } from './services/symbolTable';
import { loadMetadata } from './services/metadataLoader';
import * as path from 'path';

/**
 * Global ScopeManager instance shared across all tests
 */
export let testScopeManager: ScopeManager | undefined;

/**
 * Setup runs once before all tests
 * Loads TDL metadata for use in tests
 */
beforeAll(async () => {
    try {
        console.log('Loading TDL metadata for tests...');
        const metadataPath = path.join(__dirname, '..', 'data');
        const dummyTable = new SymbolTable();
        testScopeManager = new ScopeManager(dummyTable);
        await loadMetadata(metadataPath, "7.0", testScopeManager);
        console.log('✓ TDL metadata loaded successfully');
    } catch (error) {
        console.warn('⚠ Failed to load metadata, tests will run without it:', error);
        testScopeManager = undefined;
    }
}, 60000); // Increase timeout to 60s for slow environments
