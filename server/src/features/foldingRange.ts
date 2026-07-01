import { FoldingRange, FoldingRangeKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile } from '../core/ast/ast';

export function provideFoldingRanges(sourceFile: SourceFile, doc: TextDocument): FoldingRange[] {
    const ranges: FoldingRange[] = [];
    
    // Fold definitions
    for (const def of sourceFile.definitions) {
        const startPos = doc.positionAt(def.start);
        const endPos = doc.positionAt(def.end);
        
        if (startPos.line < endPos.line) {
            ranges.push({
                startLine: startPos.line,
                endLine: endPos.line,
                kind: FoldingRangeKind.Region
            });
        }
    }
    
    // Fold comments (consecutive single line comments or multi-line block comments)
    let currentCommentBlockStart = -1;
    let lastCommentLine = -1;
    
    for (const comment of sourceFile.comments) {
        const startPos = doc.positionAt(comment.start);
        const endPos = doc.positionAt(comment.end);
        
        if (comment.isMultiLine) {
            if (startPos.line < endPos.line) {
                ranges.push({
                    startLine: startPos.line,
                    endLine: endPos.line,
                    kind: FoldingRangeKind.Comment
                });
            }
        } else {
            // It's a single line comment. Let's group consecutive single line comments
            if (currentCommentBlockStart === -1) {
                currentCommentBlockStart = startPos.line;
                lastCommentLine = endPos.line;
            } else if (startPos.line === lastCommentLine + 1) {
                // consecutive
                lastCommentLine = endPos.line;
            } else {
                // block break
                if (currentCommentBlockStart < lastCommentLine) {
                    ranges.push({
                        startLine: currentCommentBlockStart,
                        endLine: lastCommentLine,
                        kind: FoldingRangeKind.Comment
                    });
                }
                currentCommentBlockStart = startPos.line;
                lastCommentLine = endPos.line;
            }
        }
    }
    
    // push the last comment block if any
    if (currentCommentBlockStart !== -1 && currentCommentBlockStart < lastCommentLine) {
        ranges.push({
            startLine: currentCommentBlockStart,
            endLine: lastCommentLine,
            kind: FoldingRangeKind.Comment
        });
    }

    return ranges;
}
