# Statements & Variables Diagnostics

## UndefinedVariable (TDL4000)

**Default Severity:** Warning
**Message Format:** `Undefined variable or field '{0}'.`

### Description
Variable is used without declaration.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4000": "warning"
    }
}
```

## MissingEndStatement (TDL4001)

**Default Severity:** Error
**Message Format:** `Missing 'End {0}' statement.`

### Description
Block is not closed.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4001": "error"
    }
}
```

## InvalidLoopStatement (TDL4002)

**Default Severity:** Error
**Message Format:** `'{0}' statement outside of loop.`

### Description
Break/Continue outside loop.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4002": "error"
    }
}
```

## InvalidReturn (TDL4003)

**Default Severity:** Error
**Message Format:** `'Return' statement outside of Function.`

### Description
Return only allowed in functions.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4003": "error"
    }
}
```

## MissingTargetVariable (TDL4004)

**Default Severity:** Error
**Message Format:** `Action '{0}' requires a target variable.`

### Description
Action missing target.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4004": "error"
    }
}
```

## InvalidTargetVariable (TDL4005)

**Default Severity:** Error
**Message Format:** `Invalid target variable for '{0}'.`

### Description
Target must be a variable.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4005": "error"
    }
}
```

## MissingArgument (TDL4006)

**Default Severity:** Error
**Message Format:** `Action '{0}' requires at least {1} arguments.`

### Description
Action missing argument.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4006": "error"
    }
}
```

## InvalidExchangeArgument (TDL4007)

**Default Severity:** Error
**Message Format:** `Action 'Exchange' requires variables as arguments.`

### Description
Exchange arguments must be variables.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4007": "error"
    }
}
```

## DuplicateLabel (TDL4008)

**Default Severity:** Error
**Message Format:** `Duplicate label '{0}'.`

### Description
Label is already defined.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4008": "error"
    }
}
```

## UnknownAction (TDL4009)

**Default Severity:** Warning
**Message Format:** `Unknown action '{0}'.`

### Description
Action is not recognized.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL4009": "warning"
    }
}
```

