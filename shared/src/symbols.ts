import { TDLParameter, TDLSchemaProperty } from './parameters';

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
    Exchange = 'Exchange',
    ExplodeOwner = 'ExplodeOwner',
    ImportFile = 'ImportFile',
    Include = 'Include',
    NameSet = 'NameSet',
    ObjectMap = 'ObjectMap',
    QueryBox = 'QueryBox',
    Recon = 'Recon',
    Resource = 'Resource',
    Ruleset = 'Ruleset',
    Table = 'Table',
    Theme = 'Theme',
    Formula = 'Formula',
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
    /** Whether this symbol is an optional definition (e.g., [!Report]) */
    isOptional?: boolean;
    /** Pre-computed LSP range for the full definition */
    range?: { start: { line: number; character: number }; end: { line: number; character: number } };
    /** Pre-computed LSP range for just the symbol name (for selection/highlight) */
    selectionRange?: { start: { line: number; character: number }; end: { line: number; character: number } };
    /** Human-readable detail string */
    detail?: string;
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
    description?: string;
    dataType?: string;
}

export interface FormulaSymbol extends SymbolInfo {
    expression?: string;
}

export interface DefinitionSymbol extends SymbolInfo {
    // Specific fields for TDL Definitions (e.g., Form, Report) can go here
    isDiscrete?: boolean;
    parameters?: TDLParameter[];
    structuralChildren?: string[];
    structuralParents?: string[];
    usedDefinitions?: string[];
    modifiersCount?: number;
}
