import { CompletionItem, CompletionItemKind } from 'vscode-languageserver/node';
import * as fs from 'fs';
import * as path from 'path';
import { URI } from 'vscode-uri';

export async function provideFilePathCompletions(
    documentUri: string,
    partial: string,
    workspaceFolders?: string[]
): Promise<CompletionItem[]> {
    const items: CompletionItem[] = [];
    try {
        const currentFsPath = URI.parse(documentUri).fsPath;
        const currentDir = path.dirname(currentFsPath);
        
        const partialPath = partial.replace(/['"]/g, '');

        if (workspaceFolders && workspaceFolders.length > 0) {
            // Suggest all valid files in the workspace, with paths relative to current file
            const allFiles: string[] = [];
            
            async function scanDir(dir: string, depth: number = 0) {
                if (depth > 5) return; // limit depth
                try {
                    const entries = await fs.promises.readdir(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        if (entry.name.startsWith('.')) continue;
                        if (entry.name === 'node_modules') continue;
                        
                        const fullPath = path.join(dir, entry.name);
                        if (entry.isDirectory()) {
                            await scanDir(fullPath, depth + 1);
                        } else if (entry.isFile()) {
                            const ext = path.extname(entry.name).toLowerCase();
                            if (ext === '.txt' || ext === '.tdl' || ext === '.xml' || ext === '.tdlxml') {
                                allFiles.push(fullPath);
                            }
                        }
                    }
                } catch (e) {
                    // Ignore errors
                }
            }

            for (const folder of workspaceFolders) {
                await scanDir(folder);
            }

            for (const filePath of allFiles) {
                if (filePath === currentFsPath) continue; // Skip self
                
                let relPath = path.relative(currentDir, filePath);
                // Convert to forward slashes or backslashes. Standardize on backslashes for TDL, but typically either works.
                // We'll keep whatever path.relative gives but prefer forward slashes for cross-platform, but TDL is Windows only usually.
                // Let's use backslashes as it's standard in TDL.
                relPath = relPath.replace(/\//g, '\\');
                
                // If the user typed a partial path, filter
                if (partialPath === '' || relPath.toLowerCase().includes(partialPath.toLowerCase()) || path.basename(filePath).toLowerCase().includes(partialPath.toLowerCase())) {
                    items.push({
                        label: path.basename(filePath),
                        kind: CompletionItemKind.File,
                        detail: relPath,
                        insertText: relPath,
                        sortText: '0_' + path.basename(filePath)
                    });
                }
            }
        } else {
            // Fallback to old behavior if no workspace folders
            let searchDir = currentDir;
            let searchPrefix = partialPath;

            if (partialPath.includes('/') || partialPath.includes('\\')) {
                const lastSlash = Math.max(partialPath.lastIndexOf('/'), partialPath.lastIndexOf('\\'));
                const dirPart = partialPath.substring(0, lastSlash);
                searchPrefix = partialPath.substring(lastSlash + 1);
                searchDir = path.resolve(currentDir, dirPart);
            }

            if (fs.existsSync(searchDir)) {
                const entries = await fs.promises.readdir(searchDir, { withFileTypes: true });
                
                for (const entry of entries) {
                    if (searchPrefix === '' || entry.name.toLowerCase().startsWith(searchPrefix.toLowerCase())) {
                        if (entry.isFile()) {
                            const ext = path.extname(entry.name).toLowerCase();
                            if (ext === '.txt' || ext === '.tdl' || ext === '.xml' || ext === '.tdlxml') {
                                items.push({
                                    label: entry.name,
                                    kind: CompletionItemKind.File,
                                    detail: 'File',
                                    insertText: entry.name
                                });
                            }
                        } else if (entry.isDirectory()) {
                            items.push({
                                label: entry.name,
                                kind: CompletionItemKind.Folder,
                                detail: 'Directory',
                                insertText: entry.name + '\\'
                            });
                        }
                    }
                }
            }
        }
    } catch (err) {
        // Ignore fs errors silently for autocomplete
    }

    return items;
}
