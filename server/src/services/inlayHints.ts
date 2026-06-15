import { InlayHint, InlayHintKind, Range } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile, Node, SyntaxKind, FunctionCallNode } from '../parser/ast';
import { TdlMetadata } from '../tdlMetaData';

export function provideInlayHints(
    sourceFile: SourceFile,
    doc: TextDocument,
    range: Range,
    metadata: TdlMetadata
): InlayHint[] {
    // TDL function metadata only provides generic structural types like "Value" and "Identifier".
    // Displaying these as inlay hints (e.g., "Value: 20") is noisy and confuses developers into 
    // thinking the IDE is automatically typing code. Disabling inlay hints until metadata improves.
    return [];
}
