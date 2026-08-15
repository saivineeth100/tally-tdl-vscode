import React from 'react';
import { Combobox } from '../common/Combobox';
import type { PlaygroundDefinitionDTO } from '../../types/playground';

interface HeaderConfigProps {
    tallyRequest: 'Export' | 'Import';
    type: 'Collection' | 'Data';
    id: string;
    definitions: PlaygroundDefinitionDTO[];
    collectionSuggestions: string[];
    reportSuggestions: string[];
    linkedFilePath?: string;
    linkedFileName?: string;
    onChangeTallyRequest: (req: 'Export' | 'Import') => void;
    onChangeType: (type: 'Collection' | 'Data') => void;
    onChangeId: (id: string) => void;
    onRequestSuggestions?: (category: 'collection' | 'report', query?: string) => void;
    onLoadFromActiveEditor: () => void;
    onOpenFilePicker: () => void;
    onOpenLinkedFile?: () => void;
}

export const HeaderConfig: React.FC<HeaderConfigProps> = ({
    tallyRequest,
    type,
    id,
    definitions,
    collectionSuggestions,
    reportSuggestions,
    linkedFilePath,
    linkedFileName,
    onChangeTallyRequest,
    onChangeType,
    onChangeId,
    onRequestSuggestions,
    onLoadFromActiveEditor,
    onOpenFilePicker,
    onOpenLinkedFile
}) => {
    // Dynamic suggestions from currently added definitions in builder
    const builderDefNames = definitions
        .filter(d => (type === 'Collection' ? d.defType.toLowerCase() === 'collection' : d.defType.toLowerCase() === 'report'))
        .map(d => d.name)
        .filter(Boolean);

    const defaultSuggestions = type === 'Collection' 
        ? ['Ledger', 'Group', 'Voucher', 'StockItem', 'Godown', 'Unit', 'CostCentre', 'Currency', ...collectionSuggestions]
        : ['All Masters', 'Vouchers', 'Trial Balance', 'Balance Sheet', 'Profit and Loss', ...reportSuggestions];

    const allSuggestions = Array.from(new Set([...builderDefNames, ...defaultSuggestions]));

    return (
        <div className="playground-card header-config-card">
            <div className="card-header">
                <div className="card-title">
                    <span className="codicon codicon-settings"></span>
                    <span>Request Header</span>
                    {linkedFileName && (
                        <span className="file-linked-badge" title={linkedFilePath}>
                            <span className="codicon codicon-link"></span> {linkedFileName}
                        </span>
                    )}
                </div>
                <div className="card-actions">
                    {linkedFileName && onOpenLinkedFile && (
                        <button 
                            type="button" 
                            className="btn-secondary btn-sm"
                            onClick={onOpenLinkedFile}
                            title={`Open ${linkedFileName} in editor`}
                        >
                            <span className="codicon codicon-go-to-file"></span> Open File
                        </button>
                    )}
                    <button 
                        type="button" 
                        className="btn-secondary btn-sm"
                        onClick={onLoadFromActiveEditor}
                        title="Load XML from active editor in VS Code"
                    >
                        <span className="codicon codicon-file-text"></span> From Editor
                    </button>
                    <button 
                        type="button" 
                        className="btn-secondary btn-sm"
                        onClick={onOpenFilePicker}
                        title="Load XML from file on disk"
                    >
                        <span className="codicon codicon-folder-opened"></span> Load File...
                    </button>
                </div>
            </div>

            <div className="form-grid-3">
                <div className="form-group">
                    <label className="form-label">Request Mode</label>
                    <div className="segmented-control">
                        <button 
                            type="button"
                            className={`segment-btn ${tallyRequest === 'Export' ? 'active' : ''}`}
                            onClick={() => onChangeTallyRequest('Export')}
                        >
                            <span className="codicon codicon-cloud-download"></span> Export
                        </button>
                        <button 
                            type="button"
                            className={`segment-btn ${tallyRequest === 'Import' ? 'active' : ''}`}
                            onClick={() => onChangeTallyRequest('Import')}
                        >
                            <span className="codicon codicon-cloud-upload"></span> Import
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Target Type</label>
                    <div className="segmented-control">
                        <button 
                            type="button"
                            className={`segment-btn ${type === 'Collection' ? 'active' : ''}`}
                            onClick={() => {
                                if (type !== 'Collection') {
                                    onChangeType('Collection');
                                    onChangeId('');
                                }
                            }}
                        >
                            <span className="codicon codicon-list-tree"></span> Collection
                        </button>
                        <button 
                            type="button"
                            className={`segment-btn ${type === 'Data' ? 'active' : ''}`}
                            onClick={() => {
                                if (type !== 'Data') {
                                    onChangeType('Data');
                                    onChangeId('');
                                }
                            }}
                        >
                            <span className="codicon codicon-report"></span> Data
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">
                        {type === 'Collection' ? 'Collection Name / ID' : 'Report Name / ID'}
                    </label>
                    <Combobox
                        value={id}
                        onChange={onChangeId}
                        options={allSuggestions}
                        onFocus={() => onRequestSuggestions && onRequestSuggestions(type === 'Collection' ? 'collection' : 'report', id)}
                        placeholder={type === 'Collection' ? 'e.g. MyLedgers or Ledger' : 'e.g. MyReport or All Masters'}
                    />
                </div>
            </div>
        </div>
    );
};
