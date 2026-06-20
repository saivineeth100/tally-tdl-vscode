import { DiagnosticSeverity } from "vscode-languageserver-types";

export const AttributeRules = {
    DuplicateDiscreteAttribute: {
        code: 'TDL021', // Note: ArityRules used TDL021 as well, I should use TDL022 to avoid conflict
        defaultSeverity: DiagnosticSeverity.Warning,
        messageFormat: "Attribute '{0}' is discrete and should only appear once in a definition",
        description: "Discrete attribute duplicated."
    }
} as const;
