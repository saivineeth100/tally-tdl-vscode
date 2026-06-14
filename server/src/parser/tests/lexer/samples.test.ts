import { describe, expect, test } from 'vitest';
import { Lexer } from '../../lexer';
import { TokenKind } from '../../tokenKind';
import * as fs from 'fs';
import * as path from 'path';

const samplesDir = process.env.TDL_SAMPLES_DIR 
    ? path.join(process.env.TDL_SAMPLES_DIR, 'Symbols & Prefixes')
    : 'c:/Program Files/TallyPrimeDeveloper_6/Samples/Symbols & Prefixes';
const hasSamples = fs.existsSync(samplesDir);

describe.skipIf(!hasSamples)('Lexer Samples Verification', () => {
    const files = hasSamples ? fs.readdirSync(samplesDir).filter(f => f.endsWith('.txt')) : [];

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
                console.error(`File: ${file} has ${unknownTokens.length} unknown tokens:`, unknownTokens.map(t => t.Text));
            }
            expect(unknownTokens.length).toBe(0);
        });
    });
});
