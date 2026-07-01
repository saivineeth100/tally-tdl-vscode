import { describe, it, expect } from 'vitest';
import { ScopeManager, ScopeKind } from '../../semantics/scopeManager';
import { SymbolKind } from 'tally-tdl-shared';
import { SourceFile, SyntaxKind, IdentifierNode } from '../../core/ast/ast';
import { resolveVariable } from '../../semantics/scopeManager/scopeResolver';

describe('ScopeManager - Schema Integration', () => {
    it('should parse Type, Fetch, Compute attributes and resolve schema fields', () => {
                const manager = new ScopeManager();

        // Add a mock schema "Ledger" to global scope
        manager.initializeGlobalScope();
        manager.globalScope.schemas.set('ledger', {
            name: 'Ledger',
            kind: SymbolKind.Object,
            uri: 'global:schema',
            start: 0, end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['name', { Name: 'Name', IsComplex: false, IsRepeated: false }],
                ['parent', { Name: 'Parent', IsComplex: false, IsRepeated: false }],
                ['closingbalance', { Name: 'ClosingBalance', IsComplex: false, IsRepeated: false }],
                ['billallocations', { Name: 'BillAllocations', IsComplex: true, IsRepeated: true, ObjectName: 'BillAllocations' }]
            ]),
            complexProperties: new Map([
                ['billallocations', 'BillAllocations']
            ]),
            isPrimary: true
        });
        
        manager.globalScope.schemas.set('billallocations', {
            name: 'BillAllocations',
            kind: SymbolKind.Object,
            uri: 'global:schema',
            start: 0, end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['name', { Name: 'Name', IsComplex: false, IsRepeated: false }],
                ['amount', { Name: 'Amount', IsComplex: false, IsRepeated: false }]
            ]),
            complexProperties: new Map(),
            isPrimary: false
        });

        const mockSourceFile = {
            definitions: [
                {
                    name: { text: 'MyColl', start: 10, end: 16 },
                    type: { text: 'Collection', start: 1, end: 10 },
                    start: 0,
                    end: 100,
                    attributes: [
                        {
                            name: { text: 'Type', start: 20, end: 24 },
                            value: [{ kind: SyntaxKind.Identifier, text: 'Ledger', start: 27, end: 33 }],
                            start: 20,
                            end: 33
                        },
                        {
                            name: { text: 'Fetch', start: 35, end: 40 },
                            value: [{ kind: SyntaxKind.Identifier, text: 'Name', start: 43, end: 47 }],
                            start: 35,
                            end: 47
                        },
                        {
                            name: { text: 'Compute', start: 50, end: 57 },
                            value: [{ kind: SyntaxKind.Identifier, text: 'MyComputedField', start: 60, end: 75 }],
                            start: 50,
                            end: 75
                        }
                    ],
                    statements: []
                }
            ],
            start: 0,
            end: 100
        } as unknown as SourceFile;

        const scope = manager.buildFileScope('file://test.tdl', mockSourceFile);
        const collScope = scope.childScopes[0] as any;
        
        // 1. Verify objectScope, fetchedFields, computedFields are parsed correctly
        expect(collScope.objectScope).toBe('Ledger');
        expect(collScope.fetchedFields.has('name')).toBe(true);
        expect(collScope.computedFields.has('mycomputedfield')).toBe(true);

        // 2. Verify schema field resolution respects fetchedFields
        const state = {
            useInheritance: manager.useInheritance,
            inUseInheritance: manager.inUseInheritance,
            parentDefinitions: manager.parentDefinitions,
            childDefinitions: manager.childDefinitions,
            globalScope: manager.globalScope,
            projectScope: manager.projectScope,
            findDefinitionScope: (id: string) => manager.findDefinitionScope(id),
            findGlobalSymbolsByName: (n: string, s?: Set<string>) => manager.findGlobalSymbolsByName(n, s),
            getCanonicalTypeName: (n: string) => manager.getCanonicalTypeName(n),
            normalizeScopeId: (id: string) => manager.normalizeScopeId(id),
            getProjectDefinition: (d: string, n: string) => manager.getProjectDefinition(d, n),
            getWorkspaceDefinition: (d: string, n: string) => manager.getWorkspaceDefinition(d, n)
        };

        const resolvedName = resolveVariable(state, '$Name', collScope, undefined);
        expect(resolvedName).toBeDefined();
        expect(resolvedName?.definitionType).toBe('SchemaProperty');
        
        const resolvedComputed = resolveVariable(state, '$MyComputedField', collScope, undefined);
        expect(resolvedComputed).toBeUndefined(); // Wait, MyComputedField is not in schema or variables, but it's allowed.
        // Actually it's allowed, but it won't resolve unless defined elsewhere. So it's fine.
        
        const resolvedParent = resolveVariable(state, '$Parent', collScope, undefined);
        expect(resolvedParent).toBeUndefined(); // Parent is NOT in fetchedFields or computedFields
    });

    it('should allow all properties if fetch/compute is missing', () => {
                const manager = new ScopeManager();
        manager.initializeGlobalScope();
        manager.globalScope.schemas.set('ledger', {
            name: 'Ledger',
            kind: SymbolKind.Object,
            uri: 'global:schema',
            start: 0, end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['name', { Name: 'Name', IsComplex: false, IsRepeated: false }],
                ['parent', { Name: 'Parent', IsComplex: false, IsRepeated: false }]
            ]),
            complexProperties: new Map(),
            isPrimary: true
        });

        const mockSourceFile = {
            definitions: [
                {
                    name: { text: 'MyColl2', start: 10, end: 17 },
                    type: { text: 'Collection', start: 1, end: 10 },
                    start: 0,
                    end: 100,
                    attributes: [
                        {
                            name: { text: 'Type', start: 20, end: 24 },
                            value: [{ kind: SyntaxKind.Identifier, text: 'Ledger', start: 27, end: 33 }],
                            start: 20,
                            end: 33
                        }
                    ],
                    statements: []
                }
            ],
            start: 0,
            end: 100
        } as unknown as SourceFile;

        const scope = manager.buildFileScope('file://test2.tdl', mockSourceFile);
        const collScope = scope.childScopes[0] as any;
        
        expect(collScope.objectScope).toBe('Ledger');
        expect(collScope.fetchedFields).toBeUndefined();

        const state = {
            useInheritance: manager.useInheritance,
            inUseInheritance: manager.inUseInheritance,
            parentDefinitions: manager.parentDefinitions,
            childDefinitions: manager.childDefinitions,
            globalScope: manager.globalScope,
            projectScope: manager.projectScope,
            findDefinitionScope: (id: string) => manager.findDefinitionScope(id),
            findGlobalSymbolsByName: (n: string, s?: Set<string>) => manager.findGlobalSymbolsByName(n, s),
            getCanonicalTypeName: (n: string) => manager.getCanonicalTypeName(n),
            normalizeScopeId: (id: string) => manager.normalizeScopeId(id),
            getProjectDefinition: (d: string, n: string) => manager.getProjectDefinition(d, n),
            getWorkspaceDefinition: (d: string, n: string) => manager.getWorkspaceDefinition(d, n)
        };

        const resolvedParent = resolveVariable(state, '$Parent', collScope, undefined);
        expect(resolvedParent).toBeDefined();
        expect(resolvedParent?.definitionType).toBe('SchemaProperty');
    });
});
