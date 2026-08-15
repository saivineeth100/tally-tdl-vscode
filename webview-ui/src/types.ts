import type { ScopeNodeDTO, ScopeDetailsDTO, ScopeDetailVariable, ScopeDetailFormula, ScopeDetailChild } from 'tally-tdl-shared';

export type ScopeNode = ScopeNodeDTO;
export type { ScopeDetailsDTO, ScopeDetailVariable, ScopeDetailFormula, ScopeDetailChild };

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
    view?: string;
    suggestions?: import('./types/playground').PlaygroundSuggestionsDTO;
    attributes?: import('./types/playground').DefTypeAttributeDTO[];
    defType?: string;
    schemaProperties?: import('./types/playground').SchemaPropertyDTO[];
    schemaType?: string;
    companies?: string[];
    templates?: import('./types/playground').PlaygroundTemplateDTO[];
    history?: import('./types/playground').PlaygroundHistoryEntryDTO[];
    historyEntry?: import('./types/playground').PlaygroundHistoryEntryDTO;
    state?: import('./types/playground').PlaygroundStateDTO;
}
