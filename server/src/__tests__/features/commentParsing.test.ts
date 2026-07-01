import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { SyntaxKind } from '../../core/ast/ast';

describe('Comment Parsing', () => {
    it('should parse single line coments', () => {
        const tdl = `
        ;; This is a comment
        [Report: Test]
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        expect(sourceFile.comments.length).toBeGreaterThan(0);
        expect(sourceFile.comments[0].kind).toBe(SyntaxKind.Comment);
        // Trim to check text content
        expect(sourceFile.comments[0].text.trim()).toBe(';; This is a comment');
        expect(sourceFile.comments[0].isMultiLine).toBe(false);
    });

    it('should parse multi line comments', () => {
        const tdl = `
        /* 
           This is a 
           Multi line comment 
        */
        [Report: Test]
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        expect(sourceFile.comments.length).toBeGreaterThan(0);
        expect(sourceFile.comments[0].isMultiLine).toBe(true);
        expect(sourceFile.comments[0].text).toContain('Multi line comment');
    });
});
