import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile, StatementNode, BlockStatementNode, SyntaxKind, IdentifierNode, LiteralNode, IfNode, SwitchNode } from "../core/ast/ast";
import { incrementLabel, matchesSequencePattern } from '../utils/labelUtils';
import { DiagnosticRules, createDiagnostic, createDiagnosticWithData, LabelSequenceData } from '../diagnostics';



export function validateLabelSequences(sourceFile: SourceFile, doc: TextDocument): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    for (const def of sourceFile.definitions) {
        if (!def.type || def.type.text.toUpperCase() !== 'FUNCTION') continue;

        // Flatten statements in order of appearance
        const allStatements: StatementNode[] = [];
        function collectStatements(statements: StatementNode[]) {
            for (const stmt of statements) {
                allStatements.push(stmt);
                if (stmt instanceof BlockStatementNode) {
                    collectStatements(stmt.statements);
                    if (stmt.endStatement) {
                        allStatements.push(stmt.endStatement);
                    }
                }
                if (stmt instanceof IfNode) {
                    if (stmt.elseStatements) {
                        collectStatements(stmt.elseStatements);
                    }
                }
                if (stmt instanceof SwitchNode) {
                    for (const caseNode of stmt.cases) {
                        collectStatements([caseNode]);
                    }
                    if (stmt.defaultCase) {
                        collectStatements([stmt.defaultCase]);
                    }
                }
            }
        }
        collectStatements(def.statements);
        allStatements.sort((a, b) => a.start - b.start);

        let previousLabel: string | null = null;

        for (const stmt of allStatements) {
            if (!stmt.label) continue;

            let currentLabel = '';
            if (stmt.label.kind === SyntaxKind.Identifier) {
                currentLabel = (stmt.label as IdentifierNode).text;
            } else if (stmt.label.kind === SyntaxKind.Literal) {
                currentLabel = (stmt.label as LiteralNode).token.Text;
            }

            if (!currentLabel) continue;

            if (previousLabel !== null) {
                if (matchesSequencePattern(currentLabel, previousLabel)) {
                    const expectedLabel = incrementLabel(previousLabel);
                    if (currentLabel !== expectedLabel) {
                        const diag = createDiagnosticWithData<LabelSequenceData>(
                            DiagnosticRules.BrokenLabelSeqence,
                            { start: doc.positionAt(stmt.label.start), end: doc.positionAt(stmt.label.end) },
                            { expectedLabel },
                            expectedLabel
                        );
                        diagnostics.push(diag);
                        // Once we detect a broken sequence, we don't want to cascade warnings 
                        // for every subsequent statement. We reset the "previousLabel" to the expected one?
                        // Or we just flag every statement? 
                        // Just flag the first broken one, and let the quick fix handle the rest.
                        // Actually, if we just set `previousLabel = currentLabel`, the next one might be marked broken too if it's correct relative to the shifted sequence.
                        // Example: 001, 003, 004
                        // 003 is flagged (expected 002). previousLabel = 003.
                        // 004 matches 003, expected 004. So 004 is NOT flagged. This is good! Only the gap boundary is flagged!
                    }
                }
            }

            previousLabel = currentLabel;
        }
    }

    return diagnostics;
}
