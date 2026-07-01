import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { findReferenceAtOffset, findDefinitionByName } from '../../features/definition';

describe('Definition Range & Multi-word Support', () => {
    it('should find reference for multi-word collection name', () => {
        const tdl = `
[Collection: My Collection]
    Title: "Test"

[Report: My Report]
    Collection: My Collection
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        // Find offset of 'My' in 'Collection: My Collection'
        // We know 'My Collection' starts after 'Collection: '
        const reportDef = sourceFile.definitions[1];
        const collAttr = reportDef.attributes[0];

        // Assuming value[0] holds 'My Collection' or parts of it
        // Let's rely on finding the string in the full text for offset
        const fullText = tdl;
        const refOffsetStr = "Collection: My Collection";
        const refStart = fullText.lastIndexOf(refOffsetStr) + "Collection: ".length;

        // Test clicking on "My"
        const offsetMy = refStart + 1;
        const refMy = findReferenceAtOffset(sourceFile, offsetMy, fullText);

        expect(refMy).toBeDefined();
        expect(refMy!.name).toBe('My Collection');
        expect(refMy!.expectedType).toBe('Collection');

        // Test clicking on "Collection" (the second word)
        const offsetColl = refStart + 5;
        const refColl = findReferenceAtOffset(sourceFile, offsetColl, fullText);

        expect(refColl).toBeDefined();
        expect(refColl!.name).toBe('My Collection');
    });
});
