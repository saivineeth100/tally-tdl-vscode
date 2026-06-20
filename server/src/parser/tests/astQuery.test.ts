import { describe, it, expect } from 'vitest';
import { Parser } from '../parser';
import { findDefinitionAtOffset, findFunctionAtOffset, walkAST } from '../astQuery';
import { SyntaxKind } from '../ast';

describe('astQuery Utilities', () => {
    describe('findDefinitionAtOffset (binary search)', () => {
        it('finds definition at offset', () => {
            const tdl = `
[Part: FirstPart]
    Line: FirstLine

[Part: SecondPart]
    Line: SecondLine
            `;
            const parser = new Parser(tdl);
            const sourceFile = parser.parse();

            // Offset 20 is inside FirstPart body
            const first = findDefinitionAtOffset(sourceFile, 20);
            expect(first?.name?.text).toBe('FirstPart');

            // Offset 60 is inside SecondPart
            const second = findDefinitionAtOffset(sourceFile, 60);
            expect(second?.name?.text).toBe('SecondPart');
        });

        it('returns undefined before first definition', () => {
            const parser = new Parser('   \n  [Part: A]');
            const sourceFile = parser.parse();
            const def = findDefinitionAtOffset(sourceFile, 1);
            expect(def).toBeUndefined();
        });
        
        it('handles single-definition file', () => {
            const parser = new Parser('[Part: A]');
            const sourceFile = parser.parse();
            const def = findDefinitionAtOffset(sourceFile, 5);
            expect(def?.name?.text).toBe('A');
        });

        it('handles empty definitions list', () => {
            const parser = new Parser('  /* just comments */  ');
            const sourceFile = parser.parse();
            const def = findDefinitionAtOffset(sourceFile, 5);
            expect(def).toBeUndefined();
        });
    });

    describe('findFunctionAtOffset (recursive)', () => {
        it('finds outer function on name', () => {
            const parser = new Parser('[Part: A]\n  Set as: $$Eval:10');
            const sourceFile = parser.parse();
            const attr = sourceFile.definitions[0].attributes[0];
            
            const funcCallOffset = attr.value[0].start + 2; // On "$$Eval"
            const result = findFunctionAtOffset(attr.value, funcCallOffset);
            
            expect(result).toBeDefined();
            expect(result?.funcNode.functionName?.text).toBe('Eval');
            expect(result?.onFuncName).toBe(true);
            expect(result?.paramIndex).toBe(-1);
        });

        it('finds nested function at inner name', () => {
            const parser = new Parser('[Part: A]\n  Set as: $$Eval:$$Amount:Ledger');
            const sourceFile = parser.parse();
            const attr = sourceFile.definitions[0].attributes[0];
            
            // $$Eval is at value[0], its argument is $$Amount:Ledger
            // offset of "$$Amount"
            const innerFuncNode = (attr.value[0] as any).arguments[0];
            const offset = innerFuncNode.start + 2; // On "$$Amount"
            
            const result = findFunctionAtOffset(attr.value, offset);
            expect(result).toBeDefined();
            expect(result?.funcNode.functionName?.text).toBe('Amount');
            expect(result?.onFuncName).toBe(true);
        });

        it('returns correct paramIndex for nested function arg', () => {
            const parser = new Parser('[Part: A]\n  Set as: $$Eval:$$Amount:Ledger');
            const sourceFile = parser.parse();
            const attr = sourceFile.definitions[0].attributes[0];
            
            const innerFuncNode = (attr.value[0] as any).arguments[0];
            const ledgerArg = innerFuncNode.arguments[0];
            const offset = ledgerArg.start + 2; // On "Ledger"
            
            const result = findFunctionAtOffset(attr.value, offset);
            expect(result).toBeDefined();
            expect(result?.funcNode.functionName?.text).toBe('Amount');
            expect(result?.paramIndex).toBe(0);
            expect(result?.onFuncName).toBe(false);
        });
    });

    describe('walkAST', () => {
        it('visits all definitions', () => {
            const parser = new Parser('[Part: A]\n[Part: B]');
            const sourceFile = parser.parse();
            let defCount = 0;
            walkAST(sourceFile, (node) => {
                if ('type' in node && 'name' in node && 'attributes' in node) {
                    defCount++;
                }
            });
            // It will also visit the type and name IdentifierNodes, but they won't have 'attributes'
            expect(defCount).toBe(2);
        });

        it('visits nested statement nodes', () => {
            const parser = new Parser('[Function: Test]\n 01 : IF : True\n 02 :   Return : 1\n 03 : ENDIF');
            const sourceFile = parser.parse();
            let stmtCount = 0;
            let identifierCount = 0;
            
            walkAST(sourceFile, (node) => {
                if ('action' in node && 'args' in node) {
                    stmtCount++;
                }
                if (node.kind === SyntaxKind.Identifier) {
                    identifierCount++;
                }
            });
            
            // Should find 2 statements: IF and Return
            expect(stmtCount).toBe(2);
            // Identifiers: Test, True, 1 (depending on how literals vs identifiers are parsed)
            expect(identifierCount).toBeGreaterThan(0);
        });
    });
});
