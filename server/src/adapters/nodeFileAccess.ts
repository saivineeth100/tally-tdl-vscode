import * as fs from 'fs';
import * as path from 'path';
import { FileAccess, FileStat } from '../ports/fileAccess';

export class NodeFileAccess implements FileAccess {
    async exists(filePath: string): Promise<boolean> {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    existsSync(filePath: string): boolean {
        return fs.existsSync(filePath);
    }

    async readFile(filePath: string, encoding: string = 'utf-8'): Promise<string> {
        const buffer = await fs.promises.readFile(filePath);
        // Auto-detect UTF-16LE BOM (FF FE) — Tally .tpj and .tdl files may use this encoding
        if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
            return buffer.toString('utf16le');
        }
        if (encoding === 'utf-16le' || encoding === 'utf16le') {
            return buffer.toString('utf16le');
        }
        return buffer.toString('utf-8');
    }

    async readDirectory(dirPath: string): Promise<string[]> {
        return fs.promises.readdir(dirPath);
    }

    async stat(filePath: string): Promise<FileStat | undefined> {
        try {
            const stats = await fs.promises.stat(filePath);
            return {
                isFile: () => stats.isFile(),
                isDirectory: () => stats.isDirectory(),
                size: stats.size,
                mtimeMs: stats.mtimeMs
            };
        } catch {
            return undefined;
        }
    }

    canonicalize(filePath: string): string {
        try {
            return fs.realpathSync.native(filePath);
        } catch {
            return path.resolve(filePath);
        }
    }
}
