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
        
        // Pass false so that it loads the metadata from the downloaded binary cache
        await loadMetadata(metadataPath, "7.0", testScopeManager, false, false);

        // Add fallback mock formula for tests requiring base TDL formulas (like completion tests)
        // when the binary cache has not been downloaded or built.
        testScopeManager.globalScope.formulas.set('dspmstnamestylestr', {
            name: 'DSPMSTNameStyleStr',
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Formula'
        } as any);
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

/**
 * Populates all metadata-related fields on a ServerTestHarness or standard scope managers.
 */
export function populateMetadata(harness: any) {
    if (!testScopeManager) return;
    
    const tdlMgr = harness.runtime?.services?.documentStateStore?.tdlScopeManager || harness.tdlScopeManager;
    const xmlMgr = harness.runtime?.services?.documentStateStore?.xmlScopeManager || harness.xmlScopeManager;

    if (tdlMgr) {
        tdlMgr.globalScope = testScopeManager.globalScope;
        tdlMgr.keywordSets = testScopeManager.keywordSets;
        tdlMgr.primarySchemaNames = testScopeManager.primarySchemaNames;
        tdlMgr.definitionTypeLabels = testScopeManager.definitionTypeLabels;
        tdlMgr.parentDefinitions = testScopeManager.parentDefinitions;
        tdlMgr.childDefinitions = testScopeManager.childDefinitions;
        tdlMgr.useInheritance = testScopeManager.useInheritance;
        tdlMgr.inUseInheritance = testScopeManager.inUseInheritance;
    }

    if (xmlMgr) {
        xmlMgr.globalScope = testScopeManager.globalScope;
        xmlMgr.keywordSets = testScopeManager.keywordSets;
        xmlMgr.primarySchemaNames = testScopeManager.primarySchemaNames;
        xmlMgr.definitionTypeLabels = testScopeManager.definitionTypeLabels;
        xmlMgr.parentDefinitions = testScopeManager.parentDefinitions;
        xmlMgr.childDefinitions = testScopeManager.childDefinitions;
        xmlMgr.useInheritance = testScopeManager.useInheritance;
        xmlMgr.inUseInheritance = testScopeManager.inUseInheritance;
    }
}
