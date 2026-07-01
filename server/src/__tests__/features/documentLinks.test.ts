import { describe, it, expect, vi } from 'vitest';
import { URI } from 'vscode-uri';
import { provideDocumentLinks } from '../../features/documentLinks';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Parser } from '../../core/parser/parser';

describe('Document Links Service', () => {
    it('creates a link for Include/Import definitions', () => {
        const text = '[Include: "common.tdl"]\n[Import: "other.tdl"]';
        const parser = new Parser(text);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///main.tdl', 'tdl', 1, text);
        
        const resolveIncludePath = vi.fn((base, target) => {
            if (target === 'common.tdl') return '/common.tdl';
            if (target === 'other.tdl') return '/other.tdl';
            return null;
        });

        const links = provideDocumentLinks(sourceFile, doc, resolveIncludePath);
        
        expect(links.length).toBe(2);
        expect(links[0].target).toBe(URI.file('/common.tdl').toString());
        expect(links[1].target).toBe(URI.file('/other.tdl').toString());
    });

    it('returns empty array for files with no Include/Import definitions', () => {
        const text = '[Report: TestReport]';
        const parser = new Parser(text);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///main.tdl', 'tdl', 1, text);
        
        const resolveIncludePath = vi.fn();
        const links = provideDocumentLinks(sourceFile, doc, resolveIncludePath);
        
        expect(links.length).toBe(0);
    });

    it('handles unresolvable include paths gracefully', () => {
        const text = '[Include: "missing.tdl"]';
        const parser = new Parser(text);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///main.tdl', 'tdl', 1, text);
        
        const resolveIncludePath = vi.fn(() => null);
        const links = provideDocumentLinks(sourceFile, doc, resolveIncludePath);
        
        if (links.length > 0) {
            expect(links[0].target).toBeUndefined();
        } else {
            expect(links.length).toBe(0);
        }
    });
});
