import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { findReferenceAtOffset } from '../../features/definition';
import { SyntaxKind } from '../../core/ast/ast';
import { ScopeManager } from '../../semantics/scopeManager';

describe('Parser - List Values', () => {
    it('should parse comma-separated values as separate parameters', () => {
        const text = `[Form: Test]
        Parts: P1, P2`;
        const parser = new Parser(text);
        const sourceFile = parser.parse();

        const formDef = sourceFile.definitions[0];
        const partsAttr = formDef.attributes[0];

        expect(partsAttr.name.text).toBe('Parts');
        expect(partsAttr.value.length).toBe(2);

        expect(partsAttr.value[0].kind).toBe(SyntaxKind.Identifier);
        expect((partsAttr.value[0] as any).text).toBe('P1');
        
        expect(partsAttr.value[1].kind).toBe(SyntaxKind.Identifier);
        expect((partsAttr.value[1] as any).text).toBe('P2');
    });

    it('should parse colon-separated values as separate parameters', () => {
        const text = `[Form: Test]
        Parts: P1 : P2`;
        const parser = new Parser(text);
        const sourceFile = parser.parse();

        const partsAttr = sourceFile.definitions[0].attributes[0];
        expect(partsAttr.value.length).toBe(2); // Two parameters
        expect(partsAttr.value[0].kind).not.toBe(SyntaxKind.List);
        expect(partsAttr.value[1].kind).not.toBe(SyntaxKind.List);
    });

    it('should find reference inside ListNode', () => {
        const text = `[Form: Test]
        Parts: P1, P2`;
        const parser = new Parser(text);
        const sourceFile = parser.parse();

                const mockScopeManager = new ScopeManager();
        const formAttrs = new Map<string, any>();
        formAttrs.set('parts', {
            name: 'Parts',
            parameters: [
                { IsList: true, RefersTo: 'Part' }
            ]
        });
        mockScopeManager.globalScope.attributes.set('FORM', formAttrs);

        const offset = text.indexOf('P2') + 1;
        const ref = findReferenceAtOffset(sourceFile, offset, text, mockScopeManager);

        expect(ref).toBeDefined();
        expect(ref?.name).toBe('P2');
        expect(ref?.expectedType).toBe('Part');
    });
});
