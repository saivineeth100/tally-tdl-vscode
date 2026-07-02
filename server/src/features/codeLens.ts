import { CodeLens } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile } from '../core/ast/ast';
import { DocManager } from '../docManager';
import { findReferences } from './references';
import { ScopeManager } from '../semantics/scopeManager';

export function provideCodeLens(sourceFile: SourceFile, doc: TextDocument, scopeManager: ScopeManager): CodeLens[] {
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
                    data: { uri: doc.uri, name: def.name.text, position: doc.positionAt(def.name.start), type: 'usages' }
                });

                let modCount = 0;
                if (scopeManager && 'modifierContributions' in scopeManager) {
                    const defId = scopeManager.normalizeScopeId(defTypeLower + ':' + def.name.text);
                    const mods = (scopeManager as any).modifierContributions.get(defId);
                    if (mods) modCount = mods.length;
                }

                if (modCount > 0) {
                    lenses.push({
                        range: {
                            start: doc.positionAt(def.name.start),
                            end: doc.positionAt(def.name.end)
                        },
                        data: { uri: doc.uri, name: def.name.text, position: doc.positionAt(def.name.start), type: 'modifiers' }
                    });
                }

                // Also check for local formulas defined within this definition
                const scope = scopeManager.getScopeAt(doc.uri, def.start);
                if (scope && 'formulas' in scope) {
                    for (const formulaDef of scope.formulas.values()) {
                        if (formulaDef.uri === doc.uri && formulaDef.start >= def.start && formulaDef.end <= def.end) {
                            lenses.push({
                                range: {
                                    start: doc.positionAt(formulaDef.start),
                                    end: doc.positionAt(formulaDef.end)
                                },
                                data: { uri: doc.uri, name: formulaDef.name, position: doc.positionAt(formulaDef.start) }
                            });
                        }
                    }
                }
            }
        }
    }
    return lenses;
}

interface CacheEntry {
    count: number;
    locations: any[];
    timestamp: number;
}
const refCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5000; // 5 seconds

export function clearCodeLensCache() {
    refCache.clear();
}

export function invalidateRefCountCache(uri?: string) {
    if (uri) {
        for (const key of refCache.keys()) {
            if (key.startsWith(uri)) refCache.delete(key);
        }
    } else {
        refCache.clear();
    }
}
export async function resolveCodeLens(lens: CodeLens, docManager: DocManager, docs: any): Promise<CodeLens> {
    const offset = docManager.get(lens.data.uri)?.sourceFile ? docs.get(lens.data.uri)?.offsetAt(lens.data.position) : 0;
    if (offset === undefined || offset === null) return lens;

    const cacheKey = `${lens.data.uri}:${offset}`;
    const now = Date.now();
    let references: any[] = [];
    let count = 0;

    if (refCache.has(cacheKey) && (now - refCache.get(cacheKey)!.timestamp < CACHE_TTL)) {
        const cached = refCache.get(cacheKey)!;
        references = cached.locations;
        count = cached.count;
    } else {
        references = await findReferences(docManager, docs, lens.data.uri, offset);
        count = references ? references.length : 0;
        refCache.set(cacheKey, { count, locations: references || [], timestamp: now });
    }
    
    if (lens.data.type === 'usages') {
        const usages = references.filter((r: any) => !r.isModifier && !r.isDefinition);
        count = usages.length;
        lens.command = {
            title: `${count} usage${count === 1 ? '' : 's'}`,
            command: 'tally-tdl.showReferences',
            arguments: [
                lens.data.uri,
                lens.range.start,
                usages
            ]
        };
    } else if (lens.data.type === 'modifiers') {
        const modifiers = references.filter((r: any) => r.isModifier);
        count = modifiers.length;
        lens.command = {
            title: `${count} modifier${count === 1 ? '' : 's'}`,
            command: 'tally-tdl.showReferences',
            arguments: [
                lens.data.uri,
                lens.range.start,
                modifiers
            ]
        };
    } else {
        const filtered = references.filter((r: any) => !r.isDefinition);
        count = filtered.length;
        lens.command = {
            title: `${count} reference${count === 1 ? '' : 's'}`,
            command: 'tally-tdl.showReferences',
            arguments: [
                lens.data.uri,
                lens.range.start,
                filtered
            ]
        };
    }
    return lens;
}
