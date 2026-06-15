(function () {
    // Listen for messages from the extension
    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'render') {
            renderTree(message.data);
        }
    });

    function renderTree(tree) {
        const container = document.getElementById('tree-container');
        if (!tree) {
            container.innerHTML = 'No scope data available.';
            return;
        }

        let html = '';
        if (tree.globalScope) {
            html += generateNodeHtml(tree.globalScope, false);
        }
        if (tree.projectScope) {
            html += generateNodeHtml(tree.projectScope, true);
        }

        container.innerHTML = html;
    }

    function generateNodeHtml(node, open = false) {
        if (!node) return '';

        let symbolsHtml = '';
        if (node.symbols && node.symbols.length > 0) {
            symbolsHtml = '<div>' + node.symbols.map(s => {
                const defSpan = s.definitionType ? `<span class="symbol-def">(${escapeHtml(s.definitionType)})</span>` : '';
                return `<div class="symbol">${escapeHtml(s.name)} <span class="symbol-kind">[${escapeHtml(s.kind)}]</span>${defSpan}</div>`;
            }).join('') + '</div>';
        }

        let childrenHtml = '';
        if (node.children && node.children.length > 0) {
            childrenHtml = node.children.map(c => generateNodeHtml(c)).join('');
        }

        let parentsHtml = '';
        if (node.structuralParents && node.structuralParents.length > 0) {
            parentsHtml = `<span style="margin-left: 10px; font-size: 0.85em; color: var(--vscode-descriptionForeground);">Parents: ${escapeHtml(node.structuralParents.join(', '))}</span>`;
        }
        
        let childrenDepsHtml = '';
        if (node.structuralChildren && node.structuralChildren.length > 0) {
            childrenDepsHtml = `<span style="margin-left: 10px; font-size: 0.85em; color: var(--vscode-descriptionForeground);">Children: ${escapeHtml(node.structuralChildren.join(', '))}</span>`;
        }

        let usesHtml = '';
        if (node.usedDefinitions && node.usedDefinitions.length > 0) {
            usesHtml = `<span style="margin-left: 10px; font-size: 0.85em; color: var(--vscode-descriptionForeground); font-style: italic;">Uses: ${escapeHtml(node.usedDefinitions.join(', '))}</span>`;
        }

        return `
<details ${open ? 'open' : ''}>
    <summary>${escapeHtml(node.id)} <span class="node-kind">[${escapeHtml(node.kind)}]</span>${parentsHtml}${childrenDepsHtml}${usesHtml}</summary>
    ${symbolsHtml}
    ${childrenHtml}
</details>`;
    }

    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
             .replace(/&/g, "&amp;")
             .replace(/</g, "&lt;")
             .replace(/>/g, "&gt;")
             .replace(/"/g, "&quot;")
             .replace(/'/g, "&#039;");
    }
}());
