import { IdentifierNode } from "../ast";
import { Token } from "../token";
import { TokenKind } from "../tokenKind";
import { Lexer } from "../lexer";
import { DiagnosticError } from "../ast";

/**
 * Manages the token stream state for the parser, providing utility methods to
 * traverse, match, and expect specific tokens. Also tracks diagnostic errors.
 */
export class ParserState {
  public _tokens: Token[];
  public _tokensLength: number;
  public _currentTokenIndex: number = 0;
  public _currentToken: Token | null = null;
  public _text: string;

  /** Collection of syntax errors encountered during parsing */
  public errors: DiagnosticError[] = [];

  /**
   * Initializes the ParserState by running the Lexer on the provided input text.
   * @param input The raw TDL source code string.
   */
  constructor(input: string) {
    this._text = input;
    const lexer = new Lexer(input);
    this._tokens = lexer.Generate();
    this._tokensLength = this._tokens.length;
  }

  /**
   * Retrieves the current token in the token stream.
   * Lazily fetches if not already cached.
   */
  public get CurrentToken(): Token {
    return (this._currentToken ??= this.FetchCurrentToken());
  }

  /**
   * Retrieves the previously consumed token.
   */
  public get PreviousToken(): Token {
    return this._tokens[this._currentTokenIndex - 1];
  }

  /**
   * Fetches the current token directly from the array.
   */
  public FetchCurrentToken(): Token {
    if (this._currentTokenIndex >= this._tokensLength) {
      return this._tokens[this._tokensLength - 1];
    }
    return this._tokens[this._currentTokenIndex];
  }

  /**
   * Checks if the current token matches the given kind.
   * @param kind The TokenKind to check against.
   */
  public match(kind: TokenKind): boolean {
    return !this.isAtEnd() && this.CurrentToken.Kind === kind;
  }

  /**
   * Asserts that the current token matches the expected kind, and consumes it.
   * If it does not match, records a diagnostic error and does not consume.
   * @param kind The expected TokenKind.
   * @param message The error message to report on failure.
   * @returns The consumed Token, or undefined if it did not match.
   */
  public Expect(kind: TokenKind, message: string): Token | undefined {
    if (this.match(kind)) {
      this.MoveToNextToken();
      return this.PreviousToken;
    }
    const token = this.CurrentToken;
    this.addError(message, token.Start, token.Start + token.Length);
    return undefined;
  }

  /**
   * Consumes the current token and advances the stream.
   * @returns The consumed token.
   */
  public EatToken(): Token {
    const token = this.CurrentToken;
    this.MoveToNextToken();
    return token;
  }

  /**
   * Checks if the token stream has reached the End Of File token.
   */
  public isAtEnd(): boolean {
    return this.CurrentToken.Kind === TokenKind.EndOfFileToken;
  }

  /**
   * Advances the token stream by one.
   */
  public MoveToNextToken() {
    this._currentTokenIndex++;
    this._currentToken = null;
  }

  /**
   * Records a diagnostic error at a specific position.
   * @param message The error message.
   * @param start The start offset of the error.
   * @param end The end offset of the error.
   */
  public addError(message: string, start: number, end: number) {
    this.errors.push({ message, start, end });
  }

  /**
   * Checks if a specific TokenKind represents an identifier in the context of TDL.
   * Includes literal numbers, keywords, and definition types as valid identifiers.
   * @param kind The TokenKind to check.
   */
  public IsIdentifierToken(kind: TokenKind): boolean {
    if (kind === TokenKind.IdentifierToken || kind === TokenKind.NumberToken)
      return true;
    if (kind >= 700) return true; // DefTypes like Form, Report
    if (kind >= 400 && kind < 500) return true; // Keywords like True, False, And, Or
    return false;
  }

  /**
   * Checks whether a specific Token has a line break in its Leading or Trailing trivia.
   * @param token The Token to inspect.
   * @param trailing If true, checks the Trailing trivia; otherwise checks Leading.
   */
  public HasNewLine(token: Token, trailing: boolean): boolean {
    if (!token) return false;
    // Checking for new lines in "Leading" and "Trailing" trivia
    const trivia = trailing ? token.Trailing : token.Leading;
    if (trivia) {
      for (let i = 0; i < trivia.length; i++) {
        const k = trivia[i].Kind;
        if (
          k === TokenKind.LineFeed ||
          k === TokenKind.CarriageReturn ||
          k === TokenKind.CarriageReturnLineFeed
        ) {
          return true;
        }
      }
    }
    return false;
  }

  public createMissingToken(kind: TokenKind): Token {
    return new Token(kind, this.CurrentToken.Start, this.CurrentToken.Start, 0);
  }

  public createMissingIdentifier(): IdentifierNode {
    const t = this.createMissingToken(TokenKind.IdentifierToken);
    const ident = new IdentifierNode([t], "");
    ident.isIncomplete = true;
    return ident;
  }
}
