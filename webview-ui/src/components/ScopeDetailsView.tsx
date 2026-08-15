import React, { useState } from "react";
import { vscode } from "../utils/vscode";
import { ScopeDetailsDTO, ScopeDetailChild, ScopeDetailVariable, ScopeDetailFormula } from "../types";

interface ScopeDetailsViewProps {
  details: ScopeDetailsDTO;
  canGoBack?: boolean;
  onNodeSelect?: (node: any, path: string[]) => void;
  breadcrumbs?: string[];
}

export const ScopeDetailsView: React.FC<ScopeDetailsViewProps> = ({
  details,
  canGoBack,
  onNodeSelect,
  breadcrumbs = []
}) => {
  const [filterQuery, setFilterQuery] = useState("");

  const handleGoToSource = () => {
    vscode.postMessage({
      command: "goToDefinition",
      name: details.name,
      uri: details.uri,
      start: details.start,
      end: details.end,
      expectedType: details.definitionType || details.kind
    });
  };

  const handleDrillDown = (child: ScopeDetailChild) => {
    if (onNodeSelect) {
      const childNode = {
        _type: "definition-details",
        id: child.id,
        scopeId: child.id,
        name: child.name,
        definitionType: child.definitionType,
        uri: child.uri,
        start: child.start,
        end: child.end
      };
      onNodeSelect(childNode, [...breadcrumbs, child.name]);
    } else {
      vscode.postMessage({
        command: "goToDefinition",
        name: child.name,
        uri: child.uri,
        start: child.start,
        end: child.end,
        expectedType: child.definitionType
      });
    }
  };

  const handleNavigateToTarget = (target: string, expectedType?: string) => {
    const parts = target.split(":");
    const type = parts.length > 1 ? parts[0] : (expectedType || "Unknown");
    const name = parts.length > 1 ? parts.slice(1).join(":") : target;

    if (onNodeSelect) {
      const targetNode = {
        _type: "definition-details",
        id: target.includes(":") ? target : `${type}:${name}`,
        scopeId: target.includes(":") ? target : `${type}:${name}`,
        name,
        definitionType: type
      };
      onNodeSelect(targetNode, [...breadcrumbs, name]);
    } else {
      vscode.postMessage({
        command: "goToDefinition",
        name,
        expectedType: type
      });
    }
  };

  const q = filterQuery.toLowerCase().trim();

  // Filter variables
  const variablesList: ScopeDetailVariable[] = details.variables || [];
  const filteredVariables = q
    ? variablesList.filter(
        (v: ScopeDetailVariable) =>
          v.name.toLowerCase().includes(q) ||
          (v.dataType && v.dataType.toLowerCase().includes(q)) ||
          (v.value && v.value.toLowerCase().includes(q))
      )
    : variablesList;

  // Filter formulas
  const formulasList: ScopeDetailFormula[] = details.formulas || [];
  const filteredFormulas = q
    ? formulasList.filter(
        (f: ScopeDetailFormula) =>
          f.name.toLowerCase().includes(q) ||
          (f.value && f.value.toLowerCase().includes(q))
      )
    : formulasList;

  // Filter children by type
  const filteredChildrenByType: Record<string, ScopeDetailChild[]> = {};
  const childrenMap: Record<string, ScopeDetailChild[]> = details.childrenByType || {};
  for (const [type, children] of Object.entries(childrenMap)) {
    const list: ScopeDetailChild[] = children || [];
    const matching = q
      ? list.filter(
          (c: ScopeDetailChild) =>
            c.name.toLowerCase().includes(q) ||
            c.definitionType.toLowerCase().includes(q) ||
            type.toLowerCase().includes(q)
        )
      : list;
    if (matching.length > 0) {
      filteredChildrenByType[type] = matching;
    }
  }

  // Filter fetched & computed fields
  const fetchedList: string[] = details.fetchedFields || [];
  const filteredFetchedFields = q
    ? fetchedList.filter((f: string) => f.toLowerCase().includes(q))
    : fetchedList;

  const computedList: string[] = details.computedFields || [];
  const filteredComputedFields = q
    ? computedList.filter((f: string) => f.toLowerCase().includes(q))
    : computedList;

  const totalChildrenCount = Object.values(childrenMap).reduce(
    (sum: number, list: ScopeDetailChild[]) => sum + (list ? list.length : 0),
    0
  );

  const hasAnyContent =
    totalChildrenCount > 0 ||
    variablesList.length > 0 ||
    formulasList.length > 0 ||
    fetchedList.length > 0 ||
    computedList.length > 0 ||
    (details.usedDefinitions && details.usedDefinitions.length > 0);

  const isProjectDef =
    details.id !== "global" &&
    details.id !== "project" &&
    details.id !== "system";

  return (
    <div className="main-panel-content scope-details-view">
      {/* Sticky Header */}
      <div className="scope-header-sticky">
        <div className="header-row">
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {canGoBack && (
              <button
                className="btn btn-back"
                onClick={() => window.dispatchEvent(new Event("goBack"))}
                title="Go Back"
              >
                ← Back
              </button>
            )}
            <div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <h1 className="node-title">{details.name}</h1>
                <span className="scope-type-pill">
                  {details.definitionType || details.kind}
                </span>
                {details.modifiersCount ? (
                  <span
                    className="badge"
                    style={{
                      background: "rgba(241, 76, 76, 0.2)",
                      color: "#f14c4c"
                    }}
                  >
                    {details.modifiersCount} Modifiers
                  </span>
                ) : null}
              </div>
              <div className="node-subtitle">
                <span>{details.kind} Scope</span>
                {details.id && details.id !== details.name && (
                  <span style={{ opacity: 0.7 }}>({details.id})</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {isProjectDef && (
              <button
                className="btn btn-primary"
                onClick={handleGoToSource}
                title="Jump to source code"
              >
                <span style={{ marginRight: "4px" }}>↗</span> Go to Source
              </button>
            )}
          </div>
        </div>

        {/* Quick Info Grid */}
        <div className="cards-grid scope-properties-grid">
          <div className="card">
            <span className="card-label">SCOPE LEVEL</span>
            <span className="card-value">{details.definitionType || details.kind}</span>
          </div>

          {details.objectScope && (
            <div
              className="card card-interactive"
              onClick={() => handleNavigateToTarget(details.objectScope!, "Schema")}
            >
              <span className="card-label">LINKED SCHEMA</span>
              <span className="card-value link-text">🔗 {details.objectScope}</span>
            </div>
          )}

          {details.collectionScope && (
            <div
              className="card card-interactive"
              onClick={() => handleNavigateToTarget(details.collectionScope!, "Collection")}
            >
              <span className="card-label">LINKED COLLECTION</span>
              <span className="card-value link-text">🔗 {details.collectionScope}</span>
            </div>
          )}

          {details.structuralParents && details.structuralParents.length > 0 && (
            <div className="card">
              <span className="card-label">PARENT SCOPE</span>
              <span className="card-value">
                {details.structuralParents.map((p: string, idx: number) => (
                  <span key={idx}>
                    <a
                      href="#"
                      className="link-text"
                      onClick={e => {
                        e.preventDefault();
                        handleNavigateToTarget(p);
                      }}
                    >
                      {p}
                    </a>
                    {idx < details.structuralParents!.length - 1 ? ", " : ""}
                  </span>
                ))}
              </span>
            </div>
          )}
        </div>

        {/* Quick Filter Input */}
        {hasAnyContent && (
          <div className="scope-filter-container">
            <input
              type="text"
              className="search-input scope-filter-input"
              placeholder={`Filter components, variables, formulas in ${details.name}...`}
              value={filterQuery}
              onChange={e => setFilterQuery(e.target.value)}
            />
            {filterQuery && (
              <button
                className="btn-icon btn-clear-filter"
                onClick={() => setFilterQuery("")}
                title="Clear filter"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </div>

      {/* Structural Hierarchy / Child Components */}
      {Object.keys(filteredChildrenByType).length > 0 && (
        <div className="section">
          <h3 className="section-title">
            STRUCTURAL COMPONENTS ({Object.values(filteredChildrenByType).reduce((acc, l) => acc + l.length, 0)})
          </h3>
          <div className="structural-groups-container">
            {Object.entries(filteredChildrenByType).map(([type, children]) => (
              <div key={type} className="structural-type-group">
                <div className="structural-type-header">
                  <span className="structural-type-name">{type}s</span>
                  <span className="badge">{children.length}</span>
                </div>
                <div className="structural-children-grid">
                  {children.map((child, idx) => (
                    <div
                      key={idx}
                      className="child-card card-interactive"
                      onClick={() => handleDrillDown(child)}
                      title={`Inspect ${child.definitionType} ${child.name}`}
                    >
                      <div className="child-card-header">
                        <span className="child-name">{child.name}</span>
                        <span className="child-arrow">→</span>
                      </div>
                      <div className="child-card-meta">
                        <span className="badge badge-child-type">{child.definitionType}</span>
                        {child.childCount !== undefined && child.childCount > 0 && (
                          <span className="badge badge-child-count">
                            {child.childCount} Sub-items
                          </span>
                        )}
                        {child.description && (
                          <span className="child-desc" title={child.description}>
                            {child.description}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Variables Section */}
      {filteredVariables.length > 0 && (
        <div className="section">
          <h3 className="section-title">
            VARIABLES ({filteredVariables.length})
          </h3>
          <div className="scope-table-card">
            <table className="scope-data-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>DATA TYPE</th>
                  <th>VALUE / DEFAULT</th>
                  <th>DESCRIPTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredVariables.map((v: ScopeDetailVariable, idx: number) => (
                  <tr key={idx}>
                    <td className="table-col-name">
                      <code>{v.name}</code>
                      {v.isSystemVariable && (
                        <span className="badge badge-system">System</span>
                      )}
                    </td>
                    <td className="table-col-type">
                      <span className="type-tag">{v.dataType || "Variable"}</span>
                    </td>
                    <td className="table-col-value">
                      {v.value !== undefined ? <code>{v.value}</code> : <span className="muted-dash">-</span>}
                    </td>
                    <td className="table-col-desc">
                      {v.description || <span className="muted-dash">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Formulas Section */}
      {filteredFormulas.length > 0 && (
        <div className="section">
          <h3 className="section-title">
            FORMULAS ({filteredFormulas.length})
          </h3>
          <div className="scope-table-card">
            <table className="scope-data-table">
              <thead>
                <tr>
                  <th>NAME</th>
                  <th>EXPRESSION / VALUE</th>
                </tr>
              </thead>
              <tbody>
                {filteredFormulas.map((f: ScopeDetailFormula, idx: number) => (
                  <tr key={idx}>
                    <td className="table-col-name">
                      <code>{f.name}</code>
                    </td>
                    <td className="table-col-value">
                      {f.value !== undefined ? (
                        <code className="formula-code">{f.value}</code>
                      ) : (
                        <span className="muted-dash">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fetched & Computed Fields */}
      {(filteredFetchedFields.length > 0 || filteredComputedFields.length > 0) && (
        <div className="section">
          <h3 className="section-title">
            FIELD DECLARATIONS ({filteredFetchedFields.length + filteredComputedFields.length})
          </h3>
          <div className="cards-grid">
            {filteredFetchedFields.length > 0 && (
              <div className="field-group-card">
                <span className="card-label">FETCHED FIELDS ({filteredFetchedFields.length})</span>
                <div className="pills-container">
                  {filteredFetchedFields.map((field: string, idx: number) => (
                    <span key={idx} className="field-pill field-pill-fetched">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {filteredComputedFields.length > 0 && (
              <div className="field-group-card">
                <span className="card-label">COMPUTED FIELDS ({filteredComputedFields.length})</span>
                <div className="pills-container">
                  {filteredComputedFields.map((field: string, idx: number) => (
                    <span key={idx} className="field-pill field-pill-computed">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Used Definitions / References */}
      {details.usedDefinitions && details.usedDefinitions.length > 0 && (
        <div className="section">
          <h3 className="section-title">
            USED DEFINITIONS ({details.usedDefinitions.length})
          </h3>
          <div className="references-list">
            {details.usedDefinitions.map((useId: string, idx: number) => (
              <div
                key={idx}
                className="reference-item card-interactive"
                onClick={() => handleNavigateToTarget(useId, "Use")}
                title={`Inspect ${useId}`}
              >
                <div>
                  <span className="ref-path">{useId}</span>
                </div>
                <span className="badge badge-use">Use</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!hasAnyContent && (
        <div className="empty-state">
          No child components, variables, formulas, or field declarations found in this scope.
        </div>
      )}
    </div>
  );
};
