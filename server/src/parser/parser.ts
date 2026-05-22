
import { AttributeNode, DefinitionNode, DiagnosticError, IdentifierNode, LiteralNode, SourceFile, StatementNode, SyntaxKind, EmptyNode, FunctionCallNode, CommentNode, ListNode, BlockStatementNode, IfNode, WhileNode, ForNode, WalkNode, BinaryExpressionNode, UnaryExpressionNode, ComplexMethodReferenceNode, BatchPostNode, MsgBoxNode, ZipNode, UnzipNode, PathSpec } from "./ast";
import { Lexer } from "./lexer";
import { Token } from "./token";
import { TokenKind } from "./tokenKind";

export class Parser {
    _tokens: Token[];
    _tokensLength: number;
    _currentTokenIndex: number = 0;
    _currentToken: Token | null = null;
    private errors: DiagnosticError[] = [];
    private _text: string;

    constructor(input: string) {
        this._text = input;
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

    private HasNewLine(token: Token, trailing: boolean): boolean {
        if (!token) return false;
        // Checking for new lines in "Leading" and "Trailing" trivia
        const trivia = trailing ? token.Trailing : token.Leading;
        if (trivia) {
            for (let i = 0; i < trivia.length; i++) {
                const k = trivia[i].Kind;
                if (k === TokenKind.LineFeed || k === TokenKind.CarriageReturn || k === TokenKind.CarriageReturnLineFeed) {
                    return true;
                }
            }
        }
        return false;
    }

    public parse(): SourceFile {
        const sourceFile = new SourceFile(0, 0);
        this.parseInternal(sourceFile);
        return sourceFile;
    }

    public parseStandaloneAttributes(): AttributeNode[] {
        const dummyDef = new DefinitionNode(0, 0, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 0), new IdentifierNode([], 'Dummy'), new Token(TokenKind.CloseSquareBracketToken, 0, 0, 0));
        this.ParseAttributes(dummyDef);
        return dummyDef.attributes;
    }

    public parseStandaloneStatements(): StatementNode[] {
        const dummyDef = new DefinitionNode(0, 0, new Token(TokenKind.OpenSquareBracketToken, 0, 0, 0), new IdentifierNode([], 'Dummy'), new Token(TokenKind.CloseSquareBracketToken, 0, 0, 0));
        while (!this.isAtEnd()) {
            this.ParseStatement(dummyDef);
            // Move to next token if not consumed by ParseStatement
            if (this.CurrentToken.Kind === TokenKind.LineFeed || 
                this.CurrentToken.Kind === TokenKind.CarriageReturn ||
                this.CurrentToken.Kind === TokenKind.CarriageReturnLineFeed) {
                this.MoveToNextToken();
            } else if (!this.isAtEnd() && dummyDef.statements.length === 0) {
                this.MoveToNextToken();
            }
        }
        return dummyDef.statements;
    }

    private parseInternal(sourceFile: SourceFile) {
        const start = 0;
        const end = this._tokens.length > 0 ? this._tokens[this._tokensLength - 1].Start : 0;
        sourceFile.start = start;
        sourceFile.end = end;
        sourceFile.tokens = this._tokens;

        // Compute Line Offsets immediately
        sourceFile.lineOffsets = [0];
        for (let i = 0; i < this._text.length; i++) {
            if (this._text[i] === '\n') {
                sourceFile.lineOffsets.push(i + 1);
            }
        }


        // Extract comments from Token Trivia
        // The Lexer attaches comments to Leading/Trailing trivia of tokens
        for (const token of this._tokens) {
            if (token.Leading) {
                for (const trivia of token.Leading) {
                    if (trivia.Kind === TokenKind.SingleLineComment || trivia.Kind === TokenKind.MultiLineComment) {
                        const isMulti = trivia.Kind === TokenKind.MultiLineComment;
                        sourceFile.comments.push(new CommentNode(trivia.Start, trivia.Start + trivia.Length, trivia.Text, isMulti));
                    }
                }
            }
            // Usage of Trailing vs Leading: Dictionary uses Leading mostly for subsequent tokens.
            // But check Trailing too just in case.
            if (token.Trailing) {
                for (const trivia of token.Trailing) {
                    if (trivia.Kind === TokenKind.SingleLineComment || trivia.Kind === TokenKind.MultiLineComment) {
                        const isMulti = trivia.Kind === TokenKind.MultiLineComment;
                        sourceFile.comments.push(new CommentNode(trivia.Start, trivia.Start + trivia.Length, trivia.Text, isMulti));
                    }
                }
            }
        }

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
                // Tokens that might appear in main stream (though Lexer handles most whitespace/comments in trivia)
                // Leaving these for robustness if Lexer behavior changes or for specific manual tokens
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
        sourceFile.errors = this.errors;
        return sourceFile;
    }

