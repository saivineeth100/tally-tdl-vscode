import { InlayHint, Range } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile } from '../parser/ast';
import { ScopeManager } from './scopeManager';

export function provideInlayHints(
    sourceFile: SourceFile,
    doc: TextDocument,
    range: Range,
    scopeManager: ScopeManager
): InlayHint[] {
    // TDL function metadata only provides generic structural types like "Value" and "Identifier".
    // Displaying these as inlay hints (e.g., "Value: 20") is noisy and confuses developers into 
    // thinking the IDE is automatically typing code. Disabling inlay hints until metadata improves.
    return [];
}
