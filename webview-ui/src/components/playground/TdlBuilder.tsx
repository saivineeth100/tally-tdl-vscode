import React, { useState } from 'react';
import { DefinitionBlock } from './DefinitionBlock';
import { DefTypePickerModal } from './DefTypePickerModal';
import type { 
    PlaygroundDefinitionDTO, 
    DefTypeAttributeDTO 
} from '../../types/playground';

interface TdlBuilderProps {
    definitions: PlaygroundDefinitionDTO[];
    definitionTypes: string[];
    schemaTypes: string[];
    attributesCache: Record<string, DefTypeAttributeDTO[]>;
    attributeValueSuggestionsCache?: Record<string, string[]>;
    defNameSuggestionsCache?: Record<string, string[]>;
    onRequestAttributesForDefType: (defType: string) => void;
    onRequestAttributeValueSuggestions?: (defType: string, attributeName: string, paramIndex: number, currentDefinition: PlaygroundDefinitionDTO, query?: string) => void;
    onRequestDefNameSuggestions?: (defType: string, query?: string) => void;
    onRequestSuggestions?: (category: 'definitionType', query?: string) => void;
    onUpdateDefinition: (index: number, updated: PlaygroundDefinitionDTO) => void;
    onDeleteDefinition: (index: number) => void;
    onMoveDefinition?: (fromIndex: number, toIndex: number) => void;
    onAddDefinition: (defType: string, name?: string) => void;
}

export const TdlBuilder: React.FC<TdlBuilderProps> = ({
    definitions,
    definitionTypes,
    schemaTypes,
    attributesCache,
    attributeValueSuggestionsCache = {},
    defNameSuggestionsCache = {},
    onRequestAttributesForDefType,
    onRequestAttributeValueSuggestions,
    onRequestDefNameSuggestions,
    onRequestSuggestions,
    onUpdateDefinition,
    onDeleteDefinition,
    onMoveDefinition,
    onAddDefinition
}) => {
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleSelectDefType = (defType: string) => {
        setIsPickerOpen(false);
        onAddDefinition(defType, '');
    };

    return (
        <div className="playground-card tdl-builder-card">
            <div className="card-header">
                <div className="card-title">
                    <span className="codicon codicon-code"></span>
                    <span>TDL Definitions</span>
                    <span className="count-badge">{definitions.length}</span>
                </div>

                <div className="card-actions add-def-actions">
                    <button 
                        type="button"
                        className="btn-primary btn-sm"
                        onClick={() => setIsPickerOpen(true)}
                        title="Add a new TDL definition"
                    >
                        <span className="codicon codicon-add"></span> Add Definition
                    </button>
                </div>
            </div>

            <div className="definitions-container">
                {definitions.map((def, idx) => {
                    const normType = def.defType.replace(/\s+/g, '').toLowerCase();
                    const attrs = attributesCache[normType] || [];

                    return (
                        <DefinitionBlock 
                            key={`def-${idx}`}
                            index={idx}
                            totalCount={definitions.length}
                            definition={def}
                            allDefinitions={definitions}
                            definitionTypes={definitionTypes}
                            schemaTypes={schemaTypes}
                            attributesForDefType={attrs}
                            attributeValueSuggestionsCache={attributeValueSuggestionsCache}
                            defNameSuggestionsCache={defNameSuggestionsCache}
                            onRequestAttributesForDefType={onRequestAttributesForDefType}
                            onRequestAttributeValueSuggestions={onRequestAttributeValueSuggestions}
                            onRequestDefNameSuggestions={onRequestDefNameSuggestions}
                            onUpdateDefinition={onUpdateDefinition}
                            onDeleteDefinition={onDeleteDefinition}
                            onMoveDefinition={onMoveDefinition}
                        />
                    );
                })}

                {definitions.length === 0 && (
                    <div className="empty-builder-placeholder">
                        <span className="codicon codicon-bracket-dot" style={{ fontSize: 32, opacity: 0.5 }}></span>
                        <div className="placeholder-text">No TDL definitions added yet.</div>
                        <div className="placeholder-subtext">
                            Click <strong>Add Definition</strong> above to choose a definition type and create your custom TDL message.
                        </div>
                        <button
                            type="button"
                            className="btn-primary btn-sm"
                            style={{ marginTop: 8 }}
                            onClick={() => setIsPickerOpen(true)}
                        >
                            <span className="codicon codicon-add"></span> Add Definition
                        </button>
                    </div>
                )}
            </div>

            {/* QuickPick Searchable Modal */}
            <DefTypePickerModal 
                isOpen={isPickerOpen}
                availableDefTypes={definitionTypes}
                onSelect={handleSelectDefType}
                onClose={() => setIsPickerOpen(false)}
                onSearch={query => onRequestSuggestions?.('definitionType', query)}
            />
        </div>
    );
};
