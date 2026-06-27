import fs from 'fs';
import path from 'path';
import v8 from 'v8';
import { ScopeManager } from './src/services/scopeManager';

function load() {
    const binPath = path.join(__dirname, 'dist', 'data', '9.0.bin');
    if (!fs.existsSync(binPath)) {
        console.log("No 9.0.bin found at", binPath);
        return;
    }
    const buffer = fs.readFileSync(binPath);
    const deserialized = v8.deserialize(buffer);

    const manager = new ScopeManager();
    if (deserialized.fileMap) {
        manager.fileMap = deserialized.fileMap;
        for (const fileScope of manager.fileMap.values()) {
            manager.indexScope(fileScope);
        }
    }
    if (deserialized.childDefinitions) {
        manager.childDefinitions = deserialized.childDefinitions;
    }

    const report = manager.getScopeById('report:daybook');
    console.log("Report Daybook found?", !!report);
    if (report) {
        const children = manager.childDefinitions.get('report:daybook');
        console.log("Child definitions for Daybook:", children);
        
        if (children) {
            for (const childId of children) {
                const childScope = manager.getScopeById(childId);
                console.log("Child scope found for", childId, "?", !!childScope);
            }
        }
    }
}

load();
