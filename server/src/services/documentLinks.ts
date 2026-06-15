import { DocumentLink } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile } from '../parser/ast';
import { URI } from 'vscode-uri';

export function provideDocumentLinks(
    sourceFile: SourceFile, 
    doc: TextDocument,
    resolveIncludePath: (current: string, name: string) => string | null
): DocumentLink[] {
    const links: DocumentLink[] = [];
    for (const def of sourceFile.definitions) {
        if (def.type?.text.toLowerCase() === 'include' || 
            def.type?.text.toLowerCase() === 'import') {
            if (def.name) {
                let name = def.name.text;
                name = name.replace(/^"|"$|^'|'$/g, '');
                const targetPath = resolveIncludePath(URI.parse(doc.uri).fsPath, name);
                if (targetPath) {
                    const startPos = doc.positionAt(def.name.start);
                    const endPos = doc.positionAt(def.name.end);
                    links.push({
                        range: { start: startPos, end: endPos },
                        target: URI.file(targetPath).toString(),
                        tooltip: `Open ${name}`
                    });
                }
            }
        }
    }
    return links;
}
