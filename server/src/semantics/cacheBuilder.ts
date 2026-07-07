import * as fs from 'fs';
import * as path from 'path';
import * as v8 from 'v8';
import { ScopeManager } from './scopeManager/index';
import { Parser } from '../core/parser/parser';
import { buildFileScope } from './scopeManager/scopeBuilder';
import { normalizeTypeName } from '../utils/normalizeUtils';
import { execSync } from 'child_process';
import * as os from 'os';

/**
 * Scans a folder for TDL files, parses them, constructs a ScopeManager containing 
 * all definition metadata, and serializes it to a binary cache file (`library.bin`)
 * inside the folder.
 * 
 * @param folderPath The directory to scan and compile.
 * @returns The absolute path of the generated `library.bin` file.
 */
export async function buildCustomLibraryCache(folderPath: string): Promise<string> {
    const scopeManager = new ScopeManager();

    await scanAndParse(folderPath, scopeManager, folderPath);

    const cacheFile = path.join(folderPath, 'library.bin');
    const buffer = v8.serialize(scopeManager);
    await fs.promises.writeFile(cacheFile, buffer);
    return cacheFile;
}

/**
 * Recursively walks a directory to find, read, and parse TDL files.
 * The parsed definitions are built into the shared ScopeManager.
 * 
 * @param dirPath The current directory being scanned.
 * @param scopeManager The ScopeManager accumulating file scopes and definitions.
 * @param basePath The base directory path used to generate relative virtual URIs.
 */
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

/**
 * Compresses the compiled binary cache files for a specific version into a ZIP archive.
 * Looks for `${version}_metadata.bin` and `${version}_basetdl.bin` in the data path,
 * and zips them into `cache_${version}.zip` in the same directory.
 * 
 * This uses a cross-platform approach: PowerShell `Compress-Archive` on Windows,
 * and the native `zip` command-line utility on Unix-like environments.
 * 
 * @param version The Tally version identifier (e.g., '7.0').
 * @param dataPath The directory where cache binary files are stored.
 * @returns The absolute path to the generated ZIP archive.
 */
export async function zipVersionCache(version: string, dataPath: string): Promise<string> {
    const metaBinName = `${version}_metadata.bin`;
    const baseBinName = `${version}_basetdl.bin`;
    const zipName = `cache_${version}.zip`;
    const destZipPath = path.join(dataPath, zipName);

    const filesToZip = [
        path.join(dataPath, metaBinName),
        path.join(dataPath, baseBinName)
    ].filter(f => fs.existsSync(f));

    if (filesToZip.length === 0) {
        throw new Error(`No cache files found to zip for version ${version} in ${dataPath}`);
    }

    console.log(`Zipping cache files for version ${version} to ${destZipPath}...`);
    
    if (fs.existsSync(destZipPath)) {
        fs.rmSync(destZipPath, { force: true });
    }

    if (os.platform() === 'win32') {
        const pathsStr = filesToZip.map(f => `'${path.resolve(f)}'`).join(', ');
        execSync(`powershell -Command "Compress-Archive -Path ${pathsStr} -DestinationPath '${path.resolve(destZipPath)}' -Force"`, { stdio: 'inherit' });
    } else {
        const relativeNames = filesToZip.map(f => path.basename(f)).join(' ');
        execSync(`zip -q -r "${path.resolve(destZipPath)}" ${relativeNames}`, { cwd: dataPath, stdio: 'inherit' });
    }

    return destZipPath;
}

/**
 * Compresses the Samples directory of a Tally installation for a specific version.
 * If the provided directory has a `Samples` subfolder, it zips that folder; otherwise,
 * it zips the provided directory itself. The resulting file is saved as `samples_${version}.zip`.
 * 
 * This uses a cross-platform approach: PowerShell `Compress-Archive` on Windows,
 * and the native `zip` command-line utility on Unix-like environments.
 * 
 * @param version The Tally version identifier (e.g., '7.0').
 * @param baseTdlDir The root Tally installation directory or the Samples folder path.
 * @param dataPath The destination directory where the ZIP archive will be saved.
 * @returns The absolute path to the generated ZIP archive.
 */
export async function zipSamplesFolder(version: string, baseTdlDir: string, dataPath: string): Promise<string> {
    let targetSamplesDir = path.resolve(baseTdlDir);
    const subSamplesDir = path.join(targetSamplesDir, 'Samples');
    if (fs.existsSync(subSamplesDir) && fs.statSync(subSamplesDir).isDirectory()) {
        targetSamplesDir = subSamplesDir;
    }

    const zipName = `samples_${version}.zip`;
    const destZipPath = path.join(dataPath, zipName);

    console.log(`Zipping samples from ${targetSamplesDir} to ${destZipPath}...`);

    if (fs.existsSync(destZipPath)) {
        fs.rmSync(destZipPath, { force: true });
    }

    if (os.platform() === 'win32') {
        execSync(`powershell -Command "Compress-Archive -Path '${targetSamplesDir}' -DestinationPath '${path.resolve(destZipPath)}' -Force"`, { stdio: 'inherit' });
    } else {
        const parentDir = path.dirname(targetSamplesDir);
        const dirName = path.basename(targetSamplesDir);
        execSync(`zip -q -r "${path.resolve(destZipPath)}" "${dirName}"`, { cwd: parentDir, stdio: 'inherit' });
    }

    return destZipPath;
}
