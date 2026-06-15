import { DefinitionsParser } from "./core/DefinitionsParser";
import {
  SourceFile,
  AttributeNode,
  StatementNode,
  DefinitionNode,
  IdentifierNode,
  Node,
  CommentNode,
} from "./ast";
import { Token } from "./token";
import { TokenKind } from "./tokenKind";

/**
 * The TDL Parser.
 * It is responsible for consuming structural Tokens emitted by the Lexer
 * and transforming them into a semantically meaningful Abstract Syntax Tree (AST).
 *
 * Parsing logic is modularized across ExpressionsParser, StatementsParser, and DefinitionsParser
 * via a linear class inheritance chain.
 */
export class Parser extends DefinitionsParser {
  private _oldSourceFile?: SourceFile;

  constructor(text: string, oldSourceFile?: SourceFile) {
    super(text);
    this._oldSourceFile = oldSourceFile;
  }

  public parse(): SourceFile {
    const sourceFile = new SourceFile(0, 0);
    this.parseInternal(sourceFile);
    return sourceFile;
  }

  public parseStandaloneAttributes(): AttributeNode[] {
    const dummyDef = new DefinitionNode(
      0,
      0,
      new Token(TokenKind.OpenSquareBracketToken, 0, 0, 0),
      new IdentifierNode([], "Dummy"),
      new Token(TokenKind.CloseSquareBracketToken, 0, 0, 0),
    );
    this.ParseAttributes(dummyDef);
    return dummyDef.attributes;
  }

  public parseStandaloneStatements(): StatementNode[] {
    const dummyDef = new DefinitionNode(
      0,
      0,
      new Token(TokenKind.OpenSquareBracketToken, 0, 0, 0),
      new IdentifierNode([], "Dummy"),
      new Token(TokenKind.CloseSquareBracketToken, 0, 0, 0),
    );
    while (!this.isAtEnd()) {
      this.ParseStatement(dummyDef);
      // Move to next token if not consumed by ParseStatement
      if (
        this.CurrentToken.Kind === TokenKind.LineFeed ||
        this.CurrentToken.Kind === TokenKind.CarriageReturn ||
        this.CurrentToken.Kind === TokenKind.CarriageReturnLineFeed
      ) {
        this.MoveToNextToken();
      } else if (!this.isAtEnd() && dummyDef.statements.length === 0) {
        this.MoveToNextToken();
      }
    }
    return dummyDef.statements;
  }

