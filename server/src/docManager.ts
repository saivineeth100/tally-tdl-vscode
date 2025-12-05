import { Connection, Diagnostic, TextDocuments } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Lexer } from "./parser/lexer";
import { Parser } from "./parser/parser";
export interface DocState { program: any; symbols: any; diagnostics: Diagnostic[]; }

export class DocManager {
    private docs = new Map<string, DocState>();
    constructor(private connection: Connection, private documents: TextDocuments<TextDocument>) {
        documents.onDidOpen(e => this.rebuild(e.document));
        documents.onDidChangeContent(e => this.rebuild(e.document));
        documents.onDidClose(e => { this.docs.delete(e.document.uri); this.connection.sendDiagnostics({ uri: e.document.uri, diagnostics: [] }); });
    }

    get(uri: string): DocState | undefined { return this.docs.get(uri); }
    async rebuild(doc: TextDocument) {
        const lexer = new Lexer(doc.getText());
        const parser = new Parser(lexer);
        const program = parser.parseSyntaxTree();
    }
}