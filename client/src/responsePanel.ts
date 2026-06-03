import * as vscode from 'vscode';

export class ResponsePanel {
    public static currentPanel: ResponsePanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionUri: vscode.Uri;
    private _sourceUri?: vscode.Uri;
    private _disposables: vscode.Disposable[] = [];
    
    // Callbacks
    public onDidSendRequest?: (variables: Map<string, string>) => void;
    public onDidSaveDefault?: (varName: string, value: string) => void;
    public onDidRefresh?: () => void;
    public onDidLogError?: (errorMsg: string, stack: string) => void;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri, sourceUri?: vscode.Uri) {
        this._panel = panel;
        this._extensionUri = extensionUri;
        this._sourceUri = sourceUri;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'send':
                        if (this.onDidSendRequest) {
                            const vars = new Map<string, string>();
                            for (const [k, v] of Object.entries(message.variables)) {
                                vars.set(k, v as string);
                            }
                            this.onDidSendRequest(vars);
                        }
                        return;
                    case 'refresh':
                        if (this.onDidRefresh) {
                            this.onDidRefresh();
                        }
                        return;
                    case 'saveDefault':
                        if (this.onDidSaveDefault) {
                            this.onDidSaveDefault(message.varName, message.value);
                        }
                        return;
                    case 'openInEditor':
                        // If we have a source file URI, use it. Otherwise, use an untitled file.
                        const uri = this._sourceUri || vscode.Uri.parse('untitled:' + 'Tally Response.xml');
                        vscode.workspace.openTextDocument(uri).then(doc => {
                            vscode.window.showTextDocument(doc, { viewColumn: vscode.ViewColumn.Active }).then(editor => {
                                
                                const performSearch = () => {
                                    if (message.searchString) {
                                        const text = doc.getText();
                                        let searchStr = message.searchString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
                                        let index = text.indexOf(searchStr);
                                        
                                        if (index === -1) {
                                            index = text.indexOf(message.searchString);
                                        }
                                        
                                        if (index !== -1) {
                                            const position = doc.positionAt(index);
                                            editor.selection = new vscode.Selection(position, position);
                                            editor.revealRange(new vscode.Range(position, position), vscode.TextEditorRevealType.InCenter);
                                        }
                                    }
                                };

                                // Only overwrite if it's an untitled response file AND content differs.
                                // If it's a real file, NEVER overwrite its contents!
                                if (!this._sourceUri && doc.getText() !== message.content) {
                                    editor.edit(editBuilder => {
                                        const fullRange = new vscode.Range(
                                            doc.positionAt(0),
                                            doc.positionAt(doc.getText().length)
                                        );
                                        editBuilder.replace(fullRange, message.content);
                                    }).then(() => {
                                        vscode.languages.setTextDocumentLanguage(doc, message.language).then(() => {
                                            performSearch();
                                        });
                                    });
                                } else {
                                    performSearch();
                                }
                            });
                        });
                        return;
                    case 'viewAsTable':
                        vscode.commands.executeCommand('tally-tdl.viewXmlAsTable', message.content);
                        return;
                    case 'showError':
                        vscode.window.showErrorMessage(message.message);
                        return;
                    case 'logError':
                        if (this.onDidLogError) {
                            this.onDidLogError(message.message, message.stack);
                        }
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public static createOrShow(extensionUri: vscode.Uri): ResponsePanel {
        const column = vscode.ViewColumn.Beside;

        if (ResponsePanel.currentPanel) {
            ResponsePanel.currentPanel._panel.reveal(column);
            return ResponsePanel.currentPanel;
        }

        const panel = vscode.window.createWebviewPanel(
            'tallyResponse',
            'Tally XML Response',
            column,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        ResponsePanel.currentPanel = new ResponsePanel(panel, extensionUri);
        ResponsePanel.currentPanel._panel.webview.html = ResponsePanel.currentPanel._getHtmlForWebview(false);
        return ResponsePanel.currentPanel;
    }

    public static createFullScreenTable(extensionUri: vscode.Uri, xmlContent: string, sourceUri?: vscode.Uri): ResponsePanel {
        const panel = vscode.window.createWebviewPanel(
            'tallyResponseFull',
            'Tally Table View',
            vscode.ViewColumn.Active,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        const responsePanel = new ResponsePanel(panel, extensionUri, sourceUri);
        panel.webview.html = responsePanel._getHtmlForWebview(true);
        
        // Wait briefly for webview to load then send the data
        setTimeout(() => {
            panel.webview.postMessage({
                command: 'showResponse',
                xml: xmlContent,
                elapsedMs: 0
            });
        }, 300);
        
        return responsePanel;
    }

    public updateVariables(variables: string[], savedValues: Map<string, { value: string, isWorkspace: boolean }>, variableTypes: Record<string, string>, activeCompanies: string[]) {
        const varsObj: Record<string, { value: string, isWorkspace: boolean }> = {};
        for (const v of variables) {
            varsObj[v] = savedValues.get(v) || { value: '', isWorkspace: false };
        }
        
        this._panel.webview.postMessage({
            command: 'updateVariables',
            variables: varsObj,
            types: variableTypes || {},
            companies: activeCompanies || []
        });
    }

    public setStatus(status: 'idle' | 'loading' | 'success' | 'error', message?: string) {
        this._panel.webview.postMessage({
            command: 'setStatus',
            status,
            message
        });
    }

    public showResponse(xml: string, prettyXml: string, elapsedMs: number) {
        this._panel.webview.postMessage({
            command: 'showResponse',
            xml,
            prettyXml,
            elapsedMs
        });
    }

    public dispose() {
        // If this is the main panel, clear the reference
        if (ResponsePanel.currentPanel === this) {
            ResponsePanel.currentPanel = undefined;
        }
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview(isFullScreen: boolean): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tally Response</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            color: var(--vscode-editor-foreground);
            background-color: var(--vscode-editor-background);
            padding: 10px;
            display: flex;
            flex-direction: column;
            height: 100vh;
            box-sizing: border-box;
            overflow: hidden;
        }
        .section {
            margin-bottom: 15px;
            background: var(--vscode-editorWidget-background);
            border: 1px solid var(--vscode-widget-border);
            border-radius: 4px;
            padding: 10px;
        }
        .header {
            font-weight: bold;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .var-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        .var-name {
            width: 150px;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
        }
        .var-input {
            flex: 1;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 4px;
            margin-right: 8px;
        }
        button {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 4px 8px;
            cursor: pointer;
            border-radius: 2px;
        }
        button:hover {
            background: var(--vscode-button-hoverBackground);
        }
        button.secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        button.secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        .badge {
            font-size: 0.7em;
            padding: 2px 4px;
            border-radius: 3px;
            background: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            margin-left: 5px;
        }
        .badge.workspace {
            background: var(--vscode-textLink-activeForeground);
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid var(--vscode-panel-border);
            margin-bottom: 10px;
        }
        .tab {
            padding: 5px 15px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
        }
        .tab.active {
            border-bottom-color: var(--vscode-panelTitle-activeBorder);
            color: var(--vscode-panelTitle-activeForeground);
        }
        .tab-content {
            display: none;
            flex: 1;
            overflow: auto;
            position: relative;
        }
        .tab-content.active {
            display: block;
        }
        #tableView.active {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
        #rawView, #prettyView {
            white-space: pre;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            margin: 0;
        }
        
        /* Table Styles */
        table {
            border-collapse: collapse;
            width: 100%;
        }
        th, td {
            border: 1px solid var(--vscode-panel-border);
            padding: 6px;
            text-align: left;
        }
        table th {
            background: var(--vscode-editorWidget-background);
            position: sticky;
            top: 0;
            z-index: 10;
            box-shadow: 0 1px 0 var(--vscode-editorWidget-border);
        }
        
        body.fullscreen-mode #variablesSection,
        body.fullscreen-mode .status-bar,
        body.fullscreen-mode .tabs,
        body.fullscreen-mode #rawView {
            display: none !important;
        }
        body.fullscreen-mode #tableView {
            margin-top: 0;
            padding-top: 0;
        }
        .drill-link {
            color: var(--vscode-textLink-foreground);
            cursor: pointer;
            text-decoration: none;
        }
        .drill-link:hover {
            text-decoration: underline;
        }
        .breadcrumb {
            margin-bottom: 10px;
            font-size: 0.9em;
        }
        .breadcrumb-item {
            cursor: pointer;
            color: var(--vscode-textLink-foreground);
        }
        .breadcrumb-item:hover {
            text-decoration: underline;
        }
        
        .status-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-top: 10px;
        }
        .status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: gray;
        }
        .status-indicator.success { background: var(--vscode-testing-iconPassed); }
        .status-indicator.error { background: var(--vscode-testing-iconFailed); }
        .status-indicator.loading { 
            background: var(--vscode-textLink-foreground);
            animation: pulse 1s infinite;
        }
        @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
    </style>
