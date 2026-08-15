import React, { useState } from 'react';
import { TallyObjectBlock } from './TallyObjectBlock';
import { DefTypePickerModal } from './DefTypePickerModal';
import type { 
    PlaygroundTallyObjectDTO, 
    SchemaPropertyDTO 
} from '../../types/playground';

interface TallyObjectBuilderProps {
    objects: PlaygroundTallyObjectDTO[];
    schemaTypes: string[];
    schemaPropertiesCache: Record<string, SchemaPropertyDTO[]>;
    onRequestSchemaProperties: (schemaType: string) => void;
    onRequestSuggestions?: (category: 'schemaType', query?: string) => void;
    onUpdateObject: (index: number, updated: PlaygroundTallyObjectDTO) => void;
    onDeleteObject: (index: number) => void;
    onMoveObject?: (fromIndex: number, toIndex: number) => void;
    onAddObject: (schemaType: string, action?: 'Create' | 'Alter' | 'Delete') => void;
    onDuplicateObject: (index: number) => void;
}

const DEFAULT_OBJECT_PROPERTIES: Record<string, Array<{ name: string; value?: string; isList?: boolean; children?: Array<{ name: string; value: string }> }>> = {
    ledger: [
        { name: 'NAME', value: '' },
        { name: 'PARENT', value: 'Sundry Debtors' },
        { name: 'OPENINGBALANCE', value: '0.00' }
    ],
    group: [
        { name: 'NAME', value: '' },
        { name: 'PARENT', value: 'Primary' }
    ],
    stockitem: [
        { name: 'NAME', value: '' },
        { name: 'PARENT', value: 'Primary' },
        { name: 'BASEUNITS', value: 'Nos' }
    ],
    unit: [
        { name: 'NAME', value: '' },
        { name: 'ORIGINALNAME', value: '' },
        { name: 'BASEUNITS', value: '' }
    ],
    godown: [
        { name: 'NAME', value: '' },
        { name: 'PARENT', value: 'Primary' }
    ],
    voucher: [
        { name: 'DATE', value: '20240401' },
        { name: 'VOUCHERTYPENAME', value: 'Sales' },
        { name: 'PARTYLEDGERNAME', value: '' },
        { name: 'PERSISTEDVIEW', value: 'Accounting Voucher View' },
        {
            name: 'ALLLEDGERENTRIES.LIST',
            isList: true,
            children: [
                { name: 'LEDGERNAME', value: '' },
                { name: 'ISDEEMEDPOSITIVE', value: 'Yes' },
                { name: 'AMOUNT', value: '-1000.00' }
            ]
        },
        {
            name: 'ALLLEDGERENTRIES.LIST',
            isList: true,
            children: [
                { name: 'LEDGERNAME', value: 'Sales Account' },
                { name: 'ISDEEMEDPOSITIVE', value: 'No' },
                { name: 'AMOUNT', value: '1000.00' }
            ]
        }
    ]
};

export const TallyObjectBuilder: React.FC<TallyObjectBuilderProps> = ({
    objects,
    schemaTypes,
    schemaPropertiesCache,
    onRequestSchemaProperties,
    onRequestSuggestions,
    onUpdateObject,
    onDeleteObject,
    onMoveObject,
    onAddObject,
    onDuplicateObject
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const availableSchemas = schemaTypes.length > 0 ? schemaTypes : [
        'Ledger', 'Group', 'StockItem', 'StockGroup', 'Voucher', 'Unit', 'Godown', 'CostCentre', 'Currency'
    ];

    const handleSelectSchemaType = (schemaType: string) => {
        setIsPickerOpen(false);
        onAddObject(schemaType, 'Create');
    };

    return (
        <div className="playground-card tally-builder-card">
            <div className="card-header">
                <div className="card-title">
                    <span className="codicon codicon-layers"></span>
                    <span>Tally Message Objects (Batch Import)</span>
                    <span className="count-badge">{objects.length}</span>
                </div>

                <div className="card-actions add-def-actions">
                    <button 
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={() => setIsPickerOpen(true)}
                        title="Add a new business object (Ledger, Voucher, etc.) to the batch"
                    >
                        <span className="codicon codicon-add"></span> Add Object
                    </button>
                </div>
            </div>

            <div className="definitions-container">
                {objects.map((obj, idx) => (
                    <TallyObjectBlock
                        key={`obj-${idx}`}
                        index={idx}
                        totalCount={objects.length}
                        object={obj}
                        schemaTypes={availableSchemas}
                        schemaPropertiesCache={schemaPropertiesCache}
                        onRequestSchemaProperties={onRequestSchemaProperties}
                        onUpdateObject={onUpdateObject}
                        onDeleteObject={onDeleteObject}
                        onMoveObject={onMoveObject}
                        onDuplicateObject={onDuplicateObject}
                    />
                ))}

                {objects.length === 0 && (
                    <div className="empty-builder-placeholder">
                        <span className="codicon codicon-package" style={{ fontSize: 32, opacity: 0.5 }}></span>
                        <div className="placeholder-text">No Tally objects added to import batch.</div>
                        <div className="placeholder-subtext">
                            Click <strong>Add Object</strong> above or select a common object type below to start building your import batch.
                        </div>
                        <div className="empty-quick-add-group">
                            {['Ledger', 'Voucher', 'StockItem', 'Group', 'Unit'].map(st => (
                                <button
                                    key={st}
                                    type="button"
                                    className="btn-secondary btn-sm"
                                    onClick={() => onAddObject(st, 'Create')}
                                >
                                    <span className="codicon codicon-add"></span> Add {st}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* QuickPick for adding new object */}
            <DefTypePickerModal 
                isOpen={isPickerOpen}
                mode="schemaTypes"
                availableDefTypes={availableSchemas}
                onSelect={handleSelectSchemaType}
                onClose={() => setIsPickerOpen(false)}
                onSearch={query => onRequestSuggestions?.('schemaType', query)}
            />
        </div>
    );
};
