import { Token } from "./token";


export enum SyntaxKind {
    SourceFile,
    Definition,
    Attribute,
    Identifier,
    Literal,
    Token,
    FunctionCall,
    FieldReference,
    VariableReference,
    MethodReference,
    FormulaReference,
    Statement
}

export interface Node {
    kind: SyntaxKind;
    parent?: Node;
    start: number;
    end: number;
}

export class SourceFile implements Node {
    kind = SyntaxKind.SourceFile as const;
    parent = undefined;
    start: number;
    end: number;
    definitions: DefinitionNode[] = [];
    errors: DiagnosticError[] = [];

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
    colon?: Token;
    name?: IdentifierNode;
    modifier?: Token;
    closeBracket: Token;
    public attributes: AttributeNode[] = [];
    public statements: StatementNode[] = [];

    constructor(start: number, end: number, openBracket: Token, type: IdentifierNode, closeBracket: Token) {
        this.start = start;
        this.end = end;
        this.openBracket = openBracket;
        this.type = type;
        this.closeBracket = closeBracket;
    }

    public get nameCanonical(): string | undefined {
        if (!this.name) return undefined;
        return this.name.text.replace(/\s+/g, '').toLowerCase();
    }
}

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

export class AttributeNode implements Node {
    kind = SyntaxKind.Attribute as const;
    parent?: Node;
    start: number;
    end: number;
    name: IdentifierNode;
    colon: Token;
    value: (IdentifierNode | LiteralNode | ExpressionNode)[];

    constructor(start: number, end: number, name: IdentifierNode, colon: Token, value: (IdentifierNode | LiteralNode | ExpressionNode)[]) {
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

    constructor(tokens: Token[], text: string) {
        if (tokens.length === 0) { throw new Error("IdentifierNode cannot be empty"); }
        this.tokens = tokens;
        this.text = text;
        this.start = tokens[0].Start;
        this.end = tokens[tokens.length - 1].Start + tokens[tokens.length - 1].Length;
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
        this.end = token.Start + token.Length;
        this.token = token;
        this.value = token.Text;
    }
}

export interface DiagnosticError {
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