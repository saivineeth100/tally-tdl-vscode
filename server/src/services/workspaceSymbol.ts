import { SymbolInformation, SymbolKind as LSPSymbolKind, WorkspaceSymbolParams, TextDocuments, CancellationToken } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager, readFileWithEncoding } from '../docManager';
import { SymbolKind } from './symbolTable';
import { symbolKindToLSPSymbolKind } from './scopeManager/types';
import { offsetToPosition } from '../utils/positionUtils';

import * as fs from 'fs';
import { URI } from 'vscode-uri';

export async function getWorkspaceSymbols(
    params: WorkspaceSymbolParams, 
    docManager: DocManager,
    docs: TextDocuments<TextDocument>,
    token?: CancellationToken
): Promise<SymbolInformation[]> {
    let query = params.query.trim();
    let typeFilter: string | undefined;

    // Extract type filter if query starts with:
    // 1. type: (e.g. "report:daybook")
    // 2. #type (e.g. "#report daybook")
    // 3. @type (e.g. "@report daybook")
    // 4. #type: (e.g. "#report:daybook")
    const colonMatch = query.match(/^[@#]?([a-zA-Z0-9_]+):(.*)$/);
    if (colonMatch) {
        typeFilter = colonMatch[1].trim();
        query = colonMatch[2].trim();
    } else {
        const hashMatch = query.match(/^[@#]([a-zA-Z0-9_]+)\s*(.*)$/);
        if (hashMatch) {
            typeFilter = hashMatch[1].trim();
            query = hashMatch[2].trim();
        }
    }

    const result: SymbolInformation[] = [];
    const MAX_RESULTS = 100;
    
    const tdlSymbols = docManager.tdlScopeManager.searchWorkspaceSymbols(query, typeFilter, MAX_RESULTS);
    const xmlSymbols = docManager.xmlScopeManager.searchWorkspaceSymbols(query, typeFilter, MAX_RESULTS);
    const matchedSymbols = [...tdlSymbols, ...xmlSymbols].slice(0, MAX_RESULTS);

    for (const sym of matchedSymbols) {
        if (token?.isCancellationRequested) return [];
        let range = {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
        };

        const textDoc = docs.get(sym.uri);
        if (textDoc) {
            range = {
                start: textDoc.positionAt(sym.start),
                end: textDoc.positionAt(sym.end)
            };
        } else {
            // Document not open, read from disk to compute position
            try {
                const filePath = URI.parse(sym.uri).fsPath;
                const content = await readFileWithEncoding(filePath);
                range = {
                    start: offsetToPosition(content, sym.start),
                    end: offsetToPosition(content, sym.end)
                };
            } catch (err) {
                // Ignore errors reading closed files, default to 0,0
                console.warn(`[workspaceSymbol] Error reading file ${sym.uri}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
            }
        }

        // Extract the exact prefix the user typed (e.g. "#report:", "report:") to prepend to the name
        // This is the ONLY reliable way to bypass VS Code's strict client-side fuzzy filter which drops
        // results that don't contain the typed query.
        let finalName = sym.name;
        if (typeFilter) {
            // Find the portion of the query that represents the type filter
            const prefixLength = params.query.length - query.length;
            const typedPrefix = params.query.substring(0, prefixLength).trim();
            finalName = `${typedPrefix} ${sym.name}`;
        }

        result.push({
            name: finalName,
            kind: symbolKindToLSPSymbolKind(sym.kind),
            containerName: sym.definitionType,
            location: {
                uri: sym.uri,
                range: range
            }
        });
    }
    
    return result;
}



