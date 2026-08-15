import { describe, it, expect, beforeEach } from 'vitest';
import { ScopeManager, ScopeKind, DefinitionScope } from '../../semantics/scopeManager';
import { ScopeViewerService } from '../../semantics/scopeManager/scopeViewerService';
import { buildFileScope } from '../../semantics/scopeManager/scopeBuilder';
import { Parser } from '../../core/parser/parser';
import { Lexer } from '../../core/lexer/lexer';

describe('ScopeViewerService', () => {
    let manager: ScopeManager;
    let viewer: ScopeViewerService;

    beforeEach(() => {
                manager = new ScopeManager();
        
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
        for (const [defType, defMap] of manager.scopeIndex.entries()) {
            let globalDefMap = manager.globalScope.definitions.get(defType);
            if (!globalDefMap) {
                globalDefMap = new Map();
                manager.globalScope.definitions.set(defType, globalDefMap);
            }
            for (const [name, syms] of defMap.entries()) {
                for (const sym of syms) {
                    if (sym.kind === ScopeKind.Definition) {
                        const ds = sym as DefinitionScope;
                        if (ds.definition) {
                            globalDefMap.set(name, ds.definition);
                        }
                    }
                }
            }
        }
        manager.scopeIndex.clear();

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

    it('should return comprehensive scope details for a Report definition', () => {
        const sourceCode = `
[Report: SalesReport]
    Form: SalesForm
    Variable: SVCompany : String
    Variable: ReportTotal : Number
    Local Formula: CalcTotal : 100 + 200
    Use: BaseReport

[Form: SalesForm]
    Part: SalesPart

[Part: SalesPart]
    Line: SalesLine

[Line: SalesLine]
    Field: SalesField

[Field: SalesField]
    Set as: "Hello"
        `;

        const parser = new Parser(sourceCode);
        const ast = parser.parse();
        const fileScope = buildFileScope(manager, 'report_details_test.tdl', ast);
        manager.indexScope(fileScope);

        const details = viewer.getScopeDetails('Report:SalesReport');
        expect(details).toBeDefined();
        expect(details!.name).toBe('SalesReport');
        expect(details!.definitionType).toBe('Report');
        expect(details!.kind).toBe(ScopeKind.Definition);

        // Variables
        expect(details!.variables).toBeDefined();
        expect(details!.variables.length).toBe(2);
        const varNames = details!.variables.map(v => v.name.toLowerCase());
        expect(varNames).toContain('svcompany');
        expect(varNames).toContain('reporttotal');

        // Formulas
        expect(details!.formulas).toBeDefined();
        expect(details!.formulas.length).toBe(1);
        expect(details!.formulas[0].name.toLowerCase()).toBe('calctotal');

        // Structural children grouped by type
        expect(details!.childrenByType).toBeDefined();
        expect(details!.childrenByType['Form']).toBeDefined();
        expect(details!.childrenByType['Form'].length).toBe(1);
        expect(details!.childrenByType['Form'][0].name).toBe('SalesForm');

        // Uses
        expect(details!.usedDefinitions).toBeDefined();
        expect(details!.usedDefinitions).toContain('report:basereport');
    });

    it('should return scope details for a Field definition', () => {
        const sourceCode = `
[Field: CustomField]
    Set as: "Sample Value"
    Variable: FieldVar : Logical
        `;

        const parser = new Parser(sourceCode);
        const ast = parser.parse();
        const fileScope = buildFileScope(manager, 'field_details_test.tdl', ast);
        manager.indexScope(fileScope);

        const details = viewer.getScopeDetails('Field:CustomField');
        expect(details).toBeDefined();
        expect(details!.name).toBe('CustomField');
        expect(details!.definitionType).toBe('Field');
        expect(details!.variables.length).toBe(1);
        expect(details!.variables[0].name.toLowerCase()).toBe('fieldvar');
    });
});

