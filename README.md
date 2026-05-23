# Tally TDL

A Visual Studio Code extension providing rich language support for **Tally Definition Language (TDL)**.

## Features

-   **Auto-Completion**: Context-aware suggestions for Definitions (`[Report]`), Attributes (`Title`), and built-in Functions (`$$SysName`).
-   **Validation**: Real-time diagnostics for syntax errors, semantic issues (e.g., Duplicate Definitions), and expression type-checking.
-   **Navigation**: Go to Definition (F12) support for symbols.
-   **Smart Suggestions**: Integrates **Default TDL** definitions (standard Reports, Forms) into completions.
-   **Run Current File**: One-click play button in the editor title bar to instantly launch Tally with the active TDL file.
-   **Enhanced XML Support**: 
    - Intelligent, context-aware suggestions for primary Tally XML schema tags.
    - Smart auto-complete snippets that automatically structure simple repeating properties with `.LIST` wrappers.
    - Deep structural validation for nested schema objects and attributes.
    - Strict data-type checking for logical values (`Yes`/`No`/`True`/`False`/`On`/`Off`) across both TDL and XML.

## Requirements

No special requirements. Just open a folder or workspace containing `.tdl` or `.tdlxml` files.

## Extension Settings

This extension contributes the following settings:

* `tallyTDL.trace.server`: Traces the communication between VS Code and the language server. Options: `off`, `messages`, `verbose` (default: `off`).
* `tallyTDL.tallyExePath`: Path to the Tally executable. (default: `C:\Program Files\TallyPrime\tally.exe`)
* `tallyTDL.tallyCommandLineArgs`: Additional command line arguments to pass to Tally. The `/TDL` and file path arguments are added automatically. Use `${file}` as a placeholder for the current file path if needed elsewhere. (default: `[]`)

## Documentation

For detailed documentation, guides, and feature requests, please visit our [GitHub Repository](https://github.com/saivineeth/tally-tdl).

## Known Issues

Please report any issues or feature requests on the [GitHub Issue Tracker](https://github.com/saivineeth/tally-tdl/issues).

## Contributing

We welcome contributions! Please visit the [GitHub Repository](https://github.com/saivineeth/tally-tdl) to learn more.
