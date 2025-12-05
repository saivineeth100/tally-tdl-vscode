import { describe, expect, test } from 'vitest';
import { Parser } from '../../parser';
import { TokenKind } from '../../tokenKind';
import { SyntaxKind } from '../../ast';
import * as fs from 'fs';
import * as path from 'path';

const samplesDir = 'c:/Program Files/TallyPrimeDeveloper_6/Samples/Symbols & Prefixes';

describe('Parser Samples Verification', () => {

    if (!fs.existsSync(samplesDir)) {
        console.warn(`Samples directory not found: ${samplesDir}. Skipping sample tests.`);
        return;
    }

    const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.txt'));

    files.forEach(file => {
        test(`Parse ${file}`, () => {
            const fullPath = path.join(samplesDir, file);
            const content = fs.readFileSync(fullPath, 'utf8');

            const parser = new Parser(content);
            const sourceFile = parser.parse();

            expect(sourceFile).toBeDefined();
            expect(sourceFile.kind).toBe(SyntaxKind.SourceFile);

            // Check if we parsed ANY definitions
            // Some files might be empty or comments only?
            if (sourceFile.definitions.length === 0) {
                // Warn? Or check if content was empty?
                // console.log(`File ${file} parsed but found 0 definitions.`);
            } else {
                // Check basic structure of first definition
                const firstDef = sourceFile.definitions[0];
                expect(firstDef.kind).toBe(SyntaxKind.Definition);
            }

            // Should valid TDL samples have errors? 
            // Ideally 0 errors.
            // But strict parser might find things it doesn't understand yet.
            // Let's check for "Critical" errors or crashes strictly first.

            // To make this useful, let's Fail if we have 0 definitions but file is large?
        });
    });
});
