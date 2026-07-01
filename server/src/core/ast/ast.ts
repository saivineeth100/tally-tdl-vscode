import { Token } from "../lexer/token";
import { TokenKind } from "../lexer/tokenKind";


export enum SyntaxKind {
    SourceFile,
    Definition,
    Attribute,
    Identifier,
    Literal,
    Empty,
    Token,
    FunctionCall,
    FieldReference,
    VariableReference,
    MethodReference,
    FormulaReference,
    Statement,
    Comment,
    List,
    ComplexObject,
    BinaryExpression,
    UnaryExpression,
    Directive,
    InUseDirective,
    DefTypeDirective,
    UnknownDirective
}

export interface Node {
    kind: SyntaxKind;
    parent?: Node;
    start: number;
    end: number;
    /** Indicates if this node was parsed with error recovery (missing tokens) */
    isIncomplete?: boolean;
}

export class CommentNode implements Node {
    kind = SyntaxKind.Comment as const;
    parent?: Node;
    start: number;
    end: number;
    text: string;
    isMultiLine: boolean;

    constructor(start: number, end: number, text: string, isMultiLine: boolean) {
        this.start = start;
        this.end = end;
        this.text = text;
        this.isMultiLine = isMultiLine;
    }
}



export class SourceFile implements Node {
    public text: string = '';
    kind = SyntaxKind.SourceFile as const;
    parent = undefined;
    start: number;
    end: number;
    definitions: DefinitionNode[] = [];
    comments: CommentNode[] = [];
    tokens: Token[] = [];
    errors: DiagnosticError[] = [];
    lineOffsets: number[] = [];
    directives: DirectiveNode[] = [];

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }
}

export class DefinitionNode implements Node {
    kind = SyntaxKind.Definition as const;
    parent?: Node;
    start: number;
    end: number;
    openBracket: Token;
    type: IdentifierNode;
    closeType?: IdentifierNode;
    colon?: Token;
    name?: IdentifierNode;
    modifier?: Token;
    public closeBracket: Token;
    public attributes: AttributeNode[] = [];
    public statements: StatementNode[] = [];
    public complexObjects: ComplexObjectNode[] = [];
    public directives: DirectiveNode[] = [];

    /** 
     * Indicates if this definition was parsed with error recovery.
     * If true, some tokens (like closeBracket, type, name) may be missing/synthetic.
     */
    isIncomplete: boolean = false;

    public nameCanonical: string | undefined;
    
    // Modifier flags
    public isAdd: boolean = false;
    public isDelete: boolean = false;
    public isReplace: boolean = false;
    public isLocal: boolean = false;

    constructor(start: number, end: number, openBracket: Token, type: IdentifierNode, closeBracket: Token) {
        this.start = start;
        this.end = end;
        this.openBracket = openBracket;
        this.type = type;
        this.closeBracket = closeBracket;
    }

    public get getNameCanonical(): string | undefined {
        if (!this.name) return undefined;
        return this.name.text.replace(/\s+/g, '').toLowerCase();
    }
}

export interface BaseDirectiveNode extends Node {
    rawContent?: string;
}

export class InUseTargetNode {
    constructor(
        public start: number,
        public end: number,
        public typeName: string,
        public typeStart: number,
        public typeEnd: number,
        public defName: string,
        public defNameStart: number,
        public defNameEnd: number
    ) {}
}

export class InUseDirectiveNode implements BaseDirectiveNode {
    kind = SyntaxKind.InUseDirective as const;
    parent?: Node;
    
    constructor(
        public start: number,
        public end: number,
        public name: string,
        public targets: InUseTargetNode[],
        public rawContent?: string
    ) {}
}

export class DefTypeDirectiveNode implements BaseDirectiveNode {
    kind = SyntaxKind.DefTypeDirective as const;
    parent?: Node;

    constructor(
        public start: number,
        public end: number,
        public name: string,
        public defType: string,
        public defTypeStart: number,
        public defTypeEnd: number,
        public defName: string | undefined,
        public defNameStart: number | undefined,
        public defNameEnd: number | undefined,
        public rawContent?: string
    ) {}
}

export class UnknownDirectiveNode implements BaseDirectiveNode {
    kind = SyntaxKind.UnknownDirective as const;
    parent?: Node;
    
    constructor(
        public start: number,
        public end: number,
        public name: string,
        public value: string,
        public rawContent?: string
    ) {}
}

export type DirectiveNode = InUseDirectiveNode | DefTypeDirectiveNode | UnknownDirectiveNode;

export class StatementNode implements Node {
    kind = SyntaxKind.Statement as const;
    parent?: Node;
    start: number;
    end: number;

    constructor(
        public label: IdentifierNode | LiteralNode | undefined,
        public action: IdentifierNode,
        public args: ExpressionNode[]
    ) {
        this.start = label ? label.start : action.start;
        // End will be calculated based on last arg
        this.end = args.length > 0 ? args[args.length - 1].end : action.end;
    }
}

