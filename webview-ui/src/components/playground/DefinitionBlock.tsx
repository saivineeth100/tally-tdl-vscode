import React, { useState, useEffect } from 'react';
import { DefTypePickerModal } from './DefTypePickerModal';
import { Combobox } from '../common/Combobox';
import type { 
    PlaygroundDefinitionDTO, 
    PlaygroundAttributeDTO,
    DefTypeAttributeDTO 
} from '../../types/playground';

interface DefinitionBlockProps {
    index: number;
    definition: PlaygroundDefinitionDTO;
    allDefinitions: PlaygroundDefinitionDTO[];
    definitionTypes: string[];
    schemaTypes: string[];
    attributesForDefType: DefTypeAttributeDTO[];
    attributeValueSuggestionsCache?: Record<string, string[]>;
    defNameSuggestionsCache?: Record<string, string[]>;
    onRequestAttributesForDefType: (defType: string) => void;
    onRequestAttributeValueSuggestions?: (defType: string, attributeName: string, paramIndex: number, currentDefinition: PlaygroundDefinitionDTO, query?: string) => void;
    onRequestDefNameSuggestions?: (defType: string, query?: string) => void;
    onUpdateDefinition: (index: number, updated: PlaygroundDefinitionDTO) => void;
    onDeleteDefinition: (index: number) => void;
}

