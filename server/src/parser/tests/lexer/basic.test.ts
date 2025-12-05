import { describe, expect, test } from 'vitest';
import { Lexer } from '../../lexer';


describe('Lexer simple tests', () => {
    test('Test Single Line Comment', () => {
        const lexer = new Lexer(`;; fhtr : RfbfdF dtfh : De rg
            [Report: Trial Balance]`);
        var tokens = lexer.Generate();
        expect(tokens.length).toBe(7);
    });
    test('Test Multi Line Comment', () => {
        const lexer = new Lexer(`
/*
Objective(s) – 
- 	This TDL File demonstrate the usage and purpose of Compound List Variables with
	Reports and LOG Files displaying the same
-	Wherever LOG File opens up on execution of any code, please traverse through
	the end of the document to find the recent output

Last modification – 
-	Altered on 05/04/2010
*/

;; Report Definition for Compound List Values with Key

[Report: CV List Values]`);
        var tokens = lexer.Generate();
        expect(tokens.length).toBe(8);
    });
    test('Basic TDL report', () => {
        const lexer = new Lexer(`[Report: Trial Balance]`);
        var tokens = lexer.Generate();
        expect(tokens.length).toBe(7);
    });
    test('Basic TDL with spaces in Identifier', () => {
        const lexer = new Lexer(`[Import File: Trial Balance]

	Use			: Browser Common SysFormulae
    Use         : TBAL Template`);
        var tokens = lexer.Generate();
        expect(tokens.length).toBe(17);
    });

    test('InUse Directive', () => {
        const lexer = new Lexer(`[System: Formula]
	
	<InUse:Key:LicenseBlockKeyBoard>
	
	SV_MGR_LICENSE_INFO_PANEL_KEY   : "License Block KeyBoard"	`);
        var tokens = lexer.Generate();
        expect(tokens.length).toBe(16);
    });
}); 