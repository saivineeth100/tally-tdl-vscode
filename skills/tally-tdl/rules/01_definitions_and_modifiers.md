# Definitions, Attributes, and Modifiers in TDL

## 1. Introduction

Tally Definition Language (TDL) is an object-oriented, action-driven language utilized to build and customize TallyPrime. The language's architecture is fundamentally driven by three core components: **Definitions**, **Attributes**, and **Modifiers**. Understanding these structural elements is essential to developing efficient, reusable, and maintainable TDL code.

This document comprehensively outlines the syntax, rules, and variations of these components, providing deep insights into building customized Tally solutions.

---

## 2. Definitions

A **Definition** is the primary building block of TDL. Everything in TDL—from a user interface screen to a variable—is a definition. It defines the type of object and assigns a unique identifier to it.

### 2.1 Syntax
```tdl
[<Definition Type> : <Definition Name>]
```

### 2.2 Characteristics and Rules
- **Uniqueness**: Every definition must have a unique name within its specific Definition Type.
- **Enclosure**: Definitions must always be enclosed in square brackets `[ ]`.
- **Case and Space Insensitive**: TDL ignores case and spaces in definition names. `[Menu: Gateway of Tally]` is the same as `[Menu: GatewayOfTally]`.
- **Naming Restrictions**:
  - Cannot start with a numerical digit.
  - Cannot use TDL reserved keywords.
  - Cannot redefine default Tally definitions without a modifier.

### 2.3 Categories of Definitions

TDL definitions are broadly categorized into the following distinct functional groups:

1. **Interface Definitions**: Dictate the visual layout and user interactions.
   - `Menu`, `Report`, `Form`, `Part`, `Line`, `Field`, `Button`, `Resource`.
2. **Data Definitions**: Dictate data structure, storage, and retrieval.
   - `Collection`, `Object`, `Variable`.
3. **Formatting Definitions**: Govern aesthetics and presentation.
   - `Border`, `Color`, `Style`.
4. **Procedural/Action Definitions**: Define programmatic logic and execution.
   - `Function`, `Key`.
5. **Integration Definitions**: Handle data import/export.
   - `Import Object`, `Import File`.

### 2.4 Example of a Basic Interface Hierarchy
```tdl
[Report : My Custom Report]
  Form : My Custom Form

[Form : My Custom Form]
  Part : My Custom Part

[Part : My Custom Part]
  Line : My Custom Line

[Line : My Custom Line]
  Field : My Custom Field

[Field : My Custom Field]
  Set as : "Hello, World!"
```

---

## 3. Attributes

**Attributes** are properties assigned to Definitions. They dictate the behavior, appearance, and functionality of the definition they belong to.

### 3.1 Structure
```tdl
<Attribute Name> : <Value>
```

### 3.2 Types of Attributes

1. **Primary Attributes**: The core keyword (e.g., `Width : 100% Page`).
2. **Sub-Attributes**: Some attributes accept multiple values mapped to internal sub-properties. They are separated by colons.
   ```tdl
   Border : Thin Box : Bottom
   ```
   *(Here, `Thin Box` and `Bottom` are sub-attributes defining the border style and position).*
3. **List Attributes**: Attributes that accept a comma-separated list of values.
   ```tdl
   Add : Line : Line 1, Line 2, Line 3
   ```

### 3.3 Attribute Classification
Attributes are specific to the Definition Type. For example:
- **Field Attributes**: `Set as`, `Width`, `Type`, `Format`, `Align`.
- **Form Attributes**: `Part`, `Space Top`, `Space Bottom`, `Background`.
- **Collection Attributes**: `Type`, `Source`, `Fetch`, `Compute`.

---

## 4. Modifiers

**Modifiers** represent the true power of TDL. They allow developers to alter, extend, or override existing definitions and attributes without having to rewrite the entire source code. This enforces high reusability and modularity.

### 4.1 Definition Modifiers

To modify an existing definition (either default Tally definitions or previously defined user definitions), the `#` symbol is prefixed to the Definition Type.

