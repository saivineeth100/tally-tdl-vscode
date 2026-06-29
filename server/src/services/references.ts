import { Location } from 'vscode-languageserver';
import { DocManager, readFileWithEncoding } from '../docManager';
import { TextDocuments } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { findReferenceAtOffset, findDefinitionByName } from './definition';
import { URI } from 'vscode-uri';
import * as fs from 'fs';
import { normalizeTypeName } from './utils';
import { walkAST } from '../parser/astQuery';
import { SyntaxKind, IdentifierNode } from '../parser/ast';
import { positionAt } from '../utils/positionUtils';
import { ScopeManager } from './scopeManager';

export async function findReferences(
    docManager: DocManager,
    docs: TextDocuments<TextDocument>,
    uri: string,
    offset: number,
    includeDeclaration: boolean = false,
    scopeUri?: string
): Promise<Location[]> {
    const locations: Location[] = [];
    const sourceDoc = docs.get(uri);
    const sourceDocState = docManager.get(uri);
    
    if (!sourceDoc || !sourceDocState) return locations;

    // Determine what we are trying to find references for.
    // It could be a reference or a definition where the cursor currently is.
    const refInfo = findReferenceAtOffset(
        sourceDocState.sourceFile,
        offset,
        sourceDoc.getText(),
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
            } else {
                // Check if cursor is on an attribute name (like an implicit local formula)
                for (const attr of def.attributes) {
                    if (attr.name && offset >= attr.name.start && offset <= attr.name.end) {
                        const scopeMgr = docManager.getScopeManager(uri);
                        const scope = scopeMgr.getScopeAt(uri, offset);
                        if (scope) {
                            const formulaDef = scopeMgr.resolveFormula(attr.name.text, scope);
                            if (formulaDef && formulaDef.uri === uri && formulaDef.start === attr.name.start) {
                                targetName = attr.name.text;
                                targetType = 'Formula';
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
                    }
                }
                if (targetName) break;
            }
        }
    }

    if (!targetName) return locations;

    const lowerTargetName = targetName.toLowerCase();
    const lowerTargetType = targetType?.toLowerCase();

    // Fast O(1) filter to only search files that contain the exact identifier
    const candidateUris = docManager.getScopeManager(uri).projectScope.referenceIndex.getCandidateUris(targetName);
    if (candidateUris && candidateUris.size === 0) return locations;

    const projectScope = scopeUri ? new Set([scopeUri]) : docManager.getProjectNodes(uri);

    // Iterate through project documents
    for (const docUri of projectScope) {
        if (candidateUris && !candidateUris.has(docUri)) continue; // Skip if identifier is definitively not in this file

        const docState = docManager.get(docUri);
        if (!docState) continue;
        
        // Fast AST walk instead of text search
        walkAST(docState.sourceFile, (node) => {
            if (node.kind === SyntaxKind.Identifier && (node as IdentifierNode).text?.toLowerCase() === lowerTargetName) {
                // Use findReferenceAtOffset to verify this occurrence references our target
                // We pass empty string for text since we modified findReferenceAtOffset to not need it
                const matchRefInfo = findReferenceAtOffset(
                    docState.sourceFile,
                    node.start,
                    '', // unused text
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
                                start: positionAt(matchRefInfo.start, docState.sourceFile.lineOffsets),
                                end: positionAt(matchRefInfo.end, docState.sourceFile.lineOffsets)
                            }
                        });
                    }
                } else {
                    // It might be a definition name itself
                    for (const def of docState.sourceFile.definitions) {
                        if (def.name && node.start >= def.name.start && node.start <= def.name.end) {
                            if (def.name.text.toLowerCase() === lowerTargetName) {
                                if (!lowerTargetType || def.type.text.toLowerCase() === lowerTargetType) {
                                    if (includeDeclaration) {
                                        locations.push({
                                            uri: docUri,
                                            range: {
                                                start: positionAt(def.name.start, docState.sourceFile.lineOffsets),
                                                end: positionAt(def.name.end, docState.sourceFile.lineOffsets)
                                            }
                                        });
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            }
        });
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
