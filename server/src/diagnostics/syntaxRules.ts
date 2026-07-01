import { DiagnosticSeverity } from "vscode-languageserver-types";

export const SyntaxRules = {
    LexicalError: { code: 'TDL1000', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Lexical error: {0}", description: "Invalid tokenization." },
    SyntaxError: { code: 'TDL1001', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Syntax error: {0}", description: "Generic syntax error." },
    UnexpectedToken: { code: 'TDL1002', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Unexpected token '{0}'.", description: "Parser encountered an unexpected token." },
    MissingExpectedToken: { code: 'TDL1003', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Missing expected token: '{0}'.", description: "Parser expected a specific token." },
    InvalidModifierSyntax: { code: 'TDL1004', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Invalid modifier syntax.", description: "Malformed definition modifier." },
    MalformedAttributeAssignment: { code: 'TDL1005', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Malformed attribute assignment.", description: "Attribute assignment syntax is invalid." }} as const;
