import { SourceFile, SyntaxKind, IdentifierNode, StatementNode, BlockStatementNode, ForNode, WalkNode, IfNode, WhileNode, LiteralNode, ListNode } from '../../core/ast/ast';
import { SymbolInfo, SymbolKind, VariableSymbol, DefinitionSymbol, FormulaSymbol } from 'tally-tdl-shared';
import { Scope, ScopeKind} from './types';
import { normalizeTypeName } from '../../utils/normalizeUtils';
import { resolveModifierChain } from '../../utils/modifierUtils';
import { STRUCTURAL_DEFINITION_TYPES } from '../../validation/validationUtils';
import { normalizeUri } from '../../utils/uri';
// We need to interface with ScopeManager without a circular dependency if possible,
// or just use any/duck typing. Let's define the interface needed from ScopeManager:
export interface IScopeManager {
    globalScope: import('./types').GlobalScope;
    projectScope: import('./types').ProjectScope;
    fileMap: Map<string, Scope>;
    parentDefinitions: Map<string, Set<string>>;
    childDefinitions: Map<string, Set<string>>;
    useInheritance: Map<string, Set<string>>;
    inUseInheritance: Map<string, Set<string>>;
    includedFiles: Set<string>;
    
    createFileScope(id: string, parent: import('./types').ProjectScope, range: import('./types').OffsetRange, uri: string): import('./types').FileScope;
    createDefinitionScope(id: string, parent: Scope, range: import('./types').OffsetRange, uri: string): import('./types').DefinitionScope;
    createFunctionScope(id: string, parent: Scope, range: import('./types').OffsetRange, uri: string): import('./types').FunctionScope;
    createBlockScope(id: string, parent: Scope, range: import('./types').OffsetRange, uri: string): import('./types').BlockScope;
    removeFileScope(uri: string): void;
    findDefinitionScope(id: string): Scope | undefined;
    registerModifierContribution?(contribution: import('./types').ModifierContribution): void;
    recordGraphContribution?: (uri: string, type: 'parentDef' | 'childDef' | 'useInherit' | 'inUseInherit' | 'include' | 'modifier', key1: string, key2?: string) => void;
    indexScope(scope: Scope): void;
    getCanonicalTypeName(normalizedType: string): string;
    getCanonicalAttributeName(normalizedAttributeName: string): string | undefined;
    normalizeScopeId(id: string): string;
    nameIndex: Map<string, import('tally-tdl-shared').DefinitionSymbol[]>;
}

