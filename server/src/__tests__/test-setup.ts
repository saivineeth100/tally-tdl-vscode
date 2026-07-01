import { beforeAll, vi } from 'vitest';
import { ScopeManager } from '../semantics/scopeManager/index';
import * as path from 'path';

import * as fs from 'fs';
import { loadMetadata } from '../semantics/metadataLoader';

/**
 * Global ScopeManager instance shared across all tests
 */
export let testScopeManager: ScopeManager | undefined;

/**
 * Creates an isolated ScopeManager pre-populated with basic structural map for tests.
 */
export function createTestScopeManager(): ScopeManager {
    const manager = new ScopeManager();
    
    // Mock structural relationships needed for isolated tests
    manager.globalScope.interchangeableAttributesMap.set('form', 'form');
    manager.globalScope.interchangeableAttributesMap.set('forms', 'form');
    manager.globalScope.interchangeableAttributesMap.set('part', 'part');
    manager.globalScope.interchangeableAttributesMap.set('parts', 'part');
    manager.globalScope.interchangeableAttributesMap.set('line', 'line');
    manager.globalScope.interchangeableAttributesMap.set('lines', 'line');
    manager.globalScope.interchangeableAttributesMap.set('field', 'field');
    manager.globalScope.interchangeableAttributesMap.set('fields', 'field');
    manager.globalScope.interchangeableAttributesMap.set('collection', 'collection');
    manager.globalScope.interchangeableAttributesMap.set('system', 'system');
    
    return manager;
}

/**
 * Setup runs once before all tests
 * Loads TDL metadata for use in tests
 */
beforeAll(async () => {
    try {
        const metadataPath = path.join(__dirname, '..', '..', 'data');
        const binPath = path.join(metadataPath, '7.0.bin');
        
        testScopeManager = new ScopeManager();
        
        // Pass false to use the pre-built .bin cache instead of rebuilding from JSON
        await loadMetadata(metadataPath, "7.0", testScopeManager, false, false);
    } catch (error) {
        console.error('Test Setup Error:', error);
    }
}, 60000);
let isBaseTdlLoaded = false;

/**
 * Loads Base TDL definitions if not already loaded.
 * Tests that require base TDL should call this in their beforeAll.
 */
export async function ensureBaseTdlLoaded() {
    if (isBaseTdlLoaded || !testScopeManager) return;
    
    try {
        const metadataPath = path.join(__dirname, '..', '..', 'data');
        await loadMetadata(metadataPath, "7.0", testScopeManager, false, true);
        isBaseTdlLoaded = true;
    } catch (error) {
        console.error('Failed to load Base TDL in test:', error);
    }
}
