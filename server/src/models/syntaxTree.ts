export class SyntaxTree {
    FilePath: string;
    constructor(filePath: string) {
        this.FilePath = filePath;
    }
}

export class SyntaxNode {
    SyntaxTree: SyntaxTree;
    ParentNode: SyntaxNode | null = null;
    ChildNodes: SyntaxNode[] = [];
    constructor(syntaxTree: SyntaxTree) {
        this.SyntaxTree = syntaxTree;
    }
}

export class DefinitionSyntax extends SyntaxNode {

}
export class AttributeSyntax extends SyntaxNode {

}
export class SingleAttributeSyntax extends AttributeSyntax {

}
export class MultiAttributeSyntax extends AttributeSyntax {

}
export class SubAttributeSyntax extends SyntaxNode {

}
export class LiteralSyntax extends SyntaxNode {

}
export class BinarSyntax extends SyntaxNode {

}
export class FunctionActionSyntax extends SyntaxNode {

}