import * as fs from 'fs';
import * as path from 'path';
import * as v8 from 'v8';
import { ScopeManager, ScopeKind, DefinitionScope } from '../services/scopeManager';
import { loadMetadata } from '../services/metadataLoader';
import { Parser } from '../parser/parser';
import { buildFileScope } from '../services/scopeManager/scopeBuilder';
import { SourceFile } from '../parser/ast';
import { URI } from 'vscode-uri';
import { normalizeTypeName } from '../services/utils';

async function collectFiles(dirPath: string, fileList: string[] = []) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() || entry.isSymbolicLink()) {
            let isDir = entry.isDirectory();
            if (!isDir && entry.isSymbolicLink()) {
                try {
                    const stat = await fs.promises.stat(fullPath);
                    isDir = stat.isDirectory();
                } catch (e) {
                    // ignore
                }
            }

            if (isDir && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                await collectFiles(fullPath, fileList);
            }
        }
        
        if (entry.isFile() || entry.isSymbolicLink()) {
            let isFile = entry.isFile();
            if (!isFile && entry.isSymbolicLink()) {
                try {
                    const stat = await fs.promises.stat(fullPath);
                    isFile = stat.isFile();
                } catch (e) {
                    // ignore
                }
            }

            if (isFile) {
                const ext = entry.name.toLowerCase();
                if (ext.endsWith('.tdl') || ext.endsWith('.txt') || ext.endsWith('.dat') || ext.endsWith('.500') || ext.endsWith('.fld') || ext.endsWith('.mnu') || ext.endsWith('.900')) {
                    fileList.push(fullPath);
                }
            }
        }
    }
    return fileList;
}

import { Worker } from 'worker_threads';
import * as os from 'os';

function runWorker(workerData: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const workerPath = path.join(__dirname, 'cacheWorker.js');
        const worker = new Worker(workerPath, { workerData });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
        });
    });
}

