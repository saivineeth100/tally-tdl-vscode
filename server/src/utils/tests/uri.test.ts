import { describe, it, expect } from 'vitest';
import { normalizeUri } from '../uri';
import { URI } from 'vscode-uri';

describe('URI Normalization', () => {
    it('should normalize drive letters to ensure standard VS Code URI format', () => {
        const uri1 = 'file:///C:/Program%20Files/file.tdl';
        const norm1 = normalizeUri(uri1);
        
        // vscode-uri normalizes C: to c%3A
        expect(norm1).toBe(URI.file('C:\\Program Files\\file.tdl').toString());
    });

    it('should handle URIs that are already normalized gracefully', () => {
        const expected = URI.file('c:\\test\\my_file.tdl').toString();
        expect(normalizeUri(expected)).toBe(expected);
    });

    it('should fallback to string on invalid URIs', () => {
        const badUri = 'not_a_uri://%bad_encoding/Path';
        expect(normalizeUri(badUri)).toBe(badUri);
    });
});
