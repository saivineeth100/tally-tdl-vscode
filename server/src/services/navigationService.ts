import {
    DefinitionParams,
    Location,
    LocationLink,
    ReferenceParams,
    RenameParams,
    WorkspaceEdit,
    PrepareRenameParams,
    Range,
    DocumentHighlightParams,
    DocumentHighlight,
    WorkspaceSymbolParams,
    SymbolInformation,
    CancellationToken
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from 'vscode-uri';
import * as path from 'path';
import * as fs from 'fs';

import { DocumentStateStore } from './documentStateStore';
import { IncludeGraphManager } from './includeGraphManager';
import { DocumentContextResolver } from "./documentContextResolver";
import { DocumentLoader } from "./documentLoader";
import { logger } from '../logger';
import { normalizeUri } from '../utils/uri';

// Feature functions
import { findReferenceAtOffset, filterDefinitionLocations } from "../features/definition";
import { renameSymbol, prepareRename } from "../features/rename";
import { findReferences } from "../features/references";
import { getWorkspaceSymbols } from "../features/workspaceSymbol";
import { getDocumentHighlights } from "../features/documentHighlight";
import { DocumentRepository } from '../ports/documentRepository';

export class NavigationService {
    constructor(
        private stateStore: DocumentStateStore,
        private graphManager: IncludeGraphManager,
        private docs: DocumentRepository,
        private documentLoader: DocumentLoader,
        private resolveIncludePath: (currentPath: string, includeName: string) => string | null
    ) {}

    public async definition(params: DefinitionParams): Promise<Location | LocationLink[] | null> {
        try {
            logger.trace(`[Trace] Server RECEIVED onDefinition for ${params.textDocument.uri}`);
            const doc = this.docs.get(params.textDocument.uri);
            if (!doc) return null;

            const normUri = normalizeUri(params.textDocument.uri);
            const docState = this.stateStore.get(normUri);
            if (!docState || !docState.sourceFile) return null;

            const text = doc.getText();
            const offset = doc.offsetAt(params.position);
            
            const scopeManager = this.stateStore.getScopeManager(normUri);

            // Find if we're on a reference
            const ref = findReferenceAtOffset(docState.sourceFile, offset, text, scopeManager, normUri);
            if (!ref) return null;

            if (ref.expectedType === 'File') {
                const targetPath = this.resolveIncludePath(URI.parse(params.textDocument.uri).fsPath, ref.name);
                if (targetPath) {
                    return {
                        uri: URI.file(targetPath).toString(),
                        range: {
                            start: { line: 0, character: 0 },
                            end: { line: 0, character: 0 }
                        }
                    };
                }
                return null;
            }

            const scope = scopeManager.getScopeAt(normUri, offset);
            const projectScope = this.graphManager.getProjectNodes(normUri);
            
            if (scope) {
                const resolved = scopeManager.resolveTarget(ref.name, ref.expectedType, scope, projectScope);

                let resolvedArray: any[] = [];
                if (resolved) {
                    if (Array.isArray(resolved)) {
                        resolvedArray = resolved;
                    } else {
                        resolvedArray = [resolved];
                    }
                }

                // Add modifier contributions if it's a definition
                if (ref.isModifier) {
                    const mods: any[] = [];
                    const normId = `${ref.expectedType.toLowerCase()}/${ref.name.toLowerCase()}`;
                    for (const [id, contribs] of scopeManager.modifierContributions.entries()) {
                        if (id.includes(normId)) {
                            mods.push(...contribs);
                        }
                    }
                    const modSymbols = mods.map(m => (m.scope as any).definition).filter(d => !!d);
                    
                    resolvedArray = filterDefinitionLocations(resolvedArray, modSymbols as import('tally-tdl-shared').DefinitionSymbol[], ref.isModifier === true);
                }

                const originSelectionRange = {
                    start: doc.positionAt(ref.start),
                    end: doc.positionAt(ref.end)
                };
                const locations: LocationLink[] = [];
                for (const item of resolvedArray) {
                    // Don't navigate to metadata-only definitions
                    if (item.uri === 'global:metadata') {
                        continue;
                    }

                    // Navigate to Virtual Document for Base TDL
                    if (item.uri.startsWith('basetdl://')) {
                        const virtualRange = {
                            start: { line: 0, character: 0 },
                            end: { line: 0, character: 0 }
                        };
                        locations.push({
                            targetUri: item.uri,
                            targetRange: virtualRange,
                            targetSelectionRange: virtualRange,
                            originSelectionRange
                        });
                        continue;
                    }

                    if (item.start === 0 && item.end === 0) {
                        continue;
                    }

                    if (item.selectionRange) {
                        locations.push({
                            targetUri: item.uri,
                            targetRange: item.selectionRange,
                            targetSelectionRange: item.selectionRange,
                            originSelectionRange
                        });
                        continue;
                    }

                    const startOffset = item.range && typeof item.range.start === 'number' ? item.range.start : item.start;
                    const endOffset = item.range && typeof item.range.end === 'number' ? item.range.end : item.end;

                    if (startOffset !== undefined && endOffset !== undefined) {
                        const targetDoc = this.docs.get(item.uri);
                        if (targetDoc) {
                            const range = {
                                start: targetDoc.positionAt(startOffset),
                                end: targetDoc.positionAt(endOffset)
                            };
                            locations.push({
                                targetUri: item.uri,
                                targetRange: range,
                                targetSelectionRange: range,
                                originSelectionRange
                            });
                            continue;
                        }

                        // Read from disk as fallback
                        try {
                            const tempDoc = await this.documentLoader.loadDocument(item.uri);
                            if (tempDoc) {
                                const range = {
                                    start: tempDoc.positionAt(startOffset),
                                    end: tempDoc.positionAt(endOffset)
                                };
                                locations.push({
                                    targetUri: item.uri,
                                    targetRange: range,
                                    targetSelectionRange: range,
                                    originSelectionRange
                                });
                                continue;
                            }
                        } catch (e) {
                            logger.error(`Error reading file for definition: ${e}`);
                        }
                    }
                }

                return locations.length > 0 ? locations : null;
            }
            
            return null;
        } catch (e) {
            logger.error(`Error in onDefinition for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
            return null;
        }
    }

    public async references(params: ReferenceParams): Promise<Location[] | null> {
        try {
            logger.trace(`[Trace] Server RECEIVED onReferences for ${params.textDocument.uri}`);
            const doc = this.docs.get(params.textDocument.uri);
            if (!doc) return null;
            const offset = doc.offsetAt(params.position);
            return await findReferences(this.stateStore, this.docs, this.documentLoader, this.graphManager, params.textDocument.uri, offset, params.context.includeDeclaration);
        } catch (e) {
            logger.error(`Error in onReferences for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
            return null;
        }
    }

    public async rename(params: RenameParams): Promise<WorkspaceEdit | null> {
        try {
            logger.trace(`[Trace] Server RECEIVED onRenameRequest for ${params.textDocument.uri}`);
            return await renameSymbol(
                params,
                this.stateStore,
                this.docs,
                this.documentLoader,
                this.graphManager
            );
        } catch (e) {
            logger.error(`Error in onRenameRequest for ${params.textDocument.uri}: ${e instanceof Error ? e.stack || e.message : String(e)}`);
            return null;
        }
    }

    public prepareRename(params: PrepareRenameParams): Promise<Range | { range: Range, placeholder: string } | null> {
        return prepareRename(params, this.stateStore, this.docs, this.documentLoader, this.graphManager);
    }

    public async workspaceSymbol(params: WorkspaceSymbolParams, token: CancellationToken): Promise<SymbolInformation[] | null> {
        return await getWorkspaceSymbols(params.query, this.stateStore, this.docs, this.documentLoader, token);
    }

    public documentHighlight(params: DocumentHighlightParams): Promise<DocumentHighlight[] | null> {
        return Promise.resolve(getDocumentHighlights(params, this.stateStore, this.docs, this.documentLoader, this.graphManager));
    }
}
