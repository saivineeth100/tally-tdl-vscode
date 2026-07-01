import { describe, it, expect } from 'vitest';
import { extractVariables, extractVariableTags, substituteVariables } from '../../utils/templateEngine';

describe('templateEngine', () => {
    describe('extractVariables', () => {
        it('extracts variables enclosed in double curly braces', () => {
            const xml = '<test>{{var1}}</test><other>{{ var2 }}</other>';
            const vars = extractVariables(xml);
            expect(vars).toEqual(['var1', 'var2']);
        });

        it('returns empty array when no variables found', () => {
            const xml = '<test>static value</test>';
            const vars = extractVariables(xml);
            expect(vars).toEqual([]);
        });
    });

    describe('extractVariableTags', () => {
        it('extracts variables and their surrounding tag names', () => {
            const xml = '<COMPANYNAME>{{company}}</COMPANYNAME><DATE>{{date}}</DATE>';
            const tags = extractVariableTags(xml);
            expect(tags).toEqual({
                company: 'COMPANYNAME',
                date: 'DATE'
            });
        });
    });

    describe('substituteVariables', () => {
        it('substitutes variables with provided values and escapes XML', () => {
            const xml = '<test>{{var1}}</test><test2>{{var2}}</test2>';
            const values = new Map<string, string>([
                ['var1', 'value1'],
                ['var2', '<value2>']
            ]);
            const result = substituteVariables(xml, values);
            expect(result).toBe('<test>value1</test><test2>&lt;value2&gt;</test2>');
        });
    });
});
