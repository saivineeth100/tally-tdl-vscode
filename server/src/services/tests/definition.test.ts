
import { describe, it, expect } from 'vitest';
import { findReferenceAtOffset } from '../definition';
import { SourceFile, DefinitionNode, IdentifierNode, SyntaxKind } from '../../parser/ast';
import { TokenKind } from '../../parser/tokenKind';

import { Parser } from '../../parser/parser';

import { ScopeManager } from '../scopeManager';

// Mock ScopeManager
const mockScopeManager = new ScopeManager();

// Add 'Form' attribute 'parts'
const formAttrs = new Map<string, any>();
formAttrs.set('parts', {
    name: 'Part',
    parameters: [
        { IsList: true, RefersTo: 'Part' }
    ]
});
formAttrs.set('use', {
    name: 'Use',
    parameters: [
        { RefersTo: 'Report' }
    ]
});
mockScopeManager.globalScope.attributes.set('FORM', formAttrs);

function createMockSourceFile(tdl: string): { sourceFile: SourceFile, offset: number } {
    const parser = new Parser(tdl);
    const sourceFile = parser.parse();
    // find offset of cursor marked with |
    const cursor = tdl.indexOf('|');
    const cleanTdl = tdl.replace('|', '');

    // Reparse cleanly to get correct offsets
    const parser2 = new Parser(cleanTdl);
    return { sourceFile: parser2.parse(), offset: cursor };
}

describe('Definition Service - References', () => {
    it('should find reference in list attribute (Parts: P1, |P2)', () => {
        const text = `[Form: Test]
            Parts: P1, P2`;
        const offset = text.indexOf('P2') + 1; // Middle of P2

        const { sourceFile } = createMockSourceFile(text);

        const ref = findReferenceAtOffset(sourceFile, offset, text, mockScopeManager);

        expect(ref).toBeDefined();
        expect(ref?.name).toBe('P2');
        expect(ref?.expectedType).toBe('Part'); // Resolved via List param in mock
    });

    it('should find local formula reference inside an expression (@LF1 + @LF2)', () => {
        const text = `[Field: Local Formula]
            Set As: @LF1 + @LF2
            LF1: "Hello"
            LF2: "World"`;
        
        const { sourceFile } = createMockSourceFile(text);
        
        // Offset inside @LF1
        const offsetLF1 = text.indexOf('@LF1') + 2; 
        const refLF1 = findReferenceAtOffset(sourceFile, offsetLF1, text, mockScopeManager);
        expect(refLF1).toBeDefined();
        expect(refLF1?.name).toBe('LF1');
        expect(refLF1?.expectedType).toBe('Formula');

        // Offset inside @LF2
        const offsetLF2 = text.indexOf('@LF2') + 2;
        const refLF2 = findReferenceAtOffset(sourceFile, offsetLF2, text, mockScopeManager);
        expect(refLF2).toBeDefined();
        expect(refLF2?.name).toBe('LF2');
        expect(refLF2?.expectedType).toBe('Formula');
    });

    it('should find global formula reference (@@GlobalFormula)', () => {
        const text = `[Field: Local Formula]
            Set As: @@GlobalFormula`;
        
        const { sourceFile } = createMockSourceFile(text);
        const offset = text.indexOf('@@GlobalFormula') + 5;
        
        const ref = findReferenceAtOffset(sourceFile, offset, text, mockScopeManager);
        expect(ref).toBeDefined();
        expect(ref?.name).toBe('GlobalFormula');
        expect(ref?.expectedType).toBe('Formula');
    });

    it('should find reference using alias (Parts -> Part fallback)', () => {
        const text = `[Form: Test]
            Parts: MyPart`;
        const offset = text.indexOf('MyPart') + 1;

        const { sourceFile } = createMockSourceFile(text);

        const ref = findReferenceAtOffset(sourceFile, offset, text, mockScopeManager);

        expect(ref).toBeDefined();
        expect(ref?.name).toBe('MyPart');
        expect(ref?.expectedType).toBe('Part'); // Resolved via Alias mapping or Metadata param
    });

    it('should find reference with spaces in the name', () => {
        const text = `[Form: Test]
            Part: My Part Name`;
        // Put the cursor inside "Part"
        const offset = text.indexOf('My Part Name') + 4; // inside "Part"

        const { sourceFile } = createMockSourceFile(text);
        const ref = findReferenceAtOffset(sourceFile, offset, text, mockScopeManager);

        expect(ref).toBeDefined();
        expect(ref?.name).toBe('My Part Name');
        expect(ref?.expectedType).toBe('Part');
    });

    it('early-exits for offsets outside definition range', () => {
        const text = `[Form: Test1]
            Part: P1
        [Form: Test2]
            Part: P2`;
        const { sourceFile } = createMockSourceFile(text);
        
        // Offset inside Test2
        const offset = text.indexOf('P2') + 1;
        
        // We can't directly assert the early exit since it's an internal optimization,
        // but we can ensure it still correctly finds the reference.
        const ref = findReferenceAtOffset(sourceFile, offset, text, mockScopeManager);
        
        expect(ref).toBeDefined();
        expect(ref?.name).toBe('P2');
    });
});
