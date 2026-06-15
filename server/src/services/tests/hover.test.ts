import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { createHoverContent, getHoverInfo } from '../hover';
import { getDefinitionAtOffset } from '../definition';
import { testMetadata } from '../../test-setup';
import { TDLFunction } from '../../models/tdlFunction';

describe('Hover Feature', () => {

    describe('getDefinitionAtOffset', () => {
        it('should find definition when cursor is on definition header', () => {
            const tdl = `[Report: MyReport]
                Title: Test
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Position cursor on "MyReport"
            const offset = tdl.indexOf('MyReport');
            const def = getDefinitionAtOffset(sourceFile, offset);

            expect(def).toBeDefined();
            expect(def?.name?.text).toBe('MyReport');
        });

        it('should find definition when cursor is on attribute', () => {
            const tdl = `[Field: TestField]
                Set As: $Name
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Position cursor on "Set As"
            const offset = tdl.indexOf('Set As');
            const def = getDefinitionAtOffset(sourceFile, offset);

            expect(def).toBeDefined();
            expect(def?.name?.text).toBe('TestField');
        });

        it('should return undefined when cursor is outside definitions', () => {
            const tdl = `;; Comment at start
            [Report: MyReport]
                Title: Test
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Position cursor on the comment
            const def = getDefinitionAtOffset(sourceFile, 5);

            expect(def).toBeUndefined();
        });
    });

    describe('createHoverContent', () => {
        it('should create hover content for a Report', () => {
            const tdl = `[Report: SalesReport]
                Title: Sales Summary
                Form: MainForm
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const def = sourceFile.definitions[0];

            const hover = createHoverContent(def);

            expect(hover).toContain('Report');
            expect(hover).toContain('SalesReport');
        });

        it('should create hover content for a Function', () => {
            const tdl = `[Function: CalculateTotal]
                Parameter: Amount: Number
                Returns: Number
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const def = sourceFile.definitions[0];

            const hover = createHoverContent(def);

            expect(hover).toContain('Function');
            expect(hover).toContain('CalculateTotal');
        });

        it('should include attributes in hover', () => {
            const tdl = `[Field: AmountField]
                Set As: $Amount
                Width: 20
                Format: Currency
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const def = sourceFile.definitions[0];

            const hover = createHoverContent(def);

            expect(hover).toContain('Set As');
            expect(hover).toContain('Width');
        });

        it('should show modifier in hover for modified definitions', () => {
            const tdl = `[#Menu: Gateway of Tally]
                Add: Item: New Option
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const def = sourceFile.definitions[0];

            const hover = createHoverContent(def);

            expect(hover).toContain('#');
            expect(hover).toContain('Menu');
        });
    });

    describe('getHoverInfo with testMetadata!', () => {
        it('should show attribute description when hovering on attribute name', () => {
            const tdl = `[Report: TestReport]
                Form: MainForm
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('Form');

            const result = getHoverInfo(sourceFile, offset, testMetadata!);

            expect(result).toBeDefined();
            expect(result?.type).toBe('attribute');
            expect(result?.content).toContain('**Form**');
        });

        it('should show parameter info when hovering on parameter value', () => {
            const tdl = `[Report: TestReport]
                Form: MainForm
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('MainForm');

            const result = getHoverInfo(sourceFile, offset, testMetadata!);

            expect(result).toBeDefined();
            expect(result?.type).toBe('parameter');
            expect(result?.content).toContain('Parameter');
        });

        it('should show definition info when hovering on definition header', () => {
            const tdl = `[Report: TestReport]
                Title: Test
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('TestReport');

            const result = getHoverInfo(sourceFile, offset, testMetadata!);

            expect(result).toBeDefined();
            expect(result?.type).toBe('definition');
            expect(result?.content).toContain('Report');
        });
    });

    describe('Function hover', () => {
        it('should show function info when hovering on $$FunctionName', () => {
            const tdl = `[Field: DateField]
                Set As: $$PrintDate
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('PrintDate');

            const result = getHoverInfo(sourceFile, offset, testMetadata!);

            expect(result).toBeDefined();
            expect(result?.type).toBe('function');
            expect(result?.content).toContain('$$PrintDate');
        });

        it('should show function parameter info when inside function params (colon style)', () => {
            const tdl = `[Field: DateField]
                Set As: $$Date:(20251206)
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            // Position cursor inside the parameter
            const offset = tdl.indexOf('20251206');

            const result = getHoverInfo(sourceFile, offset, testMetadata!);

            // Should show function parameter info
            expect(result).toBeDefined();
            expect(result?.type).toBe('function_parameter');
        });

        it('should have testMetadata! functions loaded', () => {
            expect(testMetadata!.functions.length).toBeGreaterThan(0);
            const printDate = testMetadata!.functions.find((f: TDLFunction) => f.Name === 'PrintDate');
            expect(printDate).toBeDefined();
        });
    });
});
