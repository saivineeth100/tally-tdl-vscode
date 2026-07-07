/**
 * Tests for the TDL Modifier Utilities.
 * Validates the parsing and resolution of modifier chains (add, delete, replace, local)
 * and cursor/offset segment identification.
 */

import { describe, it, expect } from 'vitest';
import { testScopeManager } from '../test-setup';
import { resolveModifierChain } from '../../utils/modifierUtils';
import { Parser } from '../../core/parser/parser';

function parseAttribute(tdl: string) {
    const parser = new Parser(tdl);
    const sourceFile = parser.parse();
    const def = sourceFile.definitions[0];
    const attr = def.attributes[0];
    return { def, attr };
}

describe('Modifier Utilities - resolveModifierChain', () => {
    
    it('should return default result for non-modifier attributes', () => {
        const { def, attr } = parseAttribute(`[Form: MyForm]\n    Title: "My Report"`);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBeUndefined();
        expect(result.effectiveDefType).toBe('Form');
        expect(result.effectiveDefName).toBe('MyForm');
        expect(result.values.length).toBe(1);
        expect(result.values[0].value).toBe('"My Report"');
        expect(attr.isAttributeModifier).toBe(false);
        expect(attr.modifierType).toBeUndefined();
    });

    it('should handle offset for non-modifier attribute cursor segments', () => {
        const tdl = `[Form: MyForm]\n    Title: "My Report"`;
        const { def, attr } = parseAttribute(tdl);
        const offset = tdl.indexOf('My Report');
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offset
        );

        expect(result.cursorSegment).toBe('value');
        expect(result.cursorIndexInValues).toBe(0);
    });

    it('should resolve simple Add modifier and set AST node flags', () => {
        const tdl = `[Form: MyForm]\n    Add: Part: MyPart`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('add');
        expect(result.effectiveDefType).toBe('Form');
        expect(result.effectiveDefName).toBe('MyForm');
        expect(result.targetAttribute?.text).toBe('Part');
        expect(result.values.length).toBe(1);
        expect(result.values[0].text).toBe('MyPart');
        
        expect(attr.isAttributeModifier).toBe(true);
        expect(attr.modifierType).toBe('add');
    });

    it('should handle cursor segments for simple Add modifier', () => {
        const tdl = `[Form: MyForm]\n    Add: Part: MyPart`;
        const { def, attr } = parseAttribute(tdl);
        
        // Outer modifier 'Add' offset is on the attribute name, not value array,
        // so resolveModifierChain doesn't resolve it and returns undefined.
        const offsetAdd = tdl.indexOf('Add') + 1;
        const resultAdd = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetAdd
        );
        expect(resultAdd.modifierKind).toBe('add');
        expect(resultAdd.cursorSegment).toBeUndefined();

        // Offset in 'Part'
        const offsetPart = tdl.indexOf('Part') + 1;
        const resultPart = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetPart
        );
        expect(resultPart.cursorSegment).toBe('targetAttribute');

        // Offset in 'MyPart'
        const offsetVal = tdl.indexOf('MyPart') + 1;
        const resultVal = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetVal
        );
        expect(resultVal.cursorSegment).toBe('value');
        expect(resultVal.cursorIndexInValues).toBe(0);
    });

    it('should resolve Add modifier with position (Before/After) modifiers', () => {
        const tdl = `[Form: MyForm]\n    Add: Part: Before: RefPart: MyPart`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('add');
        expect(result.targetAttribute?.text).toBe('Part');
        expect(result.positionModifier?.text).toBe('Before');
        expect(result.positionReference?.text).toBe('RefPart');
        expect(result.values.length).toBe(1);
        expect(result.values[0].text).toBe('MyPart');
    });

    it('should handle cursor segments for Add modifier with position options', () => {
        const tdl = `[Form: MyForm]\n    Add: Part: Before: RefPart: MyPart`;
        const { def, attr } = parseAttribute(tdl);

        // Offset in 'Before'
        const offsetBefore = tdl.indexOf('Before') + 1;
        const resultBefore = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetBefore
        );
        expect(resultBefore.cursorSegment).toBe('positionModifier');

        // Offset in 'RefPart'
        const offsetRef = tdl.indexOf('RefPart') + 1;
        const resultRef = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetRef
        );
        expect(resultRef.cursorSegment).toBe('positionReference');
    });

    it('should resolve simple Delete modifier and set flags', () => {
        const tdl = `[Form: MyForm]\n    Delete: Part: OldPart`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('delete');
        expect(result.targetAttribute?.text).toBe('Part');
        expect(result.values.length).toBe(1);
        expect(result.values[0].text).toBe('OldPart');

        expect(attr.isAttributeModifier).toBe(true);
        expect(attr.modifierType).toBe('delete');
    });

    it('should resolve simple Replace modifier and set flags', () => {
        const tdl = `[Form: MyForm]\n    Replace: Part: OldPart: NewPart`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('replace');
        expect(result.targetAttribute?.text).toBe('Part');
        expect(result.values.length).toBe(2);
        expect(result.values[0].text).toBe('OldPart');
        expect(result.values[1].text).toBe('NewPart');

        expect(attr.isAttributeModifier).toBe(true);
        expect(attr.modifierType).toBe('replace');
    });

    it('should resolve simple Local modifier and set flags', () => {
        const tdl = `[Report: MyReport]\n    Local: Field: MyField: Set As: "Val"`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('local');
        expect(result.effectiveDefType).toBe('field');
        expect(result.effectiveDefName).toBe('MyField');
        expect(result.targetAttribute?.text).toBe('Set As');
        
        // Under local modifier, values slice excludes the target attribute node
        expect(result.values.length).toBe(1);
        expect(result.values[0].value).toBe('"Val"');

        expect(attr.isAttributeModifier).toBe(true);
        expect(attr.modifierType).toBe('local');
    });

    it('should handle cursor segments on simple Local modifier', () => {
        const tdl = `[Report: MyReport]\n    Local: Field: MyField: Set As: "Val"`;
        const { def, attr } = parseAttribute(tdl);

        // Offset in 'Field'
        const offsetDefType = tdl.indexOf('Field') + 1;
        const resultDefType = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetDefType
        );
        expect(resultDefType.cursorSegment).toBe('defType');

        // Offset in 'MyField'
        const offsetDefName = tdl.indexOf('MyField') + 1;
        const resultDefName = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetDefName
        );
        expect(resultDefName.cursorSegment).toBe('defName');
    });

    it('should resolve nested Local and Add chain', () => {
        const tdl = `[Form: MyForm]\n    Local: Form: MyForm: Add: Part: Before: RefPart: MyPart`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('add');
        expect(result.effectiveDefType).toBe('form');
        expect(result.effectiveDefName).toBe('MyForm');
        expect(result.targetAttribute?.text).toBe('Part');
        expect(result.positionModifier?.text).toBe('Before');
        expect(result.positionReference?.text).toBe('RefPart');
        expect(result.values.length).toBe(1);
        expect(result.values[0].text).toBe('MyPart');
    });

    it('should resolve nested Local and Add chain without position modifier', () => {
        const tdl = `[Form: MyForm]\n    Local: Form: MyForm: Add: Part: MyPart`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('add');
        expect(result.effectiveDefType).toBe('form');
        expect(result.effectiveDefName).toBe('MyForm');
        expect(result.targetAttribute?.text).toBe('Part');
        expect(result.positionModifier).toBeUndefined();
        expect(result.positionReference).toBeUndefined();
        expect(result.values.length).toBe(1);
        expect(result.values[0].text).toBe('MyPart');
    });

    it('should resolve deep nested Local chains', () => {
        const tdl = `[Report: MyRep]\n    Local: Part: MyPart: Local: Line: MyLine: Local: Field: MyField: Set As: "Val"`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('local');
        expect(result.effectiveDefType).toBe('field');
        expect(result.effectiveDefName).toBe('MyField');
        expect(result.targetAttribute?.text).toBe('Set As');
        expect(result.values.length).toBe(1);
        expect(result.values[0].value).toBe('"Val"');
    });

    it('should correctly set isAttributeModifier and modifierType for option, switch, and use', () => {
        const tdlOption = `[Report: MyRep]\n    Option: OptCase: MyForm: ##SmpShowMaster = "Ledgers"`;
        const { attr: attrOption } = parseAttribute(tdlOption);
        expect(attrOption.isAttributeModifier).toBe(true);
        expect(attrOption.modifierType).toBe('option');

        const tdlSwitch = `[Collection: MyColl]\n    Switch: OptCase: MyColl: ##SmpShowMaster = "Ledgers"`;
        const { attr: attrSwitch } = parseAttribute(tdlSwitch);
        expect(attrSwitch.isAttributeModifier).toBe(true);
        expect(attrSwitch.modifierType).toBe('switch');

        const tdlUse = `[Report: MyRep]\n    Use: Form1`;
        const { attr: attrUse } = parseAttribute(tdlUse);
        expect(attrUse.isAttributeModifier).toBe(true);
        expect(attrUse.modifierType).toBe('use');
    });

    it('should handle cursor segments for simple Delete modifier', () => {
        const tdl = `[Form: MyForm]\n    Delete: Part: OldPart`;
        const { def, attr } = parseAttribute(tdl);

        // Offset on 'Part'
        const offsetPart = tdl.indexOf('Part') + 1;
        const resultPart = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetPart
        );
        expect(resultPart.cursorSegment).toBe('targetAttribute');

        // Offset on 'OldPart'
        const offsetVal = tdl.indexOf('OldPart') + 1;
        const resultVal = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetVal
        );
        expect(resultVal.cursorSegment).toBe('value');
        expect(resultVal.cursorIndexInValues).toBe(0);
    });

    it('should handle cursor segments for simple Replace modifier', () => {
        const tdl = `[Form: MyForm]\n    Replace: Part: OldPart: NewPart`;
        const { def, attr } = parseAttribute(tdl);

        // Offset on 'Part'
        const offsetPart = tdl.indexOf('Part') + 1;
        const resultPart = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetPart
        );
        expect(resultPart.cursorSegment).toBe('targetAttribute');

        // Offset on 'OldPart'
        const offsetOld = tdl.indexOf('OldPart') + 1;
        const resultOld = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetOld
        );
        expect(resultOld.cursorSegment).toBe('value');
        expect(resultOld.cursorIndexInValues).toBe(0);

        // Offset on 'NewPart'
        const offsetNew = tdl.indexOf('NewPart') + 1;
        const resultNew = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager,
            offsetNew
        );
        expect(resultNew.cursorSegment).toBe('value');
        expect(resultNew.cursorIndexInValues).toBe(1);
    });

    it('should resolve nested Local and Delete chain', () => {
        const tdl = `[Form: MyForm]\n    Local: Form: MyForm: Delete: Part: OldPart`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('delete');
        expect(result.effectiveDefType).toBe('form');
        expect(result.effectiveDefName).toBe('MyForm');
        expect(result.targetAttribute?.text).toBe('Part');
        expect(result.values.length).toBe(1);
        expect(result.values[0].text).toBe('OldPart');
    });

    it('should resolve nested Local and Replace chain', () => {
        const tdl = `[Form: MyForm]\n    Local: Form: MyForm: Replace: Part: OldPart: NewPart`;
        const { def, attr } = parseAttribute(tdl);
        const result = resolveModifierChain(
            attr.name.text.toLowerCase(),
            attr.value,
            def.type.text,
            def.name?.text || '',
            testScopeManager
        );

        expect(result.modifierKind).toBe('replace');
        expect(result.effectiveDefType).toBe('form');
        expect(result.effectiveDefName).toBe('MyForm');
        expect(result.targetAttribute?.text).toBe('Part');
        expect(result.values.length).toBe(2);
        expect(result.values[0].text).toBe('OldPart');
        expect(result.values[1].text).toBe('NewPart');
    });
});
