# Syntax & Lexical Diagnostics

## LexicalError (TDL1000)

**Default Severity:** Error
**Message Format:** `Lexical error: {0}`

### Description
Invalid tokenization.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL1000": "error"
    }
}
```

## SyntaxError (TDL1001)

**Default Severity:** Error
**Message Format:** `Syntax error: {0}`

### Description
Generic syntax error.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL1001": "error"
    }
}
```

## UnexpectedToken (TDL1002)

**Default Severity:** Error
**Message Format:** `Unexpected token '{0}'.`

### Description
Parser encountered an unexpected token.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL1002": "error"
    }
}
```

## MissingExpectedToken (TDL1003)

**Default Severity:** Error
**Message Format:** `Missing expected token: '{0}'.`

### Description
Parser expected a specific token.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL1003": "error"
    }
}
```

## InvalidModifierSyntax (TDL1004)

**Default Severity:** Error
**Message Format:** `Invalid modifier syntax.`

### Description
Malformed definition modifier.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL1004": "error"
    }
}
```

## MalformedAttributeAssignment (TDL1005)

**Default Severity:** Error
**Message Format:** `Malformed attribute assignment.`

### Description
Attribute assignment syntax is invalid.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL1005": "error"
    }
}
```

