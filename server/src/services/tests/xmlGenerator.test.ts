import { describe, it, expect, vi } from 'vitest';
import { Parser } from '../../parser/parser';
import { generateXml } from '../xmlGenerator';
import { parseXmlToAst } from '../../parser/xmlAdapter';

describe('XML Generator', () => {
    it('should generate XML for a standard definition with attributes', async () => {
        const input = `
[Report: TSPL Smp CollSrcObj]
    Use : TSPL Smp ReWalkReCompute
    Title : "Function CollSrcObj"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const xml = await generateXml(sourceFile, input);
        
        expect(xml).toContain('<REPORT NAME="TSPL Smp CollSrcObj" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">');
        expect(xml).toContain('<USE>TSPL Smp ReWalkReCompute</USE>');
        expect(xml).toContain('<TITLE>&quot;Function CollSrcObj&quot;</TITLE>');
    });

    it('should handle modifiers correctly', async () => {
        const input = `
[#Report: ModifyReport]
[!Form: OptionForm]
[*Part: InitializePart]
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const xml = await generateXml(sourceFile, input);
        
        expect(xml).toContain('<REPORT NAME="ModifyReport" ISMODIFY="Yes" ISFIXED="No" ISINITIALIZE="No" ISOPTION="No" ISINTERNAL="No">');
        expect(xml).toContain('<FORM NAME="OptionForm" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="No" ISOPTION="Yes" ISINTERNAL="No">');
        expect(xml).toContain('<PART NAME="InitializePart" ISMODIFY="No" ISFIXED="No" ISINITIALIZE="Yes" ISOPTION="No" ISINTERNAL="No">');
    });

    it('should handle procedural statements and if/else blocks', async () => {
        const input = `
[Function: TSPLSmpIncr]
    10 : Set : vNumVar1 : #TSPLSmpIncrDecrValueA
    20 : If  : $$IsSysName:MyName
    30 :    Set : vNumVar2 : "Hello"
    40 : Else
    50 :    Set : vNumVar2 : "World"
    60 : EndIf
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const xml = await generateXml(sourceFile, input);
        
        expect(xml).toContain('<ACTION>10 : Set : vNumVar1 : #TSPLSmpIncrDecrValueA</ACTION>');
        expect(xml).toContain('<ACTION>20 : If  : $$IsSysName:MyName</ACTION>');
        expect(xml).toContain('<ACTION>30 :    Set : vNumVar2 : &quot;Hello&quot;</ACTION>');
        expect(xml).toContain('<ACTION>40 : Else</ACTION>');
        expect(xml).toContain('<ACTION>50 :    Set : vNumVar2 : &quot;World&quot;</ACTION>');
        expect(xml).toContain('<ACTION>60 : EndIf</ACTION>');
    });

    it('should escape XML special characters in attributes', async () => {
        const input = `
[Field: Test]
    Set as : "A < B & C > D ' E"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const xml = await generateXml(sourceFile, input);

        expect(xml).toContain('<SETAS>&quot;A &lt; B &amp; C &gt; D &apos; E&quot;</SETAS>');
    });

    it('should round-trip TDL -> XML -> parse XML -> compare definitions', async () => {
        const input = `
[Report: TSPL Smp CollSrcObj]
    Use : TSPL Smp ReWalkReCompute
    Title : "Function CollSrcObj"
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const xml = await generateXml(sourceFile, input);
        
        const parsedAst = parseXmlToAst(xml);
        
        expect(parsedAst.definitions.length).toBe(sourceFile.definitions.length);
        expect(parsedAst.definitions[0].name?.text).toBe(sourceFile.definitions[0].name?.text);
        expect(parsedAst.definitions[0].type?.text.toUpperCase()).toBe(sourceFile.definitions[0].type?.text.toUpperCase());
        expect(parsedAst.definitions[0].attributes.length).toBe(sourceFile.definitions[0].attributes.length);
        expect(parsedAst.definitions[0].attributes[0].name?.text.toUpperCase()).toBe(sourceFile.definitions[0].attributes[0].name?.text.toUpperCase());
        expect(parsedAst.definitions[0].attributes[1].name?.text.toUpperCase()).toBe(sourceFile.definitions[0].attributes[1].name?.text.toUpperCase());
    });

    it('should skip INCLUDE and IMPORT statements when not resolved', async () => {
        const input = `
[Include: SomeFile.tdl]
[Import: AnotherFile.tdl]
[Report: ValidReport]
`;
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const xml = await generateXml(sourceFile, input);

        expect(xml).not.toContain('<INCLUDE');
        expect(xml).not.toContain('<IMPORT');
        expect(xml).toContain('<REPORT NAME="ValidReport"');
    });

    it('should recursively append included files and prevent infinite loops', async () => {
        const input1 = `
[Include: file2.tdl]
[Report: MainReport]
`;
        const input2 = `
[Include: file1.tdl]
[Form: SubForm]
`;
        const parser = new Parser(input1);
        const sourceFile = parser.parse();

        const mockResolveIncludePath = (currentPath: string, name: string) => {
            if (name === 'file1.tdl') return '/mock/file1.tdl';
            if (name === 'file2.tdl') return '/mock/file2.tdl';
            return null;
        };

        // We mock fs.promises.readFile using vitest spy/mock later if needed, 
        // but since generateXmlInner uses fs.promises.readFile, we need to mock fs
        const fs = await import('fs');
        const readFileSpy = vi.spyOn(fs.promises, 'readFile').mockImplementation(async (path: any) => {
            if (path === '/mock/file1.tdl') return input1;
            if (path === '/mock/file2.tdl') return input2;
            return '';
        });

        const xml = await generateXml(sourceFile, input1, '/mock/file1.tdl', mockResolveIncludePath);

        expect(xml).toContain('<REPORT NAME="MainReport"');
        expect(xml).toContain('<FORM NAME="SubForm"');

        readFileSpy.mockRestore();
    });
});
