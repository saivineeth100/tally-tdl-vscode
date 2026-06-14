
import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { Lexer } from '../../lexer';
import * as fs from 'fs';
import * as path from 'path';

const SAMPLES_DIR = process.env.TDL_SAMPLES_DIR || 'c:/Program Files/TallyPrimeDeveloper_6/Samples';
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

            // Log summary
            // console.log(`${relativePath}: ${sourceFile.definitions.length} defs, ${tokens.length} tokens`);
        });
    });
});
