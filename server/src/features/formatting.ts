import { TextEdit, FormattingOptions, Range, Position, CancellationToken } from 'vscode-languageserver';
import { SourceFile } from '../core/ast/ast';
import { TokenKind } from '../core/lexer/tokenKind';
import { Token } from '../core/lexer/token';

/**
 * Format the whole document using Trivia-Based Formatting (Token Stream Reconstruction)
 * This ensures structure-aware formatting and avoids regex risks (e.g. inside strings).
 */
export function formatDocument(text: string, sourceFile: SourceFile, options: FormattingOptions, cancelToken?: CancellationToken): TextEdit[] {
    // 1. Calculate Target Indentation Map (Context-based)
    // We still use the AST definitions to decide *what level* a line should be indented to.
    const lineIndents = new Array(sourceFile.lineOffsets.length).fill(0);

    function getLineFromOffset(offset: number) {
        let low = 0;
        let high = sourceFile.lineOffsets.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (sourceFile.lineOffsets[mid] > offset) high = mid - 1;
            else low = mid + 1;
        }
        return high;
    }

    const definitions = sourceFile.definitions.sort((a, b) => a.start - b.start);
    for (let i = 0; i < definitions.length; i++) {
        const def = definitions[i];
        const startLine = getLineFromOffset(def.start);
        const endLine = getLineFromOffset(def.end);

        for (let j = startLine + 1; j <= endLine; j++) {
            lineIndents[j] = 1;
        }
    }

    // 2. Token Stream Reconstruction
    let formattedText = "";
    const indentString = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';
    let atLineStart = true; // Start of file is start of line
    let skipNextSpace = false; // Flag to skip leading space of next token/trivia (for colon formatting)

    // Helper to process trivia list
    function processTrivia(triviaList: Token[], contextLine: number) {
        if (!triviaList) return;

        for (const trivia of triviaList) {
            switch (trivia.Kind) {
                case TokenKind.LineFeed:
                case TokenKind.CarriageReturn:
                case TokenKind.CarriageReturnLineFeed:
                    formattedText += trivia.Text; // Preserve newline type
                    atLineStart = true;
                    skipNextSpace = false; // Reset skip on newline
                    break;

                case TokenKind.SpaceToken:
                    if (skipNextSpace) {
                        skipNextSpace = false;
                        continue;
                    }
                    if (atLineStart) {
                        // Ignore existing indentation spaces
                    } else {
                        // Preserve spaces between tokens (unless we are continuously ignoring)
                        formattedText += trivia.Text;
                    }
                    break;

                case TokenKind.SingleLineComment:
                case TokenKind.MultiLineComment:
                    if (atLineStart) {
                        // Indent the comment!
                        const line = getLineFromOffset(trivia.Start);
                        const level = lineIndents[line] || 0;
                        if (level > 0) formattedText += indentString.repeat(level);
                        atLineStart = false; // We added content
                    } else {
                        // Comment after code. Ensure space?
                        // formattedText usually preserves space token before comment.
                    }
                    formattedText += trivia.Text;

                    if (trivia.Text.endsWith('\n')) {
                        atLineStart = true;
                    }
                    break;

                default:
                    formattedText += trivia.Text;
            }
        }
    }

    for (const token of sourceFile.tokens) {
        if (cancelToken?.isCancellationRequested) return [];
        // A. Leading Trivia
        const tokenLine = getLineFromOffset(token.Start);
        processTrivia(token.Leading, tokenLine);

        // B. Apply Indentation (if still at start after leading trivia)
        if (atLineStart && token.Kind !== TokenKind.EndOfFileToken) {
            const level = lineIndents[tokenLine] || 0;
            if (level > 0) formattedText += indentString.repeat(level);
            atLineStart = false;
        }

        // C. Token Text
        if (token.Kind === TokenKind.EndOfFileToken) {
            continue;
        }

        // Rule: Space Before Colon
        if (token.Kind === TokenKind.ColonToken) {
            if (!formattedText.endsWith(' ') && !formattedText.endsWith('\t') && !formattedText.endsWith('\n') && !atLineStart) {
                formattedText += " ";
            }
        }

        formattedText += token.Text;

        // Rule: Space After Colon
        if (token.Kind === TokenKind.ColonToken) {
            formattedText += " ";
            skipNextSpace = true; // Tell next trivia/token to skip its first space if any
        }

        // D. Trailing Trivia
        processTrivia(token.Trailing, tokenLine);
    }

    // Ensure final newline
    if (options.insertFinalNewline && !formattedText.endsWith('\n')) {
        formattedText += '\n';
    }

    const oldLines = text.split('\n');
    const newLines = formattedText.split('\n');
    const edits: TextEdit[] = [];

    const maxLines = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLines; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];

        if (oldLine === undefined) {
            // New line added
            edits.push(TextEdit.insert(Position.create(i, 0), newLine + '\n'));
        } else if (newLine === undefined) {
            // Old line deleted
            edits.push(TextEdit.del(Range.create(Position.create(i, 0), Position.create(i + 1, 0))));
        } else if (oldLine !== newLine) {
            // Line changed
            edits.push(TextEdit.replace(
                Range.create(Position.create(i, 0), Position.create(i, oldLine.length)),
                newLine
            ));
        }
    }

    return edits;
}
