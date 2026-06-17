# Tally TDL Diagnostics

This folder contains documentation for all diagnostic rules.

## [Syntax & Lexical](syntax.md)

| Code | Rule | Default Severity | Description |
|------|------|------------------|-------------|
| [TDL1000](syntax.md#lexicalerror-tdl1000) | LexicalError | Error | Invalid tokenization. |
| [TDL1001](syntax.md#syntaxerror-tdl1001) | SyntaxError | Error | Generic syntax error. |
| [TDL1002](syntax.md#unexpectedtoken-tdl1002) | UnexpectedToken | Error | Parser encountered an unexpected token. |
| [TDL1003](syntax.md#missingexpectedtoken-tdl1003) | MissingExpectedToken | Error | Parser expected a specific token. |
| [TDL1004](syntax.md#invalidmodifiersyntax-tdl1004) | InvalidModifierSyntax | Error | Malformed definition modifier. |
| [TDL1005](syntax.md#malformedattributeassignment-tdl1005) | MalformedAttributeAssignment | Error | Attribute assignment syntax is invalid. |

## [Definitions & Attributes](definitions.md)

| Code | Rule | Default Severity | Description |
|------|------|------------------|-------------|
| [TDL2000](definitions.md#missingdefinition-tdl2000) | MissingDefinition | Warning | Referenced definition does not exist. |
| [TDL2001](definitions.md#duplicatedefinition-tdl2001) | DuplicateDefinition | Error | Definition name is already used. |
| [TDL2002](definitions.md#modifiermissingtarget-tdl2002) | ModifierMissingTarget | Error | Modifying an undefined target. |
| [TDL2003](definitions.md#unknownattribute-tdl2003) | UnknownAttribute | Warning | Attribute does not exist on this definition. |
| [TDL2004](definitions.md#missingparameters-tdl2004) | MissingParameters | Warning | Missing attribute parameters. |
| [TDL2005](definitions.md#missingmandatoryparameter-tdl2005) | MissingMandatoryParameter | Error | Missing a required parameter. |
| [TDL2006](definitions.md#typemismatch-tdl2006) | TypeMismatch | Warning | Expression evaluates to wrong type. |
| [TDL2007](definitions.md#invalidlogicalvalue-tdl2007) | InvalidLogicalValue | Warning | Logical value must be Yes or No. |
| [TDL2008](definitions.md#duplicatevariabledeclaration-tdl2008) | DuplicateVariableDeclaration | Error | Duplicate variable declaration. |
| [TDL2009](definitions.md#circularinclude-tdl2009) | CircularInclude | Error | Include forms a circular reference. |
| [TDL2010](definitions.md#unknowndefinitiontype-tdl2010) | UnknownDefinitionType | Warning | The definition type is not recognized. |

## [Schema & Objects](schema.md)

| Code | Rule | Default Severity | Description |
|------|------|------------------|-------------|
| [TDL3000](schema.md#unknownschemaproperty-tdl3000) | UnknownSchemaProperty | Warning | Schema property is invalid. |
| [TDL3001](schema.md#invalidinnertag-tdl3001) | InvalidInnerTag | Warning | Inner tag not allowed here. |
| [TDL3002](schema.md#invalidsystemattributeusage-tdl3002) | InvalidSystemAttributeUsage | Warning | System attribute used incorrectly. |

## [Statements & Variables](statements.md)

| Code | Rule | Default Severity | Description |
|------|------|------------------|-------------|
| [TDL4000](statements.md#undefinedvariable-tdl4000) | UndefinedVariable | Warning | Variable is used without declaration. |
| [TDL4001](statements.md#missingendstatement-tdl4001) | MissingEndStatement | Error | Block is not closed. |
| [TDL4002](statements.md#invalidloopstatement-tdl4002) | InvalidLoopStatement | Error | Break/Continue outside loop. |
| [TDL4003](statements.md#invalidreturn-tdl4003) | InvalidReturn | Error | Return only allowed in functions. |
| [TDL4004](statements.md#missingtargetvariable-tdl4004) | MissingTargetVariable | Error | Action missing target. |
| [TDL4005](statements.md#invalidtargetvariable-tdl4005) | InvalidTargetVariable | Error | Target must be a variable. |
| [TDL4006](statements.md#missingargument-tdl4006) | MissingArgument | Error | Action missing argument. |
| [TDL4007](statements.md#invalidexchangeargument-tdl4007) | InvalidExchangeArgument | Error | Exchange arguments must be variables. |
| [TDL4008](statements.md#duplicatelabel-tdl4008) | DuplicateLabel | Error | Label is already defined. |
| [TDL4009](statements.md#unknownaction-tdl4009) | UnknownAction | Warning | Action is not recognized. |

