import React, { useState } from 'react';
import type { 
    PlaygroundDefinitionDTO, 
    PlaygroundStaticVariableDTO,
    PlaygroundTallyObjectDTO,
    PlaygroundTallyPropertyDTO
} from '../../types/playground';

function renderTallyProperties(properties: PlaygroundTallyPropertyDTO[], indentLevel: number): string {
    const pad = ' '.repeat(indentLevel);
    return properties
        .filter(p => p.name && p.name.trim())
        .map(p => {
            const tagName = p.name.replace(/\s+/g, '').toUpperCase();
            if (p.isList && p.children && p.children.length > 0) {
                const childXml = renderTallyProperties(p.children, indentLevel + 4);
                return `${pad}<${tagName}>\n${childXml}\n${pad}</${tagName}>`;
            }
            return `${pad}<${tagName}>${p.value ?? ''}</${tagName}>`;
        })
        .join('\n');
}

function renderTallyObjects(objects: PlaygroundTallyObjectDTO[]): string {
    return objects.map(obj => {
        const objType = obj.objectType || 'Ledger';
        const tag = objType.replace(/\s+/g, '').toUpperCase();
        const isMaster = tag !== 'VOUCHER';

        // 1. Determine effective master name
        const nameProp = obj.properties.find(p => p.name.toUpperCase().trim() === 'NAME');
        const masterName = (obj.name || nameProp?.value || '').trim();

        const xmlAttrs = [
            masterName ? `NAME="${masterName}"` : (obj.name ? `NAME="${obj.name}"` : ''),
            obj.action ? `Action="${obj.action}"` : 'Action="Create"',
            obj.vchType ? `VCHTYPE="${obj.vchType}"` : '',
            obj.objView ? `OBJVIEW="${obj.objView}"` : ''
        ].filter(Boolean).join(' ');

        // 2. Clone properties to ensure NAME and LANGUAGENAME.LIST are present and synchronized
        let processedProps: PlaygroundTallyPropertyDTO[] = [...obj.properties];

        if (isMaster && masterName) {
            // Ensure NAME tag is present as first property
            if (!processedProps.some(p => p.name.toUpperCase().trim() === 'NAME')) {
                processedProps = [{ name: 'NAME', value: masterName }, ...processedProps];
            } else {
                processedProps = processedProps.map(p => 
                    p.name.toUpperCase().trim() === 'NAME' ? { ...p, value: masterName } : p
                );
            }

            // Check if LANGUAGENAME.LIST is present
            const langListIdx = processedProps.findIndex(p => p.name.toUpperCase().trim() === 'LANGUAGENAME.LIST');
            if (langListIdx === -1) {
                // Auto-generate LANGUAGENAME.LIST with NAME.LIST matching masterName
                processedProps.push({
                    name: 'LANGUAGENAME.LIST',
                    isList: true,
                    children: [
                        {
                            name: 'NAME.LIST',
                            isList: true,
                            children: [
                                { name: 'NAME', value: masterName }
                            ]
                        },
                        {
                            name: 'LANGUAGEID',
                            value: ' 1033'
                        }
                    ]
                });
            } else {
                // Ensure first item in NAME.LIST matches masterName
                const langProp = processedProps[langListIdx];
                const langChildren = [...(langProp.children || [])];
                const nameListIdx = langChildren.findIndex(c => c.name.toUpperCase().trim() === 'NAME.LIST');

                if (nameListIdx === -1) {
                    langChildren.unshift({
                        name: 'NAME.LIST',
                        isList: true,
                        children: [{ name: 'NAME', value: masterName }]
                    });
                } else {
                    const nameListProp = langChildren[nameListIdx];
                    const nameListChildren = [...(nameListProp.children || [])];
                    if (nameListChildren.length === 0) {
                        nameListChildren.push({ name: 'NAME', value: masterName });
                    } else {
                        // First item in NAME.LIST must match masterName; subsequent items are preserved aliases
                        nameListChildren[0] = { ...nameListChildren[0], name: 'NAME', value: masterName };
                    }
                    langChildren[nameListIdx] = {
                        ...nameListProp,
                        isList: true,
                        children: nameListChildren
                    };
                }

                if (!langChildren.some(c => c.name.toUpperCase().trim() === 'LANGUAGEID')) {
                    langChildren.push({ name: 'LANGUAGEID', value: ' 1033' });
                }

                processedProps[langListIdx] = {
                    ...langProp,
                    isList: true,
                    children: langChildren
                };
            }
        }

        const propsXml = renderTallyProperties(processedProps, 20);
        if (propsXml) {
            return `                <${tag} ${xmlAttrs}>\n${propsXml}\n                </${tag}>`;
        }
        return `                <${tag} ${xmlAttrs} />`;
    }).join('\n');
}

