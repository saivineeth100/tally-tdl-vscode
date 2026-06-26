# Tally TDL Features Matrix

## Index
- [IntelliSense and Auto-Completion](#intellisense-and-auto-completion)
- [Validation and Diagnostics](#validation-and-diagnostics)
- [Navigation and Discovery](#navigation-and-discovery)
- [Execution and Interactivity](#execution-and-interactivity)
- [Developer Experience](#developer-experience)
- [Pending Features](#pending-features)

## IntelliSense and Auto-Completion

| Feature Name | Description | Status |
| :--- | :--- | :--- |
| Definition Type & Name Suggestions | Context-aware auto-completion for new definition types (e.g., `[Report]`, `[Menu]`) and new definition names across all types. | Completed |
| Modifier Suggestions | When modifying existing definitions (`#` or `!`), intelligently restricts suggestions to valid definition types and only existing definition names. | Completed |
| Attribute Name Suggestions | Provides context-aware suggestions for attribute names based on the current definition type. | Completed |
| Attribute Hover Descriptions | Displays informative documentation and descriptions when hovering over attributes. | Completed |
| Target-Aware Argument Suggestions | Automatically suggests valid definition names for attribute arguments based on the expected target type (e.g., `Use: <name>` only suggests existing Report definitions). | Completed |
| Local Scope IntelliSense | Context-aware suggestions for local definitions and attributes specific to the current scope. | Completed |
| Built-in Function & Action Suggestions | Auto-completes standard built-in functions (e.g., `$$SysName`) and system actions. | Completed |
| Local Field Suggestions | Context-aware auto-completion for local fields using the `#` symbol. | Completed |
| Local Formula Suggestions | Context-aware auto-completion for local formulas using the `@` symbol. | Completed |
| Global Formula Suggestions | Context-aware auto-completion for global system formulas using the `@@` symbol. | Completed |
| Default TDL Definitions | Integrates standard Tally definitions (Reports, Forms) into completions. | Completed |
| TDL Snippets | Included snippets for common TDL patterns. | Completed |

## Validation and Diagnostics

| Feature Name | Description | Status |
| :--- | :--- | :--- |
| Syntax Validation | Real-time diagnostics for syntax errors within TDL files. | Completed |
| Semantic Validation | Checks for semantic issues like duplicate definitions. | Completed |
| Target Definition Validation | Validates that definition names referenced in attributes actually exist and match the expected target definition type. | Completed |
| Expression Type-Checking | Validates types within expressions for correctness. | Completed |
| Data-Type Checking | Strict type checking for logical values (`Yes`/`No`/`True`/`False`/`On`/`Off`) across TDL. | Completed |
| Function Label Sequence Validation | Detects and warns if function statement labels are out of numerical order. | Completed |
| Control Block Validation | Validates proper opening and closing of procedural blocks (e.g., `IF`/`ENDIF`, `WHILE`/`ENDWHILE`, `WALK`/`ENDWALK`). | Completed |

## Navigation and Discovery

| Feature Name | Description | Status |
| :--- | :--- | :--- |
| Go to Definition | Navigate directly to the original definition of a symbol (e.g., jumping to a Report definition from a `Use` attribute) using F12. | Completed |
| Find All References | Find all usages and references of a specific definition across the codebase (Shift+F12). | Completed |
| Code Lens | In-editor contextual information and actions (like reference counts) displayed directly above definition blocks. | Completed |
| Scope Tree | Command to show the scope tree for structural overview. | Completed |

## Execution and Interactivity

| Feature Name | Description | Status |
| :--- | :--- | :--- |
| Run Current File | One-click play button in the editor title bar to launch Tally with the active TDL file. | Completed |
| Convert to XML | Command to convert TDL definitions to XML. | Completed |

## Developer Experience

| Feature Name | Description | Status |
| :--- | :--- | :--- |
| Format on Type | Code formatting happens automatically while typing in TDL files. | Completed |
| Function Auto-Labeling | Automatically assigns sequential numerical labels to function statements. | Completed |
| Copilot Integration | Custom Chat Skill that injects Tally TDL knowledge into GitHub Copilot Chat for syntax and functions assistance. | Completed |
| Walkthrough Onboarding | Interactive VS Code Walkthrough to locate Tally installation automatically. | Completed |

## Pending Features

| Feature Name | Description | Status |
| :--- | :--- | :--- |
| Extended Definition Attributes | Attribute arguments validation, suggestions, and highlighting for `Menu`, `Object`, `Object Map`, and other remaining types. (Note: These deep features are currently fully supported for `Report`, `Form`, `Part`, `Line`, `Field`, `Collection`, `Function`, and `System:Formulae`). | Pending |
| Collection Scope Resolution | Context-aware scope resolution within collections (e.g., `Fields`, `Walk` loops). | Pending |
