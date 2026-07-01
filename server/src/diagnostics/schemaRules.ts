import { DiagnosticSeverity } from "vscode-languageserver-types";

export const SchemaRules = {
    UnknownSchemaProperty: { code: 'TDL3000', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Unknown schema property '{0}'.", description: "Schema property is invalid." },
    InvalidInnerTag: { code: 'TDL3001', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Invalid inner tag '{0}'.", description: "Inner tag not allowed here." },
    InvalidSystemAttributeUsage: { code: 'TDL3002', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "System attribute '{0}' is invalid here.", description: "System attribute used incorrectly." }} as const;
