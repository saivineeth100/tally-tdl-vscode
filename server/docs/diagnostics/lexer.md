# Lexical Diagnostics

Lexical diagnostics are generated during the tokenization phase of the TDL document. These typically represent invalid characters or malformed tokens.

## Diagnostic Codes

### `lexical_error`
- **Description**: A generic tokenization error. This occurs when the lexer encounters characters or sequences it cannot recognize as a valid TDL token.
- **Common Causes**:
  - Unclosed strings (e.g., `"missing closing quote`)
  - Invalid characters in identifiers
  - Malformed multiline comments
- **Default Severity**: Error
