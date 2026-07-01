import React, { useEffect, useState } from "react";
import { vscode } from './utils/vscode';
import ScopeTree from "./components/ScopeTree";
import DetailsPanel from "./components/DetailsPanel";
import { ScopeNode, WebviewMessage } from "./types";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { buildFolderTree } from './utils/treeUtils';

const App = () => {
  const [treeData, setTreeData] = useState<ScopeNode[] | null>(null);
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
      const message = event.data as WebviewMessage;
      switch (message.command) {
        case "render":
          setTreeData(message.data);
          vscode.setState({ treeData: message.data });
          break;
        case "symbolsResult":
          window.dispatchEvent(new CustomEvent('symbolsResult', { detail: message }));
          break;
        case "scopeNodeResult":
          window.dispatchEvent(new CustomEvent('scopeNodeResult', { detail: message }));
          break;
        case "childrenResult":
          setTreeData(prev => {
            if (!prev) return prev;
            const newTree = structuredClone(prev);
            
            const updateNode = (nodes: ScopeNode[]): boolean => {
              for (const node of nodes) {
                if (node.id === message.scopeId && message.children) {
                  if (node.kind === 'FilesCategory' || message.scopeId === 'project_Files') {
                    node.children = buildFolderTree(message.children);
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
          limit: 5000,
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
    <ErrorBoundary>
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
              treeData.map((rootNode: ScopeNode, idx: number) => (
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
            <DetailsPanel 
              node={selectedNode} 
              canGoBack={canGoBack} 
              onNodeSelect={(n, p) => handleNodeSelect(n, p)} 
              breadcrumbs={breadcrumbs} 
            />
          ) : (
            <div className="empty-state">Select a node to view details</div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default App;
