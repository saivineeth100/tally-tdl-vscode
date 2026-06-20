import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser/parser';
import { findReferenceAtOffset, findDefinitionByName, getDefinitionLocation } from '../definition';
import { ScopeManager } from '../scopeManager';
import { ScopeKind } from '../scopeManager/types';
import { SymbolTable, SymbolKind } from '../symbolTable';
import { resolveVariable } from '../scopeManager/scopeResolver';

describe('Definition Service - Modifier References', () => {
    /**
     * Real-world scenario: A file has an original Report definition,
     * and later a modifier definition to alter it.
     */
    describe('Real-world: Original + Modifier in same file', () => {
        const realWorldTdl = `[Report: FAAV Report]
    Form: FAVForm
    Title: "Fixed Assets"

[#Report: FAAV Report]
    Title: "Modified Fixed Assets"
`;

        it('should find reference when clicking on modifier definition name', () => {
            const parser = new Parser(realWorldTdl);
            const sourceFile = parser.parse();

            // Click on "FAAV Report" in the modifier definition [#Report: FAAV Report]
            // Line 4 starts at position 70 (after 3 newlines + content)
            // The name "FAAV Report" starts after "[#Report: "
            const modifierDefNameStart = realWorldTdl.indexOf('FAAV Report', realWorldTdl.indexOf('#'));
            const offset = modifierDefNameStart + 2; // Middle of the name

            const ref = findReferenceAtOffset(sourceFile, offset, realWorldTdl);

            expect(ref).toBeDefined();
            expect(ref?.name).toBe('FAAV Report');
            expect(ref?.expectedType).toBe('Report');
        });

        it('should skip modifier definition and find ORIGINAL when using skipModifiers=true', () => {
            const parser = new Parser(realWorldTdl);
            const sourceFile = parser.parse();

            // This is the key test - when looking for "FAAV Report", 
            // we should find the ORIGINAL definition (no modifier), not the #modifier one
            const originalDef = findDefinitionByName(sourceFile, 'FAAV Report', 'Report', true);

            expect(originalDef).toBeDefined();
            expect(originalDef?.modifier).toBeUndefined(); // Should NOT have a modifier
            expect(originalDef?.name?.text).toBe('FAAV Report');
        });

        it('should find modifier definition when NOT using skipModifiers (default behavior)', () => {
            const parser = new Parser(realWorldTdl);
            const sourceFile = parser.parse();

            // Without skipModifiers, it finds the first match (which could be original OR modifier)
            const def = findDefinitionByName(sourceFile, 'FAAV Report', 'Report');

            expect(def).toBeDefined();
            expect(def?.name?.text).toBe('FAAV Report');
            // This could be either - the test documents the current behavior
        });

        it('should get correct location of original definition', () => {
            const parser = new Parser(realWorldTdl);
            const sourceFile = parser.parse();

            const originalDef = findDefinitionByName(sourceFile, 'FAAV Report', 'Report', true);
            expect(originalDef).toBeDefined();

            const loc = getDefinitionLocation(originalDef!);

            // Location should be at the start of the original [Report: FAAV Report]
            expect(loc.start).toBe(0);
            expect(realWorldTdl.substring(loc.start, loc.start + 8)).toBe('[Report:');
        });

        it('should verify both definitions exist in parsed AST', () => {
            const parser = new Parser(realWorldTdl);
            const sourceFile = parser.parse();

            expect(sourceFile.definitions.length).toBe(2);

            const original = sourceFile.definitions[0];
            const modifier = sourceFile.definitions[1];

            expect(original.modifier).toBeUndefined();
            expect(original.name?.text).toBe('FAAV Report');

            expect(modifier.modifier?.Text).toBe('#');
            expect(modifier.name?.text).toBe('FAAV Report');
        });
    });

    describe('findReferenceAtOffset with various modifiers', () => {
        it('should detect reference on [#Type: Name] alter modifier', () => {
            const tdl = `[Report: Original]
[#Report: Original]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Find offset on "Original" in the #modifier line
            const offset = tdl.indexOf('Original', tdl.indexOf('#')) + 2;
            const ref = findReferenceAtOffset(sourceFile, offset, tdl);

            expect(ref).toBeDefined();
            expect(ref?.name).toBe('Original');
            expect(ref?.expectedType).toBe('Report');
        });

        it('should detect reference on [!Type: Name] delete modifier', () => {
            const tdl = `[Field: MyField]
[!Field: MyField]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const offset = tdl.indexOf('MyField', tdl.indexOf('!')) + 2;
            const ref = findReferenceAtOffset(sourceFile, offset, tdl);

            expect(ref).toBeDefined();
            expect(ref?.name).toBe('MyField');
            expect(ref?.expectedType).toBe('Field');
        });

        it('should detect reference on [*Type: Name] optional modifier', () => {
            const tdl = `[Form: BaseForm]
[*Form: BaseForm]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const offset = tdl.indexOf('BaseForm', tdl.indexOf('*')) + 2;
            const ref = findReferenceAtOffset(sourceFile, offset, tdl);

            expect(ref).toBeDefined();
            expect(ref?.name).toBe('BaseForm');
            expect(ref?.expectedType).toBe('Form');
        });

        it('should NOT detect reference on regular definition name (no modifier)', () => {
            const tdl = '[Report: MyReport]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Click on "MyReport" - this is a regular definition, not a reference
            const offset = tdl.indexOf('MyReport') + 2;
            const ref = findReferenceAtOffset(sourceFile, offset, tdl);

            // Regular definitions don't have a reference - you're defining, not referencing
            expect(ref).toBeUndefined();
        });
    });

    describe('findDefinitionByName with skipModifiers', () => {
        it('should skip all modifier definitions when skipModifiers=true', () => {
            const tdl = `[#Report: First]
[!Report: Second]
[*Report: Third]
[Report: Original]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Should find the Original (non-modifier) definition
            const def = findDefinitionByName(sourceFile, 'Original', 'Report', true);
            expect(def).toBeDefined();
            expect(def?.modifier).toBeUndefined();
            expect(def?.name?.text).toBe('Original');
        });

        it('should return undefined if only modifier definitions exist', () => {
            const tdl = `[#Report: ModifierOnly]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // No original definition exists, so skipModifiers should return undefined
            const def = findDefinitionByName(sourceFile, 'ModifierOnly', 'Report', true);
            expect(def).toBeUndefined();
        });

        it('should find definition with spaces in name', () => {
            const tdl = '[Report: My Custom Report]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = findDefinitionByName(sourceFile, 'mycustomreport', 'Report');
            expect(def).toBeDefined();
            expect(def?.name?.text).toBe('My Custom Report');
        });

        it('should filter by type when specified', () => {
            const tdl = `[Report: SameName]
[Field: SameName]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const reportDef = findDefinitionByName(sourceFile, 'SameName', 'Report');
            expect(reportDef?.type.text).toBe('Report');

            const fieldDef = findDefinitionByName(sourceFile, 'SameName', 'Field');
            expect(fieldDef?.type.text).toBe('Field');
        });
    });

    describe('getDefinitionLocation', () => {
        it('should return correct start and end for definition', () => {
            const tdl = '[Report: MyReport]';
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            const def = sourceFile.definitions[0];
            const loc = getDefinitionLocation(def);

            expect(loc.start).toBe(0);
            expect(loc.end).toBeGreaterThanOrEqual(17); // End position includes closing ]
        });

        it('should return correct location for definition after comment', () => {
            const tdl = `; Comment
[Report: After Comment]`;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Should have at least one definition
            expect(sourceFile.definitions.length).toBeGreaterThanOrEqual(1);

            if (sourceFile.definitions.length > 0) {
                const def = sourceFile.definitions[0];
                const loc = getDefinitionLocation(def);

                // Should start at the [ bracket (after the comment and newline)
                // "Comment\n" is length 10 (including ;)
                // So [ is at index 10
                expect(loc.start).toBe(10);
                expect(tdl.charAt(loc.start)).toBe('[');
            }
        });
    });

    describe('Modifier Scope Lookup & Inheritance', () => {
        it('should correctly link modifier to base definition and inherit attributes', () => {
            const fileA = `[Report: BaseReport]
    Variable: BaseVar`;
            const fileB = `[#Report: BaseReport]
    Variable: ModVar`;

            const manager = new ScopeManager(new SymbolTable());
            
            const parserA = new Parser(fileA);
            const sourceA = parserA.parse();
            manager.buildFileScope('file://A.tdl', sourceA);

            const parserB = new Parser(fileB);
            const sourceB = parserB.parse();
            manager.buildFileScope('file://B.tdl', sourceB);

            const baseScope = manager.findDefinitionScope('Report:BaseReport');
            expect(baseScope).toBeDefined();

            // Verify modifier contribution is registered
            const contributions = manager.modifierContributions.get('report:basereport');
            expect(contributions).toBeDefined();
            expect(contributions?.length).toBe(1);
            expect(contributions![0].uri).toBe('file://B.tdl');

            // Verify inheritance resolving
            const resolvedBaseVar = resolveVariable(manager, 'BaseVar', baseScope!);
            expect(resolvedBaseVar).toBeDefined();
            
            const resolvedModVar = resolveVariable(manager, 'ModVar', baseScope!);
            expect(resolvedModVar).toBeDefined();
        });

        it('should remove modifier contribution when file is removed', () => {
            const manager = new ScopeManager(new SymbolTable());
            // Create base definition
            const baseSource = new Parser(`[Report: SomeReport]`).parse();
            manager.buildFileScope('file://base.tdl', baseSource);

            const source = new Parser(`[#Report: SomeReport]\n Variable: X`).parse();
            
            manager.buildFileScope('file://mod.tdl', source);
            expect(manager.modifierContributions.get('report:somereport')?.length).toBe(1);
            
            manager.removeFileScope('file://mod.tdl');
            expect(manager.modifierContributions.get('report:somereport')).toBeUndefined();
        });

        it('should resolve modifier applied to a default tally definition (metadata)', () => {
            const manager = new ScopeManager(new SymbolTable());
            
            // Mock metadata for default definition 'Daybook'
            manager.existingDefinitions.set('report', new Set(['daybook']));

            // User modifies the default definition
            const parser = new Parser(`[#Report: Daybook]\n Variable: MyVar`);
            const source = parser.parse();
            
            manager.buildFileScope('file://workspace.tdl', source);

            // Because 'Daybook' is not in the workspace, the modifier creates a new local scope for it
            const scope = manager.findDefinitionScope('Report:Daybook');
            expect(scope).toBeDefined();
            expect(scope?.kind).toBe(ScopeKind.Definition);
            
            // We should be able to resolve variables from this modifier scope directly
            const resolvedVar = resolveVariable(manager, 'MyVar', scope!);
            expect(resolvedVar).toBeDefined();
            expect(resolvedVar?.name).toBe('MyVar');
        });
    });
});
