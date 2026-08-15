# Column-Alignment of Colons — Detailed Plan

> **Status**: Deferred from v1 formatting rules. To be implemented as a follow-up.
> **Prerequisite**: ✅ Configurable formatting rules (v1) — **DONE**. 14 settings under `tallyTDL.formatting.*` are in place.
> **Related**: AST-aware Enter key indentation (onTypeFormatting enhancement) — **In Planning**.

## Overview

Tally's official TDL samples use tab-padding before colons to align them vertically within a definition block. This creates a clean, readable layout:

```tdl
[Report: Simple Trial Balance]
    Form        : Simple Trial balance
    Title       : "Trial Balance"
    Variable    : MyStkGroupName
```

Instead of the default single-space formatting:

```tdl
[Report: Simple Trial Balance]
    Form : Simple Trial balance
    Title : "Trial Balance"
    Variable : MyStkGroupName
```

This is a more complex feature because it requires **measuring all attribute key widths within a definition** before deciding how to pad any individual attribute.

## Configuration Schema

Add these settings to `FormattingRules` in [formattingRules.ts](file:///z:/SourceCode/OpenSource/tally-tdl-latest/server/src/features/formatting/formattingRules.ts):

```typescript
interface FormattingRules {
    // ... existing rules ...

    /** Enable column-alignment of colons within definition blocks. Default: false */
    alignColons: boolean;

    /** 
     * Alignment strategy. Default: "tabStop"
     * - "tabStop": Align to next tab stop after longest key
     * - "longestKey": Align to longest key + 1 space
     * - "fixed": Align to a fixed column position
     */
    alignColonsStrategy: "tabStop" | "longestKey" | "fixed";

    /** 
     * Fixed column position for colon alignment (only used when strategy is "fixed").
     * 0-indexed from start of content (after indentation). Default: 16
     */
    alignColonsColumn: number;

    /**
     * Whether to align multi-colon chains (e.g., Add : Key Item : After : ...).
     * Default: false (only align first colon)
     */
    alignMultiColonChains: boolean;
}
```

VS Code settings to add in [package.json](file:///z:/SourceCode/OpenSource/tally-tdl-latest/package.json) `contributes.configuration`:

```json
"tallyTDL.formatting.alignColons": {
    "type": "boolean",
    "default": false,
    "description": "Align colons vertically within definition blocks using tab padding."
},
"tallyTDL.formatting.alignColonsStrategy": {
    "type": "string",
    "enum": ["tabStop", "longestKey", "fixed"],
    "default": "tabStop",
    "description": "Strategy for colon alignment: 'tabStop' (next tab stop after longest key), 'longestKey' (pad to longest key + 1 space), or 'fixed' (fixed column)."
},
"tallyTDL.formatting.alignColonsColumn": {
    "type": "number",
    "default": 16,
    "minimum": 8,
    "maximum": 40,
    "description": "Fixed column position for colon alignment (only used with 'fixed' strategy)."
},
"tallyTDL.formatting.alignMultiColonChains": {
    "type": "boolean",
    "default": false,
    "description": "Also align colons in multi-colon chains (e.g., Local : Field : Default : ...)."
}
```

## Current Formatter Architecture

The formatter in [formatting.ts](file:///z:/SourceCode/OpenSource/tally-tdl-latest/server/src/features/formatting.ts) uses an **AST-walk + contextMap** approach:

1. **AST Traversal** (`traverseAST`): Walks `DefinitionNode` → `AttributeNode` / `ComplexObjectNode` / `StatementNode` recursively, building a `Map<Token, TokenContext>` that tags every token with its formatting context (indent depth, whether it's a definition colon, attribute colon, operator, etc.).

2. **Line Indentation** (`lineIndents[]`): An array indexed by line number, storing either a numeric depth or a precomputed indent string for each line.

3. **Output Reconstruction**: Iterates over `sourceFile.tokens` sequentially. For each token, it looks up `contextMap.get(token)` to decide indentation, colon spacing, casing, blank lines, etc. The colon-spacing logic at lines 466-503 specifically handles `isDefinitionColon` and `isAttributeColon` flags to apply `spaceBeforeColon`/`spaceAfterColon` rules.

**Key types:**

```typescript
interface TokenContext {
    indentDepth: number;
    isDefinitionHeader: boolean;
    casing: "definitionType" | "attributeName" | "boolean" | "none";
    isDefinitionColon: boolean;
    isAttributeColon: boolean;
    isOperator: boolean;
    isComma: boolean;
    blankLinesBefore: number;
}
```

The `isAttributeColon` flag is already set correctly during AST traversal — it marks `token === attr.colon` (the first colon of an `AttributeNode`). This is exactly the colon we need to align.

## Algorithm Design — AST-Based

### Phase 1: Measurement Pass (inside `traverseAST`)

During the existing AST traversal of `DefinitionNode`, **before** processing children, compute the alignment column for this definition's attributes:

```typescript
// Inside traverseAST, when node.kind === SyntaxKind.Definition:
const def = node as DefinitionNode;

let alignColumn = 0;
if (rules.alignColons) {
    let maxKeyWidth = 0;
    for (const attr of def.attributes) {
        // attr.name.text gives the full attribute name (e.g., "Form", "Variable", "Local")
        const keyWidth = attr.name.text.length;
        maxKeyWidth = Math.max(maxKeyWidth, keyWidth);
    }
    alignColumn = computeAlignColumn(maxKeyWidth, rules.alignColonsStrategy, options.tabSize, rules.alignColonsColumn);
}
```

Store this in a new `Map<Node, AlignmentInfo>` that is accessible during output reconstruction:

```typescript
const alignmentMap = new Map<Node, AlignmentInfo>();
```

Where:
```typescript
interface AlignmentInfo {
    /** Column position for the first attribute colon alignment */
    firstColonColumn: number;
    /** Column positions for multi-colon chain alignment (optional) */
    chainColumns?: number[];
}
```

### Phase 2: Extend `TokenContext` with alignment info

Add an optional alignment field to `TokenContext`:

```typescript
interface TokenContext {
    // ... existing fields ...
    
    /** If this is an attribute colon that should be column-aligned, the target column */
    alignToColumn?: number;
    /** The width of the attribute key (for padding computation) */
    attributeKeyWidth?: number;
}
```

During `traverseAST` when processing an `AttributeNode` (lines 190-223), if the parent definition has alignment info, tag the attribute's colon token:

```typescript
} else if (node.kind === SyntaxKind.Attribute) {
    const attr = node as AttributeNode;
    // ... existing token context setup ...
    
    // Look up alignment for parent definition
    const alignInfo = alignmentMap.get(parentDef);
    if (alignInfo && alignInfo.firstColonColumn > 0) {
        const colonCtx = contextMap.get(attr.colon);
        if (colonCtx) {
            colonCtx.alignToColumn = alignInfo.firstColonColumn;
            colonCtx.attributeKeyWidth = attr.name.text.length;
        }
    }
}
```

> **Note:** The parent definition is known because `traverseAST` is called recursively — the `DefinitionNode` handler calls `traverseAST(child, bodyDepth)` for each attribute. We can pass the parent node through a parameter or closure variable.

### Phase 3: Modify Output Reconstruction for Aligned Colons

In the colon-spacing section of the output loop (lines 466-503), add alignment-aware padding:

```typescript
if (token.Kind === TokenKind.ColonToken) {
    if (ctx.alignToColumn !== undefined && ctx.attributeKeyWidth !== undefined) {
        // Column-aligned colon
        const padding = generateAlignmentPadding(
            ctx.attributeKeyWidth, 
            ctx.alignToColumn, 
            options.insertSpaces, 
            options.tabSize
        );
        // Strip any existing trailing whitespace before padding
        while (formattedText.endsWith(' ') || formattedText.endsWith('\t')) {
            formattedText = formattedText.slice(0, -1);
        }
        formattedText += padding;
        formattedText += token.Text;
        // spaceAfterColon still applies normally
        const spaceAfter = getSpacingString(rules.spaceAfterColon, indentString);
        if (spaceAfter !== "") formattedText += spaceAfter;
        skipNextSpace = true;
    } else if (ctx.isDefinitionColon) {
        // ... existing definition colon logic ...
    } else if (ctx.isAttributeColon) {
        // ... existing attribute colon logic (non-aligned fallback) ...
    }
    // ...
}
```

### Alignment Column Computation

```typescript
function computeAlignColumn(maxKeyWidth: number, strategy: string, tabSize: number, fixedColumn: number): number {
    switch (strategy) {
        case "tabStop":
            // Round up to next tab stop
            return Math.ceil((maxKeyWidth + 1) / tabSize) * tabSize;
        case "longestKey":
            // Longest key + 1 space
            return maxKeyWidth + 1;
        case "fixed":
            // Fixed column, but at least maxKeyWidth + 1
            return Math.max(fixedColumn, maxKeyWidth + 1);
        default:
            return maxKeyWidth + 1;
    }
}
```

### Padding Generation

```typescript
function generateAlignmentPadding(keyWidth: number, alignColumn: number, insertSpaces: boolean, tabSize: number): string {
    const spacesNeeded = alignColumn - keyWidth;
    if (spacesNeeded <= 0) return ' '; // At minimum 1 space
    if (insertSpaces) {
        return ' '.repeat(spacesNeeded);
    } else {
        // Use tabs for padding
        const tabsNeeded = Math.ceil(spacesNeeded / tabSize);
        return '\t'.repeat(tabsNeeded);
    }
}
```

### Phase 4: Multi-Colon Chain Alignment (optional, gated behind `alignMultiColonChains`)

For multi-colon attributes like:

```tdl
Local   : Field : Default           : Type  : String
Local   : Field : Default           : Align : Centre
```

This requires measuring **all** colon positions across sibling attributes. During the measurement pass, for each `AttributeNode` that has multiple values (i.e., `attr.value` contains multiple nodes separated by colons), compute the text width of each segment between colons.

The `AttributeNode` AST already has:
- `attr.name` — the key (`IdentifierNode` with `.text`)
- `attr.colon` — the first colon token
- `attr.value[]` — array of value nodes (each pair separated by additional colons in the token stream)

The additional colons between values can be found by looking at tokens between `attr.colon` and `attr.end` that have `Kind === TokenKind.ColonToken`.

For each colon position index (0, 1, 2, ...), compute `max(segment width before that colon)` across all sibling `AttributeNode`s in the same `DefinitionNode`.

This is significantly more complex and should be implemented as a separate follow-up after basic first-colon alignment works.

## Integration Points — Files to Modify

### [MODIFY] [formattingRules.ts](file:///z:/SourceCode/OpenSource/tally-tdl-latest/server/src/features/formatting/formattingRules.ts)
- Add `alignColons`, `alignColonsStrategy`, `alignColonsColumn`, `alignMultiColonChains` to `FormattingRules` interface
- Add defaults to `DEFAULT_FORMATTING_RULES`
- Add validation in `mergeFormattingRules`

### [MODIFY] [formatting.ts](file:///z:/SourceCode/OpenSource/tally-tdl-latest/server/src/features/formatting.ts)
- Extend `TokenContext` with `alignToColumn?` and `attributeKeyWidth?`
- Add measurement pass inside `traverseAST` for `DefinitionNode` and `ComplexObjectNode`
- Modify colon output logic (lines 466-503) to check `alignToColumn`
- Add `computeAlignColumn` and `generateAlignmentPadding` helper functions

### [MODIFY] [package.json](file:///z:/SourceCode/OpenSource/tally-tdl-latest/package.json)
- Add 4 new settings under `contributes.configuration`

### [MODIFY] [formatting.test.ts](file:///z:/SourceCode/OpenSource/tally-tdl-latest/server/src/__tests__/features/formatting.test.ts)
- Add test cases for column alignment

## Edge Cases

### 1. Mixed Definition Types
Different `DefinitionNode`s within the same `SourceFile` have different longest key widths. Each definition computes its own `AlignmentInfo` independently — this is natural since the measurement happens per-node in `traverseAST`.

### 2. Complex Object Nesting
`ComplexObjectNode`s within definitions have their own `attributes[]` array. Each complex object should compute its own alignment column independently. The same `traverseAST` pattern applies — when entering a `ComplexObjectNode`, measure its attributes and store in `alignmentMap`.

### 3. Very Long Attribute Names
If an attribute name is very long (e.g., `Explode All Levels`), the alignment column pushes everything far right. Consider:
- A maximum alignment column setting to prevent excessive indentation
- Fall back to single-space for attributes whose keys exceed a threshold

### 4. Modifier Attributes
Attributes with modifiers (`Add`, `Delete`, `Option`, `Local`) — the `attr.name.text` in the AST includes the full attribute name. The `attr.isAttributeModifier` and `attr.modifierType` flags can help identify these. The modifier + attribute name together form the key for alignment purposes:
```tdl
    Add     : Lines : Before : MyLine
    Delete  : Border
    Option  : OptionalPart : Condition
```

Check how the parser stores the modifier in `attr.name.text` — it may already include "Add" as a separate identifier, in which case we need to sum widths of the modifier tokens + space + name tokens.

### 5. System Definition Sections
`[System: Formula]`, `[System: UDF]`, `[System: Variable]` have specialized attribute formats (e.g., UDF: `Name : Type : OrderNumber`). These are still `AttributeNode`s in the AST, so they naturally participate in alignment.

### 6. Interaction with `spaceBeforeColon` Rule
When `alignColons` is enabled, it **overrides** `spaceBeforeColon` for the first attribute colon. The `spaceAfterColon` rule still applies normally after the colon. This needs to be clearly documented.

## Testing Strategy

1. **Basic alignment**: Simple definition with 3-5 attributes of varying key lengths
2. **Tab stop alignment**: Verify colons snap to tab stops
3. **Longest key alignment**: Verify colons align to longest key + 1
4. **Fixed column alignment**: Verify colons at fixed column
5. **Multi-colon chains**: Verify all colons in chain align across attributes
6. **Mixed definitions**: Verify each definition computes independently
7. **Complex objects**: Verify nested objects compute independently
8. **Very long keys**: Verify graceful handling
9. **Idempotency**: Format twice → same output
10. **Interaction with other rules**: Verify alignment works with different indent settings, colon spacing settings, etc.
11. **alignColons disabled**: Verify no alignment happens (existing behavior preserved)
12. **Modifier attributes**: Verify modifiers included in key width
