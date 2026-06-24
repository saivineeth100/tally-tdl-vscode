import React, { useEffect, useState } from "react";
import { vscode } from "../utilities/vscode";
import { SchemaTreeNode } from "./SchemaTreeNode";

interface DetailsPanelProps {
  node: any;
  canGoBack?: boolean;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ node, canGoBack }) => {
  const [symbolsResult, setSymbolsResult] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentQuery, setCurrentQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [viewStyle, setViewStyle] = useState<'list' | 'tree'>('list');
  const myReqId = React.useRef(`req_${Math.random().toString(36).substring(2, 9)}`);
  
  const limit = (node.kind === 'AttributesCategory' || node.kind === 'SchemasCategory') ? Number.MAX_SAFE_INTEGER : 100;

  useEffect(() => {
    if (node._type === 'symbol-group') {
      setIsFetching(true);
      setCurrentPage(1);
      setCurrentQuery("");
      setDebouncedQuery("");
      setSymbolsResult(null);

      const handleSymbolsResult = (e: any) => {
        if (!e.detail.reqId || e.detail.reqId === myReqId.current) {
          setSymbolsResult(e.detail.data);
          setIsFetching(false);
        }
      };
      
      window.addEventListener('symbolsResult', handleSymbolsResult as EventListener);
      return () => window.removeEventListener('symbolsResult', handleSymbolsResult as EventListener);
    } else {
      setSymbolsResult(null);
    }
  }, [node]);

  // Debounce the currentQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(currentQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentQuery]);

  // Auto-search when debouncedQuery changes
  useEffect(() => {
    if (node._type === 'symbol-group') {
      fetchSymbols(1, debouncedQuery);
    }
  }, [debouncedQuery, node]);

  const fetchSymbols = (page: number, query: string) => {
    setIsFetching(true);
    setCurrentPage(page);
    vscode.postMessage({
      command: "getSymbols",
      scopeId: node.scopeId,
      kind: node.kind,
      page,
      limit,
      query,
      reqId: myReqId.current
    });
  };

  const handlePageChange = (delta: number) => {
    if (!isFetching) {
      fetchSymbols(currentPage + delta, currentQuery);
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setDebouncedQuery(currentQuery);
    }
  };

  const handleGoToDefinition = (id: string) => {
    vscode.postMessage({ command: "goToDefinition", text: id });
  };

  // -----------------------------------------
  // SYMBOLS RENDERING
  // -----------------------------------------
  if (node._type === 'symbol-group') {
    let displayKind = node.kind || '';
    if (displayKind.startsWith('Attribute_')) displayKind = displayKind.substring(10);
    if (displayKind.startsWith('Schema_')) displayKind = displayKind.substring(7);
    if (displayKind.endsWith('Category')) displayKind = displayKind.replace('Category', '');

    let displayScopeId = node.scopeId || '';
    if (displayScopeId.endsWith('_Attributes')) displayScopeId = displayScopeId.replace('_Attributes', '');
    if (displayScopeId.endsWith('_Schemas')) displayScopeId = displayScopeId.replace('_Schemas', '');

    let listHtml = <div className="empty-state">No symbols found</div>;
    let searchHtml = null;

    if (symbolsResult) {
      const { symbols, totalCount, page, limit } = symbolsResult;
      const totalPages = Math.ceil(totalCount / limit) || 1;
      const startIdx = (page - 1) * limit + 1;
      const endIdx = Math.min(page * limit, totalCount);

      if (symbols && symbols.length > 0) {
        listHtml = (
          <div className="references-list">
            {symbols.map((s: any, idx: number) => {
              const isSchema = node.kind.startsWith('Schema_') && s.serializedProperties;
              
              return (
                <div 
                  key={idx} 
                  className="reference-item" 
                  style={{ flexDirection: 'column', alignItems: 'stretch', cursor: isSchema ? 'default' : 'pointer' }}
                  onClick={() => { 
                    if (node.kind === 'SchemasCategory') {
                      window.location.hash = `#${node.scopeId}/Schema_${s.name}`;
                    } else if (node.kind === 'AttributesCategory') {
                      window.location.hash = `#${node.scopeId}/Attribute_${s.name}`;
                    } else if (!isSchema) {
                      handleGoToDefinition(s.name); 
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className="ref-path">{s.name}</span>
                    </div>
                    <div>
                      {s.structuralChildren && s.structuralChildren.length > 0 && (
                        <span className="badge" style={{ background: 'rgba(156, 220, 254, 0.2)', color: '#9cdcfe' }}>{s.structuralChildren.length} Children</span>
                      )}
                      {s.usedDefinitions && s.usedDefinitions.length > 0 && (
                        <span className="badge" style={{ background: 'rgba(197, 134, 192, 0.2)', color: '#c586c0' }}>{s.usedDefinitions.length} Uses</span>
                      )}
                      {s.structuralParents && s.structuralParents.length > 0 && (
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.1)', color: '#ccc' }}>{s.structuralParents.length} Parents</span>
                      )}
                      {s.modifiersCount ? (
                        <span className="badge" style={{ background: 'rgba(241, 76, 76, 0.2)', color: '#f14c4c' }}>{s.modifiersCount} Modifiers</span>
                      ) : null}
                      <span className="badge">{s.definitionType || s.kind || 'Unknown'}</span>
                    </div>
                  </div>

                  {s.description && (
                    <div className="ref-desc" style={{ fontSize: '11px', color: 'var(--muted-text)', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
                      {s.description}
                    </div>
                  )}
                  {s.parameters && s.parameters.length > 0 && (
                    <div className="ref-params" style={{ fontSize: '11px', color: 'var(--link-color)', marginTop: '4px' }}>
                      Parameters: ({s.parameters.map((p: any) => p.ParameterType || p.DataType || p.RefersTo || 'Any').join(', ')})
                    </div>
                  )}
                  {s.returnType && (
                    <div className="ref-return" style={{ fontSize: '11px', color: '#9cdcfe', marginTop: '2px' }}>
                      Returns: {s.returnType}
                    </div>
                  )}

                  {isSchema && viewStyle === 'list' && (
                    <div style={{ marginTop: '12px', display: 'grid', gap: '8px' }}>
                      {s.serializedProperties.map((prop: any, pIdx: number) => (
                        <div key={pIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.1)', padding: '6px 10px', borderRadius: '4px', borderLeft: '2px solid var(--border-color)' }}>
                          <span style={{ color: '#dcdcaa' }}>{prop.name}</span>
                          <span>
                            {prop.DataType && <span style={{ color: '#4ec9b0' }}>{prop.DataType}</span>}
                            {prop.ObjectName && (
                              <>
                                {' -> '}
                                <span 
                                  style={{ color: '#9cdcfe', cursor: 'pointer' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.location.hash = `#${node.scopeId}/Schema_${prop.ObjectName}`;
                                  }}
                                >
                                  {prop.ObjectName}
                                </span>
                              </>
                            )}
                          </span>
                          {prop.IsComplex && <span className="badge" style={{ background: 'rgba(197, 134, 192, 0.2)', color: '#c586c0', fontSize: '9px' }}>Complex</span>}
                          {prop.IsRepeated && <span className="badge" style={{ background: 'rgba(156, 220, 254, 0.2)', color: '#9cdcfe', fontSize: '9px' }}>Repeated</span>}
                        </div>
                      ))}

                    </div>
                  )}

                  {isSchema && viewStyle === 'tree' && (
                    <div style={{ marginTop: '12px' }}>
                      {s.serializedProperties.map((prop: any, pIdx: number) => (
                        <SchemaTreeNode key={pIdx} prop={prop} scopeId={node.scopeId} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }

      searchHtml = (
        <div className="toolbar" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <input 
              type="text" 
              className="search-input" 
              placeholder={`Search ${displayKind}...`} 
              value={currentQuery}
              onChange={(e) => setCurrentQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          {(node.kind.toLowerCase().startsWith('schema_') || node.kind.toLowerCase().startsWith('attribute_')) ? (
            <div className="pagination">
              <span className="pagination-text">{totalCount} items (Showing All)</span>
            </div>
          ) : (
            <div className="pagination">
              <span className="pagination-text">{totalCount > 0 ? `${startIdx}-${endIdx} of ${totalCount}` : '0 items'}</span>
              <button className="btn-icon" onClick={() => handlePageChange(-1)} disabled={page <= 1}>&lt;</button>
              <button className="btn-icon" onClick={() => handlePageChange(1)} disabled={page >= totalPages}>&gt;</button>
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="main-panel-content">
        <div style={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 10, 
          background: 'var(--vscode-editor-background)', 
          marginTop: '-40px',
          paddingTop: '40px',
          marginLeft: '-60px',
          marginRight: '-60px',
          paddingLeft: '60px',
          paddingRight: '60px',
          paddingBottom: '12px', 
          borderBottom: searchHtml ? '1px solid var(--border-color)' : 'none' 
        }}>
          <div className="header-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            {canGoBack && (
              <button 
                className="btn" 
                style={{ padding: '4px 12px', height: 'fit-content' }}
                onClick={() => window.dispatchEvent(new Event('goBack'))}
                title="Go Back"
              >
                ← Back
              </button>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h1 className="node-title">{displayKind}</h1>
              <div className="node-subtitle">under {displayScopeId}</div>
            </div>
            {node.kind.startsWith('Schema_') && (
              <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                <button 
                  className="btn" 
                  style={{ 
                    padding: '4px 12px', 
                    background: viewStyle === 'list' ? 'var(--button-hover)' : 'var(--button-background)',
                    border: viewStyle === 'list' ? '1px solid var(--vscode-focusBorder)' : '1px solid transparent',
                    color: 'var(--vscode-button-foreground)'
                  }}
                  onClick={() => setViewStyle('list')}
                >
                  List View
                </button>
                <button 
                  className="btn" 
                  style={{ 
                    padding: '4px 12px', 
                    background: viewStyle === 'tree' ? 'var(--button-hover)' : 'var(--button-background)',
                    border: viewStyle === 'tree' ? '1px solid var(--vscode-focusBorder)' : '1px solid transparent',
                    color: 'var(--vscode-button-foreground)'
                  }}
                  onClick={() => setViewStyle('tree')}
                >
                  Tree View
                </button>
              </div>
            )}
          </div>
          {searchHtml}
        </div>
        
        {isFetching && !symbolsResult ? (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <div className="spinner"></div>
            <div className="loading">Loading symbols...</div>
          </div>
        ) : (
          <div className="section" style={{ marginTop: '16px' }}>
            {listHtml}
          </div>
        )}
      </div>
    );
  }

  // -----------------------------------------
  // NODE DETAILS RENDERING
  // -----------------------------------------
  const name = node.name || node.id || "Unknown";
  const kind = node.kind || "Unknown";

  let parents = node.structuralParents && node.structuralParents.length > 0 
    ? node.structuralParents 
    : [];

  return (
    <div className="main-panel-content">
      <div className="header-row">
        <div>
          <h1 className="node-title">{name}</h1>
          <div className="node-subtitle">{kind} Scope</div>
        </div>
      </div>

      <div className="section">
        <h3 className="section-title">SCOPE PROPERTIES</h3>
        <div className="cards-grid">
          <div className="card">
            <span className="card-label">TYPE</span>
            <span className="card-value">{kind} Scope</span>
          </div>
          <div className="card">
            <span className="card-label">PARENT</span>
            <span className="card-value">
              {parents.length > 0 ? (
                parents.map((p: string, i: number) => (
                  <span key={i}>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleGoToDefinition(p); }}>{p}</a>
                    {i < parents.length - 1 ? ', ' : ''}
                  </span>
                ))
              ) : 'None'}
            </span>
          </div>
        </div>
      </div>

      {node.structuralChildren && node.structuralChildren.length > 0 && (
        <div className="section">
          <h3 className="section-title">STRUCTURAL CHILDREN ({node.structuralChildren.length})</h3>
          <div className="references-list">
            {node.structuralChildren.map((c: string, i: number) => (
              <div key={i} className="reference-item" style={{ cursor: 'pointer' }} onClick={() => handleGoToDefinition(c)}>
                <div>
                  <span className="ref-path">{c}</span>
                </div>
                <span className="badge">Child</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {node.usedDefinitions && node.usedDefinitions.length > 0 ? (
        <div className="section">
          <h3 className="section-title">REFERENCES ({node.usedDefinitions.length})</h3>
          <div className="references-list">
            {node.usedDefinitions.map((r: string, i: number) => (
              <div key={i} className="reference-item" style={{ cursor: 'pointer' }} onClick={() => handleGoToDefinition(r)}>
                <div>
                  <span className="ref-path">{r}</span>
                </div>
                <span className="badge">Use</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="section">
          <h3 className="section-title">REFERENCES (0)</h3>
          <div className="references-list">
            <div className="reference-item" style={{ color: 'var(--muted-text)', justifyContent: 'center' }}>
              No references found
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsPanel;
