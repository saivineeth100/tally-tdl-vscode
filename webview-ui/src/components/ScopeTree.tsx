import React, { useState } from "react";
import { vscode } from '../utils/vscode';
import { ScopeNode } from "../types";

interface ScopeTreeProps {
  data: ScopeNode;
  onSelectNode: (node: any, path: string[]) => void;
}

const TreeNode: React.FC<{
  node: ScopeNode;
  depth: number;
  isOpen: boolean;
  parentPath: string[];
  parentScopeId?: string;
  onSelectNode: (node: any, path: string[]) => void;
  isSymbolGroup?: boolean;
  symbolCount?: number;
}> = ({ node, depth, isOpen: defaultOpen, parentPath, parentScopeId, onSelectNode, isSymbolGroup, symbolCount }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const currentId = isSymbolGroup ? node.kind : (node.id || node.name || "Unknown");
  const displayName = isSymbolGroup ? currentId : (node.name || currentId);
  const currentPath = [...parentPath, displayName];
  
  // Use node.hasChildren if available, otherwise fallback to checking actual children length
  const hasChildren = node.hasChildren || (node.children && node.children.length > 0) || (node.symbolGroups && node.symbolGroups.length > 0);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (hasChildren) {
      const willOpen = !isOpen;
      setIsOpen(willOpen);
      
      // If we are opening, and we don't have children data loaded yet, fetch it!
      if (willOpen && node.hasChildren && !node._childrenLoaded) {
        vscode.postMessage({
          command: "getChildren",
          scopeId: currentId
        });
      }
    }
    
    if (isSymbolGroup && parentScopeId) {
      window.location.hash = `#${parentScopeId}/${node.kind}`;
      onSelectNode({ _type: 'symbol-group', kind: node.kind, scopeId: parentScopeId }, currentPath);
    } else if (node.kind === 'AttributesCategory' || node.kind === 'SchemasCategory') {
      window.location.hash = `#${node.id}/${node.kind}`;
      onSelectNode({ _type: 'symbol-group', kind: node.kind, scopeId: node.id }, currentPath);
    } else if (node.kind === 'Structural Hierarchy' || node.kind === 'DefinitionsCategory' || node.kind === 'FilesCategory' || node.kind === 'Folder') {
      // These are just grouping folders, no need to navigate to them
    } else {
      window.location.hash = `#${node.id}`;
      onSelectNode({ _type: 'scope', scopeId: node.id }, currentPath);
    }
  };

  const renderChildren = () => {
    if (!isOpen) return null;
    
    let childrenElements: React.ReactNode[] = [];
    
    if (node.children) {
      childrenElements = childrenElements.concat(
        node.children.map((child: ScopeNode, idx: number) => (
          <TreeNode 
            key={`child-${idx}`} 
            node={child} 
            depth={depth + 1} 
            isOpen={false} 
            parentPath={currentPath} 
            parentScopeId={currentId}
            onSelectNode={onSelectNode} 
          />
        ))
      );
    }

    if (node.symbolGroups) {
      const sortedGroups = [...node.symbolGroups].sort((a: any, b: any) => a.kind.localeCompare(b.kind));
      childrenElements = childrenElements.concat(
        sortedGroups.map((group: any, idx: number) => (
          <TreeNode 
            key={`group-${idx}`} 
            node={group} 
            depth={depth + 1} 
            isOpen={false} 
            parentPath={currentPath} 
            parentScopeId={currentId}
            onSelectNode={onSelectNode}
            isSymbolGroup={true}
            symbolCount={group.count}
          />
        ))
      );
    }
    
    // If it's supposed to have children but they haven't been loaded yet, show loading indicator
    if (node.hasChildren && !node._childrenLoaded) {
       childrenElements.push(
         <div key="loading" style={{ padding: '4px 16px', fontSize: 12, color: 'var(--muted-text)', fontStyle: 'italic', marginLeft: (depth + 1) * 16 }}>
           Loading...
         </div>
       );
    }
    
    return (
      <div className={`tree-children ${isOpen ? 'open' : ''}`}>
        {childrenElements}
      </div>
    );
  };

  let displayNodeKind = node.kind || '';
  if (displayNodeKind.endsWith('Category')) displayNodeKind = displayNodeKind.replace('Category', '');
  
  let displayNodeId = displayName;
  if (displayNodeId.endsWith('_Attributes')) displayNodeId = 'Attributes';
  if (displayNodeId.endsWith('_Schemas')) displayNodeId = 'Schemas';
  if (displayNodeId.endsWith('_Definitions')) displayNodeId = 'Definitions';
  if (displayNodeId.endsWith('_Structural')) displayNodeId = 'Structural Hierarchy';
  if (displayNodeId.endsWith('_Files')) displayNodeId = 'Files';
  
  if (isSymbolGroup) {
    if (displayNodeId.startsWith('Attribute_')) displayNodeId = displayNodeId.substring(10);
    if (displayNodeId.startsWith('Schema_')) displayNodeId = displayNodeId.substring(7);
  }

  const showBadge = displayNodeKind && displayNodeKind.toLowerCase() !== displayNodeId.toLowerCase() && !isSymbolGroup;

  return (
    <div className="tree-node">
      <div 
        className={`tree-item ${isOpen ? 'open' : ''} ${isSymbolGroup ? 'symbol-group' : ''}`} 
        onClick={handleClick}
        data-type={isSymbolGroup ? 'symbol-group' : 'scope'}
      >
        {Array.from({ length: depth }).map((_, i) => (
          <span key={i} className="indent" />
        ))}
        <span className={`caret ${hasChildren ? "has-children" : ""}`}>
          {hasChildren ? (isOpen ? "▼" : "▶") : ""}
        </span>
        <span className="node-label" style={{ color: isSymbolGroup ? '#c586c0' : 'inherit' }}>
          {displayNodeId}
        </span>
        {showBadge && <span className="badge">{displayNodeKind}</span>}
        {isSymbolGroup && <span className="badge">{symbolCount}</span>}
      </div>
      {renderChildren()}
    </div>
  );
};

const ScopeTree: React.FC<ScopeTreeProps> = ({ data, onSelectNode }) => {
  if (!data) return null;
  return <TreeNode node={data} depth={0} isOpen={false} parentPath={[]} parentScopeId={data.id || 'global'} onSelectNode={onSelectNode} />;
};

export default ScopeTree;
