import { DiagnosticSeverity } from "vscode-languageserver-types";

export const SchemaRules = {
    UnknownSchemaProperty: { code: 'TDL3000', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Unknown schema property '{0}'.", description: "Schema property is invalid." },
    InvalidInnerTag: { code: 'TDL3001', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Invalid inner tag '{0}'.", description: "Inner tag not allowed here." },
    InvalidSystemAttributeUsage: { code: 'TDL3002', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "System attribute '{0}' is invalid here.", description: "System attribute used incorrectly." },
    UnknownSchemaWarning: { code: 'TDL3003', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Unknown schema type '{0}'.", description: "Schema is not recognized." },
    UnknownPropertyWarning: { code: 'TDL3004', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Unknown property '{0}' in schema '{1}'.", description: "Property does not exist in schema." },
    IndexOnNonRepeatedWarning: { code: 'TDL3005', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Collection index is only allowed on repeated properties. '{0}' is not repeated.", description: "Cannot use index on non-repeated property." }
} as const;
