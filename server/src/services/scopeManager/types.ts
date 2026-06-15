import { SymbolInfo, SymbolKind } from '../symbolTable';
import { SemanticTokenTypes } from 'vscode-languageserver';

/**
 * Types of scopes in TDL
 */
export enum ScopeKind {
    Global = 'Global',       // Metadata (System definitions)
    Project = 'Project',     // User defined global definitions (Collection, Report, etc.)
    File = 'File',           // File-level definitions (if any explicit local scope exists)
    Definition = 'Definition', // Inside a definition ([Report: ...])
    Block = 'Block',         // Inside a block (e.g. Function body)
    Local = 'Local'          // Specific local context
}

/**
 * Interface for Offset-based Range (simpler than vscode Range)
 */
export interface OffsetRange {
    start: number;
    end: number;
}

/**
 * Represents a scope in the symbol hierarchy
 */
export interface Scope {
    /** Unique ID for the scope */
    id: string;
    /** Kind of scope */
    kind: ScopeKind;
    /** Parent scope (undefined for Global) */
    parent?: Scope;
    /** Child scopes */
    children: Scope[];
    /** Symbols defined directly in this scope */
    symbols: Map<string, SymbolInfo>;
    /** Range in the document where this scope is valid (undefined for Global/Project) */
    range?: OffsetRange;
    /** Optional URI if tied to a file */
    uri?: string;
}

export interface ScopeNodeDTO {
    id: string;
    kind: string;
    range?: OffsetRange;
    structuralParents?: string[];
    structuralChildren?: string[];
    usedDefinitions?: string[];
    symbols: { name: string, kind: string, definitionType?: string }[];
    children: ScopeNodeDTO[];
}

export interface ScopeTreeDTO {
    globalScope: ScopeNodeDTO;
    projectScope: ScopeNodeDTO;
}

/**
 * Helper to map TDL definition type string to SymbolKind
 */
export function definitionTypeToSymbolKind(defType: string): SymbolKind {
    switch (defType.toLowerCase()) {
        case 'collection': return SymbolKind.Collection;
        case 'report': return SymbolKind.Report;
        case 'field': return SymbolKind.Field;
        case 'form': return SymbolKind.Form;
        case 'part': return SymbolKind.Part;
        case 'line': return SymbolKind.Line;
        case 'menu': return SymbolKind.Menu;
        case 'button': return SymbolKind.Button;
        case 'key': return SymbolKind.Key;
        case 'import': return SymbolKind.Unknown; // Import is special
        case 'variable': return SymbolKind.Variable;
        case 'system': return SymbolKind.Variable; // System variables
        // Add other mappings as needed
        default: return SymbolKind.Variable; // Generic fallback
    }
}

/**
 * Helper to map Symbol Info to Semantic Token Type
 */
export function getSemanticTypeFromSymbol(symbol: SymbolInfo): string {
    switch (symbol.kind) {
        case SymbolKind.Collection:
        case SymbolKind.Report:
        case SymbolKind.Field:
        case SymbolKind.Form:
        case SymbolKind.Part:
        case SymbolKind.Line:
        case SymbolKind.Menu:
        case SymbolKind.Button:
        case SymbolKind.Key:
        case SymbolKind.Border:
        case SymbolKind.Style:
        case SymbolKind.Color:
        case SymbolKind.Object:
            return SemanticTokenTypes.class;
        case SymbolKind.Function: return SemanticTokenTypes.function;
        case SymbolKind.Variable: return SemanticTokenTypes.variable;
        default: return SemanticTokenTypes.variable;
    }
}
