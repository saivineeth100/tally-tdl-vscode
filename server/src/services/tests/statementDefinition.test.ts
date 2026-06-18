import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { findReferenceAtOffset } from '../definition';
import { ScopeManager } from '../scopeManager';
import { SymbolTable } from '../symbolTable';

describe('Statement Definition Range', () => {
    it('should find reference for multi-word argument in statement', () => {
        const tdl = `
[Form: My Form]
    01: Alter : Part : My Part Name
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const offsetMy = tdl.indexOf('My Part Name') + 1;
        
        const symbolTable = new SymbolTable();
        const mockScopeManager = new ScopeManager(symbolTable);

        // Mock action in globalScope
        mockScopeManager.globalScope.actions.set('alter', {
            name: 'Alter',
            parameters: [
                { RefersTo: 'Definition Type' }, // First param is definition type
                { RefersTo: 'Part' } // Second param is definition name
            ],
            totalParameters: 2,
            totalMandatoryParameters: 2,
            kind: SymbolTable.SymbolKind.Variable // Action
        } as any);

        const refMy = findReferenceAtOffset(sourceFile, offsetMy, tdl, mockScopeManager);
        
        expect(refMy).toBeDefined();
        expect(refMy!.name).toBe('My Part Name');
    });
});
