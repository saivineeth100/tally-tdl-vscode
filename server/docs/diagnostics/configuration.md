# Diagnostics Configuration

The Tally TDL language server provides configurable diagnostic error codes. You can customize the severity of these diagnostics or suppress them entirely using your `settings.json`.

## Fully Disabling Diagnostics

If you want to turn off ALL diagnostics from the Tally TDL language server, you can set `tallyTDL.diagnostics.enable` to `false` in your settings:

```json
{
    "tallyTDL.diagnostics.enable": false
}
```

## Configuring Severity

You can control diagnostic severities using the `tallyTDL.diagnostics.severity` setting. The key is the diagnostic code, and the value is the desired severity. VS Code will provide **autocomplete suggestions** for all available diagnostic codes when you type inside this object.

Allowed severities:
- `error`: Shows as a red underline and appears in the Problems panel as an error.
- `warning`: Shows as a yellow underline and appears in the Problems panel as a warning.
- `information`: Shows as a blue underline and appears in the Problems panel as an info message.
- `hint`: Fades out the code or shows a subtle indication.
- `none`: Silences the diagnostic completely.

### Example configuration in `settings.json`

```json
{
    "tallyTDL.diagnostics.severity": {
        "missing_definition": "error",
        "duplicate_variable_declaration": "warning",
        "unknown_attribute": "none"
    }
}
```

By setting a code to `"none"`, the language server will completely silence that specific diagnostic.
