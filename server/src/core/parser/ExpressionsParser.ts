import {
  IdentifierNode,
  LiteralNode,
  EmptyNode,
  FunctionCallNode,
  ListNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  ComplexMethodReferenceNode,
  PathSpec,
  VariableReferenceNode,
  FieldReferenceNode,
  MethodReferenceNode,
  FormulaReferenceNode} from "../ast/ast";
import { Token } from "../lexer/token";
import { TokenKind } from "../lexer/tokenKind";

import { ParserState } from "./ParserState";

/**
 * ExpressionsParser is responsible for parsing mathematical, logical, and string expressions.
 * It also handles the parsing of basic literals, function calls, and variable/formula references.
 * It acts as the foundational parsing layer directly above ParserState.
 */
export class ExpressionsParser extends ParserState {
  protected ParseLiteral(): LiteralNode | undefined {
    if (
      (this.CurrentToken.Kind as TokenKind) === TokenKind.StringLiteralToken ||
      (this.CurrentToken.Kind as TokenKind) === TokenKind.NumberToken
    ) {
      return new LiteralNode(this.EatToken());
    }

    return undefined;
  }

  protected ParseExpressionIdentifier(): IdentifierNode | undefined {
    return this.ParseIdentifierWithSpaces(true);
  }

  protected ParseExpression(): any | undefined {
    return this.ParseStringExpression();
  }

  protected CheckNewLineBeforeCurrentToken(): boolean {
    return (
      (this.CurrentToken.Kind as TokenKind) === TokenKind.LineFeed ||
      (this.CurrentToken.Kind as TokenKind) === TokenKind.CarriageReturn ||
      (this.CurrentToken.Kind as TokenKind) === TokenKind.CarriageReturnLineFeed ||
      this.HasNewLine(this.PreviousToken, true) ||
      this.HasNewLine(this.CurrentToken, false)
    );
  }

  protected ParseStringExpression(): any | undefined {
    let left = this.ParseComparisonExpression();

    while (left && !this.CheckNewLineBeforeCurrentToken() && this.IsStringOperator(this.CurrentToken.Kind)) {
      let op = this.CurrentToken;

      if (
        op.Kind === TokenKind.StartingToken ||
        op.Kind === TokenKind.EndingToken
      ) {
        const next = this.PeekNextToken();

        if (next && next.Text.toUpperCase() === "WITH") {
          this.EatToken(); // Eat Starting/Ending

          const withOp = this.EatToken(); // Eat With

          op = new Token(
            op.Kind === TokenKind.StartingToken
              ? TokenKind.StartingWithToken
              : TokenKind.EndingWithToken,
            op.Start,
            op.Start,
            op.Length + withOp.Length + (withOp.Start - (op.Start + op.Length)),
          );

          op.Text = op.Text + " " + withOp.Text;
        } else {
          this.EatToken(); // Eat Starting/Ending
        }
      } else {
        this.EatToken();
      }

      const right = this.ParseComparisonExpression();

      if (!right) break;

      left = new BinaryExpressionNode(left.start, right.end, left, op, right);
    }

    return left;
  }

  protected IsStringOperator(kind: TokenKind) {
    return (
      kind === TokenKind.ContainsToken ||
      kind === TokenKind.ContainingToken ||
      kind === TokenKind.StartingToken ||
      kind === TokenKind.StartingWithToken ||
      kind === TokenKind.EndingToken ||
      kind === TokenKind.EndingWithToken ||
      kind === TokenKind.LikeToken
    );
  }

  protected ParseComparisonExpression(): any | undefined {
    let left = this.ParseLogicalOrExpression();

    while (left && !this.CheckNewLineBeforeCurrentToken() && this.IsComparisonOperator(this.CurrentToken.Kind)) {
      const op = this.EatToken();

      const right = this.ParseLogicalOrExpression();

      if (!right) break;

      left = new BinaryExpressionNode(left.start, right.end, left, op, right);
    }

    return left;
  }