async function scanAndParseParallel(baseTdlDir: string, scopeManager: ScopeManager, version: string) {
    const files = await collectFiles(baseTdlDir);
    console.log(`Found ${files.length} Base TDL files. Distributing across workers...`);

    const numCPUs = os.cpus().length || 4;
    const chunkSize = Math.ceil(files.length / numCPUs);
    
    // Extract function arities and attributes to send to workers
    const functionArities: Record<string, number | null> = {};
    for (const [name, func] of scopeManager.globalScope.functions.entries()) {
        let hasVarArgs = false;
        if (func.parameters) {
            for (const p of func.parameters) {
                if (p.IsList || p.IsVariableArgument) hasVarArgs = true;
            }
            functionArities[name.toLowerCase()] = hasVarArgs ? null : func.parameters.length;
        } else {
            functionArities[name.toLowerCase()] = null;
        }
    }

    const attributeTypes: Record<string, Record<string, string>> = {};
    for (const [defType, attrMap] of scopeManager.globalScope.attributes.entries()) {
        const typeMap: Record<string, string> = {};
        for (const [attrName, sym] of attrMap.entries()) {
            if (sym.type) typeMap[attrName] = sym.type;
        }
        attributeTypes[defType] = typeMap;
    }

    const interchangeableAttributes = scopeManager.globalScope.interchangeableAttributesMap 
        ? Object.fromEntries(scopeManager.globalScope.interchangeableAttributesMap.entries())
        : {};

    const promises = [];
    for (let i = 0; i < numCPUs; i++) {
        const chunk = files.slice(i * chunkSize, (i + 1) * chunkSize);
        if (chunk.length === 0) continue;
        
        promises.push(runWorker({
            files: chunk,
            baseTdlDir,
            version,
            functionArities,
            attributeTypes,
            interchangeableAttributes
        }));
    }

    let totalParsed = 0;
    let totalErrors = 0;

    const results = await Promise.all(promises);

    console.log(`\nWorkers finished. Merging results into main ScopeManager...`);
    for (const result of results) {
        totalParsed += result.stats.parsed;
        totalErrors += result.stats.errors;

        // Merge globalScope.definitions
        for (const [defType, map] of result.globalScopeDefs.entries()) {
            let targetMap = scopeManager.globalScope.definitions.get(defType);
            if (!targetMap) {
                targetMap = new Map();
                scopeManager.globalScope.definitions.set(defType, targetMap);
            }
            for (const [name, sym] of map.entries()) {
                targetMap.set(name, sym);
            }
        }

        // Merge scopeIndex
        for (const [defType, map] of result.scopeIndex.entries()) {
            let targetMap = scopeManager.scopeIndex.get(defType);
            if (!targetMap) {
                targetMap = new Map();
                scopeManager.scopeIndex.set(defType, targetMap);
            }
            for (const [name, sym] of map.entries()) {
                targetMap.set(name, sym);
            }
        }

        // Merge definitionTypeLabels
        for (const [norm, orig] of result.definitionTypeLabels.entries()) {
            scopeManager.definitionTypeLabels.set(norm, orig);
        }

        // Merge referenceIndex identifierToUris
        for (const [id, uris] of result.referenceIndex.identifierToUris.entries()) {
            let targetSet = scopeManager.globalScope.referenceIndex.identifierToUris.get(id);
            if (!targetSet) {
                targetSet = new Set();
                scopeManager.globalScope.referenceIndex.identifierToUris.set(id, targetSet);
            }
            for (const uri of uris) {
                targetSet.add(uri);
            }
        }
        
        // Merge referenceIndex uriToIdentifiers
        for (const [uri, ids] of result.referenceIndex.uriToIdentifiers.entries()) {
            scopeManager.globalScope.referenceIndex.uriToIdentifiers.set(uri, ids);
        }

        // Merge modifierContributions
        for (const [typeAndName, mods] of result.modifierContributions.entries()) {
            let targetMods = scopeManager.modifierContributions.get(typeAndName);
            if (!targetMods) {
                targetMods = [];
                scopeManager.modifierContributions.set(typeAndName, targetMods);
            }
            for (const mod of mods) {
                targetMods.push(mod);
            }
        }
        // Merge nameIndex
        for (const [name, syms] of result.nameIndex.entries()) {
            let targetSyms = scopeManager.nameIndex.get(name);
            if (!targetSyms) {
                targetSyms = [];
                scopeManager.nameIndex.set(name, targetSyms);
            }
            targetSyms.push(...syms);
        }

        // Merge projectVariables
        for (const [name, sym] of result.projectVariables.entries()) {
            scopeManager.projectScope.variables.set(name, sym);
        }

        // Merge projectFormulas
        for (const [name, sym] of result.projectFormulas.entries()) {
            scopeManager.projectScope.formulas.set(name, sym);
        }

        // Merge Sets
        const mergeSets = (source: Map<string, Set<string>>, target: Map<string, Set<string>>) => {
            for (const [key, set] of source.entries()) {
                let targetSet = target.get(key);
                if (!targetSet) {
                    targetSet = new Set();
                    target.set(key, targetSet);
                }
                for (const val of set) {
                    targetSet.add(val);
                }
            }
        };

        mergeSets(result.parentDefinitions, scopeManager.parentDefinitions);
        mergeSets(result.childDefinitions, scopeManager.childDefinitions);
        mergeSets(result.useInheritance, scopeManager.useInheritance);
        mergeSets(result.inUseInheritance, scopeManager.inUseInheritance);

        // Merge globalFunctions
        for (const [name, sym] of result.globalFunctions.entries()) {
            scopeManager.globalScope.functions.set(name, sym);
        }

        // Merge globalActions
        for (const [name, sym] of result.globalActions.entries()) {
            scopeManager.globalScope.actions.set(name, sym);
        }

        // Merge includedFiles
        for (const file of result.includedFiles) {
            scopeManager.includedFiles.add(file);
        }

        // Merge uriGraphContributions
        for (const [uri, contribs] of result.uriGraphContributions.entries()) {
            let targetContribs = scopeManager.uriGraphContributions.get(uri);
            if (!targetContribs) {
                targetContribs = {
                    parentDefs: new Set(),
                    childDefs: new Set(),
                    useInherit: new Set(),
                    inUseInherit: new Set(),
                    includes: new Set(),
                    modifiers: new Set()
                };
                scopeManager.uriGraphContributions.set(uri, targetContribs);
            }
            for (const item of contribs.parentDefs) targetContribs.parentDefs.add(item);
            for (const item of contribs.childDefs) targetContribs.childDefs.add(item);
            for (const item of contribs.useInherit) targetContribs.useInherit.add(item);
            for (const item of contribs.inUseInherit) targetContribs.inUseInherit.add(item);
            for (const item of contribs.includes) targetContribs.includes.add(item);
            for (const item of contribs.modifiers) targetContribs.modifiers.add(item);
        }
    }

    const stats = { parsed: totalParsed, errors: totalErrors };
    return stats;
}

