import * as fs from 'fs';
import * as path from 'path';
import * as v8 from 'v8';
import { ScopeManager, ScopeKind, DefinitionScope } from '../semantics/scopeManager/index';
import { loadMetadata } from '../semantics/metadataLoader';
import { Parser } from '../core/parser/parser';
import { buildFileScope } from '../semantics/scopeManager/scopeBuilder';
import { SourceFile } from '../core/ast/ast';
import { URI } from 'vscode-uri';
import { normalizeTypeName } from '../utils/normalizeUtils';
import { zipVersionCache, zipSamplesFolder } from '../semantics/cacheBuilder';

async function scanAndParse(dirPath: string, scopeManager: ScopeManager, version: string, stats: { parsed: number, errors: number }, baseTdlDir: string) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory() || entry.isSymbolicLink()) {
            // Need to check if symbolic link is a directory
            let isDir = entry.isDirectory();
            if (!isDir && entry.isSymbolicLink()) {
                try {
                    const stat = await fs.promises.stat(fullPath);
                    isDir = stat.isDirectory();
                } catch (e) {
                    // ignore broken symlinks
                }
            }

            if (isDir) {
                if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    await scanAndParse(fullPath, scopeManager, version, stats, baseTdlDir);
                }
            }
        }
        
        if (entry.isFile() || entry.isSymbolicLink()) {
            let isFile = entry.isFile();
            if (!isFile && entry.isSymbolicLink()) {
                try {
                    const stat = await fs.promises.stat(fullPath);
                    isFile = stat.isFile();
                } catch (e) {
                    // ignore broken symlinks
                }
            }

            if (isFile) {
                const ext = entry.name.toLowerCase();
                if (ext.endsWith('.tdl') || ext.endsWith('.txt') || ext.endsWith('.dat') || ext.endsWith('.500') || ext.endsWith('.fld') || ext.endsWith('.mnu') || ext.endsWith('.900')) {
                    try {
                        const buffer = await fs.promises.readFile(fullPath);
                        let content = '';
                        if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
                            content = buffer.toString('utf16le');
                        } else {
                            content = buffer.toString('utf-8');
                        }

                        // Need function arity for proper parsing
                        const getFunctionArity = (name: string): number | null => {
                            const func = scopeManager.globalScope.functions.get(name.toLowerCase());
                            if (!func || !func.parameters) return null;
                            let hasVarArgs = false;
                            for (const p of func.parameters) {
                                if (p.IsList || p.IsVariableArgument) hasVarArgs = true;
                            }
                            return hasVarArgs ? null : func.parameters.length;
                        };

                        const parser = new Parser(content, undefined, getFunctionArity);
                        const sourceFile = parser.parse();

                        // Generate a virtual URI for this file so we don't leak local paths
                        const relativePath = path.relative(baseTdlDir, fullPath).replace(/\\/g, '/');
                        const virtualUri = `basetdl://base/${version}/${relativePath}`;

                        // Build the scope for this file directly into the scopeManager's project/global scopes
                        buildFileScope(scopeManager, virtualUri, sourceFile);
                        
                        // Index references for the UI
                        scopeManager.globalScope.referenceIndex.indexFile(virtualUri, sourceFile);

                        // Populate definition type labels to retain original casing
                        for (const def of sourceFile.definitions) {
                            if (def.type && def.type.text) {
                                scopeManager.definitionTypeLabels.set(normalizeTypeName(def.type.text), def.type.text);
                            }
                        }
                        stats.parsed++;
                        if (stats.parsed % 100 === 0) {
                            process.stdout.write(`\rParsed ${stats.parsed} files...`);
                        }
                    } catch (err) {
                        stats.errors++;
                        console.error(`\nError parsing ${fullPath}:`, err);
                    }
                }
            }
        }
    }
}

