
import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { Lexer } from '../../lexer';
import * as fs from 'fs';
import * as path from 'path';

const samplesPath = 'c:/Program Files/TallyPrimeDeveloper_7/Samples';
const SAMPLES_DIR = process.env.TDL_SAMPLES_DIR || samplesPath
const hasSamples = fs.existsSync(SAMPLES_DIR);

/**
 * Recursively finds all .txt files in a directory
 */
function findTxtFiles(dir: string): string[] {
    const results: string[] = [];
    if (!hasSamples) return results;
    try {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                // Skip certain folders that don't contain TDL code
                if (item.name === '.agent' || item.name === 'Sample Data' || item.name === 'Supporting Files') {
                    continue;
                }
                results.push(...findTxtFiles(fullPath));
            } else if (item.name.endsWith('.txt')) {
                results.push(fullPath);
            }
        }
    } catch (e) {
        // Skip if not accessible
    }
    return results;
}

describe.skipIf(!hasSamples)('Parser - Full Sample File Validation', () => {
    const allTxtFiles = findTxtFiles(SAMPLES_DIR);

    it(`should have found sample files`, () => {
        expect(allTxtFiles.length).toBeGreaterThan(0);
        // console.log(`Found ${allTxtFiles.length} TDL sample files`);
    });

    allTxtFiles.forEach(filePath => {
        const relativePath = path.relative(SAMPLES_DIR, filePath);

        it(`should parse ${relativePath} without errors`, () => {
            const content = fs.readFileSync(filePath, 'utf-8');

            // Lexer should not throw
            const lexer = new Lexer(content);
            const tokens = lexer.Generate();
            expect(tokens.length).toBeGreaterThan(0);

            // Parser should not throw and produce definitions
            const parser = new Parser(content);
            const sourceFile = parser.parse();

            // We expect the file to parse into at least one definition or have zero tokens if empty
            if (tokens.length > 0) {
                expect(sourceFile.definitions).toBeDefined();
            }

            // We should ideally have 0 parsing errors.
            // Note: A small number of sample files currently produce errors due to 
            // outstanding edge cases documented in parser_plan.md (like Inline Directives).
            // We log them for visibility or assert based on strictness.
            const formattedErrors = sourceFile.errors.map(e => `[${relativePath}] ${e.message} at index ${e.start}`);
            expect(formattedErrors).toEqual([]);
            // console.log(`${relativePath}: ${sourceFile.definitions.length} defs, ${tokens.length} tokens`);
        });
    });
});
