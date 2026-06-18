import { SourceFile, SyntaxKind, IdentifierNode, StatementNode, BlockStatementNode, ForNode, WalkNode, IfNode, WhileNode } from '../../parser/ast';
import { SymbolInfo, SymbolKind, VariableSymbol, DefinitionSymbol } from '../symbolTable';
import { Scope, ScopeKind } from './types';

// We need to interface with ScopeManager without a circular dependency if possible,
// or just use any/duck typing. Let's define the interface needed from ScopeManager:
export interface IScopeManager {
    projectScope: Scope;
    fileMap: Map<string, Scope>;
    parentDefinitions: Map<string, Set<string>>;
    childDefinitions: Map<string, Set<string>>;
    useInheritance: Map<string, Set<string>>;
    includedFiles: Set<string>;
    
    createScope(kind: ScopeKind, id: string, parent?: Scope, range?: import('./types').OffsetRange, uri?: string): Scope;
    removeFileScope(uri: string): void;
}

export function buildFileScope(manager: IScopeManager, uri: string, sourceFile: SourceFile): Scope {
    // Ensure any existing file scope and global symbols are removed first
    manager.removeFileScope(uri);

    // Create File Scope
    const fileScope = manager.createScope(ScopeKind.File, `file:${uri}`, manager.projectScope, { start: 0, end: Number.MAX_SAFE_INTEGER }, uri);
    manager.fileMap.set(uri, fileScope);

    // Populate Scope with Definitions from SourceFile
    for (const def of sourceFile.definitions) {
        // Extract includes
        if (def.type?.text?.toLowerCase() === 'include' && def.name?.text) {
            const includedFile = def.name.text.replace(/^["']|["']$/g, '');
            manager.includedFiles.add(includedFile);
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
                             manager.projectScope.children.find(c => c.id.toLowerCase() === defId.toLowerCase());
            
            if (existing) {
                defScope = manager.createScope(ScopeKind.Definition, defId, existing, { start: def.start, end: def.end }, uri);
                defScope.variables = existing.variables;
                defScope.functions = existing.functions;
                defScope.actions = existing.actions;
                defScope.attributes = existing.attributes;
                defScope.schemas = existing.schemas;
                defScope.definitions = existing.definitions;
            } else {
                defScope = manager.createScope(ScopeKind.Definition, defId, fileScope, { start: def.start, end: def.end }, uri);
            }
        } else {
            defScope = manager.createScope(ScopeKind.Definition, defId, fileScope, { start: def.start, end: def.end }, uri);
        }

        // Add definition parameters/variables if any (e.g. from functions)
        for (const attr of def.attributes || []) {
            const attrNameLower = attr.name.text.toLowerCase().replace(/\s+/g, '');
            
            // Track structural hierarchy (Report -> Form -> Part -> Line -> Field)
            if (['form', 'part', 'line', 'field'].includes(attrNameLower)) {
                if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                    for (const val of attr.value) {
                        if (val.kind === SyntaxKind.Identifier) {
                            const childName = (val as IdentifierNode).text;
                            const childId = `${attrNameLower.charAt(0).toUpperCase() + attrNameLower.slice(1)}:${childName}`;
                            
                            let parents = manager.parentDefinitions.get(childId.toLowerCase());
                            if (!parents) {
                                parents = new Set<string>();
                                manager.parentDefinitions.set(childId.toLowerCase(), parents);
                            }
                            parents.add(defId.toLowerCase());

                            let children = manager.childDefinitions.get(defId.toLowerCase());
                            if (!children) {
                                children = new Set<string>();
                                manager.childDefinitions.set(defId.toLowerCase(), children);
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
                            
                            let uses = manager.useInheritance.get(defId.toLowerCase());
                            if (!uses) {
                                uses = new Set<string>();
                                manager.useInheritance.set(defId.toLowerCase(), uses);
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
                    const symbol: VariableSymbol = {
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
                        manager.projectScope.variables.set(varName.toLowerCase(), symbol);
                    } else {
                        // Local to the current definition
                        defScope.variables.set(varName.toLowerCase(), symbol);
                    }
                }
            } else if (def.type?.text?.toLowerCase() === 'system') {
                const systemDefName = def.name?.text?.toLowerCase();
                if (systemDefName === 'variable' || systemDefName === 'variables') {
                    // [System: Variable] MyGlobalVar : "" -> MyGlobalVar is the variable!
                    const varName = attr.name.text;
                    const symbol: VariableSymbol = {
                        name: varName,
                        kind: SymbolKind.Variable,
                        uri: uri,
                        start: attr.name.start,
                        end: attr.name.end,
                        definitionType: 'Variable'
                    };
                    manager.projectScope.variables.set(varName.toLowerCase(), symbol);
                } else if (systemDefName === 'formula' || systemDefName === 'formulae' || systemDefName === 'formulas') {
                    // [System: Formula] MyURL : "" -> MyURL is the formula!
                    const formulaName = attr.name.text;
                    const symbol: VariableSymbol = {
                        name: formulaName,
                        kind: SymbolKind.Variable, // Treat formula as variable reference
                        uri: uri,
                        start: attr.name.start,
                        end: attr.name.end,
                        definitionType: 'Formula'
                    };
                    manager.projectScope.variables.set(formulaName.toLowerCase(), symbol);
                }
            } else if (def.type?.text?.toLowerCase() === 'function' && attrNameLower === 'parameter') {
                // Parse function parameters
                for (const paramNode of attr.value) {
                    if (paramNode.kind === SyntaxKind.Identifier) {
                        const varName = (paramNode as IdentifierNode).text;
                        const symbol: VariableSymbol = {
                            name: varName,
                            kind: SymbolKind.Variable,
                            uri: uri,
                            start: paramNode.start,
                            end: paramNode.end,
                            definitionType: 'Variable'
                        };
                        defScope.variables.set(varName.toLowerCase(), symbol);
                    }
                }
            } else if (attrNameLower === 'fetchobject') {
                // Fetch Object: <Object Type> : <Expression> : <List of methods>
                if (attr.value.length > 2) {
                    for (let i = 2; i < attr.value.length; i++) {
                        const methodNode = attr.value[i];
                        if (methodNode.kind === SyntaxKind.Identifier) {
                            const methodName = (methodNode as IdentifierNode).text;
                            const symbol: VariableSymbol = {
                                name: '$' + methodName,
                                kind: SymbolKind.Field, // Treat methods as field references
                                uri: uri,
                                start: methodNode.start,
                                end: methodNode.end,
                                definitionType: 'Method'
                            };
                            defScope.variables.set('$' + methodName.toLowerCase(), symbol);
                        } else if (methodNode.kind === SyntaxKind.List) {
                            for (const subNode of (methodNode as any).values) {
                                if (subNode.kind === SyntaxKind.Identifier) {
                                    const methodName = (subNode as IdentifierNode).text;
                                    const symbol: VariableSymbol = {
                                        name: '$' + methodName,
                                        kind: SymbolKind.Field, // Treat methods as field references
                                        uri: uri,
                                        start: subNode.start,
                                        end: subNode.end,
                                        definitionType: 'Method'
                                    };
                                    defScope.variables.set('$' + methodName.toLowerCase(), symbol);
                                }
                            }
                        }
                    }
                }
            }
        }

        // Build block scopes for statements inside the definition
        if (def.statements && def.statements.length > 0) {
            buildBlockScopes(manager, def.statements, defScope, uri);
        }
    }

    return fileScope;
}

export function buildBlockScopes(manager: IScopeManager, statements: StatementNode[], parentScope: Scope, uri: string) {
    for (const stmt of statements) {
        let currentScope = parentScope;

        // Check if statement is a block statement
        const actionText = stmt.action?.text?.toLowerCase();
        
        if ((stmt as any).statements !== undefined) {
            // It's a block node (IfNode, WhileNode, ForNode, WalkNode)
            const blockNode = stmt as BlockStatementNode;
            
            // Create a new Block Scope
            const blockScope = manager.createScope(ScopeKind.Block, `block:${blockNode.start}`, parentScope, { start: blockNode.start, end: blockNode.end }, uri);
            currentScope = blockScope;

            // Add iterator variable for For loops
            if (actionText === 'fortoken' || actionText === 'forcollection' || actionText === 'forrange' || actionText === 'for') {
                const forNode = blockNode as ForNode;
                if (forNode.iteratorVariable) {
                    const varName = forNode.iteratorVariable.text;
                    const symbol: VariableSymbol = {
                        name: varName,
                        kind: SymbolKind.Variable,
                        uri: uri,
                        start: forNode.iteratorVariable.start,
                        end: forNode.iteratorVariable.end,
                        definitionType: 'Variable'
                    };
                    blockScope.variables.set(varName.toLowerCase(), symbol);
                }
            }

            // Recursively build scopes for inner statements
            if (blockNode.statements.length > 0) {
                buildBlockScopes(manager, blockNode.statements, currentScope, uri);
            }

            // Handle IfNode's elseStatements
            if (actionText === 'if') {
                const ifNode = blockNode as IfNode;
                if (ifNode.elseStatements && ifNode.elseStatements.length > 0) {
                    buildBlockScopes(manager, ifNode.elseStatements, currentScope, uri);
                }
            }
        }
    }
}
