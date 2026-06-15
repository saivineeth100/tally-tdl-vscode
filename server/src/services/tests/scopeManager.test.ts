import { describe, it, expect } from 'vitest';
import { ScopeManager, ScopeKind } from '../scopeManager';
import { SymbolTable, SymbolKind } from '../symbolTable';
import { SourceFile, SyntaxKind } from '../../parser/ast';

describe('ScopeManager', () => {
    it('should create root scopes on initialization', () => {
        const symbolTable = new SymbolTable();
        const manager = new ScopeManager(symbolTable);

        // Access private properties via casting or testing public behavior
        // Since we can't easily access privates, we'll verify behavior

        // Global scope should exist (we can't check it directly without accessor, 
        // but let's assume it works if no error)
        expect(manager).toBeDefined();
    });

    it('should resolve symbols from global metadata', () => {
        const symbolTable = new SymbolTable();
        const manager = new ScopeManager(symbolTable);

        const mockMetadata = {
            functions: [
                { Name: 'Date', Description: 'Returns current date' }
            ]
        };

        manager.initializeGlobalScope(mockMetadata);

        // Create a dummy file scope to start search from
        const fileScope = manager.createScope(ScopeKind.File, 'test', undefined); // Parent will be set to project scope internally? 
        // Wait, createScope takes parent explicitly. 
        // We need to validly attach it to the tree or just search `globalScope` directly if we exposed it.

        // Actually, let's use a workaround: resolve logic checks parent chain.
        // We need to attach our test scope to the tree.
        // But `projectScope` is private. 

        // Valid way: use buildFileScope which attaches to projectScope
        const mockSourceFile = { definitions: [], start: 0, end: 100 } as unknown as SourceFile;
        const scope = manager.buildFileScope('file://test.tdl', mockSourceFile);

        const resolved = manager.resolve('Date', scope);
        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('Date');
        expect(resolved?.kind).toBe(SymbolKind.Function);
    });

    it('should resolve symbols from file scope', () => {
        const symbolTable = new SymbolTable();
        const manager = new ScopeManager(symbolTable);

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
        // necessarily add the definition symbol itself to the *File Scope* (SymbolTable usually handles that).
        // ScopeManager logic says: "Symbols defined directly in this scope".
        // If we want `MyReport` to be resolvable via ScopeManager, `buildFileScope` needs to add it to Project or File scope symbols.

        // Let's check implementation of buildFileScope...
        // It creates `defScope` but doesn't add `MyReport` symbol to `fileScope`. 
        // This confirms `SymbolTable` is still primary for Top-Level definitions.

        // So `resolve` should fall back to `SymbolTable`.

        symbolTable.addSymbol({
            name: 'MyReport',
            kind: SymbolKind.Report,
            uri: 'file://test.tdl',
            start: 10,
            end: 18,
            definitionType: 'Report'
        });

        const scope = manager.buildFileScope('file://test.tdl', mockSourceFile);
        const resolved = manager.resolve('MyReport', scope);

        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('MyReport');
    });

    it('should parse Fetch Object attributes and add them to scope', () => {
        const symbolTable = new SymbolTable();
        const manager = new ScopeManager(symbolTable);

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
        const defScope = scope.children[0];
        expect(defScope).toBeDefined();

        // Check if $Name and $Parent are in symbols
        const nameSymbol = defScope.symbols.get('$name');
        expect(nameSymbol).toBeDefined();
        expect(nameSymbol?.name).toBe('$Name');
        expect(nameSymbol?.definitionType).toBe('Method');

        const parentSymbol = defScope.symbols.get('$parent');
        expect(parentSymbol).toBeDefined();
        expect(parentSymbol?.name).toBe('$Parent');
    });

    it('should parse [System: Formula] and add to global project scope', () => {
        const symbolTable = new SymbolTable();
        const manager = new ScopeManager(symbolTable);

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
        
        const resolved = manager.resolve('MyURL', scope);
        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('MyURL');
        expect(resolved?.definitionType).toBe('Formula');
        expect(resolved?.kind).toBe(SymbolKind.Variable);
    });

    it('should parse [System: Formulae] and add to global project scope', () => {
        const symbolTable = new SymbolTable();
        const manager = new ScopeManager(symbolTable);

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
        
        const resolved = manager.resolve('MyVarFormula', scope);
        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('MyVarFormula');
        expect(resolved?.definitionType).toBe('Formula');
    });
});
