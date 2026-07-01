import { describe, expect, test } from 'vitest';
import { Lexer } from '../../../core/lexer/lexer';
import { Token } from '../../../core/lexer/token';
import { TokenKind } from '../../../core/lexer/tokenKind';

/**
 * This test suite verifies the fundamental tokenization capabilities of the Lexer.
 * It ensures that basic TDL syntax elements (Identifiers, Comments, Directives) 
 * are correctly broken down into sequential structural tokens without losing trivia.
 */
describe('Lexer simple tests', () => {
    test('Test Single Line Comment', () => {
        const tdl = `;; fhtr : RfbfdF dtfh : De rg
            [Report: Trial Balance]`;
        const lexer = new Lexer(tdl);
        var tokens = lexer.Generate();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });
    test('Test Multi Line Comment', () => {
        const tdl = `
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

[Report: CV List Values]`;
        const lexer = new Lexer(tdl);
        var tokens = lexer.Generate();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });
    test('Basic TDL report', () => {
        const tdl = `[Report: Trial Balance]`;
        const lexer = new Lexer(tdl);
        var tokens = lexer.Generate();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });
    test('Basic TDL with spaces in Identifier', () => {
        const tdl = `[Import File: Trial Balance]

	Use			: Browser Common SysFormulae
    Use         : TBAL Template`;
        const lexer = new Lexer(tdl);
        var tokens = lexer.Generate();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });

    test('InUse Directive', () => {
        const tdl = `[System: Formula]
	
	<InUse:Key:LicenseBlockKeyBoard>
	
	SV_MGR_LICENSE_INFO_PANEL_KEY   : "License Block KeyBoard"	`;
        const lexer = new Lexer(tdl);
        var tokens = lexer.Generate();
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });
    test('Token Start Position after Comment', () => {
        const tdl = `; Comment\n[Report: Test]`;
        const lexer = new Lexer(tdl);
        const tokens = lexer.Generate();
        // [ is at index 10 (length of "; Comment\n")
        expect(Token.mapTokens(tokens, tdl)).toMatchSnapshot();
    });
}); 