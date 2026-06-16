import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { findReferenceAtOffset } from '../definition';

describe('Statement Definition Range', () => {
    it('should find reference for multi-word argument in statement', () => {
        const tdl = `
[Form: My Form]
    01: Alter : Part : My Part Name
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        const offsetMy = tdl.indexOf('My Part Name') + 1;
        
        // Mock metadata with Alter action
        const mockMetadata: any = {
            findDefinitionAttribute: () => undefined,
            actions: [
                {
                    Name: 'Alter',
                    Parameters: [
                        { RefersTo: 'Definition Type' }, // First param is definition type
                        { RefersTo: 'Part' } // Second param is definition name
                    ]
                }
            ]
        };

        const refMy = findReferenceAtOffset(sourceFile, offsetMy, tdl, mockMetadata);
        
        expect(refMy).toBeDefined();
        expect(refMy!.name).toBe('My Part Name');
    });
});