  protected IsComparisonOperator(kind: TokenKind) {
    return (
      kind === TokenKind.EqualsToken ||
      kind === TokenKind.LessThanToken ||
      kind === TokenKind.GreaterThanToken ||
      kind === TokenKind.LessThanEqualsToken ||
      kind === TokenKind.GreaterThanEqualsToken ||
      kind === TokenKind.NotEqualsToken ||
      kind === TokenKind.InToken ||
      kind === TokenKind.BetweenToken ||
      kind === TokenKind.NullToken
    );
  }

  protected ParseLogicalOrExpression(): any | undefined {
    let left = this.ParseLogicalAndExpression();

    while (left && !this.CheckNewLineBeforeCurrentToken() && (this.CurrentToken.Kind as TokenKind) === TokenKind.OrToken) {
      const op = this.EatToken();

      const right = this.ParseLogicalAndExpression();

      if (!right) break;

      left = new BinaryExpressionNode(left.start, right.end, left, op, right);
    }

    return left;
  }

  protected ParseLogicalAndExpression(): any | undefined {
    let left = this.ParseLogicalNotExpression();

    while (left && !this.CheckNewLineBeforeCurrentToken() && (this.CurrentToken.Kind as TokenKind) === TokenKind.AndToken) {
      const op = this.EatToken();

      const right = this.ParseLogicalNotExpression();

      if (!right) break;

      left = new BinaryExpressionNode(left.start, right.end, left, op, right);
    }

    return left;
  }

  protected ParseLogicalNotExpression(): any | undefined {
    if ((this.CurrentToken.Kind as TokenKind) === TokenKind.NotToken) {
      const op = this.EatToken();

      const right = this.ParseLogicalNotExpression();

      if (right) {
        return new UnaryExpressionNode(op.Start, right.end, op, right);
      }

      return undefined;
    }

    return this.ParseArithmeticAddSubExpression();
  }

  protected ParseArithmeticAddSubExpression(): any | undefined {
    let left = this.ParseArithmeticMulDivExpression();

    while (
      left &&
      ((this.CurrentToken.Kind as TokenKind) === TokenKind.PlusToken ||
        (this.CurrentToken.Kind as TokenKind) === TokenKind.MinusToken)
    ) {
      if ((this.CurrentToken.Kind as TokenKind) === TokenKind.PlusToken) {
        const hasNewline =
          this.HasNewLine(this.PreviousToken, true) ||
          this.HasNewLine(this.CurrentToken, false) ||
          this.HasNewLine(this.CurrentToken, true);

        if (hasNewline) {
          break;
        }
      }

      const op = this.EatToken();

      const right = this.ParseArithmeticMulDivExpression();

      if (!right) break;

      left = new BinaryExpressionNode(left.start, right.end, left, op, right);
    }

    return left;
  }

  protected ParseArithmeticMulDivExpression(): any | undefined {
    let left = this.ParsePrimaryExpression();

    while (
      left &&
      ((this.CurrentToken.Kind as TokenKind) === TokenKind.AsteriskToken ||
        (this.CurrentToken.Kind as TokenKind) === TokenKind.DivisionToken ||
        (this.CurrentToken.Kind as TokenKind) === TokenKind.PercentToken)
    ) {
      const op = this.EatToken();

      const right = this.ParsePrimaryExpression();

      if (!right) break;

      left = new BinaryExpressionNode(left.start, right.end, left, op, right);
    }

    return left;
  }