async function buildCacheForVersion(version: string) {
    const dataPath = path.join(__dirname, '..', '..', 'data');
    const versionPath = path.join(dataPath, version);

    if (!fs.existsSync(versionPath)) {
        console.warn(`Version folder not found: ${versionPath}`);
        return;
    }

    console.log(`Building cache for version: ${version}...`);

    // Create a pristine ScopeManager with its SymbolTable
    const scopeManager = new ScopeManager();

    // Phase 1: Load all JSON meta files into the ScopeManager
    console.log(`Loading JSON metadata...`);
    await loadMetadata(dataPath, version, scopeManager, true);

    // Serialize metadata cache
    console.time("Serializing Metadata Cache");
    const metadataCacheFile = path.join(dataPath, `${version}_metadata.bin`);
    console.log(`Serializing Metadata to ${metadataCacheFile}...`);
    const metaBuffer = v8.serialize(scopeManager);
    fs.writeFileSync(metadataCacheFile, metaBuffer);
    console.timeEnd("Serializing Metadata Cache");

    // Phase 2: Parse Base TDL files if directory is provided
    const baseTdlDir = process.argv[2];
    if (baseTdlDir && fs.existsSync(baseTdlDir)) {
        console.log(`Scanning Base TDL files in ${baseTdlDir}...`);
        console.time("Scanning and Parsing Base TDL");
        const stats = await scanAndParseParallel(baseTdlDir, scopeManager, version);
        
        console.log(`\nCompleted scanning ${stats.parsed} files with ${stats.errors} errors.`);

        if (stats.errors > 0 && stats.errors > stats.parsed * 0.1) {
            console.error(`\nWarning: ${stats.errors} files failed to parse (${(stats.errors / (stats.parsed + stats.errors) * 100).toFixed(1)}% error rate)`);
            console.error(`The generated cache may be incomplete.`);
        }

        console.timeEnd("Scanning and Parsing Base TDL");

        // Move the parsed Base TDL definitions from projectScope to globalScope
        console.time("Shifting to Global Scope");
        console.log(`Shifting Base TDL definitions to Global Scope...`);
        for (const [defType, defMap] of scopeManager.scopeIndex.entries()) {
            let globalDefMap = scopeManager.globalScope.definitions.get(defType);
            if (!globalDefMap) {
                globalDefMap = new Map();
                scopeManager.globalScope.definitions.set(defType, globalDefMap);
            }
            for (const [name, sym] of defMap.entries()) {
                if (sym.kind === ScopeKind.Definition) {
                    const ds = sym as DefinitionScope;
                    if (ds.definition) {
                        globalDefMap.set(name, ds.definition);
                    }
                }
                
                // Sever parent links for ALL scopes in scopeIndex (Definitions, Functions, etc.)
                // so V8 doesn't pull in the 5,000+ FileScope tree
                const baseScope = sym as any;
                if (baseScope.parent && baseScope.parent.kind === ScopeKind.File) {
                    baseScope.parent = undefined;
                }
            }
        }

        // Sever links in modifierContributions too
        if (scopeManager.modifierContributions) {
            for (const mods of scopeManager.modifierContributions.values()) {
                for (const sym of mods.values()) {
                    const baseScope = sym as any;
                    if (baseScope.parent && baseScope.parent.kind === ScopeKind.File) {
                        baseScope.parent = undefined;
                    }
                }
            }
        }

        // Force clear the ProjectScope's children array to ensure FileScopes are dropped
        scopeManager.projectScope.childScopes = [];
        for (const [name, sym] of scopeManager.projectScope.variables.entries()) {
            scopeManager.globalScope.variables.set(name, sym);
        }
        for (const [name, sym] of scopeManager.projectScope.formulas.entries()) {
            scopeManager.globalScope.formulas.set(name, sym);
        }

        // Transfer referenceIndex to globalScope so it's cached in Base TDL
        scopeManager.globalScope.referenceIndex = scopeManager.projectScope.referenceIndex;

        // Clear projectScope to save space and avoid duplication
        // We do NOT clear scopeIndex anymore, as we replaced its entries with lightweight scopes above
        scopeManager.projectScope.variables.clear();
        scopeManager.projectScope.formulas.clear();
        
        // Replace projectScope's referenceIndex with a fresh one so the massive Map isn't serialized twice!
        const { ReferenceIndex } = require('../services/referenceIndex');
        scopeManager.projectScope.referenceIndex = new ReferenceIndex();
        
        // Clear fileMap to save massive amounts of cache size, as it's not loaded from basetdl.bin
        scopeManager.fileMap.clear();
        
        console.timeEnd("Shifting to Global Scope");

        // Clear metadata fields from globalScope before serializing basetdl to avoid duplication
        scopeManager.globalScope.functions.clear();
        scopeManager.globalScope.actions.clear();
        scopeManager.globalScope.attributes.clear();
        scopeManager.globalScope.schemas.clear();
        scopeManager.globalScope.interchangeableTypesMap?.clear();
        scopeManager.globalScope.interchangeableAttributesMap?.clear();
        scopeManager.keywordSets?.clear();
        scopeManager.definitionTypeLabels?.clear();

        // Serialize basetdl cache
        console.time("Serializing Base TDL Cache");
        const basetdlCacheFile = path.join(dataPath, `${version}_basetdl.bin`);
        console.log(`Serializing Base TDL ScopeManager to ${basetdlCacheFile}...`);

        const baseBuffer = v8.serialize(scopeManager);
        fs.writeFileSync(basetdlCacheFile, baseBuffer);

        console.timeEnd("Serializing Base TDL Cache");
        console.log(`Successfully built caches for version ${version}. Metadata: ${(metaBuffer.length / 1024 / 1024).toFixed(2)} MB, Base TDL: ${(baseBuffer.length / 1024 / 1024).toFixed(2)} MB\n`);
    } else {
        console.log(`Successfully built metadata cache for version ${version} (${(metaBuffer.length / 1024 / 1024).toFixed(2)} MB)\n`);
    }
}

async function main() {
    const baseTdlDir = process.argv[2];
    if (baseTdlDir && !fs.existsSync(baseTdlDir)) {
        console.error(`Error: Base TDL directory not found: ${baseTdlDir}`);
        console.error(`Usage: ts-node buildVersionCache.ts [path/to/base/tdl/files]`);
        process.exit(1);
    }

    const dataPath = path.join(__dirname, '..', '..', 'data');

    // Get all supported versions from the data directory
    const entries = await fs.promises.readdir(dataPath, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            // Check if it looks like a version folder (e.g., '7.0', '8.0')
            if (/^\d+\.\d+$/.test(entry.name)) {
                await buildCacheForVersion(entry.name);
            }
        }
    }
}

main().catch(err => {
    console.error("Error building version cache:", err);
    process.exit(1);
});
