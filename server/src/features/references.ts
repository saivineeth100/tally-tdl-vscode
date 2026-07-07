import { Location } from 'vscode-languageserver';
import { DocumentStateStore } from '../services/documentStateStore';
import { DocumentRepository } from '../ports/documentRepository';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { findReferenceAtOffset, findDefinitionByName } from './definition';
import { URI } from 'vscode-uri';
import { normalizeUri } from '../utils/uri';
import * as fs from 'fs';
import { normalizeTypeName } from '../utils/normalizeUtils';
import { walkAST } from '../core/ast/astQuery';
import { SyntaxKind, IdentifierNode } from '../core/ast/ast';
import { positionAt } from '../utils/positionUtils';
import { ScopeManager } from '../semantics/scopeManager';
import { DocumentLoader } from '../services/documentLoader';
import { IncludeGraphManager } from '../services/includeGraphManager';

export async function findReferences(
    stateStore: DocumentStateStore,
    docs: DocumentRepository,
    documentLoader: DocumentLoader,
    includeGraphManager: IncludeGraphManager,
    uri: string,
    offset: number,
    includeDeclaration: boolean = true,
    scopeUri?: string
): Promise<Location[]> {
    const locations: Location[] = [];
    const normUri = normalizeUri(uri);
    const sourceDoc = docs.get(uri);
    const sourceDocState = stateStore.get(normUri);
    
    if (!sourceDoc || !sourceDocState) return locations;

    // Determine what we are trying to find references for.
    // It could be a reference or a definition where the cursor currently is.
    const refInfo = findReferenceAtOffset(
        sourceDocState.sourceFile,
        offset,
        sourceDoc.getText(),
        stateStore.getScopeManager(normUri),
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
                        },
                        isDefinition: true
                    } as any);
                }
                break;
            } else {
                // Check if cursor is on an attribute name (like an implicit local formula)
                for (const attr of def.attributes) {
                    if (attr.name && offset >= attr.name.start && offset <= attr.name.end) {
                        const scopeMgr = stateStore.getScopeManager(normUri);
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

    var scopeManager = stateStore.getScopeManager(normUri)
    const candidateUris = scopeManager.projectScope.referenceIndex.getCandidateUris(targetName);
    
    if (candidateUris && candidateUris.size === 0) return locations;
    
    const searchScope = candidateUris || new Set<string>();
    const scopeMgr = stateStore.getScopeManager(normUri);
    const targetScopeUri = scopeUri ? normalizeUri(scopeUri) : null;
    
    // Iterate through candidate documents containing the symbol
    for (const docUri of searchScope) {
        const normDocUri = normalizeUri(docUri);
        
        // 1. If searching within a specific file scope, match the URI
        if (targetScopeUri && normDocUri !== targetScopeUri) {
            continue;
        }
        
        // 2. If searching project-wide, skip standalone files (workspace scope) except the file itself
        if (!targetScopeUri && normDocUri !== normUri && scopeMgr.isFileWorkspaceScope(normDocUri)) {
            continue;
        }

        const docState = stateStore.get(normDocUri);
        if (!docState) continue;
        
        // 1. Add the definition itself if it resides in this file (once per file)
        if (includeDeclaration) {
            for (const def of docState.sourceFile.definitions) {
                if (def.name && def.name.text.toLowerCase() === lowerTargetName) {
                    if (!lowerTargetType || def.type.text.toLowerCase() === lowerTargetType) {
                        locations.push({
                            uri: normDocUri,
                            range: {
                                start: positionAt(def.name.start, docState.sourceFile.lineOffsets),
                                end: positionAt(def.name.end, docState.sourceFile.lineOffsets)
                            },
                            isDefinition: true
                        } as any);
                    }
                }
            }
        }

        // 2. Fast AST walk to find references/usages only
        walkAST(docState.sourceFile, (node) => {
            if (node.kind === SyntaxKind.Identifier && (node as IdentifierNode).text?.toLowerCase() === lowerTargetName) {
                // Use findReferenceAtOffset to verify this occurrence references our target
                const matchRefInfo = findReferenceAtOffset(
                    docState.sourceFile,
                    node.start,
                    '', // unused text
                    stateStore.getScopeManager(normDocUri),
                    normDocUri
                );
                
                if (matchRefInfo && matchRefInfo.name.toLowerCase() === lowerTargetName) {
                    if (!lowerTargetType || !matchRefInfo.expectedType || matchRefInfo.expectedType.toLowerCase() === lowerTargetType || lowerTargetType === 'variable') {
                        // It's a match!
                        locations.push({
                            uri: normDocUri,
                            range: {
                                start: positionAt(matchRefInfo.start, docState.sourceFile.lineOffsets),
                                end: positionAt(matchRefInfo.end, docState.sourceFile.lineOffsets)
                            },
                            isModifier: matchRefInfo.isModifier === true
                        } as any);
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
