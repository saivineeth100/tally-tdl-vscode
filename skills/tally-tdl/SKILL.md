---
name: tally-tdl
description: Expert knowledge base for Tally Definition Language (TDL). Use this when writing, reading, or analyzing TDL code for Tally ERP/Prime to ensure correct syntax, UI hierarchy, and data definitions.
---

# Tally TDL (Tally Definition Language) Skill

Tally Definition Language (TDL) is the programming language used to customize and extend **Tally ERP/Prime** software. TDL is a definition-based language where UI and business logic are expressed through **Definitions** and their **Attributes**.

## Language Rules and Syntax

TDL has a strict UI hierarchy, specific syntax for variables and scoping, and relies heavily on special symbols (`$`, `$$`, `#`, `##`, `!`, `@@`).

**Important**: For a complete guide on how to write TDL code, read the **[Language Rules and Syntax Guide](LANGUAGE_RULES.md)**. You must follow these rules when writing or generating any TDL.

---

## Reference Documentation (v7.0)

### Definitions (26 groups, 691 entries)

UI and data definitions — the building blocks of TDL customizations.

- [Full Definitions Reference](docs/7.0/definitions/index.md)

| # | Definition | Attributes | Purpose |
|---|-----------|------------|---------|
| 1 | [Border](docs/7.0/definitions/Border.md) | 10 | Defines border styles for UI elements |
| 2 | [Button](docs/7.0/definitions/Button.md) | 37 | Defines buttons with actions, keys, and styles |
| 3 | [Collection](docs/7.0/definitions/Collection.md) | 92 | Defines data collections with filtering, sorting, and aggregation |
| 4 | [Color](docs/7.0/definitions/Color.md) | 9 | Defines custom colors using RGB values |
| 5 | [COM Interface](docs/7.0/definitions/COM%20Interface.md) | 9 | Defines COM interface bindings |
| 6 | [Field](docs/7.0/definitions/Field.md) | 88 | Defines individual data fields with display, validation, and formatting |
| 7 | [Form](docs/7.0/definitions/Form.md) | 76 | Defines forms containing parts, buttons, and controls |
| 8 | [Function](docs/7.0/definitions/Function.md) | 9 | Defines custom TDL functions |
| 9 | [Import File](docs/7.0/definitions/Import%20File.md) | 30 | Defines file import configurations |
| 10 | [Import Object](docs/7.0/definitions/Import%20Object.md) | 11 | Defines object import mappings |
| 11 | [Key Value Map](docs/7.0/definitions/Key%20Value%20Map.md) | 8 | Defines key-value pair mappings |
| 12 | [Line](docs/7.0/definitions/Line.md) | 44 | Defines lines containing fields in a report layout |
| 13 | [Menu](docs/7.0/definitions/Menu.md) | 21 | Defines menus with items, keys, and actions |
| 14 | [Name Set](docs/7.0/definitions/Name%20Set.md) | 6 | Defines named sets for categorization |
| 15 | [Notification](docs/7.0/definitions/Notification.md) | 18 | Defines notification handlers and events |
| 16 | [Object Map](docs/7.0/definitions/Object%20Map.md) | 19 | Defines object mapping operations |
| 17 | [Object](docs/7.0/definitions/Object.md) | 9 | Defines custom objects with methods and storage |
| 18 | [Part](docs/7.0/definitions/Part.md) | 72 | Defines parts containing lines in a form layout |
| 19 | [Progress Bar](docs/7.0/definitions/Progress%20Bar.md) | 9 | Defines progress bar UI elements |
| 20 | [QueryBox](docs/7.0/definitions/QueryBox.md) | 6 | Defines query/dialog boxes |
| 21 | [Report](docs/7.0/definitions/Report.md) | 55 | Defines reports as the top-level UI container |
| 22 | [Resource](docs/7.0/definitions/Resource.md) | 8 | Defines external resources (DLLs, files) |
| 23 | [Rule Set](docs/7.0/definitions/Rule%20Set.md) | 12 | Defines rule sets for conditional logic |
| 24 | [Style](docs/7.0/definitions/Style.md) | 8 | Defines font styles (bold, italic, height, font) |
| 25 | [System](docs/7.0/definitions/System.md) | 10 | System-level definitions (formulas, UDFs, events) |
| 26 | [Variable](docs/7.0/definitions/Variable.md) | 15 | Defines variables with types, defaults, and scope |

