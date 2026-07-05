export interface FileStat {
    isFile(): boolean;
    isDirectory(): boolean;
    size: number;
    mtimeMs: number;
}

/**
 * Centralizes filesystem operations needed by workspace indexing, include resolution, 
 * path completion, closed-document loading, rename, references, symbols, XML conversion, 
 * and cache generation. Exposes intent-level operations for tests and production.
 */
export interface FileAccess {
    exists(path: string): Promise<boolean>;
    existsSync(path: string): boolean;
    readFile(path: string, encoding?: string): Promise<string>;
    readDirectory(path: string): Promise<string[]>;
    stat(path: string): Promise<FileStat | undefined>;
    canonicalize(path: string): string;
}
