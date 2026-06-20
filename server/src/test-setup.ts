import { beforeAll } from 'vitest';
import { ScopeManager } from './services/scopeManager/index';
import { SymbolTable } from './services/symbolTable';
import * as path from 'path';

import * as v8 from 'v8';
import * as fs from 'fs';

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
        const cachePath = path.join(__dirname, '..', 'data', 'test-metadata-cache.bin');
        
        if (fs.existsSync(cachePath)) {
            const buffer = fs.readFileSync(cachePath);
            const deserialized = v8.deserialize(buffer);
            Object.setPrototypeOf(deserialized, ScopeManager.prototype);
            if (deserialized.symbolTable) {
                Object.setPrototypeOf(deserialized.symbolTable, SymbolTable.prototype);
            }
            testScopeManager = deserialized;
        } else {
            console.error('Test Setup Error: TDL metadata cache not found! Run "npm run test:setup" first.');
        }
    } catch (error) {
        console.error('Test Setup Error:', error);
    }
}, 30000);
