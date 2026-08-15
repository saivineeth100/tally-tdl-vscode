import React, { useEffect, useState, useCallback } from 'react';
import { vscode } from '../../utils/vscode';
import { HeaderConfig } from './HeaderConfig';
import { StaticVarsPanel } from './StaticVarsPanel';
import { TdlBuilder } from './TdlBuilder';
import { XmlPreview, generateEnvelopeXml } from './XmlPreview';
import { TemplatesPanel } from './TemplatesPanel';
import { HistoryPanel } from './HistoryPanel';
import type { 
    PlaygroundDefinitionDTO, 
    PlaygroundStaticVariableDTO,
    DefTypeAttributeDTO,
    PlaygroundTemplateDTO,
    PlaygroundHistoryEntryDTO,
    PlaygroundStateDTO
} from '../../types/playground';
import type { WebviewMessage } from '../../types';

export const ApiPlayground: React.FC = () => {
    // Top-level tab: builder / xml / templates / history
    const [activeTab, setActiveTab] = useState<'builder' | 'xml' | 'templates' | 'history'>('builder');

    // Header State
    const [tallyRequest, setTallyRequest] = useState<'Export' | 'Import'>('Export');
    const [type, setType] = useState<'Collection' | 'Data'>('Collection');
    const [id, setId] = useState<string>('MyLedgers');

    // Linked file tracking
    const [linkedFilePath, setLinkedFilePath] = useState<string | undefined>(undefined);
    const [linkedFileName, setLinkedFileName] = useState<string | undefined>(undefined);

    // Static Variables State
    const [staticVariables, setStaticVariables] = useState<PlaygroundStaticVariableDTO[]>([
        { name: 'SVEXPORTFORMAT', value: '$$SysName:XML' },
        { name: 'SVCURRENTCOMPANY', value: '' }
    ]);

    // TDL Definitions State
    const [definitions, setDefinitions] = useState<PlaygroundDefinitionDTO[]>([
        {
            defType: 'Collection',
            name: 'MyLedgers',
            attributes: [
                { name: 'Type', values: ['Ledger'] },
                { name: 'NativeMethod', values: ['Name', 'ClosingBalance'] }
            ]
        }
    ]);

    // Suggestions from LSP on-demand
    const [definitionTypes, setDefinitionTypes] = useState<string[]>([
        'Collection', 'Report', 'Form', 'Part', 'Line', 'Field', 'Menu', 'Button', 'Border', 'Style', 'Color', 'Object', 'Function', 'Variable'
    ]);
    const [schemaTypes, setSchemaTypes] = useState<string[]>([
        'Ledger', 'Group', 'Voucher', 'StockItem', 'StockGroup', 'Unit', 'Godown', 'CostCentre', 'Currency', 'Company', 'AttendanceType'
    ]);
    const [collectionSuggestions, setCollectionSuggestions] = useState<string[]>([]);
    const [reportSuggestions, setReportSuggestions] = useState<string[]>([]);

    // Attribute suggestions cache by defType
    const [attributesCache, setAttributesCache] = useState<Record<string, DefTypeAttributeDTO[]>>({});
    const [attributeValueSuggestionsCache, setAttributeValueSuggestionsCache] = useState<Record<string, string[]>>({});
    const [defNameSuggestionsCache, setDefNameSuggestionsCache] = useState<Record<string, string[]>>({});

    // Open companies in Tally
    const [companies, setCompanies] = useState<string[]>([]);

    // Templates
    const [templates, setTemplates] = useState<PlaygroundTemplateDTO[]>([]);

    // History
    const [history, setHistory] = useState<PlaygroundHistoryEntryDTO[]>([]);

    // Sending state
    const [isSending, setIsSending] = useState<boolean>(false);

    // Notification / status banner
    const [statusBanner, setStatusBanner] = useState<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

    const showBanner = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        setStatusBanner({ message, type });
        setTimeout(() => setStatusBanner(null), 4000);
    };

    // Suggestions helpers
    const requestSuggestions = useCallback((category: 'definitionType' | 'schemaType' | 'collection' | 'report', query?: string) => {
        vscode.postMessage({
            command: 'getSuggestions',
            query: { category, query: query || '' }
        });
    }, []);

    const requestDefNameSuggestions = useCallback((defType: string, query?: string) => {
        if (!defType) return;
        vscode.postMessage({
            command: 'getPlaygroundSuggestions',
            category: 'definitionName',
            defType,
            query: query || '',
            limit: 500
        });
    }, []);

    const requestAttributesForDefType = useCallback((defType: string) => {
        const norm = defType.replace(/\s+/g, '').toLowerCase();
        if (!attributesCache[norm]) {
            vscode.postMessage({
                command: 'getAttributesForDefType',
                defType: defType
            });
        }
    }, [attributesCache]);

    const requestAttributeValueSuggestions = useCallback((
        defType: string, 
        attributeName: string, 
        paramIndex: number = 0,
        currentDefinition?: PlaygroundDefinitionDTO, 
        query?: string
    ) => {
        vscode.postMessage({
            command: 'getSuggestions',
            query: {
                category: 'attributeValue',
                defType,
                attributeName,
                paramIndex,
                query: query || '',
                currentDefinition
            }
        });
    }, []);

    // Apply parsed state (e.g. from file, template, or history)
    const applyParsedState = (state: PlaygroundStateDTO) => {
        if (state.tallyRequest) setTallyRequest(state.tallyRequest);
        if (state.type) setType(state.type);
        if (state.id !== undefined) setId(state.id);
        if (state.staticVariables) setStaticVariables(state.staticVariables);
        if (state.definitions) setDefinitions(state.definitions);
        if (state.linkedFilePath) setLinkedFilePath(state.linkedFilePath);
        if (state.linkedFileName) setLinkedFileName(state.linkedFileName);
        setActiveTab('builder');
        showBanner('Loaded configuration into visual builder', 'success');
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const message = event.data as WebviewMessage;

            switch (message.command) {
                case 'suggestionsResult':
                    if (message.suggestions) {
                        const { category, items, defType, attributeName, paramIndex } = message.suggestions;
                        if (category === 'definitionType') setDefinitionTypes(items);
                        else if (category === 'schemaType') setSchemaTypes(items);
                        else if (category === 'collection') setCollectionSuggestions(items);
                        else if (category === 'report') setReportSuggestions(items);
                        else if (category === 'definitionName' && defType) {
                            const norm = defType.toLowerCase().trim();
                            setDefNameSuggestionsCache(prev => ({
                                ...prev,
                                [norm]: items
                            }));
                        }
                        else if (category === 'attributeValue' && defType && attributeName) {
                            const pIdx = paramIndex ?? 0;
                            const indexedKey = `${defType.toLowerCase().trim()}:${attributeName.toLowerCase().trim()}:${pIdx}`;
                            const baseKey = `${defType.toLowerCase().trim()}:${attributeName.toLowerCase().trim()}`;
                            setAttributeValueSuggestionsCache(prev => ({
                                ...prev,
                                [indexedKey]: items,
                                ...(pIdx === 0 ? { [baseKey]: items } : {})
                            }));
                        }
                    }
                    break;

                case 'attributesResult':
                    if (message.defType && message.attributes) {
                        const norm = message.defType.replace(/\s+/g, '').toLowerCase();
                        setAttributesCache(prev => ({
                            ...prev,
                            [norm]: message.attributes || []
                        }));
                    }
                    break;

                case 'companiesList':
                    if (message.companies) {
                        setCompanies(message.companies);
                        if (message.companies.length > 0) {
                            setStaticVariables(prev => prev.map(v => {
                                if (v.name.toUpperCase() === 'SVCURRENTCOMPANY' && !v.value) {
                                    return { ...v, value: message.companies![0] };
                                }
                                return v;
                            }));
                        }
                    }
                    break;

                case 'templatesData':
                    if (message.templates) {
                        setTemplates(message.templates);
                    }
                    break;

                case 'historyData':
                    if (message.history) {
                        setHistory(message.history);
                    }
                    break;

                case 'historyEntryAdded':
                    if (message.historyEntry) {
                        setIsSending(false);
                        setHistory(prev => [message.historyEntry!, ...prev]);
                        if (message.historyEntry.error) {
                            showBanner(`Request failed: ${message.historyEntry.error}`, 'error');
                        } else {
                            showBanner(`Request sent (${message.historyEntry.elapsedMs || 0}ms)`, 'success');
                        }
                    }
                    break;

                case 'fileLoaded':
                    if (message.state) {
                        applyParsedState(message.state);
                    }
                    break;

                case 'requestStatus':
                    if (message.data?.sending !== undefined) {
                        setIsSending(message.data.sending);
                    }
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        // Initial requests to extension host
        vscode.postMessage({ command: 'getPlaygroundInit' });

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    // Ensure attributes metadata is loaded for all definitions on start and changes
    useEffect(() => {
        for (const def of definitions) {
            if (def.defType) {
                requestAttributesForDefType(def.defType);
            }
        }
    }, [definitions, requestAttributesForDefType]);

    // Static Variables Handlers
    const handleUpdateStaticVar = (index: number, name: string, value: string) => {
        setStaticVariables(prev => {
            const next = [...prev];
            next[index] = { name, value };
            return next;
        });
    };

    const handleAddStaticVar = () => {
        setStaticVariables(prev => [...prev, { name: '', value: '' }]);
    };

    const handleRemoveStaticVar = (index: number) => {
        setStaticVariables(prev => prev.filter((_, i) => i !== index));
    };

    const handleRefreshCompanies = () => {
        vscode.postMessage({ command: 'fetchCompanies' });
        showBanner('Refreshing active companies from Tally...');
    };

    // TDL Definitions Handlers
    const handleUpdateDefinition = (index: number, updated: PlaygroundDefinitionDTO) => {
        setDefinitions(prev => {
            const next = [...prev];
            next[index] = updated;
            return next;
        });
    };

    const handleDeleteDefinition = (index: number) => {
        setDefinitions(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddDefinition = (defType: string, name?: string) => {
        requestAttributesForDefType(defType);
        const newDef: PlaygroundDefinitionDTO = {
            defType: defType || 'Collection',
            name: name || '',
            attributes: defType.toLowerCase() === 'collection' 
                ? [{ name: 'Type', values: ['Ledger'] }] 
                : [{ name: '', values: [''] }]
        };
        setDefinitions(prev => [...prev, newDef]);
    };

    // Actions
    const handleSendRequest = (xml?: string) => {
        const currentXml = xml || generateEnvelopeXml(tallyRequest, type, id, staticVariables, definitions);
        setIsSending(true);
        vscode.postMessage({
            command: 'sendRequest',
            xml: currentXml,
            meta: {
                type,
                idField: id,
                label: `${tallyRequest} ${type}: ${id}`
            }
        });
    };

    const handleOpenInEditor = (xml?: string, filePath?: string) => {
        const finalXml = xml || generateEnvelopeXml(tallyRequest, type, id, staticVariables, definitions);
        vscode.postMessage({
            command: 'openInEditor',
            xml: finalXml,
            filePath: filePath || linkedFilePath
        });
    };

    const handleApplyXmlToUi = (xml: string) => {
        vscode.postMessage({
            command: 'parseTemplateXml',
            xml
        });
    };

    const handleLoadFromActiveEditor = () => {
        vscode.postMessage({ command: 'loadFromActiveEditor' });
    };

    const handleOpenFilePicker = () => {
        vscode.postMessage({ command: 'openFilePicker' });
    };

    const handleApplyTemplate = (template: PlaygroundTemplateDTO) => {
        vscode.postMessage({
            command: 'parseTemplateXml',
            xml: template.xml
        });
    };

    const handleOpenTemplateInEditor = (template: PlaygroundTemplateDTO) => {
        vscode.postMessage({
            command: 'openInEditor',
            xml: template.xml
        });
    };

    const handleLoadHistoryEntry = (entry: PlaygroundHistoryEntryDTO) => {
        vscode.postMessage({
            command: 'parseHistoryXml',
            xml: entry.requestXml
        });
    };

    const handleViewResponse = (entry: PlaygroundHistoryEntryDTO) => {
        if (entry.responsePath) {
            vscode.postMessage({
                command: 'viewResponse',
                responsePath: entry.responsePath
            });
        }
    };

    const handleClearHistory = () => {
        vscode.postMessage({ command: 'clearHistory' });
        setHistory([]);
        showBanner('History cleared', 'info');
    };

    const currentGeneratedXml = generateEnvelopeXml(tallyRequest, type, id, staticVariables, definitions);

    return (
        <div className="playground-container">
            {/* Top Navigation Bar */}
            <div className="playground-navbar">
                <div className="navbar-brand">
                    <span className="codicon codicon-beaker brand-icon"></span>
                    <span className="brand-title">Tally XML Playground</span>
                </div>

                <div className="navbar-tabs">
                    <button 
                        type="button"
                        className={`tab-btn ${activeTab === 'builder' ? 'active' : ''}`}
                        onClick={() => setActiveTab('builder')}
                    >
                        <span className="codicon codicon-edit"></span> Visual Builder
                    </button>
                    <button 
                        type="button"
                        className={`tab-btn ${activeTab === 'xml' ? 'active' : ''}`}
                        onClick={() => setActiveTab('xml')}
                    >
                        <span className="codicon codicon-code"></span> XML View
                    </button>
                    <button 
                        type="button"
                        className={`tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
                        onClick={() => setActiveTab('templates')}
                    >
                        <span className="codicon codicon-library"></span> Templates
                    </button>
                    <button 
                        type="button"
                        className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        <span className="codicon codicon-history"></span> History ({history.length})
                    </button>
                </div>

                <div className="navbar-actions">
                    {linkedFileName ? (
                        <>
                            <span className="file-linked-badge" title={linkedFilePath}>
                                <span className="codicon codicon-link"></span> {linkedFileName}
                            </span>
                            <button 
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={() => handleOpenInEditor('', linkedFilePath)}
                                title={`Open linked file ${linkedFileName} in VS Code`}
                            >
                                <span className="codicon codicon-go-to-file"></span> Open File
                            </button>
                        </>
                    ) : (
                        <button 
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => handleOpenInEditor(currentGeneratedXml)}
                            title="Open generated XML in a new VS Code editor"
                        >
                            <span className="codicon codicon-new-file"></span> Open in Editor
                        </button>
                    )}
                    <button 
                        type="button"
                        className="btn-primary btn-sm btn-send"
                        onClick={() => handleSendRequest(currentGeneratedXml)}
                        disabled={isSending}
                        title="Send XML Request directly to Tally"
                    >
                        <span className={`codicon ${isSending ? 'codicon-loading codicon-modifier-spin' : 'codicon-play'}`}></span>
                        {isSending ? ' Sending...' : ' Send to Tally'}
                    </button>
                </div>
            </div>

            {/* Notification Banner */}
            {statusBanner && (
                <div className={`status-notification banner-${statusBanner.type}`}>
                    <span>{statusBanner.message}</span>
                </div>
            )}

            {/* Main Content Area */}
            <div className="playground-content">
                {activeTab === 'templates' && (
                    <TemplatesPanel 
                        templates={templates}
                        onApplyTemplate={handleApplyTemplate}
                        onOpenTemplateInEditor={handleOpenTemplateInEditor}
                    />
                )}

                {activeTab === 'history' && (
                    <HistoryPanel 
                        history={history}
                        onLoadHistoryEntry={handleLoadHistoryEntry}
                        onViewResponse={handleViewResponse}
                        onClearHistory={handleClearHistory}
                    />
                )}

                {activeTab === 'xml' && (
                    <XmlPreview 
                        tallyRequest={tallyRequest}
                        type={type}
                        id={id}
                        staticVariables={staticVariables}
                        definitions={definitions}
                        linkedFilePath={linkedFilePath}
                        linkedFileName={linkedFileName}
                        isSending={isSending}
                        onSendRequest={handleSendRequest}
                        onOpenInEditor={handleOpenInEditor}
                        onApplyXmlToUi={handleApplyXmlToUi}
                    />
                )}

                {activeTab === 'builder' && (
                    <div className="builder-layout-full">
                        <HeaderConfig 
                            tallyRequest={tallyRequest}
                            type={type}
                            id={id}
                            definitions={definitions}
                            collectionSuggestions={collectionSuggestions}
                            reportSuggestions={reportSuggestions}
                            linkedFilePath={linkedFilePath}
                            linkedFileName={linkedFileName}
                            onChangeTallyRequest={setTallyRequest}
                            onChangeType={(newType) => {
                                setType(newType);
                                setId('');
                            }}
                            onChangeId={setId}
                            onRequestSuggestions={requestSuggestions}
                            onLoadFromActiveEditor={handleLoadFromActiveEditor}
                            onOpenFilePicker={handleOpenFilePicker}
                            onOpenLinkedFile={() => handleOpenInEditor('', linkedFilePath)}
                        />

                        <StaticVarsPanel 
                            variables={staticVariables}
                            companies={companies}
                            onUpdateVariable={handleUpdateStaticVar}
                            onAddVariable={handleAddStaticVar}
                            onRemoveVariable={handleRemoveStaticVar}
                            onRefreshCompanies={handleRefreshCompanies}
                        />

                        <TdlBuilder 
                            definitions={definitions}
                            definitionTypes={definitionTypes}
                            schemaTypes={schemaTypes}
                            attributesCache={attributesCache}
                            attributeValueSuggestionsCache={attributeValueSuggestionsCache}
                            defNameSuggestionsCache={defNameSuggestionsCache}
                            onRequestAttributesForDefType={requestAttributesForDefType}
                            onRequestAttributeValueSuggestions={requestAttributeValueSuggestions}
                            onRequestDefNameSuggestions={requestDefNameSuggestions}
                            onUpdateDefinition={handleUpdateDefinition}
                            onDeleteDefinition={handleDeleteDefinition}
                            onAddDefinition={handleAddDefinition}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
