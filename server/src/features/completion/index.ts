import { Connection, TextDocuments, CompletionItem, CompletionItemKind, CompletionParams, CompletionList, MarkupKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager } from '../../docManager';
import { detectCompletionContext, detectXmlCompletionContext, findDefinitionAtCursor, CompletionContext } from './contextAnalyzer';
import { buildFunctionDocumentation, buildAttributeDocumentation } from './utils';
import { provideDefinitionTypeCompletions, getSuggestionsForDefinitionType } from './providers/definitionProvider';
import { provideFunctionCompletions, getFunctionSuggestions } from './providers/functionProvider';
import { provideVariableCompletions, provideFormulaCompletions, provideFieldReferenceCompletions } from './providers/variableProvider';
import { provideXmlSchemaAttributeCompletions, provideSchemaTypeCompletions, provideXmlAttributeValueCompletions } from './providers/xmlProvider';
import { provideAttributeCompletions, provideAttributeValueCompletions } from './providers/attributeProvider';
import { provideModifierValueCompletions } from './providers/modifierProvider';
import { provideFilePathCompletions } from './providers/pathProvider';

export * from './utils';
export * from './contextAnalyzer';

export function registerCompletion(
    connection: Connection,
    documents: TextDocuments<TextDocument>,
    manager: DocManager
) {
    connection.onCompletion(async (params: CompletionParams): Promise<CompletionList> => {
        const items: CompletionItem[] = [];
        const doc = documents.get(params.textDocument.uri);
        if (!doc) {
            return { items, isIncomplete: false };
        }

        const scopeManager = manager.getScopeManager(params.textDocument.uri);
        if (!scopeManager) {
            return { items, isIncomplete: false };
        }

        const offset = doc.offsetAt(params.position);
        const textBefore = doc.getText({ start: { line: params.position.line, character: 0 }, end: params.position });

        const docState = manager.get(params.textDocument.uri);
        const sourceFile = docState?.sourceFile;
        const currentDef = sourceFile ? findDefinitionAtCursor(sourceFile, offset) : undefined;

        const isXml = doc.languageId === 'xml';

        const projectScope = manager.getProjectNodes(params.textDocument.uri);
        let context: CompletionContext;
        
        if (isXml) {
            context = detectXmlCompletionContext(doc.getText(), offset, currentDef);
        } else {
            context = detectCompletionContext(textBefore, sourceFile, offset, currentDef);
        }

        const textAfter = doc.getText({ start: params.position, end: { line: params.position.line, character: 1000 } });
        context.hasTrailingColon = /^\s*:/.test(textAfter);

        switch (context.type) {
            case 'xml_schema_attribute':
                if (isXml && context.tagPath) {
                    items.push(...provideXmlSchemaAttributeCompletions(scopeManager, context.tagPath, context.partial));
                }
                break;

            case 'schema_type':
                items.push(...provideSchemaTypeCompletions(scopeManager, context.partial));
                break;

            case 'definition_type':
                const defTypes = scopeManager.getDefinitionTypes();
                items.push(...provideDefinitionTypeCompletions(context.partial, isXml, defTypes, scopeManager, context.directiveName, context.hasTrailingColon));
                break;

            case 'directive_file_level':
                items.push({
                    label: 'Deftype',
                    kind: CompletionItemKind.Keyword,
                    insertText: `Deftype${context.hasTrailingColon ? '' : ': '}`,
                    documentation: {
                        kind: MarkupKind.Markdown,
                        value: 'Defines the type of the following definition.'
                    },
                    command: { title: 'Suggest', command: 'editor.action.triggerSuggest' }
                });
                break;
            case 'directive_def_level':
                items.push({
                    label: 'InUse',
                    kind: CompletionItemKind.Keyword,
                    insertText: `InUse${context.hasTrailingColon ? '' : ': '}`,
                    documentation: {
                        kind: MarkupKind.Markdown,
                        value: 'Dynamically inherit definitions from another definition.'
                    },
                    command: { title: 'Suggest', command: 'editor.action.triggerSuggest' }
                });
                break;
            case 'definition_name':
                if (context.defType) {
                    const lowerType = context.defType.toLowerCase();
                    if (lowerType === 'include' || lowerType === 'import') {
                        items.push(...(await provideFilePathCompletions(params.textDocument.uri, context.partial, manager.workspaceFolders)));
                    } else if (context.hasModifier || context.isInUse) {
                        items.push(...getSuggestionsForDefinitionType(context.defType, context.partial, scopeManager, true));
                    }
                }
                break;

            case 'function':
                items.push(...provideFunctionCompletions(scopeManager, context.partial));
                break;

            case 'variable':
                items.push(...provideVariableCompletions(manager, params.textDocument.uri, offset, context.partial, true));
                break;

            case 'field_reference':
                items.push(...provideFieldReferenceCompletions(manager, params.textDocument.uri, offset, context.partial));
                break;

            case 'formula': // Legacy
            case 'local_formula':
                items.push(...provideFormulaCompletions(manager, params.textDocument.uri, offset, context.partial, true));
                break;

            case 'global_formula':
                items.push(...provideFormulaCompletions(manager, params.textDocument.uri, offset, context.partial, false));
                break;

            case 'attribute':
                if (currentDef && currentDef.type) {
                    items.push(...provideAttributeCompletions(scopeManager, currentDef.type.text, context.partial, isXml, context.hasTrailingColon));
                }
                break;

            case 'attribute_value':
                let xmlHandled = false;
                if (isXml && context.tagPath && context.tagPath.length > 0 && context.attributeName) {
                    const xmlItems = provideXmlAttributeValueCompletions(scopeManager, context.tagPath, context.attributeName, context.partial, currentDef, projectScope);
                    if (xmlItems !== null) {
                        items.push(...xmlItems);
                        xmlHandled = true;
                    }
                }
                if (!xmlHandled && currentDef) {
                    const currentScope = scopeManager.getScopeAt(params.textDocument.uri, offset);
                    items.push(...provideAttributeValueCompletions(scopeManager, currentDef.type.text, context, undefined, currentScope));
                }
                break;

            case 'function_action':
                const addedActions = new Set<string>();
                for (const [key, act] of scopeManager.globalScope.actions) {
                    if (addedActions.has(act.name)) continue;
                    addedActions.add(act.name);

                    if (context.partial === '' || act.name.toLowerCase().includes(context.partial.toLowerCase())) {
                        items.push({
                            label: act.name,
                            kind: CompletionItemKind.Keyword,
                            detail: act.description || 'Procedural Action',
                            insertText: act.name,
                            documentation: {
                                kind: MarkupKind.Markdown,
                                value: act.description || ''
                            },
                            sortText: '0_' + act.name
                        });
                    }
                }
                break;
                
            case 'function_action_parameter':
                if (currentDef && context.actionName && context.paramIndex !== undefined) {
                    const actionName = context.actionName.toLowerCase();
                    const actionDef = Array.from(scopeManager.globalScope.actions.values()).find(a => 
                        a.name.toLowerCase() === actionName || 
                        (a.aliases && a.aliases.toLowerCase().split(',').map((al: string) => al.trim()).includes(actionName))
                    );

                    if (actionDef && actionDef.parameters && actionDef.parameters.length > context.paramIndex) {
                        const param = actionDef.parameters[context.paramIndex];
                        if (param.Keywords) {
                            const keywords = param.Keywords.map((k: string) => k.trim());
                            for (const keyword of keywords) {
                                if (context.partial === '' || keyword.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: keyword,
                                        kind: CompletionItemKind.EnumMember,
                                        detail: `Keyword: ${param.KeywordSet || 'Value'}`,
                                        insertText: keyword,
                                        sortText: '0_' + keyword.toLowerCase()});
                                }
                            }
                        } else if (param.KeywordSet) {
                            const keywords = scopeManager.keywordSets.get(param.KeywordSet);
                            if (keywords) {
                                for (const keyword of keywords) {
                                    if (context.partial === '' || keyword.toLowerCase().includes(context.partial.toLowerCase())) {
                                        items.push({
                                            label: keyword,
                                            kind: CompletionItemKind.EnumMember,
                                            detail: `Keyword: ${param.KeywordSet}`,
                                            insertText: keyword,
                                            sortText: '0_' + keyword.toLowerCase()});
                                    }
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
                                        sortText: '0_' + val.toLowerCase()});
                                }
                            }
                        }
                          if (param.RefersTo && context.defType !== 'Function') {
                            items.push(...getSuggestionsForDefinitionType(param.RefersTo.trim(), context.partial, scopeManager, true, projectScope));
                        } else if (param.DataType?.toLowerCase() === 'string') {
                            items.push({
                                label: '"..."',
                                kind: CompletionItemKind.Snippet,
                                insertText: '"$0"',
                                insertTextFormat: 2,
                                sortText: '0_string'});
                        }

                        if (context.partial.startsWith('$$') || context.partial === '$') {
                            const funcPartial = context.partial.startsWith('$$') ? context.partial.substring(2) : '';
                            items.push(...getFunctionSuggestions(scopeManager, funcPartial, param.DataType));
                        }
                    }
                }
                break;
                
            case 'modifier_value':
                if (currentDef) {
                    items.push(...provideModifierValueCompletions(manager, params.textDocument.uri, offset, currentDef, context, isXml, true));
                }
                break;
        }

        return { items, isIncomplete: false };
    });

    if (typeof connection.onCompletionResolve === 'function') {
        connection.onCompletionResolve((item: CompletionItem): CompletionItem => {
            if (!item.data) return item;
            const scopeMgr = manager.tdlScopeManager;

            if (item.data.type === 'function') {
                const func = scopeMgr.globalScope.functions.get(item.data.name.toLowerCase());
                if (func) {
                    item.documentation = {
                        kind: MarkupKind.Markdown,
                        value: buildFunctionDocumentation(func as any)
                    };
                }
            } else if (item.data.type === 'attribute') {
                const targetDef = item.data.defType;
                const attrMap = scopeMgr.globalScope.attributes.get(targetDef.toLowerCase());
                if (attrMap) {
                    const attr = attrMap.get(item.data.name.toLowerCase());
                    if (attr) {
                        item.documentation = {
                            kind: MarkupKind.Markdown,
                            value: buildAttributeDocumentation(attr as any)
                        };
                    }
                }
            }
            return item;
        });
    }
}
