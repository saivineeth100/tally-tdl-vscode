import React, { useState, useEffect } from "react";
import { vscode } from '../utils/vscode';
import { SymbolsResult } from "../types";

interface SchemaTreeNodeProps {
  prop: any;
  scopeId: string;
}

export const SchemaTreeNode: React.FC<SchemaTreeNodeProps> = ({ prop, scopeId }) => {
  const [expanded, setExpanded] = useState(false);
  const [childrenResult, setChildrenResult] = useState<SymbolsResult | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  
  // Use a ref to store our unique request ID
  const myReqId = React.useRef(`req_${Math.random().toString(36).substring(2, 9)}`);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!prop.IsComplex || !prop.ObjectName) return;
    
    const willExpand = !expanded;
    setExpanded(willExpand);
    
    if (willExpand && !childrenResult && !isFetching) {
      setIsFetching(true);
      vscode.postMessage({
        command: "getSymbols",
        scopeId: scopeId,
        kind: `Schema_${prop.ObjectName}`,
        page: 1,
        limit: 5000,
        query: "",
        reqId: myReqId.current
      });
    }
  };

  useEffect(() => {
    const handleSymbolsResult = (e: any) => {
      const msg = e.detail;
      if (msg.reqId === myReqId.current) {
        setChildrenResult(msg.data);
        setIsFetching(false);
      }
    };
    window.addEventListener('symbolsResult', handleSymbolsResult as EventListener);
    return () => window.removeEventListener('symbolsResult', handleSymbolsResult as EventListener);
  }, []);

  return (
    <div style={{ paddingLeft: '8px', marginTop: '4px' }}>
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.1)', padding: '6px 10px', borderRadius: '4px', borderLeft: '2px solid var(--border-color)', cursor: prop.IsComplex ? 'pointer' : 'default' }}
        onClick={handleToggle}
      >
        {prop.IsComplex && (
          <span style={{ fontSize: '10px', width: '12px' }}>
            {expanded ? '▼' : '▶'}
          </span>
        )}
        {!prop.IsComplex && <span style={{ width: '12px' }}></span>}
        <span style={{ color: '#dcdcaa' }}>{prop.name}</span>
        {prop.IsComplex ? (
          <span>
            {' -> '}
            <span style={{ color: '#9cdcfe' }}>{prop.ObjectName}</span>
          </span>
        ) : (
          <span style={{ color: '#9cdcfe' }}>: {prop.DataType || prop.ObjectName || 'Unknown'}</span>
        )}
        {prop.IsComplex && <span className="badge" style={{ background: 'rgba(197, 134, 192, 0.2)', color: '#c586c0', fontSize: '9px' }}>Complex</span>}
        {prop.IsRepeated && <span className="badge" style={{ background: 'rgba(156, 220, 254, 0.2)', color: '#9cdcfe', fontSize: '9px' }}>Repeated</span>}
      </div>
      
      {expanded && isFetching && (
        <div style={{ paddingLeft: '32px', fontSize: '11px', color: 'var(--muted-text)', marginTop: '4px' }}>Loading...</div>
      )}
      
      {expanded && childrenResult && childrenResult.symbols && childrenResult.symbols.length > 0 && (
        <div style={{ marginLeft: '12px', borderLeft: '1px dashed rgba(255,255,255,0.1)' }}>
          {[
            ...(childrenResult.symbols[0].serializedProperties || []),
            ...(childrenResult.symbols[0].serializedComplexProperties || []).map((p: any) => ({
              name: p.name,
              ObjectName: p.type,
              IsComplex: true,
              IsRepeated: p.name.toUpperCase().endsWith('.LIST')
            }))
          ].map((childProp: any, idx: number) => (
            <SchemaTreeNode key={idx} prop={childProp} scopeId={scopeId} />
          ))}
        </div>
      )}
    </div>
  );
};
