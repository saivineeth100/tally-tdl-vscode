import { DocumentSymbol, SymbolKind as LSPSymbolKind, Range, Position } from 'vscode-languageserver';
import { DefinitionNode, SourceFile, AttributeNode, StatementNode } from '../parser/ast';
import { definitionTypeToSymbolKind, symbolKindToLSPSymbolKind } from './scopeManager/types';
import { offsetToPosition } from '../utils/positionUtils';

/**
 * Map TDL definition type to LSP SymbolKind
 * @param definitionType The TDL definition type (Report, Field, etc.)
 * @returns Corresponding LSP SymbolKind
 */
export function tdlTypeToLSPSymbolKind(definitionType: string, manager?: any): LSPSymbolKind {
    return symbolKindToLSPSymbolKind(definitionTypeToSymbolKind(definitionType, manager));
}



/**
 * Create Range from start and end offsets
 * @param text Full document text
 * @param start Start offset
 * @param end End offset
 * @returns Range object
 */
function offsetsToRange(text: string, start: number, end: number): Range {
    // Ensure start is not greater than end
    if (start > end) {
        start = end;
    }
    return {
        start: offsetToPosition(text, start),
        end: offsetToPosition(text, end)
    };
}

/**
 * Ensures a selection range is fully contained within a parent range
 */
function clampRange(selection: Range, full: Range): Range {
    let startLine = selection.start.line;
    let startChar = selection.start.character;
    let endLine = selection.end.line;
    let endChar = selection.end.character;

    // Clamp start
    if (startLine < full.start.line) {
        startLine = full.start.line;
        startChar = full.start.character;
    } else if (startLine === full.start.line && startChar < full.start.character) {
        startChar = full.start.character;
    }

    // Clamp end
    if (endLine > full.end.line) {
        endLine = full.end.line;
        endChar = full.end.character;
    } else if (endLine === full.end.line && endChar > full.end.character) {
        endChar = full.end.character;
    }

    // Ensure start <= end after clamping
    if (startLine > endLine || (startLine === endLine && startChar > endChar)) {
        startLine = full.start.line;
        startChar = full.start.character;
        endLine = startLine;
        endChar = startChar;
    }

    return {
        start: { line: startLine, character: startChar },
        end: { line: endLine, character: endChar }
    };
}

/**
 * Convert an AttributeNode to a DocumentSymbol
 * @param attr Attribute node from AST
 * @param text Full document text
 * @returns DocumentSymbol for the attribute
 */
function attributeToDocumentSymbol(attr: AttributeNode, text: string): DocumentSymbol {
    const name = attr.name.text;
    const values = attr.value.map(v => {
        if ('text' in v) return v.text;
        if ('value' in v) return String(v.value);
        return '...';
    }).join(', ');

    const displayName = values ? `${name}: ${values.substring(0, 50)}${values.length > 50 ? '...' : ''}` : name;
    const range = offsetsToRange(text, attr.start, attr.end);

    return {
        name: displayName,
        kind: LSPSymbolKind.Property,
        range,
        selectionRange: clampRange(offsetsToRange(text, attr.name.start, attr.name.end), range)
    };
}

/**
 * Convert a StatementNode to a DocumentSymbol
 */
function statementToDocumentSymbol(stmt: StatementNode, text: string): DocumentSymbol {
    const label = stmt.label ? ((stmt.label as any).text || String((stmt.label as any).value || '')) : '';
    const action = (stmt.action as any).text || '';
    const name = label ? `${label} : ${action}` : action;
    const range = offsetsToRange(text, stmt.start, stmt.end);
    const selectionRange = clampRange(offsetsToRange(text, stmt.start, (stmt.action as any).end || stmt.end), range);

    const children: DocumentSymbol[] = [];
    if ('statements' in stmt) {
        const blockStmt = stmt as any;
        if (blockStmt.statements) {
            children.push(...blockStmt.statements.map((s: StatementNode) => statementToDocumentSymbol(s, text)));
        }
        if (blockStmt.elseStatements) {
            const elseChildren = blockStmt.elseStatements.map((s: StatementNode) => statementToDocumentSymbol(s, text));
            const elseRange = elseChildren.length > 0 
                ? { start: elseChildren[0].range.start, end: elseChildren[elseChildren.length - 1].range.end }
                : range;
            children.push({
                name: 'ELSE',
                kind: LSPSymbolKind.Event,
                range: elseRange,
                selectionRange: elseRange, // Cannot use parent stmt range as it might exceed elseRange
                children: elseChildren
            });
        }
    }

    return {
        name,
        kind: LSPSymbolKind.Event, // Use Event for procedural statements
        range,
        selectionRange,
        children: children.length > 0 ? children : undefined
    };
}

/**
 * Convert a DefinitionNode to a DocumentSymbol
 * @param def Definition node from AST
 * @param text Full document text
 * @returns DocumentSymbol for the definition
 */
export function definitionToDocumentSymbol(def: DefinitionNode, text: string, manager?: any): DocumentSymbol {
    const defName = def.name ? def.name.text : '<anonymous>';
    const defType = def.type ? def.type.text : 'Unknown';
    
    const symbolKind = tdlTypeToLSPSymbolKind(defType, manager);

    // Build detail string with modifier if present
    let detail = defType;
    if (def.modifier) {
        detail = `${def.modifier.Text}${defType}`;
    }

    // Calculate range for the entire definition including body
    const range = offsetsToRange(text, def.start, def.end);

    // Selection range is just the definition header [Type: Name]
    const selectionRange = clampRange(offsetsToRange(text, def.start, def.closeBracket.Start + def.closeBracket.Length), range);

    // Convert attributes to child symbols
    const children: DocumentSymbol[] = def.attributes.map(attr => attributeToDocumentSymbol(attr, text));

    // Convert statements to child symbols
    if (def.statements) {
        children.push(...def.statements.map(stmt => statementToDocumentSymbol(stmt, text)));
    }

    return {
        name: defName,
        kind: symbolKind,
        detail,
        range,
        selectionRange,
        children: children.length > 0 ? children : undefined
    };
}

/**
 * Create DocumentSymbols for all definitions in a SourceFile
 * @param sourceFile Parsed source file AST
 * @param text Full document text
 * @returns Array of DocumentSymbols
 */
export function createDocumentSymbols(sourceFile: SourceFile, text: string, manager?: any): DocumentSymbol[] {
    return sourceFile.definitions.map(def => definitionToDocumentSymbol(def, text, manager));
}


