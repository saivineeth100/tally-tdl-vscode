import { DiagnosticSeverity } from "vscode-languageserver-types";

export const StatementRules = {
    UndefinedVariable: { code: 'TDL4000', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Undefined variable or field '{0}'.", description: "Variable is used without declaration." },
    MissingEndStatement: { code: 'TDL4001', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Missing 'End {0}' statement.", description: "Block is not closed." },
    InvalidLoopStatement: { code: 'TDL4002', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "'{0}' statement outside of loop.", description: "Break/Continue outside loop." },
    InvalidReturn: { code: 'TDL4003', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "'Return' statement outside of Function.", description: "Return only allowed in functions." },
    MissingTargetVariable: { code: 'TDL4004', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Action '{0}' requires a target variable.", description: "Action missing target." },
    InvalidTargetVariable: { code: 'TDL4005', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Invalid target variable for '{0}'.", description: "Target must be a variable." },
    MissingArgument: { code: 'TDL4006', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Action '{0}' requires at least {1} arguments.", description: "Action missing argument." },
    InvalidExchangeArgument: { code: 'TDL4007', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Action 'Exchange' requires variables as arguments.", description: "Exchange arguments must be variables." },
    DuplicateLabel: { code: 'TDL4008', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Duplicate label '{0}'.", description: "Label is already defined." },
    BrokenLabelSeqence: { code: 'TDL4009', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Broken procedural sequence detected. Expected: '{0}'.", description: "Broken sequence" },
    UnknownAction: { code: 'TDL4010', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Unknown action '{0}'.", description: "Action is not recognized." },
    UnknownKeyword: { code: 'TDL4011', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Unknown Keyword '{0}'.", description: "Keyword is not recognized." }
} as const;
