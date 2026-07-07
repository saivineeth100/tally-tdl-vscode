import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { buildFileScope } from '../../semantics/scopeManager/scopeBuilder';
import { testScopeManager } from '../../__tests__/test-setup';
import { provideAttributeValueCompletions } from '../../features/completion/providers/attributeProvider';

describe('Variable Scoping and Resolution', () => {
    it('should resolve variable declared at Report scope', async () => {
        const tdl = `
        [Report: MyReport]
            Variable: Explode Flag : Logical
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const fileScope = buildFileScope(testScopeManager!, 'file:///test_scoping.tdl', sourceFile);
        testScopeManager!.indexScope(fileScope);
        
        const reportScope = fileScope.childScopes.find(s => s.id.toLowerCase() === 'report:myreport');
        expect(reportScope).toBeDefined();

        const resolved = testScopeManager!.resolveVariable('Explode Flag', reportScope!);
        expect(resolved).toBeDefined();
        expect(resolved?.name).toBe('Explode Flag');

        testScopeManager!.unindexScope(fileScope);
    });

    it('should resolve variables declared in inline format', async () => {
        const tdl = `
        [Report: MyReport]
            Variable: Var1, Var2 : String
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const fileScope = buildFileScope(testScopeManager!, 'file:///test_scoping.tdl', sourceFile);
        testScopeManager!.indexScope(fileScope);

        const reportScope = fileScope.childScopes.find(s => s.id.toLowerCase() === 'report:myreport');
        expect(reportScope).toBeDefined();

        const resolved1 = testScopeManager!.resolveVariable('Var1', reportScope!);
        expect(resolved1).toBeDefined();
        expect(resolved1?.name).toBe('Var1');

        const resolved2 = testScopeManager!.resolveVariable('Var2', reportScope!);
        expect(resolved2).toBeDefined();
        expect(resolved2?.name).toBe('Var2');

        testScopeManager!.unindexScope(fileScope);
    });

    it('should resolve variables declared at System scope', async () => {
        const tdl = `
        [System: Variables]
            SVCurrentCompany : "My Company"
            Variable: SVGlobVar1, SVGlobVar2 : String : "Global"
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const fileScope = buildFileScope(testScopeManager!, 'file:///test_scoping.tdl', sourceFile);
        testScopeManager!.indexScope(fileScope);
        
        const resolvedComp = testScopeManager!.resolveVariable('SVCurrentCompany', fileScope);
        expect(resolvedComp).toBeDefined();
        expect(resolvedComp?.name).toBe('SVCurrentCompany');

        const resolvedGlob1 = testScopeManager!.resolveVariable('SVGlobVar1', fileScope);
        expect(resolvedGlob1).toBeDefined();
        expect(resolvedGlob1?.name).toBe('SVGlobVar1');

        const resolvedGlob2 = testScopeManager!.resolveVariable('SVGlobVar2', fileScope);
        expect(resolvedGlob2).toBeDefined();
        expect(resolvedGlob2?.name).toBe('SVGlobVar2');

        testScopeManager!.unindexScope(fileScope);
    });

    it('should resolve variable declared at Function scope', async () => {
        const tdl = `
        [Function: MyFunction]
            Variable: LocalVar : Number
            Static Variable: StaticVar : String
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const fileScope = buildFileScope(testScopeManager!, 'file:///test_scoping.tdl', sourceFile);
        testScopeManager!.indexScope(fileScope);

        const funcScope = fileScope.childScopes.find(s => s.id.toLowerCase() === 'function:myfunction');
        expect(funcScope).toBeDefined();

        const resolvedLocal = testScopeManager!.resolveVariable('LocalVar', funcScope!);
        expect(resolvedLocal).toBeDefined();
        expect(resolvedLocal?.name).toBe('LocalVar');

        testScopeManager!.unindexScope(fileScope);
    });

    it('should suggest scoped variables for Set attribute value completion inside Report definition', async () => {
        const tdl = `
        [Report: MyReport]
            Variable: Explode Flag : Logical
            Set: 
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const manager = testScopeManager!;
        const fileScope = buildFileScope(manager, 'file:///test_scoping_set.tdl', sourceFile);
        manager.indexScope(fileScope);

        // Register a mock system variable in projectScope
        manager.projectScope.variables.set('svtestglobal', {
            name: 'SVTestGlobal',
            kind: 3, // SymbolKind.Variable
            uri: 'global:metadata',
            start: 0, end: 0,
            definitionType: 'Variable'
        } as any);

        // Register a mock out-of-scope Variable template definition
        if (!manager.globalScope.definitions.has('variable')) {
            manager.globalScope.definitions.set('variable', new Map());
        }
        manager.globalScope.definitions.get('variable')?.set('outofscopetemplate', {
            name: 'OutOfScopeTemplate',
            kind: 0, // SymbolKind.Definition
            uri: 'global:metadata',
            start: 0, end: 0,
            definitionType: 'Variable'
        } as any);

        const reportScope = fileScope.childScopes.find(s => s.id.toLowerCase() === 'report:myreport');
        expect(reportScope).toBeDefined();

        const context = {
            attributeName: 'Set',
            paramIndex: 0,
            valueParts: [],
            partial: ''
        };

        const suggestions = provideAttributeValueCompletions(manager, 'Report', context as any, undefined, reportScope, sourceFile.definitions[0]);
        const variableNames = suggestions.map(s => s.label);
        
        // Scoped local variable must be present
        expect(variableNames).toContain('Explode Flag');
        // Global system variable must be present
        expect(variableNames).toContain('SVTestGlobal');
        // Out-of-scope template variable definition must NOT be present
        expect(variableNames).not.toContain('OutOfScopeTemplate');

        // Cleanup
        manager.projectScope.variables.delete('svtestglobal');
        manager.globalScope.definitions.get('variable')?.delete('outofscopetemplate');
        manager.unindexScope(fileScope);
    });

    it('should suggest scoped variables inside Function UDF definition scope', async () => {
        const tdl = `
        [Function: MyFunction]
            Variable: LocalVar : Number
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const manager = testScopeManager!;
        const fileScope = buildFileScope(manager, 'file:///test_scoping_func.tdl', sourceFile);
        manager.indexScope(fileScope);

        const funcScope = fileScope.childScopes.find(s => s.id.toLowerCase() === 'function:myfunction');
        expect(funcScope).toBeDefined();

        const reachableVars = manager.getAllVariablesInScope(funcScope!);
        expect(reachableVars.has('localvar')).toBe(true);

        manager.unindexScope(fileScope);
    });
});
