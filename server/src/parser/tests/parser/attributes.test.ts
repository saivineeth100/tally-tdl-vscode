
import { describe, expect, test } from 'vitest';
import { Parser } from '../../parser';
import { SyntaxKind } from '../../ast';

describe('Parser Complex Attributes Tests', () => {
    test('Parse Complex Attributes (Function, var, field)', () => {
        const input = `[Report: complex]
        Set As: $$IsEmpty : #FieldName
        Set By: ##Variable
        Width: 10
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const def = sourceFile.definitions[0];

        // Set As: $$IsEmpty : #FieldName
        const attr1 = def.attributes[0];
        expect(attr1.name.text).toBe('Set As');

        expect(attr1.value.length).toBe(1);

        const val0 = attr1.value[0] as any;
        expect(val0.kind).toBe(SyntaxKind.FunctionCall);
        expect(val0.functionName.text).toBe('IsEmpty');

        // Verify #FieldName is parsed as an ARGUMENT to $$IsEmpty
        expect(val0.arguments.length).toBeGreaterThan(0);
        const arg0 = val0.arguments[0] as any;
        expect(arg0.kind).toBe(SyntaxKind.FieldReference);
        expect(arg0.fieldName.text).toBe('FieldName');

        // Set By: ##Variable
        const attr2 = def.attributes[1];
        const valVar = attr2.value[0] as any;
        expect(valVar.kind).toBe(SyntaxKind.VariableReference);
        expect(valVar.variableName.text).toBe('Variable');
    });
});
