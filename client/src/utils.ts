import { Uri } from 'vscode';

export function normalizeUri(uriStr: string): string {
    try {
        if (uriStr.startsWith('file://') && !uriStr.startsWith('file:///')) {
            uriStr = 'file:///' + uriStr.substring(7);
        }
        const parsed = Uri.parse(uriStr);
        if (parsed.scheme === 'file') {
            // Converts C:/ to c%3A/ to ensure standard VS Code URI format
            return Uri.file(parsed.fsPath).toString();
        }
        return uriStr;
    } catch {
        return uriStr;
    }
}
