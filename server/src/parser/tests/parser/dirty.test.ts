import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { cleanAST } from './utils';

describe('Dirty Syntax Recovery', () => {
    it('should recover from a missing colon in attributes', () => {
        const tdl = `
[Report: MyReport]
    Set As   
    Form: MyForm
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        // Ensure errors are reported
        expect(sourceFile.errors.length).toBeGreaterThan(0);
        expect(sourceFile.errors[0].message).toContain('Expected : after Attribute Name');
        
        // Ensure that Form: MyForm was still parsed
        expect(sourceFile.definitions.length).toBe(1);
        const report = sourceFile.definitions[0];
        expect(report.attributes.length).toBe(1); // Set As is invalid and skipped, Form is parsed
        expect(report.attributes[0].name.text).toBe('Form');
    });

    it('should recover from an incomplete definition header', () => {
        const tdl = `
[Report: MyRepo
    Form: MyForm
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        expect(sourceFile.errors.length).toBeGreaterThan(0);
        expect(sourceFile.errors[0].message).toContain('Expected ]');
        
        expect(sourceFile.definitions.length).toBe(1);
        const report = sourceFile.definitions[0];
        expect(report.isIncomplete).toBe(true);
        expect(report.attributes.length).toBe(1);
        expect(report.attributes[0].name.text).toBe('Form');
    });

    it('should parse subsequent definitions after a broken one', () => {
        const tdl = `
[Report: BrokenReport]
    Set As   

[Form: ValidForm]
    Part: MyPart
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        expect(sourceFile.definitions.length).toBe(2);
        expect(sourceFile.definitions[1].type.text).toBe('Form');
        expect(sourceFile.definitions[1].name?.text).toBe('ValidForm');
        expect(sourceFile.definitions[1].attributes.length).toBe(1);
    });
    
    it('should recover from a missing statement label', () => {
        const tdl = `
[Function: BrokenFunc]
    : SET : Target : "Value"
    02: RETURN : True
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        
        expect(sourceFile.errors.length).toBeGreaterThan(0);
        
        expect(sourceFile.definitions.length).toBe(1);
        const func = sourceFile.definitions[0];
        // Statement 02 should be parsed successfully
        expect(func.statements.length).toBe(1);
        expect((func.statements[0].label as any)?.text).toBe('02');
    });
});
