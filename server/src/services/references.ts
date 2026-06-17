import { getMetadata } from './metadataService';
import { Location } from 'vscode-languageserver';
import { DocManager, readFileWithEncoding } from '../docManager';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { findReferenceAtOffset, findDefinitionByName } from './definition';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import { SyntaxKind } from '../parser/ast';
import { ScopeManager } from './scopeManager';

export async function findReferences(
    docManager: DocManager,
    docs: TextDocuments<TextDocument>,
    uri: string,
    offset: number,
    includeDeclaration: boolean = false
): Promise<Location[]> {
    const locations: Location[] = [];
    const sourceDoc = docs.get(uri);
    const sourceDocState = docManager.get(uri);
    
    if (!sourceDoc || !sourceDocState) return locations;

    const metadata = getMetadata();

    // Determine what we are trying to find references for.
    // It could be a reference or a definition where the cursor currently is.
    const refInfo = findReferenceAtOffset(
        sourceDocState.sourceFile,
        offset,
        sourceDoc.getText(),
        metadata,
        docManager.getScopeManager(uri),
        uri
    );

    let targetName: string | undefined;
    let targetType: string | undefined;

    if (refInfo) {
        targetName = refInfo.name;
        targetType = refInfo.expectedType;
    } else {
        // Maybe the cursor is on the definition name itself or inside a System definition
        for (const def of sourceDocState.sourceFile.definitions) {
            const isSystem = def.type?.text?.toLowerCase() === 'system';
            
            if (isSystem) {
                for (const attr of def.attributes) {
                    if (attr.name && offset >= attr.name.start && offset <= attr.name.end) {
                        targetName = attr.name.text;
                        const sysType = def.name?.text?.toLowerCase();
                        if (sysType === 'formula' || sysType === 'formulae') {
                            targetType = 'Formula';
                        } else if (sysType === 'variable' || sysType === 'variables') {
                            targetType = 'Variable';
                        }
                        
                        if (includeDeclaration) {
                            locations.push({
                                uri: uri,
                                range: {
                                    start: sourceDoc.positionAt(attr.name.start),
                                    end: sourceDoc.positionAt(attr.name.end)
                                }
                            });
                        }
                        break;
                    }
                }
                if (targetName) break;
            } else if (def.name && offset >= def.name.start && offset <= def.name.end) {
                targetName = def.name.text;
                targetType = def.type.text;
                
                // Add the definition itself to the references
                if (includeDeclaration) {
                    locations.push({
                        uri: uri,
                        range: {
                            start: sourceDoc.positionAt(def.name.start),
                            end: sourceDoc.positionAt(def.name.end)
                        }
                    });
                }
                break;
            }
        }
    }

    if (!targetName) return locations;

    const lowerTargetName = targetName.toLowerCase();
    const lowerTargetType = targetType?.toLowerCase();

    const projectScope = docManager.getProjectNodes(uri);

    // Iterate through project documents
    for (const docUri of projectScope) {
        const docState = docManager.get(docUri);
        if (!docState) continue;

        let textDoc = docs.get(docUri);
        let text: string;

        if (textDoc) {
            text = textDoc.getText();
        } else {
            try {
                const fsPath = URI.parse(docUri).fsPath;
                text = await readFileWithEncoding(fsPath);
                textDoc = TextDocument.create(docUri, 'tally', 1, text);
            } catch (e) {
                continue;
            }
        }
        
        // Fast string search for the target name to skip files without it
        // We use indexOf instead of regex to properly support names with spaces and special characters
        const lowerText = text.toLowerCase();
        let matchOffset = lowerText.indexOf(lowerTargetName);
        
        while (matchOffset !== -1) {

            // Use findReferenceAtOffset to verify this occurrence references our target
            const matchRefInfo = findReferenceAtOffset(
                docState.sourceFile,
                matchOffset,
                text,
                metadata,
                docManager.getScopeManager(docUri),
                docUri
            );

            if (matchRefInfo && matchRefInfo.name.toLowerCase() === lowerTargetName) {
                // If we know the type, verify it matches
                if (!lowerTargetType || !matchRefInfo.expectedType || matchRefInfo.expectedType.toLowerCase() === lowerTargetType || lowerTargetType === 'variable') {
                    // It's a match!
                    locations.push({
                        uri: docUri,
                        range: {
                            start: textDoc.positionAt(matchRefInfo.start),
                            end: textDoc.positionAt(matchRefInfo.end)
                        }
                    });
                }
            } else {
                // It might be a definition name itself
                for (const def of docState.sourceFile.definitions) {
                    if (def.name && matchOffset >= def.name.start && matchOffset <= def.name.end) {
                        if (def.name.text.toLowerCase() === lowerTargetName) {
                            if (!lowerTargetType || def.type.text.toLowerCase() === lowerTargetType) {
                                if (includeDeclaration) {
                                    locations.push({
                                        uri: docUri,
                                        range: {
                                            start: textDoc.positionAt(def.name.start),
                                            end: textDoc.positionAt(def.name.end)
                                        }
                                    });
                                }
                            }
                        }
                        break;
                    }
                }
            }

            matchOffset = lowerText.indexOf(lowerTargetName, matchOffset + lowerTargetName.length);
        }
    }

    // Filter duplicates
    const uniqueLocations = filterDuplicateLocations(locations);
    return uniqueLocations;
}



function filterDuplicateLocations(locations: Location[]): Location[] {
    const seen = new Set<string>();
    return locations.filter(loc => {
        const key = `${loc.uri}:${loc.range.start.line}:${loc.range.start.character}-${loc.range.end.line}:${loc.range.end.character}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
