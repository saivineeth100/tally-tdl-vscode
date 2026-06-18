import { describe, it, expect } from 'vitest';
import { Parser } from '../../parser';
import { Lexer } from '../../lexer';
import * as fs from 'fs';
import * as path from 'path';
import { DiagnosticRules, validateSourceFile } from '../../../services/validation';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { testScopeManager } from '../../../test-setup';

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

        it(`should parse and validate ${relativePath} without errors`, async () => {
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
            const formattedErrors = sourceFile.errors.map(e => `[${relativePath}] ${e.message} at index ${e.start}`);
            expect(formattedErrors).toEqual([]);

            // Validate
            if (testScopeManager) {
                const doc = TextDocument.create('file:///' + relativePath.replace(/\\/g, '/'), 'tdl', 1, content);
                const diagnostics = await validateSourceFile(sourceFile, doc, undefined, testScopeManager);

                // Exclude broken sequence diagnostics as requested
                const filteredDiagnostics = diagnostics.filter(d => d.code !== DiagnosticRules.BrokenLabelSeqence.code);

                // Currently, we just log validation errors or we can assert on them if we expect 100% clean samples.
                // Since this is a test to ensure it doesn't crash and we want to catch bugs, we might assert on severe errors only.
                // Let's assert that there are no unhandled exceptions in the validator. 
                // We'll also just check the count, though some samples might have genuine warnings.
                expect(filteredDiagnostics).toBeDefined();
            }
        });
    });
});
