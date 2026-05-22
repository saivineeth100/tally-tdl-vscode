import { CodeActionParams, CodeAction, CodeActionKind, TextEdit } from "vscode-languageserver";
import { DocManager } from "../docManager";
import { BROKEN_SEQUENCE_DIAGNOSTIC_CODE } from "./sequenceValidator";
import { MISSING_DEFINITION_DIAGNOSTIC_CODE } from "./validation";
import { TextDocuments } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { StatementNode, BlockStatementNode, IdentifierNode, LiteralNode, SyntaxKind } from "../parser/ast";
import { incrementLabel, matchesSequencePattern } from "../utils/labelUtils";

export function provideCodeActions(
    params: CodeActionParams,
    docManager: DocManager,
    docs: TextDocuments<TextDocument>
): CodeAction[] {
    const actions: CodeAction[] = [];
    const doc = docs.get(params.textDocument.uri);
    const docState = docManager.get(params.textDocument.uri);

    if (!doc || !docState) return actions;

    for (const diagnostic of params.context.diagnostics) {
        if (diagnostic.code === BROKEN_SEQUENCE_DIAGNOSTIC_CODE) {
            const expectedLabel = (diagnostic.data as any)?.expectedLabel;
            if (expectedLabel) {
                const offset = doc.offsetAt(diagnostic.range.start);
                let targetDef = null;
                
                for (const def of docState.sourceFile.definitions) {
                    if (def.start <= offset && def.end >= offset) {
                        targetDef = def;
                        break;
                    }
                }
                
                if (targetDef && targetDef.type?.text.toUpperCase() === 'FUNCTION') {
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
                        }
                    }
                    if (targetDef.statements) {
                        collectStatements(targetDef.statements);
                    }
                    allStatements.sort((a, b) => a.start - b.start);
                    
                    const edits: TextEdit[] = [];
                    let found = false;
                    let currentExpectedLabel = expectedLabel;
                    
                    for (let i = 0; i < allStatements.length; i++) {
                        const stmt = allStatements[i];
                        if (!stmt.label) continue;
                        
                        if (!found) {
                            if (stmt.label.start === offset) {
                                found = true;
                            } else {
                                continue;
                            }
                        }
                        
                        let currentLabel = '';
                        if (stmt.label.kind === SyntaxKind.Identifier) {
                            currentLabel = (stmt.label as IdentifierNode).text;
                        } else if (stmt.label.kind === SyntaxKind.Literal) {
                            currentLabel = (stmt.label as LiteralNode).token.Text;
                        }
                        
                        if (!currentLabel) continue;
                        
                        if (i > 0) {
                             const prevOriginalStmt = allStatements[i-1];
                             let prevOriginalLabel = '';
                             if (prevOriginalStmt && prevOriginalStmt.label) {
                                 if (prevOriginalStmt.label.kind === SyntaxKind.Identifier) {
                                     prevOriginalLabel = (prevOriginalStmt.label as IdentifierNode).text;
                                 } else if (prevOriginalStmt.label.kind === SyntaxKind.Literal) {
                                     prevOriginalLabel = (prevOriginalStmt.label as LiteralNode).token.Text;
                                 }
                             }
                             
                             if (prevOriginalLabel && !matchesSequencePattern(currentLabel, prevOriginalLabel)) {
                                 break; // Stop cascading on sequence type change
                             }
                        }
                        
                        edits.push(TextEdit.replace(
                            {
                                start: doc.positionAt(stmt.label.start),
                                end: doc.positionAt(stmt.label.end)
                            },
                            currentExpectedLabel
                        ));
                        
                        currentExpectedLabel = incrementLabel(currentExpectedLabel);
                    }
                    
                    if (edits.length > 0) {
                        actions.push({
                            title: 'Fix downstream label sequence',
                            kind: CodeActionKind.QuickFix,
                            diagnostics: [diagnostic],
                            edit: {
                                changes: {
                                    [params.textDocument.uri]: edits
                                }
                            }
                        });
                    }
                }
            }
        } else if (diagnostic.code === MISSING_DEFINITION_DIAGNOSTIC_CODE) {
            const data = diagnostic.data as any;
            if (data && data.name && data.type) {
                // Determine the end of the document to append the new definition
                const endPos = doc.positionAt(doc.getText().length);
                const newText = `\n\n[${data.type}: ${data.name}]\n    \n`;
                
                actions.push({
                    title: `Create missing '${data.type}' definition '${data.name}'`,
                    kind: CodeActionKind.QuickFix,
                    diagnostics: [diagnostic],
                    edit: {
                        changes: {
                            [params.textDocument.uri]: [
                                TextEdit.insert(endPos, newText)
                            ]
                        }
                    }
                });
            }
        }
    }

    return actions;
}
