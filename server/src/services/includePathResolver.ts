import * as path from 'path';
import { FileAccess } from '../ports/fileAccess';

/**
 * Owns workspace roots and resolves includes in this order:
 * 1. relative to the current file;
 * 2. relative to each active workspace root.
 * 
 * It uses FileAccess, returns canonical paths when possible, 
 * and has no dependency on global variables.
 */
export class IncludePathResolver {
    constructor(
        private fileAccess: FileAccess,
        private getWorkspaceFolders: () => string[]
    ) {}

    /**
     * Resolves an include directive to an absolute file path.
     * Returns null if the file cannot be found.
     * 
     * @param currentFilePath The absolute path to the file containing the include.
     * @param includeName The literal path/name specified in the include directive.
     */
    async resolveIncludePath(currentFilePath: string, includeName: string): Promise<string | null> {
        // 1. Try relative to current file's directory
        const relativePath = path.resolve(path.dirname(currentFilePath), includeName);
        if (await this.fileAccess.exists(relativePath)) {
            return this.fileAccess.canonicalize(relativePath);
        }

        // 2. Try relative to each workspace folder root
        const workspaceFolders = this.getWorkspaceFolders();
        for (const folder of workspaceFolders) {
            const rootPath = path.resolve(folder, includeName);
            if (await this.fileAccess.exists(rootPath)) {
                return this.fileAccess.canonicalize(rootPath);
            }
        }

        // File not found
        return null;
    }
}