</head>
<body class="${isFullScreen ? 'fullscreen-mode' : ''}">
    <div id="variablesSection" class="section" style="display: none;">
        <div class="header">Variables</div>
        <div id="variablesList"></div>
    </div>
    
    <div class="status-bar" id="statusBar" style="display: none;">
        <div id="statusIndicator" class="status-indicator"></div>
        <span id="statusMessage"></span>
    </div>

    <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-top: 10px;">
        <div class="tabs">
            <div class="tab active" data-target="tableView">Table</div>
            <div class="tab" data-target="rawView">Raw</div>
            <div style="flex: 1"></div>
            <button id="refreshBtn" class="secondary" style="margin: 3px;" title="Refresh variables from current XML file">↻ Refresh</button>
            <button id="sendBtn" style="margin: 3px;" title="Send Request">▶ Send Request</button>
            <button id="openEditorBtn" class="secondary" style="margin: 3px;" title="Open currently active view in a new editor tab">↗ Open in Editor</button>
        </div>
        
        <div id="tableView" class="tab-content active">
            <div id="breadcrumb" class="breadcrumb" style="display: none; flex-shrink: 0;"></div>
            <div id="tableSearchContainer" style="margin-bottom: 15px; display: none; flex-shrink: 0;">
                <input type="text" id="tableSearch" placeholder="Search data or section headers..." style="width: 100%; max-width: 400px; padding: 6px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border);" />
            </div>
            <div id="tableContainer" style="overflow: auto; flex: 1;">
                <div style="padding: 20px; text-align: center; color: var(--vscode-descriptionForeground);">
                    Send a request to see data.
                </div>
            </div>
        </div>

        <div id="rawView" class="tab-content"></div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentVariables = {};
        
        // Table navigation state
        let fullParsedData = null;
        let navigationHistory = [];
        let currentPathName = '';
        let lastRawXml = '';

        let lastTableData = '';
        
        // Setup tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                tab.classList.add('active');
                document.getElementById(tab.dataset.target).classList.add('active');
            });
        });
        
        document.getElementById('openEditorBtn').addEventListener('click', () => {
            const activeTab = document.querySelector('.tab.active').dataset.target;
            let content = '';
            let ext = '';
            
            if (activeTab === 'rawView') {
                content = lastRawXml;
                ext = 'xml';
                if (!content) {
                    vscode.postMessage({ command: 'showError', message: 'No raw XML data available' });
                    return;
                }
                vscode.postMessage({
                    command: 'openInEditor',
                    content: content,
                    language: ext
                });
            } else if (activeTab === 'tableView') {
                content = lastRawXml;
                if (!content) {
                    vscode.postMessage({ command: 'showError', message: 'No table data available' });
                    return;
                }
                vscode.postMessage({
                    command: 'viewAsTable',
                    content: content
                });
            }
        });
        
        // Setup Search listener statically so it survives re-rendering
        document.getElementById('tableSearch').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const container = document.getElementById('tableContainer');
            const groupContainers = container.querySelectorAll('.data-group-container');
            
            groupContainers.forEach(group => {
                let visibleRows = 0;
                
                // Check if the section header itself matches the search
                const header = group.querySelector('.section-header');
                const headerMatches = header && header.dataset.type && header.dataset.type.includes(term);
                
                const rows = group.querySelectorAll('.searchable-row');
                
                rows.forEach(row => {
                    // If header matches, show all rows. Otherwise check row text
                    if (headerMatches || row.textContent.toLowerCase().includes(term)) {
                        row.style.display = '';
                        visibleRows++;
                    } else {
                        row.style.display = 'none';
                    }
                });
                
                if (visibleRows === 0 && rows.length > 0) {
                    group.style.display = 'none';
                } else {
                    group.style.display = '';
                }
            });
        });
        
        document.getElementById('refreshBtn').addEventListener('click', () => {
            vscode.postMessage({ command: 'refresh' });
        });
        
        document.getElementById('sendBtn').addEventListener('click', () => {
            console.log('Webview: sendBtn clicked');
            const inputs = document.querySelectorAll('.var-input');
            const vars = {};
            inputs.forEach(input => {
                vars[input.dataset.var] = input.value;
            });
            console.log('Webview: posting message to backend', vars);
            vscode.postMessage({ command: 'send', variables: vars });
        });

        window.addEventListener('message', event => {
            const message = event.data;
            console.log('Webview: received message', message.command);
            switch (message.command) {
                case 'updateVariables':
                    renderVariables(message.variables, message.types, message.companies);
                    break;
                case 'setStatus':
                    console.log('Webview: setStatus', message.status, message.message);
                    updateStatus(message.status, message.message);
                    break;
                case 'showResponse':
                    console.log('Webview: showResponse called. Body length:', message.xml ? message.xml.length : 0);
                    renderResponse(message.xml, message.elapsedMs);
                    break;
            }
        });

        function renderVariables(vars, types, companies) {
            currentVariables = vars;
            const container = document.getElementById('variablesList');
            const section = document.getElementById('variablesSection');
            
            if (Object.keys(vars).length === 0) {
                section.style.display = 'none';
                return;
            }
            
            section.style.display = 'block';
            container.innerHTML = '';
            
            for (const [name, data] of Object.entries(vars)) {
                const row = document.createElement('div');
                row.className = 'var-row';
                
                const badge = data.isWorkspace 
                    ? '<span class="badge workspace" title="Workspace default">W</span>' 
                    : '<span class="badge file" title="File specific">F</span>';
                    
                const type = types[name] || 'string';
                
                let inputHtml = '';
                if (name === 'SVCURRENTCOMPANY' || type === 'company') {
                    let options = '<option value="">-- Select Company --</option>';
                    for (let i = 0; i < companies.length; i++) {
                        let c = companies[i];
                        let selected = (data.value === c) ? 'selected' : '';
                        options += '<option value="' + escapeHtml(c) + '" ' + selected + '>' + escapeHtml(c) + '</option>';
                    }
                    inputHtml = '<select class="var-input" data-var="' + escapeHtml(name) + '">' + options + '</select>';
                } else if (type === 'date') {
                    inputHtml = '<input type="date" class="var-input" data-var="' + escapeHtml(name) + '" value="' + escapeHtml(data.value) + '">';
                } else if (type === 'number') {
                    inputHtml = '<input type="number" class="var-input" data-var="' + escapeHtml(name) + '" value="' + escapeHtml(data.value) + '">';
                } else {
                    inputHtml = '<input type="text" class="var-input" data-var="' + escapeHtml(name) + '" value="' + escapeHtml(data.value) + '">';
                }

                let rowHtml = '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">';
                rowHtml += '<span class="var-name" title="' + escapeHtml(name) + '">' + escapeHtml(name) + '</span>';
                rowHtml += badge;
                rowHtml += '</div>';
                rowHtml += inputHtml;
                
                if (!data.isWorkspace) {
                    rowHtml += '<div class="save-default-btn save-btn" data-var="' + escapeHtml(name) + '" title="Save as Workspace Default">Save Default</div>';
                }
                
                row.innerHTML = rowHtml;
                container.appendChild(row);
            }
            
            document.querySelectorAll('.save-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const varName = e.target.dataset.var;
                    const input = document.querySelector('.var-input[data-var="' + varName + '"]');
                    vscode.postMessage({ 
                        command: 'saveDefault', 
                        varName: varName, 
                        value: input.value 
                    });
                });
            });
        }
        
        function updateStatus(status, message) {
            const bar = document.getElementById('statusBar');
            const ind = document.getElementById('statusIndicator');
            const msg = document.getElementById('statusMessage');
            
            bar.style.display = 'flex';
            ind.className = 'status-indicator ' + status;
            
            if (status === 'loading') {
                msg.textContent = message || 'Sending request...';
                document.getElementById('sendBtn').disabled = true;
            } else {
                msg.textContent = message || '';
                document.getElementById('sendBtn').disabled = false;
            }
        }

        function escapeHtml(unsafe) {
            return (unsafe || '').toString()
                 .replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
        }
        
        function renderResponse(xml, elapsedMs) {
            // Raw
            lastRawXml = xml;
            document.getElementById('rawView').textContent = xml;
            
            // Reset table parsing
            fullParsedData = null;
            lastTableData = '';
            
            // Parse for table
            try {
                const parser = new DOMParser();
                
                // Sanitize XML to remove invalid control characters that break DOMParser (like &#4;)
                let sanitizedXml = xml.replace(/[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F]/g, '');
                sanitizedXml = sanitizedXml.replace(/&#[xX]?[0-9a-fA-F]+;/g, match => {
                    let num;
                    if (match.toLowerCase().startsWith('&#x')) {
                        num = parseInt(match.substring(3, match.length - 1), 16);
                    } else {
                        num = parseInt(match.substring(2, match.length - 1), 10);
                    }
                    return (num >= 0 && num <= 31 && num !== 9 && num !== 10 && num !== 13) ? '' : match;
                });

                const doc = parser.parseFromString(sanitizedXml, 'text/xml');
                const parseError = doc.querySelector('parsererror');
                if (parseError) {
                    throw new Error('XML parsing error: ' + parseError.textContent);
                }
                
                // Find data nodes anywhere in the document, as Tally exports can have varying root structures
                const collection = doc.querySelector('COLLECTION');
                const tallyMessage = doc.querySelector('TALLYMESSAGE');
                const importResult = doc.querySelector('IMPORTRESULT');
                const lineError = doc.querySelector('LINEERROR');
                
                if (collection) {
                    // Extract children as list
                    const items = Array.from(collection.children);
                    if (items.length > 0) {
                        fullParsedData = parseElementsToList(items);
                        lastTableData = JSON.stringify(fullParsedData, null, 2);
                        navigationHistory = [];
                        renderTableView(fullParsedData, items[0].tagName);
                        return;
                    }
                } else if (tallyMessage) {
                    // Tally exports often use multiple <TALLYMESSAGE> nodes containing <VOUCHER> etc.
                    const messages = Array.from(doc.querySelectorAll('TALLYMESSAGE'));
                    const items = [];
                    messages.forEach(m => {
                        Array.from(m.children).forEach(c => items.push(c));
                    });
                    
                    if (items.length > 0) {
                        fullParsedData = parseElementsToList(items);
                        lastTableData = JSON.stringify(fullParsedData, null, 2);
                        navigationHistory = [];
                        // The array can be mixed types, we'll label it based on the first one or 'MIXED ITEMS'
                        const title = (new Set(items.map(i => i.tagName)).size > 1) ? 'MIXED ITEMS' : items[0].tagName;
                        renderTableView(fullParsedData, title);
                        return;
                    }
                } else if (importResult) {
                    fullParsedData = [parseElementToObject(importResult)];
                    lastTableData = JSON.stringify(fullParsedData, null, 2);
                    navigationHistory = [];
                    renderTableView(fullParsedData, 'IMPORTRESULT');
                    return;
                } else if (lineError) {
                    // Can be multiple LINEERRORs
                    const errors = Array.from(doc.querySelectorAll('LINEERROR'));
                    fullParsedData = parseElementsToList(errors);
                    lastTableData = JSON.stringify(fullParsedData, null, 2);
                    navigationHistory = [];
                    renderTableView(fullParsedData, 'LINEERROR');
                    return;
                } else {
                    // Generic fallback for any other response XML (ignoring Request XMLs)
                    const isRequest = doc.querySelector('TALLYREQUEST');
                    if (!isRequest && doc.documentElement && doc.documentElement.children.length > 0) {
                        const items = Array.from(doc.documentElement.children);
                        // Optional: if the root is ENVELOPE and it has a BODY with DATA, we could unpack that, 
                        // but generic doc.documentElement.children works because we removed strict paths!
                        fullParsedData = parseElementsToList(items);
                        lastTableData = JSON.stringify(fullParsedData, null, 2);
                        navigationHistory = [];
                        const title = (new Set(items.map(i => i.tagName)).size > 1) ? 'GENERIC DATA' : items[0].tagName;
                        renderTableView(fullParsedData, title);
                        return;
                    }
                }
                
                showTableMessage('Unknown response format — use Raw or Pretty tab');
            } catch (e) {
                const errMsg = e.message || String(e);
                const stack = e.stack || '';
                showTableMessage('Error parsing XML for table view: ' + errMsg);
                vscode.postMessage({ command: 'logError', message: errMsg, stack: stack });
            }
        }
        
        function showTableMessage(msg) {
            document.getElementById('breadcrumb').style.display = 'none';
            document.getElementById('tableContainer').innerHTML = 
                \`<div style="padding: 20px; text-align: center; color: var(--vscode-descriptionForeground);">\${msg}</div>\`;
        }

        function parseElementsToList(elements) {
            return elements.map(parseElementToObject);
        }
        
        function parseElementToObject(el) {
            const obj = {};
            obj['_TYPE_'] = el.tagName;
            // Attributes
            for (let i = 0; i < el.attributes.length; i++) {
                const attr = el.attributes[i];
                if (attr.name.toUpperCase() === 'TYPE') continue;
                obj[attr.name] = attr.value;
            }
            // Children
            let textValue = '';
            for (const node of el.childNodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    textValue += node.nodeValue.trim();
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    const childEl = node;
                    const childName = childEl.tagName;
                    
                    let valToStore;
                    if (childEl.children.length === 0) {
                        // Leaf node: flatten to text content to avoid drill-down and ignore its attributes
                        valToStore = childEl.textContent.trim();
                        // Ignore completely empty elements without attributes
                        if (valToStore === '' && childEl.attributes.length === 0) continue;
                    } else {
                        valToStore = parseElementToObject(childEl);
                        // If it's effectively empty (only has _TYPE_), ignore it
                        if (Object.keys(valToStore).length === 1 && valToStore['_TYPE_']) continue;
                    }
                    
                    // Handling lists (like LEDGERENTRIES.LIST)
                    if (childName.includes('.LIST')) {
                        if (!obj[childName]) obj[childName] = [];
                        obj[childName].push(valToStore);
                    } else {
                        // Regular element, but if multiple exist, turn into array
                        if (obj[childName]) {
                            if (!Array.isArray(obj[childName])) {
                                obj[childName] = [obj[childName]];
                            }
                            obj[childName].push(valToStore);
                        } else {
                            obj[childName] = valToStore;
                        }
                    }
                }
            }
            if (textValue) {
                obj['#text'] = textValue;
            }
            return obj;
        }

        function renderTableView(listData, pathName) {
            const container = document.getElementById('tableContainer');
            const breadcrumbEl = document.getElementById('breadcrumb');
            
            if (!Array.isArray(listData) || listData.length === 0) {
                showTableMessage('No data to display in table format');
                return;
            }
            
            // Update breadcrumbs
            breadcrumbEl.style.display = 'block';
            let bcHtml = '';
            if (navigationHistory.length === 0) {
                bcHtml = \`<span>\${pathName} (\${listData.length} items)</span>\`;
            } else {
                bcHtml = \`<span class="breadcrumb-item" data-idx="-1">Root</span>\`;
                for (let i = 0; i < navigationHistory.length; i++) {
                    bcHtml += \` > <span class="breadcrumb-item" data-idx="\${i}">\${navigationHistory[i].name}</span>\`;
                }
                bcHtml += \` > <span>\${pathName} (\${listData.length} items)</span>\`;
            }
            breadcrumbEl.innerHTML = bcHtml;
            
            // Add breadcrumb listeners
            breadcrumbEl.querySelectorAll('.breadcrumb-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const idx = parseInt(e.target.dataset.idx);
                    const searchInput = document.getElementById('tableSearch');
                    
                    if (idx === -1) {
                        const rootTerm = navigationHistory[0] ? navigationHistory[0].searchTerm : '';
                        if (searchInput) searchInput.value = rootTerm || '';
                        navigationHistory = [];
                        renderTableView(fullParsedData, fullParsedData.rootName || 'Root');
                    } else {
                        const target = navigationHistory[idx];
                        if (searchInput) searchInput.value = target.searchTerm || '';
                        navigationHistory = navigationHistory.slice(0, idx);
                        renderTableView(target.data, target.name);
                    }
                });
            });
            
            // Group data by _TYPE_
            const groups = {};
            listData.forEach((item, idx) => {
                let type = 'Data';
                if (typeof item === 'object' && item !== null && item['_TYPE_']) {
                    type = item['_TYPE_'];
                }
                if (!groups[type]) groups[type] = [];
                // Store original index so drill-down fetches the exact original object
                groups[type].push({ data: item, origIdx: idx });
            });

            // Build HTML
            let html = '';

            for (const [type, items] of Object.entries(groups)) {
                html += '<div class="data-group-container">';
                
                if (Object.keys(groups).length > 1) {
                    html += \`<h3 class="section-header" data-type="\${escapeHtml(type).toLowerCase()}" style="margin-top: 20px; margin-bottom: 10px; color: var(--vscode-editorInfo-foreground); font-weight: 600;">\${escapeHtml(type)} (\${items.length} items)</h3>\`;
                } else {
                    html += \`<div class="section-header" data-type="\${escapeHtml(type).toLowerCase()}" style="display:none;"></div>\`;
                }

                // Collect columns for this group
                const columns = new Set();
                items.forEach(wrapped => {
                    const item = wrapped.data;
                    if (typeof item === 'object' && item !== null) {
                        Object.keys(item).forEach(k => columns.add(k));
                    }
                });
                
                // Exclude internal fields from rendering
                const colsArr = Array.from(columns).filter(k => k !== '#text' && k !== '_TYPE_');
                
                if (colsArr.length === 0) {
                    // Simple string list
                    html += '<ul class="data-group">' + items.map(w => {
                        let text = w.data;
                        if (typeof w.data === 'object' && w.data !== null) {
                            text = w.data['#text'] || JSON.stringify(w.data);
                        }
                        return \`<li class="searchable-row" style="cursor: pointer;" data-search="\${escapeHtml(text)}" title="Double click to view in raw XML">\${escapeHtml(text)}</li>\`;
                    }).join('') + '</ul>';
                    html += '</div>';
                    continue;
                }

                html += '<div class="data-group" style="margin-bottom: 25px;"><table><thead><tr>';
                colsArr.forEach(col => {
                    html += \`<th>\${escapeHtml(col)}</th>\`;
                });
                html += '</tr></thead><tbody>';

                items.forEach((wrapped) => {
                    const row = wrapped.data;
                    let searchStr = '';
                    if (row['#text']) {
                        searchStr = row['#text'];
                    } else {
                        // Recursive function to find the first valid string in a nested object
                        const findFirstString = (obj) => {
                            if (typeof obj === 'string' && obj.trim().length > 0) return obj;
                            if (typeof obj === 'object' && obj !== null) {
                                for (const key in obj) {
                                    if (key === '_TYPE_') continue;
                                    const res = findFirstString(obj[key]);
                                    if (res) return res;
                                }
                            }
                            return '';
                        };

                        // Find first valid string to search for in raw XML
                        for (const col of colsArr) {
                            const val = findFirstString(row[col]);
                            if (val) {
                                searchStr = val;
                                break;
                            }
                        }
                    }
                    }
                    html += \`<tr class="searchable-row" style="cursor: pointer;" data-search="\${escapeHtml(searchStr)}" title="Double click to view in raw XML">\`;
                    colsArr.forEach(col => {
                        const val = row[col];
                        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
                            const isArray = Array.isArray(val);
                            const count = isArray ? val.length : 1;
                            html += \`<td><a class="drill-link" data-row="\${wrapped.origIdx}" data-col="\${escapeHtml(col)}">\${count} \${count === 1 ? 'item' : 'items'} ↗</a></td>\`;
                        } else {
                            html += \`<td>\${val !== undefined ? escapeHtml(val) : ''}</td>\`;
                        }
                    });
                    html += '</tr>';
                });
                html += '</tbody></table></div>';
                
                html += '</div>'; // End data-group-container
            }
            
            container.innerHTML = html;
            
            const searchContainer = document.getElementById('tableSearchContainer');
            if (searchContainer) searchContainer.style.display = 'block';
            
            // Re-apply existing search term if any
            const searchInput = document.getElementById('tableSearch');
            if (searchInput && searchInput.value) {
                searchInput.dispatchEvent(new Event('input'));
            }

            // Setup Drill-down listeners
            container.querySelectorAll('.drill-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    const rowIdx = parseInt(e.target.dataset.row);
                    const col = e.target.dataset.col;
                    const nestedData = listData[rowIdx][col];
                    
                    navigationHistory.push({
                        name: pathName + (listData.length > 1 ? \`[\${rowIdx}]\` : ''),
                        data: listData,
                        searchTerm: searchInput ? searchInput.value : ''
                    });
                    
                    if (searchInput) searchInput.value = '';
                    
                    const dataToRender = Array.isArray(nestedData) ? nestedData : [nestedData];
                    renderTableView(dataToRender, col);
                });
            });

            // Setup double-click to view source
            container.querySelectorAll('.searchable-row').forEach(row => {
                row.addEventListener('dblclick', (e) => {
                    // Prevent triggering if they double clicked a drill-link
                    if (e.target.classList.contains('drill-link')) return;
                    
                    const searchStr = e.currentTarget.dataset.search;
                    if (searchStr && lastRawXml) {
                        vscode.postMessage({
                            command: 'openInEditor',
                            content: lastRawXml,
                            language: 'xml',
                            searchString: searchStr
                        });
                    }
                });
            });
        }
    </script>
</body>
</html>`;
    }
}
