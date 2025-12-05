import { createConnection, InitializeParams, InitializeResult, ProposedFeatures, TextDocuments, TextDocumentSyncKind } from "vscode-languageserver/node";

import { DocManager } from "./docManager";
import { TextDocument } from "vscode-languageserver-textdocument";
import * as path from 'path';
import { TdlMetadata } from "./tdlMetaData";
import { registerCompletion } from "./features/completion";

const connection = createConnection(ProposedFeatures.all);
const docs = new TextDocuments(TextDocument);

const docManager = new DocManager(connection, docs);


async function loadMetadata(version: string) {
    const dataDir = path.resolve(__dirname, '../data');
    const md = new TdlMetadata(dataDir, version);
    await md.load();
    (globalThis as any).TDL_METADATA = md;
}


connection.onInitialize(async (params: InitializeParams): Promise<InitializeResult> => {
    await loadMetadata("6.0");
    return {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            completionProvider: {resolveProvider: false, triggerCharacters: ['.', ':', '=', '"', ',', '(', '[', '$'] }
        }
    };
});


docs.listen(connection);
connection.listen();
registerCompletion(connection, docs, docManager);


