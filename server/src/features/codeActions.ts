import { CodeActionParams, CodeAction, CodeActionKind, TextEdit } from "vscode-languageserver";
import { DocManager } from "../docManager";

import { TextDocuments } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { findClosestMatch } from "../utils/stringUtils";
import { StatementNode, BlockStatementNode, IdentifierNode, LiteralNode, SyntaxKind } from "../core/ast/ast";
import { DiagnosticRules, LabelSequenceData, MissingDefinitionData, MissingEndStatementData, UnknownDefinitionTypeData, UnknownAttributeData, UnknownSchemaPropertyData } from "../diagnostics";
import { incrementLabel, matchesSequencePattern } from "../utils/labelUtils";
import { normalizeTypeName } from '../utils/normalizeUtils';

export function provideCodeActions(
    params: CodeActionParams,
    docManager: DocManager,
    docs: TextDocuments<TextDocument>
): CodeAction[] {
    const actions: CodeAction[] = [];
    const doc = docs.get(params.textDocument.uri);
    const docState = docManager.get(params.textDocument.uri);
    const scopeManager = docManager.getScopeManager(params.textDocument.uri);

    if (!doc || !docState) return actions;

    for (const diagnostic of params.context.diagnostics) {
        if (diagnostic.code === DiagnosticRules.DuplicateLabel.code || diagnostic.code === DiagnosticRules.BrokenLabelSeqence.code) {
            const expectedLabel = (diagnostic.data as LabelSequenceData | undefined)?.expectedLabel;
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
        } else if (diagnostic.code === DiagnosticRules.MissingDefinition.code) {
            const data = diagnostic.data as MissingDefinitionData | undefined;
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
        } else if (diagnostic.code === DiagnosticRules.MissingEndStatement.code) {
            const expectedEnd = (diagnostic.data as MissingEndStatementData | undefined)?.expectedEnd;
            if (expectedEnd) {
                actions.push({
                    title: `Insert '${expectedEnd}'`,
                    kind: CodeActionKind.QuickFix,
                    diagnostics: [diagnostic],
                    edit: {
                        changes: {
                            [params.textDocument.uri]: [
                                TextEdit.insert(diagnostic.range.end, `\n\t${expectedEnd}`)
                            ]
                        }
                    }
                });
            }
        } else if (diagnostic.code === DiagnosticRules.UnknownDefinitionType.code) {
            const defTypeName = (diagnostic.data as UnknownDefinitionTypeData | undefined)?.defTypeName;
            if (defTypeName && scopeManager) {
                const types = scopeManager.getDefinitionTypes();
                const closest = findClosestMatch(defTypeName, types);
                if (closest) {
                    actions.push({
                        title: `Change to '${closest}'`,
                        kind: CodeActionKind.QuickFix,
                        diagnostics: [diagnostic],
                        edit: {
                            changes: {
                                [params.textDocument.uri]: [
                                    TextEdit.replace(diagnostic.range, closest)
                                ]
                            }
                        }
                    });
                }
            }
        } else if (diagnostic.code === DiagnosticRules.UnknownAttribute.code) {
            const data = diagnostic.data as UnknownAttributeData | undefined;
            if (data?.attrName && data?.defTypeName && scopeManager) {
                let attrs = scopeManager.globalScope.attributes.get(normalizeTypeName(data.defTypeName));
                
                if (attrs) {
                    const attrNames: string[] = [];
                    attrs.forEach((a) => {
                        attrNames.push(a.name);
                        if (a.aliases) attrNames.push(...a.aliases.split(',').map((al: string) => al.trim()));
                    });
                    const closest = findClosestMatch(data.attrName, attrNames);
                    if (closest) {
                        actions.push({
                            title: `Change to '${closest}'`,
                            kind: CodeActionKind.QuickFix,
                            diagnostics: [diagnostic],
                            edit: {
                                changes: {
                                    [params.textDocument.uri]: [
                                        TextEdit.replace(diagnostic.range, closest)
                                    ]
                                }
                            }
                        });
                    }
                }
            }
        } else if (diagnostic.code === DiagnosticRules.UnknownSchemaProperty.code) {
            const data = diagnostic.data as UnknownSchemaPropertyData | undefined;
            if (data?.attrName && data?.schemaName && scopeManager) {
                const schema = scopeManager.globalScope.schemas.get(normalizeTypeName(data.schemaName));
                if (schema) {
                    const props = Array.from(schema.properties.keys());
                    const closest = findClosestMatch(data.attrName, props);
                    if (closest) {
                        actions.push({
                            title: `Change to '${closest}'`,
                            kind: CodeActionKind.QuickFix,
                            diagnostics: [diagnostic],
                            edit: {
                                changes: {
                                    [params.textDocument.uri]: [
                                        TextEdit.replace(diagnostic.range, closest)
                                    ]
                                }
                            }
                        });
                    }
                }
            }
        }
        
        if (diagnostic.code && typeof diagnostic.code === 'string' && diagnostic.code.startsWith('TDL')) {
            actions.push({
                title: `Disable warning ${diagnostic.code} for this project`,
                kind: CodeActionKind.QuickFix,
                diagnostics: [diagnostic],
                command: {
                    title: 'Disable Diagnostic',
                    command: 'tally-tdl.disableDiagnostic',
                    arguments: [diagnostic.code]
                }
            });
        }
    }

    return actions;
}
