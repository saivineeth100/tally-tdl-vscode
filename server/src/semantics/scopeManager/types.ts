import { SymbolInfo, SymbolKind, FunctionSymbol, VariableSymbol, FormulaSymbol, DefinitionSymbol, ActionSymbol, AttributeSymbol, SchemaSymbol } from 'tally-tdl-shared';
import { SemanticTokenTypes, SymbolKind as LSPSymbolKind } from 'vscode-languageserver';
import { normalizeTypeName } from '../../utils/normalizeUtils';

/**
 * Types of scopes in TDL
 */
export enum ScopeKind {
    Global = 'Global',       // Metadata (System definitions)
    Project = 'Project',     // User defined global definitions (Collection, Report, etc.)
    Workspace = 'Workspace', // Loose workspace files
    File = 'File',           // File-level definitions (if any explicit local scope exists)
    Definition = 'Definition', // Inside a definition ([Report: ...])
    Function = 'Function',   // Function specific scope
    Block = 'Block',         // Inside a block (e.g. Function body)
    Local = 'Local'          // Specific local context
}

import { ScopeNodeDTO, ScopeTreeDTO, PaginatedSymbolsDTO, SymbolRequestDTO, OffsetRange } from 'tally-tdl-shared';
export { ScopeNodeDTO, ScopeTreeDTO, PaginatedSymbolsDTO, SymbolRequestDTO, OffsetRange };
import { ReferenceIndex } from '../symbols/referenceIndex';
/**
 * Represents a scope in the symbol hierarchy
 */
export interface BaseScope {
    id: string;
    kind: ScopeKind;
    parent?: Scope;
    childScopes: Scope[];
    variables: Map<string, VariableSymbol>;
    formulas: Map<string, FormulaSymbol>;
    range?: OffsetRange;
    uri?: string;
}

export interface GlobalScope extends BaseScope {
    kind: ScopeKind.Global;
    functions: Map<string, FunctionSymbol>;
    actions: Map<string, ActionSymbol>;
    attributes: Map<string, Map<string, AttributeSymbol>>; // Outer key: definitionType (e.g. 'Field'), Inner key: attribute name
    schemas: Map<string, SchemaSymbol>;
    definitions: Map<string, Map<string, DefinitionSymbol>>; // Outer key: definitionType (e.g. 'Form'), Inner key: name

    interchangeableTypesMap: Map<string, string>;
    interchangeableAttributesMap: Map<string, string>;
    interchangeableTypesAliasesMap: Map<string, string[]>;
    referenceIndex: ReferenceIndex;
}


export interface ProjectScope extends BaseScope {
    kind: ScopeKind.Project;
    referenceIndex: ReferenceIndex;
}

export interface WorkspaceScope extends BaseScope {
    kind: ScopeKind.Workspace;
    referenceIndex: ReferenceIndex;
}

export interface FileScope extends BaseScope {
    kind: ScopeKind.File;
}

export interface DefinitionScope extends BaseScope {
    kind: ScopeKind.Definition;
    definition?: DefinitionSymbol;
    structuralChildren: Map<string, Set<string>>;
    uses: Set<string>;
    objectScope?: string;
    collectionScope?: string;
    computedFields?: Set<string>;
    fetchedFields?: Set<string>;
}

export interface FunctionScope extends BaseScope {
    kind: ScopeKind.Function;
    definition?: DefinitionSymbol;
    objectScope?: string;
    collectionScope?: string;
}

export interface BlockScope extends BaseScope {
    kind: ScopeKind.Block;
}

export interface LocalScope extends BaseScope {
    kind: ScopeKind.Local;
}

export type Scope = GlobalScope | ProjectScope | WorkspaceScope | FileScope | DefinitionScope | FunctionScope | BlockScope | LocalScope;

export function hasDefinitions(scope: Scope): scope is GlobalScope {
    return scope.kind === ScopeKind.Global;
}

export function hasFunctionsAndActions(scope: Scope): scope is GlobalScope {
    return scope.kind === ScopeKind.Global;
}

export function hasAttributes(scope: Scope): scope is GlobalScope {
    return scope.kind === ScopeKind.Global;
}

export function hasSchemas(scope: Scope): scope is GlobalScope {
    return scope.kind === ScopeKind.Global;
}


export interface ModifierContribution {
    targetDefinitionId: string;
    modifierKind: '#' | '!' | '*';
    uri: string;
    range: OffsetRange;
    scope: Scope;
    order: number;
}

export const SYSTEM_DEFINITION_NAMES = [
    'Event',
    'Events',
    'Form Keys',
    'Formula',
    'Formulae',
    'Formulas',
    'Menu Keys',
    'TDL Name',
    'TDL Names',
    'UDF',
    'Variable',
    'Variables',
];

export const SYSTEM_DEFINITION_NAMES_LOWER = SYSTEM_DEFINITION_NAMES.map(name => normalizeTypeName(name));

