import { describe, it, expect } from 'vitest';
import { provideCodeLens } from '../codeLens';
import { Parser } from '../../parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ScopeManager } from '../scopeManager';
import { SymbolTable } from '../symbolTable';

import { buildFileScope } from '../scopeManager/scopeBuilder';

function createCodeLensContext(text: string) {
    const parser = new Parser(text);
    const sourceFile = parser.parse();
    const doc = TextDocument.create('file:///test.txt', 'tally', 1, text);
    const symbolTable = new SymbolTable();
    const scopeManager = new ScopeManager(symbolTable);
    
    // Mock global attributes for 'field' so that 'Set As' is known but 'LF1' is unknown (implicit formula)
    const fieldAttrs = new Map<string, any>();
    fieldAttrs.set('setas', { name: 'setas' });
    scopeManager.globalScope.attributes.set('field', fieldAttrs as any);
    
    // Build real scope
    buildFileScope(scopeManager, 'file:///test.txt', sourceFile);
    
    return { sourceFile, doc, scopeManager };
}

describe('Code Lens Provider', () => {
    it('should provide CodeLens for regular definitions', () => {
        const text = `[Form: My Form]`;
        const { sourceFile, doc, scopeManager } = createCodeLensContext(text);
        
        const lenses = provideCodeLens(sourceFile, doc, scopeManager);
        expect(lenses.length).toBe(1);
        expect(lenses[0].data.name).toBe('My Form');
    });

    it('should provide CodeLens for implicit local formulas', () => {
        const text = `[Field: Local Formula]
            Set As: @LF1 + @LF2
            LF1: "Hello"
            LF2: "World"`;
        const { sourceFile, doc, scopeManager } = createCodeLensContext(text);
        
        const lenses = provideCodeLens(sourceFile, doc, scopeManager);
        
        const names = lenses.map(l => l.data.name);
        expect(names).toContain('Local Formula');
        expect(names).toContain('LF1');
        expect(names).toContain('LF2');
    });

    it('should provide CodeLens for explicit system formulas', () => {
        const text = `[System: Formula]
            Global Formula 1 : $Something
            Global Formula 2 : $SomethingElse`;
        const { sourceFile, doc, scopeManager } = createCodeLensContext(text);
        
        const lenses = provideCodeLens(sourceFile, doc, scopeManager);
        const names = lenses.map(l => l.data.name);
        expect(names).toContain('Global Formula 1');
        expect(names).toContain('Global Formula 2');
        expect(names).not.toContain('Formula');
    });

    it('should provide CodeLens for explicit local formulas via Local Formulae', () => {
        const text = `[Field: Local Formula]
            Set As: @LF1 + @LF2
            Local Formulae: LF1: "Hello"
            Local Formula: LF2: "World"`;
        const { sourceFile, doc, scopeManager } = createCodeLensContext(text);
        
        const lenses = provideCodeLens(sourceFile, doc, scopeManager);
        
        const names = lenses.map(l => l.data.name);
        expect(names).toContain('Local Formula');
        expect(names).toContain('LF1');
        expect(names).toContain('LF2');
    });
});
