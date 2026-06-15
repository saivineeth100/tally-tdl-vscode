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

    /** Tracks structural usage graph (childDefinitionId -> Set of parentDefinitionIds) */
    public parentDefinitions = new Map<string, Set<string>>();
    /** Tracks structural usage graph (parentDefinitionId -> Set of childDefinitionIds) */
    public childDefinitions = new Map<string, Set<string>>();
    /** Tracks 'Use' inheritance graph (DefinitionId -> Set of ParentDefinitionIds it Uses) */
    public useInheritance = new Map<string, Set<string>>();
    /** Tracks explicitly included files across the project */
    public includedFiles = new Set<string>();

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
     * Remove scopes associated with a file
     */
    removeFileScope(uri: string): void {
        const fileScope = this.fileMap.get(uri);
        if (fileScope) {
            this.projectScope.children = this.projectScope.children.filter(c => c !== fileScope);
            this.fileMap.delete(uri);
        }
        
        // Remove global symbols that were defined in this file
        for (const [key, sym] of this.projectScope.symbols.entries()) {
            if (sym.uri === uri) {
                this.projectScope.symbols.delete(key);
            }
        }
    }

    /**
     * Build scopes for a source file
     * This should be called whenever a file is parsed
     */
    buildFileScope(uri: string, sourceFile: SourceFile): Scope {
        // Ensure any existing file scope and global symbols are removed first
        this.removeFileScope(uri);

        // Create File Scope
        const fileScope = this.createScope(ScopeKind.File, `file:${uri}`, this.projectScope, { start: 0, end: Number.MAX_SAFE_INTEGER }, uri);
        this.fileMap.set(uri, fileScope);

        // Populate Scope with Definitions from SourceFile
        for (const def of sourceFile.definitions) {
            // Extract includes
            if (def.type?.text?.toLowerCase() === 'include' && def.name?.text) {
                const includedFile = def.name.text.replace(/^["']|["']$/g, '');
                this.includedFiles.add(includedFile);
            }

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
                
                // Track structural hierarchy (Report -> Form -> Part -> Line -> Field)
                if (['form', 'part', 'line', 'field'].includes(attrNameLower)) {
                    if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                        // TDL lists can be comma separated, but typically the first value is the identifier.
                        // Actually, TDL allows multiple comma-separated children (e.g. Part : P1, P2)
                        // So we should iterate over all identifier values.
                        for (const val of attr.value) {
                            if (val.kind === SyntaxKind.Identifier) {
                                const childName = (val as IdentifierNode).text;
                                const childId = `${attrNameLower.charAt(0).toUpperCase() + attrNameLower.slice(1)}:${childName}`;
                                
                                let parents = this.parentDefinitions.get(childId.toLowerCase());
                                if (!parents) {
                                    parents = new Set<string>();
                                    this.parentDefinitions.set(childId.toLowerCase(), parents);
                                }
                                parents.add(defId.toLowerCase());

                                let children = this.childDefinitions.get(defId.toLowerCase());
                                if (!children) {
                                    children = new Set<string>();
                                    this.childDefinitions.set(defId.toLowerCase(), children);
                                }
                                children.add(childId.toLowerCase());
                            }
                        }
                    }
                }

                // Track 'Use' inheritance (e.g. Report uses Report)
                if (attrNameLower === 'use') {
                    if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                        for (const val of attr.value) {
                            if (val.kind === SyntaxKind.Identifier) {
                                const useName = (val as IdentifierNode).text;
                                // The type of the used definition is the same as the current definition
                                const parentDefId = `${def.type?.text || 'Def'}:${useName}`.toLowerCase();
                                
                                let uses = this.useInheritance.get(defId.toLowerCase());
                                if (!uses) {
                                    uses = new Set<string>();
                                    this.useInheritance.set(defId.toLowerCase(), uses);
                                }
                                uses.add(parentDefId);
                            }
                        }
                    }
                }

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
                } else if (def.type?.text?.toLowerCase() === 'system') {
                    const systemDefName = def.name?.text?.toLowerCase();
                    if (systemDefName === 'variable' || systemDefName === 'variables') {
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
                    } else if (systemDefName === 'formula' || systemDefName === 'formulae' || systemDefName === 'formulas') {
                        // [System: Formula] MyURL : "" -> MyURL is the formula!
                        const formulaName = attr.name.text;
                        const symbol: SymbolInfo = {
                            name: formulaName,
                            kind: SymbolKind.Variable,
                            uri: uri,
                            start: attr.name.start,
                            end: attr.name.end,
                            definitionType: 'Formula'
                        };
                        this.projectScope.symbols.set(formulaName.toLowerCase(), symbol);
                    }
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

    public getScopeById(id: string): Scope | undefined {
        return this.findDefinitionScope(id);
    }

    private findDefinitionScope(id: string): Scope | undefined {
        const lowerId = id.toLowerCase();
        for (const fileScope of this.fileMap.values()) {
            const found = fileScope.children.find(c => c.id.toLowerCase() === lowerId);
            if (found) return found;
        }
        return this.projectScope.children.find(c => c.id.toLowerCase() === lowerId);
    }

    /**
     * Resolve a symbol name starting from a specific scope and moving up
     */
    resolve(name: string, initialScope: Scope): SymbolInfo | undefined {
        const lowerName = name.toLowerCase();
        
        const visitedScopes = new Set<string>();
        
        const searchScopeAndParents = (scope: Scope): SymbolInfo | undefined => {
            if (visitedScopes.has(scope.id)) return undefined;
            visitedScopes.add(scope.id);
            
            // Check symbol map
            for (const [key, sym] of scope.symbols) {
                if (key.toLowerCase() === lowerName) return sym;
            }

            // Check Use inheritance first
            const uses = this.useInheritance.get(scope.id.toLowerCase());
            if (uses) {
                for (const useId of uses) {
                    const useScope = this.findDefinitionScope(useId);
                    if (useScope) {
                        const result = searchScopeAndParents(useScope);
                        if (result) return result;
                    }
                }
            }
            
            // If this is a Definition scope, structurally search upwards
            if (scope.kind === ScopeKind.Definition) {
                const parentIds = this.parentDefinitions.get(scope.id.toLowerCase());
                if (parentIds) {
                    for (const pid of parentIds) {
                        const parentScope = this.findDefinitionScope(pid);
                        if (parentScope) {
                            const result = searchScopeAndParents(parentScope);
                            if (result) return result;
                        }
                    }
                }
            }
            return undefined;
        };

        let current: Scope | undefined = initialScope;
        while (current) {
            if (current.kind === ScopeKind.Definition) {
                const result = searchScopeAndParents(current);
                if (result) return result;
            } else {
                for (const [key, sym] of current.symbols) {
                    if (key.toLowerCase() === lowerName) return sym;
                }
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

    /**
     * Get all variables reachable from a specific scope (for completion)
     */
    public getAllVariablesInScope(initialScope: Scope): Map<string, SymbolInfo> {
        const variables = new Map<string, SymbolInfo>();
        const visitedScopes = new Set<string>();

        const collectVariables = (scope: Scope) => {
            if (visitedScopes.has(scope.id)) return;
            visitedScopes.add(scope.id);

            // Collect local variables
            for (const [key, sym] of scope.symbols) {
                if (sym.kind === SymbolKind.Variable || sym.definitionType === 'Variable') {
                    if (!variables.has(key.toLowerCase())) {
                        variables.set(key.toLowerCase(), sym);
                    }
                }
            }

            // Check Use inheritance
            const uses = this.useInheritance.get(scope.id.toLowerCase());
            if (uses) {
                for (const useId of uses) {
                    const useScope = this.findDefinitionScope(useId);
                    if (useScope) {
                        collectVariables(useScope);
                    }
                }
            }

            // Structurally search upwards
            if (scope.kind === ScopeKind.Definition) {
                const parentIds = this.parentDefinitions.get(scope.id.toLowerCase());
                if (parentIds) {
                    for (const pid of parentIds) {
                        const parentScope = this.findDefinitionScope(pid);
                        if (parentScope) {
                            collectVariables(parentScope);
                        }
                    }
                }
            }
        };

        let current: Scope | undefined = initialScope;
        while (current) {
            if (current.kind === ScopeKind.Definition) {
                collectVariables(current);
            } else {
                for (const [key, sym] of current.symbols) {
                    if (sym.kind === SymbolKind.Variable || sym.definitionType === 'Variable') {
                        if (!variables.has(key.toLowerCase())) {
                            variables.set(key.toLowerCase(), sym);
                        }
                    }
                }
            }
            current = current.parent;
        }

        return variables;
    }

    /**
     * Traverse downwards from a scope to find all definitions of a specific type (e.g. 'Field').
     * Useful for modifier completions like `Local : Field : `
     */
    public getReachableChildren(scope: Scope, targetType: string): SymbolInfo[] {
        const results: SymbolInfo[] = [];
        const visitedScopes = new Set<string>();
        const targetTypeLower = targetType.toLowerCase();

        const collectChildren = (currentScope: Scope) => {
            if (visitedScopes.has(currentScope.id)) return;
            visitedScopes.add(currentScope.id);

            // Is the current scope what we're looking for?
            const currentDefType = currentScope.id.split(':')[0].toLowerCase();
            if (currentDefType === targetTypeLower) {
                // Return this definition as a symbol
                const defName = currentScope.id.substring(currentScope.id.indexOf(':') + 1);
                results.push({
                    name: defName,
                    kind: SymbolKind.Object, // Use Object for definitions in completion
                    uri: currentScope.uri || '',
                    start: currentScope.range?.start || 0,
                    end: currentScope.range?.end || 0,
                    definitionType: targetType
                });
            }

            // Search Use inheritance (children of definitions we use)
            const uses = this.useInheritance.get(currentScope.id.toLowerCase());
            if (uses) {
                for (const useId of uses) {
                    const useScope = this.findDefinitionScope(useId);
                    if (useScope) {
                        collectChildren(useScope);
                    }
                }
            }

            // Search Structural Children
            const childIds = this.childDefinitions.get(currentScope.id.toLowerCase());
            if (childIds) {
                for (const cid of childIds) {
                    const childScope = this.findDefinitionScope(cid);
                    if (childScope) {
                        collectChildren(childScope);
                    }
                }
            }
        };

        collectChildren(scope);
        return results;
    }

    /**
     * Serialize the entire scope hierarchy relevant to a file for debugging/visualization
     */
    public serializeScopeTree(uri: string): ScopeTreeDTO {
        const fileScope = this.fileMap.get(uri);

        const serializeNode = (node: Scope): ScopeNodeDTO => {
            const symbols = Array.from(node.symbols.values()).map(s => ({
                name: s.name,
                kind: typeof s.kind === 'number' ? SymbolKind[s.kind] || 'Variable' : s.kind.toString(),
                definitionType: s.definitionType
            }));

            // Note: Project scope might contain children from OTHER files.
            // We should filter Project's children to ONLY include the current file scope!
            let children = node.children;
            if (node.kind === ScopeKind.Project && fileScope) {
                children = children.filter(c => c === fileScope);
            }

            const parentIds = this.parentDefinitions.get(node.id.toLowerCase());
            const structuralParents = parentIds ? Array.from(parentIds) : undefined;

            const childIds = this.childDefinitions.get(node.id.toLowerCase());
            const structuralChildren = childIds ? Array.from(childIds) : undefined;

            const useIds = this.useInheritance.get(node.id.toLowerCase());
            const usedDefinitions = useIds ? Array.from(useIds) : undefined;

            return {
                id: node.id,
                kind: node.kind,
                range: node.range,
                structuralParents,
                structuralChildren,
                usedDefinitions,
                symbols,
                children: children.map(c => serializeNode(c))
            };
        };

        return {
            globalScope: serializeNode(this.globalScope),
            projectScope: serializeNode(this.projectScope)
            // projectScope will contain fileScope as a child due to the filter above
        };
    }
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
