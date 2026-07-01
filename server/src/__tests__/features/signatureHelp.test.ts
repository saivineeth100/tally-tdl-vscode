import { describe, it, expect } from 'vitest';
import { provideSignatureHelp } from '../../features/signatureHelp';
import { ScopeManager } from '../../semantics/scopeManager';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver';
import { normalizeTypeName } from '../../utils/normalizeUtils';

describe('Signature Help Service', () => {
    function setupMocks() {
                const scopeManager = new ScopeManager();
        
        scopeManager.globalScope.functions.set(normalizeTypeName('StringLength'), {
            name: 'StringLength',
            parameters: [
                { ParameterType: 'StringVal', DataType: 'String' }
            ],
            returnType: 'Number'
        } as any);

        scopeManager.globalScope.functions.set(normalizeTypeName('SubString'), {
            name: 'SubString',
            parameters: [
                { ParameterType: 'StringVal', DataType: 'String' },
                { ParameterType: 'Start', DataType: 'Number' },
                { ParameterType: 'Length', DataType: 'Number' }
            ],
            returnType: 'String'
        } as any);

        scopeManager.globalScope.actions.set(normalizeTypeName('Set'), {
            name: 'Set',
            parameters: [
                { ParameterType: 'VarName', DataType: 'String' },
                { ParameterType: 'Value', DataType: 'Any' }
            ]
        } as any);

        return scopeManager;
    }

    it('provides signature for $$FunctionName:param1 syntax', () => {
        const scopeManager = setupMocks();
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, 'Local: Field: Default: Set as: $$StringLength:');
        const pos = Position.create(0, 48);
        const help = provideSignatureHelp(doc, pos, scopeManager);
        
        expect(help).not.toBeNull();
        expect(help?.signatures.length).toBe(1);
        expect(help?.signatures[0].label).toContain('$$StringLength:StringVal');
        expect(help?.activeParameter).toBe(0);
    });

    it('tracks active parameter based on colon count', () => {
        const scopeManager = setupMocks();
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, 'Local: Field: Default: Set as: $$SubString:"Hello":1:');
        const pos = Position.create(0, 55);
        const help = provideSignatureHelp(doc, pos, scopeManager);
        
        expect(help).not.toBeNull();
        expect(help?.signatures[0].label).toContain('$$SubString:StringVal:Start:Length');
        expect(help?.activeParameter).toBe(2);
    });

    it('returns null when cursor is not inside a function call', () => {
        const scopeManager = setupMocks();
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, 'Local: Field: Default: Set as: "Hello"');
        const pos = Position.create(0, 35);
        const help = provideSignatureHelp(doc, pos, scopeManager);
        
        expect(help).toBeNull();
    });

    it('provides signature for Action statements', () => {
        const scopeManager = setupMocks();
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, 'Set:');
        const pos = Position.create(0, 4);
        const help = provideSignatureHelp(doc, pos, scopeManager);
        
        expect(help).not.toBeNull();
        expect(help?.signatures[0].label).toContain('Action: Set:VarName:Value');
        expect(help?.activeParameter).toBe(0);
    });
});
