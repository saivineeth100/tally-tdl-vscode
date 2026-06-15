import { Connection, TextDocuments, CompletionItem, CompletionItemKind, CompletionParams, CompletionList, MarkupKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager } from '../../docManager';
import { TdlMetadata } from '../../tdlMetaData';
import { getMetadata } from '../../services/metadataService';
import { detectCompletionContext, detectXmlCompletionContext, findDefinitionAtCursor, CompletionContext } from './contextAnalyzer';
import { provideDefinitionTypeCompletions, getSuggestionsForDefinitionType } from './providers/definitionProvider';
import { provideFunctionCompletions, getFunctionSuggestions } from './providers/functionProvider';
import { provideVariableCompletions, provideFormulaCompletions } from './providers/variableProvider';
import { provideXmlSchemaAttributeCompletions, provideSchemaTypeCompletions, provideXmlAttributeValueCompletions } from './providers/xmlProvider';
import { provideAttributeCompletions, provideAttributeValueCompletions } from './providers/attributeProvider';
import { provideModifierValueCompletions } from './providers/modifierProvider';
import { getDefinitionTypes } from './utils';

export * from './utils';
export * from './contextAnalyzer';

export function registerCompletion(
    connection: Connection,
    documents: TextDocuments<TextDocument>,
    manager: DocManager
) {
    connection.onCompletion((params: CompletionParams): CompletionList => {
        const items: CompletionItem[] = [];
        const md = getMetadata() as TdlMetadata;
        const doc = documents.get(params.textDocument.uri);
        if (!doc || !md) {
            return { items, isIncomplete: false };
        }

        const offset = doc.offsetAt(params.position);
        const textBefore = doc.getText({ start: { line: params.position.line, character: 0 }, end: params.position });

        const docState = manager.get(params.textDocument.uri);
        const sourceFile = docState?.sourceFile;
        const currentDef = sourceFile ? findDefinitionAtCursor(sourceFile, offset) : undefined;

        const isXml = doc.languageId === 'xml';
        const symbolTable = manager.getSymbolTable(params.textDocument.uri);
        let context: CompletionContext;
        
        if (isXml) {
            context = detectXmlCompletionContext(doc.getText(), offset, currentDef);
        } else {
            context = detectCompletionContext(textBefore, sourceFile, offset, currentDef);
        }

        switch (context.type) {
            case 'xml_schema_attribute':
                if (isXml && context.tagPath) {
                    items.push(...provideXmlSchemaAttributeCompletions(md, context.tagPath, context.partial));
                }
                break;

            case 'schema_type':
                items.push(...provideSchemaTypeCompletions(md, context.partial));
                break;

            case 'definition_type':
                items.push(...provideDefinitionTypeCompletions(md, context.partial, isXml, getDefinitionTypes(md)));
                break;

            case 'definition_name':
                if (context.hasModifier && context.defType) {
                    items.push(...getSuggestionsForDefinitionType(context.defType, context.partial, md, symbolTable));
                }
                break;

            case 'function':
                items.push(...provideFunctionCompletions(md, context.partial));
                break;

            case 'variable':
                items.push(...provideVariableCompletions(manager, params.textDocument.uri, offset, context.partial, md, symbolTable));
                break;

            case 'formula':
                items.push(...provideFormulaCompletions(manager, params.textDocument.uri, offset, context.partial, md, symbolTable));
                break;

            case 'attribute':
                if (currentDef) {
                    items.push(...provideAttributeCompletions(md, currentDef.type.text, context.partial, isXml));
                }
                break;

            case 'attribute_value':
                let xmlHandled = false;
                if (isXml && context.tagPath && context.tagPath.length > 0 && context.attributeName) {
                    const xmlItems = provideXmlAttributeValueCompletions(md, context.tagPath, context.attributeName, context.partial, currentDef, symbolTable);
                    if (xmlItems !== null) {
                        items.push(...xmlItems);
                        xmlHandled = true;
                    }
                }
                if (!xmlHandled && currentDef) {
                    items.push(...provideAttributeValueCompletions(md, currentDef.type.text, context, symbolTable));
                }
                break;

            case 'function_action':
                for (const act of md.actions) {
                    if (context.partial === '' || act.Name.toLowerCase().includes(context.partial.toLowerCase())) {
                        items.push({
                            label: act.Name,
                            kind: CompletionItemKind.Keyword,
                            detail: act.Description || 'Procedural Action',
                            insertText: act.Name,
                            documentation: {
                                kind: MarkupKind.Markdown,
                                value: act.Description || ''
                            },
                            sortText: '0_' + act.Name
                        });
                    }
                }
                break;
                
            case 'function_action_parameter':
                if (currentDef && context.actionName && context.paramIndex !== undefined) {
                    const actionName = context.actionName.toLowerCase();
                    const actionDef = md.actions.find(a => 
                        a.Name.toLowerCase() === actionName || 
                        (a.Aliases && a.Aliases.toLowerCase().split(',').map(al => al.trim()).includes(actionName))
                    );

                    if (actionDef && actionDef.Parameters && actionDef.Parameters.length > context.paramIndex) {
                        const param = actionDef.Parameters[context.paramIndex];
                        if (param.Keywords) {
                            const keywords = param.Keywords.split(',').map(k => k.trim());
                            for (const keyword of keywords) {
                                if (context.partial === '' || keyword.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: keyword,
                                        kind: CompletionItemKind.EnumMember,
                                        detail: `Keyword: ${param.KeywordSet || 'Value'}`,
                                        insertText: keyword,
                                        sortText: '0_' + keyword.toLowerCase(),
                                    });
                                }
                            }
                        } else if (param.DataType?.toLowerCase() === 'logical') {
                            const logicalValues = ['Yes', 'No'];
                            for (const val of logicalValues) {
                                if (context.partial === '' || val.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: val,
                                        kind: CompletionItemKind.Value,
                                        insertText: val,
                                        sortText: '0_' + val.toLowerCase(),
                                    });
                                }
                            }
                        } else if (param.RefersTo) {
                            items.push(...getSuggestionsForDefinitionType(param.RefersTo.trim(), context.partial, md, symbolTable));
                        } else if (param.DataType?.toLowerCase() === 'string') {
                            items.push({
                                label: '"..."',
                                kind: CompletionItemKind.Snippet,
                                insertText: '"$0"',
                                insertTextFormat: 2,
                                sortText: '0_string',
                            });
                        }

                        if (context.partial.startsWith('$$') || context.partial === '$') {
                            const funcPartial = context.partial.startsWith('$$') ? context.partial.substring(2) : '';
                            items.push(...getFunctionSuggestions(md, funcPartial, param.DataType));
                        }
                    }
                }
                break;
                
            case 'modifier_value':
                if (currentDef) {
                    items.push(...provideModifierValueCompletions(manager, params.textDocument.uri, offset, md, currentDef, context, isXml, symbolTable));
                }
                break;
        }

        return { items, isIncomplete: false };
    });
}
