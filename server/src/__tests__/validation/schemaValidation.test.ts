import { describe, it, expect, beforeEach } from 'vitest';
import { validateSourceFile } from '../../validation';
import { SourceFile, DefinitionNode, AttributeNode, IdentifierNode, ComplexObjectNode } from '../../core/ast/ast';
import { Token } from '../../core/lexer/token';
import { TokenKind } from '../../core/lexer/tokenKind';
import { DiagnosticRules } from '../../diagnostics';
import { ScopeManager } from '../../semantics/scopeManager';
import { SchemaSymbol, SymbolKind } from 'tally-tdl-shared';

describe('XML Schema Validation', () => {
    let mockScopeManager: ScopeManager;

    beforeEach(() => {
                mockScopeManager = new ScopeManager();
        mockScopeManager.primarySchemaNames = ['VOUCHER'];
        
        const voucherSchema: SchemaSymbol = {
            name: 'Voucher',
            kind: SymbolKind.Object,
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['Party Ledger Name', { Name: 'Party Ledger Name', DataType: 'String', IsComplex: false, IsRepeated: false }],
                ['Is Optional', { Name: 'Is Optional', DataType: 'Logical', IsComplex: false, IsRepeated: false }]
            ]),
            complexProperties: new Map([
                ['All Ledger Entries', 'Ledger Entry']
            ]),
            isPrimary: true
        };
        
        mockScopeManager.globalScope.schemas.set('voucher', voucherSchema);
        
        const ledgerSchema: SchemaSymbol = {
            name: 'Ledger Entry',
            kind: SymbolKind.Object,
            uri: 'global:metadata',
            start: 0,
            end: 0,
            definitionType: 'Schema',
            properties: new Map([
                ['Ledger Name', { Name: 'Ledger Name', DataType: 'String', IsComplex: false, IsRepeated: false }]
            ]),
            complexProperties: new Map(),
            isPrimary: false
        };
        
        mockScopeManager.globalScope.schemas.set('ledgerentry', ledgerSchema);
    });

    const createDummyDoc = () => ({
        getText: () => '',
        positionAt: (pos: number) => ({ line: 0, character: pos }),
        uri: 'file:///test.xml',
        languageId: 'xml',
        version: 1,
        lineCount: 1
    } as any);

    it('reports no errors for valid properties and nested objects', async () => {
        const sourceFile = new SourceFile(0, 100);
        
        const def = new DefinitionNode(0, 50, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 1), new IdentifierNode([], 'VOUCHER'), new Token(TokenKind.CloseSquareBracketToken, 10, 10, 1));
        
        const attr1 = new AttributeNode(10, 20, new IdentifierNode([], 'PARTYLEDGERNAME'), new Token(TokenKind.ColonToken, 0, 0, 1), []);
        
        const attr2 = new AttributeNode(20, 30, new IdentifierNode([], 'ISOPTIONAL'), new Token(TokenKind.ColonToken, 0, 0, 1), [new IdentifierNode([], 'Yes')]);
        
        def.attributes.push(attr1, attr2);
        
        const complexObj = new ComplexObjectNode(30, 50, new IdentifierNode([], 'ALLLEDGERENTRIES.LIST'));
        
        const innerAttr = new AttributeNode(35, 45, new IdentifierNode([], 'LEDGERNAME'), new Token(TokenKind.ColonToken, 0, 0, 1), []);
        complexObj.attributes.push(innerAttr);
        
        def.complexObjects = [complexObj];
        sourceFile.definitions.push(def);

        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), undefined, mockScopeManager);
        expect(diagnostics.length).toBe(0);
    });

    it('reports errors for unknown properties', async () => {
        const sourceFile = new SourceFile(0, 100);
        
        const def = new DefinitionNode(0, 50, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 1), new IdentifierNode([], 'VOUCHER'), new Token(TokenKind.CloseSquareBracketToken, 10, 10, 1));
        
        const attr1 = new AttributeNode(10, 20, new IdentifierNode([], 'UNKNOWNPROP'), new Token(TokenKind.ColonToken, 0, 0, 1), []);
        def.attributes.push(attr1);
        
        sourceFile.definitions.push(def);

        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), undefined, mockScopeManager);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe(DiagnosticRules.UnknownSchemaProperty.code);
    });

    it('reports errors for invalid logical values', async () => {
        const sourceFile = new SourceFile(0, 100);
        
        const def = new DefinitionNode(0, 50, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 1), new IdentifierNode([], 'VOUCHER'), new Token(TokenKind.CloseSquareBracketToken, 10, 10, 1));
        
        const attr1 = new AttributeNode(10, 20, new IdentifierNode([], 'ISOPTIONAL'), new Token(TokenKind.ColonToken, 0, 0, 1), [new IdentifierNode([], 'Maybe')]);
        def.attributes.push(attr1);
        
        sourceFile.definitions.push(def);

        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), undefined, mockScopeManager);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].code).toBe(DiagnosticRules.InvalidLogicalValue.code);
    });

    it('should validate schema with mixed-case name: vOuChEr', async () => {
        const sourceFile = new SourceFile(0, 100);
        const def = new DefinitionNode(0, 50, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 1), new IdentifierNode([], 'vOuChEr'), new Token(TokenKind.CloseSquareBracketToken, 10, 10, 1));
        sourceFile.definitions.push(def);
        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), undefined, mockScopeManager);
        expect(diagnostics.length).toBe(0);
    });

    it('should validate schema with original case: Voucher', async () => {
        const sourceFile = new SourceFile(0, 100);
        const def = new DefinitionNode(0, 50, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 1), new IdentifierNode([], 'Voucher'), new Token(TokenKind.CloseSquareBracketToken, 10, 10, 1));
        sourceFile.definitions.push(def);
        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), undefined, mockScopeManager);
        expect(diagnostics.length).toBe(0);
    });

    it('should resolve schema properties with .LIST suffix normalization', async () => {
        const sourceFile = new SourceFile(0, 100);
        const def = new DefinitionNode(0, 50, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 1), new IdentifierNode([], 'VOUCHER'), new Token(TokenKind.CloseSquareBracketToken, 10, 10, 1));
        const attr = new AttributeNode(10, 20, new IdentifierNode([], 'PARTY LEDGER NAME.LIST'), new Token(TokenKind.ColonToken, 0, 0, 1), []);
        def.attributes.push(attr);
        sourceFile.definitions.push(def);
        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), undefined, mockScopeManager);
        expect(diagnostics.length).toBe(0);
    });
});
