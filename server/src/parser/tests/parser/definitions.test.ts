
import { describe, expect, test } from 'vitest';
import { Parser } from '../../parser';
import { SyntaxKind } from '../../ast';

describe('Parser Definitions Tests', () => {

    test('Parse Basic Definition', () => {
        const input = `[Report: MyReport]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile).toBeDefined();
        expect(sourceFile.kind).toBe(SyntaxKind.SourceFile);
        expect(sourceFile.definitions.length).toBeGreaterThan(0);

        const def = sourceFile.definitions[0];
        expect(def.kind).toBe(SyntaxKind.Definition);
        expect(def.type.text).toBe('Report');
        expect(def.name?.text).toBe('MyReport');
    });

    test('Parse Definition with Attributes', () => {
        const input = `
[Report: MyReport]
    Title: "My Tally Report"
    Form: MyForm
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile).toBeDefined();
        expect(sourceFile.definitions.length).toBeGreaterThan(0);

        const def = sourceFile.definitions[0];
        expect(def.attributes.length).toBe(2);

        expect(def.attributes[0].name.text).toBe('Title');
        expect(def.attributes[0].value.length).toBe(1);
        expect((def.attributes[0].value[0] as any).value).toBe('My Tally Report');

        expect(def.attributes[1].name.text).toBe('Form');
        expect(def.attributes[1].value.length).toBe(1);
        expect((def.attributes[1].value[0] as any).text).toBe('MyForm');
    });

    test('Parse Definition with Spaces in Name', () => {
        const input = `[Report: My Report Name]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        const def = sourceFile.definitions[0];
        expect(def.name?.text).toBe('My Report Name');
    });

    test('Parse Definition with Symbols in Name (Include)', () => {
        const input = `[Include: file.txt]`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        expect(sourceFile.definitions.length).toBeGreaterThan(0);
        const def = sourceFile.definitions[0];
        expect(def.type.text).toBe('Include');
        expect(def.name?.text).toBe('file.txt');
    });
});
