import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { createDocumentSymbols, definitionToDocumentSymbol } from '../../features/documentSymbol';
import { SymbolKind as LSPSymbolKind } from 'vscode-languageserver';

describe('Document Symbols', () => {
    describe('definitionToDocumentSymbol', () => {
        it('should convert a Report definition to DocumentSymbol', () => {
            const tdl = `[Report: My Report]
                Title: Test Report
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            expect(sourceFile.definitions.length).toBe(1);
            const def = sourceFile.definitions[0];
            const docSymbol = definitionToDocumentSymbol(def, tdl);

            expect(docSymbol.name).toBe('My Report');
            expect(docSymbol.kind).toBe(LSPSymbolKind.Class);
        });

        it('should convert a Field definition to DocumentSymbol', () => {
            const tdl = `[Field: MyField]
                Set As: $Name
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            const docSymbol = definitionToDocumentSymbol(def, tdl);

            expect(docSymbol.name).toBe('MyField');
            expect(docSymbol.kind).toBe(LSPSymbolKind.Field);
        });

        it('should convert a Function definition to DocumentSymbol', () => {
            const tdl = `[Function: MyFunction]
                Returns: String
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            const docSymbol = definitionToDocumentSymbol(def, tdl);

            expect(docSymbol.name).toBe('MyFunction');
            expect(docSymbol.kind).toBe(LSPSymbolKind.Function);
        });

        it('should include attributes as children', () => {
            const tdl = `[Field: TestField]
                Set As: $Amount
                Width: 20
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            const docSymbol = definitionToDocumentSymbol(def, tdl);

            expect(docSymbol.children).toBeDefined();
            expect(docSymbol.children!.length).toBeGreaterThanOrEqual(2);

            const setAsChild = docSymbol.children!.find(c => c.name.startsWith('Set As'));
            expect(setAsChild).toBeDefined();
        });
    });

    describe('createDocumentSymbols', () => {
        it('should create symbols for all definitions in source file', () => {
            const tdl = `[Report: Report1]
                Title: First Report
            
            [Field: Field1]
                Set As: Hello
            
            [Menu: MyMenu]
                Item: Test Item
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const symbols = createDocumentSymbols(sourceFile, tdl);

            expect(symbols.length).toBe(3);
            expect(symbols.map(s => s.name)).toContain('Report1');
            expect(symbols.map(s => s.name)).toContain('Field1');
            expect(symbols.map(s => s.name)).toContain('MyMenu');
        });

        it('should handle empty source file', () => {
            const tdl = `;; Just a comment`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const symbols = createDocumentSymbols(sourceFile, tdl);

            expect(symbols.length).toBe(0);
        });

        it('should handle modifier definitions', () => {
            const tdl = `[#Menu: Test]
                Add: Item: New Option
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const symbols = createDocumentSymbols(sourceFile, tdl);

            expect(symbols.length).toBe(1);
            // Modified definition should show with modifier
            expect(symbols[0].detail).toContain('#');
        });
    });
});
