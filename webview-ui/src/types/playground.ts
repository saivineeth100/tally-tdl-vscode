import type {
    PlaygroundDefinitionDTO,
    PlaygroundAttributeDTO,
    PlaygroundStaticVariableDTO,
    PlaygroundStateDTO,
    PlaygroundSuggestionQueryDTO,
    PlaygroundSuggestionsDTO,
    DefTypeAttributeDTO,
    SchemaPropertyDTO,
    PlaygroundHistoryEntryDTO,
    PlaygroundTemplateDTO
} from 'tally-tdl-shared';

export type {
    PlaygroundDefinitionDTO,
    PlaygroundAttributeDTO,
    PlaygroundStaticVariableDTO,
    PlaygroundStateDTO,
    PlaygroundSuggestionQueryDTO,
    PlaygroundSuggestionsDTO,
    DefTypeAttributeDTO,
    SchemaPropertyDTO,
    PlaygroundHistoryEntryDTO,
    PlaygroundTemplateDTO
};

export interface PlaygroundUIState {
    tallyRequest: 'Export' | 'Import';
    type: 'Collection' | 'Data';
    id: string;
    staticVariables: PlaygroundStaticVariableDTO[];
    definitions: PlaygroundDefinitionDTO[];
    activeTab: 'builder' | 'xml' | 'templates' | 'history';
    linkedFilePath?: string;
    linkedFileName?: string;
}
