import { SymbolInformation, SymbolKind as LSPSymbolKind, WorkspaceSymbolParams, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager } from '../docManager';
import { SymbolKind } from './symbolTable';

import * as fs from 'fs';
import { URI } from 'vscode-uri';

export function getWorkspaceSymbols(
    params: WorkspaceSymbolParams, 
    docManager: DocManager,
    docs: TextDocuments<TextDocument>
): SymbolInformation[] {
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
    
    const matchedSymbols = docManager.symbolTable.searchSymbols(query, typeFilter, MAX_RESULTS);

    for (const sym of matchedSymbols) {
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
                const content = fs.readFileSync(filePath, 'utf-8');
                range = {
                    start: getPositionAt(content, sym.start),
                    end: getPositionAt(content, sym.end)
                };
            } catch (e) {
                // Ignore errors reading closed files, default to 0,0
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
            kind: mapToLspSymbolKind(sym.kind),
            containerName: sym.definitionType,
            location: {
                uri: sym.uri,
                range: range
            }
        });
    }
    
    return result;
}

/**
 * Computes line and character position from offset for a given text content.
 */
function getPositionAt(content: string, offset: number): { line: number, character: number } {
    let line = 0;
    let character = 0;
    const limit = Math.min(offset, content.length);
    for (let i = 0; i < limit; i++) {
        if (content[i] === '\n') {
            line++;
            character = 0;
        } else {
            character++;
        }
    }
    return { line, character };
}

function mapToLspSymbolKind(kind: SymbolKind): LSPSymbolKind {
    switch (kind) {
        case SymbolKind.Collection: return LSPSymbolKind.Class;
        case SymbolKind.Report: return LSPSymbolKind.Class;
        case SymbolKind.Field: return LSPSymbolKind.Field;
        case SymbolKind.Form: return LSPSymbolKind.Class;
        case SymbolKind.Part: return LSPSymbolKind.Class;
        case SymbolKind.Line: return LSPSymbolKind.Class;
        case SymbolKind.Menu: return LSPSymbolKind.Class;
        case SymbolKind.Button: return LSPSymbolKind.Method;
        case SymbolKind.Key: return LSPSymbolKind.Event;
        case SymbolKind.Function: return LSPSymbolKind.Function;
        case SymbolKind.Variable: return LSPSymbolKind.Variable;
        default: return LSPSymbolKind.Object;
    }
}
