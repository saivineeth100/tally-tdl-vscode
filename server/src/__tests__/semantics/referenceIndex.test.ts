import { describe, it, expect, beforeEach } from 'vitest';
import { ReferenceIndex } from '../../semantics/symbols/referenceIndex';
import { Parser } from '../../core/parser/parser';
import { URI } from 'vscode-uri';

describe('ReferenceIndex', () => {
    let index: ReferenceIndex;

    beforeEach(() => {
        index = new ReferenceIndex();
    });

    it('should index identifiers and resolve candidate URIs', () => {
        const tdl = `
            [Report: MyReport]
                Form: MyForm
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const uri = URI.file('/test/file.tdl').toString();

        index.indexFile(uri, sourceFile);

        const candidates = index.getCandidateUris('MyForm');
        expect(candidates).toBeDefined();
        expect(candidates?.has(uri)).toBe(true);
    });

    it('should be case-insensitive for identifiers', () => {
        const tdl = `
            [Report: MyReport]
                Form: MyForm
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const uri = URI.file('/test/file.tdl').toString();

        index.indexFile(uri, sourceFile);

        const candidates = index.getCandidateUris('myform');
        expect(candidates).toBeDefined();
        expect(candidates?.has(uri)).toBe(true);
    });

    it('should ignore string literals and comments', () => {
        const tdl = `
            ; This is a comment about MyForm
            [Report: MyReport]
                Title: "MyForm Title"
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const uri = URI.file('/test/file.tdl').toString();

        index.indexFile(uri, sourceFile);

        const candidates = index.getCandidateUris('MyForm');
        expect(candidates).toBeUndefined(); // Should not find MyForm inside string or comment
    });

    it('should handle spaced identifiers', () => {
        const tdl = `
            [Report: My Report]
                Form: My Form
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const uri = URI.file('/test/file.tdl').toString();

        index.indexFile(uri, sourceFile);

        // We index using normalizeTypeName which removes spaces
        const candidates = index.getCandidateUris('MyForm');
        expect(candidates).toBeDefined();
        expect(candidates?.has(uri)).toBe(true);

        const candidates2 = index.getCandidateUris('My Form');
        expect(candidates2).toBeDefined();
        expect(candidates2?.has(uri)).toBe(true);
    });

    it('should correctly clear a file from the index', () => {
        const tdl = `
            [Report: MyReport]
                Form: MyForm
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const uri = URI.file('/test/file.tdl').toString();

        index.indexFile(uri, sourceFile);
        expect(index.getCandidateUris('MyForm')?.has(uri)).toBe(true);

        index.clearFile(uri);
        expect(index.getCandidateUris('MyForm')).toBeUndefined();
    });

    it('should serialize and deserialize correctly via v8 while retaining class methods', () => {
        const v8 = require('v8');
        const tdl = `
            [Report: BaseReport]
                Form: BaseForm
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const uri = URI.file('/basetdl/test.tdl').toString();

        index.indexFile(uri, sourceFile);
        
        // Simulate writing to basetdl.bin
        const buffer = v8.serialize(index);

        // Simulate loading basetdl.bin
        const deserializedGeneric = v8.deserialize(buffer);
        
        // Simulate metadataLoader.ts instantiation
        const rehydratedIndex = new ReferenceIndex();
        rehydratedIndex.identifierToUris = deserializedGeneric.identifierToUris;

        // Verify class methods work
        const candidates = rehydratedIndex.getCandidateUris('BaseForm');
        expect(candidates).toBeDefined();
        expect(candidates?.has(uri)).toBe(true);
    });
});
