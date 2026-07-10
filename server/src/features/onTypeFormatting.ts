import { Position, TextDocument, TextEdit, FormattingOptions, Range } from 'vscode-languageserver';
import { incrementLabel, matchesSequencePattern } from '../utils/labelUtils';
import { Parser } from '../core/parser/parser';
import { DefinitionNode, BlockStatementNode, StatementNode, IdentifierNode, LiteralNode, SyntaxKind, IfNode, SwitchNode } from '../core/ast/ast';
import { FormattingRules, DEFAULT_FORMATTING_RULES } from './formatting/formattingRules';

function getBlockEnder(action: string): string | null {
    action = action.toUpperCase().replace(/\s+/g, ' ');
    if (action.startsWith('IF')) return 'ENDIF';
    if (action.startsWith('WHILE')) return 'ENDWHILE';
    if (action.startsWith('FOR')) return 'ENDFOR';
    if (action.startsWith('WALK')) return 'ENDWALK';
    if (action === 'START BLOCK') return 'END BLOCK';
    if (action === 'START BATCH POST') return 'END BATCH POST';
    if (action === 'START MSG BOX') return 'END MSG BOX';
    if (action === 'START ZIP') return 'END ZIP';
    if (action === 'START UNZIP') return 'END UNZIP';
    
    if (action.startsWith('FOR ')) return 'ENDFOR';
    if (action.startsWith('WALK ')) return 'ENDWALK';

    return null;
}

interface StmtDepthInfo {
    depth: number;
    baseDepth: number;
}

function computeStatementDepths(
    statements: StatementNode[],
    currentDepth: number,
    baseDepth: number,
    depthMap: Map<StatementNode, StmtDepthInfo>,
    rules: FormattingRules
) {
    for (const stmt of statements) {
        depthMap.set(stmt, { depth: currentDepth, baseDepth });

        let bodyDepth = currentDepth;
        if (stmt instanceof BlockStatementNode) {
            bodyDepth = rules.indentBlockStatementBody ? currentDepth + 1 : currentDepth;
            computeStatementDepths(stmt.statements, bodyDepth, baseDepth, depthMap, rules);
            if (stmt.endStatement) {
                depthMap.set(stmt.endStatement, { depth: currentDepth, baseDepth });
            }
        }

        if (stmt instanceof IfNode) {
            if (stmt.elseStatements) {
                for (const elseSubStmt of stmt.elseStatements) {
                    const isElseKeyword = elseSubStmt.action && 
                        elseSubStmt.action.text.toUpperCase().replace(/\s+/g, '') === 'ELSE';
                    const subDepth = isElseKeyword ? currentDepth : bodyDepth;
                    computeStatementDepths([elseSubStmt], subDepth, baseDepth, depthMap, rules);
                }
            }
        }

        if (stmt instanceof SwitchNode) {
            for (const caseNode of stmt.cases) {
                computeStatementDepths([caseNode], bodyDepth, baseDepth, depthMap, rules);
            }
            if (stmt.defaultCase) {
                computeStatementDepths([stmt.defaultCase], bodyDepth, baseDepth, depthMap, rules);
            }
        }
    }
}

