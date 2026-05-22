import { describe, it, expect } from 'vitest';
import { detectXmlCompletionContext } from '../../../features/completion';
import { DefinitionNode } from '../../../parser/ast';

describe('XML Completion Tests', () => {
    it('Detects definition type context', () => {
        const xmlContent = '<TDL><TDLMESSAGE><R';
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length);
        expect(ctx.type).toBe('definition_type');
        expect(ctx.partial).toBe('R');
    });

    it('Detects attribute context inside a definition', () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport"><U';
        const mockDef = { type: { text: 'REPORT' } } as unknown as DefinitionNode;
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length, mockDef);
        expect(ctx.type).toBe('attribute');
        expect(ctx.partial).toBe('U');
    });

    it('Detects attribute value context', () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport"><USE>My';
        const mockDef = { type: { text: 'REPORT' } } as unknown as DefinitionNode;
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length, mockDef);
        expect(ctx.type).toBe('attribute_value');
        expect(ctx.partial).toBe('My');
        if (ctx.type === 'attribute_value') {
            expect(ctx.attributeName).toBe('USE');
            expect(ctx.paramIndex).toBe(0);
        }
    });

    it('Detects function context inside attribute value', () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport"><USE>My, $$Str';
        const mockDef = { type: { text: 'REPORT' } } as unknown as DefinitionNode;
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length, mockDef);
        expect(ctx.type).toBe('function');
        expect(ctx.partial).toBe('Str');
    });

    it('Ignores spaces and handles empty tags correctly for completions', () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport"><USE> ';
        const mockDef = { type: { text: 'REPORT' } } as unknown as DefinitionNode;
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length, mockDef);
        expect(ctx.type).toBe('attribute_value');
        expect(ctx.partial).toBe('');
        
        if (ctx.type === 'attribute_value') {
            expect(ctx.attributeName).toBe('USE');
            expect(ctx.paramIndex).toBe(0);
        }
    });

    it('Detects unknown context if writing random text between tags', () => {
        const xmlContent = '<TDL><TDLMESSAGE> random text';
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length);
        expect(ctx.type).toBe('unknown');
    });

    it('Detects multiple parameter context correctly via commas', () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport"><USE>MyReport, MyOtherRep';
        const mockDef = { type: { text: 'REPORT' } } as unknown as DefinitionNode;
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length, mockDef);
        expect(ctx.type).toBe('attribute_value');
        expect(ctx.partial).toBe('MyOtherRep');
        if (ctx.type === 'attribute_value') {
            expect(ctx.attributeName).toBe('USE');
            expect(ctx.paramIndex).toBe(1);
        }
    });

    it('Detects attribute context correctly when typing an incomplete tag', () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport">\n<U';
        const mockDef = { type: { text: 'REPORT' } } as unknown as DefinitionNode;
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length, mockDef);
        expect(ctx.type).toBe('attribute');
        expect(ctx.partial).toBe('U');
    });

    it('Detects attribute value context correctly when typing an unclosed tag', () => {
        const xmlContent = '<TDL><TDLMESSAGE><REPORT NAME="MyReport">\n<USE>M';
        const mockDef = { type: { text: 'REPORT' } } as unknown as DefinitionNode;
        const ctx = detectXmlCompletionContext(xmlContent, xmlContent.length, mockDef);
        expect(ctx.type).toBe('attribute_value');
        expect(ctx.partial).toBe('M');
    });
});
