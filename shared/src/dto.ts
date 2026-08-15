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

export interface ScopeDetailVariable {
    name: string;
    dataType?: string;
    value?: string;
    isSystemVariable?: boolean;
    description?: string;
    range?: OffsetRange;
}

export interface ScopeDetailFormula {
    name: string;
    value?: string;
    parameters?: any[];
    range?: OffsetRange;
}

export interface ScopeDetailChild {
    name: string;
    id: string;
    definitionType: string;
    description?: string;
    uri?: string;
    start?: number;
    end?: number;
    childCount?: number;
}

export interface ScopeDetailsDTO {
    id: string;
    name: string;
    kind: string;
    definitionType?: string;
    objectScope?: string;
    collectionScope?: string;
    structuralParents?: string[];
    childrenByType: Record<string, ScopeDetailChild[]>;
    variables: ScopeDetailVariable[];
    formulas: ScopeDetailFormula[];
    fetchedFields: string[];
    computedFields: string[];
    usedDefinitions: string[];
    modifiersCount?: number;
    uri?: string;
    start?: number;
    end?: number;
}

/** Mirrors DefinitionNode for serialization to/from webview */
export interface PlaygroundDefinitionDTO {
    defType: string;
    name: string;
    attributes: PlaygroundAttributeDTO[];
    isModify?: boolean;
    isFixed?: boolean;
    isInitialize?: boolean;
    isOption?: boolean;
    isInternal?: boolean;
}

/** Mirrors AttributeNode for serialization */
export interface PlaygroundAttributeDTO {
    name: string;
    values: string[];
}

/** Static variable representation */
export interface PlaygroundStaticVariableDTO {
    name: string;
    value: string;
}

/** Full playground state DTO */
export interface PlaygroundStateDTO {
    tallyRequest: 'Export' | 'Import';
    type: 'Collection' | 'Data';
    id: string;
    staticVariables: PlaygroundStaticVariableDTO[];
    definitions: PlaygroundDefinitionDTO[];
    linkedFilePath?: string;
    linkedFileName?: string;
}

/** Query for on-demand suggestions */
export interface PlaygroundSuggestionQueryDTO {
    category: 'definitionType' | 'schemaType' | 'collection' | 'report' | 'definitionName' | 'attributeValue';
    query?: string;
    limit?: number;
    defType?: string;
    attributeName?: string;
    paramIndex?: number;
    currentDefinition?: PlaygroundDefinitionDTO;
}

/** Response for on-demand suggestions */
export interface PlaygroundSuggestionsDTO {
    category: 'definitionType' | 'schemaType' | 'collection' | 'report' | 'definitionName' | 'attributeValue';
    items: string[];
    defType?: string;
    attributeName?: string;
    paramIndex?: number;
}

/** Attribute info for a definition type */
export interface DefTypeAttributeDTO {
    name: string;
    description?: string;
    type?: string;
    isDiscrete?: boolean;
    parameters?: import('./parameters').TDLParameter[];
}

/** Schema property info */
export interface SchemaPropertyDTO {
    name: string;
    isComplex: boolean;
    isRepeated: boolean;
    dataType?: string;
    objectName?: string;
}

/** History entry for a request/response pair */
export interface PlaygroundHistoryEntryDTO {
    id: string;
    timestamp: number;
    requestXml: string;
    responsePath?: string;
    statusCode?: number;
    elapsedMs?: number;
    label: string;
    type: string;
    idField: string;
    error?: string;
}

/** Quick start template representation */
export interface PlaygroundTemplateDTO {
    name: string;
    description: string;
    prefix: string;
    xml: string;
    category: 'Export' | 'Import' | 'Report' | 'Object';
}