    /**
     * Create a synthetic "missing" token for error recovery
     * This allows the parser to continue even when expected tokens are missing
     */
    private createMissingToken(kind: TokenKind): Token {
        const pos = this.CurrentToken?.Start ?? this._tokens[this._tokensLength - 1]?.Start ?? 0;
        const token = new Token(TokenKind.MissingToken, pos, pos, 0);
        token.Text = '';
        return token;
    }

    /**
     * Create a synthetic "missing" identifier for error recovery
     */
    private createMissingIdentifier(): IdentifierNode {
        const token = this.createMissingToken(TokenKind.IdentifierToken);
        return new IdentifierNode([token], '');
    }

    /**
     * Parse a definition statement with error recovery.
     * Creates partial DefinitionNode even if input is incomplete.
     * The `isIncomplete` flag will be set to true for invalid/partial definitions.
     */
    private ParseDefinitionStatement(): DefinitionNode | undefined {
        const start = this.CurrentToken.Start;
        const openBracket = this.Expect(TokenKind.OpenSquareBracketToken, "Expected [ to start definition");
        if (!openBracket) { return undefined; }

        let isIncomplete = false;
        let modifier: Token | undefined;

        // Check for modifier tokens: #, !, *
        if (this.CurrentToken.Kind === TokenKind.HashToken ||
            this.CurrentToken.Kind === TokenKind.ExclamationToken ||
            this.CurrentToken.Kind === TokenKind.AsteriskToken) {
            modifier = this.EatToken();
        }

        // Parse definition type (required, but use recovery if missing)
        let defType = this.ParseIdentifierWithSpaces();
        if (!defType) {
            this.addError("Expected Definition Type", this.CurrentToken.Start, this.CurrentToken.Start);
            defType = this.createMissingIdentifier();
            isIncomplete = true;
        }

        // Parse colon (optional in incomplete state)
        let colonToken: Token | undefined;
        if (this.match(TokenKind.ColonToken)) {
            colonToken = this.EatToken();
        } else if (!this.match(TokenKind.CloseSquareBracketToken) && !this.isAtEnd()) {
            // Expected colon but found something else
            this.addError("Expected : after Definition type", this.CurrentToken.Start, this.CurrentToken.Start);
            isIncomplete = true;
        }

        // Parse definition name (optional)
        let defName: IdentifierNode | undefined;
        defName = this.ParseFileNameWithSpaces();

        // Parse close bracket (use recovery token if missing)
        let closeBracketToken: Token;
        if (this.match(TokenKind.CloseSquareBracketToken)) {
            closeBracketToken = this.EatToken();
        } else {
            // Missing close bracket - use synthetic token and mark incomplete
            this.addError("Expected ] after Definition name", this.CurrentToken.Start, this.CurrentToken.Start);
            closeBracketToken = this.createMissingToken(TokenKind.CloseSquareBracketToken);
            isIncomplete = true;
        }

        // Always create DefinitionNode (error recovery)
        const end = closeBracketToken.Kind !== TokenKind.MissingToken
            ? closeBracketToken.Start + 1
            : this.CurrentToken.Start;

        const defNode = new DefinitionNode(start, end, openBracket, defType, closeBracketToken);
        defNode.colon = colonToken;
        defNode.name = defName;
        defNode.modifier = modifier;
        defNode.isIncomplete = isIncomplete;

        // Only parse body if definition header is complete
        if (!isIncomplete) {
            if (defType.text === "Function") {
                this.ParseFunctionBody(defNode);
            } else {
                this.ParseAttributes(defNode);
            }

            // Apply Block Grouping to statements
            if (defNode.statements.length > 0) {
                defNode.statements = this.GroupStatements(defNode.statements);
            }

            // Update definition end to include body
            if (defNode.attributes.length > 0) {
                defNode.end = defNode.attributes[defNode.attributes.length - 1].end;
            }
            if (defNode.statements.length > 0) {
                const lastStmt = defNode.statements[defNode.statements.length - 1];
                if (lastStmt.end > defNode.end) {
                    defNode.end = lastStmt.end;
                }
            }
        }

        return defNode;
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
            if (action) {
                let rawArgs: any[] = [];
                if (this.CurrentToken.Kind === TokenKind.ColonToken) {
                    this.EatToken(); // Consume colon after action
                    rawArgs = this.ParseValues(this.PreviousToken);
                }
                const args: any[] = [];
                for (const arg of rawArgs) {
                    if (arg.kind === SyntaxKind.List) {
                        args.push(...(arg as ListNode).values);
                    } else {
                        args.push(arg);
                    }
                }

                const stmt = new StatementNode(label, action, args);
                defNode.statements.push(stmt);
            }
        }
    }

    private ParseValues(colonToken: Token): (IdentifierNode | LiteralNode | FunctionCallNode | ListNode | EmptyNode)[] {
        const values: (IdentifierNode | LiteralNode | FunctionCallNode | ListNode | EmptyNode)[] = [];
        let currentList: (IdentifierNode | LiteralNode | FunctionCallNode | EmptyNode)[] = [];
        let expectValue = true;
        let lastSignificantToken: Token = colonToken;

        // Loop token logic is simpler:
        // We either have Content (Identifier/Expression/Literal)
        // Or Separators (Comma, Colon)
        // Or Line Breaks/Ends.

        while (!this.isAtEnd()) {
            if (this.CurrentToken.Kind === TokenKind.OpenSquareBracketToken) {
                break;
            }

            if (this.CurrentToken.Kind === TokenKind.SpaceToken) {
                this.MoveToNextToken();
                continue;
            }

            // 1. Line Continuation (+) - Check BEFORE Line Ends because + usually starts on new line
            if (this.CurrentToken.Kind === TokenKind.PlusToken) {
                const isContinuation = this.HasNewLine(this.PreviousToken, true) || this.HasNewLine(this.CurrentToken, false) || this.HasNewLine(this.CurrentToken, true);
                if (isContinuation) {
                    this.EatToken();
                    lastSignificantToken = this.PreviousToken;
                    while (!this.isAtEnd()) {
                        const k = this.FetchCurrentToken().Kind;
                        if (k === TokenKind.LineFeed || k === TokenKind.CarriageReturn || k === TokenKind.CarriageReturnLineFeed) {
                            this.MoveToNextToken();
                        } else {
                            break;
                        }
                    }
                    continue;
                }
                // Else it's arithmetic, let ParseExpression handle it
            }

            // 2. Check for Line Ends/Breaks
            // Check explicit NewLine tokens OR Implicit NewLines in Trivia
            if (this.CurrentToken.Kind === TokenKind.LineFeed ||
                this.CurrentToken.Kind === TokenKind.CarriageReturn ||
                this.CurrentToken.Kind === TokenKind.CarriageReturnLineFeed ||
                this.HasNewLine(this.PreviousToken, true) ||
                this.HasNewLine(this.CurrentToken, false)) {

                // If previous was separator, check continuation
                if (lastSignificantToken.Kind === TokenKind.CommaToken ||
                    lastSignificantToken.Kind === TokenKind.PlusToken) {

                    // Implicit continuation only works if explicit separator was present
                    // (PlusToken continuation handled above)
                    if (this.CurrentToken.Kind === TokenKind.LineFeed ||
                        this.CurrentToken.Kind === TokenKind.CarriageReturn ||
                        this.CurrentToken.Kind === TokenKind.CarriageReturnLineFeed) {
                        this.MoveToNextToken();
                        continue;
                    }
                    // Fall through for implicit/trivia newline
                } else {
                    break; // End of line, end of attributes
                }
            }

            // 3. Separators
            if (this.CurrentToken.Kind === TokenKind.ColonToken) {
                // Flush current list to values
                if (currentList.length > 1) {
                    values.push(new ListNode(currentList[0].start, currentList[currentList.length - 1].end, [...currentList]));
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

            } else if (this.CurrentToken.Kind === TokenKind.CommaToken) {
                // Flush current list to values
                if (currentList.length > 1) {
                    values.push(new ListNode(currentList[0].start, currentList[currentList.length - 1].end, [...currentList]));
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
                if (this.IsIdentifierToken(this.CurrentToken.Kind)) {
                    const token = this.EatToken();
                    currentList.push(new IdentifierNode([token], token.Text));
                    lastSignificantToken = token;
                    expectValue = false;
                } else {
                    break; // Should not happen if logic is correct
                }
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

                let end = colon.Start + 1;
                if (values.length > 0) {
                    end = values[values.length - 1].end;
                }
                const attrNode = new AttributeNode(start, end, attrName, colon, values);
                defNode.attributes.push(attrNode);
            } else {
                this.MoveToNextToken();
            }
        }
    }

    private ParseLiteral(): LiteralNode | undefined {
        if (this.CurrentToken.Kind === TokenKind.StringLiteralToken ||
            this.CurrentToken.Kind === TokenKind.NumberToken) {
            return new LiteralNode(this.EatToken());
        }
        return undefined;
    }

    private ParseExpressionIdentifier(): IdentifierNode | undefined {
        return this.ParseIdentifierWithSpaces();
    }

    private ParseExpression(): any | undefined {
        return this.ParseStringExpression();
    }

    private ParseStringExpression(): any | undefined {
        let left = this.ParseComparisonExpression();
        while (left && this.IsStringOperator(this.CurrentToken.Kind)) {
            const op = this.EatToken();
            const right = this.ParseComparisonExpression();
            if (!right) break;
            left = new BinaryExpressionNode(left.start, right.end, left, op, right);
        }
        return left;
    }

    private IsStringOperator(kind: TokenKind) {
        return kind === TokenKind.ContainsToken || kind === TokenKind.ContainingToken || 
               kind === TokenKind.StartingToken || kind === TokenKind.StartingWithToken ||
               kind === TokenKind.EndingToken || kind === TokenKind.EndingWithToken ||
               kind === TokenKind.LikeToken;
    }

    private ParseComparisonExpression(): any | undefined {
        let left = this.ParseLogicalOrExpression();
        while (left && this.IsComparisonOperator(this.CurrentToken.Kind)) {
            const op = this.EatToken();
            const right = this.ParseLogicalOrExpression();
            if (!right) break;
            left = new BinaryExpressionNode(left.start, right.end, left, op, right);
        }
        return left;
    }

    private IsComparisonOperator(kind: TokenKind) {
        return kind === TokenKind.EqualsToken || kind === TokenKind.LessThanToken || 
               kind === TokenKind.GreaterThanToken || kind === TokenKind.LessThanEqualsToken ||
               kind === TokenKind.GreaterThanEqualsToken || kind === TokenKind.NotEqualsToken ||
               kind === TokenKind.InToken || kind === TokenKind.BetweenToken || kind === TokenKind.NullToken;
    }

    private ParseLogicalOrExpression(): any | undefined {
        let left = this.ParseLogicalAndExpression();
        while (left && this.CurrentToken.Kind === TokenKind.OrToken) {
            const op = this.EatToken();
            const right = this.ParseLogicalAndExpression();
            if (!right) break;
            left = new BinaryExpressionNode(left.start, right.end, left, op, right);
        }
        return left;
    }

    private ParseLogicalAndExpression(): any | undefined {
        let left = this.ParseLogicalNotExpression();
        while (left && this.CurrentToken.Kind === TokenKind.AndToken) {
            const op = this.EatToken();
            const right = this.ParseLogicalNotExpression();
            if (!right) break;
            left = new BinaryExpressionNode(left.start, right.end, left, op, right);
        }
        return left;
    }

    private ParseLogicalNotExpression(): any | undefined {
        if (this.CurrentToken.Kind === TokenKind.NotToken) {
            const op = this.EatToken();
            const right = this.ParseLogicalNotExpression();
            if (right) {
                return new UnaryExpressionNode(op.Start, right.end, op, right);
            }
            return undefined;
        }
        return this.ParseArithmeticAddSubExpression();
    }

    private ParseArithmeticAddSubExpression(): any | undefined {
        let left = this.ParseArithmeticMulDivExpression();
        while (left && (this.CurrentToken.Kind === TokenKind.PlusToken || this.CurrentToken.Kind === TokenKind.MinusToken)) {
            if (this.CurrentToken.Kind === TokenKind.PlusToken) {
                const hasNewline = this.HasNewLine(this.PreviousToken, true) || this.HasNewLine(this.CurrentToken, false) || this.HasNewLine(this.CurrentToken, true);
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

    private ParseArithmeticMulDivExpression(): any | undefined {
        let left = this.ParsePrimaryExpression();
        while (left && (this.CurrentToken.Kind === TokenKind.AsteriskToken || this.CurrentToken.Kind === TokenKind.DivisionToken || this.CurrentToken.Kind === TokenKind.PercentToken)) {
            const op = this.EatToken();
            const right = this.ParsePrimaryExpression();
            if (!right) break;
            left = new BinaryExpressionNode(left.start, right.end, left, op, right);
        }
        return left;
    }

    private GroupStatements(statements: StatementNode[]): StatementNode[] {
        const result: StatementNode[] = [];
        const stack: { node: any, targetArray: StatementNode[] }[] = [];

        for (const stmt of statements) {
            const actionText = ((stmt as any).action?.text || '').replace(/\s+/g, '').toUpperCase();
            
            let targetArray = stack.length > 0 ? stack[stack.length - 1].targetArray : result;

            if (actionText === "IF") {
                const ifNode = new IfNode(stmt);
                ifNode.condition = stmt.args.length > 0 ? stmt.args[0] : undefined;
                targetArray.push(ifNode);
                stack.push({ node: ifNode, targetArray: ifNode.statements });
            } else if (actionText === "ELSE") {
                if (stack.length > 0 && stack[stack.length - 1].node instanceof IfNode) {
                    const parentIf = stack[stack.length - 1].node as IfNode;
                    parentIf.elseStatements.push(stmt);
                    stack[stack.length - 1].targetArray = parentIf.elseStatements;
                } else {
                    targetArray.push(stmt);
                }
            } else if (actionText === "WHILE") {
                const whileNode = new WhileNode(stmt);
                whileNode.condition = stmt.args.length > 0 ? stmt.args[0] : undefined;
                targetArray.push(whileNode);
                stack.push({ node: whileNode, targetArray: whileNode.statements });
            } else if (actionText === "FORTOKEN" || actionText === "FORCOLLECTION" || actionText === "FORRANGE" || actionText === "FOR") {
                const forNode = new ForNode(stmt);
                forNode.iteratorVariable = stmt.args.length > 0 && stmt.args[0].kind === SyntaxKind.Identifier ? stmt.args[0] as IdentifierNode : undefined;
                forNode.collectionName = stmt.args.length > 1 ? stmt.args[1] : undefined;
                targetArray.push(forNode);
                stack.push({ node: forNode, targetArray: forNode.statements });
            } else if (actionText === "WALKCOLLECTION" || actionText === "WALK") {
                const walkNode = new WalkNode(stmt);
                walkNode.collectionName = stmt.args.length > 0 ? stmt.args[0] : undefined;
                targetArray.push(walkNode);
                stack.push({ node: walkNode, targetArray: walkNode.statements });
            } else if (actionText === "STARTBATCHPOST") {
                const batchNode = new BatchPostNode(stmt);
                batchNode.batchSize = stmt.args.length > 0 ? stmt.args[0] : undefined;
                targetArray.push(batchNode);
                stack.push({ node: batchNode, targetArray: batchNode.statements });
            } else if (actionText === "STARTMSGBOX") {
                const msgNode = new MsgBoxNode(stmt);
                msgNode.title = stmt.args.length > 0 ? stmt.args[0] : undefined;
                msgNode.message = stmt.args.length > 1 ? stmt.args[1] : undefined;
                targetArray.push(msgNode);
                stack.push({ node: msgNode, targetArray: msgNode.statements });
            } else if (actionText === "STARTZIP") {
                const zipNode = new ZipNode(stmt);
                zipNode.targetFile = stmt.args.length > 0 ? stmt.args[0] : undefined;
                zipNode.overwrite = stmt.args.length > 1 ? stmt.args[1] : undefined;
                targetArray.push(zipNode);
                stack.push({ node: zipNode, targetArray: zipNode.statements });
            } else if (actionText === "STARTUNZIP") {
                const unzipNode = new UnzipNode(stmt);
                unzipNode.sourceFile = stmt.args.length > 0 ? stmt.args[0] : undefined;
                unzipNode.password = stmt.args.length > 1 ? stmt.args[1] : undefined;
                targetArray.push(unzipNode);
                stack.push({ node: unzipNode, targetArray: unzipNode.statements });
            } else if (actionText.startsWith("END") && actionText.length > 3) {
                if (stack.length > 0) {
                    const popped = stack.pop();
                    if (popped) {
                        popped.node.end = stmt.end;
                        if (popped.node instanceof BlockStatementNode) {
                            popped.node.endStatement = stmt;
                        }
                        
                        const poppedActionText = ((popped.node as any).action?.text || '').replace(/\s+/g, '').toUpperCase();
                        const expectedEnd = "END" + poppedActionText;
                        
                        let isMatch = actionText === expectedEnd;
                        
                        // Handle special cases where block starts with a complex name but ends with a generic name
                        if (!isMatch) {
                            if (actionText === "ENDFOR" && poppedActionText.startsWith("FOR")) {
                                isMatch = true;
                            } else if (actionText === "ENDWALK" && poppedActionText.startsWith("WALK")) {
                                isMatch = true;
                            } else if (actionText === "ENDBATCHPOST" && poppedActionText === "STARTBATCHPOST") {
                                isMatch = true;
                            } else if (actionText === "ENDMSGBOX" && poppedActionText === "STARTMSGBOX") {
                                isMatch = true;
                            } else if (actionText === "ENDZIP" && poppedActionText === "STARTZIP") {
                                isMatch = true;
                            } else if (actionText === "ENDUNZIP" && poppedActionText === "STARTUNZIP") {
                                isMatch = true;
                            }
                        }

                        // Check for mismatch
                        if (!isMatch) {
                            const expectedFriendly = "END " + ((popped.node as any).action?.text || '').toUpperCase();
                            const foundFriendly = (stmt.action?.text || '').toUpperCase();
                            this.addError(`Mismatched block terminator: Expected ${expectedFriendly}, found ${foundFriendly}`, stmt.start, stmt.end);
                        }
                    }
                } else {
                    this.addError(`Unmatched ${(stmt.action?.text || '').toUpperCase()} without opening block`, stmt.start, stmt.end);
                    targetArray.push(stmt); 
                }
            } else {
                targetArray.push(stmt);
            }
        }
        
        // Any remaining items in the stack are unclosed blocks
        for (const unclosed of stack) {
            this.addError(`Unclosed block: Missing END ${((unclosed.node as any).action?.text || '').toUpperCase()}`, unclosed.node.start, unclosed.node.end);
        }
        
        return result;
    }

    private ParsePrimaryExpression(): any | undefined {
        const start = this.CurrentToken.Start;

        // Unary Minus
        if (this.CurrentToken.Kind === TokenKind.MinusToken) {
            const op = this.EatToken();
            const right = this.ParsePrimaryExpression();
            if (right) {
                return new UnaryExpressionNode(op.Start, right.end, op, right);
            }
            return undefined;
        }

        // Parenthesized Expression
        if (this.CurrentToken.Kind === TokenKind.OpenParenToken) {
            this.EatToken(); // Eat (
            const expr = this.ParseExpression() || this.ParseLiteral() || this.ParseExpressionIdentifier();
            if ((this.CurrentToken.Kind as unknown as TokenKind) === TokenKind.CloseParenToken) {
                this.EatToken(); // Eat )
            }
            return expr;
        }

        // Function Call $$Func:Arg:Arg
        if (this.CurrentToken.Kind === TokenKind.DoubleDollarToken) {
            const next = this.PeekNextToken();
            if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
                this.EatToken(); // Eat $$
                const funcName = this.ParseIdentifierWithSpaces();
                if (funcName) {
                    const funcNode = new FunctionCallNode(start, funcName.end, funcName);

                    // Check for arguments (
                    if ((this.CurrentToken.Kind as unknown as TokenKind) === TokenKind.OpenParenToken) {
                        this.EatToken(); // Eat (

                        while ((this.CurrentToken.Kind as TokenKind) !== TokenKind.CloseParenToken && (this.CurrentToken.Kind as TokenKind) !== TokenKind.EndOfFileToken) {
                            const arg = this.ParseExpression() || this.ParseLiteral() || this.ParseExpressionIdentifier();
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
                    } else if ((this.CurrentToken.Kind as unknown as TokenKind) === TokenKind.ColonToken) {
                        // Colon separated arguments $$Func:Arg:Arg
                        while ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
                            this.EatToken(); // Eat :

                            // Parse argument (Expression, Literal, or Identifier)
                            const arg = this.ParseExpression() || this.ParseLiteral() || this.ParseExpressionIdentifier();

                            if (arg) {
                                funcNode.arguments.push(arg);
                                funcNode.end = arg.end;
                            } else {
                                // Empty argument $$Func::Arg
                                if ((this.CurrentToken.Kind as TokenKind) === TokenKind.ColonToken) {
                                    continue;
                                }
                                break;
                            }
                        }
                    }

                    return funcNode;
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
            if (next && next.Kind === TokenKind.OpenParenToken) {
                // Complex method: $(Type, Id).Collection[index].Method
                this.EatToken(); // Eat $
                this.EatToken(); // Eat (
                const typeNode = this.ParseIdentifierWithSpaces();
                let idNode: any = undefined;
                if (typeNode && (this.CurrentToken.Kind as TokenKind) === TokenKind.CommaToken) {
                    this.EatToken(); // Eat ,
                    idNode = this.ParseExpression() || this.ParseLiteral() || this.ParseExpressionIdentifier();
                }
                if ((this.CurrentToken.Kind as TokenKind) === TokenKind.CloseParenToken) {
                    this.EatToken(); // Eat )
                }
                
                const pathSpecs: PathSpec[] = [];
                let methodName: IdentifierNode | undefined;
                
                while (!this.isAtEnd()) {
                    if ((this.CurrentToken.Kind as TokenKind) === TokenKind.DotToken) {
                        this.EatToken(); // Eat .
                        const ident = this.ParseIdentifierWithSpaces();
                        if (!ident) break;
                        
                        if ((this.CurrentToken.Kind as TokenKind) === TokenKind.OpenSquareBracketToken) {
                            // Collection with index
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
                            pathSpecs.push({ collectionName: ident, index: indexExpr, condition: conditionExpr });
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
                
                if (typeNode && methodName) {
                    const node = new ComplexMethodReferenceNode(start, methodName.end, { type: typeNode, identifier: idNode }, methodName);
                    node.pathSpecs = pathSpecs;
                    return node;
                }
            } else if (next && (this.IsIdentifierToken(next.Kind) || next.Kind === TokenKind.DotToken)) {
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
        if (this.CurrentToken.Kind === TokenKind.StringLiteralToken ||
            this.CurrentToken.Kind === TokenKind.NumberToken ||
            this.CurrentToken.Kind === TokenKind.TrueToken ||
            this.CurrentToken.Kind === TokenKind.FalseToken ||
            this.CurrentToken.Kind === TokenKind.YesToken ||
            this.CurrentToken.Kind === TokenKind.NoToken ||
            this.CurrentToken.Kind === TokenKind.OnToken ||
            this.CurrentToken.Kind === TokenKind.OffToken) {
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

            if (this.CurrentToken.Kind === TokenKind.SpaceToken) {
                if (identifierTokens.length > 0) text += " ";
                this.MoveToNextToken();
                continue;
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

    private ParseFileNameWithSpaces(): IdentifierNode | undefined {
        const identifierTokens: Token[] = [];
        let text = "";

        while (!this.isAtEnd()) {
            if (this.HasNewLine(this.PreviousToken, true) || this.HasNewLine(this.CurrentToken, false)) {
                if (identifierTokens.length > 0) break;
            }

            if (this.CurrentToken.Kind === TokenKind.SpaceToken) {
                if (identifierTokens.length > 0) text += " ";
                this.MoveToNextToken();
                continue;
            }

            if (this.CurrentToken.Kind === TokenKind.CloseSquareBracketToken) {
                break;
            }

            // Accept ANY token for a filename
            if (identifierTokens.length > 0) {
                const hasSpace = this.HasSpace(this.PreviousToken, true) || this.HasSpace(this.CurrentToken, false);
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
