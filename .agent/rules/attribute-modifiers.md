# Attribute Modifiers in TDL

## Core Modifiers
TDL supports deep structural modifications using the following modifier keywords:
- `Add`
- `Replace`
- `Delete`
- `Local`

## Syntax and Structure
Modifiers can be used in a chain to access nested structural elements (like Form -> Part -> Line -> Field) before applying the modification.

**Format:**
`<Modifier> : <Target Definition Type> : <Target Definition Name> : <Next Target Type> : <Next Target Name> : ... : <Target Attribute> : <Value>`

**Position Modifiers:**
The `Add` and `Local -> Add` modifiers can optionally accept a position modifier to specify exactly where the new element should be inserted. Valid position modifiers are:
- `Before`
- `After`
- `At Beginning`
- `At End`

**Format with Position:**
`<Modifier> : <Target Type> : <Position Modifier> : <Reference Target Name> : <New Target Name>`

## Rules for Code Generation & Analysis
1. **Dynamic Resolution:** Modifier keywords (`Add`, `Replace`, `Delete`, `Local`) can appear at any valid point in the chain, not just at the start. For example, `Local : Form : SV Output Medium : Add : Part : Before : Top Part : MyPart` is valid.
2. **Order of Execution:** When processing or evaluating attributes in a definition, `Add`, `Replace`, and `Delete` must be evaluated **after** all regular attributes to ensure the base structure exists before modifications are applied.
3. **Semantic Highlighting:** Modifier keywords and Position keywords should be highlighted semantically (as `macro` or `keyword`) inside IDE extensions to differentiate them from standard Definition Types or Names.
4. **Validation:** Modifier chains must be structurally validated to ensure the target definition types can legally contain the nested definition names.
5. **Completions:** Auto-completion logic must contextually suggest modifier keywords, position modifiers, and valid attributes for the target scope depending on the depth of the modifier chain.
