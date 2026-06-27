import { describe, it, expect, beforeEach } from 'vitest';
import { ScopeManager } from '../scopeManager';
import { ScopeViewerService } from '../scopeManager/scopeViewerService';
import { buildFileScope } from '../scopeManager/scopeBuilder';
import { Parser } from '../../parser/parser';
import { Lexer } from '../../parser/lexer';
import { SymbolTable } from '../symbolTable';

describe('ScopeViewerService', () => {
    let manager: ScopeManager;
    let viewer: ScopeViewerService;

    beforeEach(() => {
        const symbolTable = new SymbolTable();
        manager = new ScopeManager(symbolTable);
        
        // Mock structural relationships needed for these tests
        manager.globalScope.interchangeableAttributesMap.set('form', 'form');
        manager.globalScope.interchangeableAttributesMap.set('part', 'part');
        manager.globalScope.interchangeableAttributesMap.set('line', 'line');
        manager.globalScope.interchangeableAttributesMap.set('field', 'field');
        
        viewer = new ScopeViewerService(manager);
    });

    it('should include structural children as actual nodes in the tree', () => {
        const sourceCode = `
[Report: MyReport]
    Form: MyForm

[Form: MyForm]
    Part: MyPart

[Part: MyPart]
        `;

        const parser = new Parser(sourceCode);
        const ast = parser.parse();

        const fileScope = buildFileScope(manager, 'test.tdl', ast);
        manager.indexScope(fileScope);

        const serialized = viewer.getScopeNode('Report:MyReport');
        expect(serialized).toBeDefined();
        
        // Fetch children
        const children = viewer.getScopeChildren('Report:MyReport');

        // Should have "Structural Hierarchy" child
        const structuralFolder = children.find(c => c.kind === 'Structural Hierarchy');
        expect(structuralFolder).toBeDefined();

        // Structural Hierarchy should contain "Form:MyForm"
        const formNode = structuralFolder!.children.find(c => c.id.toLowerCase() === 'form:myform');
        expect(formNode).toBeDefined();
        
        // And if we get Form:MyForm directly, it should have "Part:MyPart"
        const formChildren = viewer.getScopeChildren('Form:MyForm');
        const formStructural = formChildren.find(c => c.kind === 'Structural Hierarchy');
        expect(formStructural).toBeDefined();
        
        const partNode = formStructural!.children.find(c => c.id.toLowerCase() === 'part:mypart');
        expect(partNode).toBeDefined();
    });

    it('should include structural children for global definitions', () => {
        // Simulate a Base TDL cache load where definitions are in the fileMap but shifted to globalScope definitions
        const sourceCode = `
[Report: BaseReport]
    Form: BaseForm

[Form: BaseForm]
        `;

        const parser = new Parser(sourceCode);
        const ast = parser.parse();

        const fileScope = buildFileScope(manager, 'base.tdl', ast);
        manager.indexScope(fileScope);

        // In the real system, buildVersionCache moves the definitions to globalScope
        for (const [defType, defMap] of manager.projectScope.definitions.entries()) {
            let globalDefMap = manager.globalScope.definitions.get(defType);
            if (!globalDefMap) {
                globalDefMap = new Map();
                manager.globalScope.definitions.set(defType, globalDefMap);
            }
            for (const [name, sym] of defMap.entries()) {
                globalDefMap.set(name, sym);
            }
        }
        manager.projectScope.definitions.clear();

        // And the UI requests it!
        const reportScope = manager.getScopeById('Report:BaseReport');
        expect(reportScope).toBeDefined();

        const children = viewer.getScopeChildren('Report:BaseReport');

        // Should have "Structural Hierarchy" child
        const structuralFolder = children.find(c => c.kind === 'Structural Hierarchy');
        expect(structuralFolder).toBeDefined();
        expect(structuralFolder!._childrenLoaded).toBe(true);
        
        // Structural Hierarchy should contain "Form:BaseForm"
        const formNode = structuralFolder!.children.find(c => c.id.toLowerCase() === 'form:baseform');
        expect(formNode).toBeDefined();
    });

    it('should include Use definitions and structural parents correctly', () => {
        const sourceCode = `
[Report: A]
    Use: B

[Report: B]

[Form: MyForm]
    Part: MyPart

[Part: MyPart]
        `;

        const parser = new Parser(sourceCode);
        const ast = parser.parse();
        const fileScope = buildFileScope(manager, 'use_test.tdl', ast);
        manager.indexScope(fileScope);

        const reportA = viewer.getScopeNode('Report:A');
        expect(reportA!.usedDefinitions).toBeDefined();
        expect(reportA!.usedDefinitions).toContain('report:b');

        const partNode = viewer.getScopeNode('Part:MyPart');
        expect(partNode!.structuralParents).toBeDefined();
        expect(partNode!.structuralParents).toContain('form:myform');
    });
});
