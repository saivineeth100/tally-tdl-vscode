import { Position, TextDocument, TextEdit, FormattingOptions, Range } from 'vscode-languageserver';
import { incrementLabel, matchesSequencePattern } from '../utils/labelUtils';
import { BLOCK_OPENERS, BLOCK_ENDERS, isInsertCollectionObject, getSetTargetDotsCount } from '../utils/blockUtils';
import { Parser } from '../core/parser/parser';
import { Node, DefinitionNode, BlockStatementNode, StatementNode, IdentifierNode, LiteralNode, SyntaxKind, IfNode, SwitchNode } from '../core/ast/ast';
import { FormattingRules, DEFAULT_FORMATTING_RULES } from './formatting/formattingRules';
import { ClientGateway } from '../ports/clientGateway';

function getBlockEnder(stmt: StatementNode): string | null {
    if (!stmt.action) return null;
    const actionText = stmt.action.text.toUpperCase().replace(/\s+/g, '');
    if (actionText === "INSERT") {
        if (isInsertCollectionObject(stmt)) {
            return "SET TARGET : ..";
        }
    }
    return BLOCK_OPENERS[actionText] || null;
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
    rules: FormattingRules,
    stmtOffset: number = 0
): number {
    let currentOffset = stmtOffset;
    for (const stmt of statements) {
        if (isInsertCollectionObject(stmt)) {
            depthMap.set(stmt, { depth: currentDepth + currentOffset, baseDepth });
            currentOffset += 1;
        } else if (getSetTargetDotsCount(stmt) > 0) {
            const dots = getSetTargetDotsCount(stmt);
            const popLevel = Math.max(0, dots - 1);
            currentOffset = Math.max(0, currentOffset - popLevel);
            depthMap.set(stmt, { depth: currentDepth + currentOffset, baseDepth });
        } else {
            depthMap.set(stmt, { depth: currentDepth + currentOffset, baseDepth });
        }

        let bodyDepth = currentDepth + currentOffset;
        if (stmt instanceof BlockStatementNode) {
            bodyDepth = rules.indentBlockStatementBody ? (currentDepth + currentOffset) + 1 : (currentDepth + currentOffset);
            let nestedOffset = 0;
            nestedOffset = computeStatementDepths(stmt.statements, bodyDepth, baseDepth, depthMap, rules, nestedOffset);
            if (stmt.endStatement) {
                depthMap.set(stmt.endStatement, { depth: currentDepth + currentOffset, baseDepth });
            }
        }

        if (stmt instanceof IfNode) {
            if (stmt.elseStatements) {
                for (const elseSubStmt of stmt.elseStatements) {
                    const isElseKeyword = elseSubStmt.action && 
                        elseSubStmt.action.text.toUpperCase().replace(/\s+/g, '') === 'ELSE';
                    const subDepth = isElseKeyword ? (currentDepth + currentOffset) : bodyDepth;
                    computeStatementDepths([elseSubStmt], subDepth, baseDepth, depthMap, rules, 0);
                }
            }
        }

        if (stmt instanceof SwitchNode) {
            for (const caseNode of stmt.cases) {
                computeStatementDepths([caseNode], bodyDepth, baseDepth, depthMap, rules, 0);
            }
            if (stmt.defaultCase) {
                computeStatementDepths([stmt.defaultCase], bodyDepth, baseDepth, depthMap, rules, 0);
            }
        }
    }
    return currentOffset;
}

