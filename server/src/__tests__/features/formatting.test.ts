import { describe, it, expect } from 'vitest';
import { formatDocument } from '../../features/formatting';
import { FormattingOptions } from 'vscode-languageserver';
import { Parser } from '../../core/parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FormattingRules, DEFAULT_FORMATTING_RULES, mergeFormattingRules } from '../../features/formatting/formattingRules';

describe('Document Formatting', () => {
    const options: FormattingOptions = {
        tabSize: 4,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true
    };

    // By default in existing tests, keep blankLinesAfterDefinitionHeader = 0 to prevent test churn
    const testRules = mergeFormattingRules({ blankLinesAfterDefinitionHeader: 0 });

    function mergeTestRules(overrides: Partial<FormattingRules>): FormattingRules {
        return {
            ...testRules,
            ...overrides
        };
    }

    function apply(
        input: string, 
        expected: string, 
        rules: FormattingRules = testRules,
        customOptions: FormattingOptions = options
    ) {
        const parser = new Parser(input);
        const sourceFile = parser.parse();
        const edits = formatDocument(input, sourceFile, customOptions, rules);
        
        const doc = TextDocument.create('test://test.tdl', 'tdl', 1, input);
        const result = TextDocument.applyEdits(doc, edits);
        expect(result).toBe(expected);
    }

    it('should indent attributes inside a definition', () => {
        const input = `[Report : MyReport]
Title : "My Title"
Form : MyForm`;

        const expected = `[Report: MyReport]
    Title : "My Title"
    Form : MyForm
`;

        apply(input, expected);
    });

    it('should indent comments inside a definition', () => {
        const input = `[Report : MyReport]
Title : "My Title"
;; This is a comment inside
Form : MyForm`;

        const expected = `[Report: MyReport]
    Title : "My Title"
    ;; This is a comment inside
    Form : MyForm
`;
        apply(input, expected);
    });

    it('should handle existing indentation', () => {
        const input = `[Report : MyReport]
        Title : "My Title"`;

        const expected = `[Report: MyReport]
    Title : "My Title"
`;
        apply(input, expected);
    });

    it('should preserve spacing around colons for alignment by default', () => {
        const input = `[Report : Report1]
    Title : "My Title"
    Form  : MyForm
    Part : MyPart`;

        const expected = `[Report: Report1]
    Title : "My Title"
    Form  : MyForm
    Part : MyPart
`;
        apply(input, expected);
    });

    // ─── NEW CONFIGURABLE RULES TESTS ───

    describe('Indentation Rules', () => {
        it('should respect indentDefinitionBody = false', () => {
            const input = `[Report: MyReport]
Title: "Title"`;
            const expected = `[Report: MyReport]
Title : "Title"
`;
            const rules = mergeTestRules({ indentDefinitionBody: false });
            apply(input, expected, rules);
        });

        it('should indent block statement bodies inside functions', () => {
            const input = `[Function: MyFunc]
01 : IF : ##Check
02 : SET : Val : 10
03 : ENDIF`;
            const expected = `[Function: MyFunc]
    01 : IF : ##Check
        02 : SET : Val : 10
    03 : ENDIF
`;
            apply(input, expected);
        });

        it('should respect indentBlockStatementBody = false', () => {
            const input = `[Function: MyFunc]
01 : IF : ##Check
02 : SET : Val : 10
03 : ENDIF`;
            const expected = `[Function: MyFunc]
    01 : IF : ##Check
    02 : SET : Val : 10
    03 : ENDIF
`;
            const rules = mergeTestRules({ indentBlockStatementBody: false });
            apply(input, expected, rules);
        });

        it('should preserve continuation line indentation of multiline attributes', () => {
            const input = `[Report: MyReport]
Title: "My Title Part 1" +
              "Part 2"`;
            const expected = `[Report: MyReport]
    Title : "My Title Part 1" +
                  "Part 2"
`;
            apply(input, expected);
        });

        it('should indent nested block statement bodies', () => {
            const input = `[Function: NestedFunc]
01 : IF : ##CheckOuter
02 : IF : ##CheckInner
03 : SET : Val : 10
04 : ENDIF
05 : ENDIF`;
            const expected = `[Function: NestedFunc]
    01 : IF : ##CheckOuter
        02 : IF : ##CheckInner
            03 : SET : Val : 10
        04 : ENDIF
    05 : ENDIF
`;
            apply(input, expected);
        });
    });

    describe('Colon Spacing Rules', () => {
        it('should respect spaceBeforeColon = "none" and spaceAfterColon = "none" on attributes', () => {
            const input = `[Report: MyReport]
Title  :  "My Title"`;
            const expected = `[Report: MyReport]
    Title:"My Title"
`;
            const rules = mergeTestRules({ spaceBeforeColon: "none", spaceAfterColon: "none" });
            apply(input, expected, rules);
        });

        it('should respect spaceBeforeColon = "tab" on attributes', () => {
            const input = `[Report: MyReport]
Title : "My Title"`;
            const expected = `[Report: MyReport]
\tTitle\t: "My Title"
`;
            const rules = mergeTestRules({ spaceBeforeColon: "tab" });
            const customOptions: FormattingOptions = {
                tabSize: 4,
                insertSpaces: false, // Use tabs for indentation so \t matches
                trimTrailingWhitespace: true,
                insertFinalNewline: true,
                trimFinalNewlines: true
            };
            apply(input, expected, rules, customOptions);
        });

        it('should respect definition colon rules', () => {
            const input = `[Report:MyReport]`;
            const expected = `[Report: MyReport]
`;
            apply(input, expected);
        });

        it('should respect spaceBeforeDefinitionColon = "space" and spaceAfterDefinitionColon = "none"', () => {
            const input = `[Report: MyReport]`;
            const expected = `[Report :MyReport]
`;
            const rules = mergeTestRules({ spaceBeforeDefinitionColon: "space", spaceAfterDefinitionColon: "none" });
            apply(input, expected, rules);
        });
    });

    describe('Blank Lines Rules', () => {
        it('should enforce blankLinesBetweenDefinitions', () => {
            const input = `[Report: R1]
Title: "R1"
[Report: R2]
Title: "R2"`;
            const expected = `[Report: R1]
    Title : "R1"

[Report: R2]
    Title : "R2"
`;
            apply(input, expected);
        });

        it('should respect blankLinesBetweenDefinitions = 0', () => {
            const input = `[Report: R1]
Title: "R1"

[Report: R2]
Title: "R2"`;
            const expected = `[Report: R1]
    Title : "R1"
[Report: R2]
    Title : "R2"
`;
            const rules = mergeTestRules({ blankLinesBetweenDefinitions: 0 });
            apply(input, expected, rules);
        });

        it('should respect blankLinesBetweenAttributes = 1', () => {
            const input = `[Report: R1]
Title: "R1"
Form: F1`;
            const expected = `[Report: R1]
    Title : "R1"

    Form : F1
`;
            const rules = mergeTestRules({ blankLinesBetweenAttributes: 1 });
            apply(input, expected, rules);
        });

        it('should respect blankLinesAfterDefinitionHeader = 1 by default', () => {
            const input = `[Report: R1]
Title: "R1"`;
            const expected = `[Report: R1]

    Title : "R1"
`;
            // Uses DEFAULT_FORMATTING_RULES which has blankLinesAfterDefinitionHeader = 1
            apply(input, expected, DEFAULT_FORMATTING_RULES);
        });

        it('should preserve original blank lines between attributes up to maxConsecutiveBlankLines', () => {
            const input = `[Report: R1]
    Title : "R1"


    Form : F1
    
    
    
    Part : P1`;
            const expected = `[Report: R1]
    Title : "R1"


    Form : F1


    Part : P1
`;
            apply(input, expected);
        });

        it('should respect maxConsecutiveBlankLines', () => {
            const input = `[Report: R1]
    Title : "R1"




    ;; Comment
    Form: F1`;
            const expected = `[Report: R1]
    Title : "R1"

    ;; Comment
    Form : F1
`;
            const rules = mergeTestRules({ maxConsecutiveBlankLines: 1 });
            apply(input, expected, rules);
        });
    });

    describe('Casing Rules', () => {
        it('should respect definitionTypeCasing = "uppercase"', () => {
            const input = `[report: R1]`;
            const expected = `[REPORT: R1]
`;
            const rules = mergeTestRules({ definitionTypeCasing: "uppercase" });
            apply(input, expected, rules);
        });

        it('should respect definitionTypeCasing = "titlecase"', () => {
            const input = `[report: R1]`;
            const expected = `[Report: R1]
`;
            const rules = mergeTestRules({ definitionTypeCasing: "titlecase" });
            apply(input, expected, rules);
        });

        it('should respect attributeNameCasing = "uppercase"', () => {
            const input = `[Report: R1]
title: "R1"`;
            const expected = `[Report: R1]
    TITLE : "R1"
`;
            const rules = mergeTestRules({ attributeNameCasing: "uppercase" });
            apply(input, expected, rules);
        });

        it('should respect booleanKeywordCasing = "uppercase"', () => {
            const input = `[Report: R1]
Active: yes`;
            const expected = `[Report: R1]
    Active : YES
`;
            const rules = mergeTestRules({ booleanKeywordCasing: "uppercase" });
            apply(input, expected, rules);
        });
    });

    describe('Operator and Comma Spacing Rules', () => {
        it('should respect spaceAroundOperators = true', () => {
            const input = `[Report: R1]
Set as: 1+2*3`;
            const expected = `[Report: R1]
    Set as : 1 + 2 * 3
`;
            apply(input, expected);
        });

        it('should respect spaceAfterComma = true', () => {
            const input = `[Report: R1]
Fields: F1,F2,F3`;
            const expected = `[Report: R1]
    Fields : F1, F2, F3
`;
            apply(input, expected);
        });
    });
});