  private parseInternal(sourceFile: SourceFile) {
    const start = 0;
    const end =
      this._tokens.length > 0 ? this._tokens[this._tokensLength - 1].Start : 0;
    sourceFile.start = start;
    sourceFile.end = end;
    sourceFile.tokens = this._tokens;
    sourceFile.text = this._text;

    // Compute Line Offsets immediately
    sourceFile.lineOffsets = [0];
    for (let i = 0; i < this._text.length; i++) {
      if (this._text[i] === "\n") {
        sourceFile.lineOffsets.push(i + 1);
      }
    }

    // Extract comments from Token Trivia
    for (const token of this._tokens) {
      if (token.Leading) {
        for (const trivia of token.Leading) {
          if (
            trivia.Kind === TokenKind.SingleLineComment ||
            trivia.Kind === TokenKind.MultiLineComment
          ) {
            const isMulti = trivia.Kind === TokenKind.MultiLineComment;
            sourceFile.comments.push(
              new CommentNode(
                trivia.Start,
                trivia.Start + trivia.Length,
                trivia.Text,
                isMulti,
              ),
            );
          }
        }
      }
      if (token.Trailing) {
        for (const trivia of token.Trailing) {
          if (
            trivia.Kind === TokenKind.SingleLineComment ||
            trivia.Kind === TokenKind.MultiLineComment
          ) {
            const isMulti = trivia.Kind === TokenKind.MultiLineComment;
            sourceFile.comments.push(
              new CommentNode(
                trivia.Start,
                trivia.Start + trivia.Length,
                trivia.Text,
                isMulti,
              ),
            );
          }
        }
      }
    }

    let oldDefs = this._oldSourceFile ? this._oldSourceFile.definitions : [];
    let oldDefIndex = 0;

    while (!this.isAtEnd()) {
      // Ignore top level newlines
      if (
        this.CurrentToken.Kind === TokenKind.LineFeed ||
        this.CurrentToken.Kind === TokenKind.CarriageReturn ||
        this.CurrentToken.Kind === TokenKind.CarriageReturnLineFeed ||
        this.CurrentToken.Kind === TokenKind.SpaceToken
      ) {
        this.MoveToNextToken();
        continue;
      }

      // Find chunk boundary
      let chunkStartTokenIdx = this._currentTokenIndex;
      let chunkStartOffset = this.CurrentToken.Start;
      let nextIdx = chunkStartTokenIdx + 1;
      
      while (nextIdx < this._tokensLength && this._tokens[nextIdx].Kind !== TokenKind.OpenSquareBracketToken) {
          nextIdx++;
      }
      
      let chunkEndOffset = nextIdx < this._tokensLength ? this._tokens[nextIdx].Start : this._text.length;
      let currentChunkText = this._text.substring(chunkStartOffset, chunkEndOffset);
      
      let matchedOldDef: DefinitionNode | undefined = undefined;
      
      if (oldDefs.length > 0) {
          // Look ahead to handle insertions without losing sync
          for (let i = oldDefIndex; i < Math.min(oldDefIndex + 5, oldDefs.length); i++) {
              let oldDef = oldDefs[i];
              let nextOldDef = i + 1 < oldDefs.length ? oldDefs[i + 1] : undefined;
              let oldChunkEnd = nextOldDef ? nextOldDef.start : this._oldSourceFile!.text.length;
              let oldChunkText = this._oldSourceFile!.text.substring(oldDef.start, oldChunkEnd);
              
              if (oldChunkText === currentChunkText) {
                  matchedOldDef = oldDef;
                  oldDefIndex = i + 1;
                  break;
              }
          }
      }

      if (matchedOldDef) {
          // Chunk is identical! Reuse AST node and shift offsets
          let delta = chunkStartOffset - matchedOldDef.start;
          if (delta !== 0) {
              this.applyOffsetDelta(matchedOldDef, delta);
          }
          sourceFile.definitions.push(matchedOldDef);
          
          // Advance lexer to the end of this chunk
          while (this._currentTokenIndex < nextIdx) {
              this.MoveToNextToken();
          }
      } else {
        const defNode = this.ParseDefinitionStatement();
        if (defNode) {
          sourceFile.definitions.push(defNode);
        } else {
          // To avoid infinite loops, move to next token if it's an unrecognized top level token.
          const token = this.CurrentToken;
          this.addError(
            `Unexpected top level token: ${token.Text}`,
            token.Start,
            token.Start + token.Length,
          );
          this.MoveToNextToken();
        }
      }
    }
    sourceFile.errors = this.errors;
    this.setParentReferences(sourceFile);
  }

  private applyOffsetDelta(node: Node, delta: number) {
    if (!node) return;
    if (node.start !== undefined) node.start += delta;
    if (node.end !== undefined) node.end += delta;
    
    // Shift embedded tokens if any
    if ((node as any).tokens) {
       for (const t of (node as any).tokens) {
           t.Start += delta;
       }
    }
    if ((node as any).token) {
       (node as any).token.Start += delta;
    }
    if ((node as any).openBracket) (node as any).openBracket.Start += delta;
    if ((node as any).closeBracket) (node as any).closeBracket.Start += delta;
    if ((node as any).colon) (node as any).colon.Start += delta;
    if ((node as any).modifier) (node as any).modifier.Start += delta;

    for (const child of this.getChildren(node)) {
        if (child) {
            this.applyOffsetDelta(child, delta);
        }
    }
  }

  private setParentReferences(node: Node, parent?: Node) {
    node.parent = parent;
    for (const child of this.getChildren(node)) {
      if (child) {
        this.setParentReferences(child, node);
      }
    }
  }

  private getChildren(node: Node): Node[] {
    const children: Node[] = [];
    for (const key of Object.keys(node)) {
      if (key === "parent" || key === "tokens") continue;
      const value = (node as any)[key];
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === "object" && "kind" in item) {
            children.push(item);
          }
        }
      } else if (value && typeof value === "object" && "kind" in value) {
        children.push(value);
      }
    }
    return children;
  }
}

