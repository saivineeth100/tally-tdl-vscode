import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver';

export function offsetToPosition(doc: TextDocument | string, offset: number): Position {
    if (typeof doc === 'string') {
        let line = 0;
        let character = 0;
        const limit = Math.min(offset, doc.length);
        for (let i = 0; i < limit; i++) {
            if (doc[i] === '\r') {
                continue;
            }
            if (doc[i] === '\n') {
                line++;
                character = 0;
            } else {
                character++;
            }
        }
        return { line, character };
    }
    return doc.positionAt(offset);
}

export function positionToOffset(doc: TextDocument | string, position: Position): number {
    if (typeof doc === 'string') {
        let currentOffset = 0;
        let line = 0;
        const lines = doc.split(/(?<=\n)/);
        
        while (line < position.line && line < lines.length) {
            currentOffset += lines[line].length;
            line++;
        }
        
        const targetLine = lines[position.line] || '';
        
        let lineLimit = targetLine.length;
        if (targetLine.endsWith('\r\n')) {
            lineLimit -= 2;
        } else if (targetLine.endsWith('\n')) {
            lineLimit -= 1;
        }

        currentOffset += Math.min(position.character, lineLimit);
        
        return Math.min(currentOffset, doc.length);
    }
    return doc.offsetAt(position);
}
