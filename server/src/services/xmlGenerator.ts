import {
    SourceFile, DefinitionNode, AttributeNode, StatementNode,
    BlockStatementNode, IfNode, WhileNode, WalkNode, ForNode
} from '../parser/ast';
import { Parser } from '../parser/parser';
import * as fs from 'fs';

/**
 * Escapes XML special characters in a string.
 */
function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

/**
 * Generates TDL XML from a parsed SourceFile AST and original document text.
 */
export async function generateXml(
    ast: SourceFile, 
    documentText: string,
    currentFsPath: string | null = null,
    resolveIncludePath?: (currentPath: string, name: string) => string | null,
    visitedFiles: Set<string> = new Set()
): Promise<string> {
    if (currentFsPath) {
        visitedFiles.add(currentFsPath);
    }
    let xml = '<TDL> <TDLMESSAGE>\n';
    xml += await generateXmlInner(ast, documentText, currentFsPath, resolveIncludePath, visitedFiles);
    xml += '</TDLMESSAGE>\n</TDL>';
    return xml;
}

async function generateXmlInner(
    ast: SourceFile, 
    documentText: string,
    currentFsPath: string | null,
    resolveIncludePath: ((currentPath: string, name: string) => string | null) | undefined,
    visitedFiles: Set<string>
): Promise<string> {
    let xml = '';

    for (const def of ast.definitions) {
        if (!def.type || !def.name) continue;

        const typeName = def.type.text.toUpperCase();
        let name = def.name.text;
        
        // Remove enclosing brackets/quotes if any
        if (name.startsWith('"') && name.endsWith('"')) {
            name = name.slice(1, -1);
        }

        // Handle Include and Import recursively
        if (typeName === 'INCLUDE' || typeName === 'IMPORT') {
            if (currentFsPath && resolveIncludePath) {
                const targetPath = resolveIncludePath(currentFsPath, name);
                if (targetPath && !visitedFiles.has(targetPath)) {
                    visitedFiles.add(targetPath);
                    try {
                        const content = await fs.promises.readFile(targetPath, 'utf8');
                        const parser = new Parser(content);
                        const includedAst = parser.parse();
                        xml += await generateXmlInner(includedAst, content, targetPath, resolveIncludePath, visitedFiles);
                    } catch (e) {
                        // Ignore read errors
                    }
                }
            }
            continue;
        }

        // Determine Modifiers
        let isModify = "No";
        let isOption = "No";
        let isInitialize = "No";
        let isReplace = "No";

        if (def.modifier) {
            const mod = def.modifier.Text;
            if (mod === '#') isModify = "Yes";
            else if (mod === '!') isOption = "Yes";
            else if (mod === '*') isInitialize = "Yes";
        }

        xml += `  <${typeName} NAME="${escapeXml(name)}" ISMODIFY="${isModify}" ISFIXED="No" ISINITIALIZE="${isInitialize}" ISOPTION="${isOption}" ISINTERNAL="No">\n`;

        // Attributes
        for (const attr of def.attributes) {
            // Remove spaces for valid XML tag names
            const tagName = attr.name.text.toUpperCase().replace(/\s+/g, '');
            
            // We want the text from the end of the colon to the end of the attribute
            // We use the original document text to preserve exact whitespace and comments
            let valueText = documentText.substring(attr.colon.Start + attr.colon.Text.length, attr.end).trim();
            
            xml += `   <${tagName}>${escapeXml(valueText)}</${tagName}>\n`;
        }

        // Statements
        if (def.statements && def.statements.length > 0) {
            const statementsXml = flattenStatements(def.statements, documentText);
            xml += statementsXml;
        }

        xml += `  </${typeName}>\n`;
    }

    return xml;
}

/**
 * Recursively flattens statement blocks into sequential XML <ACTION> tags.
 */
function flattenStatements(statements: StatementNode[], documentText: string): string {
    let result = '';

    for (const stmt of statements) {
        if (stmt instanceof BlockStatementNode) {
            // Reconstruct the opening line of the block
            const endOffset = stmt.args.length > 0 ? stmt.args[stmt.args.length - 1].end : stmt.action.end;
            let startLineText = documentText.substring(stmt.start, endOffset).trim();
            result += `   <ACTION>${escapeXml(startLineText)}</ACTION>\n`;

            // Recursively process the statements inside the block
            if (stmt.statements && stmt.statements.length > 0) {
                result += flattenStatements(stmt.statements, documentText);
            }

            // Handle If-Else structure
            if (stmt instanceof IfNode) {
                if (stmt.elseStatements && stmt.elseStatements.length > 0) {
                    result += flattenStatements(stmt.elseStatements, documentText);
                }
            }

            // Handle the END statement
            if (stmt.endStatement) {
                const endStmtEndOffset = stmt.endStatement.args.length > 0 
                    ? stmt.endStatement.args[stmt.endStatement.args.length - 1].end 
                    : stmt.endStatement.action.end;
                let endLineText = documentText.substring(stmt.endStatement.start, endStmtEndOffset).trim();
                result += `   <ACTION>${escapeXml(endLineText)}</ACTION>\n`;
            }

        } else {
            // Simple statement
            let lineText = documentText.substring(stmt.start, stmt.end).trim();
            result += `   <ACTION>${escapeXml(lineText)}</ACTION>\n`;
        }
    }

    return result;
}
