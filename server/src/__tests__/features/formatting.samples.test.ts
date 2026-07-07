import { describe, it, expect } from 'vitest';
import { formatDocument } from '../../features/formatting';
import { FormattingOptions } from 'vscode-languageserver';
import { Parser } from '../../core/parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import * as fs from 'fs';
import * as path from 'path';

describe('Document Formatting - Real Samples', () => {
    const options: FormattingOptions = {
        tabSize: 4,
        insertSpaces: true,
        trimTrailingWhitespace: true,
        insertFinalNewline: true,
        trimFinalNewlines: true
    };

    const samplesDir = path.resolve(process.env.TDL_SAMPLES_DIR || "c:/Program Files/TallyPrimeDeveloper_6/Samples");
    const samplesTxtPath = path.join(samplesDir, "Samples.txt");

    it('should format Samples.txt without crashing and preserving structure', () => {
        if (!fs.existsSync(samplesTxtPath)) {
            console.warn("Skipping sample test: File not found at " + samplesTxtPath);
            return;
        }

        const input = fs.readFileSync(samplesTxtPath, 'utf-8');
        const parser = new Parser(input);
        const sourceFile = parser.parse();

        // Expect successful parsing first
        const originalDefCount = sourceFile.definitions.length;
        expect(originalDefCount).toBeGreaterThan(0);

        // Run Formatter
        const edits = formatDocument(input, sourceFile, options);
        expect(edits).toBeDefined();
        
        const doc = TextDocument.create('file://test', 'tdl', 1, input);
        const output = TextDocument.applyEdits(doc, edits);

        // Verify Stability: Re-parse the output
        const parser2 = new Parser(output);
        const sourceFile2 = parser2.parse();

        // Structure should be preserved
        expect(sourceFile2.definitions.length).toBe(originalDefCount);

        // Ensure content isn't lost (length check)
        // Formatting might add spaces/indentation, or remove some whitespace.
        // It should generally be within 20% of original.
        expect(output.length).toBeGreaterThan(input.length * 0.8);
        expect(output.length).toBeLessThan(input.length * 1.5);
    });
});