export const DefinitionBlock: React.FC<DefinitionBlockProps> = ({
    index,
    definition,
    allDefinitions,
    definitionTypes,
    schemaTypes,
    attributesForDefType,
    attributeValueSuggestionsCache = {},
    defNameSuggestionsCache = {},
    onRequestAttributesForDefType,
    onRequestAttributeValueSuggestions,
    onRequestDefNameSuggestions,
    onUpdateDefinition,
    onDeleteDefinition
}) => {
    const [showXmlAttrs, setShowXmlAttrs] = useState(false);
    const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);

    useEffect(() => {
        if (definition.defType) {
            onRequestAttributesForDefType(definition.defType);
        }
    }, [definition.defType]);

    const handleDefTypeChange = (newType: string) => {
        onRequestAttributesForDefType(newType);
        onUpdateDefinition(index, {
            ...definition,
            defType: newType
        });
    };

    const handleNameChange = (newName: string) => {
        onUpdateDefinition(index, {
            ...definition,
            name: newName
        });
    };

    const handleXmlAttrToggle = (attrKey: 'isModify' | 'isFixed' | 'isInitialize' | 'isOption' | 'isInternal') => {
        const isNowActive = !definition[attrKey];
        if (isNowActive && onRequestDefNameSuggestions) {
            onRequestDefNameSuggestions(definition.defType, '');
        }
        onUpdateDefinition(index, {
            ...definition,
            [attrKey]: isNowActive
        });
    };

    const handleAddAttribute = () => {
        const newAttrs = [...definition.attributes, { name: '', values: [''] }];
        onUpdateDefinition(index, {
            ...definition,
            attributes: newAttrs
        });
    };

    const handleUpdateAttributeName = (attrIndex: number, newName: string) => {
        const newAttrs = [...definition.attributes];
        newAttrs[attrIndex] = {
            ...newAttrs[attrIndex],
            name: newName
        };
        onUpdateDefinition(index, {
            ...definition,
            attributes: newAttrs
        });
    };

    const handleUpdateAttributeParam = (attrIndex: number, paramIndex: number, newVal: string) => {
        const newAttrs = [...definition.attributes];
        const currentVals = [...(newAttrs[attrIndex].values || [])];
        while (currentVals.length <= paramIndex) {
            currentVals.push('');
        }
        currentVals[paramIndex] = newVal;
        newAttrs[attrIndex] = {
            ...newAttrs[attrIndex],
            values: currentVals
        };
        onUpdateDefinition(index, {
            ...definition,
            attributes: newAttrs
        });
    };

    const handleAddValueToList = (attrIndex: number) => {
        const newAttrs = [...definition.attributes];
        const currentVals = [...(newAttrs[attrIndex].values || [''])];
        currentVals.push('');
        newAttrs[attrIndex] = {
            ...newAttrs[attrIndex],
            values: currentVals
        };
        onUpdateDefinition(index, {
            ...definition,
            attributes: newAttrs
        });
    };

    const handleRemoveValueFromList = (attrIndex: number, valIndex: number) => {
        const newAttrs = [...definition.attributes];
        const currentVals = (newAttrs[attrIndex].values || []).filter((_, i) => i !== valIndex);
        newAttrs[attrIndex] = {
            ...newAttrs[attrIndex],
            values: currentVals.length > 0 ? currentVals : ['']
        };
        onUpdateDefinition(index, {
            ...definition,
            attributes: newAttrs
        });
    };

    const handleRemoveParam = (attrIndex: number, paramIndex: number) => {
        const newAttrs = [...definition.attributes];
        const currentVals = [...(newAttrs[attrIndex].values || [])];
        if (paramIndex < currentVals.length) {
            currentVals.splice(paramIndex, 1);
        }
        newAttrs[attrIndex] = {
            ...newAttrs[attrIndex],
            values: currentVals
        };
        onUpdateDefinition(index, {
            ...definition,
            attributes: newAttrs
        });
    };

    const handleRemoveAttribute = (attrIndex: number) => {
        const newAttrs = definition.attributes.filter((_, i) => i !== attrIndex);
        onUpdateDefinition(index, {
            ...definition,
            attributes: newAttrs
        });
    };

    // Helper suggestions for attribute values based on cross-definition references
    const getParamSuggestions = (attrName: string, paramIdx: number): string[] => {
        const normDef = definition.defType.toLowerCase().trim();
        const normAttr = attrName.toLowerCase().trim();
        const indexedKey = `${normDef}:${normAttr}:${paramIdx}`;
        const baseKey = `${normDef}:${normAttr}`;
        return attributeValueSuggestionsCache[indexedKey] || (paramIdx === 0 ? attributeValueSuggestionsCache[baseKey] : []) || [];
    };

    // Quick helper attributes based on definition type
    const getQuickAttributesForDefType = (defType: string): string[] => {
        const t = defType.trim().toLowerCase();
        if (t === 'collection') return ['Type', 'NativeMethod', 'Filter', 'Walk', 'Fetch', 'ChildOf'];
        if (t === 'report') return ['Form', 'Title', 'Set'];
        if (t === 'form') return ['Part', 'Background'];
        if (t === 'part') return ['Line', 'Repeat', 'Scroll'];
        if (t === 'line') return ['Field', 'Right Field', 'Left Field'];
        if (t === 'field') return ['Set as', 'Type', 'Style', 'Format', 'Width'];
        if (t === 'menu') return ['Item', 'Add'];
        if (t === 'button') return ['Title', 'Key', 'Action'];
        return ['Type', 'Set as', 'Use'];
    };

    const quickAttrs = getQuickAttributesForDefType(definition.defType);
    const existingAttrNames = new Set(definition.attributes.map(a => a.name.trim().toLowerCase()));
    const availableQuickAttrs = quickAttrs.filter(a => !existingAttrNames.has(a.toLowerCase()));

    const handleAddQuickAttr = (attrName: string) => {
        const defaultVal = (definition.defType.toLowerCase() === 'collection' && attrName.toLowerCase() === 'type')
            ? 'Ledger'
            : '';
        const newAttrs = [...definition.attributes, { name: attrName, values: [defaultVal] }];
        onUpdateDefinition(index, {
            ...definition,
            attributes: newAttrs
        });
    };

    const hasModifiers = !!(
        definition.isModify || 
        definition.isInitialize || 
        definition.isFixed
    );

    useEffect(() => {
        if (hasModifiers && definition.defType && onRequestDefNameSuggestions) {
            onRequestDefNameSuggestions(definition.defType, '');
        }
    }, [hasModifiers, definition.defType]);

    const normDefType = (definition.defType || 'collection').toLowerCase().trim();
    const defNameOptions = (defNameSuggestionsCache[normDefType] || []).map(name => ({
        value: name,
        label: name
    }));

    return (
        <div className="definition-card">
            <div className="def-card-header">
                <div className="def-type-name-group">
                    <div className="def-type-selector">
                        <button 
                            type="button"
                            className="def-type-badge-btn"
                            onClick={() => setIsTypePickerOpen(true)}
                            title="Click to select definition type"
                        >
                            <span className="def-type-text">{definition.defType || 'Collection'}</span>
                            <span className="codicon codicon-chevron-down def-type-chevron"></span>
                        </button>
                    </div>

                    <span className="def-colon">:</span>

                    <div className="def-name-col">
                        {hasModifiers ? (
                            <Combobox 
                                value={definition.name}
                                onChange={handleNameChange}
                                options={defNameOptions}
                                onFocus={() => {
                                    onRequestDefNameSuggestions?.(definition.defType, definition.name);
                                }}
                                placeholder={`Existing ${definition.defType || 'Definition'} to modify...`}
                            />
                        ) : (
                            <input 
                                type="text"
                                className="form-input def-name-input"
                                value={definition.name}
                                onChange={e => handleNameChange(e.target.value)}
                                placeholder={`Definition Name (e.g. My${definition.defType || 'Collection'})`}
                            />
                        )}
                    </div>
                </div>

                <div className="def-card-actions">
                    <button 
                        type="button" 
                        className={`btn-tag ${showXmlAttrs ? 'active' : ''}`}
                        onClick={() => setShowXmlAttrs(!showXmlAttrs)}
                        title="Toggle XML Attributes (ISMODIFY, ISOPTION, etc.)"
                    >
                        <span className="codicon codicon-tag"></span> Modifiers
                    </button>
                    <button 
                        type="button"
                        className="btn-icon btn-danger"
                        onClick={() => onDeleteDefinition(index)}
                        title="Delete this definition"
                    >
                        <span className="codicon codicon-trash"></span>
                    </button>
                </div>
            </div>

            {/* QuickPick for changing defType */}
            <DefTypePickerModal 
                isOpen={isTypePickerOpen}
                availableDefTypes={definitionTypes}
                onSelect={newType => {
                    setIsTypePickerOpen(false);
                    handleDefTypeChange(newType);
                }}
                onClose={() => setIsTypePickerOpen(false)}
            />

            {/* XML Modifier attributes pill bar */}
            {showXmlAttrs && (
                <div className="xml-attrs-bar">
                    <button
                        type="button"
                        className={`modifier-chip ${definition.isModify ? 'active active-modify' : ''}`}
                        onClick={() => handleXmlAttrToggle('isModify')}
                        title="Add ISMODIFY=&quot;Yes&quot; to XML tag"
                    >
                        ISMODIFY
                    </button>
                    <button
                        type="button"
                        className={`modifier-chip ${definition.isFixed ? 'active active-fixed' : ''}`}
                        onClick={() => handleXmlAttrToggle('isFixed')}
                        title="Add ISFIXED=&quot;Yes&quot; to XML tag"
                    >
                        ISFIXED
                    </button>
                    <button
                        type="button"
                        className={`modifier-chip ${definition.isInitialize ? 'active active-init' : ''}`}
                        onClick={() => handleXmlAttrToggle('isInitialize')}
                        title="Add ISINITIALIZE=&quot;Yes&quot; to XML tag"
                    >
                        ISINITIALIZE
                    </button>
                    <button
                        type="button"
                        className={`modifier-chip ${definition.isOption ? 'active active-option' : ''}`}
                        onClick={() => handleXmlAttrToggle('isOption')}
                        title="Add ISOPTION=&quot;Yes&quot; to XML tag"
                    >
                        ISOPTION
                    </button>
                    <button
                        type="button"
                        className={`modifier-chip ${definition.isInternal ? 'active active-internal' : ''}`}
                        onClick={() => handleXmlAttrToggle('isInternal')}
                        title="Add ISINTERNAL=&quot;Yes&quot; to XML tag"
                    >
                        ISINTERNAL
                    </button>
                </div>
            )}

            <div className="attributes-container">
                {definition.attributes.map((attr, attrIdx) => {
                    const attrMeta = attributesForDefType.find(
                        a => a.name.toLowerCase().trim() === attr.name.toLowerCase().trim()
                    );
                    const metaType = attrMeta?.type?.toLowerCase() || 'single';
                    const metaParams = attrMeta?.parameters || [];

                    // 1. Determine if this attribute is a LIST attribute (single sub-attribute accepting multiple values)
                    const isList = (
                        metaType.includes('list') || 
                        metaParams.some(p => p.IsList === true || (p.IsList as any) === 'Yes' || p.IsVariableArgument) || 
                        ['fetch', 'computes', 'compute', 'nativemethod', 'filters', 'filter', 'childof', 'parts', 'lines', 'fields', 'items', 'tables', 'walk'].includes(attr.name.toLowerCase().trim())
                    );

                    // 2. Determine if this attribute has MULTIPLE POSITIONAL SUB-ATTRIBUTES/PARAMETERS (separated by :)
                    const isMultiParam = !isList && (
                        metaParams.length > 1 || 
                        metaType === 'dual' || 
                        metaType === 'triple' || 
                        metaType.includes('menu item') || 
                        metaType.includes('action')
                    );

                    // Count mandatory parameters for multi-param attributes
                    const mandatoryParamsCount = metaParams.filter(
                        p => p.IsMandatory === true || (p.IsMandatory as any) === 'Yes'
                    ).length;

                    const defaultRequiredCount = Math.max(mandatoryParamsCount, 1);
                    const currentValuesCount = (attr.values || []).length;
                    const activeParamCount = isMultiParam 
                        ? Math.max(defaultRequiredCount, currentValuesCount)
                        : 1;

                    const attrNameOptions = attributesForDefType.map(a => ({
                        value: a.name,
                        label: a.name,
                        description: a.description
                    }));

                    const getParamPlaceholder = (paramIdx: number): string => {
                        if (metaParams && metaParams[paramIdx]) {
                            const p = metaParams[paramIdx];
                            if (p.Description) return p.Description;
                            if (p.RefersTo) return `${p.RefersTo} name`;
                            if (p.DataType) return `${p.DataType} value`;
                            if (p.ParameterType) return p.ParameterType;
                        }
                        if (paramIdx === 0) return 'Value (e.g. Ledger, Name)';
                        return `Parameter ${paramIdx + 1}`;
                    };

                    return (
                        <div key={`attr-${attrIdx}`} className="attr-row">
                            <div className="attr-name-col">
                                <Combobox
                                    value={attr.name}
                                    onChange={newName => handleUpdateAttributeName(attrIdx, newName)}
                                    options={attrNameOptions}
                                    onFocus={() => onRequestAttributesForDefType(definition.defType)}
                                    placeholder="Attribute (e.g. Type, Fetch)"
                                />
                            </div>

                            <span className="attr-colon">:</span>

                            <div className="attr-value-col">
                                {isMultiParam ? (
                                    <div className="attr-params-group">
                                        {Array.from({ length: activeParamCount }).map((_, pIdx) => {
                                            const paramVal = attr.values && attr.values[pIdx] !== undefined ? attr.values[pIdx] : '';
                                            const paramSuggs = getParamSuggestions(attr.name, pIdx);
                                            const placeholder = getParamPlaceholder(pIdx);
                                            const isOptionalParam = pIdx >= mandatoryParamsCount && pIdx > 0;

                                            return (
                                                <div key={`param-${pIdx}`} className="attr-param-item">
                                                    {pIdx > 0 && <span className="attr-param-sep">:</span>}
                                                    <Combobox
                                                        value={paramVal}
                                                        onChange={newVal => {
                                                            handleUpdateAttributeParam(attrIdx, pIdx, newVal);
                                                            if (attr.name && onRequestAttributeValueSuggestions) {
                                                                onRequestAttributeValueSuggestions(definition.defType, attr.name, pIdx, definition, newVal);
                                                            }
                                                        }}
                                                        options={paramSuggs}
                                                        onFocus={() => {
                                                            if (attr.name && onRequestAttributeValueSuggestions) {
                                                                onRequestAttributeValueSuggestions(definition.defType, attr.name, pIdx, definition, paramVal);
                                                            }
                                                        }}
                                                        placeholder={placeholder}
                                                    />
                                                    {isOptionalParam && (
                                                        <button
                                                            type="button"
                                                            className="btn-remove-val"
                                                            onClick={() => handleRemoveParam(attrIdx, pIdx)}
                                                            title="Remove optional parameter"
                                                        >
                                                            <span className="codicon codicon-close"></span>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {(metaParams.length === 0 || metaParams.length > activeParamCount) && (
                                            <button
                                                type="button"
                                                className="btn-add-val"
                                                onClick={() => handleUpdateAttributeParam(attrIdx, activeParamCount, '')}
                                                title="Add next optional parameter"
                                            >
                                                + Optional
                                            </button>
                                        )}
                                    </div>
                                ) : isList ? (
                                    <div className="attr-list-values">
                                        {(attr.values && attr.values.length > 0 ? attr.values : ['']).map((valItem, valIdx) => {
                                            const paramSuggs = getParamSuggestions(attr.name, 0);

                                            return (
                                                <div key={`val-${valIdx}`} className="attr-list-item-row">
                                                    <Combobox
                                                        value={valItem}
                                                        onChange={newVal => {
                                                            handleUpdateAttributeParam(attrIdx, valIdx, newVal);
                                                            if (attr.name && onRequestAttributeValueSuggestions) {
                                                                onRequestAttributeValueSuggestions(definition.defType, attr.name, 0, definition, newVal);
                                                            }
                                                        }}
                                                        options={paramSuggs}
                                                        onFocus={() => {
                                                            if (attr.name && onRequestAttributeValueSuggestions) {
                                                                onRequestAttributeValueSuggestions(definition.defType, attr.name, 0, definition, valItem);
                                                            }
                                                        }}
                                                        placeholder={`Item ${valIdx + 1} (e.g. Name, ClosingBalance)`}
                                                    />
                                                    {(attr.values && attr.values.length > 1) && (
                                                        <button
                                                            type="button"
                                                            className="btn-remove-val"
                                                            onClick={() => handleRemoveValueFromList(attrIdx, valIdx)}
                                                            title="Remove this item"
                                                        >
                                                            <span className="codicon codicon-close"></span>
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <div className="attr-list-controls">
                                            <button
                                                type="button"
                                                className="btn-add-val"
                                                onClick={() => handleAddValueToList(attrIdx)}
                                                title="Add another value item"
                                            >
                                                <span className="codicon codicon-add"></span> Add Value
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <Combobox
                                        value={attr.values && attr.values.length > 0 ? attr.values[0] : ''}
                                        onChange={newVal => {
                                            handleUpdateAttributeParam(attrIdx, 0, newVal);
                                            if (attr.name && onRequestAttributeValueSuggestions) {
                                                onRequestAttributeValueSuggestions(definition.defType, attr.name, 0, definition, newVal);
                                            }
                                        }}
                                        options={getParamSuggestions(attr.name, 0)}
                                        onFocus={() => {
                                            if (attr.name && onRequestAttributeValueSuggestions) {
                                                onRequestAttributeValueSuggestions(definition.defType, attr.name, 0, definition, attr.values[0] || '');
                                            }
                                        }}
                                        placeholder={getParamPlaceholder(0)}
                                    />
                                )}
                            </div>

                            <div className="attr-action-col">
                                <button 
                                    type="button"
                                    className="btn-icon btn-danger"
                                    onClick={() => handleRemoveAttribute(attrIdx)}
                                    title="Delete attribute"
                                >
                                    <span className="codicon codicon-trash"></span>
                                </button>
                            </div>
                        </div>
                    );
                })}

                <div className="attr-footer-row">
                    <button 
                        type="button"
                        className="btn-secondary btn-xs"
                        onClick={handleAddAttribute}
                    >
                        <span className="codicon codicon-add"></span> Add Attribute
                    </button>

                    {availableQuickAttrs.length > 0 && (
                        <div className="quick-attr-chips">
                            <span className="quick-chip-label">Quick add:</span>
                            {availableQuickAttrs.slice(0, 5).map((qa, qi) => (
                                <button
                                    key={qi}
                                    type="button"
                                    className="quick-attr-chip"
                                    onClick={() => handleAddQuickAttr(qa)}
                                    title={`Add ${qa} attribute`}
                                >
                                    + {qa}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
