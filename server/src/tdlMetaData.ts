import * as fsasync from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { TDLFunction } from './models/tdlFunction';
async function loadJsonSafe(filePath: string): Promise<any> {
    return fs.existsSync(filePath) ? JSON.parse(await fsasync.readFile(filePath, 'utf-8')) : {};
}

export class TdlMetadata {
    functions: TDLFunction[] = [];
    constructor(private basePath: string, private version: string) { }

    async load() {
        const defaultVersion = "6.0";
        var versionPath = path.join(this.basePath, defaultVersion);
        var functionsPath = path.join(versionPath, "Function");
        const functionFiles = await fsasync.readdir(functionsPath);
        for (const functionFile of functionFiles) {
            if (functionFile !== "AllFunctions.json") {
                var functions = await loadJsonSafe(path.join(functionsPath, functionFile));
                for (const tfunction of Object.keys(functions)) {
                    this.functions.push(TDLFunction.FromJSON(functions[tfunction]));
                }
            }
        }
    }
}