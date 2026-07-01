import { SymbolInfo } from './symbols';

/**
 * Interface for Offset-based Range (simpler than vscode Range)
 */
export interface OffsetRange {
    start: number;
    end: number;
}

export interface ScopeNodeDTO {
    id: string;
    name?: string;
    kind: string;
    range?: OffsetRange;
    structuralParents?: string[];
    structuralChildren?: string[];
    usedDefinitions?: string[];
    objectScope?: string;
    collectionScope?: string;
    symbolGroups: { kind: string, count: number }[];
    children: ScopeNodeDTO[];
    hasChildren?: boolean;
    _childrenLoaded?: boolean;
}

export type ScopeTreeDTO = ScopeNodeDTO[];

export interface PaginatedSymbolsDTO {
    symbols: SymbolInfo[];
    totalCount: number;
    page: number;
    limit: number;
    kind: string;
}

export interface SymbolRequestDTO {
    uri: string;
    scopeId: string;
    kind: string;
    page: number;
    limit: number;
    query?: string;
}
