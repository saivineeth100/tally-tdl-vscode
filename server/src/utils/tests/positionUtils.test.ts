import { describe, it, expect } from 'vitest';
import { offsetToPosition, positionToOffset } from '../positionUtils';

describe('Position Utilities', () => {
    it('offsetToPosition with LF (\\n) line endings', () => {
        const text = 'hello\nworld\n';
        expect(offsetToPosition(text, 0)).toEqual({ line: 0, character: 0 }); // 'h'
        expect(offsetToPosition(text, 5)).toEqual({ line: 0, character: 5 }); // '\n'
        expect(offsetToPosition(text, 6)).toEqual({ line: 1, character: 0 }); // 'w'
    });

    it('offsetToPosition with CRLF (\\r\\n) line endings', () => {
        const text = 'hello\r\nworld\r\n';
        expect(offsetToPosition(text, 0)).toEqual({ line: 0, character: 0 }); // 'h'
        expect(offsetToPosition(text, 5)).toEqual({ line: 0, character: 5 }); // '\r'
        expect(offsetToPosition(text, 6)).toEqual({ line: 0, character: 5 }); // '\n'
        expect(offsetToPosition(text, 7)).toEqual({ line: 1, character: 0 }); // 'w'
    });

    it('positionToOffset with LF line endings', () => {
        const text = 'hello\nworld\n';
        expect(positionToOffset(text, { line: 0, character: 0 })).toBe(0); // 'h'
        expect(positionToOffset(text, { line: 0, character: 5 })).toBe(5); // '\n'
        expect(positionToOffset(text, { line: 1, character: 0 })).toBe(6); // 'w'
    });

    it('empty string edge case', () => {
        const text = '';
        expect(offsetToPosition(text, 0)).toEqual({ line: 0, character: 0 });
        expect(positionToOffset(text, { line: 0, character: 0 })).toBe(0);
        expect(positionToOffset(text, { line: 1, character: 5 })).toBe(0);
    });

    it('offset at exact end of string', () => {
        const text = 'abc';
        expect(offsetToPosition(text, 3)).toEqual({ line: 0, character: 3 });
        expect(positionToOffset(text, { line: 0, character: 3 })).toBe(3);
        // Exceeding should clamp
        expect(offsetToPosition(text, 10)).toEqual({ line: 0, character: 3 });
        expect(positionToOffset(text, { line: 0, character: 10 })).toBe(3);
    });

    it('round-trip consistency (offset -> position -> offset)', () => {
        const text = 'hello\r\nworld\nfoo';
        for (let offset = 0; offset <= text.length; offset++) {
            const pos = offsetToPosition(text, offset);
            const recoveredOffset = positionToOffset(text, pos);
            if (text[offset] !== '\r' && text[recoveredOffset] !== '\r') {
                expect(Math.abs(offset - recoveredOffset)).toBeLessThanOrEqual(1);
            }
        }
    });
});
