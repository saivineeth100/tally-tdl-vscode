import { URI } from 'vscode-uri';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Connection } from 'vscode-languageserver/node';
import { DocumentStateStore } from './documentStateStore';
import { IncludeGraphManager } from './includeGraphManager';
import { DocumentRepository } from '../ports/documentRepository';
import { generateXml } from '../features/xmlGenerator';
import { buildCustomLibraryCache } from '../semantics/cacheBuilder';
import { provideDefinitionTypeCompletions, getSuggestionsForDefinitionType } from '../features/completion/providers/definitionProvider';
import { provideSchemaTypeCompletions } from '../features/completion/providers/xmlProvider';
import { provideAttributeCompletions, provideAttributeValueCompletions } from '../features/completion/providers/attributeProvider';
import { CompletionContext } from '../features/completion/contextAnalyzer';
import { parseXmlEnvelopeToPlaygroundState } from '../core/xml/xmlAdapter';
import { normalizeTypeName } from '../utils/normalizeUtils';

export class CustomRequestsService {
    constructor(
        private stateStore: DocumentStateStore,
        private graphManager: IncludeGraphManager,
        private docs: DocumentRepository,
        private client: import('../ports/clientGateway').ClientGateway,
        private resolveIncludePath: (currentPath: string, includeName: string) => string | null
    ) {}

    public async getScopeTreeDebug(params: { uri: string }) {
        const doc = this.docs.get(params.uri);
        const scopeMgr = this.stateStore.getScopeManager(params.uri, doc?.languageId);
        return scopeMgr.viewer.serializeScopeTree(params.uri);
    }

    public async getScopeChildren(params: { uri: string, scopeId: string }) {
        const doc = this.docs.get(params.uri);
        const scopeMgr = this.stateStore.getScopeManager(params.uri, doc?.languageId);
        return scopeMgr.viewer.getScopeChildren(params.scopeId);
    }

    public async getScopeNode(params: { uri: string, scopeId: string }) {
        const doc = this.docs.get(params.uri);
        const scopeMgr = this.stateStore.getScopeManager(params.uri, doc?.languageId);
        return scopeMgr.viewer.getScopeNode(params.scopeId);
    }

    public async getScopeSymbols(params: { uri: string, scopeId: string, kind: string, page: number, limit: number, query?: string }) {
        const doc = this.docs.get(params.uri);
        const scopeMgr = this.stateStore.getScopeManager(params.uri, doc?.languageId);
        return scopeMgr.viewer.getSymbolsPaginated(params.scopeId, params.kind, params.page, params.limit, params.query);
    }

    public async getScopeDetails(params: { uri: string, scopeId: string }) {
        const doc = this.docs.get(params.uri);
        const scopeMgr = this.stateStore.getScopeManager(params.uri, doc?.languageId);
        return scopeMgr.viewer.getScopeDetails(params.scopeId);
    }

    public async resolveGlobalSymbol(params: { uri: string, name: string, expectedType: string }) {
        const doc = this.docs.get(params.uri);
        const scopeMgr = this.stateStore.getScopeManager(params.uri, doc?.languageId);
        const projectScope = this.graphManager.getProjectNodes(params.uri);
        return scopeMgr.resolveDefinition(params.name, params.expectedType, scopeMgr.globalScope, projectScope);
    }

    public async convertToXml(params: { uri: string }) {
        const doc = this.docs.get(params.uri);
        const docState = this.stateStore.get(params.uri);
        if (!doc || !docState || !docState.sourceFile) return null;
        return await generateXml(docState.sourceFile, doc.getText(), URI.parse(params.uri).fsPath, this.resolveIncludePath);
    }

    public async buildCustomLibraryCache(params: { folderPath: string }) {
        try {
            const cacheFile = await buildCustomLibraryCache(params.folderPath);
            this.client.showInformationMessage(`Successfully generated custom library cache at: ${cacheFile}. You can add this path to 'tallyTDL.externalLibraries' in your settings.`);
        } catch (err) {
            this.client.showErrorMessage(`Failed to build custom library cache: ${err}`);
        }
    }

