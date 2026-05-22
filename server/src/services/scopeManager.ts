import { SymbolInfo, SymbolKind, SymbolTable } from './symbolTable';
import { SourceFile, SyntaxKind, IdentifierNode, StatementNode, BlockStatementNode, ForNode, WalkNode, IfNode, WhileNode } from '../parser/ast';
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

/**
 * Manages the scope hierarchy and symbol resolution
 */
export class ScopeManager {
    private globalScope: Scope;
    private projectScope: Scope;
    private fileMap = new Map<string, Scope>(); // URI -> FileScope
    private metadata: any;

    constructor(private symbolTable: SymbolTable) {
        // Initialize Root Scopes
        this.globalScope = this.createScope(ScopeKind.Global, 'global');
        this.projectScope = this.createScope(ScopeKind.Project, 'project', this.globalScope);
    }

    /**
     * Initialize Global Scope with metadata (System definitions)
     */
    initializeGlobalScope(metadata: any): void {
        this.metadata = metadata;
        // Populating global scope with system functions ($$...)
        if (metadata && metadata.functions) {
            for (const func of metadata.functions) {
                const name = func.Name;
                const symbol: SymbolInfo = {
                    name,
                    kind: SymbolKind.Function,
                    uri: 'global:metadata',
                    start: 0,
                    end: 0,
                    definitionType: 'Function'
                };
                this.globalScope.symbols.set(name.toLowerCase(), symbol);
            }
        }
    }

    /**
     * Create a new scope
     */
    createScope(kind: ScopeKind, id: string, parent?: Scope, range?: OffsetRange, uri?: string): Scope {
        const scope: Scope = {
            id,
            kind,
            parent,
            children: [],
            symbols: new Map(),
            range,
            uri
        };
        if (parent) {
            parent.children.push(scope);
        }
        return scope;
    }

