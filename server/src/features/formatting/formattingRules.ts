/** All configurable formatting rules with their types */
export interface FormattingRules {
    // ── Indentation ──
    /** Indent content inside definitions. Default: true */
    indentDefinitionBody: boolean;
    /** Indent content inside complex objects (sub-objects). Default: true */
    indentComplexObjectBody: boolean;
    /** Indent procedural block bodies (IF/WHILE/FOR/WALK etc.). Default: true */
    indentBlockStatementBody: boolean;

    // ── Colon Spacing ──
    /** Space before `:` in attributes. Options: "space" | "tab" | "none". Default: "space" */
    spaceBeforeColon: "space" | "tab" | "none";
    /** Space after `:` in attributes. Options: "space" | "tab" | "none". Default: "space" */
    spaceAfterColon: "space" | "tab" | "none";
    /** Space before `:` in definition headers [Type : Name]. Default: "space" */
    spaceBeforeDefinitionColon: "space" | "tab" | "none";
    /** Space after `:` in definition headers [Type : Name]. Default: "space" */
    spaceAfterDefinitionColon: "space" | "tab" | "none";

    // ── Blank Lines ──
    /** Blank lines between top-level definitions. Default: 1 */
    blankLinesBetweenDefinitions: number;
    /** Blank lines after definition header before starting attributes/statements. Default: 1 */
    blankLinesAfterDefinitionHeader: number;
    /** Blank lines between attributes within a definition. Default: 0 */
    blankLinesBetweenAttributes: number;
    /** Maximum consecutive blank lines allowed anywhere. Default: 2 */
    maxConsecutiveBlankLines: number;

    // ── Trailing Whitespace ──
    /** Remove trailing whitespace from lines. Default: true */
    trimTrailingWhitespace: boolean;

    // ── Final Newline ──
    /** Ensure file ends with a newline. Default: true */
    insertFinalNewline: boolean;

    // ── Keyword Casing ──
    /** Casing for definition type keywords. Default: "preserve" */
    definitionTypeCasing: "preserve" | "uppercase" | "lowercase" | "titlecase";
    /** Casing for boolean keywords (Yes/No/True/False). Default: "preserve" */
    booleanKeywordCasing: "preserve" | "uppercase" | "lowercase" | "titlecase";
    /** Casing for attribute name keywords. Default: "preserve" */
    attributeNameCasing: "preserve" | "uppercase" | "lowercase" | "titlecase";

    // ── Operator Spacing ──
    /** Space around binary operators (+, -, *, /, =, etc.). Default: true */
    spaceAroundOperators: boolean;
    /** Space after commas in lists. Default: true */
    spaceAfterComma: boolean;
}

export const DEFAULT_FORMATTING_RULES: Readonly<FormattingRules> = {
    indentDefinitionBody: true,
    indentComplexObjectBody: true,
    indentBlockStatementBody: true,
    spaceBeforeColon: "space",
    spaceAfterColon: "space",
    spaceBeforeDefinitionColon: "none",
    spaceAfterDefinitionColon: "space",
    blankLinesBetweenDefinitions: 1,
    blankLinesAfterDefinitionHeader: 1,
    blankLinesBetweenAttributes: -1,
    maxConsecutiveBlankLines: 2,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
    definitionTypeCasing: "preserve",
    booleanKeywordCasing: "preserve",
    attributeNameCasing: "preserve",
    spaceAroundOperators: true,
    spaceAfterComma: true
};

