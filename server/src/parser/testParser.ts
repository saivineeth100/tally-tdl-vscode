import { Parser } from './parser';
import { walkAST } from './astQuery';
import { SyntaxKind } from './ast';

const parser = new Parser('[Report: Test]\nLocal: Field: Default: Set as: #MyField\nLocal: Field: Default: Set as: ##MyVar');
const ast = parser.parse();
walkAST(ast, (node) => {
    if (node.kind !== SyntaxKind.SourceFile && node.kind !== SyntaxKind.ComplexObject && node.kind !== SyntaxKind.Attribute) {
        console.log("Node:", SyntaxKind[node.kind], (node as any).text || (node as any).value || (node as any).name?.text || (node as any).token?.Text);
    }
});
