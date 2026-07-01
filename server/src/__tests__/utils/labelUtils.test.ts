import { describe, it, expect } from 'vitest';
import { incrementLabel, decrementLabel, matchesSequencePattern } from '../../utils/labelUtils';

describe('labelUtils', () => {
    describe('incrementLabel', () => {
        it('should increment purely numeric labels with padding', () => {
            expect(incrementLabel('001')).toBe('002');
            expect(incrementLabel('099')).toBe('100');
            expect(incrementLabel('009')).toBe('010');
            expect(incrementLabel('1')).toBe('2');
            expect(incrementLabel('99')).toBe('100');
        });

        it('should increment alphabetic labels', () => {
            expect(incrementLabel('aa')).toBe('ab');
            expect(incrementLabel('az')).toBe('ba');
            expect(incrementLabel('zz')).toBe('aaa');
            expect(incrementLabel('A')).toBe('B');
            expect(incrementLabel('Z')).toBe('AA');
            expect(incrementLabel('aZ')).toBe('bA'); // Mixed casing: Z->A with carry, a->b
        });

        it('should increment alphanumeric labels', () => {
            expect(incrementLabel('abc99')).toBe('abc100');
            expect(incrementLabel('Step05')).toBe('Step06');
            expect(incrementLabel('X099')).toBe('X100');
        });
    });
    describe('decrementLabel', () => {
        it('should decrement purely numeric labels with padding', () => {
            expect(decrementLabel('002')).toBe('001');
            expect(decrementLabel('100')).toBe('99');
            expect(decrementLabel('010')).toBe('009');
            expect(decrementLabel('2')).toBe('1');
            expect(decrementLabel('000')).toBe(null); // Assuming decrementing 0 is not allowed
        });

        it('should decrement alphabetic labels', () => {
            expect(decrementLabel('ab')).toBe('aa');
            expect(decrementLabel('ba')).toBe('az');
            expect(decrementLabel('aaa')).toBe('zz');
            expect(decrementLabel('B')).toBe('A');
            expect(decrementLabel('AA')).toBe('Z');
            expect(decrementLabel('bA')).toBe('aZ');
            expect(decrementLabel('a')).toBe(null);
            expect(decrementLabel('A')).toBe(null);
        });

        it('should decrement alphanumeric labels', () => {
            expect(decrementLabel('abc100')).toBe('abc99');
            expect(decrementLabel('Step06')).toBe('Step05');
            expect(decrementLabel('X100')).toBe('X99');
            expect(decrementLabel('X000')).toBe(null);
        });
    });

    describe('matchesSequencePattern', () => {
        it('should match numeric patterns', () => {
            expect(matchesSequencePattern('001', '005')).toBe(true);
            expect(matchesSequencePattern('1', '2')).toBe(true);
        });

        it('should match alphanumeric patterns', () => {
            expect(matchesSequencePattern('abc1', 'abc2')).toBe(true);
            expect(matchesSequencePattern('Step05', 'Step06')).toBe(true);
            expect(matchesSequencePattern('abc1', 'xyz2')).toBe(false);
        });

        it('should match alphabetic patterns', () => {
            expect(matchesSequencePattern('aa', 'ab')).toBe(true);
            expect(matchesSequencePattern('a', 'z')).toBe(true);
        });
    });
});