  protected ParseReferenceFormula(): any | undefined {
    const expr =
      this.ParseExpression() ||
      this.ParseLiteral() ||
      this.ParseExpressionIdentifier();
    
    if (!expr) return undefined;

    if ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
      const savedIndex = this._currentTokenIndex;
      this.EatToken(); // Eat :

      const chainedObjectName = this.ParseIdentifierWithSpaces();
      if (chainedObjectName) {
        const chainedNode = new MethodReferenceNode(expr.start, chainedObjectName.end, expr as any);
        chainedNode.objectName = chainedObjectName;

        if ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
          this.EatToken(); // Eat :
          chainedNode.formula = this.ParseReferenceFormula();
          if (chainedNode.formula) {
            chainedNode.end = chainedNode.formula.end;
          }
        }
        return chainedNode;
      } else {
        this._currentTokenIndex = savedIndex;
      }
    }

    return expr;
  }

  protected ParsePrimaryExpression(): any | undefined {
    const start = this.CurrentToken.Start;
    const currentToken = this.CurrentToken;
    const kind = currentToken.Kind;

    switch (kind) {
      // Unary Minus
      case TokenKind.MinusToken: {
        const op = this.EatToken();
        const right = this.ParsePrimaryExpression();
        if (right) return new UnaryExpressionNode(op.Start, right.end, op, right);
        return undefined;
      }

      // Unary Plus
      case TokenKind.PlusToken: {
        const op = this.EatToken();
        const right = this.ParsePrimaryExpression();
        if (right) return new UnaryExpressionNode(op.Start, right.end, op, right);
        return undefined;
      }

      // Parenthesized Expression or Object Context
      case TokenKind.OpenParenToken: {
        const openParenToken = this.EatToken(); // Eat (

        const expr1 =
          this.ParseExpression() ||
          this.ParseLiteral() ||
          this.ParseExpressionIdentifier();

        let tokenAfterExpr1 = this.FetchCurrentToken();
        if (tokenAfterExpr1.Kind === TokenKind.CommaToken) {
          // It's an Object Context: (Type, Id).Path
          this.EatToken(); // Eat ,

          const expr2 =
            this.ParseExpression() ||
            this.ParseLiteral() ||
            this.ParseExpressionIdentifier();

          let tokenAfterExpr2 = this.FetchCurrentToken();
          if (tokenAfterExpr2.Kind === TokenKind.CloseParenToken) {
            this.EatToken(); // Eat )
          }

          // Now we might have a path like .Address[Last].Address
          let pathText = "";
          const pathTokens: any[] = [];
          
          let loopToken1 = this.FetchCurrentToken();
          while (
            !this.HasNewLine(loopToken1, false) &&
            (this.IsIdentifierToken(loopToken1.Kind) ||
            loopToken1.Kind === TokenKind.DotToken ||
            loopToken1.Kind === TokenKind.OpenSquareBracketToken ||
            loopToken1.Kind === TokenKind.CloseSquareBracketToken ||
            loopToken1.Kind === TokenKind.SpaceToken)
          ) {
            pathText += this.CurrentToken.Text;
            pathTokens.push(this.EatToken());
            loopToken1 = this.FetchCurrentToken();
          }

          const endPos = pathTokens.length > 0 
            ? pathTokens[pathTokens.length - 1].Start + pathTokens[pathTokens.length - 1].Text.length
            : (this.PreviousToken ? this.PreviousToken.Start + this.PreviousToken.Text.length : this.CurrentToken.Start);
          const text = this._text.substring(openParenToken.Start, endPos);
          const tokens = this._tokens.filter(t => t.Start >= openParenToken.Start && t.Start < endPos);
          
          return new IdentifierNode(tokens, text);
        } else {
          // Just a math expression
          if (tokenAfterExpr1.Kind === TokenKind.CloseParenToken) {
            this.EatToken(); // Eat )
          }

          // Wait, what if it's (Ledger).Address ?
          let tokenAfterParen = this.FetchCurrentToken();
          if (
            tokenAfterParen.Kind === TokenKind.DotToken ||
            tokenAfterParen.Kind === TokenKind.OpenSquareBracketToken
          ) {
             let pathText = "";
             const pathTokens: any[] = [];
             
             let loopToken2 = this.FetchCurrentToken();
             while (
               !this.HasNewLine(loopToken2, false) &&
               (this.IsIdentifierToken(loopToken2.Kind) ||
               loopToken2.Kind === TokenKind.DotToken ||
               loopToken2.Kind === TokenKind.OpenSquareBracketToken ||
               loopToken2.Kind === TokenKind.CloseSquareBracketToken ||
               loopToken2.Kind === TokenKind.SpaceToken)
             ) {
               pathText += this.CurrentToken.Text;
               pathTokens.push(this.EatToken());
               loopToken2 = this.FetchCurrentToken();
             }
             const endPos = pathTokens.length > 0 
               ? pathTokens[pathTokens.length - 1].Start + pathTokens[pathTokens.length - 1].Text.length
               : (this.PreviousToken ? this.PreviousToken.Start + this.PreviousToken.Text.length : this.CurrentToken.Start);
             const text = this._text.substring(openParenToken.Start, endPos);
             const tokens = this._tokens.filter(t => t.Start >= openParenToken.Start && t.Start < endPos);
             
             return new IdentifierNode(tokens, text);
          }

          return expr1;
        }
      }

      // Function Call $$Func:Arg:Arg
      case TokenKind.DoubleDollarToken: {
        const next = this.PeekNextToken();

        if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
          this.EatToken(); // Eat $$

          const funcName = this.ParseIdentifierWithSpaces();

          if (funcName) {
            const funcNode = new FunctionCallNode(start, funcName.end, funcName);

            // Check for arguments (
            if ((this.CurrentToken.Kind as TokenKind) === TokenKind.OpenParenToken) {
              this.EatToken(); // Eat (

              while (
                (this.CurrentToken.Kind as TokenKind) !== TokenKind.CloseParenToken &&
                (this.CurrentToken.Kind as TokenKind) !== TokenKind.EndOfFileToken
              ) {
                const arg =
                  this.ParseExpression() ||
                  this.ParseLiteral() ||
                  this.ParseExpressionIdentifier();

                if (arg) {
                  funcNode.arguments.push(arg);
                }

                if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CommaToken) {
                  this.EatToken(); // Eat ,
                } else if ((this.CurrentToken.Kind as TokenKind) !== TokenKind.CloseParenToken) {
                  break; // Should be comma or close paren
                }
              }

              if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CloseParenToken) {
                funcNode.end = this.CurrentToken.Start + 1;
                this.EatToken(); // Eat )
              }
            } else if ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
              // Colon separated arguments $$Func:Arg:Arg

              const funcNameText = funcNode.functionName?.text?.replace(/^\$\$/, '');
              let expectedArity: number | null = null;
              if (funcNameText && this._getFunctionArity) {
                 expectedArity = this._getFunctionArity(funcNameText);
              }

              let argsCount = 0;
              while ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
                // If we've already parsed the required number of parameters, stop splitting.
                // The subsequent tokens belong to the parent statement/expression.
                if (expectedArity !== null && argsCount >= expectedArity) {
                  break;
                }

                this.EatToken(); // Eat :

                // Parse argument (Expression, Literal, or Identifier)
                const arg =
                  this.ParseExpression() ||
                  this.ParseLiteral() ||
                  this.ParseExpressionIdentifier();

                if (arg) {
                  funcNode.arguments.push(arg);
                  funcNode.end = arg.end;
                  argsCount++;
                } else {
                  // Empty argument $$Func::Arg
                  if ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
                    argsCount++;
                    continue;
                  }
                  break;
                }
              }
            }

            return funcNode;
          }
        }
        break;
      }

      // Variable ##Var
      case TokenKind.DoubleHashToken: {
        const next = this.PeekNextToken();

        if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
          this.EatToken();
          const varName = this.ParseIdentifierWithSpaces(true);
          if (varName) return new VariableReferenceNode(start, varName.end, varName);
        }
        break;
      }

      // Field #
      case TokenKind.HashToken: {
        const next = this.PeekNextToken();

        if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
          this.EatToken();
          const fieldName = this.ParseIdentifierWithSpaces(true);
          if (fieldName) return new FieldReferenceNode(start, fieldName.end, fieldName);
        }
        break;
      }

      // Method $
      case TokenKind.DollarToken: {
        const next = this.PeekNextToken();
        let parsedNode: MethodReferenceNode | ComplexMethodReferenceNode | undefined;

        if (next && next.Kind === TokenKind.OpenParenToken) {
          // Complex method: $(Type, Id).Collection[index].Method
          this.EatToken(); // Eat $
          this.EatToken(); // Eat (

          const typeNode = this.ParseIdentifierWithSpaces();
          let idNode: any = undefined;

          if (typeNode && (this.CurrentToken.Kind as TokenKind) === TokenKind.CommaToken) {
            this.EatToken(); // Eat ,
            idNode =
              this.ParseExpression() ||
              this.ParseLiteral() ||
              this.ParseExpressionIdentifier();
          }

          let closeParenEnd = start;
          if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CloseParenToken) {
            closeParenEnd = this.CurrentToken.Start + 1;
            this.EatToken(); // Eat )
          }

          const pathSpecs: PathSpec[] = [];
          let methodName: IdentifierNode | undefined;

          while (!this.isAtEnd()) {
            const prevEnd = this.PreviousToken.Start + this.PreviousToken.Length;

            if ((this.CurrentToken.Kind as TokenKind) === TokenKind.DotToken) {
              if (prevEnd !== this.CurrentToken.Start) break;

              this.EatToken(); // Eat .
              const ident = this.ParseIdentifierWithSpaces(false, false, false);
              if (!ident) break;

              if ((this.CurrentToken.Kind as TokenKind) === TokenKind.OpenSquareBracketToken) {
                // Don't swallow unrelated brackets (e.g., next definition)
                if (ident.end !== this.CurrentToken.Start) {
                  methodName = ident;
                  break;
                }

                // Collection with index
                this.EatToken(); // Eat [

                let indexExpr = undefined;
                let conditionExpr = undefined;

                if (
                  (this.CurrentToken.Kind as TokenKind) !== TokenKind.CommaToken &&
                  (this.CurrentToken.Kind as TokenKind) !== TokenKind.CloseSquareBracketToken
                ) {
                  indexExpr =
                    this.ParseExpression() ||
                    this.ParseLiteral() ||
                    this.ParseExpressionIdentifier();
                }

                if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CommaToken) {
                  this.EatToken(); // Eat ,
                  conditionExpr =
                    this.ParseExpression() ||
                    this.ParseLiteral() ||
                    this.ParseExpressionIdentifier();
                }

                if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CloseSquareBracketToken) {
                  this.EatToken(); // Eat ]
                }

                pathSpecs.push({
                  collectionName: ident,
                  index: indexExpr,
                  condition: conditionExpr});
              } else {
                // Method or Collection without index?
                if ((this.CurrentToken.Kind as TokenKind) === TokenKind.DotToken) {
                  pathSpecs.push({ collectionName: ident });
                } else {
                  methodName = ident;
                  break;
                }
              }
            } else {
              break;
            }
          }

          if (typeNode) {
            const endPos = this.PreviousToken.Start + this.PreviousToken.Length;
            parsedNode = new ComplexMethodReferenceNode(
              start,
              endPos,
              { type: typeNode, identifier: idNode },
              methodName,
            );
            parsedNode.pathSpecs = pathSpecs;
          }
        } else if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
          this.EatToken(); // Eat $
          let methodName = this.ParseIdentifierWithSpaces(false, false, false);
          
          if (methodName) {
            const pathSpecs: PathSpec[] = [];

            while (!this.isAtEnd()) {
              const prevEnd = this.PreviousToken.Start + this.PreviousToken.Length;

              if ((this.CurrentToken.Kind as TokenKind) === TokenKind.OpenSquareBracketToken) {
                if (prevEnd !== this.CurrentToken.Start) break;

                this.EatToken(); // Eat [

                let indexExpr = undefined;
                let conditionExpr = undefined;

                if ((this.CurrentToken.Kind as TokenKind) !== TokenKind.CommaToken && (this.CurrentToken.Kind as TokenKind) !== TokenKind.CloseSquareBracketToken) {
                  indexExpr = this.ParseExpression() || this.ParseLiteral() || this.ParseExpressionIdentifier();
                }

                if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CommaToken) {
                  this.EatToken(); // Eat ,
                  conditionExpr = this.ParseExpression() || this.ParseLiteral() || this.ParseExpressionIdentifier();
                }

                if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CloseSquareBracketToken) {
                  this.EatToken(); // Eat ]
                }

                if (methodName) {
                  pathSpecs.push({
                    collectionName: methodName,
                    index: indexExpr,
                    condition: conditionExpr
                  });
                }
                methodName = undefined;
              } else if ((this.CurrentToken.Kind as TokenKind) === TokenKind.DotToken) {
                if (prevEnd !== this.CurrentToken.Start) break;

                this.EatToken(); // Eat .
                const ident = this.ParseIdentifierWithSpaces(false, false, false);
                if (!ident) break;

                if (methodName) {
                  pathSpecs.push({ collectionName: methodName });
                }
                
                methodName = ident;
              } else {
                break;
              }
            }

            if (!methodName) methodName = this.createMissingIdentifier();
            parsedNode = new MethodReferenceNode(start, methodName.end, methodName);
            if (pathSpecs.length > 0) parsedNode.pathSpecs = pathSpecs;
          }
        }

        if (parsedNode) {
          if ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
            const savedIndex = this._currentTokenIndex;
            this.EatToken(); // Eat :

            const objectName = this.ParseIdentifierWithSpaces(false, false, false);
            if (objectName) {
              (parsedNode as any).objectName = objectName;
              parsedNode.end = objectName.end;

              if ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
                this.EatToken(); // Eat :
                (parsedNode as any).formula = this.ParseReferenceFormula();
                if ((parsedNode as any).formula) {
                  parsedNode.end = (parsedNode as any).formula.end;
                }
              }
            } else {
              this._currentTokenIndex = savedIndex;
            }
          }
          return parsedNode;
        }

        break;
      }

      // Formula @ or @@
      case TokenKind.AtTheRateToken:
      case TokenKind.DoubleAtTheRateToken: {
        const next = this.PeekNextToken();
        const isGlobal = kind === TokenKind.DoubleAtTheRateToken;

        if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
          this.EatToken();
          const formulaName = this.ParseIdentifierWithSpaces(true);
          if (formulaName) {
            return new FormulaReferenceNode(start, formulaName.end, formulaName, isGlobal);
          }
        } else {
          this.EatToken();
          const emptyIdent = this.createMissingIdentifier();
          return new FormulaReferenceNode(start, start + (isGlobal ? 2 : 1), emptyIdent, isGlobal);
        }
        break;
      }

      // Literal
      case TokenKind.StringLiteralToken:
      case TokenKind.NumberToken:
      case TokenKind.TrueToken:
      case TokenKind.FalseToken:
      case TokenKind.YesToken:
      case TokenKind.NoToken:
      case TokenKind.OnToken:
      case TokenKind.OffToken:
        return new LiteralNode(this.EatToken());

      // Identifier
      default:
        if (this.IsIdentifierToken(kind) || kind === TokenKind.DotToken) {
          return this.ParseIdentifierWithSpaces(true);
        }
        return undefined;
    }

    return undefined;
  }

  protected ExpectIdentifierAndRecover(allowBrackets: boolean = false, allowKeywords: boolean = false, errorMessage: string): IdentifierNode {
    const ident = this.ParseIdentifierWithSpaces(allowBrackets, allowKeywords);
    if (ident) return ident;

    this.addError(errorMessage, this.CurrentToken.Start, this.CurrentToken.Start);
    return this.createMissingIdentifier();
  }

  protected ParseIdentifierWithSpaces(allowBrackets: boolean = false, allowKeywords: boolean = false, allowDots: boolean = true): IdentifierNode | undefined {
    const identifierTokens: Token[] = [];
    let text = "";
    let bracketDepth = 0;

    while (!this.isAtEnd()) {
      // Don't break on newline if we are inside brackets
      if (
        this.HasNewLine(this.PreviousToken, true) ||
        this.HasNewLine(this.CurrentToken, false)
      ) {
        if (identifierTokens.length > 0 && bracketDepth === 0) break;
      }

      if ((this.CurrentToken.Kind as TokenKind) === TokenKind.SpaceToken) {
        if (identifierTokens.length > 0) {
          const hasSpace =
            this.HasSpace(this.PreviousToken, true) ||
            this.HasSpace(this.CurrentToken, false);

          if (hasSpace) text += " ";
        }
        this.MoveToNextToken();
        continue;
      }

      let isBracket = false;
      if (allowBrackets) {
        if (
          (this.CurrentToken.Kind as TokenKind) === TokenKind.OpenSquareBracketToken ||
          (this.CurrentToken.Kind as TokenKind) === TokenKind.OpenParenToken
        ) {
          bracketDepth++;
          isBracket = true;
        } else if (
          (this.CurrentToken.Kind as TokenKind) === TokenKind.CloseSquareBracketToken ||
          (this.CurrentToken.Kind as TokenKind) === TokenKind.CloseParenToken
        ) {
          if (bracketDepth > 0) {
            bracketDepth--;
            isBracket = true;
          } else {
            break;
          }
        }
      }

      // If we are inside brackets, or we just processed a closing bracket, consume the token
      if (bracketDepth > 0 || isBracket) {
        if (identifierTokens.length > 0 && !isBracket && bracketDepth > 0) {
          const hasSpace =
            this.HasSpace(this.PreviousToken, true) ||
            this.HasSpace(this.CurrentToken, false);
          if (hasSpace && text[text.length - 1] !== " ") text += " ";
        }

        identifierTokens.push(this.CurrentToken);
        text += this.CurrentToken.Text;
        this.MoveToNextToken();
        continue;
      }

      if (
        this.IsIdentifierToken((this.CurrentToken.Kind as TokenKind)) ||
        (allowDots && (this.CurrentToken.Kind as TokenKind) === TokenKind.DotToken) ||
        (allowDots && (this.CurrentToken.Kind as TokenKind) === TokenKind.AsteriskToken && this.PreviousToken.Kind === TokenKind.DotToken) ||
        (allowKeywords && this.IsKeywordToken(this.CurrentToken.Kind))
      ) {
        if (identifierTokens.length > 0) {
          const hasSpace =
            this.HasSpace(this.PreviousToken, true) ||
            this.HasSpace(this.CurrentToken, false);

          if (hasSpace && text[text.length - 1] !== " ") text += " ";
        }

        identifierTokens.push(this.CurrentToken);
        text += this.CurrentToken.Text;
        this.MoveToNextToken();
        continue;
      }

      break;
    }

    if (identifierTokens.length > 0) {
      return new IdentifierNode(identifierTokens, text);
    }

    return undefined;
  }

  protected ParseFileNameWithSpaces(): IdentifierNode | undefined {
    const identifierTokens: Token[] = [];

    let text = "";

    while (!this.isAtEnd()) {
      if (
        this.HasNewLine(this.PreviousToken, true) ||
        this.HasNewLine(this.CurrentToken, false)
      ) {
        if (identifierTokens.length > 0) break;
      }

      if ((this.CurrentToken.Kind as TokenKind) === TokenKind.SpaceToken) {
        if (identifierTokens.length > 0) text += " ";

        this.MoveToNextToken();

        continue;
      }

      if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CloseSquareBracketToken) {
        break;
      }

      // Accept ANY token for a filename

      if (identifierTokens.length > 0) {
        const hasSpace =
          this.HasSpace(this.PreviousToken, true) ||
          this.HasSpace(this.CurrentToken, false);

        if (hasSpace) text += " ";
      }

      identifierTokens.push(this.CurrentToken);

      text += this.CurrentToken.Text;

      this.MoveToNextToken();
    }

    if (identifierTokens.length > 0) {
      return new IdentifierNode(identifierTokens, text.trim());
    }

    return undefined;
  }

  protected HasSpace(
    token: Token | null | undefined,
    checkTrailing: boolean,
  ): boolean {
    if (!token) return false;

    const trivia = checkTrailing ? token.Trailing : token.Leading;

    if (!trivia) return false;

    for (const t of trivia) {
      if (t.Kind === TokenKind.SpaceToken) return true;
    }

    return false;
  }

  protected PeekNextToken(): Token | undefined {
    if (this._currentTokenIndex + 1 < this._tokensLength) {
      return this._tokens[this._currentTokenIndex + 1];
    }

    return undefined;
  }
  protected ParseValues(
    colonToken: Token,
    ignoreCommas: boolean = false
  ): (
    | IdentifierNode
    | LiteralNode
    | FunctionCallNode
    | ListNode
    | EmptyNode
  )[] {
    const values: (
      | IdentifierNode
      | LiteralNode
      | FunctionCallNode
      | ListNode
      | EmptyNode
    )[] = [];

    let currentList: (
      | IdentifierNode
      | LiteralNode
      | FunctionCallNode
      | EmptyNode
    )[] = [];

    let expectValue = true;

    let lastSignificantToken: Token = colonToken;

    // Loop token logic is simpler:

    // We either have Content (Identifier/Expression/Literal)

    // Or Separators (Comma, Colon)

    // Or Line Breaks/Ends.

    while (!this.isAtEnd()) {
      // 1. Check for Line Ends/Breaks BEFORE skipping spaces!
      // This is crucial because SpaceToken might have the newline in its trivia!
      if (
        (this.CurrentToken.Kind as TokenKind) === TokenKind.LineFeed ||
        (this.CurrentToken.Kind as TokenKind) === TokenKind.CarriageReturn ||
        (this.CurrentToken.Kind as TokenKind) === TokenKind.CarriageReturnLineFeed ||
        this.HasNewLine(this.PreviousToken, true) ||
        this.HasNewLine(this.CurrentToken, false)
      ) {
        // If previous was separator, check continuation
        if (
          lastSignificantToken.Kind === TokenKind.CommaToken ||
          lastSignificantToken.Kind === TokenKind.LineContinuationToken
        ) {
          // Implicit continuation only works if explicit separator was present
          if (
            (this.CurrentToken.Kind as TokenKind) === TokenKind.LineFeed ||
            (this.CurrentToken.Kind as TokenKind) === TokenKind.CarriageReturn ||
            (this.CurrentToken.Kind as TokenKind) === TokenKind.CarriageReturnLineFeed
          ) {
            this.MoveToNextToken();
            continue;
          }
          // Fall through for implicit/trivia newline
        } else {
          break; // End of line, end of values
        }
      }

      if ((this.CurrentToken.Kind as TokenKind) === TokenKind.SpaceToken) {
        this.MoveToNextToken();
        continue;
      }

      // 2. Line Continuation (+)
      if ((this.CurrentToken.Kind as TokenKind) === TokenKind.LineContinuationToken) {
        this.EatToken();

        lastSignificantToken = this.PreviousToken;

        while (!this.isAtEnd()) {
          const k = (this.CurrentToken.Kind as TokenKind);

          if (
            k === TokenKind.LineFeed ||
            k === TokenKind.CarriageReturn ||
            k === TokenKind.CarriageReturnLineFeed
          ) {
            this.MoveToNextToken();
          } else {
            break;
          }
        }

        continue;
      }

      // 3. Separators

      if ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
        // Flush current list to values

        if (currentList.length > 1) {
          values.push(
            new ListNode(
              currentList[0].start,
              currentList[currentList.length - 1].end,
              [...currentList],
            ),
          );
        } else if (currentList.length === 1) {
          values.push(currentList[0]);
        } else if (expectValue) {
          values.push(new EmptyNode(this.CurrentToken.Start));
        }

        currentList = [];

        this.EatToken();

        lastSignificantToken = this.PreviousToken;

        expectValue = true;

        continue;
      } else if (!ignoreCommas && (this.CurrentToken.Kind as TokenKind) === TokenKind.CommaToken) {
        // Flush current list to values

        if (currentList.length > 1) {
          values.push(
            new ListNode(
              currentList[0].start,
              currentList[currentList.length - 1].end,
              [...currentList],
            ),
          );
        } else if (currentList.length === 1) {
          values.push(currentList[0]);
        } else if (expectValue) {
          values.push(new EmptyNode(this.CurrentToken.Start));
        }

        currentList = [];

        this.EatToken();

        lastSignificantToken = this.PreviousToken;

        expectValue = true;

        continue;
      }

      // 4. Content

      const expr = this.ParseExpression();

      if (expr) {
        currentList.push(expr);

        lastSignificantToken = this.PreviousToken; // Approximation, ParseExpression consumes tokens

        expectValue = false;
      } else {
        // Fallback identifier - consume token if it's not a separator
        const token = this.EatToken();
        currentList.push(new IdentifierNode([token], token.Text));
        lastSignificantToken = token;
        expectValue = false;
      }
    }

    // Flush remaining list

    if (currentList.length > 1) {
      const start = currentList[0].start;

      const end = currentList[currentList.length - 1].end;

      values.push(new ListNode(start, end, [...currentList]));
    } else if (currentList.length === 1) {
      values.push(currentList[0]);
    } else if (expectValue && values.length > 0) {
      // Only push empty if we were expecting a value (trailing colon/comma) BUT make sure it's valid context

      // e.g. "Key: " -> values empty. expectValue=true.

      // If values.length > 0 means we had at least one colon previously.

      values.push(new EmptyNode(this.PreviousToken.Start + 1));
    }

    return values;
  }
}

