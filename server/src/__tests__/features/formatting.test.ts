import { describe, it, expect } from 'vitest';
import { formatDocument } from '../../features/formatting';
import { FormattingOptions } from 'vscode-languageserver';
import { Parser } from '../../core/parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FormattingRules, DEFAULT_FORMATTING_RULES, mergeFormattingRules } from '../../features/formatting/formattingRules';
import { ServerTestHarness } from '../harness/serverTestHarness';

describe('Document Formatting', () => {
    const options: FormattingOptions = {
        tabSize: 4,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true
    };

    // By default in existing tests, keep blankLinesAfterDefinitionHeader = 0 and alignColons = false to prevent test churn
    const testRules = mergeFormattingRules({ blankLinesAfterDefinitionHeader: 0, alignColons: false });

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
    02 :     SET : Val : 10
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
    02 :     IF : ##CheckInner
    03 :         SET : Val : 10
    04 :     ENDIF
    05 : ENDIF
`;
            apply(input, expected);
        });

        it('should format IF/ELSE/ENDIF block statements correctly with aligned labels', () => {
            const input = `[Function: IfElseFunc]
01 : IF : ##Cond
02 : SET : Val : 1
03 : ELSE :
04 : SET : Val : 2
05 : ENDIF`;
            const expected = `[Function: IfElseFunc]
    01 : IF : ##Cond
    02 :     SET : Val : 1
    03 : ELSE :
    04 :     SET : Val : 2
    05 : ENDIF
`;
            apply(input, expected);
        });

        it('should format SWITCH/CASE/DEFAULT block statements correctly with aligned labels', () => {
            const input = `[Function: SwitchFunc]
01 : SWITCH : ##Val
02 : CASE : 1
03 : SET : Res : "one"
04 : CASE : 2
05 : SET : Res : "two"
06 : DEFAULT :
07 : SET : Res : "other"
08 : ENDSWITCH`;
            const expected = `[Function: SwitchFunc]
    01 : SWITCH : ##Val
    02 :     CASE : 1
    03 :         SET : Res : "one"
    04 :     CASE : 2
    05 :         SET : Res : "two"
    06 :     DEFAULT :
    07 :         SET : Res : "other"
    08 : ENDSWITCH
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

    Title   : "R1"
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

    describe('Column Alignment Rules', () => {
        it('should align colons to next tab stop (tabStop strategy by default)', () => {
            const input = `[Report: MyReport]
Form: Simple Trial balance
Title   : "Trial Balance"
Variable: MyStkGroupName`;
            const expected = `[Report: MyReport]
    Form        : Simple Trial balance
    Title       : "Trial Balance"
    Variable    : MyStkGroupName
`;
            const rules = mergeTestRules({ alignColons: true });
            apply(input, expected, rules);
        });

        it('should align colons to longest key + 1 (longestKey strategy)', () => {
            const input = `[Report: MyReport]
Form : Simple Trial balance
Title : "Trial Balance"
Variable : MyStkGroupName`;
            const expected = `[Report: MyReport]
    Form     : Simple Trial balance
    Title    : "Trial Balance"
    Variable : MyStkGroupName
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "longestKey"
            });
            apply(input, expected, rules);
        });

        it('should align colons to fixed column (fixed strategy)', () => {
            const input = `[Report: MyReport]
Form : Simple Trial balance
Title : "Trial Balance"
Variable : MyStkGroupName`;
            const expected = `[Report: MyReport]
    Form            : Simple Trial balance
    Title           : "Trial Balance"
    Variable        : MyStkGroupName
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "fixed",
                alignColonsColumn: 16
            });
            apply(input, expected, rules);
        });

        it('should align colons independently in different definitions', () => {
            const input = `[Report: R1]
Form : Simple Trial balance
Title : "Trial Balance"

[Report: R2]
Form : Simple Trial balance
VeryLongKeyName : MyStkGroupName`;
            const expected = `[Report: R1]
    Form    : Simple Trial balance
    Title   : "Trial Balance"

[Report: R2]
    Form            : Simple Trial balance
    VeryLongKeyName : MyStkGroupName
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "tabStop",
                blankLinesBetweenDefinitions: 1
            });
            apply(input, expected, rules);
        });

        it('should align colons in AutoCol Trial Balance report', () => {
            const input = `[Report : AutoCol Trial Balance]

	;;	Title		: $$LocaleString:"Trial Balance"

	Form : AutoCol Trial Balance

	Repeat : SVCurrentCompany, SVFromDate, SVToDate
	ColumnReport : MyMultiColumns1
	Variable : AutoCol TB Group, IsLedgerWise, SVPeriodicity

	PrintSet    : Report Title      : $$LocaleString : "Trial Balance"
	Set         : IsLedgerWise      : No`;
            const expected = `[Report : AutoCol Trial Balance]

\t;;	Title		: $$LocaleString:"Trial Balance"
\tForm\t\t\t: AutoCol Trial Balance

\tRepeat\t\t\t: SVCurrentCompany, SVFromDate, SVToDate
\tColumnReport\t: MyMultiColumns1
\tVariable\t\t: AutoCol TB Group, IsLedgerWise, SVPeriodicity

\tPrintSet\t\t: Report Title      : $$LocaleString : "Trial Balance"
\tSet\t\t\t\t: IsLedgerWise      : No
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "tabStop",
                spaceBeforeDefinitionColon: "space",
                spaceAfterDefinitionColon: "space"
            });
            const customOptions: FormattingOptions = {
                tabSize: 4,
                insertSpaces: false,
                trimTrailingWhitespace: true,
                insertFinalNewline: true,
                trimFinalNewlines: true
            };
            apply(input, expected, rules, customOptions);
        });

        it('should align attribute colons and function sequence label colons independently when alignColons is true', () => {
            const input = `[Report: MyReport]
Form : Simple
Title : "Test"

[Function: MyFunc]
01 : IF : ##Check
Step02 : SET : Val : 10
ab : ENDIF`;
            const expected = `[Report: MyReport]
    Form  : Simple
    Title : "Test"

[Function: MyFunc]
    01     : IF : ##Check
    Step02 :     SET : Val : 10
    ab     : ENDIF
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "longestKey"
            });
            apply(input, expected, rules);
        });

        it('should align sequence labels in Set Value Enhanced function block when alignColons is true', () => {
            const input = `[Function: Set Value Enhanced]
10 : SET FILE LOG ON
200 : log : dvvfd`;
            const expected = `[Function: Set Value Enhanced]
    10  : SET FILE LOG ON
    200 : log : dvvfd
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "longestKey"
            });
            apply(input, expected, rules);
        });

        it('should align attributes and statement labels independently even inside the same definition', () => {
            const input = `[Function: Set Value Enhanced]
Returns : String
10 : SET FILE LOG ON
200 : log : dvvfd`;
            const expected = `[Function: Set Value Enhanced]
    Returns : String
    10  : SET FILE LOG ON
    200 : log : dvvfd
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "longestKey"
            });
            apply(input, expected, rules);
        });

        it('should respect alignLabelsStrategy settings', () => {
            const input = `[Function: Set Value Enhanced]
10 : SET FILE LOG ON
2000 : log : dvvfd`;
            const expectedLongestKey = `[Function: Set Value Enhanced]
    10   : SET FILE LOG ON
    2000 : log : dvvfd
`;
            const expectedTabStop = `[Function: Set Value Enhanced]
    10      : SET FILE LOG ON
    2000    : log : dvvfd
`;
            const rulesLongestKey = mergeTestRules({
                alignColons: true,
                alignLabelsStrategy: "longestKey"
            });
            const rulesTabStop = mergeTestRules({
                alignColons: true,
                alignLabelsStrategy: "tabStop"
            });
            apply(input, expectedLongestKey, rulesLongestKey);
            apply(input, expectedTabStop, rulesTabStop);

            // Test with insertSpaces: false
            const expectedTabs = `[Function: Set Value Enhanced]
\t10   : SET FILE LOG ON
\t2000 : log : dvvfd
`;
            apply(input, expectedTabs, rulesLongestKey, { tabSize: 4, insertSpaces: false });
        });

        it('should align standalone block end statements correctly', () => {
            const input = `[Function: Test]
390	: 	CREATE TARGET
4000	: END WALK`;
            const expected = `[Function: Test]
    390  : CREATE TARGET
    4000 : END WALK
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignLabelsStrategy: "longestKey"
            });
            apply(input, expected, rules);
        });

        it('should align block end statement labels properly inside a block', () => {
            const input = `[Function: Test]
20 : WALK COLLECTION : Vouchers
390	: 	CREATE TARGET
	4008 : END WALK`;
            const expected = `[Function: Test]
    20   : WALK COLLECTION : Vouchers
    390  :     CREATE TARGET
    4008 : END WALK
`;
            const rules = mergeTestRules({
                alignColons: true
            });
            apply(input, expected, rules);
        });

        it('should align continuation lines starting with + with the value or action start', () => {
            // 1. Attribute continuation under spaces
            const inputAttrSpaces = `[Report: MyReport]
Form : Simple
Title : "[Collection: TSPL Stock Item Price List]"+
+ " Data Source : File JSON"+
+ " JSON Object Path: 'Stockitems'"`;
            const expectedAttrSpaces = `[Report: MyReport]
    Form  : Simple
    Title : "[Collection: TSPL Stock Item Price List]" +
            + " Data Source : File JSON" +
            + " JSON Object Path: 'Stockitems'"
`;
            const rulesAttrSpaces = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "longestKey"
            });
            apply(inputAttrSpaces, expectedAttrSpaces, rulesAttrSpaces);

            // 2. Attribute continuation under tabs
            const inputAttrTabs = `[Report: MyReport]
Form : Simple
Title : "[Collection: TSPL Stock Item Price List]"+
+ " Data Source : File JSON"`;
            const expectedAttrTabs = `[Report: MyReport]
\tForm  : Simple
\tTitle : "[Collection: TSPL Stock Item Price List]" +
\t        + " Data Source : File JSON"
`;
            const customOptions = { tabSize: 4, insertSpaces: false };
            apply(inputAttrTabs, expectedAttrTabs, rulesAttrSpaces, customOptions);

            // 3. Statement continuation with sequence labels (spaces)
            const inputStmtLabel = `[Function: MyFunc]
10 : SET VALUE : MyVar : "My Value" +
+ " Extra String"`;
            const expectedStmtLabel = `[Function: MyFunc]
    10 : SET VALUE : MyVar : "My Value" +
         + " Extra String"
`;
            const rulesStmtLabel = mergeTestRules({
                alignColons: false
            });
            apply(inputStmtLabel, expectedStmtLabel, rulesStmtLabel);

            // 4. Statement continuation without sequence labels
            const inputStmtNoLabel = `[Function: MyFunc]
SET VALUE : MyVar : "My Value" +
+ " Extra String"`;
            const expectedStmtNoLabel = `[Function: MyFunc]
    SET VALUE : MyVar : "My Value" +
                + " Extra String"
`;
            apply(inputStmtNoLabel, expectedStmtNoLabel, rulesStmtLabel);
        });

        it('should format Set Value Enhanced function block correctly', () => {
            const input = `[Function: Set Value Enhanced]

\t10\t : SET FILE LOG ON

\t20\t : WALK COLLECTION\t : Vouchers of My Objects
\t30  : \tSET             : SVViewName \t : $$SysName : InvVchView
\t40\t : \tNEW OBJECT\t\t : Voucher
\t50\t : \tLOG TARGET \t\t : TgtObj.txt`;

            const expected = `[Function: Set Value Enhanced]
    10 : SET FILE LOG ON

    20 : WALK COLLECTION : Vouchers of My Objects
    30 :     SET : SVViewName : $$SysName : InvVchView
    40 :     NEW OBJECT : Voucher
    50 :     LOG TARGET : TgtObj.txt
`;
            apply(input, expected);
        });

        it('should format nested INSERT COLLECTION OBJECT and SET TARGET blocks correctly', () => {
            const input = `[Function: NestedInsert]
180     : INSERT COLLECTION OBJECT : INVENTORYENTRIES
190 :SET VALUE : StockItemName : "Item 1"
200 : SET VALUE : IsDeemedPositive : No
210   : SET VALUE : ActualQty : 10
250      : INSERT COLLECTION OBJECT : BATCHALLOCATIONS
260 : SET VALUE : GodownName : "Main Location"
320 : SET TARGET : ..
330 : SET TARGET : Group
340 : SET TARGET : ...`;

            const expected = `[Function: NestedInsert]
    180 : INSERT COLLECTION OBJECT : INVENTORYENTRIES
    190 :     SET VALUE : StockItemName : "Item 1"
    200 :     SET VALUE : IsDeemedPositive : No
    210 :     SET VALUE : ActualQty : 10
    250 :     INSERT COLLECTION OBJECT : BATCHALLOCATIONS
    260 :         SET VALUE : GodownName : "Main Location"
    320 :     SET TARGET : ..
    330 : SET TARGET : Group
    340 : SET TARGET : ...
`;
            apply(input, expected);
        });

        it('should align multi-colon chains when alignMultiColonChains is true (spaces)', () => {
            const input = `[Report: MyReport]
PrintSet : Report Title : $$LocaleString : "Trial Balance"
Set : IsLedgerWise : No`;
            const expected = `[Report: MyReport]
    PrintSet : Report Title : $$LocaleString    : "Trial Balance"
    Set      : IsLedgerWise : No
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "longestKey",
                alignMultiColonChains: true
            });
            apply(input, expected, rules);
        });

        it('should align multi-colon chains when alignMultiColonChains is true (tabs)', () => {
            const input = `[Report: MyReport]
PrintSet : Report Title : $$LocaleString : "Trial Balance"
Set : IsLedgerWise : No`;
            const expected = `[Report: MyReport]
\tPrintSet\t: Report Title\t: $$LocaleString\t: "Trial Balance"
\tSet\t\t\t: IsLedgerWise\t: No
`;
            const rules = mergeTestRules({
                alignColons: true,
                alignColonsStrategy: "tabStop",
                alignMultiColonChains: true
            });
            const customOptions = { tabSize: 4, insertSpaces: false };
            apply(input, expected, rules, customOptions);
        });

        it('should align colons using ServerTestHarness to mimic editor configuration', async () => {
            const harness = new ServerTestHarness();

            // 1. Send configuration update (mimic VS Code setting changed)
            await harness.runtime.workspaceLifecycle.onDidChangeConfiguration({
                settings: {
                    tallyTDL: {
                        formatting: {
                            alignColons: true,
                            alignColonsStrategy: "tabStop"
                        }
                    }
                }
            });

            const uri = 'file:///z:/test.tdl';
            const input = `[Report : AutoCol Trial Balance]

	Form : AutoCol Trial Balance
	Repeat : SVCurrentCompany, SVFromDate, SVToDate
	ColumnReport : MyMultiColumns1
	Variable : AutoCol TB Group, IsLedgerWise, SVPeriodicity`;

            // 2. Open document (this parses and indexes it, putting it in DocumentStateStore)
            harness.simulateOpen(uri, 'tdl', input);
            harness.runtime.documentLifecycle.processPendingDocuments();

            // 3. Trigger formatDocument handler
            const edits = await harness.runtime.documentFeatures.formatDocument({
                textDocument: { uri },
                options: {
                    tabSize: 4,
                    insertSpaces: false // using tab-padding
                }
            });

            // 4. Verify formatting edits
            expect(edits.length).toBe(1);
            const doc = harness.documents.get(uri)!;
            const formattedResult = TextDocument.applyEdits(doc, edits);

            const expected = `[Report: AutoCol Trial Balance]

\tForm\t\t\t: AutoCol Trial Balance
\tRepeat\t\t\t: SVCurrentCompany, SVFromDate, SVToDate
\tColumnReport\t: MyMultiColumns1
\tVariable\t\t: AutoCol TB Group, IsLedgerWise, SVPeriodicity
`;
            expect(formattedResult).toBe(expected);

            harness.dispose();
        });
    });
});
