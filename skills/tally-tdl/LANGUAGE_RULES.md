# Tally Definition Language (TDL) - Quick Reference

This file serves as the main entry point for TDL language syntax and structure.

## Quick Prefix Cheat Sheet
TDL relies heavily on prefixes to determine context. If you see or need to use these symbols:
- `@` : Local Formula / Expression evaluation. E.g., `Set as: @MyFormula`
- `@@` : System Formula evaluation. E.g., `Set as: @@SystemFormulaName`
- `#` : Modify an existing definition. E.g., `[#Line: DefaultLine]`
- `##` : Read a Variable value. E.g., `If : ##MyVariable = "Yes"`
- `$` : Fetch a Method (Field) from the current Object context. E.g., `Set as: $Name`
- `$$` : Execute a built-in Action or Function. E.g., `Set as: $$String:$Name`

## Detailed Rule Modules
For in-depth syntax rules and guidelines, consult the specific module relevant to your current task:

1. **[Definitions and Modifiers](rules/01_definitions_and_modifiers.md)**
   Read this when creating UI components (Report, Form, Part, Line, Field) or modifying existing default definitions using `#` and `!`.

2. **[Data Types and Expressions](rules/02_data_types_and_expressions.md)**
   Read this when writing formulas, logic, or working with different data types (String, Number, Date, Amount).

3. **[Objects and Collections](rules/03_objects_and_collections.md)**
   Read this when fetching data from the database, creating Reports, or repeating lines over a set of items.

4. **[Actions, Events, and Keys](rules/04_actions_events_keys.md)**
   Read this when making UI interactive, handling button clicks, trapping events (e.g., `On : Form Accept`), or setting up keyboard shortcuts.

5. **[Variables](rules/05_variables.md)**
   Read this when you need to store application state, configure Global vs Local variables, or manipulate values.

6. **[Procedural Capabilities](rules/06_procedural_capabilities.md)**
   Read this when writing custom `[Function: ...]` blocks, loops (`Walk`, `While`), or complex conditional (`If/Else`) logic.

## Reference Documentation
For a complete list of valid properties, attributes, and internal definitions, refer to the generated docs:
- [Definitions Docs](docs/7.0/definitions/index.md)
- [Functions Docs](docs/7.0/functions/index.md)
- [Actions Docs](docs/7.0/actions/index.md)
- [Schemas Docs](docs/7.0/schemas/index.md)
