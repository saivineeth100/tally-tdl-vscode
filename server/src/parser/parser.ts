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

    while (!this.isAtEnd()) {
      // Ignore top level newlines
      if (
        this.CurrentToken.Kind === TokenKind.LineFeed ||
        this.CurrentToken.Kind === TokenKind.CarriageReturn ||
        this.CurrentToken.Kind === TokenKind.CarriageReturnLineFeed
      ) {
        this.MoveToNextToken();
        continue;
      }

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
    sourceFile.errors = this.errors;
    this.setParentReferences(sourceFile);
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
