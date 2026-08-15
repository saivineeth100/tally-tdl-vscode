import React from 'react';
import type { PlaygroundHistoryEntryDTO } from '../../types/playground';

interface HistoryPanelProps {
    history: PlaygroundHistoryEntryDTO[];
    onLoadHistoryEntry: (entry: PlaygroundHistoryEntryDTO) => void;
    onViewResponse: (entry: PlaygroundHistoryEntryDTO) => void;
    onClearHistory: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
    history,
    onLoadHistoryEntry,
    onViewResponse,
    onClearHistory
}) => {
    const formatDate = (timestamp: number) => {
        const d = new Date(timestamp);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + d.toLocaleDateString();
    };

    return (
        <div className="playground-card history-panel-card">
            <div className="card-header">
                <div className="card-title">
                    <span className="codicon codicon-history"></span>
                    <span>Request & Response History ({history.length})</span>
                </div>
                {history.length > 0 && (
                    <div className="card-actions">
                        <button 
                            type="button"
                            className="btn-secondary btn-sm btn-danger-text"
                            onClick={onClearHistory}
                            title="Clear all history entries"
                        >
                            <span className="codicon codicon-clear-all"></span> Clear History
                        </button>
                    </div>
                )}
            </div>

            <div className="history-list">
                {history.map(entry => {
                    const isSuccess = !entry.error && entry.statusCode && entry.statusCode >= 200 && entry.statusCode < 300;

                    return (
                        <div key={entry.id} className="history-item">
                            <div className="history-info">
                                <div className="history-title-row">
                                    <span className="history-label">{entry.label || `${entry.type}: ${entry.idField}`}</span>
                                    <span className={`status-badge ${isSuccess ? 'status-success' : 'status-error'}`}>
                                        {entry.statusCode ? `${entry.statusCode}` : (entry.error ? 'Error' : 'Sent')}
                                    </span>
                                </div>

                                <div className="history-meta">
                                    <span className="history-time">{formatDate(entry.timestamp)}</span>
                                    {entry.elapsedMs !== undefined && (
                                        <span className="history-elapsed">({entry.elapsedMs}ms)</span>
                                    )}
                                </div>

                                {entry.error && (
                                    <div className="history-error-msg">{entry.error}</div>
                                )}
                            </div>

                            <div className="history-actions">
                                <button 
                                    type="button"
                                    className="btn-primary btn-xs"
                                    onClick={() => onLoadHistoryEntry(entry)}
                                    title="Load request into the visual builder"
                                >
                                    <span className="codicon codicon-edit"></span> Load
                                </button>
                                {entry.responsePath && (
                                    <button 
                                        type="button"
                                        className="btn-secondary btn-xs"
                                        onClick={() => onViewResponse(entry)}
                                        title="View response XML in Response Panel"
                                    >
                                        <span className="codicon codicon-output"></span> Response
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}

                {history.length === 0 && (
                    <div className="empty-subtext">No requests sent yet. Your history will appear here.</div>
                )}
            </div>
        </div>
    );
};
