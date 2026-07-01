import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { findReferenceAtOffset } from '../../features/definition';
import { ScopeManager } from '../../semantics/scopeManager';
import { SymbolKind } from 'tally-tdl-shared';

describe('Statement Definition Range', () => {
    it('should find reference for multi-word argument in statement', () => {
        const tdl = `
[Form: My Form]
    01: Alter : Part : My Part Name
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const offsetMy = tdl.indexOf('My Part Name') + 1;
        
                const mockScopeManager = new ScopeManager();

        // Mock action in globalScope
        mockScopeManager.globalScope.actions.set('alter', {
            name: 'Alter',
            parameters: [
                { RefersTo: 'Definition Type' }, // First param is definition type
                { RefersTo: 'Part' } // Second param is definition name
            ],
            totalParameters: 2,
            totalMandatoryParameters: 2,
            kind: SymbolKind.Object // Action
        } as any);

        const refMy = findReferenceAtOffset(sourceFile, offsetMy, tdl, mockScopeManager);
        
        expect(refMy).toBeDefined();
        expect(refMy!.name).toBe('My Part Name');
    });
});
