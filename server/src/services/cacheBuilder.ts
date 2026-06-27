import * as fs from 'fs';
import * as path from 'path';
import * as v8 from 'v8';
import { ScopeManager } from './scopeManager/index';
import { SymbolTable } from './symbolTable';
import { Parser } from '../parser/parser';
import { buildFileScope } from './scopeManager/scopeBuilder';
import { normalizeTypeName } from './utils';

export async function buildCustomLibraryCache(folderPath: string): Promise<string> {
    const symbolTable = new SymbolTable();
    const scopeManager = new ScopeManager(symbolTable);

    await scanAndParse(folderPath, scopeManager, folderPath);

    const cacheFile = path.join(folderPath, 'library.bin');
    const buffer = v8.serialize(scopeManager);
    await fs.promises.writeFile(cacheFile, buffer);
    return cacheFile;
}

async function scanAndParse(dirPath: string, scopeManager: ScopeManager, basePath: string) {
    const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                await scanAndParse(fullPath, scopeManager, basePath);
            }
        } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.tdl')) {
            try {
                const content = await fs.promises.readFile(fullPath, 'utf-8');
                
                const getFunctionArity = (name: string): number | null => null;

                const parser = new Parser(content, undefined, getFunctionArity);
                const sourceFile = parser.parse();

                const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');
                const virtualUri = `basetdl://custom/${relativePath}`;

                buildFileScope(scopeManager, virtualUri, sourceFile);

                for (const def of sourceFile.definitions) {
                    if (def.type && def.type.text) {
                        scopeManager.definitionTypeLabels.set(normalizeTypeName(def.type.text), def.type.text);
                    }
                }
            } catch (err) {
                console.error(`Error parsing ${fullPath}:`, err);
            }
        }
    }
}
