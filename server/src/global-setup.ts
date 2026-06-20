import * as path from 'path';
import * as fs from 'fs';
import * as v8 from 'v8';
import { loadMetadata } from './services/metadataLoader';
import { ScopeManager } from './services/scopeManager/index';
import { SymbolTable } from './services/symbolTable';

export default async function setup() {
    const metadataPath = path.join(__dirname, '..', 'data');
    const cachePath = path.join(__dirname, '..', 'data', 'test-metadata-cache.bin');

    if (!fs.existsSync(cachePath)) {
        console.log('Global Setup: Building TDL metadata cache...');
        const dummyTable = new SymbolTable();
        const testScopeManager = new ScopeManager(dummyTable);
        await loadMetadata(metadataPath, "7.0", testScopeManager);
        
        const buffer = v8.serialize(testScopeManager);
        fs.writeFileSync(cachePath, buffer);
        console.log('Global Setup: TDL metadata cache built successfully.');
    } else {
        console.log('Global Setup: TDL metadata cache already exists.');
    }
}