export function generateEnvelopeXml(
    tallyRequest: 'Export' | 'Import',
    type: 'Collection' | 'Data',
    id: string,
    staticVariables: PlaygroundStaticVariableDTO[],
    definitions: PlaygroundDefinitionDTO[],
    tallyObjects?: PlaygroundTallyObjectDTO[]
): string {
    const staticVarsXml = staticVariables
        .filter(v => v.name.trim())
        .map(v => {
            const tagName = v.name.replace(/\s+/g, '').toUpperCase();
            return `                <${tagName}>${v.value || ''}</${tagName}>`;
        })
        .join('\n');

    let bodyDescContent = '';
    if (staticVarsXml) {
        bodyDescContent += `            <STATICVARIABLES>\n${staticVarsXml}\n            </STATICVARIABLES>\n`;
    }

    if (tallyRequest === 'Import') {
        const objects = tallyObjects || [];
        if (objects.length > 0) {
            const objectsXml = renderTallyObjects(objects);
            bodyDescContent += `            <TALLYMESSAGE xmlns:UDF="TallyUDF">\n${objectsXml}\n            </TALLYMESSAGE>\n`;
        }
    } else {
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

                if (defTag === 'SYSTEM') {
                    const sysType = d.name || 'Formulae';
                    const modifierAttrs = [
                        d.isModify ? 'ISMODIFY="Yes"' : '',
                        d.isFixed ? 'ISFIXED="Yes"' : '',
                        d.isInitialize ? 'ISINITIALIZE="Yes"' : '',
                        d.isOption ? 'ISOPTION="Yes"' : '',
                        d.isInternal ? 'ISINTERNAL="Yes"' : ''
                    ].filter(Boolean).join(' ');
                    const extraAttrStr = modifierAttrs ? ` ${modifierAttrs}` : '';

                    if (d.attributes && d.attributes.length > 0) {
                        return d.attributes
                            .filter(a => a.name.trim())
                            .map(a => {
                                const val = a.values ? a.values.join(', ') : '';
                                return `                    <SYSTEM TYPE="${sysType}" NAME="${a.name.trim()}"${extraAttrStr}>${val}</SYSTEM>`;
                            })
                            .join('\n');
                    } else {
                        return `                    <SYSTEM TYPE="${sysType}"${extraAttrStr} />`;
                    }
                }

                const isColonSeparated = (attrName: string): boolean => {
                    const norm = attrName.toLowerCase().replace(/\s+/g, '');
                    return [
                        'compute', 'computemethod', 'aggrcompute', 'aggrcomputemethod', 'aggrmethod', 
                        'option', 'variable', 'set', 'setas', 'local', 'modify', 'add', 'delete', 'replace',
                        'keyitem', 'item', 'action'
                    ].includes(norm);
                };

                const attrsXml = d.attributes
                    .filter(a => a.name.trim())
                    .map(a => {
                        const attrTag = a.name.replace(/\s+/g, '').toUpperCase();
                        const sep = isColonSeparated(a.name) ? ' : ' : ', ';
                        const val = a.values ? a.values.join(sep) : '';
                        return `                        <${attrTag}>${val}</${attrTag}>`;
                    })
                    .join('\n');

                if (attrsXml) {
                    return `                    <${defTag} ${xmlAttrs}>\n${attrsXml}\n                    </${defTag}>`;
                } else {
                    return `                    <${defTag} ${xmlAttrs} />`;
                }
            }).join('\n');

            bodyDescContent += `            <TDL>\n                <TDLMESSAGE>\n${defs}\n                </TDLMESSAGE>\n            </TDL>\n`;
        }
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
    tallyObjects?: PlaygroundTallyObjectDTO[];
    linkedFilePath?: string;
    linkedFileName?: string;
    isSending?: boolean;
    onCustomXmlChange?: (xml: string) => void;
    onOpenInEditor: (xml: string, filePath?: string) => void;
    onApplyXmlToUi?: (xml: string) => void;
}

export const XmlPreview: React.FC<XmlPreviewProps> = ({
    tallyRequest,
    type,
    id,
    staticVariables,
    definitions,
    tallyObjects,
    linkedFilePath,
    linkedFileName,
    onCustomXmlChange,
    onOpenInEditor,
    onApplyXmlToUi
}) => {
    const [copied, setCopied] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedXml, setEditedXml] = useState('');

    const generatedXml = generateEnvelopeXml(tallyRequest, type, id, staticVariables, definitions, tallyObjects);
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
        onCustomXmlChange?.(generatedXml);
    };

    const handleSyncToUi = () => {
        if (onApplyXmlToUi && editedXml) {
            onApplyXmlToUi(editedXml);
            setIsEditing(false);
            onCustomXmlChange?.('');
        }
    };

    const handleResetToGenerated = () => {
        setIsEditing(false);
        setEditedXml('');
        onCustomXmlChange?.('');
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
                </div>
            </div>

            <div className="xml-preview-container full-height">
                {isEditing ? (
                    <textarea 
                        className="xml-editor-textarea"
                        value={editedXml}
                        onChange={e => {
                            const val = e.target.value;
                            setEditedXml(val);
                            onCustomXmlChange?.(val);
                        }}
                        placeholder="Paste or write Tally XML Envelope here..."
                        spellCheck={false}
                    />
                ) : (
                    <pre className="xml-code-block">{generatedXml}</pre>
                )}
            </div>
        </div>
    );
};

