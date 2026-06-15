import { CodeLens } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile } from '../parser/ast';
import { DocManager } from '../docManager';
import { findReferences } from './references';

export function provideCodeLens(sourceFile: SourceFile, doc: TextDocument): CodeLens[] {
    const lenses: CodeLens[] = [];
    for (const def of sourceFile.definitions) {
        // Skip System definitions if desired, but we can just show references for everything
        if (def.name) {
            lenses.push({
                range: {
                    start: doc.positionAt(def.name.start),
                    end: doc.positionAt(def.name.end)
                },
                data: { uri: doc.uri, name: def.name.text, position: doc.positionAt(def.name.start) }
            });
        }
    }
    return lenses;
}

export function resolveCodeLens(lens: CodeLens, docManager: DocManager, docs: any): CodeLens {
    const offset = docManager.get(lens.data.uri)?.sourceFile ? docs.get(lens.data.uri)?.offsetAt(lens.data.position) : 0;
    if (!offset) return lens;

    const references = findReferences(docManager, docs, lens.data.uri, offset);
    const count = references ? references.length : 0;
    
    lens.command = {
        title: `${count} reference${count === 1 ? '' : 's'}`,
        command: 'editor.action.showReferences',
        arguments: [
            lens.data.uri,
            lens.range.start,
            references || []
        ]
    };
    return lens;
}
