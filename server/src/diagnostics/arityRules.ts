import { DiagnosticSeverity } from "vscode-languageserver-types";

export const ArityRules = {
    MissingParameters: { 
        code: 'TDL021', 
        defaultSeverity: DiagnosticSeverity.Error, 
        messageFormat: "'{0}' requires at least {1} parameter(s), but {2} were provided", 
        description: "Function or action call has too few parameters." 
    },
    TooManyParameters: { 
        code: 'TDL020', 
        defaultSeverity: DiagnosticSeverity.Warning, 
        messageFormat: "'{0}' accepts at most {1} parameter(s), but {2} were provided", 
        description: "Function or action call has too many parameters." 
    }
} as const;
