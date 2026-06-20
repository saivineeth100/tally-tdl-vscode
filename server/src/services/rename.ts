import { WorkspaceEdit, TextEdit, RenameParams, PrepareRenameParams, Range, TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager, readFileWithEncoding } from '../docManager';
import { findReferences } from './references';
import { findReferenceAtOffset } from './definition';
import { URI } from 'vscode-uri';

export async function renameSymbol(
    params: RenameParams,
    docManager: DocManager,
    docs: TextDocuments<TextDocument>
): Promise<WorkspaceEdit | null> {
    const uri = params.textDocument.uri;
    const doc = docs.get(uri);
    if (!doc) return null;

    const offset = doc.offsetAt(params.position);
    const newName = params.newName;
    
    // Validate new name (no spaces if it's a variable, etc. - simple validation)
    if (!newName || newName.trim() === '') {
        return null;
    }

    // Get all references including definitions
    const locations = await findReferences(docManager, docs, uri, offset, true);
    if (locations.length === 0) return null;

    const changes: { [uri: string]: TextEdit[] } = {};

    for (const loc of locations) {
        if (!changes[loc.uri]) {
            changes[loc.uri] = [];
        }
        
        // We just replace the exact range with the new name.
        // `findReferences` handles variables (like #Var) by returning the range 
        // that corresponds to the name portion. Wait, findReferenceAtOffset returns 
        // the full range of the identifier, e.g. `#Var`. If we replace `#Var` with `NewVar`, 
        // we lose the `#`. We need to preserve the prefix if it's a variable.
        
        const locDoc = docs.get(loc.uri);
        if (locDoc) {
            let startOffset = locDoc.offsetAt(loc.range.start);
            const endOffset = locDoc.offsetAt(loc.range.end);
            const originalText = locDoc.getText(loc.range);
            
            // Adjust range to skip prefixes, matching exactly what prepareRename highlighted
            if (originalText.startsWith('$$')) {
                startOffset += 2;
            } else if (originalText.startsWith('##')) {
                startOffset += 2;
            } else if (originalText.startsWith('#')) {
                startOffset += 1;
            } else if (originalText.startsWith('$')) {
                startOffset += 1;
            }

            const adjustedRange = {
                start: locDoc.positionAt(startOffset),
                end: locDoc.positionAt(endOffset)
            };

            changes[loc.uri].push(TextEdit.replace(adjustedRange, newName));
        } else {
            // Document not open — read from disk to preserve prefixes
            try {
                const fsPath = URI.parse(loc.uri).fsPath;
                const content = await readFileWithEncoding(fsPath);
                const closedDoc = TextDocument.create(loc.uri, 'tally', 1, content);
                let startOff = closedDoc.offsetAt(loc.range.start);
                const endOff = closedDoc.offsetAt(loc.range.end);
                const originalText = closedDoc.getText(loc.range);

                if (originalText.startsWith('$$')) startOff += 2;
                else if (originalText.startsWith('##')) startOff += 2;
                else if (originalText.startsWith('#')) startOff += 1;
                else if (originalText.startsWith('$')) startOff += 1;

                const adjustedRange = {
                    start: closedDoc.positionAt(startOff),
                    end: closedDoc.positionAt(endOff)
                };
                changes[loc.uri].push(TextEdit.replace(adjustedRange, newName));
            } catch (err) {
                console.warn(`[rename] Error reading file ${loc.uri}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
                changes[loc.uri].push(TextEdit.replace(loc.range, newName));
            }
        }
    }

    return { changes };
}

export function prepareRename(
    params: PrepareRenameParams,
    docManager: DocManager,
    docs: TextDocuments<TextDocument>
): Range | { range: Range, placeholder: string } | null {
    const uri = params.textDocument.uri;
    const doc = docs.get(uri);
    if (!doc) return null;

    const offset = doc.offsetAt(params.position);
    const docState = docManager.get(uri);
    if (!docState) return null;

    const refInfo = findReferenceAtOffset(
        docState.sourceFile,
        offset,
        doc.getText(),
        docManager.getScopeManager(uri),
        uri
    );

    if (refInfo) {
        // We must ensure the placeholder matches the text in the range perfectly.
        // If the variable has a prefix like # or $$, we should adjust the range to exclude it.
        let startOffset = refInfo.start;
        const endOffset = refInfo.end;
        
        const originalText = doc.getText({
            start: doc.positionAt(startOffset),
            end: doc.positionAt(endOffset)
        });
        
        if (originalText.startsWith('$$')) {
            startOffset += 2;
        } else if (originalText.startsWith('##')) {
            startOffset += 2;
        } else if (originalText.startsWith('#')) {
            startOffset += 1;
        } else if (originalText.startsWith('$')) {
            startOffset += 1;
        }

        return {
            range: {
                start: doc.positionAt(startOffset),
                end: doc.positionAt(endOffset)
            },
            placeholder: refInfo.name
        };
    }

    // Check if we are on a definition name
    for (const def of docState.sourceFile.definitions) {
        if (def.name && offset >= def.name.start && offset <= def.name.end) {
            return {
                range: {
                    start: doc.positionAt(def.name.start),
                    end: doc.positionAt(def.name.end)
                },
                placeholder: def.name.text
            };
        }
    }

    return null;
}