export function provideOnTypeFormatting(
    document: TextDocument,
    position: Position,
    ch: string,
    options: FormattingOptions,
    rules: FormattingRules = DEFAULT_FORMATTING_RULES,
    client?: ClientGateway
): TextEdit[] {
    const triggerChars = ['\n', '\r', '\r\n', ':'];
    if (!triggerChars.includes(ch)) return [];

    const edits: TextEdit[] = [];
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    const isNewline = ch === '\n' || ch === '\r' || ch === '\r\n';
    const targetLine = isNewline ? position.line - 1 : position.line;

    if (targetLine < 0) return [];

    // Ad-hoc parse to get accurate offsets
    const parser = new Parser(text);
    const sourceFile = parser.parse();

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
        if (stmtStartLine === targetLine || stmtEndLine === targetLine) {
            if (targetStmt) {
                const prevStartLine = document.positionAt(targetStmt.start).line;
                if (stmtStartLine === targetLine && prevStartLine !== targetLine) {
                    targetStmt = stmt;
                    targetStmtIdx = i;
                }
            } else {
                targetStmt = stmt;
                targetStmtIdx = i;
            }
        }
    }

    if (!targetStmt) {
        return [];
    }
    if (!targetStmt.label) {
        return [];
    }

    // Compute nesting depths of statements
    const depthMap = new Map<StatementNode, StmtDepthInfo>();
    const defBodyDepth = rules.indentDefinitionBody ? 1 : 0;
    computeStatementDepths(targetDef.statements, defBodyDepth, defBodyDepth, depthMap, rules);

    const indentString = options.insertSpaces ? ' '.repeat(options.tabSize) : '\t';

    if (ch !== '\n' && ch !== '\r' && ch !== '\r\n') {
        if (!targetStmt.action) return [];
        
        const actionText = targetStmt.action.text.toUpperCase().replace(/\s+/g, '');
        const isBlockEnder = BLOCK_ENDERS.has(actionText);
        if (!isBlockEnder) {
            return [];
        }

        const targetInfo = depthMap.get(targetStmt);
        if (targetInfo) {
            const correctActionIndent = rules.indentBlockStatementBody ? indentString.repeat(Math.max(0, targetInfo.depth - targetInfo.baseDepth)) : '';
            const replaceRange = Range.create(
                document.positionAt(targetStmt.label.end),
                document.positionAt(targetStmt.action.start)
            );
            return [TextEdit.replace(replaceRange, ` : ${correctActionIndent}`)];
        }
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
        const isAlreadyClosed = targetStmt instanceof BlockStatementNode && !!targetStmt.endStatement;
        if (!isAlreadyClosed) {
            blockEnder = getBlockEnder(targetStmt);
        }
    }

    const currentLineRange = Range.create(
        Position.create(position.line, 0),
        Position.create(position.line, position.character)
    );

    const targetInfo = depthMap.get(targetStmt) || { depth: defBodyDepth, baseDepth: defBodyDepth };
    const targetDepth = targetInfo.depth;
    const baseDepth = targetInfo.baseDepth;

    let nextDepth = targetDepth;
    const actionText = targetStmt.action?.text?.toUpperCase()?.replace(/\s+/g, '') || '';
    const isBlockOpener = targetStmt.action ? !!getBlockEnder(targetStmt) : false;
    const increasesIndent = isBlockOpener || ['ELSE', 'CASE', 'DEFAULT'].includes(actionText);

    if (increasesIndent && rules.indentBlockStatementBody) {
        nextDepth = targetDepth + 1;
    }

    const nextActionIndent = rules.indentBlockStatementBody ? indentString.repeat(Math.max(0, nextDepth - baseDepth)) : '';
    const enderActionIndent = rules.indentBlockStatementBody ? indentString.repeat(Math.max(0, targetDepth - baseDepth)) : '';

    if (blockEnder) {
        const bodyLineText = `${indent}${nextLabel} : ${nextActionIndent}`;
        edits.push(TextEdit.replace(currentLineRange, bodyLineText));
        
        const enderText = `${indent}${incrementLabel(nextLabel)} : ${enderActionIndent}${blockEnder}\n`;
        const totalLines = lines.length;
        if (position.line + 1 < totalLines) {
            edits.push(TextEdit.insert(Position.create(position.line + 1, 0), enderText));
        } else {
            edits.push(TextEdit.insert(Position.create(position.line, position.character), `\n${enderText.trimEnd()}`));
        }
        nextLabel = incrementLabel(nextLabel);

        if (client) {
            client.notify('tdl/setCursorPosition', { line: position.line, character: bodyLineText.length });
        }
    } else {
        edits.push(TextEdit.replace(currentLineRange, `${indent}${nextLabel} : ${nextActionIndent}`));
    }

    const parentBlockEnders = new Set<StatementNode>();
    let curr: Node | undefined = targetStmt.parent;
    while (curr) {
        if (curr instanceof BlockStatementNode && curr.endStatement) {
            parentBlockEnders.add(curr.endStatement);
        }
        curr = curr.parent;
    }

    // AST Cascade
    let currentCascadeLabel = nextLabel;
    let cascadedAny = false;
    for (let i = targetStmtIdx + 1; i < allStatements.length; i++) {
        const sibling = allStatements[i];
        
        if (parentBlockEnders.has(sibling) && !cascadedAny) {
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
            cascadedAny = true;
        } else {
            // Sequence pattern broken
            break;
        }
    }

    return edits;
}
