(function () {
    let treeData = null;
    
    // Pagination state
    let currentScopeId = null;
    let currentKind = null;
    let currentPage = 1;
    let currentLimit = 100;
    let currentQuery = '';
    let isFetching = false;
    let reqIdCounter = 0;

    // Acquire VS Code API to persist state
    const vscode = typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : { 
        postMessage: console.log, 
        setState: () => {}, 
        getState: () => null 
    };

    // Expose post message for HTML onclick handlers
    window.vscode_postMessage = function(command, text) {
        vscode.postMessage({ command, text });
    };

    // Restore state if it exists
    const oldState = vscode.getState();
    if (oldState && oldState.treeData) {
        treeData = oldState.treeData;
        // Small timeout to ensure DOM is ready
        setTimeout(() => renderTree(treeData), 0);
    }

    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'render') {
            treeData = message.data;
            
            // Save state for when webview is moved or reloaded
            vscode.setState({ treeData });
            
            renderTree(treeData);
        } else if (message.command === 'symbolsResult') {
            if (message.reqId === reqIdCounter) {
                isFetching = false;
                renderSymbols(message.data);
            }
        }
    });

    function renderTree(tree) {
        const container = document.getElementById('tree-container');
        if (!tree) {
            container.innerHTML = '<div class="empty-state">No scope data available.</div>';
            return;
        }

        let html = '';
        
        if (tree.globalScope) {
            const globalNode = { ...tree.globalScope };
            if (tree.projectScope) {
                globalNode.children = globalNode.children || [];
                if (!globalNode.children.some(c => c.id === tree.projectScope.id)) {
                    globalNode.children.unshift(tree.projectScope);
                }
            }
            html += generateTreeHtml(globalNode, 0, true, []);
        } else if (tree.projectScope) {
            html += generateTreeHtml(tree.projectScope, 0, true, []);
        }

        container.innerHTML = html;
        attachTreeListeners();
        
        if (tree.globalScope) {
            selectNode(tree.globalScope, [tree.globalScope.id || 'global']);
        }
    }

    function generateTreeHtml(node, depth, isOpen, parentPath) {
        if (!node) return '';

        const currentPath = [...parentPath, node.id || node.name];
        const pathStr = JSON.stringify(currentPath).replace(/"/g, '&quot;');
        
        let childrenHtml = '';
        let hasChildren = false;

        if (node.children && node.children.length > 0) {
            hasChildren = true;
            childrenHtml += node.children.map(c => generateTreeHtml(c, depth + 1, false, currentPath)).join('');
        }
        
        if (node.symbolGroups && node.symbolGroups.length > 0) {
            hasChildren = true;
            
            // Sort by kind alphabetically
            const sortedGroups = [...node.symbolGroups].sort((a, b) => a.kind.localeCompare(b.kind));
            
            childrenHtml += sortedGroups.map(group => {
                const pluralKind = group.kind;
                const groupPath = [...currentPath, pluralKind];
                const groupPathStr = JSON.stringify(groupPath).replace(/"/g, '&quot;');
                
                return `
                    <div class="tree-node">
                        <div class="tree-item symbol-group" data-path="${groupPathStr}" data-type="symbol-group" data-scope-id="${escapeHtml(node.id || node.name)}" data-kind="${escapeHtml(pluralKind)}">
                            ${'<span class="indent"></span>'.repeat(depth + 1)}
                            <span class="caret"></span>
                            <span class="node-label" style="color: #c586c0;">${escapeHtml(pluralKind)}</span>
                            <span class="badge">${group.count}</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        const caret = hasChildren ? (isOpen ? '▼' : '▶') : '';
        const nodeBadge = node.kind ? `<span class="badge">${escapeHtml(node.kind)}</span>` : '';

        return `
            <div class="tree-node">
                <div class="tree-item ${isOpen ? 'open' : ''}" data-path="${pathStr}" data-type="scope" data-raw='${JSON.stringify({id: node.id, kind: node.kind, structuralParents: node.structuralParents, usedDefinitions: node.usedDefinitions}).replace(/'/g, "&#39;").replace(/"/g, '&quot;')}'>
                    ${'<span class="indent"></span>'.repeat(depth)}
                    <span class="caret ${hasChildren ? 'has-children' : ''}">${caret}</span>
                    <span class="node-label">${escapeHtml(node.id || node.name)}</span>
                    ${nodeBadge}
                </div>
                <div class="tree-children ${isOpen ? 'open' : ''}">
                    ${childrenHtml}
                </div>
            </div>
        `;
    }

    function attachTreeListeners() {
        document.querySelectorAll('.tree-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const caret = item.querySelector('.caret');
                const childrenContainer = item.nextElementSibling;
                
                if (childrenContainer && childrenContainer.classList.contains('tree-children')) {
                    const isOpen = childrenContainer.classList.contains('open');
                    if (isOpen) {
                        childrenContainer.classList.remove('open');
                        if (caret) caret.textContent = '▶';
                    } else {
                        childrenContainer.classList.add('open');
                        if (caret) caret.textContent = '▼';
                    }
                }

                document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
                item.classList.add('selected');
                
                const pathStr = item.getAttribute('data-path');
                const path = JSON.parse(pathStr.replace(/&quot;/g, '"'));
                const type = item.getAttribute('data-type');
                
                updateBreadcrumbs(path);

                if (type === 'symbol-group') {
                    const scopeId = item.getAttribute('data-scope-id');
                    const kind = item.getAttribute('data-kind');
                    fetchSymbols(scopeId, kind, 1, '');
                } else {
                    let nodeData = {};
                    const rawDataStr = item.getAttribute('data-raw');
                    if (rawDataStr) {
                        try {
                            nodeData = JSON.parse(rawDataStr.replace(/&quot;/g, '"').replace(/&#39;/g, "'"));
                        } catch(err){}
                    }
                    updateMainPanel(nodeData, type, path);
                }
            });
        });
    }

    function selectNode(node, path) {
        const pathStr = JSON.stringify(path).replace(/"/g, '&quot;');
        const el = document.querySelector(`.tree-item[data-path="${pathStr}"]`);
        if (el) {
            el.click();
        } else {
            updateBreadcrumbs(path);
            updateMainPanel(node, 'scope', path);
        }
    }

    function updateBreadcrumbs(path) {
        const container = document.getElementById('breadcrumbs');
        container.innerHTML = path.map((p, i) => 
            i === path.length - 1 ? `<span class="active">${escapeHtml(p)}</span>` : `<span>${escapeHtml(p)}</span>`
        ).join(' &gt; ');
    }

    function fetchSymbols(scopeId, kind, page, query) {
        currentScopeId = scopeId;
        currentKind = kind;
        currentPage = page;
        currentQuery = query;
        isFetching = true;
        reqIdCounter++;

        const panel = document.getElementById('main-panel');
        panel.innerHTML = `<div class="spinner"></div><div class="loading">Loading symbols...</div>`;

        vscode.postMessage({
            command: 'getSymbols',
            scopeId,
            kind,
            page,
            limit: currentLimit,
            query,
            reqId: reqIdCounter
        });
    }

    // Export so we can call it from HTML
    window.changePage = function(delta) {
        if (!isFetching) {
            fetchSymbols(currentScopeId, currentKind, currentPage + delta, currentQuery);
        }
    };

    window.searchSymbols = function(query) {
        // debounce can be added here
        fetchSymbols(currentScopeId, currentKind, 1, query);
    };

    function renderSymbols(data) {
        const panel = document.getElementById('main-panel');
        const { symbols, totalCount, page, limit, kind } = data;
        
        const totalPages = Math.ceil(totalCount / limit) || 1;
        const startIdx = (page - 1) * limit + 1;
        const endIdx = Math.min(page * limit, totalCount);

        const listHtml = symbols.length > 0 ? `
            <div class="references-list">
                ${symbols.map(s => `
                    <div class="reference-item" style="cursor:pointer;" onclick="vscode_postMessage('goToDefinition', '${escapeHtml(s.name)}')">
                        <div>
                            <span class="ref-path">${escapeHtml(s.name)}</span>
                        </div>
                        <span class="badge">${escapeHtml(s.definitionType || s.kind || 'Unknown')}</span>
                    </div>
                `).join('')}
            </div>
        ` : `<div class="empty-state">No symbols found</div>`;

        const searchHtml = `
            <div class="toolbar">
                <div class="search-box">
                    <input type="text" class="search-input" placeholder="Search ${escapeHtml(kind)}..." value="${escapeHtml(currentQuery)}" onkeyup="if(event.key === 'Enter') window.searchSymbols(this.value)">
                </div>
                <div class="pagination">
                    <span class="pagination-text">${totalCount > 0 ? `${startIdx}-${endIdx} of ${totalCount}` : '0 items'}</span>
                    <button class="btn-icon" onclick="window.changePage(-1)" ${page <= 1 ? 'disabled' : ''}>&lt;</button>
                    <button class="btn-icon" onclick="window.changePage(1)" ${page >= totalPages ? 'disabled' : ''}>&gt;</button>
                </div>
            </div>
        `;

        panel.innerHTML = `
            <div class="header-row">
                <div>
                    <h1 class="node-title">${escapeHtml(kind)}</h1>
                    <div class="node-subtitle">under ${escapeHtml(currentScopeId)}</div>
                </div>
            </div>
            ${searchHtml}
            <div class="section" style="margin-top: 16px;">
                ${listHtml}
            </div>
        `;
    }

    function updateMainPanel(data, type, path) {
        const panel = document.getElementById('main-panel');
        
        const name = escapeHtml(data.id || data.name || path[path.length - 1]);
        const kind = escapeHtml(data.kind || type || 'Unknown');
        
        let propertiesHtml = '';
        let referencesHtml = '';

        let parents = data.structuralParents && data.structuralParents.length ? data.structuralParents.join(', ') : (path.length > 1 ? path[path.length - 2] : 'None');
        
        propertiesHtml = `
            <div class="card">
                <span class="card-label">TYPE</span>
                <span class="card-value">${kind} Scope</span>
            </div>
            <div class="card">
                <span class="card-label">PARENT</span>
                <span class="card-value">${escapeHtml(parents)}</span>
            </div>
        `;

        const refs = data.usedDefinitions || [];
        if (refs.length > 0) {
            const refItems = refs.map(r => `
                <div class="reference-item">
                    <div>
                        <span class="ref-path">${escapeHtml(r)}</span>
                    </div>
                    <span class="badge">Use</span>
                </div>
            `).join('');

            referencesHtml = `
                <div class="section">
                    <h3 class="section-title">REFERENCES (${refs.length})</h3>
                    <div class="references-list">
                        ${refItems}
                        ${refs.length > 5 ? `<button class="btn-secondary">View all ${refs.length} references</button>` : ''}
                    </div>
                </div>
            `;
        } else {
            referencesHtml = `
                <div class="section">
                    <h3 class="section-title">REFERENCES (0)</h3>
                    <div class="references-list">
                        <div class="reference-item" style="color: var(--muted-text); justify-content: center;">No references found</div>
                    </div>
                </div>
            `;
        }

        panel.innerHTML = `
            <div class="header-row">
                <div>
                    <h1 class="node-title">${name}</h1>
                    <div class="node-subtitle">${kind} • ${escapeHtml(path.join('/'))}</div>
                </div>
            </div>

            <div class="section">
                <h3 class="section-title">SCOPE PROPERTIES</h3>
                <div class="cards-grid">
                    ${propertiesHtml}
                </div>
            </div>

            ${referencesHtml}
        `;
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return String(unsafe)
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }

}());
