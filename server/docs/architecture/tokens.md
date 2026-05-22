# TDL Token Documentation

## Overview

The TDL Lexer tokenizes source code into a stream of tokens. Each token represents a syntactic unit.

## Token Structure

```typescript
class Token {
    Kind: TokenKind;      // Type of token
    FullStart: number;    // Position including leading trivia
    Start: number;        // Position of token content
    Length: number;       // Total length including trivia
    Text: string;         // Token text content
    Leading: Token[];     // Leading trivia (whitespace, comments)
    Trailing: Token[];    // Trailing trivia
}
```

## Token Kinds

### Special Tokens (0-10)
| Kind | Value | Description |
|------|-------|-------------|
| `Unknown` | 0 | Unknown/invalid token |
| `EndOfFileToken` | 1 | End of input |
| `SkippedToken` | 3 | Skipped token (error recovery) |
| `MissingToken` | 4 | Synthetic missing token (error recovery) |
| `CarriageReturnLineFeed` | 5 | Windows line ending `\r\n` |
| `LineFeed` | 6 | Unix line ending `\n` |
| `CarriageReturn` | 7 | Mac line ending `\r` |

### Comments (50-51)
| Kind | Value | Example |
|------|-------|---------|
| `SingleLineComment` | 50 | `; comment` |
| `MultiLineComment` | 51 | `/* comment */` |

### Brackets and Modifiers (100-106)
| Kind | Value | Character | Usage |
|------|-------|-----------|-------|
| `OpenSquareBracketToken` | 100 | `[` | Definition start |
| `CloseSquareBracketToken` | 101 | `]` | Definition end |
| `ExclamationToken` | 102 | `!` | Delete modifier |
| `AsteriskToken` | 103 | `*` | Modifier |
| `HashToken` | 104 | `#` | Alter modifier or field reference |

### Reference Tokens (200-212)
| Kind | Value | Symbol | Usage |
|------|-------|--------|-------|
| `AtTheRateToken` | 200 | `@` | Formula reference |
| `DoubleAtTheRateToken` | 201 | `@@` | Global formula |
| `DoubleHashToken` | 202 | `##` | Variable reference |
| `DollarToken` | 203 | `$` | Method reference |
| `DoubleDollarToken` | 204 | `$$` | Function call |
| `ColonToken` | 205 | `:` | Separator |
| `PlusToken` | 209 | `+` | Line continuation |
| `CommaToken` | 211 | `,` | Separator |
| `DotToken` | 212 | `.` | Dot accessor |

### Operators (300-303, 500-555)
| Kind | Value | Symbol | Usage |
|------|-------|--------|-------|
| `MinusToken` | 300 | `-` | Subtraction |
| `DivisionToken` | 301 | `/` | Division |
| `MultiplyToken` | 302 | `*` | Multiplication |
| `PercentToken` | 303 | `%` | Modulo |
| `EqualsToken` | 500 | `=` | Equality |
| `LessThanToken` | 501 | `<` | Less than |
| `GreaterThanToken` | 502 | `>` | Greater than |
| `GreaterThanEqualsToken` | 510 | `>=` | Greater or equal |
| `LessThanEqualsToken` | 511 | `<=` | Less or equal |
| `NotEqualsToken` | 512 | `!=` | Not equal |

### Keywords (400-408)
| Kind | Value | Keyword |
|------|-------|---------|
| `OrToken` | 400 | `Or` |
| `AndToken` | 401 | `And` |
| `NotToken` | 402 | `Not` |
| `TrueToken` | 403 | `True` |
| `OnToken` | 404 | `On` |
| `YesToken` | 405 | `Yes` |
| `FalseToken` | 406 | `False` |
| `OffToken` | 407 | `Off` |
| `NoToken` | 408 | `No` |

### String Comparison (550-556)
| Kind | Value | Keyword |
|------|-------|---------|
| `ContainsToken` | 550 | `Contains` |
| `ContainingToken` | 551 | `Containing` |
| `StartingToken` | 552 | `Starting` |
| `StartingWithToken` | 553 | `StartingWith` |
| `EndingToken` | 554 | `Ending` |
| `EndingWithToken` | 555 | `EndingWith` |
| `LikeToken` | 556 | `Like` |

### Literals (600-603)
| Kind | Value | Description |
|------|-------|-------------|
| `IdentifierToken` | 600 | Name/identifier |
| `SpaceToken` | 601 | Whitespace |
| `StringLiteralToken` | 602 | String `"..."` |
| `NumberToken` | 603 | Numeric literal |

### Definition Types (700+)
| Kind | Value | Definition Type |
|------|-------|-----------------|
| `BorderDefTypeToken` | 700 | Border |
| `ButtonDefTypeToken` | 701 | Button |
| `CollectionDefTypeToken` | 702 | Collection |
| `ColorDefTypeToken` | 703 | Color |
| `FieldDefTypeToken` | 706 | Field |
| `FormDefTypeToken` | 707 | Form |
| `FunctionDefTypeToken` | 708 | Function |
| `LineDefTypeToken` | 712 | Line |
| `MenuDefTypeToken` | 713 | Menu |
| `PartDefTypeToken` | 716 | Part |
| `ReportDefTypeToken` | 718 | Report |
| `VariableDefTypeToken` | 723 | Variable |

## Lexer Usage

```typescript
import { Lexer } from './parser/lexer';

const source = '[Report: MyReport]';
const lexer = new Lexer(source);
const tokens = lexer.Generate();

for (const token of tokens) {
    console.log(`${TokenKind[token.Kind]}: "${token.Text}"`);
}
// Output:
// OpenSquareBracketToken: "["
// IdentifierToken: "Report"
// ColonToken: ":"
// IdentifierToken: "MyReport"
// CloseSquareBracketToken: "]"
// EndOfFileToken: ""
```

## Trivia

Tokens can have **leading** and **trailing** trivia:
- Whitespace
- Comments
- Line endings

```typescript
// Access trivia
token.Leading  // Token[] - trivia before this token
token.Trailing // Token[] - trivia after this token
```

## Key Lexer Methods

| Method | Description |
|--------|-------------|
| `Generate()` | Tokenize entire input |
| `ScanNextToken()` | Get next token |
| `Peek()` | Look at current character |
| `ScanIdentifier()` | Scan identifier token |
| `ScanText()` | Scan string literal |

## Token Detection for Completions

To detect context from tokens:

```typescript
// Check for function call context
if (token.Kind === TokenKind.DoubleDollarToken) {
    // User is typing a function name
}

// Check for definition context
if (token.Kind === TokenKind.OpenSquareBracketToken) {
    // Inside definition header
}

// Check for modifier
if (token.Kind === TokenKind.HashToken ||
    token.Kind === TokenKind.ExclamationToken) {
    // Definition has modifier
}
```

## See Also

- [parser.md](./parser.md) - Parser and AST documentation
