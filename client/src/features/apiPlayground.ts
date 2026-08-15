import * as vscode from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import * as path from 'path';
import * as fs from 'fs';
import { sendXmlRequest, fetchActiveCompanies, checkTallyRunning, launchTallyAndWait } from '../services/tallyClient';
import { ResponsePanel } from './responsePanel';
import type { 
    PlaygroundStateDTO, 
    PlaygroundDefinitionDTO, 
    PlaygroundAttributeDTO,
    PlaygroundStaticVariableDTO,
    PlaygroundTemplateDTO,
    PlaygroundHistoryEntryDTO,
    PlaygroundTallyObjectDTO,
    PlaygroundTallyPropertyDTO
} from 'tally-tdl-shared';

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function parseTallyPropertiesFromXml(xml: string): PlaygroundTallyPropertyDTO[] {
    const props: PlaygroundTallyPropertyDTO[] = [];
    const tagRegex = /<([a-zA-Z0-9_.]+)(?:\s+[^>]*)?>(?:([\s\S]*?)<\/\1>|\/>)/gi;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(xml)) !== null) {
        const tagName = match[1];
        const inner = (match[2] || '').trim();
        const isList = tagName.toUpperCase().endsWith('.LIST') || /<[a-zA-Z0-9_.]+>/i.test(inner);

        if (isList && /<[a-zA-Z0-9_.]+>/i.test(inner)) {
            props.push({
                name: tagName,
                isList: true,
                children: parseTallyPropertiesFromXml(inner)
            });
        } else {
            props.push({
                name: tagName,
                value: inner
            });
        }
    }

    return props;
}

/**
 * Parses XML envelope into PlaygroundStateDTO for the visual builder.
 */
