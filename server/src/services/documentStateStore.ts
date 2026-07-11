import { ScopeManager } from '../semantics/scopeManager';
import { normalizeUri } from '../utils/uri';
import { Diagnostic } from 'vscode-languageserver/node';
import { SourceFile } from '../core/ast/ast';

import { TextDocument } from 'vscode-languageserver-textdocument';

export interface DocState {
    sourceFile: SourceFile;
    diagnostics: Diagnostic[];
    document?: TextDocument;
}

/**
 * Stores the parsed AST, diagnostics, and semantic scope of all documents.
 */
export class DocumentStateStore {
    /** 
     * Stores the parsed state (AST, diagnostics) for documents that are currently OPEN in the editor.
     * These documents are kept up-to-date with every keystroke.
     */
    private docs = new Map<string, DocState>();

    /** 
     * Stores the parsed state for documents that are CLOSED in the editor but still exist on disk.
     * These are loaded during workspace scanning so their symbols are available for features like 
     * "Go to Definition" and "Find All References" across the whole project.
     */
    private indexedDocs = new Map<string, DocState>();

    public readonly tdlScopeManager = new ScopeManager();
    public readonly xmlScopeManager = new ScopeManager();

    public isMetadataLoaded = false;

    /**
     * Helper to get the correct ScopeManager based on language ID or file extension.
     */
    public getScopeManager(uri: string, languageId?: string): ScopeManager {
        if (languageId === 'xml') {
            return this.xmlScopeManager;
        }
        if (languageId === 'tdl') {
            return this.tdlScopeManager;
        }
        const openState = this.getOpen(uri);
        if (openState && openState.document) {
            const docLang = openState.document.languageId;
            if (docLang === 'xml') {
                return this.xmlScopeManager;
            }
            if (docLang === 'tdl') {
                return this.tdlScopeManager;
            }
        }
        const lowerUri = uri.toLowerCase();
        return lowerUri.endsWith('.xml') || lowerUri.endsWith('.tdlxml') ? this.xmlScopeManager : this.tdlScopeManager;
    }

    /**
     * Gets the document state from either open or indexed docs.
     */
    public get(uri: string): DocState | undefined {
        const norm = normalizeUri(uri);
        return this.docs.get(norm) || this.indexedDocs.get(norm);
    }

    public getOpen(uri: string): DocState | undefined {
        return this.docs.get(normalizeUri(uri));
    }

    public getIndexed(uri: string): DocState | undefined {
        return this.indexedDocs.get(normalizeUri(uri));
    }

    public setOpen(uri: string, state: DocState): void {
        this.docs.set(normalizeUri(uri), state);
        this.indexedDocs.delete(normalizeUri(uri));
    }

    public setIndexed(uri: string, state: DocState): void {
        this.indexedDocs.set(normalizeUri(uri), state);
    }

    public deleteOpen(uri: string): void {
        this.docs.delete(normalizeUri(uri));
    }

    public deleteIndexed(uri: string): void {
        this.indexedDocs.delete(normalizeUri(uri));
    }

    public getAllDocs(): IterableIterator<[string, DocState]> {
        return this.docs.entries();
    }

    public getAllIndexedUris(): IterableIterator<string> {
        return this.indexedDocs.keys();
    }
}