    public async getPlaygroundSuggestions(params: import('tally-tdl-shared').PlaygroundSuggestionQueryDTO): Promise<import('tally-tdl-shared').PlaygroundSuggestionsDTO> {
        const scopeMgr = this.stateStore.tdlScopeManager;
        const category = params.category || 'definitionType';
        const query = params.query || '';
        const limit = params.limit || 500;

        const itemsMap = new Map<string, string>();

        const getLabel = (item: import('vscode-languageserver/node').CompletionItem): string => {
            return typeof item.label === 'string' ? item.label : (item.label as any)?.label || '';
        };

        const addItem = (label: string, forceLabel?: string): boolean => {
            if (!label) return false;
            const key = label.toLowerCase().trim();
            if (!key) return false;
            if (!itemsMap.has(key)) {
                itemsMap.set(key, forceLabel || label);
                return true;
            }
            return false;
        };

        if (category === 'definitionType') {
            const defTypes = scopeMgr.getDefinitionTypes();
            const completions = provideDefinitionTypeCompletions(query, false, defTypes, scopeMgr);
            for (const item of completions) {
                const label = getLabel(item);
                if (label && !['#', '!', '*', 'System : Formula', 'System : Variable'].includes(label) && !label.startsWith('System :')) {
                    addItem(label);
                    if (itemsMap.size >= limit) break;
                }
            }
            for (const dt of defTypes) {
                const formatted = scopeMgr.definitionTypeLabels?.get(dt) || (dt.charAt(0).toUpperCase() + dt.slice(1).toLowerCase());
                if (!query || formatted.toLowerCase().includes(query.toLowerCase())) {
                    addItem(formatted);
                    if (itemsMap.size >= limit) break;
                }
            }
        } else if (category === 'schemaType') {
            const primaryList = scopeMgr.primarySchemaNames && scopeMgr.primarySchemaNames.length > 0
                ? scopeMgr.primarySchemaNames
                : Array.from(scopeMgr.globalScope.schemas.keys());

            for (const sName of primaryList) {
                const schemaSym = scopeMgr.globalScope.schemas.get(normalizeTypeName(sName));
                const originalName = schemaSym?.name || sName;
                if (!query || originalName.toLowerCase().includes(query.toLowerCase())) {
                    addItem(originalName);
                    if (itemsMap.size >= limit) break;
                }
            }
        } else if (category === 'definitionName' || category === 'collection' || category === 'report') {
            const targetDefType = category === 'definitionName' ? (params.defType || 'Collection') : category;
            if (targetDefType.toLowerCase().trim() === 'system') {
                const canonicalSubtypes = ['Formulae', 'Variables', 'Events', 'UDF', 'Notification', 'Numbering', 'Form Keys', 'Menu Keys'];
                for (const st of canonicalSubtypes) {
                    if (!query || st.toLowerCase().includes(query.toLowerCase())) {
                        addItem(st);
                        if (itemsMap.size >= limit) break;
                    }
                }
            } else {
                const completions = getSuggestionsForDefinitionType(targetDefType, query, scopeMgr, true);
                completions.sort((a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label, undefined, { sensitivity: 'base' }));
                for (const item of completions) {
                    const label = getLabel(item);
                    if (label) {
                        addItem(label);
                        if (itemsMap.size >= limit) break;
                    }
                }
            }
        } else if (category === 'staticVariable') {
            const standardStaticVars = [
                'SVCURRENTCOMPANY', 'SVEXPORTFORMAT', 'SVFROMDATE', 'SVTODATE', 
                'SVMSTIMPORTFORMAT', 'EXPLODEFLAG', 'SVINVENTORY', 'SVACCOUNTS', 
                'SVCOMPANY', 'SVVOUCHERTYPE', 'SVCOSTCENTRE', 'SVGODOWN',
                'SVVIEWNAME', 'SVPRINTING', 'SVEXPORT'
            ];
            for (const sv of standardStaticVars) {
                if (!query || sv.toLowerCase().includes(query.toLowerCase())) {
                    addItem(sv, sv);
                    if (itemsMap.size >= limit) break;
                }
            }
            const vars = getSuggestionsForDefinitionType('variable', query, scopeMgr, true);
            for (const item of vars) {
                const label = getLabel(item);
                if (label) {
                    const formatted = label.toUpperCase().startsWith('SV') ? label.toUpperCase() : label;
                    addItem(label, formatted);
                    if (itemsMap.size >= limit) break;
                }
            }
        } else if (category === 'attributeValue') {
            const defType = params.defType || 'Collection';
            const attrName = params.attributeName || '';

            if (defType.toLowerCase().trim() === 'system') {
                const sysSubtype = (params.currentDefinition?.name || 'Formulae').toLowerCase().trim();
                if (sysSubtype.startsWith('var')) {
                    const varTypes = ['String', 'Logical', 'Number', 'Date', 'Amount', 'Quantity', 'Logical : Yes', 'Logical : No', 'String : ""', 'Number : 0'];
                    for (const vt of varTypes) {
                        if (!query || vt.toLowerCase().includes(query.toLowerCase())) {
                            addItem(vt);
                        }
                    }
                } else if (sysSubtype.startsWith('udf')) {
                    const udfTypes = ['String : 1001', 'Amount : 1002', 'Number : 1003', 'Date : 1004', 'Logical : 1005', 'Quantity : 1006'];
                    for (const ut of udfTypes) {
                        if (!query || ut.toLowerCase().includes(query.toLowerCase())) {
                            addItem(ut);
                        }
                    }
                } else if (sysSubtype.startsWith('event')) {
                    const eventHooks = ['Form Accept : Yes : Form Accept', 'Line Focus : Yes : Line Focus', 'Button Action : Yes : Call'];
                    for (const eh of eventHooks) {
                        if (!query || eh.toLowerCase().includes(query.toLowerCase())) {
                            addItem(eh);
                        }
                    }
                } else {
                    // Formulae: provide functions & formulas
                    const formulaExamples = [
                        '$$SysInfo:SystemDate', '$$SysInfo:SystemTimeHMS', '$$String:...', 
                        '$$InWords:$Amount + " Only"', '$$IsEmpty:...', '$$LocaleString:...',
                        '$$CollAmtTotal:...', 'NOT $$IsEmpty:...', 'if $$IsEmpty:... then "" else ...'
                    ];
                    for (const fe of formulaExamples) {
                        if (!query || fe.toLowerCase().includes(query.toLowerCase())) {
                            addItem(fe);
                        }
                    }
                    if (scopeMgr.globalScope.functions) {
                        for (const fn of scopeMgr.globalScope.functions.values()) {
                            if (!query || fn.name.toLowerCase().includes(query.toLowerCase())) {
                                addItem(`$$${fn.name}`);
                                if (itemsMap.size >= limit) break;
                            }
                        }
                    }
                }
            } else {
                // 1. Resolve objectScope from currentDefinition if available
                let objectScopeName: string | undefined;
                if (params.currentDefinition && params.currentDefinition.attributes) {
                    const typeAttr = params.currentDefinition.attributes.find(a => 
                        a.name.toLowerCase().trim() === 'type' || a.name.toLowerCase().trim() === 'object'
                    );
                    if (typeAttr && typeAttr.values && typeAttr.values.length > 0) {
                        objectScopeName = typeAttr.values[0].trim();
                    }
                }

                const currentScope: any = objectScopeName ? { objectScope: objectScopeName } : undefined;

                let valueParts: string[] = [];
                if (params.currentDefinition && params.currentDefinition.attributes) {
                    const currentAttr = params.currentDefinition.attributes.find(a => 
                        a.name.toLowerCase().trim() === attrName.toLowerCase().trim()
                    );
                    if (currentAttr && currentAttr.values) {
                        valueParts = currentAttr.values;
                    }
                }

                const mockDefNode: any = params.currentDefinition ? {
                    kind: 0,
                    type: { text: defType },
                    name: { text: params.currentDefinition.name || '' },
                    attributes: (params.currentDefinition.attributes || []).map(a => ({
                        name: { text: a.name },
                        value: (a.values || []).map(v => ({ text: v, value: v }))
                    }))
                } : undefined;

                const completionCtx: CompletionContext = {
                    type: 'attribute_value',
                    hasModifier: false,
                    defType,
                    attributeName: attrName,
                    paramIndex: params.paramIndex ?? 0,
                    partial: query,
                    valueParts
                };

                const completions = provideAttributeValueCompletions(
                    scopeMgr,
                    defType,
                    completionCtx,
                    undefined,
                    currentScope,
                    mockDefNode
                );

                completions.sort((a, b) => (a.sortText || a.label).localeCompare(b.sortText || b.label, undefined, { sensitivity: 'base' }));

                for (const item of completions) {
                    const label = getLabel(item);
                    if (label) {
                        addItem(label);
                        if (itemsMap.size >= limit) break;
                    }
                }

                // Fallback for common XML/TDL patterns if metadata wasn't exhaustive
                const normAttr = attrName.toLowerCase().trim();
                if (itemsMap.size === 0) {
                    if (normAttr === 'form') {
                        for (const item of getSuggestionsForDefinitionType('form', query, scopeMgr, true)) {
                            addItem(getLabel(item));
                        }
                    } else if (normAttr === 'part' || normAttr === 'parts') {
                        for (const item of getSuggestionsForDefinitionType('part', query, scopeMgr, true)) {
                            addItem(getLabel(item));
                        }
                    } else if (normAttr === 'line' || normAttr === 'lines') {
                        for (const item of getSuggestionsForDefinitionType('line', query, scopeMgr, true)) {
                            addItem(getLabel(item));
                        }
                    } else if (normAttr === 'field' || normAttr === 'fields' || normAttr === 'rightfield' || normAttr === 'leftfield') {
                        for (const item of getSuggestionsForDefinitionType('field', query, scopeMgr, true)) {
                            addItem(getLabel(item));
                        }
                    } else if (normAttr === 'collection' || normAttr === 'sourcecollection' || normAttr === 'childof') {
                        for (const item of getSuggestionsForDefinitionType('collection', query, scopeMgr, true)) {
                            addItem(getLabel(item));
                        }
                    } else if (normAttr === 'type' && defType.toLowerCase() === 'collection') {
                        for (const item of provideSchemaTypeCompletions(scopeMgr, query)) {
                            addItem(getLabel(item));
                        }
                    }
                }
            }
        }

        const items = Array.from(itemsMap.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

        return {
            category,
            items,
            defType: params.defType || (category === 'definitionName' ? 'Collection' : undefined),
            attributeName: params.attributeName,
            paramIndex: params.paramIndex
        };
    }

    public async parseEnvelopeXml(params: { xml: string }): Promise<import('tally-tdl-shared').PlaygroundStateDTO> {
        const scopeMgr = this.stateStore.tdlScopeManager;
        return parseXmlEnvelopeToPlaygroundState(params.xml, scopeMgr);
    }



    public async getAttributesForDefType(params: { defType: string }): Promise<import('tally-tdl-shared').DefTypeAttributeDTO[]> {
        if (!params || !params.defType) return [];
        const scopeMgr = this.stateStore.tdlScopeManager;
        const norm = params.defType.replace(/\s+/g, '').toLowerCase();

        if (norm === 'system') {
            return [];
        }

        const canonical = scopeMgr.getCanonicalTypeName ? scopeMgr.getCanonicalTypeName(norm) : norm;

        const attrMap = scopeMgr.globalScope.attributes.get(canonical) || scopeMgr.globalScope.attributes.get(norm);
        if (!attrMap) return [];

        const results: import('tally-tdl-shared').DefTypeAttributeDTO[] = [];
        const seen = new Set<string>();

        for (const attr of attrMap.values()) {
            const key = attr.name.toLowerCase();
            if (!seen.has(key)) {
                seen.add(key);
                results.push({
                    name: attr.name,
                    description: attr.description,
                    type: attr.type,
                    isDiscrete: attr.isDiscrete,
                    parameters: attr.parameters
                });
            }
        }

        return results.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }

    public async getSchemaProperties(params: { schemaType: string }): Promise<import('tally-tdl-shared').SchemaPropertyDTO[]> {
        if (!params || !params.schemaType) return [];
        const scopeMgr = this.stateStore.tdlScopeManager;
        const norm = params.schemaType.replace(/\s+/g, '').toLowerCase();

        let schema = scopeMgr.globalScope.schemas.get(norm);
        if (!schema) {
            for (const [k, v] of scopeMgr.globalScope.schemas.entries()) {
                if (k.replace(/\s+/g, '').toLowerCase() === norm) {
                    schema = v;
                    break;
                }
            }
        }

        if (!schema || !schema.properties) return [];

        const results: import('tally-tdl-shared').SchemaPropertyDTO[] = [];
        for (const prop of schema.properties.values()) {
            results.push({
                name: prop.Name,
                isComplex: prop.IsComplex,
                isRepeated: prop.IsRepeated,
                dataType: prop.DataType,
                objectName: prop.ObjectName
            });
        }

        return results.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }
}

