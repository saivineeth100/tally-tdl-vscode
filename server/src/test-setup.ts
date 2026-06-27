import { beforeAll } from 'vitest';
import { ScopeManager } from './services/scopeManager/index';
import { SymbolTable } from './services/symbolTable';
import * as path from 'path';

import * as fs from 'fs';
import { loadMetadata } from './services/metadataLoader';

/**
 * Global ScopeManager instance shared across all tests
 */
export let testScopeManager: ScopeManager | undefined;

/**
 * Creates an isolated ScopeManager pre-populated with basic structural map for tests.
 */
export function createTestScopeManager(symbolTable?: SymbolTable): ScopeManager {
    const st = symbolTable || new SymbolTable();
    const manager = new ScopeManager(st);
    
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
        const metadataPath = path.join(__dirname, '..', 'data');
        const binPath = path.join(metadataPath, '7.0.bin');
        
        const dummyTable = new SymbolTable();
        testScopeManager = new ScopeManager(dummyTable);
        
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
        const metadataPath = path.join(__dirname, '..', 'data');
        const baseBinPath = path.join(metadataPath, '7.0_basetdl.bin');
        if (fs.existsSync(baseBinPath)) {
            const v8 = require('v8');
            const buffer = fs.readFileSync(baseBinPath);
            const deserialized = v8.deserialize(buffer) as ScopeManager;
            
            testScopeManager.globalScope.definitions = deserialized.globalScope.definitions;
            testScopeManager.globalScope.variables = deserialized.globalScope.variables;
            testScopeManager.globalScope.formulas = deserialized.globalScope.formulas;
            
            if (deserialized.childDefinitions) testScopeManager.childDefinitions = deserialized.childDefinitions;
            if (deserialized.parentDefinitions) testScopeManager.parentDefinitions = deserialized.parentDefinitions;
            if (deserialized.useInheritance) testScopeManager.useInheritance = deserialized.useInheritance;
            if (deserialized.inUseInheritance) testScopeManager.inUseInheritance = deserialized.inUseInheritance;
            if (deserialized.fileMap) {
                testScopeManager.fileMap = deserialized.fileMap;
                for (const fileScope of testScopeManager.fileMap.values()) {
                    testScopeManager.indexScope(fileScope);
                }
            }
            if (deserialized.modifierContributions) testScopeManager.modifierContributions = deserialized.modifierContributions;
            if (deserialized.uriGraphContributions) testScopeManager.uriGraphContributions = deserialized.uriGraphContributions;
            
            isBaseTdlLoaded = true;
        }
    } catch (error) {
        console.error('Failed to load Base TDL in test:', error);
    }
}
