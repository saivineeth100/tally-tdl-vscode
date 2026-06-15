
import { describe, expect, test } from 'vitest';
import { Parser } from '../../parser';
import { cleanAST } from './utils';

describe('Parser Complex Attributes Tests', () => {
    test('Parse Complex Attributes (Function, var, field)', () => {
        const input = `[Report: complex]
        Set As: $$IsEmpty : #FieldName
        Set By: ##Variable
        Width: 10
        `;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        expect(cleanAST(sourceFile)).toMatchSnapshot();
    });
});