export function parseEnvelopeXml(xmlText: string): PlaygroundStateDTO {
    const result: PlaygroundStateDTO = {
        tallyRequest: 'Export',
        type: 'Collection',
        id: '',
        staticVariables: [],
        definitions: []
    };

    if (!xmlText || typeof xmlText !== 'string') {
        return result;
    }

    // 1. Extract Header info
    const reqMatch = xmlText.match(/<TALLYREQUEST>([\s\S]*?)<\/TALLYREQUEST>/i);
    if (reqMatch) {
        const val = reqMatch[1].trim();
        result.tallyRequest = val.toLowerCase() === 'import' ? 'Import' : 'Export';
    }

    const typeMatch = xmlText.match(/<HEADER>[\s\S]*?<TYPE>([\s\S]*?)<\/TYPE>[\s\S]*?<\/HEADER>/i);
    if (typeMatch) {
        const val = typeMatch[1].trim();
        result.type = val.toLowerCase() === 'data' ? 'Data' : 'Collection';
    }

    const idMatch = xmlText.match(/<HEADER>[\s\S]*?<ID>([\s\S]*?)<\/ID>[\s\S]*?<\/HEADER>/i);
    if (idMatch) {
        result.id = idMatch[1].trim();
    }

    // 2. Extract Static Variables
    const staticVarsMatch = xmlText.match(/<STATICVARIABLES>([\s\S]*?)<\/STATICVARIABLES>/i);
    if (staticVarsMatch) {
        const varsContent = staticVarsMatch[1];
        const tagRegex = /<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/gi;
        let match: RegExpExecArray | null;
        while ((match = tagRegex.exec(varsContent)) !== null) {
            result.staticVariables.push({
                name: match[1].trim(),
                value: match[2].trim()
            });
        }
    } else {
        result.staticVariables = [
            { name: 'SVEXPORTFORMAT', value: '$$SysName:XML' },
            { name: 'SVCURRENTCOMPANY', value: '' }
        ];
    }

    // 3. Extract TDL Definitions inside <TDLMESSAGE> or fallback anywhere
    let tdlContent = '';
    const tdlMsgMatch = xmlText.match(/<TDLMESSAGE>([\s\S]*?)<\/TDLMESSAGE>/i);
    if (tdlMsgMatch) {
        tdlContent = tdlMsgMatch[1];
    } else {
        const tdlBlockMatch = xmlText.match(/<TDL>([\s\S]*?)<\/TDL>/i);
        if (tdlBlockMatch) {
            tdlContent = tdlBlockMatch[1];
        }
    }

    if (tdlContent) {
        // Match top-level definition tags like <COLLECTION ...>...</COLLECTION> or self-closing <COLLECTION .../>
        const defTagRegex = /<([a-zA-Z0-9_]+)\s+([^>]*?)(\/>|>([\s\S]*?)<\/\1>)/gi;
        let defMatch: RegExpExecArray | null;

        while ((defMatch = defTagRegex.exec(tdlContent)) !== null) {
            const defType = defMatch[1];
            const rawAttrs = defMatch[2];
            const innerBody = defMatch[4] || '';

            // Parse XML attributes like NAME="...", ISMODIFY="Yes", etc.
            const nameMatch = rawAttrs.match(/\bNAME\s*=\s*["']([^"']*)["']/i);
            const isModify = /\bISMODIFY\s*=\s*["'](Yes|True|1)["']/i.test(rawAttrs);
            const isFixed = /\bISFIXED\s*=\s*["'](Yes|True|1)["']/i.test(rawAttrs);
            const isInitialize = /\bISINITIALIZE\s*=\s*["'](Yes|True|1)["']/i.test(rawAttrs);
            const isOption = /\bISOPTION\s*=\s*["'](Yes|True|1)["']/i.test(rawAttrs);
            const isInternal = /\bISINTERNAL\s*=\s*["'](Yes|True|1)["']/i.test(rawAttrs);

            const attributes: PlaygroundAttributeDTO[] = [];
            const attrTagRegex = /<([a-zA-Z0-9_]+)>([\s\S]*?)<\/\1>/gi;
            let attrMatch: RegExpExecArray | null;

            while ((attrMatch = attrTagRegex.exec(innerBody)) !== null) {
                const attrName = attrMatch[1].trim();
                const rawVal = attrMatch[2].trim();
                const values = rawVal.split(',').map(s => s.trim()).filter(Boolean);
                attributes.push({
                    name: attrName,
                    values: values.length > 0 ? values : [rawVal]
                });
            }

            result.definitions.push({
                defType,
                name: nameMatch ? nameMatch[1] : '',
                attributes,
                isModify,
                isFixed,
                isInitialize,
                isOption,
                isInternal
            });
        }
    }

    // 4. Extract Tally Message Objects inside <TALLYMESSAGE> (for Import requests)
    const tallyMsgMatch = xmlText.match(/<TALLYMESSAGE[^>]*>([\s\S]*?)<\/TALLYMESSAGE>/i);
    if (tallyMsgMatch || result.tallyRequest === 'Import') {
        const content = tallyMsgMatch ? tallyMsgMatch[1] : xmlText;
        const objTagRegex = /<([a-zA-Z0-9_]+)\s+([^>]*?)(\/>|>([\s\S]*?)<\/\1>)/gi;
        let objMatch: RegExpExecArray | null;
        const tallyObjects: PlaygroundTallyObjectDTO[] = [];

        while ((objMatch = objTagRegex.exec(content)) !== null) {
            const objectType = objMatch[1];
            if (['STATICVARIABLES', 'DESC', 'BODY', 'HEADER', 'ENVELOPE', 'TDL', 'TDLMESSAGE'].includes(objectType.toUpperCase())) {
                continue;
            }

            const rawAttrs = objMatch[2];
            const innerBody = objMatch[4] || '';

            const nameMatch = rawAttrs.match(/\bNAME\s*=\s*["']([^"']*)["']/i);
            const actionMatch = rawAttrs.match(/\bAction\s*=\s*["']([^"']*)["']/i);
            const vchTypeMatch = rawAttrs.match(/\bVCHTYPE\s*=\s*["']([^"']*)["']/i);
            const objViewMatch = rawAttrs.match(/\bOBJVIEW\s*=\s*["']([^"']*)["']/i);

            const actionRaw = actionMatch ? actionMatch[1] : 'Create';
            const action = (['Create', 'Alter', 'Delete'].find(
                a => a.toLowerCase() === actionRaw.toLowerCase()
            ) || 'Create') as 'Create' | 'Alter' | 'Delete';

            const properties: PlaygroundTallyPropertyDTO[] = parseTallyPropertiesFromXml(innerBody);

            tallyObjects.push({
                objectType,
                action,
                name: nameMatch ? nameMatch[1] : undefined,
                vchType: vchTypeMatch ? vchTypeMatch[1] : undefined,
                objView: objViewMatch ? objViewMatch[1] : undefined,
                properties
            });
        }

        if (tallyObjects.length > 0) {
            result.tallyObjects = tallyObjects;
        }
    }

    return result;
}

export class ApiPlaygroundPanel {
    public static currentPanel: ApiPlaygroundPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private readonly _client: LanguageClient;
    private readonly _context: vscode.ExtensionContext;
    private _disposables: vscode.Disposable[] = [];

    private constructor(
        panel: vscode.WebviewPanel, 
        context: vscode.ExtensionContext, 
        client: LanguageClient,
        initialState?: PlaygroundStateDTO
    ) {
        this._panel = panel;
        this._context = context;
        this._extensionPath = context.extensionPath;
        this._client = client;

        this._panel.webview.html = this._getHtmlForWebview(this._panel.webview);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            async message => {
                await this._handleMessage(message, initialState);
            },
            null,
            this._disposables
        );
    }

    public static async createOrShow(
        context: vscode.ExtensionContext, 
        client: LanguageClient, 
        initialState?: PlaygroundStateDTO
    ): Promise<ApiPlaygroundPanel> {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : vscode.ViewColumn.One;

        if (ApiPlaygroundPanel.currentPanel) {
            ApiPlaygroundPanel.currentPanel._panel.reveal(column);
            if (initialState) {
                ApiPlaygroundPanel.currentPanel._panel.webview.postMessage({
                    command: 'fileLoaded',
                    state: initialState
                });
            }
            return ApiPlaygroundPanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            'tally-tdl.apiPlayground',
            'Tally API Playground',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(context.extensionPath, 'client', 'media')),
                    vscode.Uri.file(path.join(context.extensionPath, 'dist', 'webview-ui'))
                ]
            }
        );

        ApiPlaygroundPanel.currentPanel = new ApiPlaygroundPanel(panel, context, client, initialState);

        // Open ResponsePanel beside the playground automatically
        try {
            ResponsePanel.createOrShow(context.extensionUri, true);
        } catch (err) {
            console.error('Failed to auto-open ResponsePanel:', err);
        }

        return ApiPlaygroundPanel.currentPanel;
    }

    private async _handleMessage(message: any, initialState?: PlaygroundStateDTO) {
        switch (message.command) {
            case 'ready':
            case 'getPlaygroundInit': {
                this._panel.webview.postMessage({
                    command: 'setView',
                    view: 'apiPlayground'
                });

                // Fetch initial suggestions on-demand from LSP
                this._fetchAndSendSuggestions({ category: 'definitionType' });
                this._fetchAndSendSuggestions({ category: 'schemaType' });
                this._fetchAndSendSuggestions({ category: 'collection' });
                this._fetchAndSendSuggestions({ category: 'report' });
                this._fetchAndSendSuggestions({ category: 'staticVariable' });

                // 2. Fetch Active Companies
                this._fetchAndSendCompanies();

                // 3. Load Templates from snippets
                this._loadAndSendTemplates();

                // 4. Load History from Global State
                this._loadAndSendHistory();

                // 5. Send initial state if provided
                if (initialState) {
                    this._panel.webview.postMessage({
                        command: 'fileLoaded',
                        state: initialState
                    });
                }
                return;
            }

            case 'getPlaygroundSuggestions':
            case 'getSuggestions': {
                const queryPayload = (typeof message.query === 'object' && message.query !== null)
                    ? message.query
                    : {
                        category: message.category || 'definitionType',
                        query: typeof message.query === 'string' ? message.query : (message.search || message.queryText || ''),
                        limit: message.limit || 500,
                        defType: message.defType,
                        attributeName: message.attributeName,
                        paramIndex: message.paramIndex,
                        currentDefinition: message.currentDefinition
                    };
                await this._fetchAndSendSuggestions(queryPayload);
                return;
            }

            case 'fetchCompanies':
                await this._fetchAndSendCompanies();
                return;

            case 'getAttributesForDefType': {
                try {
                    const attrs = await this._client.sendRequest<any[]>('tdl/getAttributesForDefType', { defType: message.defType });
                    this._panel.webview.postMessage({
                        command: 'attributesResult',
                        defType: message.defType,
                        attributes: attrs
                    });
                } catch (err) {
                    console.error('Error fetching attributes for def type:', err);
                }
                return;
            }

            case 'getSchemaProperties': {
                try {
                    const props = await this._client.sendRequest<any[]>('tdl/getSchemaProperties', { schemaType: message.schemaType });
                    this._panel.webview.postMessage({
                        command: 'schemaPropertiesResult',
                        schemaType: message.schemaType,
                        schemaProperties: props
                    });
                } catch (err) {
                    console.error('Error fetching schema properties:', err);
                }
                return;
            }

            case 'sendRequest': {
                const config = vscode.workspace.getConfiguration('tallyTDL');
                const port = config.get<number>('tallyPort') || 9000;
                const xml = message.xml;
                const meta = message.meta || {};

                // Ensure Tally is running before dispatching
                let isRunning = await checkTallyRunning(port);
                if (!isRunning) {
                    const exePath = config.get<string>('tallyExePath');
                    if (!exePath) {
                        const choice = await vscode.window.showErrorMessage(
                            `Tally is not running on port ${port}. Please launch Tally manually or configure Tally Path.`,
                            'Setup Path'
                        );
                        if (choice === 'Setup Path') {
                            vscode.commands.executeCommand('tally-tdl.setupTallyPath');
                        }
                        return;
                    }

                    const launchResult = await launchTallyAndWait(exePath, port, []);
                    if (!launchResult) {
                        const choice = await vscode.window.showErrorMessage(
                            `Failed to connect to Tally on port ${port}. Make sure ODBC port is configured.`,
                            'Setup ODBC Port'
                        );
                        if (choice === 'Setup ODBC Port') {
                            vscode.commands.executeCommand('tally-tdl.setupOdbcPort');
                        }
                        return;
                    }
                }

                const startTime = Date.now();
                let historyEntry: PlaygroundHistoryEntryDTO;

                try {
                    const res = await sendXmlRequest(xml, port);
                    const elapsed = res.elapsed || (Date.now() - startTime);

                    // Show result in ResponsePanel with playground mode enabled
                    const respPanel = ResponsePanel.createOrShow(this._context.extensionUri, true);
                    const responseContent = fs.existsSync(res.filePath) ? fs.readFileSync(res.filePath, 'utf-8') : '';
                    respPanel.showResponse(responseContent, '', elapsed);

                    historyEntry = {
                        id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        timestamp: Date.now(),
                        requestXml: xml,
                        responsePath: res.filePath,
                        statusCode: res.statusCode || 200,
                        elapsedMs: elapsed,
                        label: meta.label || `Export ${meta.type || 'Collection'}: ${meta.idField || ''}`,
                        type: meta.type || 'Collection',
                        idField: meta.idField || ''
                    };
                } catch (err: any) {
                    const elapsed = Date.now() - startTime;
                    const errorMsg = err instanceof Error ? err.message : String(err);

                    // Show error in ResponsePanel
                    const respPanel = ResponsePanel.createOrShow(this._context.extensionUri, true);
                    respPanel.showResponse('', errorMsg, elapsed);

                    historyEntry = {
                        id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                        timestamp: Date.now(),
                        requestXml: xml,
                        error: errorMsg,
                        elapsedMs: elapsed,
                        label: meta.label || `Export ${meta.type || 'Collection'}: ${meta.idField || ''}`,
                        type: meta.type || 'Collection',
                        idField: meta.idField || ''
                    };
                }

                // Save to history in globalState
                this._saveHistoryEntry(historyEntry);

                // Notify webview
                this._panel.webview.postMessage({
                    command: 'historyEntryAdded',
                    historyEntry
                });
                return;
            }

            case 'viewResponse': {
                if (message.responsePath && fs.existsSync(message.responsePath)) {
                    try {
                        const content = fs.readFileSync(message.responsePath, 'utf-8');
                        const respPanel = ResponsePanel.createOrShow(this._context.extensionUri, true);
                        respPanel.showResponse(content, '', 0);
                    } catch (e) {
                        vscode.window.showErrorMessage(`Failed to open response: ${e}`);
                    }
                } else {
                    vscode.window.showWarningMessage('Response file is no longer available in temporary storage.');
                }
                return;
            }

            case 'openInEditor': {
                try {
                    if (message.filePath && fs.existsSync(message.filePath)) {
                        const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(message.filePath));
                        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                    } else {
                        const doc = await vscode.workspace.openTextDocument({
                            content: message.xml || '',
                            language: 'xml'
                        });
                        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
                    }
                } catch (err) {
                    vscode.window.showErrorMessage(`Could not open XML in editor: ${err}`);
                }
                return;
            }

            case 'loadFromActiveEditor': {
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor) {
                    const text = activeEditor.document.getText();
                    const state = await this._parseXmlToState(text);
                    state.linkedFilePath = activeEditor.document.uri.fsPath;
                    state.linkedFileName = path.basename(activeEditor.document.uri.fsPath);
                    this._panel.webview.postMessage({
                        command: 'fileLoaded',
                        state
                    });
                } else {
                    vscode.window.showInformationMessage('No active editor open to load XML from.');
                }
                return;
            }

            case 'openFilePicker': {
                const uris = await vscode.window.showOpenDialog({
                    canSelectFiles: true,
                    canSelectFolders: false,
                    canSelectMany: false,
                    filters: {
                        'XML Files': ['xml', 'tdlxml', 'txt']
                    },
                    openLabel: 'Load into API Playground'
                });

                if (uris && uris.length > 0) {
                    try {
                        const content = fs.readFileSync(uris[0].fsPath, 'utf-8');
                        const state = await this._parseXmlToState(content);
                        state.linkedFilePath = uris[0].fsPath;
                        state.linkedFileName = path.basename(uris[0].fsPath);
                        this._panel.webview.postMessage({
                            command: 'fileLoaded',
                            state
                        });
                    } catch (err) {
                        vscode.window.showErrorMessage(`Failed to read file: ${err}`);
                    }
                }
                return;
            }

            case 'parseTemplateXml':
            case 'parseHistoryXml': {
                if (message.xml) {
                    const state = await this._parseXmlToState(message.xml);
                    this._panel.webview.postMessage({
                        command: 'fileLoaded',
                        state
                    });
                }
                return;
            }

            case 'clearHistory': {
                await this._context.globalState.update('tallyTDL:playground:history', []);
                return;
            }
        }
    }

    private async _parseXmlToState(xml: string): Promise<PlaygroundStateDTO> {
        try {
            const state = await this._client.sendRequest<PlaygroundStateDTO>('tdl/parseEnvelopeXml', { xml });
            if (state) return state;
        } catch {
            // fallback if LSP is not ready
        }
        return parseEnvelopeXml(xml);
    }

    private async _fetchAndSendSuggestions(params: import('tally-tdl-shared').PlaygroundSuggestionQueryDTO) {
        try {
            const suggestions = await this._client.sendRequest<import('tally-tdl-shared').PlaygroundSuggestionsDTO>(
                'tdl/getPlaygroundSuggestions', 
                params
            );
            if (suggestions) {
                this._panel.webview.postMessage({
                    command: 'suggestionsResult',
                    suggestions
                });
            }
        } catch (err) {
            console.error('Error fetching on-demand suggestions from LSP:', err);
        }
    }

    private async _fetchAndSendCompanies() {
        try {
            const config = vscode.workspace.getConfiguration('tallyTDL');
            const port = config.get<number>('tallyPort') || 9000;
            const companies = await fetchActiveCompanies(port);
            this._panel.webview.postMessage({
                command: 'companiesList',
                companies
            });
        } catch {
            this._panel.webview.postMessage({
                command: 'companiesList',
                companies: []
            });
        }
    }

    private _loadAndSendTemplates() {
        const templates: PlaygroundTemplateDTO[] = [
            // Export Collection Templates
            {
                name: 'Export All Ledgers (with Balances & GSTIN)',
                description: 'Export all accounting ledgers with parent group, opening balance, closing balance, and Party GSTIN.',
                prefix: 'exp-ledgers',
                category: 'Export',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>AllLedgersCollection</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="AllLedgersCollection">
                        <TYPE>Ledger</TYPE>
                        <NATIVEMETHOD>Name, Parent, OpeningBalance, ClosingBalance, PartyGSTIN</NATIVEMETHOD>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Export Trial Balance (Non-Zero Balances)',
                description: 'Export ledgers with debit/credit breakdown and a filter excluding zero closing balance.',
                prefix: 'exp-trialbalance',
                category: 'Export',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>TrialBalanceCollection</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="TrialBalanceCollection">
                        <TYPE>Ledger</TYPE>
                        <NATIVEMETHOD>Name, Parent, OpeningBalance, ClosingBalance, DebitAmt, CreditAmt</NATIVEMETHOD>
                        <FILTER>NonZeroBalanceFilter</FILTER>
                    </COLLECTION>
                    <SYSTEM TYPE="Formulae" NAME="NonZeroBalanceFilter">$ClosingBalance != 0</SYSTEM>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Export Sales Vouchers (with Line Items)',
                description: 'Export Sales transactions for a given date range with ledger and inventory allocations.',
                prefix: 'exp-sales-vch',
                category: 'Export',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>SalesVoucherCollection</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVFROMDATE>20240401</SVFROMDATE>
                <SVTODATE>20240430</SVTODATE>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="SalesVoucherCollection">
                        <TYPE>Voucher</TYPE>
                        <FETCH>Date, VoucherTypeName, VoucherNumber, PartyLedgerName, Amount, AllLedgerEntries.List.*, AllInventoryEntries.List.*</FETCH>
                        <FILTER>SalesTypeFilter</FILTER>
                    </COLLECTION>
                    <SYSTEM TYPE="Formulae" NAME="SalesTypeFilter">$VoucherTypeName = "Sales"</SYSTEM>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Export Stock Items (Closing Stock & Rate)',
                description: 'Export all inventory stock items with category, units, closing balance, closing rate, and valuation.',
                prefix: 'exp-stockitems',
                category: 'Export',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>StockItemCollection</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="StockItemCollection">
                        <TYPE>StockItem</TYPE>
                        <NATIVEMETHOD>Name, Parent, BaseUnits, OpeningBalance, ClosingBalance, ClosingRate, ClosingValue</NATIVEMETHOD>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Export Outstanding Bills Receivable',
                description: 'Export outstanding bill-by-bill receivables for Sundry Debtors.',
                prefix: 'exp-bills-receivable',
                category: 'Export',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>BillsReceivableCollection</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="BillsReceivableCollection">
                        <TYPE>Bills</TYPE>
                        <CHILDOF>$$GroupSundryDebtors</CHILDOF>
                        <NATIVEMETHOD>Name, BillDate, BillCreditPeriod, BillClosingBalance, BillDue</NATIVEMETHOD>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Export DayBook Vouchers',
                description: 'Export all vouchers recorded on the current system date.',
                prefix: 'exp-daybook',
                category: 'Export',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>DayBookCollection</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
                <SVFROMDATE>$$SysInfo:SystemDate</SVFROMDATE>
                <SVTODATE>$$SysInfo:SystemDate</SVTODATE>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="DayBookCollection">
                        <TYPE>Voucher</TYPE>
                        <FETCH>Date, VoucherTypeName, VoucherNumber, PartyLedgerName, Amount</FETCH>
                    </COLLECTION>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Export List of Companies',
                description: 'Export all companies currently open and active in Tally.',
                prefix: 'exp-companies',
                category: 'Export',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>List of Companies</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>`
            },

            // Export Report Templates
            {
                name: 'Export Balance Sheet Report',
                description: 'Export standard Tally Balance Sheet financial report data.',
                prefix: 'rep-balancesheet',
                category: 'Report',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Balance Sheet</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Export Profit and Loss Report',
                description: 'Export standard Tally Profit and Loss Statement report data.',
                prefix: 'rep-pnl',
                category: 'Report',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Profit and Loss</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Export Stock Summary Report',
                description: 'Export formatted Stock Summary report with item valuations.',
                prefix: 'rep-stocksummary',
                category: 'Report',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Stock Summary</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
        </DESC>
    </BODY>
</ENVELOPE>`
            },

            // Import Templates (Full Envelopes for Business Objects)
            {
                name: 'Import Ledger with GST & Address',
                description: 'Create a new Ledger master with parent group, opening balance, address, state, PIN, and GSTIN.',
                prefix: 'imp-ledger',
                category: 'Import',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Masters</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY></SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <LEDGER NAME="ABC Enterprises" Action="Create">
                    <NAME>ABC Enterprises</NAME>
                    <PARENT>Sundry Debtors</PARENT>
                    <OPENINGBALANCE>-5000.00</OPENINGBALANCE>
                    <ISBILLWISEON>Yes</ISBILLWISEON>
                    <AFFECTSSTOCK>No</AFFECTSSTOCK>
                    <LANGUAGENAME.LIST>
                        <NAME.LIST>
                            <NAME>ABC Enterprises</NAME>
                            <NAME>ABC Ent</NAME>
                        </NAME.LIST>
                        <LANGUAGEID> 1033</LANGUAGEID>
                    </LANGUAGENAME.LIST>
                    <ADDRESS.LIST>
                        <ADDRESS>123 Industrial Area, Phase 2</ADDRESS>
                        <ADDRESS>New Delhi</ADDRESS>
                    </ADDRESS.LIST>
                    <COUNTRYNAME>India</COUNTRYNAME>
                    <LEDSTATENAME>Delhi</LEDSTATENAME>
                    <PINCODE>110020</PINCODE>
                    <PARTYGSTIN>07AAAAA0000A1Z5</PARTYGSTIN>
                </LEDGER>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Import Group Master',
                description: 'Create a new Accounting Group master with parent group.',
                prefix: 'imp-group',
                category: 'Import',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Masters</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY></SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <GROUP NAME="North Zone Debtors" Action="Create">
                    <NAME>North Zone Debtors</NAME>
                    <PARENT>Sundry Debtors</PARENT>
                    <ISSUBLEDGER>No</ISSUBLEDGER>
                    <LANGUAGENAME.LIST>
                        <NAME.LIST>
                            <NAME>North Zone Debtors</NAME>
                        </NAME.LIST>
                        <LANGUAGEID> 1033</LANGUAGEID>
                    </LANGUAGENAME.LIST>
                </GROUP>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Import Stock Item with GST & Units',
                description: 'Create a new Inventory Stock Item master with unit, opening quantity/rate, and GST details.',
                prefix: 'imp-stockitem',
                category: 'Import',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Masters</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY></SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <STOCKITEM NAME="Widget Pro 100" Action="Create">
                    <NAME>Widget Pro 100</NAME>
                    <PARENT>&#4; Primary</PARENT>
                    <BASEUNITS>Nos</BASEUNITS>
                    <OPENINGBALANCE>100 Nos</OPENINGBALANCE>
                    <OPENINGRATE>150.00 / Nos</OPENINGRATE>
                    <OPENINGVALUE>-15000.00</OPENINGVALUE>
                    <LANGUAGENAME.LIST>
                        <NAME.LIST>
                            <NAME>Widget Pro 100</NAME>
                        </NAME.LIST>
                        <LANGUAGEID> 1033</LANGUAGEID>
                    </LANGUAGENAME.LIST>
                    <GSTAPPLICABLE>&#4; Applicable</GSTAPPLICABLE>
                    <GSTTYPEOFSUPPLY>Goods</GSTTYPEOFSUPPLY>
                </STOCKITEM>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Import Unit of Measure (UOM)',
                description: 'Create a Unit of Measure master (e.g. Nos, Kgs, Box).',
                prefix: 'imp-unit',
                category: 'Import',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Masters</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY></SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <UNIT NAME="Nos" Action="Create">
                    <NAME>Nos</NAME>
                    <ORIGINALNAME>Numbers</ORIGINALNAME>
                    <DECIMALPLACES>0</DECIMALPLACES>
                </UNIT>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Import Sales Accounting Voucher (with GST)',
                description: 'Create a complete Sales Voucher transaction with buyer ledger, sales account, GST ledger entries, and bill allocations.',
                prefix: 'imp-sales-vch',
                category: 'Import',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Vouchers</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY></SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER Action="Create" VCHTYPE="Sales">
                    <DATE>20240401</DATE>
                    <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                    <VOUCHERNUMBER>INV-001</VOUCHERNUMBER>
                    <PARTYLEDGERNAME>ABC Enterprises</PARTYLEDGERNAME>
                    <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>ABC Enterprises</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                        <AMOUNT>-1180.00</AMOUNT>
                        <BILLALLOCATIONS.LIST>
                            <NAME>INV-001</NAME>
                            <BILLTYPE>New Ref</BILLTYPE>
                            <AMOUNT>-1180.00</AMOUNT>
                        </BILLALLOCATIONS.LIST>
                    </ALLLEDGERENTRIES.LIST>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>Sales Account</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <AMOUNT>1000.00</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>CGST</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <AMOUNT>90.00</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>SGST</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <AMOUNT>90.00</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                </VOUCHER>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Import Receipt Voucher',
                description: 'Create a bank receipt voucher linking customer payment to bank account.',
                prefix: 'imp-receipt-vch',
                category: 'Import',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>Vouchers</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY></SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <VOUCHER Action="Create" VCHTYPE="Receipt">
                    <DATE>20240401</DATE>
                    <VOUCHERTYPENAME>Receipt</VOUCHERTYPENAME>
                    <PARTYLEDGERNAME>ABC Enterprises</PARTYLEDGERNAME>
                    <PERSISTEDVIEW>Accounting Voucher View</PERSISTEDVIEW>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>HDFC Bank</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                        <AMOUNT>-1000.00</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                    <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>ABC Enterprises</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                        <AMOUNT>1000.00</AMOUNT>
                    </ALLLEDGERENTRIES.LIST>
                </VOUCHER>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`
            },
            {
                name: 'Import Batch Masters (Group + Ledger + Item)',
                description: 'Import multiple business objects in a single batch message.',
                prefix: 'imp-batch-masters',
                category: 'Import',
                xml: `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Import</TALLYREQUEST>
        <TYPE>Data</TYPE>
        <ID>All Masters</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVCURRENTCOMPANY></SVCURRENTCOMPANY>
            </STATICVARIABLES>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
                <GROUP NAME="Wholesale Customers" Action="Create">
                    <NAME>Wholesale Customers</NAME>
                    <PARENT>Sundry Debtors</PARENT>
                    <LANGUAGENAME.LIST>
                        <NAME.LIST>
                            <NAME>Wholesale Customers</NAME>
                        </NAME.LIST>
                        <LANGUAGEID> 1033</LANGUAGEID>
                    </LANGUAGENAME.LIST>
                </GROUP>
                <LEDGER NAME="Metro Traders" Action="Create">
                    <NAME>Metro Traders</NAME>
                    <PARENT>Wholesale Customers</PARENT>
                    <OPENINGBALANCE>0.00</OPENINGBALANCE>
                    <LANGUAGENAME.LIST>
                        <NAME.LIST>
                            <NAME>Metro Traders</NAME>
                        </NAME.LIST>
                        <LANGUAGEID> 1033</LANGUAGEID>
                    </LANGUAGENAME.LIST>
                </LEDGER>
                <STOCKITEM NAME="Industrial Paint 20L" Action="Create">
                    <NAME>Industrial Paint 20L</NAME>
                    <PARENT>&#4; Primary</PARENT>
                    <BASEUNITS>Nos</BASEUNITS>
                    <LANGUAGENAME.LIST>
                        <NAME.LIST>
                            <NAME>Industrial Paint 20L</NAME>
                        </NAME.LIST>
                        <LANGUAGEID> 1033</LANGUAGEID>
                    </LANGUAGENAME.LIST>
                </STOCKITEM>
            </TALLYMESSAGE>
        </DESC>
    </BODY>
</ENVELOPE>`
            }
        ];

        this._panel.webview.postMessage({
            command: 'templatesData',
            templates
        });
    }

    private _loadAndSendHistory() {
        const history = this._context.globalState.get<PlaygroundHistoryEntryDTO[]>('tallyTDL:playground:history') || [];
        this._panel.webview.postMessage({
            command: 'historyData',
            history
        });
    }

    private async _saveHistoryEntry(entry: PlaygroundHistoryEntryDTO) {
        try {
            const history = this._context.globalState.get<PlaygroundHistoryEntryDTO[]>('tallyTDL:playground:history') || [];
            // Cap history at 50 entries
            const updated = [entry, ...history.filter(h => h.id !== entry.id)].slice(0, 50);
            await this._context.globalState.update('tallyTDL:playground:history', updated);
        } catch (err) {
            console.error('Failed to save history entry:', err);
        }
    }

    public dispose() {
        ApiPlaygroundPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const stylePathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'dist', 'webview-ui', 'assets', 'index.css'));
        const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'dist', 'webview-ui', 'assets', 'index.js'));

        const styleUri = webview.asWebviewUri(stylePathOnDisk).with({ query: `t=${Date.now()}` });
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk).with({ query: `t=${Date.now()}` });

        const nonce = getNonce();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${webview.cspSource} data:; style-src ${webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link href="${styleUri}" rel="stylesheet">
                <title>Tally API Playground</title>
            </head>
            <body>
                <div id="root"></div>
                <script nonce="${nonce}">
                    window.__INITIAL_VIEW__ = 'apiPlayground';
                </script>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
    }
}
