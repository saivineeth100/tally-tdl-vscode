
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
                    console.log('Webview: showResponse called. Has fileUrl:', !!message.fileUrl, 'Body length:', message.xml ? message.xml.length : 0);
                    renderResponse(message.xml, message.fileUrl, message.elapsedMs);
                    break;
            }
        });

        function showTableMessage(msg) {
            const container = document.getElementById('tableContainer');
            if (container) {
                container.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--vscode-descriptionForeground);">${escapeHtml(msg)}</div>`;
            }
            const breadcrumb = document.getElementById('breadcrumb');
            if (breadcrumb) breadcrumb.style.display = 'none';
            const searchContainer = document.getElementById('tableSearchContainer');
            if (searchContainer) searchContainer.style.display = 'none';
        }

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
        
        async function renderResponse(xml, fileUrl, elapsedMs) {
    document.getElementById('rawView').textContent = xml ? xml : 'Data loaded from stream (Raw view skipped for large files).';
    if (xml) {
        lastRawXml = xml;
    } else {
        lastRawXml = 'File too large to display raw. Try searching in the table!';
    }
    
    fullParsedData = null;
    lastTableData = '';
    
    try {
        const parser = sax.parser(true, { trim: true });
        let stack = [];
        let rootObj = null;
        
        parser.onopentag = function(node) {
            let obj = { _TYPE_: node.name, _CHILD_NODES_: [] };
            for (let key in node.attributes) {
                if (key.toUpperCase() !== 'TYPE') {
                    obj[key] = node.attributes[key];
                }
            }
            if (stack.length === 0) {
                rootObj = obj;
            } else {
                stack[stack.length - 1]._CHILD_NODES_.push(obj);
            }
            stack.push(obj);
        };
        
        parser.ontext = function(text) {
             let textStr = text.trim();
             if (!textStr) return;
             if (stack.length > 0) {
                 let curr = stack[stack.length - 1];
                 curr._CHILD_NODES_.push({ isText: true, val: textStr });
             }
        };
        
        parser.onclosetag = function() {
            stack.pop();
        };

        if (fileUrl) {
            const res = await fetch(fileUrl);
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            while(true) {
                const {done, value} = await reader.read();
                if (done) break;
                // Parse chunk
                // Sanitize chunk for invalid control chars
                let chunkStr = decoder.decode(value, { stream: true });
                chunkStr = chunkStr.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
                parser.write(chunkStr);
            }
            parser.close();
        } else {
            let sanitizedXml = xml.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
            parser.write(sanitizedXml).close();
        }
        
        // Convert SAX tree into the Table structure
        function convertNode(node) {
            const obj = {};
            obj['_TYPE_'] = node._TYPE_;
            
            // Attributes
            for (const key in node) {
                if (key !== '_TYPE_' && key !== '_CHILD_NODES_') {
                    obj[key] = node[key];
                }
            }
            
            let textValue = '';
            for (const child of node._CHILD_NODES_) {
                if (child.isText) {
                    textValue += child.val;
                } else {
                    const childName = child._TYPE_;
                    let valToStore;
                    
                    if (child._CHILD_NODES_.length === 0 || (child._CHILD_NODES_.length === 1 && child._CHILD_NODES_[0].isText)) {
                        valToStore = child._CHILD_NODES_.length === 1 ? child._CHILD_NODES_[0].val : '';
                        const hasAttrs = Object.keys(child).length > 2; // _TYPE_ and _CHILD_NODES_
                        if (valToStore === '' && !hasAttrs) continue;
                    } else {
                        valToStore = convertNode(child);
                        if (Object.keys(valToStore).length === 1 && valToStore['_TYPE_']) continue;
                    }
                    
                    if (childName.includes('.LIST')) {
                        if (!obj[childName]) obj[childName] = [];
                        obj[childName].push(valToStore);
                    } else {
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
            if (textValue && Object.keys(obj).length === 1) {
                obj['#text'] = textValue;
            }
            return obj;
        }

        if (!rootObj) {
            throw new Error("No XML root found");
        }
        
        // Find top level lists
        function findLists(node) {
            let lists = [];
            if (node._TYPE_ === 'COLLECTION' || node._TYPE_ === 'TALLYMESSAGE' || node._TYPE_ === 'LINEERROR' || node._TYPE_ === 'IMPORTRESULT') {
                return [node];
            }
            for (let child of node._CHILD_NODES_) {
                if (!child.isText) {
                    lists = lists.concat(findLists(child));
                }
            }
            return lists;
        }
        
        let targetNodes = findLists(rootObj);
        
        if (targetNodes.length > 0) {
            // Unpack them
            let items = [];
            targetNodes.forEach(t => {
                if (t._TYPE_ === 'IMPORTRESULT' || t._TYPE_ === 'LINEERROR') {
                    items.push(convertNode(t));
                } else {
                    t._CHILD_NODES_.forEach(c => {
                        if (!c.isText) items.push(convertNode(c));
                    });
                }
            });
            fullParsedData = items;
            navigationHistory = [];
            const title = (new Set(items.map(i => i._TYPE_)).size > 1) ? 'MIXED DATA' : (items[0] ? items[0]._TYPE_ : 'Data');
            renderTableView(fullParsedData, title);
        } else {
            // Generic
            let items = [];
            rootObj._CHILD_NODES_.forEach(c => {
                if (!c.isText) items.push(convertNode(c));
            });
            if (items.length > 0) {
                fullParsedData = items;
                navigationHistory = [];
                const title = (new Set(items.map(i => i._TYPE_)).size > 1) ? 'GENERIC DATA' : items[0]._TYPE_;
                renderTableView(fullParsedData, title);
            } else {
                showTableMessage('No parseable data nodes found.');
            }
        }
        
        // Switch to table tab automatically
        const tableTab = document.querySelector('.tab[data-target="tableView"]');
        if (tableTab) tableTab.click();
    } catch (e) {
        showTableMessage('Error parsing XML with SAX: ' + e.message);
        vscode.postMessage({ command: 'logError', message: e.message, stack: e.stack });
    }
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
                bcHtml = `<span>${pathName} (${listData.length} items)</span>`;
            } else {
                bcHtml = `<span class="breadcrumb-item" data-idx="-1">Root</span>`;
                for (let i = 0; i < navigationHistory.length; i++) {
                    bcHtml += ` > <span class="breadcrumb-item" data-idx="${i}">${navigationHistory[i].name}</span>`;
                }
                bcHtml += ` > <span>${pathName} (${listData.length} items)</span>`;
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
                    html += `<h3 class="section-header" data-type="${escapeHtml(type).toLowerCase()}" style="margin-top: 20px; margin-bottom: 10px; color: var(--vscode-editorInfo-foreground); font-weight: 600;">${escapeHtml(type)} (${items.length} items)</h3>`;
                } else {
                    html += `<div class="section-header" data-type="${escapeHtml(type).toLowerCase()}" style="display:none;"></div>`;
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
                        return `<li class="searchable-row" style="cursor: pointer;" data-search="${escapeHtml(text)}" title="Double click to view in raw XML">${escapeHtml(text)}</li>`;
                    }).join('') + '</ul>';
                    html += '</div>';
                    continue;
                }

                html += '<div class="data-group" style="margin-bottom: 25px;"><table><thead><tr>';
                colsArr.forEach(col => {
                    html += `<th>${escapeHtml(col)}</th>`;
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
                    html += `<tr class="searchable-row" style="cursor: pointer;" data-search="${escapeHtml(searchStr)}" title="Double click to view in raw XML">`;
                    colsArr.forEach(col => {
                        const val = row[col];
                        if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
                            const isArray = Array.isArray(val);
                            const count = isArray ? val.length : 1;
                            html += `<td><a class="drill-link" data-row="${wrapped.origIdx}" data-col="${escapeHtml(col)}">${count} ${count === 1 ? 'item' : 'items'} ↗</a></td>`;
                        } else {
                            html += `<td>${val !== undefined ? escapeHtml(val) : ''}</td>`;
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
                        name: pathName + (listData.length > 1 ? `[${rowIdx}]` : ''),
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
    