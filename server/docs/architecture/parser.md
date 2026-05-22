# TDL Parser Documentation

## Overview

The TDL (Tally Definition Language) parser is a recursive descent parser that converts TDL source code into an Abstract Syntax Tree (AST). It supports **error recovery** to create partial nodes even when input is incomplete.

## Architecture

```
Source Code → Lexer → Tokens → Parser → AST (SourceFile)
```

### Key Components

| File | Purpose |
|------|---------|
| `lexer.ts` | Tokenizes source text into tokens |
| `parser.ts` | Builds AST from token stream |
| `ast.ts` | Defines AST node types |
| `token.ts` | Token class definition |
| `tokenKind.ts` | Enum of all token types |

## AST Node Types

### SourceFile
Root node containing all definitions and errors.
```typescript
class SourceFile {
    definitions: DefinitionNode[];
    errors: DiagnosticError[];
}
```

### DefinitionNode
Represents a TDL definition block like `[Report: MyReport]`.
```typescript
class DefinitionNode {
    openBracket: Token;      // [
    modifier?: Token;        // #, !, or *
    type: IdentifierNode;    // Report, Field, Form, etc.
    colon?: Token;           // :
    name?: IdentifierNode;   // MyReport
    closeBracket: Token;     // ]
    attributes: AttributeNode[];
    statements: StatementNode[];
    isIncomplete: boolean;   // True if parsed with error recovery
}
```

### AttributeNode
Represents an attribute within a definition.
```typescript
class AttributeNode {
    name: IdentifierNode;
    colon: Token;
    value: (IdentifierNode | LiteralNode | ExpressionNode)[];
    isIncomplete: boolean;
}
```

### IdentifierNode
Represents a name that may contain spaces (e.g., "Stock Item").
```typescript
class IdentifierNode {
    tokens: Token[];
    text: string;
    isIncomplete: boolean;
}
```

## Error Recovery

The parser implements **error recovery** to create partial AST nodes even when input is incomplete. This is crucial for IDE features like completion and hover.

### How It Works

1. **Missing tokens are synthesized**: When an expected token is missing, a synthetic `MissingToken` is created.
2. **Nodes are always created**: Even incomplete definitions create a `DefinitionNode`.
3. **`isIncomplete` flag**: Nodes parsed with recovery have `isIncomplete = true`.

### Example

```tdl
[Report: MyRep
```

This incomplete input still creates:
```
DefinitionNode {
    type: "Report",
    name: "MyRep",
    closeBracket: MissingToken,
    isIncomplete: true
}
```

### Recovery Methods

```typescript
// Create synthetic missing token
createMissingToken(kind: TokenKind): Token

// Create synthetic missing identifier
createMissingIdentifier(): IdentifierNode
```

## Parser Methods

### Main Entry Point
```typescript
parse(): SourceFile
```
Parses the entire document and returns the root AST node.

### Definition Parsing
```typescript
ParseDefinitionStatement(): DefinitionNode | undefined
```
Parses a definition block `[Type: Name]` with error recovery.

### Attribute Parsing
```typescript
ParseAttributes(defNode: DefinitionNode): void
```
Parses attributes within a definition body.

### Identifier Parsing
```typescript
ParseIdentifierWithSpaces(): IdentifierNode | undefined
```
Parses identifiers that may contain spaces.

## Usage

```typescript
import { Parser } from './parser/parser';

const source = `[Report: MyReport]
    Form: MainForm
    Title: My Title
`;

const parser = new Parser(source);
const ast = parser.parse();

// Access definitions
for (const def of ast.definitions) {
    console.log(def.type.text); // "Report"
    console.log(def.name?.text); // "MyReport"
    console.log(def.isIncomplete); // false
}
```

## Best Practices for AI Agents

1. **Always check `isIncomplete`**: Before using node data, check if the node was parsed with error recovery.

2. **Use AST for context detection**: Instead of regex or re-tokenizing, use the parsed AST for completion context.

3. **Handle missing nodes gracefully**: Properties like `name`, `colon` may be undefined.

4. **Access errors**: Check `sourceFile.errors` for parsing diagnostics.

## See Also

- [tokens.md](./tokens.md) - Token types and lexer documentation
