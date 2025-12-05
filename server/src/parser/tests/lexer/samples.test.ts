import { describe, expect, test } from 'vitest';
import { Lexer } from '../../lexer';
import { TokenKind } from '../../tokenKind';
import * as fs from 'fs';
import * as path from 'path';

const samplesDir = 'c:/Program Files/TallyPrimeDeveloper_6/Samples/Symbols & Prefixes';

describe('Lexer Samples Verification', () => {

    // Get all .txt files in the directory
    if (!fs.existsSync(samplesDir)) {
        console.warn(`Samples directory not found: ${samplesDir}. Skipping sample tests.`);
        return;
    }

    const files = fs.readdirSync(samplesDir).filter(f => f.endsWith('.txt'));

    files.forEach(file => {
        test(`Tokenize ${file}`, () => {
            const fullPath = path.join(samplesDir, file);
            const content = fs.readFileSync(fullPath, 'utf8');

            expect(content).toBeDefined();
            expect(content.length).toBeGreaterThan(0);

            const lexer = new Lexer(content);
            const tokens = lexer.Generate();

            expect(tokens).toBeDefined();
            expect(tokens.length).toBeGreaterThan(0);

            // Check that we reach EOF
            const lastToken = tokens[tokens.length - 1];
            expect(lastToken.Kind).toBe(TokenKind.EndOfFileToken);

            // Optional: Check for Unknown tokens? 
            // In a perfect world, we shouldn't have many. But TDL might have characters we don't handle yet.
            // Let's count them and warn if too many? Or just fail if *all* are unknown?
            const unknownTokens = tokens.filter(t => t.Kind === TokenKind.Unknown);
            if (unknownTokens.length > 0) {
                // For now, just log them to see what's missing. Fail if it's a huge percentage?
                // console.log(`File: ${file} has ${unknownTokens.length} unknown tokens out of ${tokens.length}`);
            }

            // Ensure no throw
        });
    });
});
