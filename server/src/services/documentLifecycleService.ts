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
import { getDiagnosticSeverity, isDiagnosticsEnabled, shouldTreatWarningsAsErrors, shouldHideWarnings } from '../utils/settingsManager';

/**
 * Manages the lifecycle of documents (open, close, change) and triggers rebuilds.
 */
export class DocumentLifecycleService {
    private rebuildTimers = new Map<string, unknown>();
    private readonly REBUILD_DELAY = 200; // ms

    constructor(
        private stateStore: DocumentStateStore,
        private graphManager: IncludeGraphManager,
        private scanner: WorkspaceScanner,
        private diagnosticPublisher: DiagnosticPublisher,
        private scheduler: Scheduler,
        private resolveIncludePath?: (currentPath: string, name: string) => string | null,
        private documentLoader?: import('./documentLoader').DocumentLoader
    ) {}

    public onDidOpen(document: TextDocument): void {
        const uriStr = document.uri;
        logger.trace(`[Trace] Server RECEIVED onDidOpen for ${path.basename(uriStr)}`);
        this.stateStore.deleteIndexed(uriStr);
        this.rebuild(document);
    }

    public onDidChangeContent(document: TextDocument): void {
        const uri = document.uri;
        const existing = this.rebuildTimers.get(uri);
        if (existing) this.scheduler.clearTimeout(existing);
        
        this.rebuildTimers.set(uri, this.scheduler.setTimeout(() => {
            this.rebuildTimers.delete(uri);
            this.rebuild(document);
        }, this.REBUILD_DELAY));
    }

    public onDidClose(document: TextDocument): void {
        const uriStr = document.uri;
        this.stateStore.deleteOpen(uriStr);
        
        const fsPath = URI.parse(uriStr).fsPath;
        this.stateStore.getScopeManager(uriStr).projectScope.referenceIndex.clearFile(uriStr);
        
        const isActive = this.graphManager.isUriActive(uriStr);
        this.scanner.indexFile(fsPath, new Set(), false, false, isActive).catch(err => {
            logger.warn(`Failed to re-index closed file: ${err instanceof Error ? err.stack || err.message : String(err)}`);
        });
        
        this.stateStore.getScopeManager(uriStr).removeFileScope(uriStr);
        this.diagnosticPublisher.publish(uriStr, []);
    }

    public async rebuild(doc: TextDocument): Promise<void> {
        const t0 = Date.now();
        let sourceFile: SourceFile;
        const text = doc.getText();
        const isXml = doc.languageId === 'xml';

        const normUri = normalizeUri(doc.uri);
        const scopeMgr = this.stateStore.getScopeManager(normUri);
        
        const oldDocState = this.stateStore.getOpen(normUri);
        const oldSourceFile = oldDocState?.sourceFile;

        if (isXml) {
            sourceFile = parseXmlToAst(text, scopeMgr);
        } else {
            const getFunctionArity = (name: string): number | null => {
                const func = scopeMgr.globalScope.functions.get(name.toLowerCase());
                if (!func || !func.parameters) return null;
                let hasVarArgs = false;
                for (const p of func.parameters) {
                    if (p.IsList || p.IsVariableArgument) hasVarArgs = true;
                }
                return hasVarArgs ? null : func.parameters.length;
            };
            const parser = new Parser(text, oldSourceFile, getFunctionArity);
            sourceFile = parser.parse();
        }
        const t1 = Date.now();

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

        // Ensure it is in docs before we check isUriActive so it correctly identifies as an open document
        this.stateStore.setOpen(normUri, { sourceFile, diagnostics: [], document: doc });

        const isActive = this.graphManager.isUriActive(normUri);
        scopeMgr.buildFileScope(normUri, sourceFile, !isActive);
        
        scopeMgr.projectScope.referenceIndex.clearFile(normUri);
        if (!isXml) {
            scopeMgr.projectScope.referenceIndex.indexFile(normUri, sourceFile);
        }
        const t2 = Date.now();

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
        if (!this.scanner.scanningInProgress && this.stateStore.isMetadataLoaded) {
            diagnostics.push(...(await validateSourceFile(sourceFile, doc, diagnostics, scopeMgr, this.resolveIncludePath, this.graphManager)));
        }
        const t4 = Date.now();

        if (!this.graphManager.isUriActive(normUri)) {
            diagnostics.length = 0;
        }
        this.stateStore.setOpen(normUri, { sourceFile, diagnostics, document: doc });

        const finalDiagnostics = this.filterDiagnostics(diagnostics);

        this.diagnosticPublisher.publish(doc.uri, finalDiagnostics);
        
        logger.trace(`[Perf] rebuild ${path.basename(doc.uri)}: Total=${t4-t0}ms (Parse=${t1-t0}ms, Sym/Scope=${t2-t1}ms, Includes=${t3-t2}ms, Validate=${t4-t3}ms)`);
    }

    private filterDiagnostics(diagnostics: Diagnostic[]): Diagnostic[] {
        const treatAsError = shouldTreatWarningsAsErrors();
        const hideWarnings = shouldHideWarnings();

        return isDiagnosticsEnabled() ? diagnostics.filter(d => {
            if (d.code && typeof d.code === 'string') {
                const setting = getDiagnosticSeverity(d.code);
                if (setting === 'none') return false;
                if (setting === 'error') d.severity = DiagnosticSeverity.Error;
                if (setting === 'warning') d.severity = DiagnosticSeverity.Warning;
                if (setting === 'information') d.severity = DiagnosticSeverity.Information;
                if (setting === 'hint') d.severity = DiagnosticSeverity.Hint;
            }

            if (d.severity === DiagnosticSeverity.Warning) {
                if (treatAsError) {
                    d.severity = DiagnosticSeverity.Error;
                } else if (hideWarnings) {
                    return false;
                }
            }
            return true;
        }) : [];
    }

    public dispose(): void {
        for (const timer of this.rebuildTimers.values()) {
            this.scheduler.clearTimeout(timer);
        }
        this.rebuildTimers.clear();
    }
}
