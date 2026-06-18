import { normalizeTypeName, getInterchangeableTypes } from '../services/utils';

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

/** Parameter metadata for Functions, Actions, and Attributes */
export interface TDLParameter {
    ParameterType?: string;
    IsConstant: boolean;
    DataType?: string;
    IsMandatory: boolean;
    RefersTo?: string;
    KeywordSet?: string;
    Keywords?: string;
    IsList: boolean;
    IsVariableArgument: boolean;
    DimensionExpression: boolean;
}

/** Schema property metadata */
export interface TDLSchemaProperty {
    Name: string;
    IsComplex: boolean;
    IsRepeated: boolean;
    DataType?: string;
    ObjectName?: string;
}

export interface FunctionSymbol extends SymbolInfo {
    description?: string;
    parameters: TDLParameter[];
    returnType?: string;
    aliases?: string;
}

export interface ActionSymbol extends SymbolInfo {
    description?: string;
    parameters: TDLParameter[];
    aliases?: string;
    totalParameters: number;
    totalMandatoryParameters: number;
    category?: string;
    mode?: string;
    returnType?: string;
}

export interface AttributeSymbol extends SymbolInfo {
    description?: string;
    parameters: TDLParameter[];
    aliases?: string;
    type?: string;
    isDiscrete: boolean;
}

export interface SchemaSymbol extends SymbolInfo {
    properties: Map<string, TDLSchemaProperty>;
    isPrimary: boolean;
    complexProperties: Map<string, string>;
}

export interface VariableSymbol extends SymbolInfo {
    dataType?: string;
}

export interface DefinitionSymbol extends SymbolInfo {
    // Specific fields for TDL Definitions (e.g., Form, Report) can go here
    isDiscrete?: boolean;
    parameters?: TDLParameter[];
}

const typeToKindMap = new Map<string, SymbolKind>([
    ['report', SymbolKind.Report],
    ['form', SymbolKind.Form],
    ['part', SymbolKind.Part],
    ['line', SymbolKind.Line],
    ['field', SymbolKind.Field],
    ['menu', SymbolKind.Menu],
    ['collection', SymbolKind.Collection],
    ['function', SymbolKind.Function],
    ['variable', SymbolKind.Variable],
    ['button', SymbolKind.Button],
    ['key', SymbolKind.Key],
    ['border', SymbolKind.Border],
    ['style', SymbolKind.Style],
    ['color', SymbolKind.Color],
    ['object', SymbolKind.Object]
]);

/**
 * Map TDL definition type string to SymbolKind
 * @param definitionType The definition type from the AST
 * @returns Corresponding SymbolKind
 */
export function definitionTypeToSymbolKind(definitionType: string): SymbolKind {
    const normalized = normalizeTypeName(definitionType);
    const interchangeable = getInterchangeableTypes(normalized);
    
    for (const type of interchangeable) {
        const kind = typeToKindMap.get(type);
        if (kind !== undefined) {
            return kind;
        }
    }
    
    return SymbolKind.Unknown;
}
