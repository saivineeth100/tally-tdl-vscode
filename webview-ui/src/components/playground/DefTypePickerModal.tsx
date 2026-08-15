import React, { useState, useEffect, useRef } from 'react';

interface DefTypePickerModalProps {
    isOpen: boolean;
    availableDefTypes: string[];
    onSelect: (defType: string) => void;
    onClose: () => void;
}

interface DefTypeItem {
    name: string;
    description: string;
    category: 'Common' | 'Other';
    icon: string;
}

const COMMON_META: Record<string, { desc: string; icon: string }> = {
    Collection: { desc: 'Data container & export query definition', icon: 'symbol-class' },
    Report: { desc: 'Top-level report definition', icon: 'report' },
    Form: { desc: 'Window / screen form layout', icon: 'window' },
    Part: { desc: 'Form section containing lines', icon: 'split-horizontal' },
    Line: { desc: 'Horizontal row containing fields', icon: 'list-flat' },
    Field: { desc: 'Data display, input, and formula field', icon: 'symbol-field' },
    Menu: { desc: 'Menu and submenu item structure', icon: 'menu' },
    Button: { desc: 'Action button and hotkey trigger', icon: 'play' },
    Table: { desc: 'Data table and pop-up list', icon: 'table' },
    Object: { desc: 'Custom data model / entity', icon: 'symbol-structure' },
    Function: { desc: 'Procedural function / method', icon: 'symbol-function' },
    Variable: { desc: 'Dynamic variable definition', icon: 'symbol-variable' },
    'System: Variable': { desc: 'System environment variable', icon: 'settings' }
};

export const DefTypePickerModal: React.FC<DefTypePickerModalProps> = ({
    isOpen,
    availableDefTypes,
    onSelect,
    onClose
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Build unique normalized list of valid definition items
    const COMMON_NAMES = Object.keys(COMMON_META);

    const validNames = Array.from(new Set(
        availableDefTypes.filter(t => t && !t.startsWith('@@') && !t.includes('#'))
    ));

    // Combine all available types
    const allItems: DefTypeItem[] = [];

    // Add common types first
    for (const name of COMMON_NAMES) {
        if (validNames.some(v => v.toLowerCase() === name.toLowerCase()) || true) {
            allItems.push({
                name,
                description: COMMON_META[name]?.desc || 'TDL Definition',
                category: 'Common',
                icon: COMMON_META[name]?.icon || 'symbol-property'
            });
        }
    }

    // Add other types from server
    for (const name of validNames) {
        if (!COMMON_NAMES.some(c => c.toLowerCase() === name.toLowerCase())) {
            allItems.push({
                name,
                description: 'TDL Definition',
                category: 'Other',
                icon: 'symbol-misc'
            });
        }
    }

    // Filter and rank items based on search query
    const filteredItems = React.useMemo(() => {
        if (!searchQuery.trim()) return allItems;
        const q = searchQuery.toLowerCase().trim();

        const matches = allItems.filter(item => {
            return item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
        });

        return matches.sort((a, b) => {
            const aN = a.name.toLowerCase();
            const bN = b.name.toLowerCase();

            const getScore = (name: string, desc: string) => {
                if (name === q) return 0; // Exact name match
                if (name.startsWith(q)) return 1; // Name starts with query
                if (name.includes(' ' + q) || name.includes(':' + q)) return 2; // Word starts with query
                if (name.includes(q)) return 3; // Name contains query
                if (desc.toLowerCase().includes(q)) return 4; // Description contains query
                return 5;
            };

            const scoreA = getScore(aN, a.description);
            const scoreB = getScore(bN, b.description);
            if (scoreA !== scoreB) {
                return scoreA - scoreB;
            }
            return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
        });
    }, [allItems, searchQuery]);

    // Reset selection index when search query changes or modal opens
    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery, isOpen]);

    // Auto-focus input on open
    useEffect(() => {
        if (isOpen) {
            setSearchQuery('');
            setSelectedIndex(0);
            setTimeout(() => {
                inputRef.current?.focus();
            }, 50);
        }
    }, [isOpen]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredItems.length > 0 && selectedIndex < filteredItems.length) {
                onSelect(filteredItems[selectedIndex].name);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        }
    };

    // Scroll selected item into view
    useEffect(() => {
        if (listRef.current) {
            const activeElem = listRef.current.querySelector('.quickpick-item.selected') as HTMLElement;
            if (activeElem) {
                activeElem.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [selectedIndex]);

    if (!isOpen) return null;

    return (
        <div className="quickpick-overlay" onClick={onClose}>
            <div className="quickpick-container" onClick={e => e.stopPropagation()}>
                <div className="quickpick-header">
                    <div className="quickpick-title-row">
                        <span className="codicon codicon-add"></span>
                        <span className="quickpick-title">Select Definition Type</span>
                        <span className="quickpick-shortcut-hint">Esc to cancel</span>
                    </div>

                    <div className="quickpick-input-wrapper">
                        <span className="codicon codicon-search quickpick-search-icon"></span>
                        <input 
                            ref={inputRef}
                            type="text"
                            className="quickpick-input"
                            placeholder="Type to search definition type (e.g. Collection, Report, Field)..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                        />
                        {searchQuery && (
                            <button 
                                type="button" 
                                className="btn-icon quickpick-clear-btn" 
                                onClick={() => setSearchQuery('')}
                                title="Clear search"
                            >
                                <span className="codicon codicon-close"></span>
                            </button>
                        )}
                    </div>
                </div>

                <div className="quickpick-list" ref={listRef}>
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item, idx) => (
                            <div 
                                key={item.name}
                                className={`quickpick-item ${idx === selectedIndex ? 'selected' : ''}`}
                                onClick={() => onSelect(item.name)}
                                onMouseEnter={() => setSelectedIndex(idx)}
                            >
                                <span className={`codicon codicon-${item.icon} quickpick-item-icon`}></span>
                                <div className="quickpick-item-content">
                                    <div className="quickpick-item-name">{item.name}</div>
                                    <div className="quickpick-item-desc">{item.description}</div>
                                </div>
                                <span className={`quickpick-category-badge badge-${item.category.toLowerCase()}`}>
                                    {item.category}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="quickpick-empty">
                            <span className="codicon codicon-search-stop" style={{ fontSize: 24, opacity: 0.5 }}></span>
                            <div>No matching definition type found for "{searchQuery}"</div>
                            <div className="quickpick-empty-sub">Please select from the available TDL definition types.</div>
                        </div>
                    )}
                </div>

                <div className="quickpick-footer">
                    <span className="quickpick-footer-tip">
                        Use <kbd>&uarr;</kbd> <kbd>&darr;</kbd> to navigate, <kbd>Enter</kbd> to select
                    </span>
                    <button 
                        type="button" 
                        className="btn-secondary btn-sm"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