    /**
     * Build scopes for a source file
     * This should be called whenever a file is parsed
     */
    buildFileScope(uri: string, sourceFile: SourceFile): Scope {
        // Create File Scope
        const fileScope = this.createScope(ScopeKind.File, `file:${uri}`, this.projectScope, { start: 0, end: Number.MAX_SAFE_INTEGER }, uri);
        this.fileMap.set(uri, fileScope);

        // Populate Scope with Definitions from SourceFile
        for (const def of sourceFile.definitions) {
            // Create a scope for each definition (Report, Field, etc.)
            // The definition name identifies the scope
            const defName = def.name ? def.name.text : 'anonymous';
            const defId = `${def.type?.text || 'Def'}:${defName}`;

            // Handle Definition Modifiers (#, !, *)
            let defScope: Scope;
            if (def.modifier) {
                // Find original definition scope in current file or project
                const existing = fileScope.children.find(c => c.id.toLowerCase() === defId.toLowerCase()) || 
                                 this.projectScope.children.find(c => c.id.toLowerCase() === defId.toLowerCase());
                
                if (existing) {
                    // Create a linked scope for the modified definition to handle range correctly,
                    // but make it a child of the original scope so it inherits its symbols, 
                    // and we can also add new symbols to the existing scope if they are globally relevant,
                    // or just use the linked scope for local resolution.
                    // Wait, "merge its scope with the original definition" means symbols should be shared.
                    // We'll create a scope for range matching, but its symbols map is a reference to the existing symbols!
                    defScope = this.createScope(ScopeKind.Definition, defId, existing, { start: def.start, end: def.end }, uri);
                    defScope.symbols = existing.symbols; // Share the exact same map!
                } else {
                    defScope = this.createScope(ScopeKind.Definition, defId, fileScope, { start: def.start, end: def.end }, uri);
                }
            } else {
                defScope = this.createScope(ScopeKind.Definition, defId, fileScope, { start: def.start, end: def.end }, uri);
            }

            // Add definition parameters/variables if any (e.g. from functions)
            // TDL Variables can be defined using [Variable: Name].
            // These scope variables are handled as Definition scopes.
            for (const attr of def.attributes || []) {
                const attrNameLower = attr.name.text.toLowerCase().replace(/\s+/g, '');
                if (attrNameLower === 'variable' || attrNameLower === 'listvariable') {
                    if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                        const varNameNode = attr.value[0] as IdentifierNode;
                        const varName = varNameNode.text;
                        const symbol: SymbolInfo = {
                            name: varName,
                            kind: SymbolKind.Variable,
                            uri: uri,
                            start: varNameNode.start,
                            end: varNameNode.end,
                            definitionType: 'Variable'
                        };

                        // If it is a global [System: ...] or [System: Variable]
                        const defTypeLower = def.type?.text?.toLowerCase();
                        if (defTypeLower === 'system') {
                            this.projectScope.symbols.set(varName.toLowerCase(), symbol);
                        } else {
                            // Local to the current definition
                            defScope.symbols.set(varName.toLowerCase(), symbol);
                        }
                    }
                } else if (def.type?.text?.toLowerCase() === 'system' && def.name?.text?.toLowerCase() === 'variable') {
                    // [System: Variable] MyGlobalVar : "" -> MyGlobalVar is the variable!
                    const varName = attr.name.text;
                    const symbol: SymbolInfo = {
                        name: varName,
                        kind: SymbolKind.Variable,
                        uri: uri,
                        start: attr.name.start,
                        end: attr.name.end,
                        definitionType: 'Variable'
                    };
                    this.projectScope.symbols.set(varName.toLowerCase(), symbol);
                } else if (def.type?.text?.toLowerCase() === 'function' && attrNameLower === 'parameter') {
                    // Parse function parameters
                    for (const paramNode of attr.value) {
                        if (paramNode.kind === SyntaxKind.Identifier) {
                            const varName = (paramNode as IdentifierNode).text;
                            // Check if it's not a datatype name (e.g., 'String', 'Number'). 
                            // TDL Parameters are typically `Parameter : DataType : VarName` or `Parameter : VarName`.
                            // If it's a datatype, it might be followed by a colon and the real name. 
                            // But AST just gives them as sequential values in the list.
                            // For simplicity, we add all identifiers as potential variables to the scope, 
                            // or we can just add them if they don't match known datatypes.
                            // Actually, adding them all is safe enough for basic scope lookup.
                            const symbol: SymbolInfo = {
                                name: varName,
                                kind: SymbolKind.Variable,
                                uri: uri,
                                start: paramNode.start,
                                end: paramNode.end,
                                definitionType: 'Variable'
                            };
                            defScope.symbols.set(varName.toLowerCase(), symbol);
                        }
                    }
                } else if (attrNameLower === 'fetchobject') {
                    // Fetch Object: <Object Type> : <Expression> : <List of methods>
                    if (attr.value.length > 2) {
                        for (let i = 2; i < attr.value.length; i++) {
                            const methodNode = attr.value[i];
                            if (methodNode.kind === SyntaxKind.Identifier) {
                                const methodName = (methodNode as IdentifierNode).text;
                                const symbol: SymbolInfo = {
                                    name: '$' + methodName,
                                    kind: SymbolKind.Field,
                                    uri: uri,
                                    start: methodNode.start,
                                    end: methodNode.end,
                                    definitionType: 'Method'
                                };
                                defScope.symbols.set('$' + methodName.toLowerCase(), symbol);
                            } else if (methodNode.kind === SyntaxKind.List) {
                                for (const subNode of (methodNode as any).values) {
                                    if (subNode.kind === SyntaxKind.Identifier) {
                                        const methodName = (subNode as IdentifierNode).text;
                                        const symbol: SymbolInfo = {
                                            name: '$' + methodName,
                                            kind: SymbolKind.Field,
                                            uri: uri,
                                            start: subNode.start,
                                            end: subNode.end,
                                            definitionType: 'Method'
                                        };
                                        defScope.symbols.set('$' + methodName.toLowerCase(), symbol);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Build block scopes for statements inside the definition
            if (def.statements && def.statements.length > 0) {
                this.buildBlockScopes(def.statements, defScope, uri);
            }
        }

        return fileScope;
    }

    private buildBlockScopes(statements: StatementNode[], parentScope: Scope, uri: string) {
        for (const stmt of statements) {
            let currentScope = parentScope;

            // Check if statement is a block statement
            const actionText = stmt.action?.text?.toLowerCase();
            
            if ((stmt as any).statements !== undefined) {
                // It's a block node (IfNode, WhileNode, ForNode, WalkNode)
                const blockNode = stmt as BlockStatementNode;
                
                // Create a new Block Scope
                const blockScope = this.createScope(ScopeKind.Block, `block:${blockNode.start}`, parentScope, { start: blockNode.start, end: blockNode.end }, uri);
                currentScope = blockScope;

                // Add iterator variable for For loops
                if (actionText === 'fortoken' || actionText === 'forcollection' || actionText === 'forrange' || actionText === 'for') {
                    const forNode = blockNode as ForNode;
                    if (forNode.iteratorVariable) {
                        const varName = forNode.iteratorVariable.text;
                        const symbol: SymbolInfo = {
                            name: varName,
                            kind: SymbolKind.Variable,
                            uri: uri,
                            start: forNode.iteratorVariable.start,
                            end: forNode.iteratorVariable.end,
                            definitionType: 'Variable'
                        };
                        blockScope.symbols.set(varName.toLowerCase(), symbol);
                    }
                }

                // Recursively build scopes for inner statements
                if (blockNode.statements.length > 0) {
                    this.buildBlockScopes(blockNode.statements, currentScope, uri);
                }

                // Handle IfNode's elseStatements
                if (actionText === 'if') {
                    const ifNode = blockNode as IfNode;
                    if (ifNode.elseStatements && ifNode.elseStatements.length > 0) {
                        // Else block can be treated as part of the same block scope or a new one
                        // For simplicity, we just use the same blockScope since they don't overlap in variables usually
                        this.buildBlockScopes(ifNode.elseStatements, currentScope, uri);
                    }
                }
            }
        }
    }

    /**
     * Find the most specific scope at a given offset in a document
     */
    getScopeAt(uri: string, offset: number): Scope | undefined {
        const fileScope = this.fileMap.get(uri);
        if (!fileScope) return undefined;

        return this.findScopeRecursive(fileScope, offset);
    }

    private findScopeRecursive(scope: Scope, offset: number): Scope {
        // Check children first (more specific)
        for (const child of scope.children) {
            if (child.range && offset >= child.range.start && offset <= child.range.end) {
                return this.findScopeRecursive(child, offset);
            }
        }
        // If no child matches, return this scope (if it matches range, or is global/file)
        return scope;
    }

    /**
     * Resolve a symbol name starting from a specific scope and moving up
     */
    resolve(name: string, initialScope: Scope): SymbolInfo | undefined {
        const lowerName = name.toLowerCase();
        let current: Scope | undefined = initialScope;
        while (current) {
            // Check symbol map (case-insensitive if keys are lowercased)
            for (const [key, sym] of current.symbols) {
                if (key.toLowerCase() === lowerName) return sym;
            }
            current = current.parent;
        }

        // Fallback to SymbolTable's global index 
        const globalSymbols = this.symbolTable.findAllByName(name);
        if (globalSymbols.length > 0) {
            return globalSymbols[0];
        }

        // Check Metadata Definitions if not found
        if (this.metadata && this.metadata.existingDefinitions) {
            // existingDefinitions is Map<string, string[]> (Type -> Name[])
            // Iterate all definition types
            for (const [defType, names] of this.metadata.existingDefinitions) {
                // Check if names array contains our symbol (case-insensitive)
                if (names.some((n: string) => n.toLowerCase() === lowerName)) {
                    // Found in metadata!
                    return {
                        name: name, // Use searched name (or we could find exact match from list)
                        kind: definitionTypeToSymbolKind(defType),
                        uri: 'global:metadata',
                        start: 0,
                        end: 0,
                        definitionType: defType
                    };
                }
            }
        }

        return undefined;
    }
}

/**
 * Helper to map TDL definition type string to SymbolKind
 */
function definitionTypeToSymbolKind(defType: string): SymbolKind {
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

/**
 * Interface for Offset-based Range (simpler than vscode Range)
 */
export interface OffsetRange {
    start: number;
    end: number;
}
