# Parser Diagnostics

Parser diagnostics are generated during the syntax analysis phase of the TDL document. These represent structural errors in the code.

## Diagnostic Codes

### `syntax_error`
- **Description**: A general syntax error where the token sequence does not match the expected TDL grammar.
- **Common Causes**:
  - Missing brackets or braces
  - Incorrectly formatted modifiers
  - Unexpected keywords or tokens in a statement
- **Default Severity**: Error
