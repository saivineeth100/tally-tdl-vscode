import { SymbolInformation, SymbolKind as LSPSymbolKind, WorkspaceSymbolParams, CancellationToken } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocumentStateStore } from '../services/documentStateStore';
import { DocumentRepository } from '../ports/documentRepository';
import { DocumentLoader } from '../services/documentLoader';
import { SymbolKind } from 'tally-tdl-shared';
import { symbolKindToLSPSymbolKind } from '../semantics/scopeManager/types';
import { offsetToPosition } from '../utils/positionUtils';

import * as fs from 'fs';
import { URI } from 'vscode-uri';

export async function getWorkspaceSymbols(
    queryInput: string, 
    stateStore: DocumentStateStore,
    docs: DocumentRepository,
    documentLoader: DocumentLoader,
    token?: CancellationToken
): Promise<SymbolInformation[]> {
    let query = queryInput.trim();
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
    
    const matchedSymbols: any[] = [];
    for (const [uri] of stateStore.getAllIndexedUris()) {
        if (token?.isCancellationRequested) break;
        const scopeMgr = stateStore.getScopeManager(uri);
        if (scopeMgr) {
            matchedSymbols.push(...scopeMgr.searchWorkspaceSymbols(query, typeFilter, MAX_RESULTS));
        }
    }
    const finalMatchedSymbols = matchedSymbols.slice(0, MAX_RESULTS);

    for (const sym of finalMatchedSymbols) {
        if (token?.isCancellationRequested) return [];
        let range = {
            start: { line: 0, character: 0 },
            end: { line: 0, character: 0 }
        };

        if (sym.selectionRange) {
            range = sym.selectionRange;
        } else {
            const textDoc = await documentLoader.loadDocument(sym.uri);
            if (textDoc) {
                range = {
                    start: textDoc.positionAt(sym.start),
                    end: textDoc.positionAt(sym.end)
                };
            }
        }

        // Extract the exact prefix the user typed (e.g. "#report:", "report:") to prepend to the name
        // This is the ONLY reliable way to bypass VS Code's strict client-side fuzzy filter which drops
        // results that don't contain the typed query.
        let finalName = sym.name;
        if (typeFilter) {
            // Find the portion of the query that represents the type filter
            const prefixLength = queryInput.length - query.length;
            const typedPrefix = queryInput.substring(0, prefixLength).trim();
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



