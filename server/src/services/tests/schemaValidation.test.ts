import { describe, it, expect, beforeEach } from 'vitest';
import { validateSourceFile } from '../validation';
import { TdlMetadata, TDLSchema, TDLSchemaProperty } from '../../tdlMetaData';
import { SourceFile, DefinitionNode, AttributeNode, IdentifierNode, ComplexObjectNode } from '../../parser/ast';
import { Token } from '../../parser/token';
import { TokenKind } from '../../parser/tokenKind';

describe('XML Schema Validation', () => {
    let mockMetadata: TdlMetadata;

    beforeEach(() => {
        mockMetadata = new TdlMetadata('');
        mockMetadata.primarySchemaNames = ['VOUCHER'];
        
        const voucherSchema = new TDLSchema();
        voucherSchema.Name = 'Voucher';
        
        const prop1 = new TDLSchemaProperty();
        prop1.Name = 'Party Ledger Name';
        prop1.DataType = 'String';
        
        const prop2 = new TDLSchemaProperty();
        prop2.Name = 'Is Optional';
        prop2.DataType = 'Logical';
        
        voucherSchema.Properties.set('Party Ledger Name', prop1);
        voucherSchema.Properties.set('Is Optional', prop2);
        
        voucherSchema.ComplexProperties.set('All Ledger Entries', 'Ledger Entry');
        mockMetadata.schemas.set('Voucher', voucherSchema);
        
        const ledgerSchema = new TDLSchema();
        ledgerSchema.Name = 'Ledger Entry';
        
        const lprop = new TDLSchemaProperty();
        lprop.Name = 'Ledger Name';
        lprop.DataType = 'String';
        
        ledgerSchema.Properties.set('Ledger Name', lprop);
        mockMetadata.schemas.set('Ledger Entry', ledgerSchema);
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

        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), mockMetadata);
        expect(diagnostics.length).toBe(0);
    });

    it('reports errors for unknown properties', async () => {
        const sourceFile = new SourceFile(0, 100);
        
        const def = new DefinitionNode(0, 50, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 1), new IdentifierNode([], 'VOUCHER'), new Token(TokenKind.CloseSquareBracketToken, 10, 10, 1));
        
        const attr1 = new AttributeNode(10, 20, new IdentifierNode([], 'UNKNOWNPROP'), new Token(TokenKind.ColonToken, 0, 0, 1), []);
        def.attributes.push(attr1);
        
        sourceFile.definitions.push(def);

        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), mockMetadata);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].message).toContain("Unknown property 'UNKNOWNPROP'");
    });

    it('reports errors for invalid logical values', async () => {
        const sourceFile = new SourceFile(0, 100);
        
        const def = new DefinitionNode(0, 50, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 1), new IdentifierNode([], 'VOUCHER'), new Token(TokenKind.CloseSquareBracketToken, 10, 10, 1));
        
        const attr1 = new AttributeNode(10, 20, new IdentifierNode([], 'ISOPTIONAL'), new Token(TokenKind.ColonToken, 0, 0, 1), [new IdentifierNode([], 'Maybe')]);
        def.attributes.push(attr1);
        
        sourceFile.definitions.push(def);

        const diagnostics = await validateSourceFile(sourceFile, createDummyDoc(), mockMetadata);
        expect(diagnostics.length).toBe(1);
        expect(diagnostics[0].message).toContain("Invalid logical value");
    });
});
