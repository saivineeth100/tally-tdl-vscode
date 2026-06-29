import * as fs from 'fs';
import * as v8 from 'v8';
import * as path from 'path';

const binPath = path.join(__dirname, '../../data/7.0_basetdl.bin');
console.log(`Loading ${binPath}...`);
const buffer = fs.readFileSync(binPath);
const manager = v8.deserialize(buffer);

console.log(`Total File Size: ${(buffer.length / 1024 / 1024).toFixed(2)} MB`);
console.log("\n--- Top Level Properties ---");

for (const key of Object.keys(manager)) {
    try {
        const propBuffer = v8.serialize(manager[key]);
        const sizeMB = propBuffer.length / 1024 / 1024;
        if (sizeMB > 0.1) {
            console.log(`${key}: ${sizeMB.toFixed(2)} MB`);
        }
    } catch (e) {
        // Skip functions or non-serializable props
    }
}

if (manager.scopeIndex) {
    console.log("\n--- scopeIndex Breakdown ---");
    for (const [defType, defMap] of manager.scopeIndex.entries()) {
        const propBuffer = v8.serialize(defMap);
        const sizeMB = propBuffer.length / 1024 / 1024;
        if (sizeMB > 1.0) {
            console.log(`  ${defType}: ${sizeMB.toFixed(2)} MB`);
        }
    }
}

if (manager.globalScope) {
    console.log("\n--- globalScope Breakdown ---");
    for (const key of Object.keys(manager.globalScope)) {
        try {
            const propBuffer = v8.serialize(manager.globalScope[key]);
            const sizeMB = propBuffer.length / 1024 / 1024;
            if (sizeMB > 0.1) {
                console.log(`  globalScope.${key}: ${sizeMB.toFixed(2)} MB`);
            }
        } catch (e) {}
    }
}