export class ComplexObjectNode implements Node {
    kind = SyntaxKind.ComplexObject as const;
    parent?: Node;
    start: number;
    end: number;
    name: IdentifierNode;
    closeName?: IdentifierNode;
    public attributes: AttributeNode[] = [];
    public complexObjects: ComplexObjectNode[] = [];
    isIncomplete: boolean = false;

    constructor(start: number, end: number, name: IdentifierNode) {
        this.start = start;
        this.end = end;
        this.name = name;
    }
}

export class AttributeNode implements Node {
    kind = SyntaxKind.Attribute as const;
    parent?: Node;
    start: number;
    end: number;
    name: IdentifierNode;
    closeName?: IdentifierNode;
    colon: Token;
    value: (IdentifierNode | LiteralNode | ExpressionNode | EmptyNode)[];
    isIncomplete: boolean = false;

    // Modifier flags
    public isAdd: boolean = false;
    public isDelete: boolean = false;
    public isReplace: boolean = false;
    public isLocal: boolean = false;

    constructor(start: number, end: number, name: IdentifierNode, colon: Token, value: (IdentifierNode | LiteralNode | ExpressionNode | EmptyNode)[]) {
        this.start = start;
        this.end = end;
        this.name = name;
        this.colon = colon;
        this.value = value;
    }
}

export class IdentifierNode implements Node {
    kind = SyntaxKind.Identifier as const;
    parent?: Node;
    start: number;
    end: number;
    tokens: Token[];
    text: string;
    isIncomplete: boolean = false;

    constructor(tokens: Token[], text: string) {
        this.tokens = tokens;
        this.text = text;
        // Handle empty tokens for error recovery
        if (tokens.length === 0) {
            this.start = 0;
            this.end = 0;
            this.isIncomplete = true;
        } else {
            this.start = tokens[0].Start;
            // Use Text.length as Token.Length includes trivia (FullWidth)
            this.end = tokens[tokens.length - 1].Start + tokens[tokens.length - 1].Text.length;
        }
    }
}

export class LiteralNode implements Node {
    kind = SyntaxKind.Literal as const;
    parent?: Node;
    start: number;
    end: number;
    token: Token;
    value: string | number;

    constructor(token: Token) {
        this.start = token.Start;
        this.end = token.Start + token.Text.length;
        this.token = token;

        // Check if this is a number token and parse it as a number
        if (token.Kind === TokenKind.NumberToken) {
            this.value = parseFloat(token.Text);
        } else {
            this.value = token.Text;
        }
    }
}

export class EmptyNode implements Node {
    kind = SyntaxKind.Empty as const;
    parent?: Node;
    start: number;
    end: number;

    constructor(start: number) {
        this.start = start;
        this.end = start;
    }
}

export interface DiagnosticError {
    code?: string;
    message: string;
    start: number;
    end: number;
}

export interface ExpressionNode extends Node { }

export class FunctionCallNode implements ExpressionNode {
    kind: SyntaxKind = SyntaxKind.FunctionCall;
    parent?: Node;
    start: number;
    end: number;

    functionName: IdentifierNode;
    arguments: (ExpressionNode | LiteralNode | IdentifierNode)[] = [];

    constructor(start: number, end: number, functionName: IdentifierNode) {
        this.start = start;
        this.end = end;
        this.functionName = functionName;
    }
}

export class FieldReferenceNode implements ExpressionNode {
    kind: SyntaxKind = SyntaxKind.FieldReference;
    parent?: Node;
    start: number;
    end: number;
    fieldName: IdentifierNode;

    constructor(start: number, end: number, fieldName: IdentifierNode) {
        this.start = start;
        this.end = end;
        this.fieldName = fieldName;
    }
}

export class VariableReferenceNode implements ExpressionNode {
    kind: SyntaxKind = SyntaxKind.VariableReference;
    parent?: Node;
    start: number;
    end: number;
    variableName: IdentifierNode;

    constructor(start: number, end: number, variableName: IdentifierNode) {
        this.start = start;
        this.end = end;
        this.variableName = variableName;
    }
}

export class MethodReferenceNode implements ExpressionNode {
    kind: SyntaxKind = SyntaxKind.MethodReference;
    parent?: Node;
    start: number;
    end: number;
    methodName: IdentifierNode;

    constructor(start: number, end: number, methodName: IdentifierNode) {
        this.start = start;
        this.end = end;
        this.methodName = methodName;
    }
}

export class FormulaReferenceNode implements ExpressionNode {
    kind: SyntaxKind = SyntaxKind.FormulaReference;
    parent?: Node;
    start: number;
    end: number;
    formulaName: IdentifierNode;
    isGlobal: boolean;

    constructor(start: number, end: number, formulaName: IdentifierNode, isGlobal: boolean) {
        this.start = start;
        this.end = end;
        this.formulaName = formulaName;
        this.isGlobal = isGlobal;
    }
}