async function buildCacheForVersion(version: string, baseTdlDir?: string, skipSamples?: boolean, samplesDir?: string) {
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
    if (baseTdlDir && fs.existsSync(baseTdlDir)) {
        console.log(`Scanning Base TDL files in ${baseTdlDir}...`);
        console.time("Scanning and Parsing Base TDL");
        const stats = { parsed: 0, errors: 0 };
        await scanAndParse(baseTdlDir, scopeManager, version, stats, baseTdlDir);
        
        console.log(`\nCompleted scanning ${stats.parsed} files with ${stats.errors} errors.`);

        if (stats.errors > 0 && stats.errors > stats.parsed * 0.1) {
            console.error(`\nWarning: ${stats.errors} files failed to parse (${(stats.errors / (stats.parsed + stats.errors) * 100).toFixed(1)}% error rate)`);
            console.error(`The generated cache may be incomplete.`);
        }

        console.timeEnd("Scanning and Parsing Base TDL");

        // Move the parsed Base TDL definitions from projectScope to globalScope
        console.time("Shifting to Global Scope");
        console.log(`Shifting Base TDL definitions to Global Scope...`);
        for (const [defType, defScopes] of scopeManager.scopeIndex.entries()) {
            let globalDefMap = scopeManager.globalScope.definitions.get(defType);
            if (!globalDefMap) {
                globalDefMap = new Map();
                scopeManager.globalScope.definitions.set(defType, globalDefMap);
            }
            for (const [name, syms] of defScopes.entries()) {
                for (const sym of syms) {
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
        }

        // Sever links in modifierContributions too
        if (scopeManager.modifierContributions) {
            for (const mods of scopeManager.modifierContributions.values()) {
                for (const sym of mods) {
                    if (sym.scope) {
                        const baseScope = sym.scope as any;
                        if (baseScope.parent && baseScope.parent.kind === ScopeKind.File) {
                            baseScope.parent = undefined;
                        }
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
        // (It is already populated in globalScope.referenceIndex during scanAndParse)

        // Clear projectScope to save space and avoid duplication
        // We do NOT clear scopeIndex anymore, as we replaced its entries with lightweight scopes above
        scopeManager.projectScope.variables.clear();
        scopeManager.projectScope.formulas.clear();
        
        // Replace projectScope's referenceIndex with a fresh one so the massive Map isn't serialized twice!
        const { ReferenceIndex } = require('../semantics/symbols/referenceIndex');
        scopeManager.projectScope.referenceIndex = new ReferenceIndex();
        
        // Clear fileMap to save massive amounts of cache size, as it's not loaded from basetdl.bin
        scopeManager.fileMap.clear();
        
        // Clear uriGraphContributions to save massive amounts of cache size, as it's not loaded from basetdl.bin
        scopeManager.uriGraphContributions.clear();
        
        console.timeEnd("Shifting to Global Scope");

        // Clear metadata fields from globalScope before serializing basetdl to avoid duplication
        scopeManager.globalScope.functions.clear();
        scopeManager.globalScope.actions.clear();
        scopeManager.globalScope.attributes.clear();
        scopeManager.globalScope.schemas.clear();
        scopeManager.globalScope.interchangeableTypesMap?.clear();
        scopeManager.globalScope.interchangeableAttributesMap?.clear();
        scopeManager.globalScope.interchangeableTypesAliasesMap?.clear();
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

        try {
            await zipVersionCache(version, dataPath);
            if (!skipSamples) {
                const targetSamplesDir = samplesDir || baseTdlDir;
                if (targetSamplesDir && fs.existsSync(targetSamplesDir)) {
                    await zipSamplesFolder(version, targetSamplesDir, dataPath);
                } else {
                    console.warn(`[Warning] Samples directory not found or not specified: ${targetSamplesDir}. Skipping samples zip.`);
                }
            } else {
                console.log(`[Skip] Skipping samples zip generation for version ${version}.`);
            }
        } catch (zipErr) {
            console.error(`Failed to zip cache files or samples for version ${version}:`, zipErr);
        }
    } else {
        console.log(`Successfully built metadata cache for version ${version} (${(metaBuffer.length / 1024 / 1024).toFixed(2)} MB)\n`);
    }
}

/**
 * Entry point for the cache builder script.
 * Processes command-line arguments to construct and compress version cache files.
 * 
 * ### Command-line Usage:
 * ```bash
 * ts-node buildVersionCache.ts [path/to/base/tdl/files] [--skip-samples]
 * ```
 * 
 * ### Arguments & Environment Variables:
 * - `[path/to/base/tdl/files]` *(Optional)*: The absolute or relative path to the Tally 
 *   installation folder containing the base TDL files (usually the `Samples` folder). If provided,
 *   the script will scan, parse, and generate the full base TDL structure cache (`*_basetdl.bin`).
 * - `--skip-samples` *(Optional)*: If provided, skips creating the companion `samples_${version}.zip` 
 *   archive containing the base TDL source files.
 * - `SKIP_SAMPLES=true` *(Optional Environment Variable)*: Serves as an alternative way to bypass 
 *   samples zip generation.
 */
async function main() {
    const args = process.argv.slice(2);
    const skipSamples = args.includes('--skip-samples') || process.env.SKIP_SAMPLES === 'true';
    
    // Parse --samples-dir <path>
    let samplesDir = process.env.SAMPLES_DIR || 'C:\\Program Files\\TallyPrimeDeveloper_7';
    const samplesDirIndex = args.indexOf('--samples-dir');
    if (samplesDirIndex !== -1 && samplesDirIndex + 1 < args.length) {
        samplesDir = args[samplesDirIndex + 1];
    }
    
    // Filter out --samples-dir and its value from args
    const filteredArgs = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--samples-dir') {
            i++; // skip next arg
            continue;
        }
        filteredArgs.push(args[i]);
    }
    
    const positionalArgs = filteredArgs.filter(arg => !arg.startsWith('--'));
    const baseTdlDir = positionalArgs[0];

    if (baseTdlDir && !fs.existsSync(baseTdlDir)) {
        console.error(`Error: Base TDL directory not found: ${baseTdlDir}`);
        console.error(`Usage: ts-node buildVersionCache.ts [path/to/base/tdl/files] [--skip-samples] [--samples-dir <path>]`);
        process.exit(1);
    }

    const dataPath = path.join(__dirname, '..', '..', 'data');

    // Get all supported versions from the data directory
    const entries = await fs.promises.readdir(dataPath, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            // Check if it looks like a version folder (e.g., '7.0', '8.0')
            if (/^\d+\.\d+$/.test(entry.name)) {
                await buildCacheForVersion(entry.name, baseTdlDir, skipSamples, samplesDir);
            }
        }
    }
}

main().catch(err => {
    console.error("Error building version cache:", err);
    process.exit(1);
});
