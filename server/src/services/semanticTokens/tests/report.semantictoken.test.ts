import { describe, it, expect } from 'vitest';
import { SemanticTokenTypes } from "vscode-languageserver";
import { parseAndGetTokens } from "./semanticTokens.test";

describe('Report Semantic Tokens', () => {
    it('should tokenize Class Definitions', () => {
        const tdl = `[Report: FieldTriggerEx]

	Form: FieldTriggerEx

[Form: FieldTriggerEx]

	Parts: FieldTriggerEx`;
        const tokens = parseAndGetTokens(tdl);



        const formToken = tokens.find(t => t.text === 'FieldTriggerEx');
        expect(formToken).toBeDefined();
        expect(formToken!.type).toBe(SemanticTokenTypes.class);
    });
})