import * as path from 'path';
import { URI } from 'vscode-uri';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Diagnostic, DiagnosticSeverity } from 'vscode-languageserver';
import { SourceFile } from '../core/ast/ast';
import { Parser } from '../core/parser/parser';
import { parseXmlToAst } from '../core/xml/xmlAdapter';
import { normalizeUri } from '../utils/uri';
import { logger } from '../logger';
import { validateSourceFile } from '../validation';
import { DocumentStateStore } from './documentStateStore';
import { IncludeGraphManager } from './includeGraphManager';
import { WorkspaceScanner } from './workspaceScanner';
import { DiagnosticPublisher } from '../ports/diagnosticPublisher';
import { Scheduler } from '../ports/scheduler';
import { filterDiagnostics } from '../utils/settingsManager';

/**
 * Manages the lifecycle of documents (open, close, change) and triggers rebuilds.
 */
export class DocumentLifecycleService {
    private rebuildTimers = new Map<string, unknown>();
    private readonly REBUILD_DELAY = 200; // ms
    public pendingOpenDocuments = new Map<string, TextDocument>();

    constructor(
        private stateStore: DocumentStateStore,
        private graphManager: IncludeGraphManager,
        private scanner: WorkspaceScanner,
        private diagnosticPublisher: DiagnosticPublisher,
        private scheduler: Scheduler,
        private client: import('../ports/clientGateway').ClientGateway,
        private resolveIncludePath?: (currentPath: string, name: string) => string | null,
        private documentLoader?: import('./documentLoader').DocumentLoader
    ) {}

    public onDidOpen(document: TextDocument): void {
        const uriStr = document.uri;
        logger.trace(`[Trace] Server RECEIVED onDidOpen for ${path.basename(uriStr)}`);
        this.stateStore.deleteIndexed(uriStr);

        if (!this.scanner.hasInitialScanStarted || this.scanner.scanningInProgress) {
            this.pendingOpenDocuments.set(uriStr, document);
            return;
        }

        this.rebuild(document);
    }

    public onDidChangeContent(document: TextDocument): void {
        const uri = document.uri;
        if (this.pendingOpenDocuments.has(uri)) {
            this.pendingOpenDocuments.set(uri, document);
            return;
        }

        // Immediately parse and update AST/Scope so that coordinates are always in sync for other LSP requests
        this.updateAstAndScope(document);

        const existing = this.rebuildTimers.get(uri);
        if (existing) this.scheduler.clearTimeout(existing);
        
        this.rebuildTimers.set(uri, this.scheduler.setTimeout(() => {
            this.rebuildTimers.delete(uri);
            this.rebuild(document);
        }, this.REBUILD_DELAY));
    }

    public processPendingDocuments(): void {
        for (const [uri, document] of this.pendingOpenDocuments.entries()) {
            this.rebuild(document);
        }
        this.pendingOpenDocuments.clear();
    }

    public onDidClose(document: TextDocument): void {
        const uriStr = document.uri;
        this.pendingOpenDocuments.delete(uriStr);
        this.stateStore.deleteOpen(uriStr);
        
        const fsPath = URI.parse(uriStr).fsPath;
        this.stateStore.getScopeManager(uriStr, document.languageId).projectScope.referenceIndex.clearFile(uriStr);
        
        // Invalidate active cache on open/close changes
        this.graphManager.invalidateCache();
        
        const isActive = this.graphManager.isUriActive(uriStr);
        this.scanner.indexFile(fsPath, new Set(), false, false, isActive).catch(err => {
            logger.warn(`Failed to re-index closed file: ${err instanceof Error ? err.stack || err.message : String(err)}`);
        });
        
        this.stateStore.getScopeManager(uriStr, document.languageId).removeFileScope(uriStr);
        this.diagnosticPublisher.publish(uriStr, []);
    }

    public async rebuild(doc: TextDocument): Promise<void> {
        this.updateAstAndScope(doc);
        await this.validateAndPublish(doc);
    }

