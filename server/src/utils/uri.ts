import { URI } from 'vscode-uri';

/**
 * Normalizes URIs to ensure consistency across maps and sets.
 * Specifically, this converts Windows drive letters to standard lowercase 
 * format (e.g., 'C:' to 'c%3A') to match VS Code's internal URI formatting.
 * 
 * Note: This does NOT lowercase the entire path, as that would break
 * support for case-sensitive file systems like Linux (ext4).
 * 
 * @param uriStr The URI string to normalize
 * @returns The normalized URI string
 */
export function normalizeUri(uriStr: string): string {
    try {
        if (uriStr.startsWith('file://') && !uriStr.startsWith('file:///')) {
            uriStr = 'file:///' + uriStr.substring(7);
        }
        const parsed = URI.parse(uriStr);
        if (parsed.scheme === 'file') {
            // Converts C:/ to c%3A/ to ensure standard VS Code URI format
            return URI.file(parsed.fsPath).toString();
        }
        return uriStr;
    } catch {
        return uriStr;
    }
}
