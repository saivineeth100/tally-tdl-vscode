/**
 * Central configuration mapping of TDL procedural block statement openers and enders.
 */

// Mapping of normalized block action names (uppercase, all spaces stripped)
// to their canonical auto-close ender statement string.
export const BLOCK_OPENERS: Record<string, string> = {
    'IF': 'ENDIF',
    'WHILE': 'ENDWHILE',
    'FOR': 'ENDFOR',
    'FOREACH': 'ENDFOR',
    'FORIN': 'ENDFOR',
    'FORTOKEN': 'ENDFOR',
    'FORCOLLECTION': 'ENDFOR',
    'FORRANGE': 'ENDFOR',
    'WALK': 'ENDWALK',
    'WALKCOLLECTION': 'ENDWALK',
    'STARTBLOCK': 'END BLOCK',
    'STARTBATCHPOST': 'END BATCH POST',
    'STARTMSGBOX': 'END MSG BOX',
    'STARTPROGRESS': 'END PROGRESS',
    'STARTZIP': 'END ZIP',
    'STARTUNZIP': 'END UNZIP',
    'SWITCH': 'END SWITCH',
};

import { StatementNode, SyntaxKind, IdentifierNode, LiteralNode } from '../core/ast/ast';

// All normalized ender names (uppercase, all spaces stripped) that can close blocks or serve as block boundaries.
// Typing these or hitting enter after them will trigger outdenting.
export const BLOCK_ENDERS: ReadonlySet<string> = new Set([
    ...Object.values(BLOCK_OPENERS).map(ender => ender.toUpperCase().replace(/\s+/g, '')),
    'ELSE',
    'CASE',
    'DEFAULT'
]);

function getCleanText(node: any): string {
    if (!node) return "";
    if (typeof node.text === 'string') return node.text;
    if (node.token && typeof node.token.Text === 'string') return node.token.Text;
    return "";
}

export function isInsertCollectionObject(stmt: StatementNode): boolean {
    const actionText = (stmt.action?.text || "").trim().toUpperCase().replace(/\s+/g, '');
    return actionText === "INSERTCOLLECTIONOBJECT";
}

export function getSetTargetDotsCount(stmt: StatementNode): number {
    const actionText = (stmt.action?.text || "").trim().toUpperCase().replace(/\s+/g, '');
    if (actionText === "SETTARGET" && stmt.args.length >= 1) {
        const arg0 = getCleanText(stmt.args[0]).trim();
        if (/^\.+$/.test(arg0)) {
            return arg0.length;
        }
    }
    return 0;
}

export function isSetTarget(stmt: StatementNode): boolean {
    const actionText = (stmt.action?.text || "").trim().toUpperCase().replace(/\s+/g, '');
    return actionText === "SETTARGET";
}
