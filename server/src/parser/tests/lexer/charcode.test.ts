
import { describe, expect, test } from 'vitest';
import { CharacterCodes } from '../../characterCodes';

describe('All Character Code Tests', () => {
    test('Test Numbers', () => {
        expect("0".codePointAt(0)).toBe(CharacterCodes._0);
        expect("1".codePointAt(0)).toBe(CharacterCodes._1);
        expect("2".codePointAt(0)).toBe(CharacterCodes._2);
        expect("3".codePointAt(0)).toBe(CharacterCodes._3);
        expect("4".codePointAt(0)).toBe(CharacterCodes._4);
        expect("5".codePointAt(0)).toBe(CharacterCodes._5);
        expect("6".codePointAt(0)).toBe(CharacterCodes._6);
        expect("7".codePointAt(0)).toBe(CharacterCodes._7);
        expect("8".codePointAt(0)).toBe(CharacterCodes._8);
        expect("9".codePointAt(0)).toBe(CharacterCodes._9);
    });
    test('Test Upper Alphabets', () => {
        expect("A".codePointAt(0)).toBe(CharacterCodes.A);
        expect("B".codePointAt(0)).toBe(CharacterCodes.B);
        expect("C".codePointAt(0)).toBe(CharacterCodes.C);
        expect("D".codePointAt(0)).toBe(CharacterCodes.D);
        expect("E".codePointAt(0)).toBe(CharacterCodes.E);
        expect("F".codePointAt(0)).toBe(CharacterCodes.F);
        expect("G".codePointAt(0)).toBe(CharacterCodes.G);
        expect("H".codePointAt(0)).toBe(CharacterCodes.H);
        expect("I".codePointAt(0)).toBe(CharacterCodes.I);
        expect("J".codePointAt(0)).toBe(CharacterCodes.J);
        expect("K".codePointAt(0)).toBe(CharacterCodes.K);
        expect("L".codePointAt(0)).toBe(CharacterCodes.L);
        expect("M".codePointAt(0)).toBe(CharacterCodes.M);
        expect("N".codePointAt(0)).toBe(CharacterCodes.N);
        expect("O".codePointAt(0)).toBe(CharacterCodes.O);
        expect("P".codePointAt(0)).toBe(CharacterCodes.P);
        expect("Q".codePointAt(0)).toBe(CharacterCodes.Q);
        expect("R".codePointAt(0)).toBe(CharacterCodes.R);
        expect("S".codePointAt(0)).toBe(CharacterCodes.S);
        expect("T".codePointAt(0)).toBe(CharacterCodes.T);
        expect("U".codePointAt(0)).toBe(CharacterCodes.U);
        expect("V".codePointAt(0)).toBe(CharacterCodes.V);
        expect("W".codePointAt(0)).toBe(CharacterCodes.W);
        expect("X".codePointAt(0)).toBe(CharacterCodes.X);
        expect("Y".codePointAt(0)).toBe(CharacterCodes.Y);
        expect("Z".codePointAt(0)).toBe(CharacterCodes.Z);

    });
    test('Test Smaller Alphabets', () => {
        expect("a".codePointAt(0)! < CharacterCodes.z).toBe(true);
        expect("a".codePointAt(0)).toBe(CharacterCodes.a);
        expect("b".codePointAt(0)).toBe(CharacterCodes.b);
        expect("c".codePointAt(0)).toBe(CharacterCodes.c);
        expect("d".codePointAt(0)).toBe(CharacterCodes.d);
        expect("e".codePointAt(0)).toBe(CharacterCodes.e);
        expect("f".codePointAt(0)).toBe(CharacterCodes.f);
        expect("g".codePointAt(0)).toBe(CharacterCodes.g);
        expect("h".codePointAt(0)).toBe(CharacterCodes.h);
        expect("i".codePointAt(0)).toBe(CharacterCodes.i);
        expect("j".codePointAt(0)).toBe(CharacterCodes.j);
        expect("k".codePointAt(0)).toBe(CharacterCodes.k);
        expect("l".codePointAt(0)).toBe(CharacterCodes.l);
        expect("m".codePointAt(0)).toBe(CharacterCodes.m);
        expect("n".codePointAt(0)).toBe(CharacterCodes.n);
        expect("o".codePointAt(0)).toBe(CharacterCodes.o);
        expect("p".codePointAt(0)).toBe(CharacterCodes.p);
        expect("q".codePointAt(0)).toBe(CharacterCodes.q);
        expect("r".codePointAt(0)).toBe(CharacterCodes.r);
        expect("s".codePointAt(0)).toBe(CharacterCodes.s);
        expect("t".codePointAt(0)).toBe(CharacterCodes.t);
        expect("u".codePointAt(0)).toBe(CharacterCodes.u);
        expect("v".codePointAt(0)).toBe(CharacterCodes.v);
        expect("w".codePointAt(0)).toBe(CharacterCodes.w);
        expect("x".codePointAt(0)).toBe(CharacterCodes.x);
        expect("y".codePointAt(0)).toBe(CharacterCodes.y);
        expect("z".codePointAt(0)).toBe(CharacterCodes.z);
    });

    test("Test Symbols", () => {
        expect("[".codePointAt(0)).toBe(CharacterCodes.OpenSquareBracket);
        expect("]".codePointAt(0)).toBe(CharacterCodes.CloseSquareBracket);
        expect("_".codePointAt(0)).toBe(CharacterCodes.Underscore);
        expect(":".codePointAt(0)).toBe(CharacterCodes.Colon);
        expect("\\".codePointAt(0)).toBe(CharacterCodes.BackSlash);
        expect("/".codePointAt(0)).toBe(CharacterCodes.ForwardSlash);
    });

});