```tdl
[#Menu : Gateway of Tally]
  Add : Item : Custom Module : Display : My Custom Report
```

**Definition Modifier Symbols:**
- `[ ... ]` : Standard User-Defined Definition.
- `[# ... ]` : Modify an existing Definition.
- `[! ... ]` : System/Optional Definition (commonly used alongside `Option` modifiers).
- `[* ... ]` : Override/Replace an existing definition entirely.

### 4.2 Attribute Modifiers (Action Modifiers)

When modifying an existing definition, you often want to add, remove, or replace specific elements within lists (like a list of lines in a part). 

#### 4.2.1 `Add`
Appends a new value to an existing attribute list. Can take positional parameters: `Before`, `After`, `At Beginning`, `At End`.
```tdl
[#Part : VCH Header]
  Add : Line : My New Header Line                            ;; Defaults to At End
  Add : Line : Before : VCH Date : My Custom Date Line
```

#### 4.2.2 `Delete`
Removes a specific value from a definition.
```tdl
[#Menu : Gateway of Tally]
  Delete : Item : Quit
```

#### 4.2.3 `Replace`
Replaces an existing value with a new one.
```tdl
[#Line : VCH Narration]
  Replace : Field : VCH Narr Prompt : My Custom Narr Prompt
```

### 4.3 Structural Modifiers

#### 4.3.1 `Use`
The `Use` modifier is utilized to inherit all attributes from an existing definition of the same type. This behaves like class inheritance in OOP.
```tdl
[Field : My Base Field]
  Width : 20
  Type  : String
  Align : Left

[Field : My Derived Field]
  Use   : My Base Field
  Color : Red  ;; Inherits everything from Base Field and overrides Color
```

#### 4.3.2 `Local`
The `Local` modifier allows you to change an attribute of a lower-level definition from a higher-level definition, without affecting the lower-level definition globally.
**Syntax**: `Local : <Definition Type> : <Definition Name> : <Attribute> : <Value>`

```tdl
[Form : My Report Form]
  Use   : Default Report Form
  ;; Changes the color of 'Name Field' only within 'My Report Form'
  Local : Field : Name Field : Color : Blue 
```

### 4.4 Conditional Modifiers: `Option` and `Switch`

These modifiers allow dynamic alteration of definitions based on logical conditions at runtime.

#### 4.4.1 `Option`
Evaluates a single condition. If `True`, the execution shifts to the target optional definition.
```tdl
[Field : Ledger Balance]
  Set as : $ClosingBalance
  Option : Dr Balance Field : $$IsDr:$ClosingBalance
  Option : Cr Balance Field : $$IsCr:$ClosingBalance

[!Field : Dr Balance Field]
  Color : Red

[!Field : Cr Balance Field]
  Color : Green
```

#### 4.4.2 `Switch`
Evaluates a list of options sequentially. The execution shifts to the first option that evaluates to `True`, and subsequent options are ignored.
```tdl
[Field : Voucher Type Field]
  Switch : Sales Field    : $$IsSales:$VoucherTypeName
  Switch : Purchase Field : $$IsPurchase:$VoucherTypeName
  Switch : Default Field  : True
```

---

## 5. Edge Cases and Best Practices

1. **Order of Execution**: Modifiers execute sequentially based on the order they are loaded. If multiple TDL files modify the same element (e.g., `[#Menu: Gateway of Tally]`), the last loaded modification takes precedence.
2. **Overuse of `Local`**: While `Local` is powerful, overusing it deeply down a hierarchy (e.g., a Form changing a Field inside a Part inside a Line) can degrade performance. It is recommended to use `Option` if the modification relies on data-driven states.
3. **Redefinition vs. Modification**: Avoid using `[*Definition]` unless absolutely necessary. Completely overriding a default definition can cause compatibility issues with other add-ons. Always prefer `[#Definition]` with `Add`, `Replace`, or `Delete`.
4. **Space Sensitivity in Sub-Attributes**: When using colons `:` for sub-attributes, Tally ignores surrounding spaces, but ensuring uniform spacing (e.g., `Add : Line : MyLine`) significantly improves code readability.
