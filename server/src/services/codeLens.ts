import { CodeLens } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile } from '../parser/ast';
import { DocManager } from '../docManager';
import { findReferences } from './references';

export function provideCodeLens(sourceFile: SourceFile, doc: TextDocument): CodeLens[] {
    const lenses: CodeLens[] = [];
    for (const def of sourceFile.definitions) {
        const isSystem = def.type?.text?.toLowerCase() === 'system';
        
        if (isSystem) {
            // For System definitions, show references for the individual items instead of the system group
            const sysType = def.name?.text?.toLowerCase();
            if (sysType === 'formula' || sysType === 'formulae' || sysType === 'variable' || sysType === 'variables') {
                for (const attr of def.attributes) {
                    if (attr.name) {
                        lenses.push({
                            range: {
                                start: doc.positionAt(attr.name.start),
                                end: doc.positionAt(attr.name.end)
                            },
                            data: { uri: doc.uri, name: attr.name.text, position: doc.positionAt(attr.name.start) }
                        });
                    }
                }
            }
        } else if (def.name) {
            const defTypeLower = def.type?.text?.toLowerCase();
            if (defTypeLower !== 'include' && defTypeLower !== 'import') {
                lenses.push({
                    range: {
                        start: doc.positionAt(def.name.start),
                        end: doc.positionAt(def.name.end)
                    },
                    data: { uri: doc.uri, name: def.name.text, position: doc.positionAt(def.name.start) }
                });
            }
        }
    }
    return lenses;
}

export async function resolveCodeLens(lens: CodeLens, docManager: DocManager, docs: any): Promise<CodeLens> {
    const offset = docManager.get(lens.data.uri)?.sourceFile ? docs.get(lens.data.uri)?.offsetAt(lens.data.position) : 0;
    if (!offset) return lens;

    const references = await findReferences(docManager, docs, lens.data.uri, offset);
    const count = references ? references.length : 0;
    
    lens.command = {
        title: `${count} reference${count === 1 ? '' : 's'}`,
        command: 'tally-tdl.showReferences',
        arguments: [
            lens.data.uri,
            lens.range.start,
            references || []
        ]
    };
    return lens;
}
