# Semantic Validation Diagnostics

Validation diagnostics are produced during the semantic analysis of the parsed TDL document. These verify that the structures conform to TDL rules, metadata definitions, and variable scoping.

## Definition & Attribute Validation

### `missing_definition`
- **Description**: An identifier referenced a definition that does not exist in the workspace or default TDL.
- **Default Severity**: Warning

### `duplicate_definition`
- **Description**: A definition name is already used. In TDL, you can modify an existing definition but you cannot redeclare it from scratch in the same workspace unless using the `!` modifier.
- **Default Severity**: Error

### `modifier_missing_target`
- **Description**: A definition is marked with a modifier (like `#` or `!`), but the target definition was not found.
- **Default Severity**: Error

### `circular_include`
- **Description**: An `Include` or `Import` statement creates a circular loop (e.g., File A includes File B, which includes File A).
- **Default Severity**: Error

### `unknown_attribute`
- **Description**: The attribute used is not valid for the current definition type based on the loaded TDL schema metadata.
- **Default Severity**: Warning

### `unknown_schema_property`
- **Description**: The property is not valid for the complex schema object (e.g., inside an XML payload or deep schema definition).
- **Default Severity**: Warning

### `duplicate_variable_declaration`
- **Description**: A variable is declared more than once in the same definition (e.g., using `Variable : x` twice).
- **Default Severity**: Error

### `missing_parameters`
- **Description**: An attribute expects a certain number of parameters, but fewer were provided.
- **Default Severity**: Warning

### `missing_mandatory_parameter`
- **Description**: A required parameter position was left empty for a given attribute.
- **Default Severity**: Error

### `type_mismatch`
- **Description**: The provided expression evaluates to a datatype that does not match the expected datatype for that parameter.
- **Default Severity**: Warning

### `invalid_logical_value`
- **Description**: A logical parameter expected `Yes` or `No`, but received an invalid string.
- **Default Severity**: Warning

### `invalid_inner_tag`
- **Description**: Found an invalid inner tag within a complex schema definition.
- **Default Severity**: Warning

### `invalid_system_attribute_usage`
- **Description**: A system attribute (like `VCHTYPE` or `OBJVIEW`) was used on a schema that does not support it.
- **Default Severity**: Warning

## Statement & Variable Validation

### `undefined_variable`
- **Description**: A variable or field identifier starting with `#` or `##` was referenced but was not defined in the current scope.
- **Default Severity**: Warning

### `missing_end_statement`
- **Description**: A block statement (like `If`, `While`, `Walk`, `For`) is missing its required end statement (e.g., `End If`, `End While`).
- **Default Severity**: Error

### `invalid_loop_statement`
- **Description**: A `Break` or `Continue` statement was used outside of a loop structure.
- **Default Severity**: Error

### `invalid_return`
- **Description**: A `Return` statement was used outside of a Function definition.
- **Default Severity**: Error

### `missing_target_variable`
- **Description**: An action statement like `Set`, `Exchange`, `Increment`, or `Decrement` requires at least a target variable to operate on.
- **Default Severity**: Error

### `invalid_target_variable`
- **Description**: The first argument of an action statement must be a valid variable or field reference.
- **Default Severity**: Error

### `missing_argument`
- **Description**: Actions like `Set` or `Exchange` require at least two arguments.
- **Default Severity**: Error

### `invalid_exchange_argument`
- **Description**: Both arguments of the `Exchange` action must be valid variable or field references.
- **Default Severity**: Error

### `duplicate_label`
- **Description**: The same label was defined more than once in a block of statements.
- **Default Severity**: Error

### `unknown_action`
- **Description**: The specified statement action does not exist in the TDL action library.
- **Default Severity**: Warning
