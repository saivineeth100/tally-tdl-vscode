import * as fs from 'fs';
import * as v8 from 'v8';
import * as path from 'path';

const binPath = path.join(__dirname, '../../data/7.0_basetdl.bin');
console.log(`Loading ${binPath}...`);
const buffer = fs.readFileSync(binPath);
const manager = v8.deserialize(buffer);

let totalDefSize = 0;
let propsSize = {
    childScopes: 0,
    variables: 0,
    formulas: 0,
    definition: 0,
    structuralChildren: 0,
    uses: 0
};

let count = 0;

if (manager.scopeIndex) {
    for (const defMap of manager.scopeIndex.values()) {
        for (const sym of defMap.values()) {
            const buf = v8.serialize(sym);
            totalDefSize += buf.length;
            
            if (sym.childScopes) propsSize.childScopes += v8.serialize(sym.childScopes).length;
            if (sym.variables) propsSize.variables += v8.serialize(sym.variables).length;
            if (sym.formulas) propsSize.formulas += v8.serialize(sym.formulas).length;
            if (sym.definition) propsSize.definition += v8.serialize(sym.definition).length;
            if (sym.structuralChildren) propsSize.structuralChildren += v8.serialize(sym.structuralChildren).length;
            if (sym.uses) propsSize.uses += v8.serialize(sym.uses).length;
            
            count++;
        }
    }
}

console.log(`\nAnalyzed ${count} DefinitionScopes in scopeIndex`);
console.log(`Sum of DefinitionScope objects: ${(totalDefSize / 1024 / 1024).toFixed(2)} MB`);
console.log(`\n--- Internal Property Weights ---`);
console.log(`childScopes array: ${(propsSize.childScopes / 1024 / 1024).toFixed(2)} MB`);
console.log(`variables map: ${(propsSize.variables / 1024 / 1024).toFixed(2)} MB`);
console.log(`formulas map: ${(propsSize.formulas / 1024 / 1024).toFixed(2)} MB`);
console.log(`definition symbol info: ${(propsSize.definition / 1024 / 1024).toFixed(2)} MB`);
console.log(`structuralChildren map: ${(propsSize.structuralChildren / 1024 / 1024).toFixed(2)} MB`);
console.log(`uses set: ${(propsSize.uses / 1024 / 1024).toFixed(2)} MB`);
