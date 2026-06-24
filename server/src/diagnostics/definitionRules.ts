import { DiagnosticSeverity } from "vscode-languageserver-types";

export const DefinitionRules = {
    MissingDefinition: { code: 'TDL2000', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Cannot find {1} definition for '{0}'.", description: "Referenced definition does not exist." },
    DuplicateDefinition: { code: 'TDL2001', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Duplicate definition '{0}'.", description: "Definition name is already used." },
    ModifierMissingTarget: { code: 'TDL2002', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Modifier cannot find target definition '{0}'.", description: "Modifying an undefined target." },
    UnknownAttribute: { code: 'TDL2003', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Unknown attribute '{0}'.", description: "Attribute does not exist on this definition." },
    MissingParameters: { code: 'TDL2004', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Attribute '{0}' expects {1} parameters, but got {2}.", description: "Missing attribute parameters." },
    MissingMandatoryParameter: { code: 'TDL2005', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Mandatory parameter '{0}' is missing.", description: "Missing a required parameter." },
    TypeMismatch: { code: 'TDL2006', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Type mismatch: expected {0}, got {1}.", description: "Expression evaluates to wrong type." },
    InvalidLogicalValue: { code: 'TDL2007', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Invalid logical value '{0}', expected Yes or No.", description: "Logical value must be Yes or No." },
    DuplicateVariableDeclaration: { code: 'TDL2008', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Variable '{0}' is already declared.", description: "Duplicate variable declaration." },
    CircularInclude: { code: 'TDL2009', defaultSeverity: DiagnosticSeverity.Error, messageFormat: "Circular include detected: {0}", description: "Include forms a circular reference." },
    UnknownDefinitionType: { code: 'TDL2010', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Unknown definition type '{0}'.", description: "The definition type is not recognized." },
    InvalidKeyword: { code: 'TDL2011', defaultSeverity: DiagnosticSeverity.Warning, messageFormat: "Invalid keyword '{0}'. Expected one of: {1}.", description: "Keyword is invalid." },
} as const;
