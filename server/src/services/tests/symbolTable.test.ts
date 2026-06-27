import { describe, it, expect, beforeEach } from 'vitest';
import { SymbolTable, SymbolInfo, SymbolKind } from '../symbolTable';
import { Parser } from '../../parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('SymbolTable', () => {
    let symbolTable: SymbolTable;

    beforeEach(() => {
        symbolTable = new SymbolTable();
    });

    describe('addSymbol', () => {
        it('should add a symbol to the table', () => {
            const symbol: SymbolInfo = {
                name: 'TestReport',
                kind: SymbolKind.Report,
                uri: 'file:///test.tdl',
                start: 0,
                end: 50,
                definitionType: 'Report'
            };

            symbolTable.addSymbol(symbol);
            const result = symbolTable.findSymbol('TestReport', 'file:///test.tdl');

            expect(result).toBeDefined();
            expect(result?.name).toBe('TestReport');
            expect(result?.kind).toBe(SymbolKind.Report);
        });

        it('should handle symbols with same name in different files', () => {
            const symbol1: SymbolInfo = {
                name: 'MyField',
                kind: SymbolKind.Field,
                uri: 'file:///test1.tdl',
                start: 0,
                end: 50,
                definitionType: 'Field'
            };

            const symbol2: SymbolInfo = {
                name: 'MyField',
                kind: SymbolKind.Field,
                uri: 'file:///test2.tdl',
                start: 0,
                end: 50,
                definitionType: 'Field'
            };

            symbolTable.addSymbol(symbol1);
            symbolTable.addSymbol(symbol2);

            const result1 = symbolTable.findSymbol('MyField', 'file:///test1.tdl');
            const result2 = symbolTable.findSymbol('MyField', 'file:///test2.tdl');

            expect(result1?.uri).toBe('file:///test1.tdl');
            expect(result2?.uri).toBe('file:///test2.tdl');
        });
    });

    describe('findSymbol', () => {
        it('should return undefined for non-existent symbol', () => {
            const result = symbolTable.findSymbol('DoesNotExist', 'file:///test.tdl');
            expect(result).toBeUndefined();
        });

        it('should find symbol by name case-insensitively', () => {
            const symbol: SymbolInfo = {
                name: 'TestReport',
                kind: SymbolKind.Report,
                uri: 'file:///test.tdl',
                start: 0,
                end: 50,
                definitionType: 'Report'
            };

            symbolTable.addSymbol(symbol);
            const result = symbolTable.findSymbol('testreport', 'file:///test.tdl');

            expect(result).toBeDefined();
            expect(result?.name).toBe('TestReport');
        });
    });

    describe('getSymbolsInDocument', () => {
        it('should return all symbols in a document', () => {
            const uri = 'file:///test.tdl';
            symbolTable.addSymbol({
                name: 'Report1',
                kind: SymbolKind.Report,
                uri,
                start: 0,
                end: 50,
                definitionType: 'Report'
            });
            symbolTable.addSymbol({
                name: 'Field1',
                kind: SymbolKind.Field,
                uri,
                start: 51,
                end: 100,
                definitionType: 'Field'
            });

            const symbols = symbolTable.getSymbolsInDocument(uri);

            expect(symbols.length).toBe(2);
            expect(symbols.map(s => s.name)).toContain('Report1');
            expect(symbols.map(s => s.name)).toContain('Field1');
        });

        it('should return empty array for document with no symbols', () => {
            const symbols = symbolTable.getSymbolsInDocument('file:///empty.tdl');
            expect(symbols).toEqual([]);
        });
    });

    describe('findSymbolAt', () => {
        it('should find symbol at given position', () => {
            const uri = 'file:///test.tdl';
            symbolTable.addSymbol({
                name: 'MyReport',
                kind: SymbolKind.Report,
                uri,
                start: 10,
                end: 50,
                definitionType: 'Report'
            });

            const result = symbolTable.findSymbolAt(uri, 25);

            expect(result).toBeDefined();
            expect(result?.name).toBe('MyReport');
        });

        it('should return undefined when position is outside all symbols', () => {
            const uri = 'file:///test.tdl';
            symbolTable.addSymbol({
                name: 'MyReport',
                kind: SymbolKind.Report,
                uri,
                start: 10,
                end: 50,
                definitionType: 'Report'
            });

            const result = symbolTable.findSymbolAt(uri, 5);

            expect(result).toBeUndefined();
        });
    });

    describe('clearDocument', () => {
        it('should remove all symbols for a document', () => {
            const uri = 'file:///test.tdl';
            symbolTable.addSymbol({
                name: 'Report1',
                kind: SymbolKind.Report,
                uri,
                start: 0,
                end: 50,
                definitionType: 'Report'
            });

            symbolTable.clearDocument(uri);
            const symbols = symbolTable.getSymbolsInDocument(uri);

            expect(symbols).toEqual([]);
        });

        it('should not affect symbols in other documents', () => {
            const uri1 = 'file:///test1.tdl';
            const uri2 = 'file:///test2.tdl';

            symbolTable.addSymbol({
                name: 'Report1',
                kind: SymbolKind.Report,
                uri: uri1,
                start: 0,
                end: 50,
                definitionType: 'Report'
            });
            symbolTable.addSymbol({
                name: 'Report2',
                kind: SymbolKind.Report,
                uri: uri2,
                start: 0,
                end: 50,
                definitionType: 'Report'
            });

            symbolTable.clearDocument(uri1);

            expect(symbolTable.getSymbolsInDocument(uri1)).toEqual([]);
            expect(symbolTable.getSymbolsInDocument(uri2).length).toBe(1);
        });
    });

    describe('findAllByName', () => {
        it('should find all symbols with same name across documents', () => {
            symbolTable.addSymbol({
                name: 'CommonName',
                kind: SymbolKind.Report,
                uri: 'file:///test1.tdl',
                start: 0,
                end: 50,
                definitionType: 'Report'
            });
            symbolTable.addSymbol({
                name: 'CommonName',
                kind: SymbolKind.Field,
                uri: 'file:///test2.tdl',
                start: 0,
                end: 50,
                definitionType: 'Field'
            });

            const results = symbolTable.findAllByName('CommonName');

            expect(results.length).toBe(2);
        });
    });

    describe('LSP Range Metadata', () => {
        it('should correctly store range, selectionRange, and detail from parsing', () => {
            const content = '[Report: TestReport]\nUse: BaseReport';
            const parser = new Parser(content);
            const sourceFile = parser.parse();
            const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, content);
            
            const def = sourceFile.definitions[0];
            const symbolInfo: SymbolInfo = {
                name: def.name!.text,
                kind: SymbolKind.Report,
                uri: doc.uri,
                start: def.start,
                end: def.end,
                definitionType: def.type!.text,
                isModifier: !!def.modifier,
                range: {
                    start: doc.positionAt(def.start),
                    end: doc.positionAt(def.end)
                },
                selectionRange: {
                    start: doc.positionAt(def.name!.start),
                    end: doc.positionAt(def.name!.end)
                },
                detail: `${def.type!.text}: ${def.name!.text}`
            };
            
            symbolTable.addSymbol(symbolInfo);
            const retrieved = symbolTable.findSymbol('TestReport', doc.uri);
            
            expect(retrieved).toBeDefined();
            expect(retrieved?.range?.start.line).toBe(0);
            expect(retrieved?.range?.start.character).toBe(0);
            expect(retrieved?.range?.end.line).toBe(1);
            expect(retrieved?.range?.end.character).toBe(15); // End of "Use: BaseReport"

            expect(retrieved?.selectionRange?.start.line).toBe(0);
            expect(retrieved?.selectionRange?.start.character).toBe(9); // "[Report: " length is 9
            expect(retrieved?.selectionRange?.end.line).toBe(0);
            expect(retrieved?.selectionRange?.end.character).toBe(19); // "TestReport" length is 10

            expect(retrieved?.detail).toBe('Report: TestReport');
        });
    });
});
