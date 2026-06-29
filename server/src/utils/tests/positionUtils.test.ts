import { describe, it, expect } from 'vitest';
import { positionAt } from '../positionUtils';

describe('positionUtils', () => {
    describe('positionAt', () => {
        it('should correctly calculate position at the beginning of the file', () => {
            const lineOffsets = [0, 10, 20];
            const pos = positionAt(0, lineOffsets);
            expect(pos).toEqual({ line: 0, character: 0 });
        });

        it('should correctly calculate position in the middle of a line', () => {
            const lineOffsets = [0, 10, 20];
            const pos = positionAt(15, lineOffsets);
            expect(pos).toEqual({ line: 1, character: 5 });
        });

        it('should correctly calculate position at the exact start of a line', () => {
            const lineOffsets = [0, 10, 20];
            const pos = positionAt(10, lineOffsets);
            expect(pos).toEqual({ line: 1, character: 0 });
        });

        it('should correctly handle a file with only one line', () => {
            const lineOffsets = [0];
            const pos = positionAt(5, lineOffsets);
            expect(pos).toEqual({ line: 0, character: 5 });
        });

        it('should correctly handle offset larger than all offsets', () => {
            const lineOffsets = [0, 10, 20];
            const pos = positionAt(25, lineOffsets);
            expect(pos).toEqual({ line: 2, character: 5 });
        });

        it('should return {0,0} if lineOffsets array is empty', () => {
            const lineOffsets: number[] = [];
            const pos = positionAt(10, lineOffsets);
            expect(pos).toEqual({ line: 0, character: 10 });
        });
    });
});
