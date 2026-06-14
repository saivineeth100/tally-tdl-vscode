import { normalizeTypeName } from './utils';

/**
 * Enumeration of symbol kinds for TDL definitions
 */
export enum SymbolKind {
    Report = 'Report',
    Form = 'Form',
    Part = 'Part',
    Line = 'Line',
    Field = 'Field',
    Menu = 'Menu',
    Collection = 'Collection',
    Function = 'Function',
    Variable = 'Variable',
    Button = 'Button',
    Key = 'Key',
    Border = 'Border',
    Style = 'Style',
    Color = 'Color',
    Object = 'Object',
    Unknown = 'Unknown'
}

/**
 * Information about a symbol in the TDL codebase
 */
export interface SymbolInfo {
    /** Name of the symbol */
    name: string;
    /** Kind of symbol (Report, Field, etc.) */
    kind: SymbolKind;
    /** URI of the document containing this symbol */
    uri: string;
    /** Start offset in the document */
    start: number;
    /** End offset in the document */
    end: number;
    /** The definition type as written in code (e.g., "Report", "Field") */
    definitionType: string;
    /** Optional parent symbol (for nested definitions) */
    parent?: string;
    /** Child symbols (attributes, nested definitions) */
    children?: SymbolInfo[];
    /** Whether this symbol is a modifier (e.g., #Report) */
    isModifier?: boolean;
}

/**
 * Symbol table for tracking all TDL definitions across documents
 * Provides efficient lookup by name, document, and position
 */
export class SymbolTable {
    /** Map of document URI to symbols in that document */
    private documentSymbols = new Map<string, SymbolInfo[]>();
    /** Map of normalized symbol name (lowercase, no spaces) to all symbols with that name */
    private nameIndex = new Map<string, SymbolInfo[]>();

    /**
     * Normalize a name for indexing - uses shared normalizeTypeName
     */
    private normalizeName(name: string): string {
        return normalizeTypeName(name);
    }

    /**
     * Add a symbol to the table
     * @param symbol Symbol information to add
     */
    addSymbol(symbol: SymbolInfo): void {
        // Add to document symbols
        const docSymbols = this.documentSymbols.get(symbol.uri) || [];
        docSymbols.push(symbol);
        this.documentSymbols.set(symbol.uri, docSymbols);

        // Add to name index (normalized: lowercase, no spaces)
        const normalizedName = this.normalizeName(symbol.name);
        const namedSymbols = this.nameIndex.get(normalizedName) || [];
        namedSymbols.push(symbol);
        this.nameIndex.set(normalizedName, namedSymbols);
    }

    /**
     * Find a symbol by name in a specific document
     * @param name Symbol name (case-insensitive)
     * @param uri Document URI to search in
     * @returns Symbol info or undefined if not found
     */
    findSymbol(name: string, uri: string): SymbolInfo | undefined {
        const normalizedName = this.normalizeName(name);
        const symbols = this.nameIndex.get(normalizedName);
        if (!symbols) return undefined;

        // First try to find in the same document
        const sameDocSymbol = symbols.find(s => s.uri === uri);
        if (sameDocSymbol) return sameDocSymbol;

        // Otherwise return any matching symbol
        return symbols[0];
    }

    /**
     * Find all symbols with the given name across all documents
     * @param name Symbol name (case-insensitive)
     * @returns Array of matching symbols
     */
    findAllByName(name: string): SymbolInfo[] {
        const normalizedName = this.normalizeName(name);
        return this.nameIndex.get(normalizedName) || [];
    }

    /**
     * Get all symbols in a specific document
     * @param uri Document URI
     * @returns Array of symbols in the document
     */
    getSymbolsInDocument(uri: string): SymbolInfo[] {
        return this.documentSymbols.get(uri) || [];
    }

    /**
     * Find symbol at a specific position in a document
     * @param uri Document URI
     * @param offset Character offset in the document
     * @returns Symbol at the position or undefined
     */
    findSymbolAt(uri: string, offset: number): SymbolInfo | undefined {
        const symbols = this.documentSymbols.get(uri);
        if (!symbols) return undefined;

        // Find the innermost symbol containing this position
        let result: SymbolInfo | undefined;
        for (const symbol of symbols) {
            if (offset >= symbol.start && offset <= symbol.end) {
                // If we find a more specific (smaller range) symbol, use it
                if (!result || (symbol.end - symbol.start < result.end - result.start)) {
                    result = symbol;
                }
            }
        }
        return result;
    }