    public updateAstAndScope(doc: TextDocument): void {
        const t0 = Date.now();
        let sourceFile: SourceFile;
        const text = doc.getText();
        const isXml = doc.languageId === 'xml';

        const normUri = normalizeUri(doc.uri);
        const scopeMgr = this.stateStore.getScopeManager(normUri, doc.languageId);
        
        const oldDocState = this.stateStore.getOpen(normUri);
        const oldSourceFile = oldDocState?.sourceFile;

        if (isXml) {
            sourceFile = parseXmlToAst(text, scopeMgr);
        } else {
            const parser = new Parser(text, oldSourceFile, scopeMgr.getFunctionArity.bind(scopeMgr));
            sourceFile = parser.parse();
        }
        const t1 = Date.now();

        // Ensure it is in docs before we check isUriActive so it correctly identifies as an open document
        this.stateStore.setOpen(normUri, { sourceFile, diagnostics: oldDocState?.diagnostics || [], document: doc });

        const isActive = this.graphManager.isUriActive(normUri);
        scopeMgr.buildFileScope(normUri, sourceFile, !isActive);
        
        scopeMgr.projectScope.referenceIndex.clearFile(normUri);
        if (!isXml) {
            scopeMgr.projectScope.referenceIndex.indexFile(normUri, sourceFile);
        }
        const t2 = Date.now();
        logger.trace(`[Perf] updateAstAndScope ${path.basename(doc.uri)}: Total=${t2-t0}ms (Parse=${t1-t0}ms, Sym/Scope=${t2-t1}ms)`);
    }

    public async validateAndPublish(doc: TextDocument, validateDependents: boolean = true): Promise<void> {
        const t2 = Date.now();
        const normUri = normalizeUri(doc.uri);
        const docState = this.stateStore.getOpen(normUri);
        if (!docState) return;

        const sourceFile = docState.sourceFile;
        const scopeMgr = this.stateStore.getScopeManager(normUri, doc.languageId);
        const isXml = doc.languageId === 'xml';
        const isActive = this.graphManager.isUriActive(normUri);

        const oldIncludes = this.graphManager.includeGraph.get(normUri) || new Set<string>();
        const includes = this.graphManager.updateIncludeGraph(normUri, sourceFile);
        
        const visited = new Set<string>([doc.uri]);
        for (const incUri of includes) {
            if (!oldIncludes.has(incUri) && !this.stateStore.getOpen(incUri)) {
                this.scanner.indexFile(URI.parse(incUri).fsPath, visited, false, false, isActive).catch(err => {
                    logger.warn(`Failed to index new include ${incUri}: ${err instanceof Error ? err.stack || err.message : String(err)}`);
                });
            }
        }

        const t3 = Date.now();
        
        const diagnostics: Diagnostic[] = sourceFile.errors.map(error => {
            const startPos = doc.positionAt(error.start);
            const endPos = doc.positionAt(error.end);
            return {
                severity: DiagnosticSeverity.Error,
                range: { start: startPos, end: endPos },
                message: error.message,
                code: error.code,
                source: 'tdl'
            };
        });

        if (!this.scanner.scanningInProgress && this.stateStore.isMetadataLoaded && this.scanner.hasInitialScanStarted) {
            diagnostics.push(...(await validateSourceFile(sourceFile, doc, diagnostics, scopeMgr, this.resolveIncludePath, this.graphManager)));
        }
        const t4 = Date.now();

        this.stateStore.setOpen(normUri, { sourceFile, diagnostics, document: doc });
        
        // Ensure parent scope pointers are up-to-date across all files if the include graph changed
        this.graphManager.notifyActiveUrisChanged();

        const finalDiagnostics = filterDiagnostics(diagnostics);

        this.diagnosticPublisher.publish(doc.uri, finalDiagnostics);
        
        // Refresh semantic tokens and code lens now that the rebuilt AST is fully resolved and stored
        this.client.refreshSemanticTokens();
        this.client.refreshCodeLens();
        
        logger.trace(`[Perf] validateAndPublish ${path.basename(doc.uri)}: Total=${t4-t2}ms (Includes=${t3-t2}ms, Validate=${t4-t3}ms)`);

        if (validateDependents) {
            const projectNodes = this.graphManager.getProjectNodes(normUri);
            for (const [openUri, openState] of this.stateStore.getAllDocs()) {
                const normOpenUri = normalizeUri(openUri);
                if (normOpenUri !== normUri && openState.document && projectNodes.has(normOpenUri)) {
                    this.validateAndPublish(openState.document, false).catch(err => {
                        logger.error(`Failed to validate dependent doc ${normOpenUri}: ${err}`);
                    });
                }
            }
        }
    }

    public dispose(): void {
        for (const timer of this.rebuildTimers.values()) {
            this.scheduler.clearTimeout(timer);
        }
        this.rebuildTimers.clear();
    }
}