export class ListNode implements Node {
    kind = SyntaxKind.List as const;
    parent?: Node;
    start: number;
    end: number;
    values: (IdentifierNode | LiteralNode | ExpressionNode)[];

    constructor(start: number, end: number, values: (IdentifierNode | LiteralNode | ExpressionNode)[]) {
        this.start = start;
        this.end = end;
        this.values = values;
    }
}

export class BinaryExpressionNode implements ExpressionNode {
    kind: SyntaxKind = SyntaxKind.BinaryExpression;
    parent?: Node;
    start: number;
    end: number;
    left: ExpressionNode | LiteralNode | IdentifierNode;
    operator: Token;
    right: ExpressionNode | LiteralNode | IdentifierNode;

    constructor(start: number, end: number, left: ExpressionNode | LiteralNode | IdentifierNode, operator: Token, right: ExpressionNode | LiteralNode | IdentifierNode) {
        this.start = start;
        this.end = end;
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
}

export class UnaryExpressionNode implements ExpressionNode {
    kind: SyntaxKind = SyntaxKind.UnaryExpression;
    parent?: Node;
    start: number;
    end: number;
    operator: Token;
    right: ExpressionNode | LiteralNode | IdentifierNode;

    constructor(start: number, end: number, operator: Token, right: ExpressionNode | LiteralNode | IdentifierNode) {
        this.start = start;
        this.end = end;
        this.operator = operator;
        this.right = right;
    }
}

export class BlockStatementNode extends StatementNode {
    public statements: StatementNode[] = [];
    public endStatement?: StatementNode;
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class IfNode extends BlockStatementNode {
    public condition: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public elseStatements: StatementNode[] = [];
}

export class WhileNode extends BlockStatementNode {
    public condition: ExpressionNode | LiteralNode | IdentifierNode | undefined;
}

export class WalkNode extends BlockStatementNode {
    public collectionName: ExpressionNode | LiteralNode | IdentifierNode | undefined;
}

export class ForNode extends BlockStatementNode {
    public iteratorVariable: IdentifierNode | undefined;
    public collectionName: ExpressionNode | LiteralNode | IdentifierNode | undefined;
}

export interface PathSpec {
    collectionName: IdentifierNode;
    index?: ExpressionNode | LiteralNode | IdentifierNode;
    condition?: ExpressionNode | LiteralNode | IdentifierNode;
}

export class ComplexMethodReferenceNode implements ExpressionNode {
    kind: SyntaxKind = SyntaxKind.MethodReference;
    parent?: Node;
    start: number;
    end: number;
    primaryObject: { type: IdentifierNode, identifier: ExpressionNode | LiteralNode | IdentifierNode };
    pathSpecs: PathSpec[] = [];
    methodName: IdentifierNode;

    constructor(start: number, end: number, primaryObject: { type: IdentifierNode, identifier: ExpressionNode | LiteralNode | IdentifierNode }, methodName: IdentifierNode) {
        this.start = start;
        this.end = end;
        this.primaryObject = primaryObject;
        this.methodName = methodName;
    }
}

export class BatchPostNode extends BlockStatementNode {
    public batchSize: ExpressionNode | LiteralNode | IdentifierNode | undefined;
}

export class MsgBoxNode extends BlockStatementNode {
    public title: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public message: ExpressionNode | LiteralNode | IdentifierNode | undefined;
}

export class ZipNode extends BlockStatementNode {
    public targetFile: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public overwrite: ExpressionNode | LiteralNode | IdentifierNode | undefined;
}

export class UnzipNode extends BlockStatementNode {
    public sourceFile: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public password: ExpressionNode | LiteralNode | IdentifierNode | undefined;
}

export class StartBlockNode extends BlockStatementNode {
    constructor(stmt: StatementNode) {
        super(stmt);
    }
}

export class DoIfNode extends StatementNode {
    public condition: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public actionStatement: StatementNode | undefined;
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class ReturnNode extends StatementNode {
    public returnValue: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class BreakNode extends StatementNode {
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class ContinueNode extends StatementNode {
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class SetNode extends StatementNode {
    public targetVariable: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public valueExpression: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class ExchangeNode extends StatementNode {
    public var1: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public var2: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class IncrementNode extends StatementNode {
    public targetVariable: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public stepValue: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class DecrementNode extends StatementNode {
    public targetVariable: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public stepValue: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    constructor(stmt: StatementNode) {
        super(stmt.label, stmt.action, stmt.args);
        this.start = stmt.start;
        this.end = stmt.end;
    }
}

export class SwitchNode extends BlockStatementNode {
    public condition: ExpressionNode | LiteralNode | IdentifierNode | undefined;
    public cases: CaseNode[] = [];
    public defaultCase: DefaultNode | undefined;
}

export class CaseNode extends BlockStatementNode {
    public value: ExpressionNode | LiteralNode | IdentifierNode | undefined;
}

export class DefaultNode extends BlockStatementNode {
}


