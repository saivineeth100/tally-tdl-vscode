import React, { useState } from 'react';
import type { PlaygroundTemplateDTO } from '../../types/playground';

interface TemplatesPanelProps {
    templates: PlaygroundTemplateDTO[];
    onApplyTemplate: (template: PlaygroundTemplateDTO) => void;
    onOpenTemplateInEditor: (template: PlaygroundTemplateDTO) => void;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({
    templates,
    onApplyTemplate,
    onOpenTemplateInEditor
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', 'Export', 'Import', 'Report', 'Object'];

    const filtered = templates.filter(t => {
        const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
        const q = searchQuery.toLowerCase();
        const matchesQuery = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.prefix.toLowerCase().includes(q);
        return matchesCat && matchesQuery;
    });

    return (
        <div className="playground-card templates-panel-card">
            <div className="card-header">
                <div className="card-title">
                    <span className="codicon codicon-library"></span>
                    <span>Request Templates</span>
                </div>
            </div>

            <div className="templates-filter-bar">
                <input 
                    type="text"
                    className="form-input search-input"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search templates..."
                />

                <div className="category-pills">
                    {categories.map((c, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`pill-btn ${selectedCategory === c ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(c)}
                        >
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            <div className="templates-list">
                {filtered.map((t, idx) => (
                    <div key={idx} className="template-item">
                        <div className="template-info">
                            <div className="template-title-row">
                                <span className="template-name">{t.name}</span>
                                <span className={`template-badge badge-${t.category.toLowerCase()}`}>{t.category}</span>
                            </div>
                            <div className="template-desc">{t.description}</div>
                        </div>

                        <div className="template-actions">
                            <button 
                                type="button"
                                className="btn-primary btn-xs"
                                onClick={() => onApplyTemplate(t)}
                                title="Load this template into the visual builder"
                            >
                                <span className="codicon codicon-symbol-misc"></span> Load
                            </button>
                            <button 
                                type="button"
                                className="btn-secondary btn-xs"
                                onClick={() => onOpenTemplateInEditor(t)}
                                title="Open template in a new VS Code editor"
                            >
                                <span className="codicon codicon-new-file"></span> Open
                            </button>
                        </div>
                    </div>
                ))}

                {filtered.length === 0 && (
                    <div className="empty-subtext">No templates match your filter.</div>
                )}
            </div>
        </div>
    );
};
