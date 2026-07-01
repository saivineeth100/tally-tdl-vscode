import type { ScopeNodeDTO } from 'tally-tdl-shared';

export type ScopeNode = ScopeNodeDTO;

export interface SymbolGroup {
    kind: string;
    count: number;
}


export interface SymbolsResult {
    symbols: SymbolEntry[];
    totalCount: number;
    page: number;
    limit: number;
}

export interface SymbolEntry {
    name: string;
    kind?: string;
    definitionType?: string;
    description?: string;
    parameters?: any[];
    returnType?: string;
    structuralChildren?: string[];
    structuralParents?: string[];
    usedDefinitions?: string[];
    modifiersCount?: number;
    serializedProperties?: any[];
    serializedComplexProperties?: any[];
    uri?: string;
    start?: number;
    end?: number;
}

export interface WebviewMessage {
    command: string;
    data?: any;
    scopeId?: string;
    children?: ScopeNode[];
    reqId?: string;
}