### Functions (22 groups, 1140 entries)

Built-in TDL functions organized by category.

- [Full Functions Reference](docs/7.0/functions/index.md)

| # | Category | Description |
|---|----------|-------------|
| 1 | [Amount](docs/7.0/functions/Amount.md) | Amount manipulation and formatting |
| 2 | [Business](docs/7.0/functions/Business.md) | Business logic and accounting functions |
| 3 | [Company Property](docs/7.0/functions/Company%20Property.md) | Company configuration properties |
| 4 | [Date](docs/7.0/functions/Date.md) | Date manipulation and formatting |
| 5 | [DateTime](docs/7.0/functions/DateTime.md) | DateTime operations |
| 6 | [DLL](docs/7.0/functions/DLL.md) | External DLL function calls |
| 7 | [Duration](docs/7.0/functions/Duration.md) | Duration calculations |
| 8 | [Generic](docs/7.0/functions/Generic.md) | General-purpose utility functions |
| 9 | [GUI](docs/7.0/functions/GUI.md) | User interface functions |
| 10 | [Layout](docs/7.0/functions/Layout.md) | Layout and positioning |
| 11 | [License](docs/7.0/functions/License.md) | License information |
| 12 | [Maths](docs/7.0/functions/Maths.md) | Mathematical operations |
| 13 | [Module](docs/7.0/functions/Module.md) | Module management |
| 14 | [Object Collection](docs/7.0/functions/Object%20Collection.md) | Object and collection operations |
| 15 | [ODBC](docs/7.0/functions/ODBC.md) | ODBC database connectivity |
| 16 | [Print](docs/7.0/functions/Print.md) | Print and output functions |
| 17 | [Quantity](docs/7.0/functions/Quantity.md) | Quantity manipulation |
| 18 | [Rate](docs/7.0/functions/Rate.md) | Rate conversion |
| 19 | [String](docs/7.0/functions/String.md) | String manipulation and formatting |
| 20 | [System](docs/7.0/functions/System.md) | System-level functions |
| 21 | [Time](docs/7.0/functions/Time.md) | Time operations |
| 22 | [Variable](docs/7.0/functions/Variable.md) | Variable management functions |

### Actions (8 groups, 353 entries)

Actions that can be triggered from buttons, keys, and event handlers.

- [Full Actions Reference](docs/7.0/actions/index.md)

| # | Scope | Description |
|---|-------|-------------|
| 1 | [Field](docs/7.0/actions/Field.md) | Field-level actions |
| 2 | [Form](docs/7.0/actions/Form.md) | Form-level actions |
| 3 | [Function](docs/7.0/actions/Function.md) | Function call actions |
| 4 | [Line](docs/7.0/actions/Line.md) | Line-level actions |
| 5 | [Menu](docs/7.0/actions/Menu.md) | Menu navigation actions |
| 6 | [Part](docs/7.0/actions/Part.md) | Part-level actions |
| 7 | [Report](docs/7.0/actions/Report.md) | Report-level actions |
| 8 | [System](docs/7.0/actions/System.md) | System-level actions |

### Schemas (479 groups, 1916 entries)

Object schemas defining the structure of Tally's internal data objects.

- [Full Schemas Reference](docs/7.0/schemas/index.md)

---

## For AI Agents

When assisting with TDL code:
1. Always start by reading **[LANGUAGE_RULES.md](LANGUAGE_RULES.md)** to understand the correct syntax, symbols, and hierarchy.
2. Refer to the docs in `docs/{version}/` for valid definitions, functions, actions, and schemas.
3. Each entry has documented parameter types, data types, and whether they are mandatory.
4. For definitions: check `Meta.Type` to understand single/list/dual/triple parameter patterns.
5. For functions: check `Meta.Return Type` and `Meta.Execution Mode`.
6. For actions: check `Meta.Mode` (Edit/Display/Both) and `Meta.Category`.
7. Check `Meta.Aliases` for alternative names of the same item.
8. Use `Refers To` in parameters to understand cross-definition references.
