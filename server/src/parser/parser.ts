
import { AttributeNode, DefinitionNode, DiagnosticError, IdentifierNode, LiteralNode, SourceFile, StatementNode, SyntaxKind } from "./ast";
import { Lexer } from "./lexer";
import { Token } from "./token";
import { TokenKind } from "./tokenKind";

export class Parser {
    _tokens: Token[];
    _tokensLength: number;
    _currentTokenIndex: number = 0;
    _currentToken: Token | null = null;
    private errors: DiagnosticError[] = [];

    constructor(input: string) {
        const lexer = new Lexer(input);
        this._tokens = lexer.Generate();
        this._tokensLength = this._tokens.length;
    }

    public get CurrentToken() {
        return this._currentToken ??= this.FetchCurrentToken();
    }

    public get PreviousToken() {
        return this._tokens[this._currentTokenIndex - 1];
    }

    public FetchCurrentToken(): Token {
        if (this._currentTokenIndex >= this._tokensLength) {
            return this._tokens[this._tokensLength - 1];
        }
        return this._tokens[this._currentTokenIndex];
    }

    private match(kind: TokenKind): boolean {
        return !this.isAtEnd() && this.CurrentToken.Kind === kind;
    }

    private Expect(kind: TokenKind, message: string): Token | undefined {
        if (this.match(kind)) {
            this.MoveToNextToken();
            return this.PreviousToken;
        }
        const token = this.CurrentToken;
        this.addError(message, token.Start, token.Start + token.Length);
        return undefined;
    }

    private EatToken(): Token {
        const token = this.CurrentToken;
        this.MoveToNextToken();
        return token;
    }

    private isAtEnd(): boolean {
        return this.CurrentToken.Kind === TokenKind.EndOfFileToken;
    }

    public MoveToNextToken() {
        this._currentTokenIndex++;
        this._currentToken = null;
    }

    private addError(message: string, start: number, end: number) {
        this.errors.push({ message, start, end });
    }

    private IsIdentifierToken(kind: TokenKind): boolean {
        if (kind === TokenKind.IdentifierToken || kind === TokenKind.NumberToken) return true;
        if (kind >= 700) return true; // DefTypes like Form, Report
        if (kind >= 400 && kind < 500) return true; // Keywords like True, False, And, Or
        return false;
    }

    private HasNewLine(token: Token | null | undefined, checkTrailing: boolean): boolean {
        if (!token) return false;
        const trivia = checkTrailing ? token.Trailing : token.Leading;
        if (!trivia) return false;

        for (const t of trivia) {
            if (t.Kind === TokenKind.LineFeed ||
                t.Kind === TokenKind.CarriageReturnLineFeed ||
                t.Kind === TokenKind.CarriageReturn) {
                return true;
            }
        }
        return false;
    }

    public parse(): SourceFile {
        const start = 0;
        const end = this._tokens.length > 0 ? this._tokens[this._tokensLength - 1].Start : 0;
        const sourceFile = new SourceFile(start, end);

        while (!this.isAtEnd()) {
            switch (this.CurrentToken.Kind) {
                case TokenKind.OpenSquareBracketToken:
                    const def = this.ParseDefinitionStatement();
                    if (def) {
                        sourceFile.definitions.push(def);
                    } else {
                        this.MoveToNextToken();
                    }
                    break;
                case TokenKind.SingleLineComment:
                case TokenKind.MultiLineComment:
                case TokenKind.SpaceToken:
                case TokenKind.LineFeed:
                case TokenKind.CarriageReturn:
                case TokenKind.CarriageReturnLineFeed:
                    this.MoveToNextToken();
                    break;
                default:
                    this.MoveToNextToken();
                    break;
            }
        }
        return sourceFile;
    }

    private ParseDefinitionStatement(): DefinitionNode | undefined {
        const start = this.CurrentToken.Start;
        const openBracket = this.Expect(TokenKind.OpenSquareBracketToken, "Expected [ to start definition");
        if (!openBracket) { return undefined; }

        let modifier: Token | undefined;
        // Check for modifier tokens: #, !, *
        if (this.CurrentToken.Kind === TokenKind.HashToken ||
            this.CurrentToken.Kind === TokenKind.ExclamationToken ||
            this.CurrentToken.Kind === TokenKind.AsteriskToken) {
            modifier = this.EatToken();
        }

        const defType = this.ParseIdentifierWithSpaces();
        if (!defType) {
            this.addError("Expected Definition Type", this.CurrentToken.Start, this.CurrentToken.Start);
        }

        const colonToken = this.Expect(TokenKind.ColonToken, "Expected : after Definition type");

        const defName = this.ParseIdentifierWithSpaces();

        const closeBracketToken = this.Expect(TokenKind.CloseSquareBracketToken, "Expected ] after Definition name");

        if (defType && closeBracketToken) {
            const end = closeBracketToken.Start + closeBracketToken.Length;
            const defNode = new DefinitionNode(start, end, openBracket, defType, closeBracketToken);
            defNode.colon = colonToken;
            defNode.name = defName;
            defNode.modifier = modifier;

            if (defType.text === "Function") {
                this.ParseFunctionBody(defNode);
            } else {
                this.ParseAttributes(defNode);
            }

            return defNode;
        }
        return undefined;
    }