/**
 * Helper to map TDL definition type string to SymbolKind
 */
export function definitionTypeToSymbolKind(defType: string, manager?: any): SymbolKind {
    const normalizedType = normalizeTypeName(defType);
    let canonicalType = normalizedType;
    if (manager && typeof manager.getCanonicalTypeName === 'function') {
        canonicalType = manager.getCanonicalTypeName(normalizedType);
    }
    return Direct(canonicalType);
}


function Direct(defType: string): SymbolKind {
    switch (defType) {
        case 'collection': return SymbolKind.Collection;
        case 'report': return SymbolKind.Report;
        case 'field': return SymbolKind.Field;
        case 'form': return SymbolKind.Form;
        case 'part': return SymbolKind.Part;
        case 'line': return SymbolKind.Line;
        case 'menu': return SymbolKind.Menu;
        case 'function': return SymbolKind.Function;
        case 'button': return SymbolKind.Button;
        case 'key': return SymbolKind.Key;
        case 'border': return SymbolKind.Border;
        case 'style': return SymbolKind.Style;
        case 'color': return SymbolKind.Color;
        case 'colour': return SymbolKind.Color;
        case 'exchange': return SymbolKind.Exchange;
        case 'explodeowner': return SymbolKind.ExplodeOwner;
        case 'import': return SymbolKind.Unknown; // Import is special
        case 'importfile': return SymbolKind.ImportFile;
        case 'include': return SymbolKind.Include;
        case 'nameset': return SymbolKind.NameSet;
        case 'object': return SymbolKind.Object;
        case 'objectmap': return SymbolKind.ObjectMap;
        case 'querybox': return SymbolKind.QueryBox;
        case 'recon': return SymbolKind.Recon;
        case 'resource': return SymbolKind.Resource;
        case 'ruleset': return SymbolKind.Ruleset;
        case 'table': return SymbolKind.Table;
        case 'theme': return SymbolKind.Theme;
        case 'variable': return SymbolKind.Variable;
        case 'variables': return SymbolKind.Variable;
        case 'formula': return SymbolKind.Formula;
        case 'formulae': return SymbolKind.Formula;
        case 'formulas': return SymbolKind.Formula;
        case 'system': return SymbolKind.Variable; // System variables
        default: return SymbolKind.Unknown;
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
        case SymbolKind.Exchange:
        case SymbolKind.ExplodeOwner:
        case SymbolKind.ImportFile:
        case SymbolKind.Include:
        case SymbolKind.NameSet:
        case SymbolKind.ObjectMap:
        case SymbolKind.QueryBox:
        case SymbolKind.Recon:
        case SymbolKind.Resource:
        case SymbolKind.Ruleset:
        case SymbolKind.Table:
        case SymbolKind.Theme:
            return SemanticTokenTypes.class;
        case SymbolKind.Function: return SemanticTokenTypes.function;
        case SymbolKind.Variable:
        case SymbolKind.Formula:
            return SemanticTokenTypes.variable;
        default: return SemanticTokenTypes.variable;
    }
}

/**
 * Canonical mapping from internal SymbolKind to LSP SymbolKind.
 * All features should use this instead of maintaining separate switch statements.
 */
export function symbolKindToLSPSymbolKind(kind: SymbolKind): LSPSymbolKind {
    switch (kind) {
        case SymbolKind.Collection: return LSPSymbolKind.Array;
        case SymbolKind.Report: return LSPSymbolKind.Class;
        case SymbolKind.Form: return LSPSymbolKind.Interface;
        case SymbolKind.Part: return LSPSymbolKind.Struct;
        case SymbolKind.Line: return LSPSymbolKind.Constructor;
        case SymbolKind.Field: return LSPSymbolKind.Field;
        case SymbolKind.Menu: return LSPSymbolKind.Enum;
        case SymbolKind.Button: return LSPSymbolKind.Event;
        case SymbolKind.Key: return LSPSymbolKind.Key;
        case SymbolKind.Border: return LSPSymbolKind.Object;
        case SymbolKind.Style: return LSPSymbolKind.Object;
        case SymbolKind.Color: return LSPSymbolKind.Constant;
        case SymbolKind.Function: return LSPSymbolKind.Function;
        case SymbolKind.Variable: return LSPSymbolKind.Variable;
        case SymbolKind.Object:
        case SymbolKind.Exchange:
        case SymbolKind.ExplodeOwner:
        case SymbolKind.ImportFile:
        case SymbolKind.Include:
        case SymbolKind.NameSet:
        case SymbolKind.ObjectMap:
        case SymbolKind.QueryBox:
        case SymbolKind.Recon:
        case SymbolKind.Resource:
        case SymbolKind.Ruleset:
        case SymbolKind.Table:
        case SymbolKind.Theme:
            return LSPSymbolKind.Class;
        default: return LSPSymbolKind.Object;
    }
}

