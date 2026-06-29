import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { createHoverContent, getHoverInfo } from '../hover';
import { getDefinitionAtOffset } from '../definition';
import { ScopeManager, ScopeKind } from '../scopeManager';
import { SymbolKind } from '../symbolTable';
import { AttributeSymbol, FunctionSymbol } from '../../models/symbols';

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

    describe('getHoverInfo with ScopeManager', () => {
        
        let scopeManager: ScopeManager;
        const testUri = 'file://test.tdl';

        beforeEach(() => {
            scopeManager = new ScopeManager();
        });

        it('should show attribute description when hovering on attribute name', () => {
            const tdl = `[Report: TestReport]
                Form: MainForm
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('Form');

            scopeManager.buildFileScope(testUri, sourceFile);
            
            // Mock the resolution of 'Form' attribute
            scopeManager.resolveAttribute = (name, type) => {
                if (name === 'Form' && type === 'Report') {
                    return {
                        name: 'Form',
                        kind: SymbolKind.Object,
                        definitionType: 'Report',
                        uri: 'global',
                        start: 0, end: 0,
                        description: 'Specifies the form used in the report',
                        isDiscrete: false,
                        parameters: []
                    } as AttributeSymbol;
                }
                return undefined;
            };

            const result = getHoverInfo(sourceFile, offset, scopeManager, testUri);

            expect(result).toBeDefined();
            expect(result?.type).toBe('attribute');
            expect(result?.content).toContain('**Form**');
            expect(result?.content).toContain('Specifies the form');
        });

        it('should show parameter info when hovering on parameter value', () => {
            const tdl = `[Report: TestReport]
                Form: MainForm
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('MainForm');

            scopeManager.buildFileScope(testUri, sourceFile);

            // Mock the resolution of 'Form' attribute with parameters
            scopeManager.resolveAttribute = (name, type) => {
                if (name === 'Form' && type === 'Report') {
                    return {
                        name: 'Form',
                        kind: SymbolKind.Object,
                        definitionType: 'Report',
                        uri: 'global',
                        start: 0, end: 0,
                        isDiscrete: false,
                        parameters: [
                            { ParameterType: 'Value1', DataType: 'Form', IsMandatory: true }
                        ]
                    } as AttributeSymbol;
                }
                return undefined;
            };

            const result = getHoverInfo(sourceFile, offset, scopeManager, testUri);

            expect(result).toBeDefined();
            expect(result?.type).toBe('parameter');
            expect(result?.content).toContain('Parameter 1');
            expect(result?.content).toContain('Form');
        });

        it('should show definition info when hovering on definition header', () => {
            const tdl = `[Report: TestReport]
                Title: Test
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('TestReport');

            scopeManager.buildFileScope(testUri, sourceFile);

            const result = getHoverInfo(sourceFile, offset, scopeManager, testUri);

            expect(result).toBeDefined();
            expect(result?.type).toBe('definition');
            expect(result?.content).toContain('Report');
        });
    });

    describe('Function hover', () => {
        let scopeManager: ScopeManager;
        const testUri = 'file://test.tdl';

        beforeEach(() => {
            scopeManager = new ScopeManager();
        });

        it('should show function info when hovering on $$FunctionName', () => {
            const tdl = `[Field: DateField]
                Set As: $$PrintDate
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('PrintDate');

            scopeManager.buildFileScope(testUri, sourceFile);

            scopeManager.resolveFunction = (name) => {
                if (name.toLowerCase() === 'printdate') {
                    return {
                        name: 'PrintDate',
                        kind: SymbolKind.Function,
                        definitionType: 'Function',
                        uri: 'global',
                        start: 0, end: 0,
                        description: 'Returns the current date',
                        parameters: []
                    } as FunctionSymbol;
                }
                return undefined;
            };

            const result = getHoverInfo(sourceFile, offset, scopeManager, testUri);

            expect(result).toBeDefined();
            expect(result?.type).toBe('function');
            expect(result?.content).toContain('$$PrintDate');
        });

        it('should show function parameter info when inside function params', () => {
            const tdl = `[Field: DateField]
                Set As: $$Date:(20251206)
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();
            const offset = tdl.indexOf('20251206');

            scopeManager.buildFileScope(testUri, sourceFile);

            scopeManager.resolveFunction = (name) => {
                if (name.toLowerCase() === 'date') {
                    return {
                        name: 'Date',
                        kind: SymbolKind.Function,
                        definitionType: 'Function',
                        uri: 'global',
                        start: 0, end: 0,
                        parameters: [
                            { ParameterType: 'DateString', DataType: 'String', IsMandatory: true }
                        ]
                    } as FunctionSymbol;
                }
                return undefined;
            };

            const result = getHoverInfo(sourceFile, offset, scopeManager, testUri);

            expect(result).toBeDefined();
            expect(result?.type).toBe('function_parameter');
            expect(result?.content).toContain('Parameter 1');
        });
    });
});
