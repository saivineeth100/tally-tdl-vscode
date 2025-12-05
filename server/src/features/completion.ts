import { Connection, TextDocuments, CompletionItem, CompletionItemKind, TextDocumentPositionParams, CompletionParams, CompletionList } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager } from '../docManager';
import { TdlMetadata } from '../tdlMetaData';
import { InsertTextMode } from 'vscode-languageclient';



export function registerCompletion(connection: Connection, documents: TextDocuments<TextDocument>, manager: DocManager) {
    connection.onCompletion((params: CompletionParams): CompletionList => {
        const items: CompletionItem[] = [];
        const md = (globalThis as any).TDL_METADATA as TdlMetadata;
        const doc = documents.get(params.textDocument.uri);
        if (!doc || !md) {
            return {
                items,
                isIncomplete: true,
            };
        }

        // Grab the text before the cursor to see if it already has $$
        const textBefore = doc.getText({ start: { line: params.position.line, character: 0 }, end: params.position });
        const lastDouble = textBefore.lastIndexOf('$$');
        if (lastDouble !== -1) {
            const partial = textBefore.slice(lastDouble + 2).trim();
            for (const func of md.functions) {
                if (func.Name.toLowerCase().includes(partial.toLowerCase())) {
                    items.push({
                        label: `${func.Name}`,
                        kind: CompletionItemKind.Function,
                        insertText: `${func.Name}`,
                        documentation: func.Description,
                    });
                }
            }

        }

        return {
            items,
            isIncomplete: true,
        };;
    });
}