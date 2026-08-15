import React, { useEffect } from 'react';
import { Combobox } from '../common/Combobox';
import type { 
    PlaygroundTallyPropertyDTO, 
    SchemaPropertyDTO 
} from '../../types/playground';

interface TallyPropertyRowProps {
    prop: PlaygroundTallyPropertyDTO;
    schemaType: string;
    schemaPropertiesCache: Record<string, SchemaPropertyDTO[]>;
    onRequestSchemaProperties: (schemaType: string) => void;
    onUpdate: (updated: PlaygroundTallyPropertyDTO) => void;
    onDelete: () => void;
    depth?: number;
}

function normalizePropKey(s: string): string {
    return (s || '').replace(/\s+/g, '').replace(/\.list$/i, '').toLowerCase();
}

export const TallyPropertyRow: React.FC<TallyPropertyRowProps> = ({
    prop,
    schemaType,
    schemaPropertiesCache,
    onRequestSchemaProperties,
    onUpdate,
    onDelete,
    depth = 0
}) => {
    const normSchemaType = (schemaType || '').toLowerCase().trim();

    useEffect(() => {
        if (normSchemaType) {
            onRequestSchemaProperties(normSchemaType);
        }
    }, [normSchemaType, onRequestSchemaProperties]);

    const schemaProps = schemaPropertiesCache[normSchemaType] || [];

    const availableOptions = schemaProps.map(p => {
        const cleanTag = p.name.replace(/\s+/g, '');
        const isList = p.isComplex || p.isRepeated || !!p.objectName;
        const displayTag = isList ? (cleanTag.toUpperCase().endsWith('.LIST') ? cleanTag : `${cleanTag}.LIST`) : cleanTag;
        return {
            value: displayTag,
            label: `${displayTag} (${p.name})`,
            description: p.isComplex ? `Complex: ${p.objectName || 'Object'}` : (p.isRepeated ? 'Repeated List' : (p.dataType || 'Field'))
        };
    });

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

    const handleNameChange = (newName: string) => {
        const { isList, isComplex, baseTag, containerTag, childSchemaType } = resolvePropertyType(newName);

        if (isList) {
            if (childSchemaType) {
                onRequestSchemaProperties(childSchemaType);
            }

            let children = prop.children || [];
            const norm = normalizePropKey(newName);

            if (!isComplex) {
                // Primitive Repeated List: e.g. <BASICUSERDESCRIPTION.LIST><BASICUSERDESCRIPTION>Line 1</BASICUSERDESCRIPTION></BASICUSERDESCRIPTION.LIST>
                if (children.length === 0 || children.every(c => !c.name || c.name === baseTag)) {
                    children = children.length > 0 ? children.map(c => ({ ...c, name: baseTag })) : [{ name: baseTag, value: '' }];
                }
            } else {
                // Complex List (e.g. ALLINVENTORYENTRIES.LIST, ALLLEDGERENTRIES.LIST, BATCHALLOCATIONS.LIST)
                if (children.length === 0) {
                    if (norm === 'allledgerentries' || norm === 'ledgerentries') {
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
                    } else if (norm === 'batchallocations') {
                        children = [
                            { name: 'BATCHNAME', value: '' },
                            { name: 'AMOUNT', value: '0.00' },
                            { name: 'ACTUALQTY', value: '' }
                        ];
                    } else {
                        children = [{ name: '', value: '' }];
                    }
                }
            }

            onUpdate({
                name: containerTag,
                isList: true,
                children
            });
        } else {
            onUpdate({
                name: baseTag || newName.trim(),
                value: prop.value || '',
                isList: false,
                children: undefined
            });
        }
    };

    const handleValueChange = (val: string) => {
        onUpdate({
            ...prop,
            value: val
        });
    };

    // Handlers for nested children inside complex list
    const handleAddComplexChild = (defaultName: string = '') => {
        const currentChildren = [...(prop.children || [])];
        currentChildren.push({ name: defaultName, value: '' });
        onUpdate({
            ...prop,
            children: currentChildren
        });
    };

    const handleUpdateChild = (childIdx: number, updatedChild: PlaygroundTallyPropertyDTO) => {
        const currentChildren = [...(prop.children || [])];
        currentChildren[childIdx] = updatedChild;
        onUpdate({
            ...prop,
            children: currentChildren
        });
    };

    const handleDeleteChild = (childIdx: number) => {
        const currentChildren = (prop.children || []).filter((_, i) => i !== childIdx);
        onUpdate({
            ...prop,
            children: currentChildren
        });
    };

    // Handlers for primitive lines inside primitive repeated list
    const handleAddPrimitiveLine = (baseTag: string) => {
        const currentChildren = [...(prop.children || [])];
        currentChildren.push({ name: baseTag, value: '' });
        onUpdate({
            ...prop,
            children: currentChildren
        });
    };

    const handleUpdatePrimitiveLine = (childIdx: number, baseTag: string, val: string) => {
        const currentChildren = [...(prop.children || [])];
        currentChildren[childIdx] = { name: baseTag, value: val };
        onUpdate({
            ...prop,
            children: currentChildren
        });
    };

    // Determine current rendering mode
    const { isComplex, baseTag, childSchemaType } = resolvePropertyType(prop.name);
    const isList = prop.isList || prop.name.toUpperCase().endsWith('.LIST') || (prop.children && prop.children.length > 0);

    if (isList) {
        if (!isComplex) {
            // Primitive Repeated List: e.g. <BASICUSERDESCRIPTION.LIST><BASICUSERDESCRIPTION>Line 1</BASICUSERDESCRIPTION></BASICUSERDESCRIPTION.LIST>
            return (
                <div className="nested-list-block">
                    <div className="nested-list-header">
                        <div className="nested-list-title">
                            <span className="codicon codicon-list-tree"></span>
                            <Combobox 
                                value={prop.name}
                                onChange={handleNameChange}
                                options={availableOptions}
                                placeholder="LIST Tag (e.g. BASICUSERDESCRIPTION.LIST)"
                            />
                        </div>
                        <div className="nested-list-actions">
                            <button 
                                type="button" 
                                className="btn-secondary btn-sm"
                                onClick={() => handleAddPrimitiveLine(baseTag)}
                                title={`Add another <${baseTag}> line`}
                            >
                                <span className="codicon codicon-add"></span> Add Line
                            </button>
                            <button 
                                type="button" 
                                className="btn-icon btn-danger btn-sm"
                                onClick={onDelete}
                                title="Remove this list"
                            >
                                <span className="codicon codicon-trash"></span>
                            </button>
                        </div>
                    </div>

                    <div className="nested-list-body">
                        {(prop.children || []).map((child, childIdx) => {
                            const childTag = child.name || baseTag;
                            return (
                                <div key={`primitive-child-${childIdx}`} className="attr-row nested-child-row">
                                    <div className="primitive-list-tag-badge" title={`<${childTag}>`}>
                                        &lt;{childTag}&gt;
                                    </div>
                                    <span className="attr-colon">:</span>
                                    <div className="attr-value-col">
                                        <input 
                                            type="text"
                                            className="form-input form-input-sm"
                                            value={child.value || ''}
                                            onChange={e => handleUpdatePrimitiveLine(childIdx, childTag, e.target.value)}
                                            placeholder={`Line ${childIdx + 1} value`}
                                        />
                                    </div>
                                    <button 
                                        type="button" 
                                        className="btn-icon btn-danger btn-sm"
                                        onClick={() => handleDeleteChild(childIdx)}
                                        title="Remove line"
                                    >
                                        <span className="codicon codicon-close"></span>
                                    </button>
                                </div>
                            );
                        })}

                        {(!prop.children || prop.children.length === 0) && (
                            <div className="nested-list-empty">
                                No lines in this list. Click <strong>+ Add Line</strong> above.
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Complex List: e.g. <ALLINVENTORYENTRIES.LIST> containing recursive child properties
        return (
            <div className="nested-list-block">
                <div className="nested-list-header">
                    <div className="nested-list-title">
                        <span className="codicon codicon-list-tree"></span>
                        <Combobox 
                            value={prop.name}
                            onChange={handleNameChange}
                            options={availableOptions}
                            placeholder="LIST Tag (e.g. ALLINVENTORYENTRIES.LIST)"
                        />
                    </div>
                    <div className="nested-list-actions">
                        <button 
                            type="button" 
                            className="btn-secondary btn-sm"
                            onClick={() => handleAddComplexChild('')}
                            title="Add child field to this list"
                        >
                            <span className="codicon codicon-add"></span> Add Field
                        </button>
                        <button 
                            type="button" 
                            className="btn-icon btn-danger btn-sm"
                            onClick={onDelete}
                            title="Remove this list"
                        >
                            <span className="codicon codicon-trash"></span>
                        </button>
                    </div>
                </div>

                <div className="nested-list-body">
                    {(prop.children || []).map((child, childIdx) => (
                        <TallyPropertyRow
                            key={`complex-child-${childIdx}`}
                            prop={child}
                            schemaType={childSchemaType || baseTag}
                            schemaPropertiesCache={schemaPropertiesCache}
                            onRequestSchemaProperties={onRequestSchemaProperties}
                            onUpdate={updatedChild => handleUpdateChild(childIdx, updatedChild)}
                            onDelete={() => handleDeleteChild(childIdx)}
                            depth={depth + 1}
                        />
                    ))}

                    {(!prop.children || prop.children.length === 0) && (
                        <div className="nested-list-empty">
                            No fields in this list. Click <strong>+ Add Field</strong> above.
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Flat key-value property: e.g. <NAME>Value</NAME> or <STOCKITEMNAME>Value</STOCKITEMNAME>
    return (
        <div className="attr-row">
            <div className="attr-name-col">
                <Combobox 
                    value={prop.name}
                    onChange={handleNameChange}
                    options={availableOptions}
                    placeholder="Field / Property (e.g. NAME, RATE)"
                />
            </div>

            <span className="attr-colon">:</span>

            <div className="attr-value-col">
                <input 
                    type="text"
                    className="form-input"
                    value={prop.value || ''}
                    onChange={e => handleValueChange(e.target.value)}
                    placeholder={`Value for ${prop.name || 'field'}`}
                />
            </div>

            <button 
                type="button" 
                className="btn-icon btn-danger"
                onClick={onDelete}
                title="Remove property"
            >
                <span className="codicon codicon-trash"></span>
            </button>
        </div>
    );
};
