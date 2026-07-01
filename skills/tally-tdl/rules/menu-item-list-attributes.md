---
name: "Menu Item List Attributes Syntax"
description: "Documents the special custom syntax for Menu Item List attributes (Item, Key Item) in TDL."
---

# Menu Item List Attributes

In TDL, the `Menu Item List` attribute type (assigned to attributes like `Item` and `Key Item` in `Menu` definitions) does NOT strictly follow the standard attribute parameters defined in metadata (e.g. `Menu.json`).

Instead, they follow a custom syntax where they invoke Actions and pass parameters to those Actions.

## Syntax Format

### Item
```tdl
Item : <Item Name> : <Action> : <Action Parameters>
```
- **Parameter 0 (`<Item Name>`)**: String label for the menu item.
- **Parameter 1 (`<Action>`)**: The action to execute (e.g., `Display`, `Menu`, `Quit`, `Print`).
- **Parameter 2+ (`<Action Parameters>`)**: The arguments expected by the specified `<Action>`. For example, if the action is `Menu`, it expects a Menu definition name.

### Key Item
```tdl
Key Item : <Item Name> : <Hot Key> : <Action> : <Action Parameters>
```
- **Parameter 0 (`<Item Name>`)**: String label for the menu item.
- **Parameter 1 (`<Hot Key>`)**: The shortcut key (String).
- **Parameter 2 (`<Action>`)**: The action to execute.
- **Parameter 3+ (`<Action Parameters>`)**: The arguments expected by the specified `<Action>`.

## Notes for AI Context
- The language server uses custom logic (`getExpectedTypeForMenuItem`) to bypass the standard metadata parameter counts when validating `Menu Item List` attributes.
- When working with completions or semantic tokens, remember that the parameter indices are shifted relative to the action parameter declarations.
- The `Indent` attribute also shares the `Menu Item List` type in metadata but has a simple syntax (`Indent : <Label>`) and does not use this action invocation pattern.
- Unlike most other attributes, `Item` and `Key Item` do NOT treat commas (`,`) as parameter separators. Commas can safely be used within the `<Item Name>` without splitting the expression. Only colons (`:`) act as separators.
