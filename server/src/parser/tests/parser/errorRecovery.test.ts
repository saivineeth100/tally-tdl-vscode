import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { TokenKind } from '../../tokenKind';

describe('Parser Error Recovery', () => {
    describe('Incomplete Definition Parsing', () => {
        it('should create DefinitionNode for incomplete input [Report:', () => {
            const tdl = '[Report:';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Should create a definition even though it's incomplete
            expect(sourceFile.definitions.length).toBe(1);
            const def = sourceFile.definitions[0];
            expect(def.type.text).toBe('Report');
            expect(def.isIncomplete).toBe(true);
        });

        it('should create DefinitionNode for incomplete input [Field: Name', () => {
            const tdl = '[Field: Name';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            expect(sourceFile.definitions.length).toBe(1);
            const def = sourceFile.definitions[0];
            expect(def.type.text).toBe('Field');
            expect(def.name?.text).toBe('Name');
            expect(def.isIncomplete).toBe(true);
        });

        it('should parse modifier in incomplete definition [#Report:', () => {
            const tdl = '[#Report:';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            expect(sourceFile.definitions.length).toBe(1);
            const def = sourceFile.definitions[0];
            expect(def.modifier?.Kind).toBe(TokenKind.HashToken);
            expect(def.type.text).toBe('Report');
            expect(def.isIncomplete).toBe(true);
        });

        it('should handle empty brackets []', () => {
            const tdl = '[]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Should still parse, may create incomplete definition
            expect(sourceFile.definitions.length).toBeGreaterThanOrEqual(0);
        });

        it('should parse complete definition normally', () => {
            const tdl = '[Report: MyReport]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            expect(sourceFile.definitions.length).toBe(1);
            const def = sourceFile.definitions[0];
            expect(def.type.text).toBe('Report');
            expect(def.name?.text).toBe('MyReport');
            expect(def.isIncomplete).toBe(false);
        });

        it('should continue parsing after incomplete definition', () => {
            const tdl = `[Report: First
[Field: ValidField]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Should parse both definitions
            expect(sourceFile.definitions.length).toBe(2);

            const def1 = sourceFile.definitions[0];
            expect(def1.type.text).toBe('Report');
            expect(def1.isIncomplete).toBe(true);

            const def2 = sourceFile.definitions[1];
            expect(def2.type.text).toBe('Field');
            expect(def2.name?.text).toBe('ValidField');
            expect(def2.isIncomplete).toBe(false);
        });
    });

    describe('Modifier Parsing', () => {
        it('should parse # modifier', () => {
            const tdl = '[#Report: Existing]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            expect(def.modifier?.Text).toBe('#');
        });

        it('should parse ! modifier', () => {
            const tdl = '[!Report: ToDelete]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            expect(def.modifier?.Text).toBe('!');
        });

        it('should parse * modifier', () => {
            const tdl = '[*Report: Optional]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            expect(def.modifier?.Text).toBe('*');
        });
    });

    describe('Procedural Block Errors', () => {
        it('should detect unclosed blocks', () => {
            const tdl = `[Function: UnclosedTest]
            01 : IF : True
            02 :   LOG : "Hello"`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const error = sourceFile.errors.find(e => e.message.includes('Unclosed block: Missing END IF'));
            expect(error).toBeDefined();
        });

        it('should detect mismatched terminators', () => {
            const tdl = `[Function: MismatchTest]
            01 : IF : True
            02 :   LOG : "Hello"
            03 : END WHILE`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const error = sourceFile.errors.find(e => e.message.includes('Mismatched block terminator: Expected END IF, found END WHILE'));
            expect(error).toBeDefined();
        });
    });
});
