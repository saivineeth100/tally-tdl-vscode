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
    
    if (testScopeManager) {
        manager.globalScope.attributes = testScopeManager.globalScope.attributes;
        manager.globalScope.definitions = testScopeManager.globalScope.definitions;
        manager.globalScope.functions = testScopeManager.globalScope.functions;
        manager.globalScope.actions = testScopeManager.globalScope.actions;
        manager.globalScope.interchangeableTypesMap = testScopeManager.globalScope.interchangeableTypesMap;
        manager.globalScope.interchangeableAttributesMap = testScopeManager.globalScope.interchangeableAttributesMap;
        manager.globalScope.interchangeableTypesAliasesMap = testScopeManager.globalScope.interchangeableTypesAliasesMap;
    }
    
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
        
        // Pass true to rebuild metadata from JSON directly so that our metadata enhancements are active
        await loadMetadata(metadataPath, "7.0", testScopeManager, true, false);
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