export function provideOnTypeFormatting(
    document: TextDocument,
    position: Position,
    ch: string,
    options: FormattingOptions,
    rules: FormattingRules = DEFAULT_FORMATTING_RULES
): TextEdit[] {
    if (ch !== '\n' && ch !== '\r' && ch !== '\r\n') return [];

    const edits: TextEdit[] = [];
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    if (position.line === 0) return [];

    // Ad-hoc parse to get accurate offsets
    const parser = new Parser(text);
    const sourceFile = parser.parse();

    const targetLine = position.line - 1;
    let targetDef: DefinitionNode | undefined;

    for (const def of sourceFile.definitions) {
        const startLine = document.positionAt(def.start).line;
        const endLine = document.positionAt(def.end).line;
        // Check if the targetLine (the line we just hit Enter on) is within this definition's bounds
        if (startLine <= targetLine && endLine >= targetLine) {
            targetDef = def;
            break;
        }
    }

    if (!targetDef) return [];

    // Guardrail: Only Function definitions have procedural capabilities
    if (!targetDef.type || targetDef.type.text.toUpperCase() !== 'FUNCTION') {
        return [];
    }
    
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
    collectStatements(targetDef.statements);

    // Sort flattened statements by start offset just to be absolutely sure
    allStatements.sort((a, b) => a.start - b.start);

    // Find the statement matching the previous line
    let targetStmt: StatementNode | undefined;
    let targetStmtIdx = -1;
    for (let i = 0; i < allStatements.length; i++) {
        const stmt = allStatements[i];
        const stmtStartLine = document.positionAt(stmt.start).line;
        const stmtEndLine = document.positionAt(stmt.end).line;
        // console.log(`Stmt ${i}: startLine=${stmtStartLine}, endLine=${stmtEndLine}, label=${(stmt.label as any)?.text || (stmt.label as any)?.token?.Text}`);
        if (stmtStartLine === targetLine || stmtEndLine === targetLine) {
            targetStmt = stmt;
            targetStmtIdx = i;
            break;
        }
    }

    if (!targetStmt) {
        return [];
    }
    if (!targetStmt.label) {
        return [];
    }

    let label = '';
    if (targetStmt.label.kind === SyntaxKind.Identifier) {
        label = (targetStmt.label as IdentifierNode).text;
    } else if (targetStmt.label.kind === SyntaxKind.Literal) {
        label = (targetStmt.label as LiteralNode).token.Text;
    }

    if (!label) return [];

    const prevLine = lines[targetLine];
    const indentMatch = prevLine.match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';

    let nextLabel = incrementLabel(label);
    
    let blockEnder = null;
    if (targetStmt.action) {
        blockEnder = getBlockEnder(targetStmt.action.text);
    }

    const currentLineRange = Range.create(
        Position.create(position.line, 0),
        Position.create(position.line, position.character)
    );

    // Compute nesting depths of statements
    const depthMap = new Map<StatementNode, StmtDepthInfo>();
    const defBodyDepth = rules.indentDefinitionBody ? 1 : 0;
    computeStatementDepths(targetDef.statements, defBodyDepth, defBodyDepth, depthMap, rules);

    const targetInfo = depthMap.get(targetStmt) || { depth: defBodyDepth, baseDepth: defBodyDepth };
    const targetDepth = targetInfo.depth;
    const baseDepth = targetInfo.baseDepth;

    const indentString = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';

    let nextDepth = targetDepth;
    const actionText = targetStmt.action?.text?.toUpperCase()?.replace(/\s+/g, '') || '';
    const isBlockOpener = !!blockEnder;
    const increasesIndent = isBlockOpener || ['ELSE', 'CASE', 'DEFAULT'].includes(actionText);

    if (increasesIndent && rules.indentBlockStatementBody) {
        nextDepth = targetDepth + 1;
    }

    const nextActionIndent = rules.indentBlockStatementBody ? indentString.repeat(Math.max(0, nextDepth - baseDepth)) : '';
    const enderActionIndent = rules.indentBlockStatementBody ? indentString.repeat(Math.max(0, targetDepth - baseDepth)) : '';

    if (blockEnder) {
        edits.push(TextEdit.replace(currentLineRange, `${indent}${nextLabel} : ${nextActionIndent}`));
        
        edits.push(TextEdit.insert(
            Position.create(position.line, position.character),
            `\n${indent}${incrementLabel(nextLabel)} : ${enderActionIndent}${blockEnder}`
        ));
        
        nextLabel = incrementLabel(nextLabel);
    } else {
        edits.push(TextEdit.replace(currentLineRange, `${indent}${nextLabel} : ${nextActionIndent}`));
    }

    // AST Cascade
    let currentCascadeLabel = nextLabel;
    for (let i = targetStmtIdx + 1; i < allStatements.length; i++) {
        const sibling = allStatements[i];
        
        const siblingInfo = depthMap.get(sibling);
        if (siblingInfo && siblingInfo.depth < nextDepth) {
            break;
        }
        
        if (!sibling.label) continue;
        
        let siblingLabelText = '';
        if (sibling.label.kind === SyntaxKind.Identifier) {
            siblingLabelText = (sibling.label as IdentifierNode).text;
        } else if (sibling.label.kind === SyntaxKind.Literal) {
            siblingLabelText = (sibling.label as LiteralNode).token.Text;
        }

        if (!siblingLabelText) continue;

        if (matchesSequencePattern(currentCascadeLabel, siblingLabelText)) {
            currentCascadeLabel = incrementLabel(currentCascadeLabel);
            
            const replaceRange = Range.create(
                document.positionAt(sibling.label.start),
                document.positionAt(sibling.label.end)
            );
            
            edits.push(TextEdit.replace(replaceRange, currentCascadeLabel));
        } else {
            // Sequence pattern broken
            break;
        }
    }

    return edits;
}