    private ParseFunctionBody(defNode: DefinitionNode) {
        while (!this.isAtEnd()) {
            if (this.CurrentToken.Kind === TokenKind.OpenSquareBracketToken || this.isAtEnd()) {
                break;
            }

            // Handle Inline Directives
            if (this.CurrentToken.Kind === TokenKind.LessThanToken) {
                this.ConsumeDirective();
                continue;
            }

            const start = this.CurrentToken.Start;
            // Check if it's an Attribute (Parameter, Variable, Returns, Object)
            const text = this.CurrentToken.Text;
            const isAttribute = text === "Parameter" || text === "Variable" || text === "Returns" || text === "Object";

            if (isAttribute) {
                const attrName = this.ParseIdentifierWithSpaces();
                if (attrName && this.CurrentToken.Kind === TokenKind.ColonToken) {
                    const colon = this.EatToken();
                    const values = this.ParseValues(colon);
                    if (values.length > 0) {
                        const end = values[values.length - 1].end;
                        defNode.attributes.push(new AttributeNode(start, end, attrName, colon, values));
                    }
                } else {
                    this.MoveToNextToken(); // Skip invalid
                }
            } else {
                // Parse Statement
                this.ParseStatement(defNode);
            }
        }
    }

    private ConsumeDirective() {
        // Consume <
        this.EatToken();
        // Consume until > or EOF
        while (!this.isAtEnd()) {
            if (this.CurrentToken.Kind === TokenKind.GreaterThanToken) {
                this.EatToken();
                break;
            }
            this.MoveToNextToken();
        }
    }

    private ParseStatement(defNode: DefinitionNode) {
        const start = this.CurrentToken.Start;
        const label = this.ParseIdentifierWithSpaces(); // Can be "01" or "Start"
        if (!label) {
            this.MoveToNextToken();
            return;
        }

        if (this.CurrentToken.Kind === TokenKind.ColonToken) {
            this.EatToken(); // Consume colon after label

            const action = this.ParseIdentifierWithSpaces();
            if (action && this.CurrentToken.Kind === TokenKind.ColonToken) {
                this.EatToken(); // Consume colon after action
                const args = this.ParseValues(this.PreviousToken) as any[]; // Reuse ParseValues, cast to ExpressionNode[]

                // Filter out non-expressions if any? ParseValues returns identifiers/literals too which are Expressions
                const stmt = new StatementNode(label, action, args);
                defNode.statements.push(stmt);
            }
        }
    }

    private ParseValues(colonToken: Token): (IdentifierNode | LiteralNode | any)[] {
        const values: (IdentifierNode | LiteralNode | any)[] = [];
        let justContinued = false; // Flag to track if we just processed a + continuation
        while (!this.isAtEnd()) {
            // Check for NewLine boundary
            if (this.HasNewLine(colonToken, true) && values.length === 0) {
                // Empty attribute with newline after colon
            }

            // Check for Line Continuation (+)
            if (this.CurrentToken.Kind === TokenKind.PlusToken) {
                this.EatToken();
                // Consume subsequent newlines to continue on next line
                while (!this.isAtEnd()) {
                    const kind = this.CurrentToken.Kind;
                    if (kind === TokenKind.LineFeed ||
                        kind === TokenKind.CarriageReturn) {
                        this.MoveToNextToken();
                    } else {
                        break;
                    }
                }
                justContinued = true; // We just processed a continuation
                continue;
            }

            // Normal NewLine check (if not just continued)
            if (!justContinued && (this.HasNewLine(this.PreviousToken, true) || this.HasNewLine(this.CurrentToken, false) ||
                this.CurrentToken.Kind === TokenKind.LineFeed || this.CurrentToken.Kind === TokenKind.CarriageReturn)) {
                break;
            }
            justContinued = false; // Reset flag after processing one value

            if (this.CurrentToken.Kind === TokenKind.OpenSquareBracketToken) {
                break;
            }

            if (this.CurrentToken.Kind === TokenKind.CommaToken) {
                this.EatToken();
                continue;
            }

            const expr = this.ParseExpression();
            if (expr) {
                values.push(expr);
            } else {
                // Fallback
                const token = this.EatToken();
                values.push(new IdentifierNode([token], token.Text));
            }
        }
        return values;
    }

    private ParseAttributes(defNode: DefinitionNode) {
        while (!this.isAtEnd()) {
            if (this.CurrentToken.Kind === TokenKind.OpenSquareBracketToken || this.isAtEnd()) {
                break;
            }

            const start = this.CurrentToken.Start;
            const attrName = this.ParseIdentifierWithSpaces();
            if (!attrName) {
                this.MoveToNextToken();
                continue;
            }

            if (this.CurrentToken.Kind === TokenKind.ColonToken) {
                const colon = this.EatToken();
                const values = this.ParseValues(colon);

                if (values.length > 0) {
                    const end = values[values.length - 1].end;
                    const attrNode = new AttributeNode(start, end, attrName, colon, values);
                    defNode.attributes.push(attrNode);
                }
            } else {
                this.MoveToNextToken();
            }
        }
    }

