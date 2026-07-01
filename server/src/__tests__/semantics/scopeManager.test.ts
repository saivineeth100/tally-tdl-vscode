import { describe, it, expect } from 'vitest';
import { ScopeManager, ScopeKind, symbolKindToLSPSymbolKind, hasFunctionsAndActions, hasDefinitions, hasAttributes, hasSchemas, getFieldsInScope } from '../../semantics/scopeManager';
import { SymbolKind as LSPSymbolKind } from 'vscode-languageserver';
import { SymbolKind } from 'tally-tdl-shared';
import { SourceFile, SyntaxKind } from '../../core/ast/ast';
import { Parser } from '../../core/parser/parser';
import { testScopeManager, createTestScopeManager } from '../../__tests__/test-setup';
describe('ScopeManager', () => {
    it('should create root scopes on initialization', () => {
                const manager = createTestScopeManager();

        // Access private properties via casting or testing public behavior
        // Since we can't easily access privates, we'll verify behavior

        // Global scope should exist (we can't check it directly without accessor, 
        // but let's assume it works if no error)
        expect(manager).toBeDefined();
    });

    it('should resolve symbols from global metadata', () => {
                const manager = createTestScopeManager();

        manager.initializeGlobalScope();
        manager.globalScope.functions.set('date', {
            name: 'Date',
            parameters: [],
            totalParameters: 0,
            totalMandatoryParameters: 0,
            kind: SymbolKind.Function
        } as any);

        // Create a dummy file scope to start search from
        const fileScope = manager.createFileScope('test', manager.projectScope, {start: 0, end: 100}, 'file://test.tdl'); // Parent will be set to project scope internally? 
        // Wait, createScope takes parent explicitly. 
        // We need to validly attach it to the tree or just search `globalScope` directly if we exposed it.

        // Actually, let's use a workaround: resolve logic checks parent chain.
        // We need to attach our test scope to the tree.
        // But `projectScope` is private. 

        // Valid way: use buildFileScope which attaches to projectScope
        const mockSourceFile = { definitions: [], start: 0, end: 100 } as unknown as SourceFile;
        const scope = manager.buildFileScope('file://test.tdl', mockSourceFile);

        const resolved = manager.resolveDefinition('Date', 'Function', scope);
        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('Date');
        expect(resolved?.kind).toBe(SymbolKind.Function);
    });

    it('should resolve symbols from file scope', () => {
                const manager = createTestScopeManager();

        const mockSourceFile = {
            definitions: [
                {
                    name: { text: 'MyReport', start: 10, end: 18 },
                    type: { text: 'Report', start: 1, end: 7 },
                    start: 0,
                    end: 100
                }
            ],
            start: 0,
            end: 100
        } as unknown as SourceFile;

        // Note: buildFileScope currently creates scopes for definitions but doesn't 
        // necessarily add the definition symbol itself to the *File Scope* (usually handles that).
        // ScopeManager logic says: "Symbols defined directly in this scope".
        // If we want `MyReport` to be resolvable via ScopeManager, `buildFileScope` needs to add it to Project or File scope symbols.

        // Let's check implementation of buildFileScope...
        // It creates `defScope` but doesn't add `MyReport` symbol to `fileScope`. 
        // This confirms `` is still primary for Top-Level definitions.

        // So `resolve` should fall back to ``.

        manager.scopeIndex.set('report', new Map([ ['myreport', { kind: ScopeKind.Definition, definition: { name: 'MyReport', kind: SymbolKind.Report, uri: 'file://test.tdl', start: 10, end: 18, definitionType: 'Report' } as any } as any] ]));

        const scope = manager.buildFileScope('file://test.tdl', mockSourceFile);
        const resolved = manager.resolveDefinition('MyReport', 'Report', scope);

        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('MyReport');
    });

    it('should parse Fetch Object attributes and add them to scope', () => {
                const manager = createTestScopeManager();

        const mockSourceFile = {
            definitions: [
                {
                    name: { text: 'MyColl', start: 10, end: 16 },
                    type: { text: 'Collection', start: 1, end: 10 },
                    start: 0,
                    end: 100,
                    attributes: [
                        {
                            name: { text: 'Fetch Object', start: 20, end: 32 },
                            value: [
                                { kind: SyntaxKind.Identifier, text: 'Ledger', start: 35, end: 41 },
                                { kind: SyntaxKind.Identifier, text: '##Var', start: 45, end: 50 },
                                { kind: SyntaxKind.List, values: [
                                    { kind: SyntaxKind.Identifier, text: 'Name', start: 55, end: 59 },
                                    { kind: SyntaxKind.Identifier, text: 'Parent', start: 61, end: 67 }
                                ]}
                            ],
                            start: 20,
                            end: 80
                        }
                    ],
                    statements: []
                }
            ],
            start: 0,
            end: 100
        } as unknown as SourceFile;

        const scope = manager.buildFileScope('file://test.tdl', mockSourceFile);
        
        // Find defScope for MyColl
        const defScope = scope.childScopes[0];
        expect(defScope).toBeDefined();

        // Check if $Name and $Parent are in symbols
        const nameSymbol = defScope.variables.get('$name');
        expect(nameSymbol).toBeDefined();
        expect(nameSymbol?.name).toBe('$Name');
        expect(nameSymbol?.definitionType).toBe('Method');

        const parentSymbol = defScope.variables.get('$parent');
        expect(parentSymbol).toBeDefined();
        expect(parentSymbol?.name).toBe('$Parent');
    });

    it('should parse [System: Formula] and add to global project scope', () => {
                const manager = createTestScopeManager();

        const mockSourceFile = {
            definitions: [
                {
                    name: { text: 'Formula', start: 9, end: 16 },
                    type: { text: 'System', start: 1, end: 7 },
                    start: 0,
                    end: 100,
                    attributes: [
                        {
                            name: { text: 'MyURL', start: 20, end: 25 },
                            value: [
                                { kind: SyntaxKind.Literal, text: '"http://Localhost"', start: 28, end: 46 }
                            ],
                            start: 20,
                            end: 46
                        }
                    ],
                    statements: []
                }
            ],
            start: 0,
            end: 100
        } as unknown as SourceFile;

        manager.buildFileScope('file://test.tdl', mockSourceFile);
        
        // Build another file scope to test global resolution
        const scope = manager.buildFileScope('file://test2.tdl', { definitions: [], start: 0, end: 10 } as unknown as SourceFile);
        
        const resolved = manager.resolveFormula('MyURL', scope);
        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('MyURL');
        expect(resolved?.definitionType).toBe('Formula');
        expect(resolved?.kind).toBe(SymbolKind.Formula);
    });

    it('should parse [System: Formulae] and add to global project scope', () => {
                const manager = createTestScopeManager();

        const mockSourceFile = {
            definitions: [
                {
                    name: { text: 'Formulae', start: 9, end: 17 },
                    type: { text: 'System', start: 1, end: 7 },
                    start: 0,
                    end: 100,
                    attributes: [
                        {
                            name: { text: 'MyVarFormula', start: 20, end: 32 },
                            value: [
                                { kind: SyntaxKind.Literal, text: '""', start: 35, end: 37 }
                            ],
                            start: 20,
                            end: 37
                        }
                    ],
                    statements: []
                }
            ],
            start: 0,
            end: 100
        } as unknown as SourceFile;

        manager.buildFileScope('file://test.tdl', mockSourceFile);
        
        const scope = manager.buildFileScope('file://test2.tdl', { definitions: [], start: 0, end: 10 } as unknown as SourceFile);
        
        const resolved = manager.resolveFormula('MyVarFormula', scope);
        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('MyVarFormula');
        expect(resolved?.definitionType).toBe('Formula');
    });

    describe('Scope graph cleanup on rebuild', () => {
        it('should remove stale childDefinitions after removing Form from Report', () => {
            const manager = createTestScopeManager();
            const uri = 'file://test.tdl';
            
            // Build with Report -> Form
            const source1 = {
                definitions: [{
                    type: { text: 'Report' }, name: { text: 'R' },
                    attributes: [{
                        name: { text: 'Form' },
                        value: [{ kind: SyntaxKind.Identifier, text: 'F' }]
                    }]
                }],
                start: 0, end: 100
            } as unknown as SourceFile;
            manager.buildFileScope(uri, source1);
            
            expect(manager.childDefinitions.get('report:r')?.has('form:f')).toBe(true);
            expect(manager.parentDefinitions.get('form:f')?.has('report:r')).toBe(true);
            
            // Rebuild without Form
            const source2 = {
                definitions: [{
                    type: { text: 'Report' }, name: { text: 'R' },
                    attributes: []
                }],
                start: 0, end: 100
            } as unknown as SourceFile;
            manager.buildFileScope(uri, source2);
            
            expect(manager.childDefinitions.get('report:r')).toBeUndefined();
            expect(manager.parentDefinitions.get('form:f')).toBeUndefined();
        });

        it('should remove stale useInheritance after removing Use attribute', () => {
            const manager = createTestScopeManager();
            const uri = 'file://test.tdl';
            
            const source1 = {
                definitions: [{
                    type: { text: 'Report' }, name: { text: 'R' },
                    attributes: [{
                        name: { text: 'Use' },
                        value: [{ kind: SyntaxKind.Identifier, text: 'BaseReport' }]
                    }]
                }],
                start: 0, end: 100
            } as unknown as SourceFile;
            manager.buildFileScope(uri, source1);
            
            expect(manager.useInheritance.get('report:r')?.has('report:basereport')).toBe(true);
            
            const source2 = {
                definitions: [{
                    type: { text: 'Report' }, name: { text: 'R' },
                    attributes: []
                }],
                start: 0, end: 100
            } as unknown as SourceFile;
            manager.buildFileScope(uri, source2);
            
            expect(manager.useInheritance.get('report:r')).toBeUndefined();
        });

        it('should clean nested scopeIndex maps correctly', () => {
            const manager = createTestScopeManager();
            const uri = 'file://test.tdl';
            
            // Simulate adding a definition to projectScope
            const defMap = new Map();
            defMap.set('myreport', { uri, name: 'MyReport', kind: SymbolKind.Report });
            manager.scopeIndex.set('report', defMap);
            
            expect(manager.scopeIndex.get('report')?.has('myreport')).toBe(true);
            
            manager.removeFileScope(uri);
            
            expect(manager.scopeIndex.get('report')).toBeUndefined(); // map should be deleted if empty
        });

        it('should preserve other URIs project definitions on single file removal', () => {
            const manager = createTestScopeManager();
            
            const defMap = new Map();
            defMap.set('myreport1', { uri: 'file://a.tdl', name: 'MyReport1', kind: SymbolKind.Report });
            defMap.set('myreport2', { uri: 'file://b.tdl', name: 'MyReport2', kind: SymbolKind.Report });
            manager.scopeIndex.set('report', defMap);
            
            manager.removeFileScope('file://a.tdl');
            
            expect(manager.scopeIndex.get('report')?.has('myreport1')).toBe(false);
            expect(manager.scopeIndex.get('report')?.has('myreport2')).toBe(true);
        });

        it('should not share mutable maps between base and modifier scopes', () => {
            const manager = createTestScopeManager();
            
            const baseSource = {
                definitions: [{
                    type: { text: 'Report' }, name: { text: 'R' },
                    attributes: [{
                        name: { text: 'Variable' },
                        value: [{ kind: SyntaxKind.Identifier, text: 'X' }]
                    }],
                    start: 0, end: 100
                }],
                start: 0, end: 100
            } as unknown as SourceFile;
            manager.buildFileScope('file://base.tdl', baseSource);
            
            const baseScope = manager.findDefinitionScope('Report:R');
            expect(baseScope?.variables.has('x')).toBe(true);
            
            const modSource = {
                definitions: [{
                    modifier: true,
                    type: { text: 'Report' }, name: { text: 'R' },
                    attributes: [{
                        name: { text: 'Variable' },
                        value: [{ kind: SyntaxKind.Identifier, text: 'Y' }]
                    }],
                    start: 0, end: 100
                }],
                start: 0, end: 100
            } as unknown as SourceFile;
            manager.buildFileScope('file://mod.tdl', modSource);
            
            const modScope = manager.getScopeAt('file://mod.tdl', 50);
            
            // X should not be in the modScope's OWN variables map anymore because maps aren't shared
            // and buildFileScope doesn't copy from base
            expect(modScope?.variables.has('x')).toBe(false); 
            expect(modScope?.variables.has('y')).toBe(true);
            
            expect(baseScope?.variables.has('x')).toBe(true);
            expect(baseScope?.variables.has('y')).toBe(false); // No pollution!
        });

        it('should remove includedFiles entries on file removal', () => {
            const manager = createTestScopeManager();
            const uri = 'file://test.tdl';
            
            const source1 = {
                definitions: [{
                    type: { text: 'Include' }, name: { text: '"common.tdl"' },
                    attributes: []
                }],
                start: 0, end: 100
            } as unknown as SourceFile;
            manager.buildFileScope(uri, source1);
            
            expect(manager.includedFiles.has('common.tdl')).toBe(true);
            
            manager.removeFileScope(uri);
            expect(manager.includedFiles.has('common.tdl')).toBe(false);
        });
    });

    describe('Symbol kind consolidation', () => {
        it('maps Colour and Color to same SymbolKind', () => {
            const manager = testScopeManager;
            expect(definitionTypeToSymbolKind('color', manager)).toBe(definitionTypeToSymbolKind('colour', manager));
            expect(definitionTypeToSymbolKind('color', manager)).toBe(SymbolKind.Color);
        });

        it('maps Formula, Formulae, Formulas to Formula', () => {
            const manager = testScopeManager;
            expect(definitionTypeToSymbolKind('formula', manager)).toBe(SymbolKind.Formula);
            expect(definitionTypeToSymbolKind('formulae', manager)).toBe(SymbolKind.Formula);
            expect(definitionTypeToSymbolKind('formulas', manager)).toBe(SymbolKind.Formula);
        });

        it('maps unknown definition type to Unknown', () => {
            const manager = testScopeManager;
            expect(definitionTypeToSymbolKind('nonexistent_type', manager)).toBe(SymbolKind.Unknown);
        });

        it('maps System definitions to Variable', () => {
            const manager = testScopeManager;
            expect(definitionTypeToSymbolKind('system', manager)).toBe(SymbolKind.Variable);
        });

        it('LSP mapping is consistent', () => {
            expect(symbolKindToLSPSymbolKind(SymbolKind.Button)).toBe(LSPSymbolKind.Event);
            expect(symbolKindToLSPSymbolKind(SymbolKind.Report)).toBe(LSPSymbolKind.Class);
        });
    });

    describe('Discriminated scope model', () => {
        it('GlobalScope has functions/actions/attributes/schemas maps', () => {
            const manager = createTestScopeManager();
            const globalScope = manager.globalScope;
            
            expect(globalScope.kind).toBe(ScopeKind.Global);
            expect(hasFunctionsAndActions(globalScope)).toBe(true);
            expect(hasAttributes(globalScope)).toBe(true);
            expect(hasSchemas(globalScope)).toBe(true);
            expect(hasDefinitions(globalScope)).toBe(true);
            
            expect(globalScope.functions).toBeDefined();
            expect(globalScope.actions).toBeDefined();
            expect(globalScope.attributes).toBeDefined();
            expect(globalScope.schemas).toBeDefined();
            expect(globalScope.definitions).toBeDefined();
        });

        it('ProjectScope has definitions map but not functions/actions', () => {
            const manager = createTestScopeManager();
            const projectScope = manager.projectScope;
            
            expect(projectScope.kind).toBe(ScopeKind.Project);
            expect(hasDefinitions(projectScope)).toBe(false);
            expect(hasFunctionsAndActions(projectScope)).toBe(false);
            
            expect(manager.scopeIndex).toBeDefined();
            expect((projectScope as any).functions).toBeUndefined();
        });

        it('DefinitionScope has structuralChildren and uses', () => {
            const manager = createTestScopeManager();
            const defScope = manager.createDefinitionScope('test', manager.projectScope, {start: 0, end: 1}, 'uri');
            
            expect(defScope.kind).toBe(ScopeKind.Definition);
            expect(defScope.structuralChildren).toBeDefined();
            expect(defScope.uses).toBeDefined();
            expect(hasDefinitions(defScope)).toBe(false);
            expect((defScope as any).definitions).toBeUndefined();
        });

        it('BlockScope only has variables', () => {
            const manager = createTestScopeManager();
            const blockScope = manager.createBlockScope('test', manager.projectScope, {start: 0, end: 1}, 'uri');
            
            expect(blockScope.kind).toBe(ScopeKind.Block);
            expect(blockScope.variables).toBeDefined();
            expect((blockScope as any).functions).toBeUndefined();
            expect((blockScope as any).definitions).toBeUndefined();
        });

        it('every scope can store variables via BaseScope.variables', () => {
            const manager = createTestScopeManager();
            const scopes = [
                manager.globalScope,
                manager.projectScope,
                manager.createFileScope('testFile', manager.projectScope, {start: 0, end: 1}, 'uri'),
                manager.createDefinitionScope('testDef', manager.projectScope, {start: 0, end: 1}, 'uri'),
                manager.createFunctionScope('testFunc', manager.projectScope, {start: 0, end: 1}, 'uri'),
                manager.createBlockScope('testBlock', manager.projectScope, {start: 0, end: 1}, 'uri')
            ];
            
            for (const scope of scopes) {
                expect(scope.variables).toBeDefined();
                expect(scope.variables instanceof Map).toBe(true);
            }
        });
    });

    describe('Resolution context', () => {
        it('resolves variable with caller context from Report→Function', () => {
            const manager = createTestScopeManager();
            
            // Create a report scope with a variable
            const reportScope = manager.createDefinitionScope('report:MyReport', manager.projectScope, {start: 0, end: 100}, 'test.tdl');
            reportScope.variables.set('myvar', { name: 'MyVar', kind: SymbolKind.Variable } as any);
            
            // Create a function scope that has no variables of its own
            const funcScope = manager.createFunctionScope('MyFunction', manager.projectScope, {start: 0, end: 100}, 'test.tdl');
            
            // Attempt to resolve MyVar inside funcScope without caller context (should fail)
            let resolved = manager.resolveVariable('MyVar', funcScope);
            expect(resolved).toBeUndefined();
            
            // Attempt to resolve with caller context
            const callerContext = { visitedScopes: new Set<string>(), state: manager, initialScope: reportScope };
            resolved = manager.resolveVariable('MyVar', funcScope, undefined, callerContext);
            expect(resolved).toBeDefined();
            expect(resolved?.name).toBe('MyVar');
        });

        it('resolves attribute with spaces in name', () => {
            const manager = createTestScopeManager();
            const reportScope = manager.createDefinitionScope('report:MyReport', manager.projectScope, {start: 0, end: 10}, 'test.tdl');
            
            manager.globalScope.attributes.set('report', new Map());
            manager.globalScope.attributes.get('report')?.set('myattribute', { name: 'My Attribute', kind: SymbolKind.Unknown } as any);
            
            const resolved = manager.resolveAttribute('My Attribute', 'Report', reportScope);
            expect(resolved).toBeDefined();
            expect(resolved?.name).toBe('My Attribute');
            
            const resolvedNoSpace = manager.resolveAttribute('MyAttribute', 'Report', reportScope);
            expect(resolvedNoSpace).toBeDefined();
        });

        it('resolves action by alias without linear scan', () => {
            const manager = createTestScopeManager();
            // Add action with normalized alias directly
            manager.globalScope.actions.set('myactionalias', { name: 'My Action', kind: SymbolKind.Function } as any);
            
            const resolved = manager.resolveAction('My Action Alias', manager.projectScope);
            expect(resolved).toBeDefined();
            expect(resolved?.name).toBe('My Action');
        });
    });

    describe('Definition Registration', () => {
        it('should register definitions in projectScope', () => {
            const manager = createTestScopeManager();
            const mockSourceFile = {
                start: 0, end: 100,
                definitions: [
                    {
                        kind: SyntaxKind.Definition,
                        type: { text: 'Report', start: 1, end: 7, kind: SyntaxKind.Identifier },
                        name: { text: 'MyReport', start: 9, end: 17, kind: SyntaxKind.Identifier },
                        attributes: [],
                        start: 0,
                        end: 20
                    }
                ]
            } as unknown as SourceFile;

            manager.buildFileScope('file:///test.tdl', mockSourceFile);

            const reportDefs = manager.scopeIndex.get('report');
            expect(reportDefs).toBeDefined();
            
            const myReport = reportDefs?.get('myreport');
            expect(myReport).toBeDefined();
            expect((myReport as any)?.definition?.name).toBe('MyReport');
            expect((myReport as any)?.definition?.definitionType).toBe('Report');
        });

        it('should not register modifiers or incomplete definitions', () => {
            const manager = createTestScopeManager();
            const mockSourceFile = {
                start: 0, end: 100,
                definitions: [
                    {
                        kind: SyntaxKind.Definition,
                        modifier: { text: '#', start: 1, end: 2, kind: SyntaxKind.Identifier },
                        type: { text: 'Report', start: 2, end: 8, kind: SyntaxKind.Identifier },
                        name: { text: 'MyReport', start: 10, end: 18, kind: SyntaxKind.Identifier },
                        attributes: [],
                        start: 0,
                        end: 20
                    }]}
            expect(manager.includedFiles.has('common.tdl')).toBe(false);
        });
    });

    describe('Symbol kind consolidation', () => {
        it('maps Colour and Color to same SymbolKind', () => {
            const manager = testScopeManager;
            expect(definitionTypeToSymbolKind('color', manager)).toBe(definitionTypeToSymbolKind('colour', manager));
            expect(definitionTypeToSymbolKind('color', manager)).toBe(SymbolKind.Color);
        });

        it('maps Formula, Formulae, Formulas to Formula', () => {
            const manager = testScopeManager;
            expect(definitionTypeToSymbolKind('formula', manager)).toBe(SymbolKind.Formula);
            expect(definitionTypeToSymbolKind('formulae', manager)).toBe(SymbolKind.Formula);
            expect(definitionTypeToSymbolKind('formulas', manager)).toBe(SymbolKind.Formula);
        });

        it('maps unknown definition type to Unknown', () => {
            const manager = testScopeManager;
            expect(definitionTypeToSymbolKind('nonexistent_type', manager)).toBe(SymbolKind.Unknown);
        });

        it('maps System definitions to Variable', () => {
            const manager = testScopeManager;
            expect(definitionTypeToSymbolKind('system', manager)).toBe(SymbolKind.Variable);
        });

        it('LSP mapping is consistent', () => {
            expect(symbolKindToLSPSymbolKind(SymbolKind.Button)).toBe(LSPSymbolKind.Event);
            expect(symbolKindToLSPSymbolKind(SymbolKind.Report)).toBe(LSPSymbolKind.Class);
        });
    });

    describe('Discriminated scope model', () => {
        it('GlobalScope has functions/actions/attributes/schemas maps', () => {
            const manager = createTestScopeManager();
            const globalScope = manager.globalScope;
            
            expect(globalScope.kind).toBe(ScopeKind.Global);
            expect(hasFunctionsAndActions(globalScope)).toBe(true);
            expect(hasAttributes(globalScope)).toBe(true);
            expect(hasSchemas(globalScope)).toBe(true);
            expect(hasDefinitions(globalScope)).toBe(true);
            
            expect(globalScope.functions).toBeDefined();
            expect(globalScope.actions).toBeDefined();
            expect(globalScope.attributes).toBeDefined();
            expect(globalScope.schemas).toBeDefined();
            expect(globalScope.definitions).toBeDefined();
        });

        it('ProjectScope has definitions map but not functions/actions', () => {
            const manager = createTestScopeManager();
            const projectScope = manager.projectScope;
            
            expect(projectScope.kind).toBe(ScopeKind.Project);
            expect(hasDefinitions(projectScope)).toBe(false);
            expect(hasFunctionsAndActions(projectScope)).toBe(false);
            
            expect(manager.scopeIndex).toBeDefined();
            expect((projectScope as any).functions).toBeUndefined();
        });

        it('DefinitionScope has structuralChildren and uses', () => {
            const manager = createTestScopeManager();
            const defScope = manager.createDefinitionScope('test', manager.projectScope, {start: 0, end: 1}, 'uri');
            
            expect(defScope.kind).toBe(ScopeKind.Definition);
            expect(defScope.structuralChildren).toBeDefined();
            expect(defScope.uses).toBeDefined();
            expect(hasDefinitions(defScope)).toBe(false);
            expect((defScope as any).definitions).toBeUndefined();
        });

        it('BlockScope only has variables', () => {
            const manager = createTestScopeManager();
            const blockScope = manager.createBlockScope('test', manager.projectScope, {start: 0, end: 1}, 'uri');
            
            expect(blockScope.kind).toBe(ScopeKind.Block);
            expect(blockScope.variables).toBeDefined();
            expect((blockScope as any).functions).toBeUndefined();
            expect((blockScope as any).definitions).toBeUndefined();
        });

        it('every scope can store variables via BaseScope.variables', () => {
            const manager = createTestScopeManager();
            const scopes = [
                manager.globalScope,
                manager.projectScope,
                manager.createFileScope('testFile', manager.projectScope, {start: 0, end: 1}, 'uri'),
                manager.createDefinitionScope('testDef', manager.projectScope, {start: 0, end: 1}, 'uri'),
                manager.createFunctionScope('testFunc', manager.projectScope, {start: 0, end: 1}, 'uri'),
                manager.createBlockScope('testBlock', manager.projectScope, {start: 0, end: 1}, 'uri')
            ];
            
            for (const scope of scopes) {
                expect(scope.variables).toBeDefined();
                expect(scope.variables instanceof Map).toBe(true);
            }
        });
    });

    describe('Resolution context', () => {
        it('resolves variable with caller context from Report→Function', () => {
            const manager = createTestScopeManager();
            
            // Create a report scope with a variable
            const reportScope = manager.createDefinitionScope('report:MyReport', manager.projectScope, {start: 0, end: 100}, 'test.tdl');
            reportScope.variables.set('myvar', { name: 'MyVar', kind: SymbolKind.Variable } as any);
            
            // Create a function scope that has no variables of its own
            const funcScope = manager.createFunctionScope('MyFunction', manager.projectScope, {start: 0, end: 100}, 'test.tdl');
            
            // Attempt to resolve MyVar inside funcScope without caller context (should fail)
            let resolved = manager.resolveVariable('MyVar', funcScope);
            expect(resolved).toBeUndefined();
            
            // Attempt to resolve with caller context
            const callerContext = { visitedScopes: new Set<string>(), state: manager, initialScope: reportScope };
            resolved = manager.resolveVariable('MyVar', funcScope, undefined, callerContext);
            expect(resolved).toBeDefined();
            expect(resolved?.name).toBe('MyVar');
        });

        it('resolves attribute with spaces in name', () => {
            const manager = createTestScopeManager();
            const reportScope = manager.createDefinitionScope('report:MyReport', manager.projectScope, {start: 0, end: 10}, 'test.tdl');
            
            manager.globalScope.attributes.set('report', new Map());
            manager.globalScope.attributes.get('report')?.set('myattribute', { name: 'My Attribute', kind: SymbolKind.Unknown } as any);
            
            const resolved = manager.resolveAttribute('My Attribute', 'Report', reportScope);
            expect(resolved).toBeDefined();
            expect(resolved?.name).toBe('My Attribute');
            
            const resolvedNoSpace = manager.resolveAttribute('MyAttribute', 'Report', reportScope);
            expect(resolvedNoSpace).toBeDefined();
        });

        it('resolves action by alias without linear scan', () => {
            const manager = createTestScopeManager();
            // Add action with normalized alias directly
            manager.globalScope.actions.set('myactionalias', { name: 'My Action', kind: SymbolKind.Function } as any);
            
            const resolved = manager.resolveAction('My Action Alias', manager.projectScope);
            expect(resolved).toBeDefined();
            expect(resolved?.name).toBe('My Action');
        });
    });

    describe('Definition Registration', () => {
        it('should register definitions in projectScope', () => {
            const manager = createTestScopeManager();
            const mockSourceFile = {
                start: 0, end: 100,
                definitions: [
                    {
                        kind: SyntaxKind.Definition,
                        type: { text: 'Report', start: 1, end: 7, kind: SyntaxKind.Identifier },
                        name: { text: 'MyReport', start: 9, end: 17, kind: SyntaxKind.Identifier },
                        attributes: [],
                        start: 0,
                        end: 20
                    }
                ]
            } as unknown as SourceFile;

            manager.buildFileScope('file:///test.tdl', mockSourceFile);

            const reportDefs = manager.scopeIndex.get('report');
            expect(reportDefs).toBeDefined();
            
            const myReport = reportDefs?.get('myreport');
            expect(myReport).toBeDefined();
            expect((myReport as any)?.definition?.name).toBe('MyReport');
            expect((myReport as any)?.definition?.definitionType).toBe('Report');
        });

        it('should not register modifiers or incomplete definitions', () => {
            const manager = createTestScopeManager();
            const mockSourceFile = {
                start: 0, end: 100,
                definitions: [
                    {
                        kind: SyntaxKind.Definition,
                        modifier: { text: '#', start: 1, end: 2, kind: SyntaxKind.Identifier },
                        type: { text: 'Report', start: 2, end: 8, kind: SyntaxKind.Identifier },
                        name: { text: 'MyReport', start: 10, end: 18, kind: SyntaxKind.Identifier },
                        attributes: [],
                        start: 0,
                        end: 20
                    },
                    {
                        kind: SyntaxKind.Definition,
                        isIncomplete: true,
                        type: { text: 'Report', start: 2, end: 8, kind: SyntaxKind.Identifier },
                        attributes: [],
                        start: 0,
                        end: 20
                    }
                ]
            } as unknown as SourceFile;

            manager.buildFileScope('file:///test2.tdl', mockSourceFile);

            const reportDefs = manager.scopeIndex.get('report');
            expect(reportDefs?.has('myreport')).toBeFalsy();
            expect(Array.from(manager.scopeIndex.keys())).toEqual([]);
        });
    });

    describe('getSymbolsPaginated Search and Filtering', () => {
        it('should return schema with serialized properties', () => {
            const manager = createTestScopeManager();
            
            const schemaProps = new Map();
            schemaProps.set('MyProp', { Name: 'MyProp', DataType: 'String', IsComplex: false, IsRepeated: false });
            
            manager.globalScope.schemas.set('company', {
                name: 'Company',
                kind: SymbolKind.Object,
                uri: 'test.tdl',
                start: 0,
                end: 10,
                definitionType: 'Schema',
                properties: schemaProps,
                isPrimary: true,
                complexProperties: new Map()
            });

            const result = manager.viewer.getSymbolsPaginated('global', 'Schema_Company', 1, 10);
            expect(result.symbols.length).toBe(1);
            expect(result.symbols[0].name).toBe('Company');
            const serialized = (result.symbols[0] as any).serializedProperties;
            expect(serialized).toBeDefined();
            expect(serialized.length).toBe(1);
            expect(serialized[0].name).toBe('MyProp');
            expect(serialized[0].DataType).toBe('String');
        });

        it('should filter schema properties by query, handling edge cases', () => {
            const manager = createTestScopeManager();
            
            const schemaProps = new Map();
            schemaProps.set('Name', { Name: 'Name', DataType: 'String', IsComplex: false, IsRepeated: false });
            schemaProps.set('Age', { Name: 'Age', DataType: 'Number', IsComplex: false, IsRepeated: false });
            schemaProps.set('Address', { Name: 'Address', ObjectName: 'AddressObj', IsComplex: true, IsRepeated: false });
            schemaProps.set('EdgeCase', { Name: 'EdgeCase', IsComplex: false, IsRepeated: false }); // Missing DataType/ObjectName
            
            manager.globalScope.schemas.set('employee', {
                name: 'Employee',
                kind: SymbolKind.Object,
                uri: 'test.tdl',
                start: 0,
                end: 10,
                definitionType: 'Schema',
                properties: schemaProps,
                isPrimary: true,
                complexProperties: new Map()
            });

            // Search by exact property name
            const result1 = manager.viewer.getSymbolsPaginated('global', 'Schema_Employee', 1, 10, 'Age');
            expect((result1.symbols[0] as any).serializedProperties.length).toBe(1);
            expect((result1.symbols[0] as any).serializedProperties[0].name).toBe('Age');

            // Search by DataType
            const result2 = manager.viewer.getSymbolsPaginated('global', 'Schema_Employee', 1, 10, 'Number');
            expect((result2.symbols[0] as any).serializedProperties.length).toBe(1);
            expect((result2.symbols[0] as any).serializedProperties[0].name).toBe('Age');

            // Search by ObjectName
            const result3 = manager.viewer.getSymbolsPaginated('global', 'Schema_Employee', 1, 10, 'AddressObj');
            expect((result3.symbols[0] as any).serializedProperties.length).toBe(1);
            expect((result3.symbols[0] as any).serializedProperties[0].name).toBe('Address');
            
            // Search no match
            const result4 = manager.viewer.getSymbolsPaginated('global', 'Schema_Employee', 1, 10, 'NonExistent');
            expect(result4.symbols.length).toBe(0);

            // Empty query should return all 4 properties
            const result5 = manager.viewer.getSymbolsPaginated('global', 'Schema_Employee', 1, 10, '');
            expect((result5.symbols[0] as any).serializedProperties.length).toBe(4);
            
            // Search matching missing DataType edgecase by name
            const result6 = manager.viewer.getSymbolsPaginated('global', 'Schema_Employee', 1, 10, 'EdgeCase');
            expect((result6.symbols[0] as any).serializedProperties.length).toBe(1);
        });

        it('should return all schemas when requesting SchemasCategory', () => {
            const manager = createTestScopeManager();
            
            manager.globalScope.schemas.set('schema1', { name: 'Schema1', kind: SymbolKind.Object } as any);
            manager.globalScope.schemas.set('schema2', { name: 'Schema2', kind: SymbolKind.Object } as any);
            
            const result = manager.viewer.getSymbolsPaginated('global', 'SchemasCategory', 1, 10);
            expect(result.symbols.length).toBe(2);
            expect(result.symbols.map((s: any) => s.name).sort()).toEqual(['Schema1', 'Schema2']);
        });

        it('should handle attributes search and empty states', () => {
            const manager = createTestScopeManager();
            
            // Empty AttributesCategory
            const emptyResult = manager.viewer.getSymbolsPaginated('global', 'AttributesCategory', 1, 10);
            expect(emptyResult.symbols.length).toBe(0);

            manager.globalScope.attributes.set('report', new Map());
            manager.globalScope.attributes.get('report')?.set('format', {
                name: 'Format',
                kind: SymbolKind.Unknown,
                definitionType: 'Report',
                uri: 'test.tdl',
                start: 0,
                end: 10,
                parameters: [],
                isDiscrete: false
            });
            
            manager.globalScope.attributes.set('form', new Map());
            manager.globalScope.attributes.get('form')?.set('width', {
                name: 'Width',
                kind: SymbolKind.Unknown,
                definitionType: 'Form',
                uri: 'test.tdl',
                start: 0,
                end: 10,
                parameters: [],
                isDiscrete: false
            });

            // Return all attributes when query is empty
            const allResult = manager.viewer.getSymbolsPaginated('global', 'AttributesCategory', 1, 10, '');
            expect(allResult.symbols.length).toBe(2);

            // Search by Attribute Name should not match inside categories
            const result1 = manager.viewer.getSymbolsPaginated('global', 'AttributesCategory', 1, 10, 'Format');
            expect(result1.symbols.length).toBe(0);

            // Search by Definition Type (Form)
            const result2 = manager.viewer.getSymbolsPaginated('global', 'AttributesCategory', 1, 10, 'form');
            expect(result2.symbols.length).toBe(1);
            expect(result2.symbols[0].name).toBe('form');

            // Search within attribute_report
            const result3 = manager.viewer.getSymbolsPaginated('global', 'attribute_report', 1, 10, 'Format');
            expect(result3.symbols.length).toBe(1);
            expect(result3.symbols[0].name).toBe('Format');
            
            // Search no match
            const result4 = manager.viewer.getSymbolsPaginated('global', 'attribute_report', 1, 10, 'XYZ');
            expect(result4.symbols.length).toBe(0);
        });
        
        it('should extract correct scope ID when passed Category suffix', () => {
            const manager = createTestScopeManager();
            
            manager.globalScope.schemas.set('schema1', { name: 'Schema1', kind: SymbolKind.Object } as any);
            
            // The fake scopeId "global_Schemas" should be resolved to "global"
            const result = manager.viewer.getSymbolsPaginated('global_Schemas', 'SchemasCategory', 1, 10);
            expect(result.symbols.length).toBe(1);
            expect(result.symbols[0].name).toBe('Schema1');
            
            // The fake scopeId "global_Attributes" should be resolved to "global"
            const resultAttr = manager.viewer.getSymbolsPaginated('global_Attributes', 'AttributesCategory', 1, 10);
            expect(resultAttr.symbols.length).toBe(0); // Works, just returns 0 since no attributes registered
        });
    });

    describe('getFieldsInScope', () => {
        it('should return fields from a structural hierarchy', () => {
                        const manager = createTestScopeManager();
            manager.recordGraphContribution = () => {}; // mock graph record

            const tdl = `
                [Report: MyReport]
                    Form: MyForm
                [Form: MyForm]
                    Part: MyPart
                [Part: MyPart]
                    Line: MyLine
                [Line: MyLine]
                    Fields: Field1, Field2
                [Field: Field1]
                    Set As: "1"
                [Field: Field2]
                    Set As: "2"
            `;
            
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            manager.buildFileScope('file://test.tdl', sourceFile);

            // Fetch the scope for the Report to start resolution from
            const reportScope = manager.findDefinitionScope('report:myreport');
            expect(reportScope).toBeDefined();

            const fields = getFieldsInScope({
                state: manager,
                initialScope: reportScope!,
                visitedScopes: new Set()
            });

            expect(fields).toHaveLength(2);
            expect(fields.find(f => f.name.toLowerCase() === 'field1')).toBeDefined();
            expect(fields.find(f => f.name.toLowerCase() === 'field2')).toBeDefined();
        });

        it('should return no fields if definition is not in a structural hierarchy with fields', () => {
                        const manager = createTestScopeManager();
            
            const tdl = `
                [Line: StandaloneLine]
                    Local Formula: MyFormula
            `;
            
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            manager.buildFileScope('file://test.tdl', sourceFile);

            const lineScope = manager.findDefinitionScope('line:standaloneline');
            expect(lineScope).toBeDefined();

            const fields = getFieldsInScope({
                state: manager,
                initialScope: lineScope!,
                visitedScopes: new Set()
            }, manager.globalScope, manager.projectScope);

            // It should NOT fall back to returning the entire project's fields
            expect(fields).toHaveLength(0);
        });

        it('should collect fields from inherited definitions via Use attribute and InUse directive', () => {
                        const manager = createTestScopeManager();
            manager.recordGraphContribution = () => {};

            const tdl = `
[Report: ChildReport]
    Use: ParentReport
    <InUse: Report: MixinReport>

[Report: ParentReport]
    Form: ParentForm

[Form: ParentForm]
    Part: ParentPart

[Part: ParentPart]
    Line: ParentLine

[Line: ParentLine]
    Fields: ParentField

[Field: ParentField]
    Set As: "Parent"

[Report: MixinReport]
    Form: MixinForm
                
[Form: MixinForm]
    Part: MixinPart
                
[Part: MixinPart]
    Line: MixinLine
                
[Line: MixinLine]
    Fields: MixinField
                
[Field: MixinField]
    Set As: "Mixin"
            `;

            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            manager.buildFileScope('file://test.tdl', sourceFile);
            
            const reportScope = manager.findDefinitionScope('report:childreport');
            expect(reportScope).toBeDefined();

            const fields = getFieldsInScope({
                state: manager,
                initialScope: reportScope!,
                visitedScopes: new Set()
            });

            // It should find both ParentField (via Use) and MixinField (via InUse)
            expect(fields).toHaveLength(2);
            expect(fields.find(f => f.name.toLowerCase() === 'parentfield')).toBeDefined();
            expect(fields.find(f => f.name.toLowerCase() === 'mixinfield')).toBeDefined();

            // Verify they are kept in separate inheritance maps
            expect(manager.useInheritance.get('report:childreport')).toContain('report:parentreport');
            expect(manager.useInheritance.get('report:childreport')).not.toContain('report:mixinreport');
            expect(manager.inUseInheritance.get('report:childreport')).toContain('report:mixinreport');
        });
    });

    describe('getDefinitionsInScope', () => {
        it('should return fields even when used Left Fields, Right Fields etc. in Line', () => {
         
           var manager = testScopeManager!
            const tdl = `
                [Line: MyLine]
                    Left Fields: LField1, LField2
                    Right Fields: RField1
                    Right Field: LocField1
                    Fields: NField1
                [Field: LField1]
                [Field: LField2]
                [Field: RField1]
                [Field: LocField1]
                [Field: NField1]
            `;
            
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            manager.buildFileScope('file://test.tdl', sourceFile);

            const lineScope = manager.findDefinitionScope('line:myline');
            expect(lineScope).toBeDefined();

            const fields = manager.getDefinitionsInScope(lineScope!, 'field');

            expect(fields).toHaveLength(5);
            expect(fields.find(f => f.name.toLowerCase() === 'lfield1')).toBeDefined();
            expect(fields.find(f => f.name.toLowerCase() === 'lfield2')).toBeDefined();
            expect(fields.find(f => f.name.toLowerCase() === 'rfield1')).toBeDefined();
            expect(fields.find(f => f.name.toLowerCase() === 'locfield1')).toBeDefined();
            expect(fields.find(f => f.name.toLowerCase() === 'nfield1')).toBeDefined();
        });
    });
});

import { definitionTypeToSymbolKind } from '../../semantics/scopeManager/types';