/** Deep-merges overrides into default rules, validating values. */
export function mergeFormattingRules(overrides: Partial<FormattingRules>): FormattingRules {
    const rules = { ...DEFAULT_FORMATTING_RULES };

    if (overrides.indentDefinitionBody !== undefined) rules.indentDefinitionBody = !!overrides.indentDefinitionBody;
    if (overrides.indentComplexObjectBody !== undefined) rules.indentComplexObjectBody = !!overrides.indentComplexObjectBody;
    if (overrides.indentBlockStatementBody !== undefined) rules.indentBlockStatementBody = !!overrides.indentBlockStatementBody;

    const validSpacings = ["space", "tab", "none"];
    if (overrides.spaceBeforeColon !== undefined && validSpacings.includes(overrides.spaceBeforeColon)) {
        rules.spaceBeforeColon = overrides.spaceBeforeColon;
    }
    if (overrides.spaceAfterColon !== undefined && validSpacings.includes(overrides.spaceAfterColon)) {
        rules.spaceAfterColon = overrides.spaceAfterColon;
    }
    if (overrides.spaceBeforeDefinitionColon !== undefined && validSpacings.includes(overrides.spaceBeforeDefinitionColon)) {
        rules.spaceBeforeDefinitionColon = overrides.spaceBeforeDefinitionColon;
    }
    if (overrides.spaceAfterDefinitionColon !== undefined && validSpacings.includes(overrides.spaceAfterDefinitionColon)) {
        rules.spaceAfterDefinitionColon = overrides.spaceAfterDefinitionColon;
    }

    if (overrides.blankLinesBetweenDefinitions !== undefined && typeof overrides.blankLinesBetweenDefinitions === "number") {
        rules.blankLinesBetweenDefinitions = Math.max(0, overrides.blankLinesBetweenDefinitions);
    }
    if (overrides.blankLinesAfterDefinitionHeader !== undefined && typeof overrides.blankLinesAfterDefinitionHeader === "number") {
        rules.blankLinesAfterDefinitionHeader = Math.max(0, overrides.blankLinesAfterDefinitionHeader);
    }
    if (overrides.blankLinesBetweenAttributes !== undefined && typeof overrides.blankLinesBetweenAttributes === "number") {
        rules.blankLinesBetweenAttributes = Math.max(-1, overrides.blankLinesBetweenAttributes);
    }
    if (overrides.maxConsecutiveBlankLines !== undefined && typeof overrides.maxConsecutiveBlankLines === "number") {
        rules.maxConsecutiveBlankLines = Math.max(0, overrides.maxConsecutiveBlankLines);
    }

    if (overrides.trimTrailingWhitespace !== undefined) rules.trimTrailingWhitespace = !!overrides.trimTrailingWhitespace;
    if (overrides.insertFinalNewline !== undefined) rules.insertFinalNewline = !!overrides.insertFinalNewline;

    const validCasings = ["preserve", "uppercase", "lowercase", "titlecase"];
    if (overrides.definitionTypeCasing !== undefined && validCasings.includes(overrides.definitionTypeCasing)) {
        rules.definitionTypeCasing = overrides.definitionTypeCasing;
    }
    if (overrides.booleanKeywordCasing !== undefined && validCasings.includes(overrides.booleanKeywordCasing)) {
        rules.booleanKeywordCasing = overrides.booleanKeywordCasing;
    }
    if (overrides.attributeNameCasing !== undefined && validCasings.includes(overrides.attributeNameCasing)) {
        rules.attributeNameCasing = overrides.attributeNameCasing;
    }

    if (overrides.spaceAroundOperators !== undefined) rules.spaceAroundOperators = !!overrides.spaceAroundOperators;
    if (overrides.spaceAfterComma !== undefined) rules.spaceAfterComma = !!overrides.spaceAfterComma;

    return rules;
}

/** Helper to convert arbitrary configurations under tallyTDL.formatting.* prefix. */
export function normalizeFormattingRules(raw: Record<string, any>): Partial<FormattingRules> {
    const overrides: Partial<FormattingRules> = {};
    if (!raw) return overrides;

    for (const key of Object.keys(raw)) {
        // Strip prefix if present in key (in case full path keys are used)
        const ruleKey = key.startsWith("tallyTDL.formatting.") 
            ? key.substring("tallyTDL.formatting.".length) 
            : key;
            
        (overrides as any)[ruleKey] = raw[key];
    }
    return overrides;
}