    private ParseExpression(): any | undefined {
        const start = this.CurrentToken.Start;

        // Function Call $$Func:Arg:Arg
        if (this.CurrentToken.Kind === TokenKind.DoubleDollarToken) {
            const next = this.PeekNextToken();
            if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
                this.EatToken(); // Eat $$
                const funcName = this.ParseIdentifierWithSpaces();
                if (funcName) {
                    return { kind: SyntaxKind.FunctionCall, start, end: funcName.end, functionName: funcName };
                }
            }
        }

        // Variable ##Var
        if (this.CurrentToken.Kind === TokenKind.DoubleHashToken) {
            const next = this.PeekNextToken();
            if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
                this.EatToken();
                const varName = this.ParseIdentifierWithSpaces();
                if (varName) {
                    return { kind: SyntaxKind.VariableReference, start, end: varName.end, variableName: varName };
                }
            }
        }

        // Field #
        if (this.CurrentToken.Kind === TokenKind.HashToken) {
            const next = this.PeekNextToken();
            if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
                this.EatToken();
                const fieldName = this.ParseIdentifierWithSpaces();
                if (fieldName) {
                    return { kind: SyntaxKind.FieldReference, start, end: fieldName.end, fieldName: fieldName };
                }
            }
        }

        // Method $
        if (this.CurrentToken.Kind === TokenKind.DollarToken) {
            const next = this.PeekNextToken();
            if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
                this.EatToken();
                const methodName = this.ParseIdentifierWithSpaces();
                if (methodName) {
                    return { kind: SyntaxKind.MethodReference, start, end: methodName.end, methodName: methodName };
                }
            }
        }

        // Formula @ or @@
        if (this.CurrentToken.Kind === TokenKind.AtTheRateToken || this.CurrentToken.Kind === TokenKind.DoubleAtTheRateToken) {
            const next = this.PeekNextToken();
            if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
                const isGlobal = this.CurrentToken.Kind === TokenKind.DoubleAtTheRateToken;
                this.EatToken();
                const formulaName = this.ParseIdentifierWithSpaces();
                if (formulaName) {
                    return { kind: SyntaxKind.FormulaReference, start, end: formulaName.end, formulaName: formulaName, isGlobal };
                }
            }
        }

        // Literal
        if (this.CurrentToken.Kind === TokenKind.StringLiteralToken) {
            return new LiteralNode(this.EatToken());
        }

        // Identifier
        if (this.IsIdentifierToken(this.CurrentToken.Kind) || this.CurrentToken.Kind === TokenKind.DotToken) {
            return this.ParseIdentifierWithSpaces();
        }

        return undefined;
    }



    private ParseIdentifierWithSpaces(): IdentifierNode | undefined {
        const identifierTokens: Token[] = [];
        let text = "";

        while (!this.isAtEnd()) {
            if (this.HasNewLine(this.PreviousToken, true) || this.HasNewLine(this.CurrentToken, false)) {
                if (identifierTokens.length > 0) break;
            }

            if (this.IsIdentifierToken(this.CurrentToken.Kind)) {
                if (identifierTokens.length > 0) {
                    const hasSpace = this.HasSpace(this.PreviousToken, true) || this.HasSpace(this.CurrentToken, false);
                    if (hasSpace) {
                        text += " ";
                    }
                }
                identifierTokens.push(this.CurrentToken);
                text += this.CurrentToken.Text;
                this.MoveToNextToken();

            } else if (this.CurrentToken.Kind === TokenKind.DotToken) {
                if (identifierTokens.length > 0) {
                    // Check leading trivia? Usually dot doesn't have space before it in file.txt
                    // But if it did "file . txt", HasSpace checks below would handle?
                    // No, "HasSpace" is only called if NEXT token is Identifier.
                    // Here current is Dot.
                    // We should check space BEFORE dot?
                    const hasSpace = this.HasSpace(this.PreviousToken, true) || this.HasSpace(this.CurrentToken, false);
                    if (hasSpace) text += " ";
                }
                identifierTokens.push(this.CurrentToken);
                text += this.CurrentToken.Text;
                this.MoveToNextToken();
            } else {
                // If not an identifier token (e.g. symbol), check if we can continue?
                // TDL Identifiers can include some symbols? No, strict Lexer.
                // But spaces handling is done above.
                break;
            }
        }

        if (identifierTokens.length > 0) {
            return new IdentifierNode(identifierTokens, text);
        }
        return undefined;
    }

    private HasSpace(token: Token | null | undefined, checkTrailing: boolean): boolean {
        if (!token) return false;
        const trivia = checkTrailing ? token.Trailing : token.Leading;
        if (!trivia) return false;

        for (const t of trivia) {
            if (t.Kind === TokenKind.SpaceToken) return true;
        }
        return false;
    }

    private PeekNextToken(): Token | undefined {
        if (this._currentTokenIndex + 1 < this._tokensLength) {
            return this._tokens[this._currentTokenIndex + 1];
        }
        return undefined;
    }
}
