import React, { useEffect, useState } from "react";
import { vscode } from "./utilities/vscode";
import ScopeTree from "./components/ScopeTree";
import DetailsPanel from "./components/DetailsPanel";

const buildFolderTree = (files: any[]) => {
  if (!files || files.length === 0) return [];
  
  const paths = files.map(f => f.id.replace(/\\/g, '/'));
  let commonPrefix = '';
  if (paths.length > 0) {
    const splitPaths = paths.map(p => p.split('/'));
    const minLen = Math.min(...splitPaths.map(p => p.length));
    let i = 0;
    while (i < minLen - 1) { // -1 to not include the filename itself
      const part = splitPaths[0][i];
      if (splitPaths.every(p => p[i] === part)) {
        i++;
      } else {
        break;
      }
    }
    commonPrefix = splitPaths[0].slice(0, i).join('/') + '/';
  }
  
  const root: any = { children: [] };
  
  for (const file of files) {
    const normalizedPath = file.id.replace(/\\/g, '/');
    const relPath = normalizedPath.startsWith(commonPrefix) ? normalizedPath.substring(commonPrefix.length) : normalizedPath;
    
    const parts = relPath.split('/').map((p: string) => {
      try { return decodeURIComponent(p); } catch { return p; }
    });
    const fileName = parts.pop()!;
    
    file.name = fileName; 
    
    let current = root;
    for (const part of parts) {
      let existing = current.children.find((c: any) => c.kind === 'Folder' && c.name === part);
      if (!existing) {
        existing = {
          id: current.id ? `${current.id}/${part}` : part,
          name: part,
          kind: 'Folder',
          children: [],
          hasChildren: true,
          _childrenLoaded: true
        };
        current.children.push(existing);
      }
      current = existing;
    }
    current.children.push(file);
  }
  
  return root.children;
};

const App = () => {
  const [treeData, setTreeData] = useState<any[] | null>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(["global"]);
  const hashHistoryRef = React.useRef<string[]>([]);
  const [canGoBack, setCanGoBack] = useState(false);

  const handleBack = () => {
    if (hashHistoryRef.current.length > 1) {
      hashHistoryRef.current.pop(); // Remove current hash
      const prevHash = hashHistoryRef.current[hashHistoryRef.current.length - 1];
      window.location.hash = '#' + prevHash;
      setCanGoBack(hashHistoryRef.current.length > 1);
    }
  };
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.command) {
        case "render":
          setTreeData(message.data);
          vscode.setState({ treeData: message.data });
          break;
        case "symbolsResult":
          window.dispatchEvent(new CustomEvent('symbolsResult', { detail: message }));
          break;
        case "childrenResult":
          setTreeData(prev => {
            if (!prev) return prev;
            const newTree = JSON.parse(JSON.stringify(prev));
            
            const updateNode = (nodes: any[]): boolean => {
              for (const node of nodes) {
                if (node.id === message.scopeId) {
                  if (node.kind === 'Project' || message.scopeId === 'project') {
                    node.children = [
                      {
                        id: 'project_files',
                        name: 'Files',
                        kind: 'Folder',
                        children: buildFolderTree(message.children),
                        hasChildren: true,
                        _childrenLoaded: true
                      }
                    ];
                  } else {
                    node.children = message.children;
                  }
                  node._childrenLoaded = true;
                  return true;
                }
                if (node.children && updateNode(node.children)) {
                  return true;
                }
              }
              return false;
            };
            
            updateNode(newTree);
            vscode.setState({ treeData: newTree });
            return newTree;
          });
          break;
      }
    };

    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      
      const currentHistory = hashHistoryRef.current;
      if (currentHistory.length >= 2 && currentHistory[currentHistory.length - 2] === hash) {
        // We went back natively
        currentHistory.pop();
      } else if (currentHistory[currentHistory.length - 1] !== hash) {
        // Normal forward navigation
        currentHistory.push(hash);
      }
      setCanGoBack(currentHistory.length > 1);
      
      const parts = hash.split('/');
      if (parts.length >= 2) {
        const scopeId = decodeURIComponent(parts[0]);
        const kind = decodeURIComponent(parts.slice(1).join('/')); // In case kind has slashes
        const payload = { _type: 'symbol-group', scopeId, kind };
        
        vscode.postMessage({
          command: "getSymbols",
          scopeId: scopeId,
          kind: kind,
          page: 1,
          limit: Number.MAX_SAFE_INTEGER,
          query: ''
        });
        setSelectedNode(payload);
        setBreadcrumbs([scopeId, kind.replace('Category', '')]);
      }
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("goBack", handleBack);

    vscode.postMessage({ command: "ready" });

    const state = vscode.getState() as { treeData?: any[] };
    if (state?.treeData) {
      setTreeData(state.treeData);
    }
    
    // Check initial hash
    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("goBack", handleBack);
    };
  }, []);

  const handleNodeSelect = (node: any, path: string[]) => {
    // Clear history stack when navigating from the main sidebar tree
    hashHistoryRef.current = [];
    setCanGoBack(false);
    setSelectedNode(node);
    setBreadcrumbs(path);
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>SCOPE TREE</h3>
          <div className="breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>{breadcrumbs.join(" > ")}</span>
          </div>
        </div>
        <div className="tree-container">
          {treeData ? (
            treeData.map((rootNode: any, idx: number) => (
              <ScopeTree 
                key={idx}
                data={rootNode} 
                onSelectNode={handleNodeSelect} 
              />
            ))
          ) : (
            <div className="loading" style={{ padding: 10 }}>Loading scopes...</div>
          )}
        </div>
      </div>
      <div className="main-panel">
        {selectedNode ? (
          <DetailsPanel node={selectedNode} canGoBack={canGoBack} />
        ) : (
          <div className="empty-state">Select a node to view details</div>
        )}
      </div>
    </div>
  );
};

export default App;
