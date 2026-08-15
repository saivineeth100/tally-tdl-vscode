import React, { useState } from 'react';
import type { 
    PlaygroundDefinitionDTO, 
    PlaygroundStaticVariableDTO 
} from '../../types/playground';

export function generateEnvelopeXml(
    tallyRequest: 'Export' | 'Import',
    type: 'Collection' | 'Data',
    id: string,
    staticVariables: PlaygroundStaticVariableDTO[],
    definitions: PlaygroundDefinitionDTO[]
): string {
    const staticVarsXml = staticVariables
        .filter(v => v.name.trim())
        .map(v => {
            const tagName = v.name.replace(/\s+/g, '').toUpperCase();
            return `                <${tagName}>${v.value || ''}</${tagName}>`;
        })
        .join('\n');

    let tdlDefinitionsXml = '';
    if (definitions.length > 0) {
        const defs = definitions.map(d => {
            const defTag = d.defType.replace(/\s+/g, '').toUpperCase();
            const xmlAttrs = [
                d.isModify ? 'ISMODIFY="Yes"' : '',
                d.isFixed ? 'ISFIXED="Yes"' : '',
                d.isInitialize ? 'ISINITIALIZE="Yes"' : '',
                d.isOption ? 'ISOPTION="Yes"' : '',
                d.isInternal ? 'ISINTERNAL="Yes"' : '',
                `NAME="${d.name || ''}"`
            ].filter(Boolean).join(' ');

            const attrsXml = d.attributes
                .filter(a => a.name.trim())
                .map(a => {
                    const attrTag = a.name.replace(/\s+/g, '').toUpperCase();
                    const val = a.values ? a.values.join(', ') : '';
                    return `                        <${attrTag}>${val}</${attrTag}>`;
                })
                .join('\n');

            if (attrsXml) {
                return `                    <${defTag} ${xmlAttrs}>\n${attrsXml}\n                    </${defTag}>`;
            } else {
                return `                    <${defTag} ${xmlAttrs} />`;
            }
        }).join('\n');

        tdlDefinitionsXml = `            <TDL>\n                <TDLMESSAGE>\n${defs}\n                </TDLMESSAGE>\n            </TDL>\n`;
    }

    let bodyDescContent = '';
    if (staticVarsXml) {
        bodyDescContent += `            <STATICVARIABLES>\n${staticVarsXml}\n            </STATICVARIABLES>\n`;
    }
    if (tdlDefinitionsXml) {
        bodyDescContent += tdlDefinitionsXml;
    }

    return `<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>${tallyRequest}</TALLYREQUEST>
        <TYPE>${type}</TYPE>
        <ID>${id || ''}</ID>
    </HEADER>
    <BODY>
        <DESC>
${bodyDescContent.trimEnd()}
        </DESC>
    </BODY>
</ENVELOPE>`;
}

interface XmlPreviewProps {
    tallyRequest: 'Export' | 'Import';
    type: 'Collection' | 'Data';
    id: string;
    staticVariables: PlaygroundStaticVariableDTO[];
    definitions: PlaygroundDefinitionDTO[];
    linkedFilePath?: string;
    linkedFileName?: string;
    isSending: boolean;
    onSendRequest: (xml: string) => void;
    onOpenInEditor: (xml: string, filePath?: string) => void;
    onApplyXmlToUi?: (xml: string) => void;
}

export const XmlPreview: React.FC<XmlPreviewProps> = ({
    tallyRequest,
    type,
    id,
    staticVariables,
    definitions,
    linkedFilePath,
    linkedFileName,
    isSending,
    onSendRequest,
    onOpenInEditor,
    onApplyXmlToUi
}) => {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedXml, setEditedXml] = useState('');

    const generatedXml = generateEnvelopeXml(tallyRequest, type, id, staticVariables, definitions);
    const currentXml = isEditing ? editedXml : generatedXml;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(currentXml);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // fallback
        }
    };

    const handleStartEdit = () => {
        setEditedXml(generatedXml);
        setIsEditing(true);
    };

    const handleSyncToUi = () => {
        if (onApplyXmlToUi && editedXml) {
            onApplyXmlToUi(editedXml);
            setIsEditing(false);
        }
    };

    const handleResetToGenerated = () => {
        setIsEditing(false);
        setEditedXml('');
    };

    return (
        <div className="playground-card xml-view-full-card">
            <div className="card-header">
                <div className="card-title">
                    <span className="codicon codicon-code"></span>
                    <span>Tally XML Envelope</span>
                    {linkedFileName && (
                        <span className="file-linked-badge" title={linkedFilePath}>
                            <span className="codicon codicon-link"></span> {linkedFileName}
                        </span>
                    )}
                </div>
                <div className="card-actions">
                    {!isEditing ? (
                        <button 
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={handleStartEdit}
                            title="Edit raw XML manually"
                        >
                            <span className="codicon codicon-edit"></span> Edit XML
                        </button>
                    ) : (
                        <>
                            <button 
                                type="button"
                                className="btn-primary btn-sm"
                                onClick={handleSyncToUi}
                                title="Parse XML back into Visual Builder"
                            >
                                <span className="codicon codicon-sync"></span> Apply to UI
                            </button>
                            <button 
                                type="button"
                                className="btn-secondary btn-sm"
                                onClick={handleResetToGenerated}
                                title="Reset edits and regenerate from Visual Builder"
                            >
                                <span className="codicon codicon-discard"></span> Reset
                            </button>
                        </>
                    )}
                    <button 
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={handleCopy}
                        title="Copy XML to clipboard"
                    >
                        <span className={`codicon ${copied ? 'codicon-check' : 'codicon-copy'}`}></span> 
                        {copied ? ' Copied' : ' Copy XML'}
                    </button>
                    <button 
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => onOpenInEditor(currentXml, linkedFilePath)}
                        title={linkedFilePath ? `Open ${linkedFileName} in VS Code` : "Open in a new VS Code editor"}
                    >
                        <span className="codicon codicon-go-to-file"></span> {linkedFileName ? `Open ${linkedFileName}` : 'Open in Editor'}
                    </button>
                    <button 
                        type="button"
                        className="btn-primary btn-sm btn-send"
                        onClick={() => onSendRequest(currentXml)}
                        disabled={isSending}
                        title="Send XML Request directly to Tally"
                    >
                        <span className={`codicon ${isSending ? 'codicon-loading codicon-modifier-spin' : 'codicon-play'}`}></span>
                        {isSending ? ' Sending...' : ' Send to Tally'}
                    </button>
                </div>
            </div>

            <div className="xml-preview-container full-height">
                {isEditing ? (
                    <textarea 
                        className="xml-editor-textarea"
                        value={editedXml}
                        onChange={e => setEditedXml(e.target.value)}
                        placeholder="Paste or write Tally XML Envelope here..."
                        spellCheck={false}
                    />
                ) : (
                    <pre className="xml-code-block">
                        <code>{generatedXml}</code>
                    </pre>
                )}
            </div>
        </div>
    );
};

