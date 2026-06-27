import * as fs from 'fs';
import * as path from 'path';
import * as v8 from 'v8';
import { ScopeManager } from '../services/scopeManager';
import { SymbolTable } from '../services/symbolTable';
import { loadMetadata } from '../services/metadataLoader';
import { Parser } from '../parser/parser';
import { buildFileScope } from '../services/scopeManager/scopeBuilder';
import { SourceFile } from '../parser/ast';
import { URI } from 'vscode-uri';
import { normalizeTypeName } from '../services/utils';

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

async function buildCacheForVersion(version: string) {
    const dataPath = path.join(__dirname, '..', '..', 'data');
    const versionPath = path.join(dataPath, version);

    if (!fs.existsSync(versionPath)) {
        console.warn(`Version folder not found: ${versionPath}`);
        return;
    }

    console.log(`Building cache for version: ${version}...`);

    // Create a pristine ScopeManager with its SymbolTable
    const symbolTable = new SymbolTable();
    const scopeManager = new ScopeManager(symbolTable);

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
        for (const [defType, defMap] of scopeManager.projectScope.definitions.entries()) {
            let globalDefMap = scopeManager.globalScope.definitions.get(defType);
            if (!globalDefMap) {
                globalDefMap = new Map();
                scopeManager.globalScope.definitions.set(defType, globalDefMap);
            }
            for (const [name, sym] of defMap.entries()) {
                globalDefMap.set(name, sym);
            }
        }
        for (const [name, sym] of scopeManager.projectScope.variables.entries()) {
            scopeManager.globalScope.variables.set(name, sym);
        }
        for (const [name, sym] of scopeManager.projectScope.formulas.entries()) {
            scopeManager.globalScope.formulas.set(name, sym);
        }

        // Clear projectScope to save space and avoid duplication
        scopeManager.projectScope.definitions.clear();
        scopeManager.projectScope.variables.clear();
        scopeManager.projectScope.formulas.clear();
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