export function buildFileScope(manager: IScopeManager, uri: string, sourceFile: SourceFile, doc?: import('vscode-languageserver-textdocument').TextDocument, parentScope?: Scope): Scope {
    uri = normalizeUri(uri);
    // Ensure any existing file scope and global symbols are removed first
    manager.removeFileScope(uri);

    const actualParent = parentScope || manager.projectScope;
    // Create File Scope
    const fileScope = manager.createFileScope(`file:${uri}`, actualParent as import('./types').ProjectScope, { start: 0, end: Number.MAX_SAFE_INTEGER }, uri);
    manager.fileMap.set(uri, fileScope);

    // Populate Scope with Definitions from SourceFile
    for (const def of sourceFile.definitions) {
        // Extract includes
        if (def.type?.text?.toLowerCase() === 'include' && def.name?.text) {
            const includedFile = def.name.text.replace(/^["']|["']$/g, '');
            manager.includedFiles.add(includedFile);
            if (manager.recordGraphContribution) {
                manager.recordGraphContribution(uri, 'include', includedFile);
            }
        }
        const rawDefTypeLower = normalizeTypeName(def.type?.text || '');
        const defTypeLower = manager.getCanonicalTypeName(rawDefTypeLower);
        // Create a scope for each definition (Report, Field, etc.)
        // The definition name identifies the scope
        const defName = def.name ? def.name.text : 'anonymous';
        const defId = `${def.type?.text || 'Def'}:${defName}`;

        // Handle Definition Modifiers (#, !, *)
        let defScope: Scope;
        const isFunction = def.type?.text?.toLowerCase() === 'function';
        if (def.modifier && def.modifier.Text !== '!') {
            // Find original definition scope in current file or project
            const existing = fileScope.childScopes.find(c => c.id.toLowerCase() === defId.toLowerCase()) || 
                             manager.findDefinitionScope(defId);
            
            if (existing) {
                defScope = isFunction
                    ? manager.createFunctionScope(`modifier:${defId}:${def.start}`, fileScope, { start: def.start, end: def.end }, uri)
                    : manager.createDefinitionScope(`modifier:${defId}:${def.start}`, fileScope, { start: def.start, end: def.end }, uri);
                // Record modifier contribution against base definition
                if (manager.registerModifierContribution) {
                    manager.registerModifierContribution({
                        targetDefinitionId: defId,
                        modifierKind: def.modifier.Text as '#' | '!' | '*',
                        uri: uri,
                        range: { start: def.start, end: def.end },
                        scope: defScope,
                        order: def.start
                    });
                }
            } else {
                defScope = isFunction
                    ? manager.createFunctionScope(defId, fileScope, { start: def.start, end: def.end }, uri)
                    : manager.createDefinitionScope(defId, fileScope, { start: def.start, end: def.end }, uri);
            }
        } else {
            defScope = isFunction
                ? manager.createFunctionScope(defId, fileScope, { start: def.start, end: def.end }, uri)
                : manager.createDefinitionScope(defId, fileScope, { start: def.start, end: def.end }, uri);
        }

        const defSymbol = {
            name: def.name?.text || '',
            kind: (def.type?.text || ''),
            uri: uri,
            start: def.start,
            end: def.end,
            definitionType: def.type?.text || '',
            isModifier: !!def.modifier && def.modifier.Text !== '!',
            isOptional: !!def.modifier && def.modifier.Text === '!',
            range: doc ? { start: doc.positionAt(def.start), end: doc.positionAt(def.end) } : undefined,
            selectionRange: doc && def.name ? { start: doc.positionAt(def.name.start), end: doc.positionAt(def.name.end) } : undefined
        } as DefinitionSymbol;

        if (defScope.kind === ScopeKind.Definition || defScope.kind === ScopeKind.Function) {
            defScope.definition = defSymbol;
            if (defSymbol.name) {
                const name = normalizeTypeName(defSymbol.name);
                let arr = manager.nameIndex.get(name);
                if (!arr) {
                    arr = [];
                    manager.nameIndex.set(name, arr);
                }
                arr.push(defSymbol);
            }
        }

        // Add definition parameters/variables if any (e.g. from functions)
        const deferredModifierAttributes: any[] = [];
        
        // PASS 1: Regular attributes
        for (const attr of def.attributes || []) {
            const attrNameLower = attr.name.text.toLowerCase().replace(/\s+/g, '');
            if (['add', 'replace', 'delete', 'local'].includes(attrNameLower)) {
                deferredModifierAttributes.push(attr);
                continue;
            }
            const targetType = manager.getCanonicalAttributeName(attrNameLower);
            if (targetType) {
                if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                    for (const val of attr.value) {
                        if (val.kind === SyntaxKind.Identifier) {
                            const childName = (val as IdentifierNode).text;
                            const childId = manager.normalizeScopeId(`${targetType}:${childName}`);
                            
                            let parents = manager.parentDefinitions.get(childId);
                            if (!parents) {
                                parents = new Set<string>();
                                manager.parentDefinitions.set(childId, parents);
                            }
                            parents.add(manager.normalizeScopeId(defId));
                            if (manager.recordGraphContribution) {
                                manager.recordGraphContribution(uri, 'parentDef', childId, manager.normalizeScopeId(defId));
                            }

                            let children = manager.childDefinitions.get(manager.normalizeScopeId(defId));
                            if (!children) {
                                children = new Set<string>();
                                manager.childDefinitions.set(manager.normalizeScopeId(defId), children);
                            }
                            children.add(childId);
                            if (defScope.kind === ScopeKind.Definition) {
                                let localStructChildren = defScope.structuralChildren.get(targetType);
                                if (!localStructChildren) {
                                    localStructChildren = new Set<string>();
                                    defScope.structuralChildren.set(targetType, localStructChildren);
                                }
                                localStructChildren.add(childName);
                            }
                            if (manager.recordGraphContribution) {
                                manager.recordGraphContribution(uri, 'childDef', manager.normalizeScopeId(defId), childId);
                            }
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
                            const parentDefId = manager.normalizeScopeId(`${def.type?.text || 'Def'}:${useName}`);
                            
                            let uses = manager.useInheritance.get(manager.normalizeScopeId(defId));
                            if (!uses) {
                                uses = new Set<string>();
                                manager.useInheritance.set(manager.normalizeScopeId(defId), uses);
                            }
                            uses.add(parentDefId);
                            if (defScope.kind === ScopeKind.Definition) {
                                defScope.uses.add(parentDefId);
                            }
                            if (manager.recordGraphContribution) {
                                manager.recordGraphContribution(uri, 'useInherit', manager.normalizeScopeId(defId), parentDefId);
                            }
                        }
                    }
                }
            }

            // Process Directives (e.g., <InUse: Collection: RMColl, Report: MixinR>)
            for (const dir of def.directives || []) {
                if (dir.kind === SyntaxKind.InUseDirective) {
                    const inUseDir = dir as any; // Cast as any or properly import InUseDirectiveNode if not done
                    for (const target of inUseDir.targets) {
                        let inheritType = target.typeName;
                        let inheritName = target.defName;

                        if (!inheritType) {
                            inheritType = def.type?.text || 'Def';
                        }

                        if (inheritName) {
                            const parentDefId = manager.normalizeScopeId(`${inheritType}:${inheritName}`);
                            let uses = manager.inUseInheritance.get(manager.normalizeScopeId(defId));
                            if (!uses) {
                                uses = new Set<string>();
                                manager.inUseInheritance.set(manager.normalizeScopeId(defId), uses);
                            }
                            uses.add(parentDefId);
                            
                            if (manager.recordGraphContribution) {
                                manager.recordGraphContribution(uri, 'inUseInherit', manager.normalizeScopeId(defId), parentDefId);
                            }
                        }
                    }
                }
            }

            if (attrNameLower === 'collection') {
                if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                    if (defScope.kind === ScopeKind.Definition || defScope.kind === ScopeKind.Function) {
                        defScope.collectionScope = (attr.value[0] as IdentifierNode).text;
                    }
                }
            } else if (attrNameLower === 'type') {
                if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                    if (defScope.kind === ScopeKind.Definition || defScope.kind === ScopeKind.Function) {
                        defScope.objectScope = (attr.value[0] as IdentifierNode).text;
                    }
                }
            } else if (attrNameLower === 'fetch') {
                if (attr.value.length > 0) {
                    if (defScope.kind === ScopeKind.Definition) {
                        if (!defScope.fetchedFields) defScope.fetchedFields = new Set<string>();
                        for (const v of attr.value) {
                            if (v.kind === SyntaxKind.Identifier) {
                                defScope.fetchedFields.add((v as IdentifierNode).text.toLowerCase());
                            } else if (v.kind === SyntaxKind.Literal) {
                                const literalNode = v as LiteralNode;
                                const textVal = literalNode.value !== undefined ? String(literalNode.value) : literalNode.token.Text;
                                defScope.fetchedFields.add(textVal.toLowerCase());
                            }
                        }
                    }
                }
            } else if (attrNameLower === 'compute') {
                if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                    if (defScope.kind === ScopeKind.Definition) {
                        if (!defScope.computedFields) defScope.computedFields = new Set<string>();
                        defScope.computedFields.add((attr.value[0] as IdentifierNode).text.toLowerCase());
                    }
                }
            } else if (
                (manager.globalScope.attributes.get(normalizeTypeName(def.type?.text || ''))?.get(attrNameLower)?.type?.toLowerCase() === 'variable list') ||
                (def.type?.text?.toLowerCase() === 'system' && 
                 ['variable', 'variables'].includes(normalizeTypeName(def.name?.text || '')) && 
                 ['variable', 'variables', 'listvariable', 'listvariables', 'listvar', 'staticvariable'].includes(attrNameLower))
            ) {
                if (attr.value.length > 0) {
                    const varNodes: IdentifierNode[] = [];
                    let dataTypeNode: IdentifierNode | undefined;

                    let currentPart = 0; // 0 = varNames, 1 = dataType, 2 = defaultValue
                    
                    for (let i = 0; i < attr.value.length; i++) {
                        const valNode = attr.value[i];
                        if (i > 0) {
                            const prevNode = attr.value[i - 1];
                            const textBetween = sourceFile.text.substring(prevNode.end, valNode.start);
                            if (textBetween.includes(':')) {
                                currentPart++;
                            }
                        }
                        
                        if (currentPart === 0) {
                            if (valNode.kind === SyntaxKind.Identifier) {
                                varNodes.push(valNode as IdentifierNode);
                            }
                        } else if (currentPart === 1) {
                            if (valNode.kind === SyntaxKind.Identifier) {
                                dataTypeNode = valNode as IdentifierNode;
                            }
                        }
                    }

                    const typeName = dataTypeNode?.text;
                    for (const nameNode of varNodes) {
                        const varName = nameNode.text;
                        const symbol: VariableSymbol = {
                            name: varName,
                            kind: SymbolKind.Variable,
                            uri: uri,
                            start: nameNode.start,
                            end: nameNode.end,
                            definitionType: 'Variable',
                            dataType: typeName
                        };
                        const key = normalizeTypeName(varName);
                        const defTypeLower = def.type?.text?.toLowerCase();
                        if (defTypeLower === 'system') {
                            manager.projectScope.variables.set(key, symbol);
                        } else {
                            defScope.variables.set(key, symbol);
                        }
                    }
                }
            } else if (def.type?.text?.toLowerCase() === 'system') {
                const systemDefName = normalizeTypeName(def.name?.text || '');
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
                    manager.projectScope.variables.set(normalizeTypeName(varName), symbol);
                } else if (systemDefName === 'formula' || systemDefName === 'formulae' || systemDefName === 'formulas') {
                    // [System: Formula] MyURL : "" -> MyURL is the formula!
                    const formulaName = attr.name.text;
                    const symbol: FormulaSymbol = {
                        name: formulaName,
                        kind: SymbolKind.Formula,
                        uri: uri,
                        start: attr.name.start,
                        end: attr.name.end,
                        definitionType: 'Formula'
                    };
                    manager.projectScope.formulas.set(normalizeTypeName(formulaName), symbol);
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
            } else if (attrNameLower === 'localformula' || attrNameLower === 'localformulae') {
                if (attr.value.length > 0 && attr.value[0].kind === SyntaxKind.Identifier) {
                    const formulaName = (attr.value[0] as IdentifierNode).text;
                    const symbol: FormulaSymbol = {
                        name: formulaName,
                        kind: SymbolKind.Formula,
                        uri: uri,
                        start: attr.value[0].start,
                        end: attr.value[0].end,
                        definitionType: 'Formula'
                    };
                    if (defScope.kind === ScopeKind.Definition) {
                        defScope.formulas.set(formulaName.toLowerCase(), symbol);
                    }
                }
            } else if (def.type?.text) {
                // Implicit local formula if it's not a known attribute
                const defTypeMetadata = manager.globalScope.attributes.get(def.type.text.toLowerCase());
                // Only treat as implicit formula if we know the definition type and the attribute is unknown
                if (defTypeMetadata && !defTypeMetadata.has(attrNameLower)) {
                    const formulaName = attr.name.text;
                    const symbol: FormulaSymbol = {
                        name: formulaName,
                        kind: SymbolKind.Formula,
                        uri: uri,
                        start: attr.name.start,
                        end: attr.name.end,
                        definitionType: 'Formula'
                    };
                    if (defScope.kind === ScopeKind.Definition) {
                        defScope.formulas.set(formulaName.toLowerCase(), symbol);
                    }
                }
            }
        }

        // PASS 2: Modifier attributes
        for (const attr of deferredModifierAttributes) {
            const attrNameLower = attr.name.text.toLowerCase().replace(/\s+/g, '');
            const resolved = resolveModifierChain(attrNameLower, attr.value, def.type?.text || 'Def', def.name?.text || 'anonymous', manager);
            
            if (!resolved.targetAttribute) continue;
            
            const targetTypeLower = manager.getCanonicalAttributeName(resolved.targetAttribute.text?.toLowerCase() || '');
            if (!targetTypeLower) continue;

            const modifierKind = resolved.modifierKind;
            
            if (STRUCTURAL_DEFINITION_TYPES.includes(targetTypeLower)) {
                switch (modifierKind) {
                    case 'add':
                    case 'local': {
                        for (const val of resolved.values) {
                            if (val.kind === SyntaxKind.Identifier) {
                                const childName = (val as IdentifierNode).text;
                                const childId = manager.normalizeScopeId(`${targetTypeLower}:${childName}`);
                                
                                let parents = manager.parentDefinitions.get(childId);
                                if (!parents) {
                                    parents = new Set<string>();
                                    manager.parentDefinitions.set(childId, parents);
                                }
                                parents.add(manager.normalizeScopeId(defId));
                                if (manager.recordGraphContribution) {
                                    manager.recordGraphContribution(uri, 'parentDef', childId, manager.normalizeScopeId(defId));
                                }

                                let children = manager.childDefinitions.get(manager.normalizeScopeId(defId));
                                if (!children) {
                                    children = new Set<string>();
                                    manager.childDefinitions.set(manager.normalizeScopeId(defId), children);
                                }
                                children.add(childId);
                                
                                if (defScope.kind === ScopeKind.Definition) {
                                    let localStructChildren = defScope.structuralChildren.get(targetTypeLower);
                                    if (!localStructChildren) {
                                        localStructChildren = new Set<string>();
                                        defScope.structuralChildren.set(targetTypeLower, localStructChildren);
                                    }
                                    localStructChildren.add(childName);
                                }
                                if (manager.recordGraphContribution) {
                                    manager.recordGraphContribution(uri, 'childDef', manager.normalizeScopeId(defId), childId);
                                }
                            }
                        }
                        break;
                    }
                    case 'replace': {
                        if (resolved.values.length >= 2 && resolved.values[1].kind === SyntaxKind.Identifier) {
                            const newChildName = (resolved.values[1] as IdentifierNode).text;
                            const childId = manager.normalizeScopeId(`${targetTypeLower}:${newChildName}`);
                            
                            let parents = manager.parentDefinitions.get(childId);
                            if (!parents) {
                                parents = new Set<string>();
                                manager.parentDefinitions.set(childId, parents);
                            }
                            parents.add(manager.normalizeScopeId(defId));
                            
                            let children = manager.childDefinitions.get(manager.normalizeScopeId(defId));
                            if (!children) {
                                children = new Set<string>();
                                manager.childDefinitions.set(manager.normalizeScopeId(defId), children);
                            }
                            children.add(childId);

                            if (defScope.kind === ScopeKind.Definition) {
                                let localStructChildren = defScope.structuralChildren.get(targetTypeLower);
                                if (!localStructChildren) {
                                    localStructChildren = new Set<string>();
                                    defScope.structuralChildren.set(targetTypeLower, localStructChildren);
                                }
                                localStructChildren.add(newChildName);
                                
                                if (resolved.values[0].kind === SyntaxKind.Identifier) {
                                    const oldChildName = (resolved.values[0] as IdentifierNode).text;
                                    localStructChildren.delete(oldChildName);
                                }
                            }
                        }
                        break;
                    }
                    case 'delete': {
                        if (resolved.values.length >= 1 && resolved.values[0].kind === SyntaxKind.Identifier) {
                            if (defScope.kind === ScopeKind.Definition) {
                                const oldChildName = (resolved.values[0] as IdentifierNode).text;
                                const localStructChildren = defScope.structuralChildren.get(targetTypeLower);
                                if (localStructChildren) {
                                    localStructChildren.delete(oldChildName);
                                }
                            }
                        }
                        break;
                    }
                }
            } else if (targetTypeLower === 'fetch') {
                if (defScope.kind === ScopeKind.Definition) {
                    switch (modifierKind) {
                        case 'add':
                        case 'local': {
                            if (!defScope.fetchedFields) defScope.fetchedFields = new Set<string>();
                            for (const v of resolved.values) {
                                if (v.kind === SyntaxKind.Identifier) {
                                    defScope.fetchedFields.add((v as IdentifierNode).text.toLowerCase());
                                } else if (v.kind === SyntaxKind.Literal) {
                                    const literalNode = v as any;
                                    const textVal = literalNode.value !== undefined ? String(literalNode.value) : literalNode.token.Text;
                                    defScope.fetchedFields.add(textVal.toLowerCase());
                                }
                            }
                            break;
                        }
                        case 'delete': {
                            if (defScope.fetchedFields) {
                                for (const v of resolved.values) {
                                    if (v.kind === SyntaxKind.Identifier) {
                                        defScope.fetchedFields.delete((v as IdentifierNode).text.toLowerCase());
                                    } else if (v.kind === SyntaxKind.Literal) {
                                        const literalNode = v as any;
                                        const textVal = literalNode.value !== undefined ? String(literalNode.value) : literalNode.token.Text;
                                        defScope.fetchedFields.delete(textVal.toLowerCase());
                                    }
                                }
                            }
                            break;
                        }
                        case 'replace': {
                            if (resolved.values.length >= 2) {
                                const oldVal = resolved.values[0];
                                const newVal = resolved.values[1];
                                
                                let oldText = '';
                                if (oldVal.kind === SyntaxKind.Identifier) oldText = (oldVal as IdentifierNode).text.toLowerCase();
                                else if (oldVal.kind === SyntaxKind.Literal) oldText = String((oldVal as any).value !== undefined ? (oldVal as any).value : (oldVal as any).token.Text).toLowerCase();
                                
                                let newText = '';
                                if (newVal.kind === SyntaxKind.Identifier) newText = (newVal as IdentifierNode).text.toLowerCase();
                                else if (newVal.kind === SyntaxKind.Literal) newText = String((newVal as any).value !== undefined ? (newVal as any).value : (newVal as any).token.Text).toLowerCase();
                                
                                if (defScope.fetchedFields && oldText) {
                                    defScope.fetchedFields.delete(oldText);
                                }
                                if (newText) {
                                    if (!defScope.fetchedFields) defScope.fetchedFields = new Set<string>();
                                    defScope.fetchedFields.add(newText);
                                }
                            }
                            break;
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
    manager.indexScope(fileScope);
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
            const blockScope = manager.createBlockScope(`block:${blockNode.start}`, parentScope, { start: blockNode.start, end: blockNode.end }, uri);
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

import { definitionTypeToSymbolKind } from '../../semantics/scopeManager/types';
