# Definitions & Attributes Diagnostics

## MissingDefinition (TDL2000)

**Default Severity:** Warning
**Message Format:** `Cannot find definition for '{0}'.`

### Description
Referenced definition does not exist.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2000": "warning"
    }
}
```

## DuplicateDefinition (TDL2001)

**Default Severity:** Error
**Message Format:** `Duplicate definition '{0}'.`

### Description
Definition name is already used.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2001": "error"
    }
}
```

## ModifierMissingTarget (TDL2002)

**Default Severity:** Error
**Message Format:** `Modifier cannot find target definition '{0}'.`

### Description
Modifying an undefined target.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2002": "error"
    }
}
```

## UnknownAttribute (TDL2003)

**Default Severity:** Warning
**Message Format:** `Unknown attribute '{0}'.`

### Description
Attribute does not exist on this definition.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2003": "warning"
    }
}
```

## MissingParameters (TDL2004)

**Default Severity:** Warning
**Message Format:** `Attribute '{0}' expects {1} parameters, but got {2}.`

### Description
Missing attribute parameters.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2004": "warning"
    }
}
```

## MissingMandatoryParameter (TDL2005)

**Default Severity:** Error
**Message Format:** `Mandatory parameter '{0}' is missing.`

### Description
Missing a required parameter.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2005": "error"
    }
}
```

## TypeMismatch (TDL2006)

**Default Severity:** Warning
**Message Format:** `Type mismatch: expected {0}, got {1}.`

### Description
Expression evaluates to wrong type.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2006": "warning"
    }
}
```

## InvalidLogicalValue (TDL2007)

**Default Severity:** Warning
**Message Format:** `Invalid logical value '{0}', expected Yes or No.`

### Description
Logical value must be Yes or No.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2007": "warning"
    }
}
```

## DuplicateVariableDeclaration (TDL2008)

**Default Severity:** Error
**Message Format:** `Variable '{0}' is already declared.`

### Description
Duplicate variable declaration.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2008": "error"
    }
}
```

## CircularInclude (TDL2009)

**Default Severity:** Error
**Message Format:** `Circular include detected: {0}`

### Description
Include forms a circular reference.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2009": "error"
    }
}
```

## UnknownDefinitionType (TDL2010)

**Default Severity:** Warning
**Message Format:** `Unknown definition type '{0}'.`

### Description
The definition type is not recognized.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL2010": "warning"
    }
}
```

