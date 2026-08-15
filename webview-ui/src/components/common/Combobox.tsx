import React, { useState, useRef, useEffect } from 'react';

export interface ComboboxOption {
    value: string;
    label?: string;
    description?: string;
    category?: string;
}

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: (string | ComboboxOption)[];
    placeholder?: string;
    onFocus?: () => void;
    className?: string;
    autoFocus?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
    value,
    onChange,
    options,
    placeholder = 'Type or select...',
    onFocus,
    className = '',
    autoFocus = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // Normalize options
    const normalizedOptions: ComboboxOption[] = options.map(opt => {
        if (typeof opt === 'string') {
            return { value: opt, label: opt };
        }
        return opt;
    });

    // Filter and rank options based on input value
    const filteredOptions = React.useMemo(() => {
        if (!value) return normalizedOptions;
        const q = value.toLowerCase().trim();
        if (!q) return normalizedOptions;

        const matches = normalizedOptions.filter(opt => {
            const v = opt.value.toLowerCase();
            const l = (opt.label || '').toLowerCase();
            const d = (opt.description || '').toLowerCase();
            return v.includes(q) || l.includes(q) || d.includes(q);
        });

        return matches.sort((a, b) => {
            const aV = a.value.toLowerCase();
            const aL = (a.label || '').toLowerCase();
            const bV = b.value.toLowerCase();
            const bL = (b.label || '').toLowerCase();

            const getScore = (val: string, label: string) => {
                if (val === q || label === q) return 0; // Exact match
                if (val.startsWith(q) || label.startsWith(q)) return 1; // Starts with
                if (val.includes(' ' + q) || label.includes(' ' + q)) return 2; // Word starts with
                if (val.includes(q) || label.includes(q)) return 3; // Substring
                return 4;
            };

            const scoreA = getScore(aV, aL);
            const scoreB = getScore(bV, bL);
            if (scoreA !== scoreB) {
                return scoreA - scoreB;
            }
            return (a.label || a.value).localeCompare(b.label || b.value, undefined, { sensitivity: 'base' });
        });
    }, [normalizedOptions, value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll highlighted item into view
    useEffect(() => {
        if (isOpen && listRef.current && highlightedIndex >= 0) {
            const items = listRef.current.querySelectorAll('.combobox-item');
            if (items[highlightedIndex]) {
                (items[highlightedIndex] as HTMLElement).scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex, isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setHighlightedIndex(0);
            } else {
                setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setHighlightedIndex(filteredOptions.length - 1);
            } else {
                setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
            }
        } else if (e.key === 'Enter') {
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                e.preventDefault();
                const selected = filteredOptions[highlightedIndex];
                onChange(selected.value);
                setIsOpen(false);
            }
        } else if (e.key === 'Escape') {
            if (isOpen) {
                e.preventDefault();
                setIsOpen(false);
            }
        } else if (e.key === 'Tab') {
            setIsOpen(false);
        }
    };

    const handleSelectOption = (opt: ComboboxOption) => {
        onChange(opt.value);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className={`combobox-root ${className}`} ref={containerRef}>
            <div className="combobox-input-wrapper">
                <input
                    ref={inputRef}
                    type="text"
                    className="form-input combobox-input"
                    value={value}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    onFocus={() => {
                        setIsOpen(true);
                        setHighlightedIndex(-1);
                        if (onFocus) onFocus();
                    }}
                    onChange={e => {
                        onChange(e.target.value);
                        setIsOpen(true);
                        setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                />
                <button
                    type="button"
                    className={`combobox-chevron-btn ${isOpen ? 'open' : ''}`}
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen) {
                            inputRef.current?.focus();
                        }
                    }}
                    tabIndex={-1}
                    title="Toggle options"
                >
                    <span className="codicon codicon-chevron-down"></span>
                </button>
            </div>

            {isOpen && filteredOptions.length > 0 && (
                <div className="combobox-dropdown" ref={listRef}>
                    {filteredOptions.map((opt, idx) => (
                        <div
                            key={`${opt.value}-${idx}`}
                            className={`combobox-item ${idx === highlightedIndex ? 'highlighted' : ''} ${opt.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelectOption(opt)}
                            onMouseEnter={() => setHighlightedIndex(idx)}
                        >
                            <span className="combobox-item-label">{opt.label || opt.value}</span>
                            {opt.description && (
                                <span className="combobox-item-desc">{opt.description}</span>
                            )}
                            {opt.category && (
                                <span className="combobox-item-cat">{opt.category}</span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