    /**
     * Clear all symbols for a specific document
     * @param uri Document URI to clear
     */
    clearDocument(uri: string): void {
        const symbols = this.documentSymbols.get(uri);
        if (symbols) {
            // Remove from name index
            for (const symbol of symbols) {
                const normalizedName = this.normalizeName(symbol.name);
                const namedSymbols = this.nameIndex.get(normalizedName);
                if (namedSymbols) {
                    const filtered = namedSymbols.filter(s => s.uri !== uri);
                    if (filtered.length > 0) {
                        this.nameIndex.set(normalizedName, filtered);
                    } else {
                        this.nameIndex.delete(normalizedName);
                    }
                }
            }
            // Remove document entry
            this.documentSymbols.delete(uri);
        }
    }

    /**
     * Clear all symbols for all documents in a specific folder path
     * @param folderPath Folder path to clear (absolute path)
     */
    clearFolder(folderPath: string): void {
        const normalizedFolder = folderPath.toLowerCase().replace(/\\/g, '/');
        const urisToDelete: string[] = [];

        // Find all URIs that start with the folder path
        for (const uri of this.documentSymbols.keys()) {
            // Convert file URI to path-like structure for comparison, or just check if it starts with the folder path
            // e.g. file:///c:/folder/file.tdl
            const decodedUri = decodeURIComponent(uri).toLowerCase();
            if (decodedUri.includes(normalizedFolder)) {
                urisToDelete.push(uri);
            }
        }

        for (const uri of urisToDelete) {
            this.clearDocument(uri);
        }
    }

    /**
     * Find all symbols of a specific kind
     * @param kind Symbol kind to search for
     * @returns Array of matching symbols
     */
    findByKind(kind: SymbolKind): SymbolInfo[] {
        const result: SymbolInfo[] = [];
        for (const symbols of this.documentSymbols.values()) {
            for (const symbol of symbols) {
                if (symbol.kind === kind) {
                    result.push(symbol);
                }
            }
        }
        return result;
    }

    /**
     * Get all unique symbol names of a specific kind
     * @param kind Symbol kind to search for
     * @returns Array of unique symbol names
     */
    getNamesByKind(kind: SymbolKind): string[] {
        const names = new Set<string>();
        for (const symbols of this.documentSymbols.values()) {
            for (const symbol of symbols) {
                if (symbol.kind === kind) {
                    names.add(symbol.name);
                }
            }
        }
        return Array.from(names);
    }

    /**
     * Get total count of symbols in the table
     */
    getSymbolCount(): number {
        let count = 0;
        for (const symbols of this.documentSymbols.values()) {
            count += symbols.length;
        }
        return count;
    }

    /**
     * Search for symbols matching a query and optional type filter
     * @param query Search query (name match)
     * @param typeFilter Optional type filter (e.g. "Report", "Field")
     * @param maxResults Maximum number of results to return
     * @returns Array of matching symbols
     */
    searchSymbols(query: string, typeFilter?: string, maxResults: number = 100): SymbolInfo[] {
        const result: SymbolInfo[] = [];
        const lowerQuery = query.toLowerCase();
        const lowerTypeFilter = typeFilter?.toLowerCase();

        for (const symbols of this.documentSymbols.values()) {
            for (const symbol of symbols) {
                // Check type filter
                if (lowerTypeFilter) {
                    const kindStr = symbol.kind.toLowerCase();
                    const defTypeStr = symbol.definitionType.toLowerCase();
                    if (kindStr !== lowerTypeFilter && defTypeStr !== lowerTypeFilter) {
                        continue;
                    }
                }

                // Check name
                if (!lowerQuery || symbol.name.toLowerCase().includes(lowerQuery)) {
                    result.push(symbol);
                    if (result.length >= maxResults) {
                        return result;
                    }
                }
            }
        }
        return result;
    }

    /**
     * Clear all symbols from the table
     */
    clear(): void {
        this.documentSymbols.clear();
        this.nameIndex.clear();
    }
}

/**
 * Map TDL definition type string to SymbolKind
 * @param definitionType The definition type from the AST
 * @returns Corresponding SymbolKind
 */
export function definitionTypeToSymbolKind(definitionType: string): SymbolKind {
    const upperType = definitionType.toUpperCase();
    switch (upperType) {
        case 'REPORT': return SymbolKind.Report;
        case 'FORM': return SymbolKind.Form;
        case 'PART': return SymbolKind.Part;
        case 'LINE': return SymbolKind.Line;
        case 'FIELD': return SymbolKind.Field;
        case 'MENU': return SymbolKind.Menu;
        case 'COLLECTION': return SymbolKind.Collection;
        case 'FUNCTION': return SymbolKind.Function;
        case 'VARIABLE': return SymbolKind.Variable;
        case 'BUTTON': return SymbolKind.Button;
        case 'KEY': return SymbolKind.Key;
        case 'BORDER': return SymbolKind.Border;
        case 'STYLE': return SymbolKind.Style;
        case 'COLOR': return SymbolKind.Color;
        case 'OBJECT': return SymbolKind.Object;
        default: return SymbolKind.Unknown;
    }
}
