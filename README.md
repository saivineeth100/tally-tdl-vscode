# Tally TDL

A Visual Studio Code extension providing rich language support for **Tally Definition Language (TDL)**.

## Features

-   **Auto-Completion**: Context-aware suggestions for Definitions (`[Report]`), Attributes (`Title`), and built-in Functions (`$$SysName`).
-   **Validation**: Real-time diagnostics for syntax errors, semantic issues (e.g., Duplicate Definitions), and expression type-checking.
-   **Navigation**: Go to Definition (F12) support for symbols.
-   **Smart Suggestions**: Integrates **Default TDL** definitions (standard Reports, Forms) into completions.
-   **Run Current File**: One-click play button in the editor title bar to instantly launch Tally with the active TDL file.
-   **Interactive Onboarding**: VS Code Walkthrough to help you instantly locate your Tally installation (including currently running apps) and configure the ODBC port.
-   **Enhanced XML Support**: 
    - Intelligent, context-aware suggestions for primary Tally XML schema tags.
    - Smart auto-complete snippets that automatically structure simple repeating properties with `.LIST` wrappers.
    - Deep structural validation for nested schema objects and attributes.
    - Strict data-type checking for logical values (`Yes`/`No`/`True`/`False`/`On`/`Off`) across both TDL and XML.
-   **Copilot Chat Integration**: Injects an expert Tally TDL knowledge base directly into GitHub Copilot Chat via VS Code Chat Skills, giving the AI deep context on TDL syntax rules, definitions, functions, actions, and data schemas!

## Requirements

No special requirements. Just open a folder or workspace containing `.tdl` or `.tdlxml` files.

## Extension Settings

This extension contributes the following settings (which can be configured at the Global or Workspace level):

* `tallyTDL.tallyExePath`: Path to the Tally executable. Can be set quickly via the **Welcome Walkthrough**. (default: `C:\Program Files\TallyPrime\tally.exe`)
* `tallyTDL.tallyPort`: Port number configured for Tally XML/JSON requests. Can be configured via the Walkthrough. (default: `9000`)
* `tallyTDL.tallyCommandLineArgs`: Additional command line arguments to pass to Tally. The `/TDL` and file path arguments are added automatically. Use `${file}` as a placeholder for the current file path if needed elsewhere. (default: `[]`)

## Getting Started

1. Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and type **Welcome: Open Walkthrough...**
2. Select **Tally TDL Development Getting Started**.
3. Follow the steps to automatically detect your Tally application and open its ODBC port!

## Documentation

For detailed documentation, guides, and feature requests, please visit our [GitHub Repository](https://github.com/saivineeth100/tally-tdl-vscode).

## Known Issues

Please report any issues or feature requests on the [GitHub Issue Tracker](https://github.com/saivineeth100/tally-tdl-vscode/issues).

## Contributing

We welcome contributions! Please visit the [GitHub Repository](https://github.com/saivineeth100/tally-tdl-vscode) to learn more.
