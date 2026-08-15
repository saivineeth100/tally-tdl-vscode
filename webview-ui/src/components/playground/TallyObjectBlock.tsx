import React, { useState, useEffect } from 'react';
import { DefTypePickerModal } from './DefTypePickerModal';
import { TallyPropertyRow } from './TallyPropertyRow';
import type { 
    PlaygroundTallyObjectDTO, 
    PlaygroundTallyPropertyDTO, 
    SchemaPropertyDTO 
} from '../../types/playground';

interface TallyObjectBlockProps {
    index: number;
    totalCount?: number;
    object: PlaygroundTallyObjectDTO;
    schemaTypes: string[];
    schemaPropertiesCache: Record<string, SchemaPropertyDTO[]>;
    onRequestSchemaProperties: (schemaType: string) => void;
    onUpdateObject: (index: number, updated: PlaygroundTallyObjectDTO) => void;
    onDeleteObject: (index: number) => void;
    onMoveObject?: (fromIndex: number, toIndex: number) => void;
    onDuplicateObject: (index: number) => void;
}

function normalizePropKey(s: string): string {
    return (s || '').replace(/\s+/g, '').replace(/\.list$/i, '').toLowerCase();
}

export const TallyObjectBlock: React.FC<TallyObjectBlockProps> = ({
    index,
    totalCount,
    object,
    schemaTypes,
    schemaPropertiesCache,
    onRequestSchemaProperties,
    onUpdateObject,
    onDeleteObject,
    onMoveObject,
    onDuplicateObject
}) => {
    const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
    const [showXmlAttrs, setShowXmlAttrs] = useState(false);

    const normSchemaType = (object.objectType || 'Ledger').toLowerCase().trim();

    // Auto-fetch schema properties on mount or when schema type changes
    useEffect(() => {
        if (object.objectType) {
            onRequestSchemaProperties(object.objectType);
        }
    }, [object.objectType, onRequestSchemaProperties]);

    const schemaProps = schemaPropertiesCache[normSchemaType] || [];

    const handleActionChange = (newAction: 'Create' | 'Alter' | 'Delete') => {
        onUpdateObject(index, {
            ...object,
            action: newAction
        });
    };

    const handleTypeChange = (newType: string) => {
        onRequestSchemaProperties(newType);
        onUpdateObject(index, {
            ...object,
            objectType: newType
        });
    };

    const resolvePropertyType = (name: string) => {
        const cleanName = (name || '').trim();
        const inputNorm = normalizePropKey(cleanName);
        const matchingProp = schemaProps.find(p => normalizePropKey(p.name) === inputNorm || normalizePropKey(p.name) === cleanName.toLowerCase());

        const isComplex = matchingProp ? (matchingProp.isComplex || !!matchingProp.objectName) : (
            inputNorm.includes('entries') || 
            inputNorm.includes('allocations') || 
            inputNorm.includes('details')
        );
        const isRepeated = matchingProp ? (matchingProp.isRepeated || false) : (
            cleanName.toUpperCase().endsWith('.LIST') || 
            inputNorm === 'address' || 
            inputNorm.includes('description')
        );
        const isList = isComplex || isRepeated || cleanName.toUpperCase().endsWith('.LIST');

        const baseTag = (matchingProp ? matchingProp.name : cleanName).replace(/\s+/g, '').toUpperCase().replace(/\.LIST$/i, '');
        const containerTag = isList ? `${baseTag}.LIST` : baseTag;
        const childSchemaType = matchingProp?.objectName || (isComplex ? baseTag : '');

        return {
            matchingProp,
            isList,
            isComplex,
            isRepeated,
            baseTag,
            containerTag,
            childSchemaType
        };
    };

    const handleAddProperty = (defaultName: string = '') => {
        const newProps = [...object.properties];
        if (defaultName) {
            const { isList, isComplex, baseTag, containerTag, childSchemaType } = resolvePropertyType(defaultName);

            if (isList) {
                if (childSchemaType) {
                    onRequestSchemaProperties(childSchemaType);
                }

                let children: PlaygroundTallyPropertyDTO[] = [];
                const norm = normalizePropKey(defaultName);
                if (!isComplex) {
                    // Primitive Repeated List: e.g. <ADDRESS.LIST><ADDRESS>Line 1</ADDRESS></ADDRESS.LIST>
                    children = [{ name: baseTag, value: '' }];
                } else if (norm === 'allledgerentries' || norm === 'ledgerentries') {
                    children = [
                        { name: 'LEDGERNAME', value: '' },
                        { name: 'ISDEEMEDPOSITIVE', value: 'Yes' },
                        { name: 'AMOUNT', value: '0.00' }
                    ];
                } else if (norm === 'allinventoryentries' || norm === 'inventoryentries' || norm === 'inventoryallocations') {
                    children = [
                        { name: 'STOCKITEMNAME', value: '' },
                        { name: 'RATE', value: '' },
                        { name: 'AMOUNT', value: '0.00' },
                        { name: 'ACTUALQTY', value: '' }
                    ];
                } else {
                    children = [{ name: '', value: '' }];
                }

                newProps.push({
                    name: containerTag,
                    isList: true,
                    children
                });
            } else {
                newProps.push({
                    name: baseTag,
                    value: ''
                });
            }
        } else {
            newProps.push({
                name: '',
                value: ''
            });
        }

        onUpdateObject(index, {
            ...object,
            properties: newProps
        });
    };

    const handleNameChange = (newName: string) => {
        const isMaster = (object.objectType || '').toLowerCase() !== 'voucher';
        let updatedProps = [...object.properties];

        if (isMaster) {
            if (updatedProps.some(p => p.name.toUpperCase().trim() === 'NAME')) {
                updatedProps = updatedProps.map(p => 
                    p.name.toUpperCase().trim() === 'NAME' ? { ...p, value: newName } : p
                );
            }

            const langIdx = updatedProps.findIndex(p => p.name.toUpperCase().trim() === 'LANGUAGENAME.LIST');
            if (langIdx !== -1) {
                const langProp = updatedProps[langIdx];
                const langChildren = [...(langProp.children || [])];
                const nameListIdx = langChildren.findIndex(c => c.name.toUpperCase().trim() === 'NAME.LIST');
                if (nameListIdx !== -1) {
                    const nameListProp = langChildren[nameListIdx];
                    const nameListChildren = [...(nameListProp.children || [])];
                    if (nameListChildren.length > 0) {
                        nameListChildren[0] = { ...nameListChildren[0], value: newName };
                        langChildren[nameListIdx] = { ...nameListProp, children: nameListChildren };
                        updatedProps[langIdx] = { ...langProp, children: langChildren };
                    }
                }
            }
        }

        onUpdateObject(index, {
            ...object,
            name: newName,
            properties: updatedProps
        });
    };

    const handleUpdateProperty = (propIdx: number, updatedProp: PlaygroundTallyPropertyDTO) => {
        const newProps = [...object.properties];
        newProps[propIdx] = updatedProp;
        
        let newObjectName = object.name;
        if (updatedProp.name.toUpperCase().trim() === 'NAME' && updatedProp.value !== undefined) {
            newObjectName = updatedProp.value;
        }

        onUpdateObject(index, {
            ...object,
            name: newObjectName,
            properties: newProps
        });
    };

    const handleDeleteProperty = (propIdx: number) => {
        const newProps = object.properties.filter((_, i) => i !== propIdx);
        onUpdateObject(index, {
            ...object,
            properties: newProps
        });
    };

    const existingPropNames = new Set(object.properties.map(p => normalizePropKey(p.name)));
    const availableQuickProps = schemaProps
        .filter(p => !existingPropNames.has(normalizePropKey(p.name)))
        .slice(0, 6)
        .map(p => p.name);

    return (
        <div className="definition-card tally-object-card">
            <div className="def-card-header">
                <div className="def-type-name-group">
                    <div className="def-type-selector">
                        <button 
                            type="button"
                            className="def-type-badge-btn schema-type-badge"
                            onClick={() => setIsTypePickerOpen(true)}
                            title="Click to change object schema type"
                        >
                            <span className="def-type-text">{object.objectType || 'Ledger'}</span>
                            <span className="codicon codicon-chevron-down def-type-chevron"></span>
                        </button>
                    </div>

                    {/* Action Selector */}
                    <div className="object-action-control">
                        {(['Create', 'Alter', 'Delete'] as const).map(action => (
                            <button
                                key={action}
                                type="button"
                                className={`object-action-pill ${object.action === action ? `active-${action.toLowerCase()}` : ''}`}
                                onClick={() => handleActionChange(action)}
                            >
                                {action}
                            </button>
                        ))}
                    </div>

                    <div className="def-name-col">
                        <input 
                            type="text"
                            className="form-input def-name-input"
                            value={object.name || ''}
                            onChange={e => handleNameChange(e.target.value)}
                            placeholder={`Object Name / ID (e.g. ${object.objectType || 'Ledger'} 1)`}
                        />
                    </div>
                </div>

                <div className="def-card-actions">
                    {onMoveObject && (
                        <div className="card-order-controls">
                            <button
                                type="button"
                                className="btn-icon"
                                onClick={() => onMoveObject(index, index - 1)}
                                disabled={index === 0}
                                title="Move object up in batch sequence"
                            >
                                <span className="codicon codicon-arrow-up"></span>
                            </button>
                            <button
                                type="button"
                                className="btn-icon"
                                onClick={() => onMoveObject(index, index + 1)}
                                disabled={index === (totalCount !== undefined ? totalCount - 1 : index)}
                                title="Move object down in batch sequence"
                            >
                                <span className="codicon codicon-arrow-down"></span>
                            </button>
                        </div>
                    )}
                    <button 
                        type="button" 
                        className={`btn-tag ${showXmlAttrs ? 'active' : ''}`}
                        onClick={() => setShowXmlAttrs(!showXmlAttrs)}
                        title="Toggle Object Attributes (VCHTYPE, OBJVIEW)"
                    >
                        <span className="codicon codicon-tag"></span> Attrs
                    </button>
                    <button 
                        type="button"
                        className="btn-icon"
                        onClick={() => onDuplicateObject(index)}
                        title="Duplicate this object in batch"
                    >
                        <span className="codicon codicon-copy"></span>
                    </button>
                    <button 
                        type="button"
                        className="btn-icon btn-danger"
                        onClick={() => onDeleteObject(index)}
                        title="Delete this object"
                    >
                        <span className="codicon codicon-trash"></span>
                    </button>
                </div>
            </div>

            {/* XML Attributes Bar */}
            {showXmlAttrs && (
                <div className="xml-attrs-bar">
                    <div className="xml-attr-input-group">
                        <label className="xml-attr-label">VCHTYPE:</label>
                        <input 
                            type="text"
                            className="form-input form-input-sm"
                            value={object.vchType || ''}
                            onChange={e => onUpdateObject(index, { ...object, vchType: e.target.value })}
                            placeholder="e.g. Sales, Payment"
                        />
                    </div>
                    <div className="xml-attr-input-group">
                        <label className="xml-attr-label">OBJVIEW:</label>
                        <input 
                            type="text"
                            className="form-input form-input-sm"
                            value={object.objView || ''}
                            onChange={e => onUpdateObject(index, { ...object, objView: e.target.value })}
                            placeholder="e.g. Accounting Voucher View"
                        />
                    </div>
                </div>
            )}

            {/* Object Type QuickPick Modal */}
            <DefTypePickerModal 
                isOpen={isTypePickerOpen}
                mode="schemaTypes"
                availableDefTypes={schemaTypes.length > 0 ? schemaTypes : ['Ledger', 'Group', 'StockItem', 'StockGroup', 'Voucher', 'Unit', 'Godown', 'CostCentre', 'Currency']}
                onSelect={newType => {
                    setIsTypePickerOpen(false);
                    handleTypeChange(newType);
                }}
                onClose={() => setIsTypePickerOpen(false)}
            />

            {/* Properties Container with Recursive TallyPropertyRow */}
            <div className="attributes-container">
                {object.properties.map((prop, propIdx) => (
                    <TallyPropertyRow
                        key={`root-prop-${propIdx}`}
                        prop={prop}
                        schemaType={object.objectType || 'Ledger'}
                        schemaPropertiesCache={schemaPropertiesCache}
                        onRequestSchemaProperties={onRequestSchemaProperties}
                        onUpdate={updatedProp => handleUpdateProperty(propIdx, updatedProp)}
                        onDelete={() => handleDeleteProperty(propIdx)}
                        depth={0}
                    />
                ))}

                {object.properties.length === 0 && (
                    <div className="empty-attrs-hint">
                        No properties added yet. Click <strong>+ Add Property</strong> below.
                    </div>
                )}
            </div>

            {/* Object Actions Footer */}
            <div className="def-card-footer">
                <div className="add-attr-btn-group">
                    <button 
                        type="button" 
                        className="btn-secondary btn-sm"
                        onClick={() => handleAddProperty('')}
                    >
                        <span className="codicon codicon-add"></span> Add Property
                    </button>
                </div>

                {availableQuickProps.length > 0 && (
                    <div className="quick-attrs-container">
                        <span className="quick-attrs-label">Quick add:</span>
                        <div className="quick-attrs-chips">
                            {availableQuickProps.map(propName => (
                                <button 
                                    key={propName}
                                    type="button" 
                                    className="quick-attr-chip"
                                    onClick={() => handleAddProperty(propName)}
                                    title={`Quick add ${propName}`}
                                >
                                    + {propName}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
