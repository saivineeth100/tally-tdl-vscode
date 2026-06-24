import { DiagnosticSeverity } from "vscode-languageserver-types";

export const AttributeRules = {
    DuplicateDiscreteAttribute: {
        code: 'TDL021', // Note: ArityRules used TDL021 as well, I should use TDL022 to avoid conflict
        defaultSeverity: DiagnosticSeverity.Warning,
        messageFormat: "Discrete attribute '{0}' cannot have repeated value '{1}'",
        description: "Discrete attribute duplicated."
    }
} as const;
