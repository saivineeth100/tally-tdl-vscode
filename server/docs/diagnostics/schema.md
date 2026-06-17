# Schema & Objects Diagnostics

## UnknownSchemaProperty (TDL3000)

**Default Severity:** Warning
**Message Format:** `Unknown schema property '{0}'.`

### Description
Schema property is invalid.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL3000": "warning"
    }
}
```

## InvalidInnerTag (TDL3001)

**Default Severity:** Warning
**Message Format:** `Invalid inner tag '{0}'.`

### Description
Inner tag not allowed here.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL3001": "warning"
    }
}
```

## InvalidSystemAttributeUsage (TDL3002)

**Default Severity:** Warning
**Message Format:** `System attribute '{0}' is invalid here.`

### Description
System attribute used incorrectly.

### Configuration
This diagnostic's severity can be configured in your `settings.json`.
You can change it to `"error"`, `"warning"`, `"information"`, `"hint"`, or `"none"`.

```json
{
    "tallyTDL.diagnostics.severity": {
        "TDL3002": "warning"
    }
}
```

