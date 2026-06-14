import { Connection, TextDocuments, CompletionItem, CompletionItemKind, CompletionParams, CompletionList, MarkupKind } from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DocManager } from '../docManager';
import { TdlMetadata, TDLDefinition } from '../tdlMetaData';
import { TDLFunction } from '../models/tdlFunction';
import { DefinitionNode, SourceFile } from '../parser/ast';
import { SymbolTable, definitionTypeToSymbolKind } from '../services/symbolTable';
import { normalizeTypeName } from '../services/utils';
import { getDefinitionAtOffset } from '../services/hover';
import { TokenKind } from '../parser/tokenKind';

/**
 * Build markdown documentation for an attribute
 */
function buildAttributeDocumentation(attr: TDLDefinition): string {
    let doc = attr.Description || '';

    if (attr.Parameters && attr.Parameters.length > 0) {
        doc += '\n\n**Parameters:**\n';
        attr.Parameters.forEach((param, idx) => {
            const parts: string[] = [];
            if (param.DataType) parts.push(`Type: ${param.DataType}`);
            if (param.IsMandatory) parts.push('Required');
            else parts.push('Optional');
            if (param.RefersTo) parts.push(`Refers to: ${param.RefersTo.trim()}`);
            if (param.KeywordSet) parts.push(`Keywords: ${param.Keywords}`);
            doc += `- Param ${idx + 1}: ${parts.join(', ')}\n`;
        });
    }

    if (attr.Type) {
        doc += `\n**Type:** ${attr.Type}`;
    }

    if (attr.Aliases && attr.Aliases !== attr.Name) {
        doc += `\n\n**Aliases:** ${attr.Aliases}`;
    }

    return doc;
}

/**
 * Build markdown documentation for a function
 * @param func Function metadata
 * @returns Markdown documentation string
 */
function buildFunctionDocumentation(func: TDLFunction): string {
    let doc = func.Description || '';

    const mandatory = func.TotalMandatoryParameters;
    const optional = func.TotalParameters - mandatory;
    doc += `\n\n**Parameters:** ${mandatory} mandatory${optional > 0 ? `, ${optional} optional` : ''}`;

    if (func.ReturnType) {
        doc += `\n**Returns:** ${func.ReturnType}`;
    }

    if (func.Category) {
        doc += `\n**Category:** ${func.Category}`;
    }

    if (func.Parameters && func.Parameters.length > 0) {
        doc += '\n\n**Parameter Details:**\n';
        func.Parameters.forEach((param, idx) => {
            const parts: string[] = [];
            if (param.IsMandatory) parts.push('Required');
            else parts.push('Optional');
            if (param.DataType) parts.push(`Type: ${param.DataType}`);
            if (param.RefersTo) parts.push(`Refers to: ${param.RefersTo.trim()}`);
            doc += `- Param ${idx + 1}: ${parts.join(', ')}\n`;
        });
    }

    return doc;
}

/**
 * Get function suggestions sorted by return type matching expected datatype
 * @param md Metadata
 * @param partial Partial text typed by user
 * @param expectedDatatype Expected return type from parameter definition
 * @returns Array of CompletionItems sorted by relevance
 */
function getFunctionSuggestions(
    md: TdlMetadata,
    partial: string,
    expectedDatatype?: string
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = partial.toLowerCase();
    const normalizedExpected = expectedDatatype?.toLowerCase().trim();

    // Get matching functions
    for (const func of md.functions) {
        // Filter by partial match
        if (normalizedPartial && !func.Name.toLowerCase().includes(normalizedPartial)) {
            continue;
        }

        // Check if return type matches expected
        const returnTypeMatches = normalizedExpected &&
            func.ReturnType?.toLowerCase().trim() === normalizedExpected;

        // Sort prefix: matching return types come first (0_), others second (1_)
        const sortPrefix = returnTypeMatches ? '0_' : '1_';

        items.push({
            label: `$$${func.Name}`,
            kind: CompletionItemKind.Function,
            detail: func.ReturnType ? `Returns: ${func.ReturnType}${returnTypeMatches ? ' ✓' : ''}` : 'TDL Function',
            insertText: func.TotalParameters > 0 ? `$$${func.Name}($0)` : `$$${func.Name}`,
            insertTextFormat: 2, // Snippet
            documentation: {
                kind: MarkupKind.Markdown,
                value: buildFunctionDocumentation(func)
            },
            sortText: sortPrefix + func.Name.toLowerCase(),
        });
    }

    return items;
}

/**
 * Context for completion
 */
export interface CompletionContext {
    type: 'schema_type' | 'definition_type' | 'definition_name' | 'attribute' | 'attribute_value' | 'function' | 'variable' | 'field' | 'function_action' | 'function_action_parameter' | 'modifier_value' | 'xml_schema_attribute' | 'unknown';
    partial: string;
    hasModifier: boolean;
    modifier?: string;
    defType?: string;
    attributeName?: string;
    actionName?: string;
    paramIndex?: number;
    modifierName?: string;
    modifierParts?: string[];
    tagPath?: string[];
}

/**
 * Get suggestions for a specific definition type
 */
function getSuggestionsForDefinitionType(
    defType: string,
    partial: string,
    md: TdlMetadata,
    symbolTable?: SymbolTable
): CompletionItem[] {
    const items: CompletionItem[] = [];
    const normalizedPartial = normalizeTypeName(partial);

    // 1. Check Symbol Table (user code)
    if (symbolTable) {
        const kind = definitionTypeToSymbolKind(defType);
        const existingNames = symbolTable.getNamesByKind(kind);

        for (const name of existingNames) {
            if (normalizedPartial === '' || normalizeTypeName(name).includes(normalizedPartial)) {
                items.push({
                    label: name,
                    kind: CompletionItemKind.Reference,
                    detail: `Existing ${defType} definition`,
                    insertText: name,
                    sortText: '0_' + name.toLowerCase(), // Prioritize user symbols
                });
            }
        }
    }

    // 2. Check ExistingDefinitions (default TDL)
    // Find matching key in metadata (case-insensitive)
    const defTypeKey = Array.from(md.existingDefinitions.keys()).find(k => k.toLowerCase() === defType.toLowerCase());
    if (defTypeKey) {
        const defaultNames = md.existingDefinitions.get(defTypeKey) || [];
        for (const name of defaultNames) {
            if (normalizedPartial === '' || normalizeTypeName(name).includes(normalizedPartial)) {
                items.push({
                    label: name,
                    kind: CompletionItemKind.Reference,
                    detail: `Default TDL ${defTypeKey}`,
                    insertText: name,
                    sortText: '1_' + name.toLowerCase(), // Lower priority than user symbols
                });
            }
        }
    }
    return items;
}

/**
 * Find definition at cursor, including incomplete definitions
 */
export function findDefinitionAtCursor(sourceFile: SourceFile, offset: number): DefinitionNode | undefined {
    let lastDef: DefinitionNode | undefined;

    for (const def of sourceFile.definitions) {
        // If we found a definition that starts after the cursor, the cursor 
        // must belong to the previous definition (as attributes) or be in whitespace.
        if (def.start > offset) {
            break;
        }

        // Strictly inside a definition
        if (offset >= def.start && offset <= def.end) {
            return def;
        }

        // Track the last definition started before offset
        lastDef = def;
    }

    // If not strictly inside, assume it belongs to the previous definition
    // (e.g. adding attributes on a new line)
    return lastDef;
}

/**
 * Detect completion context using AST with error recovery support.
 * The parser now creates partial DefinitionNodes even for incomplete input.
 */
export function detectCompletionContext(
    textBefore: string,
    sourceFile: SourceFile | undefined,
    offset: number,
    currentDef: DefinitionNode | undefined
): CompletionContext {
    const trimmed = textBefore.trimStart();

    // 1. Check for $$ (function context)
    const dollarIdx = trimmed.lastIndexOf('$$');
    if (dollarIdx !== -1) {
        const afterDollar = trimmed.slice(dollarIdx + 2);
        if (!afterDollar.includes(':')) {
            return { type: 'function', partial: afterDollar.trim(), hasModifier: false };
        }
    }

    // 2. Check for ## (variable context)
    const hashIdx = trimmed.lastIndexOf('##');
    if (hashIdx !== -1 && (dollarIdx === -1 || hashIdx > dollarIdx)) {
        const afterHash = trimmed.slice(hashIdx + 2);
        if (!afterHash.includes(':')) {
            return { type: 'variable', partial: afterHash.trim(), hasModifier: false };
        }
    }

    // 3. Check if we have an incomplete definition at cursor (from AST with error recovery)
    if (currentDef && currentDef.isIncomplete) {
        const hasModifier = !!currentDef.modifier;
        const modifier = currentDef.modifier?.Text;
        const defType = currentDef.type?.text || '';

        // Check if cursor is after colon (typing name) or before colon (typing type)
        if (currentDef.colon) {
            return {
                type: 'definition_name',
                partial: currentDef.name?.text || '',
                hasModifier,
                modifier,
                defType
            };
        } else {
            return {
                type: 'definition_type',
                partial: defType,
                hasModifier,
                modifier
            };
        }
    }

    // 4. Check for open bracket context (typing definition header)
    const openBracketIdx = trimmed.lastIndexOf('[');
    const closeBracketIdx = trimmed.lastIndexOf(']');
    if (openBracketIdx !== -1 && openBracketIdx > closeBracketIdx) {
        // We're inside an unclosed bracket
        let content = trimmed.slice(openBracketIdx + 1);
        let modifier: string | undefined;

        if (content.startsWith('#') || content.startsWith('!') || content.startsWith('*')) {
            modifier = content[0];
            content = content.slice(1).trim();
        }

        const colonIdx = content.indexOf(':');
        if (colonIdx !== -1) {
            return {
                type: 'definition_name',
                partial: content.slice(colonIdx + 1).trim(),
                hasModifier: !!modifier,
                modifier,
                defType: content.slice(0, colonIdx).trim()
            };
        } else {
            return {
                type: 'definition_type',
                partial: content.trim(),
                hasModifier: !!modifier,
                modifier
            };
        }
    }

    // 5. Check if inside a complete definition body - attribute completion
    if (currentDef && !currentDef.isIncomplete) {
        // We need to look at the current line content up to the cursor to determine strict context
        const errorRecoveryIndentCheck = textBefore.lastIndexOf('\n');
        const lineStart = errorRecoveryIndentCheck === -1 ? 0 : errorRecoveryIndentCheck + 1;
        const lineTextBeforeCursor = textBefore.slice(lineStart);
        const trimmedLine = lineTextBeforeCursor.trim();

        // If line is empty or just whitespace (and we are in a definition), it is attribute start
        if (trimmedLine === '') {
            return {
                type: 'attribute',
                partial: '',
                hasModifier: false
            };
        }

        const colonIndex = lineTextBeforeCursor.indexOf(':');

        if (currentDef.type.text.toLowerCase() === 'function') {
            // In a function body, we parse statements: Label : Action : Args...
            // Attributes like Parameter, Variable, Returns are also valid at the top.
            // If it starts with an attribute keyword, treat as attribute
            if (/^(Parameter|Variable|Returns|Object)/i.test(trimmedLine)) {
                if (colonIndex === -1) {
                    return { type: 'attribute', partial: trimmedLine, hasModifier: false };
                } else {
                    const attributeName = lineTextBeforeCursor.slice(0, colonIndex).trim();
                    const valuePart = lineTextBeforeCursor.slice(colonIndex + 1);
                    const paramIndex = (valuePart.match(/,/g) || []).length;
                    const lastCommaIndex = valuePart.lastIndexOf(',');
                    const partial = valuePart.slice(lastCommaIndex + 1).trimStart();
                    return { type: 'attribute_value', partial: partial.trim(), hasModifier: false, attributeName, paramIndex };
                }
            } else {
                // Procedural statement
                const colonsCount = (lineTextBeforeCursor.match(/:/g) || []).length;
                if (colonsCount === 0) {
                    return { type: 'unknown', partial: trimmedLine, hasModifier: false };
                } else if (colonsCount === 1) {
                    const actionPartial = lineTextBeforeCursor.slice(colonIndex + 1).trimStart();
                    return { type: 'function_action', partial: actionPartial, hasModifier: false };
                } else {
                    const secondColonIndex = lineTextBeforeCursor.indexOf(':', colonIndex + 1);
                    const actionName = lineTextBeforeCursor.slice(colonIndex + 1, secondColonIndex).trim();
                    const paramIndex = colonsCount - 2;
                    const lastColonIndex = lineTextBeforeCursor.lastIndexOf(':');
                    const partial = lineTextBeforeCursor.slice(lastColonIndex + 1).trimStart();
                    return { type: 'function_action_parameter', partial: partial.trim(), hasModifier: false, actionName, paramIndex };
                }
            }
        }

        if (colonIndex === -1) {
            // No colon yet, we are typing the attribute name
            return {
                type: 'attribute',
                partial: trimmedLine,
                hasModifier: false
            };
        } else {
            // Colon exists, we are in the value part (Parameter)
            // Check if cursor is after colon
            // Since lineTextBeforeCursor ends at cursor, if we found colon, cursor must be after it
            // (unless verify exact position, but generally yes)

            const attributeName = lineTextBeforeCursor.slice(0, colonIndex).trim();
            const valuePart = lineTextBeforeCursor.slice(colonIndex + 1);

            // Is it a structural modifier that uses colons?
            const lowerAttrName = attributeName.toLowerCase();
            if (['local', 'add', 'delete', 'replace', 'option', 'switch', 'use'].includes(lowerAttrName)) {
                const parts = valuePart.split(':');
                const paramIndex = parts.length - 1; // Number of colons
                const partial = parts[parts.length - 1].trimStart();

                return {
                    type: 'modifier_value',
                    partial: partial.trim(),
                    hasModifier: false,
                    modifierName: attributeName,
                    paramIndex,
                    modifierParts: parts.map(p => p.trim())
                };
            }

            // Determine parameter index by counting commas
            // This is a simple generic split.
            // TODO: Handle quoted text if necessary.
            const paramIndex = (valuePart.match(/,/g) || []).length;

            const lastCommaIndex = valuePart.lastIndexOf(',');
            const partial = valuePart.slice(lastCommaIndex + 1).trimStart(); // keep initial whitespace trimming? 
            // Actually partial should be the word being typed.

            return {
                type: 'attribute_value',
                partial: partial.trim(), // Trimming for lookup
                hasModifier: false,
                attributeName,
                paramIndex
            };
        }
    }

    return { type: 'unknown', partial: '', hasModifier: false };
}

export function detectXmlCompletionContext(xmlText: string, offset: number, currentDef?: DefinitionNode): CompletionContext {
    // Check if cursor is inside the NAME attribute of a modified definition
    if (currentDef && currentDef.modifier && currentDef.name) {
        if (offset >= currentDef.name.start && offset <= currentDef.name.end + 1) {
            const partial = xmlText.slice(currentDef.name.start, offset);
            return {
                type: 'definition_name',
                partial: partial,
                hasModifier: true,
                defType: currentDef.type.text
            };
        }
    }

    const textBefore = xmlText.slice(0, offset);
    
    // Find the last '<'
    const lastOpenIdx = textBefore.lastIndexOf('<');
    const lastCloseIdx = textBefore.lastIndexOf('>');
    
    if (lastOpenIdx > lastCloseIdx) {
        // Inside a tag declaration
        const tagText = textBefore.slice(lastOpenIdx + 1);
        
        // Find parent tag path
        let searchIdx = lastOpenIdx;
        let depth = 0;
        let tagPath: string[] = [];
        
        while (searchIdx > 0) {
            const cIdx = xmlText.lastIndexOf('>', searchIdx - 1);
            if (cIdx === -1) break;
            const oIdx = xmlText.lastIndexOf('<', cIdx);
            if (oIdx === -1) break;
            
            const tagStr = xmlText.slice(oIdx + 1, cIdx);
            if (tagStr.startsWith('/')) {
                depth++;
            } else if (!tagStr.endsWith('/')) {
                if (depth > 0) {
                    depth--;
                } else {
                    tagPath.push(tagStr.split(/\s+/)[0].toUpperCase());
                }
            }
            searchIdx = oIdx;
        }
        tagPath.reverse();
        const parentTag = tagPath.length > 0 ? tagPath[tagPath.length - 1] : '';
        
        if (parentTag === 'TALLYMESSAGE') {
            return { type: 'schema_type', partial: tagText, hasModifier: false };
        } else if (parentTag === 'TDLMESSAGE' || parentTag === 'TDL') {
            return { type: 'definition_type', partial: tagText, hasModifier: false };
        } else if (currentDef && parentTag === currentDef.type.text.toUpperCase()) {
            return { type: 'attribute', partial: tagText, hasModifier: false, tagPath };
        } else if (tagPath.length > 0) {
            return { type: 'xml_schema_attribute', partial: tagText, hasModifier: false, tagPath };
        }
    } else {
        // Between tags
        let searchIdx = offset;
        let depth = 0;
        let tagPath: string[] = [];
        
        while (searchIdx > 0) {
            const closeIdx = xmlText.lastIndexOf('>', searchIdx - 1);
            if (closeIdx === -1) break;
            const openIdx = xmlText.lastIndexOf('<', closeIdx);
            if (openIdx === -1) break;
            
            const tagStr = xmlText.slice(openIdx + 1, closeIdx);
            if (tagStr.startsWith('/')) {
                depth++;
            } else if (!tagStr.endsWith('/')) {
                if (depth > 0) {
                    depth--;
                } else {
                    tagPath.push(tagStr.split(/\s+/)[0].toUpperCase());
                }
            }
            searchIdx = openIdx;
        }
        tagPath.reverse();
        const lastTag = tagPath.length > 0 ? tagPath[tagPath.length - 1] : '';
        
        const partial = textBefore.slice(lastCloseIdx + 1).trimStart();
        
        const functionMatch = partial.match(/\$\$([a-zA-Z0-9_]*)$/);
        if (functionMatch) {
            return { type: 'function', partial: functionMatch[1], hasModifier: false };
        }
        
        if (lastTag !== 'TDL' && lastTag !== 'TDLMESSAGE' && lastTag !== 'TALLYMESSAGE' && (!currentDef || lastTag !== currentDef.type.text.toUpperCase())) {
            const paramIndex = (partial.match(/,/g) || []).length;
            const partialVal = partial.slice(partial.lastIndexOf(',') + 1).trimStart();
            
            return {
                type: 'attribute_value',
                partial: partialVal,
                hasModifier: false,
                attributeName: lastTag,
                paramIndex,
                tagPath
            };
        }
    }
    
    return { type: 'unknown', partial: '', hasModifier: false };
}

/**
 * Get definition types from metadata
 */
function getDefinitionTypes(md: TdlMetadata): string[] {
    return Array.from(md.definitions.keys());
}

export function registerCompletion(
    connection: Connection,
    documents: TextDocuments<TextDocument>,
    manager: DocManager,
    symbolTable?: SymbolTable
) {
    connection.onCompletion((params: CompletionParams): CompletionList => {
        const items: CompletionItem[] = [];
        const md = (globalThis as any).TDL_METADATA as TdlMetadata;
        const doc = documents.get(params.textDocument.uri);
        if (!doc || !md) {
            return { items, isIncomplete: true };
        }

        const offset = doc.offsetAt(params.position);
        const textBefore = doc.getText({ start: { line: params.position.line, character: 0 }, end: params.position });


        const docState = manager.get(params.textDocument.uri);
        const sourceFile = docState?.sourceFile;
        const currentDef = sourceFile ? findDefinitionAtCursor(sourceFile, offset) : undefined;

        const isXml = doc.languageId === 'xml';
        let context: CompletionContext;
        if (isXml) {
            context = detectXmlCompletionContext(doc.getText(), offset, currentDef);
        } else {
            context = detectCompletionContext(textBefore, sourceFile, offset, currentDef);
        }

        switch (context.type) {
            case 'xml_schema_attribute':
                if (isXml && context.tagPath && context.tagPath.length > 0) {
                    // Find the primary schema tag in the tagPath (searching backwards from current position)
                    let rootTagIdx = -1;
                    let rootTag = '';
                    for (let i = context.tagPath.length - 1; i >= 0; i--) {
                        if (md.primarySchemaNames.some(s => s.toUpperCase() === context.tagPath![i].toUpperCase())) {
                            rootTagIdx = i;
                            rootTag = context.tagPath[i];
                            break;
                        }
                    }

                    if (rootTagIdx !== -1) {
                        const rootKey = Array.from(md.schemas.keys()).find(k => k.toUpperCase() === rootTag.toUpperCase());
                        let currentSchema = rootKey ? md.schemas.get(rootKey) : undefined;
                        
                        for (let i = rootTagIdx + 1; i < context.tagPath.length; i++) {
                            const step = context.tagPath[i];
                            const normalizedStep = step.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
                            const complexPropKey = Array.from(currentSchema?.ComplexProperties.keys() || []).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedStep);
                            if (complexPropKey) {
                                const nextSchemaName = currentSchema!.ComplexProperties.get(complexPropKey)!;
                                const nextKey = Array.from(md.schemas.keys()).find(k => k.toUpperCase() === nextSchemaName.toUpperCase());
                                currentSchema = nextKey ? md.schemas.get(nextKey) : undefined;
                            } else {
                                currentSchema = undefined;
                                break;
                            }
                        }

                        if (currentSchema) {
                            const systemAttributes = [
                                { name: 'Action', type: 'String', values: ['Create', 'Alter', 'Delete'] },
                                { name: 'NAME', type: 'String' }
                            ];
                            
                            if (currentSchema.Name.toUpperCase() === 'VOUCHER') {
                                systemAttributes.push(
                                    { name: 'VCHTYPE', type: 'String' },
                                    { name: 'OBJVIEW', type: 'String', values: ['Accounting Voucher View', 'Invoice Voucher View'] }
                                );
                            }

                            for (const sysAttr of systemAttributes) {
                                if (context.partial === '' || sysAttr.name.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: sysAttr.name,
                                        kind: CompletionItemKind.Property,
                                        detail: `System Attribute (${sysAttr.type})`,
                                        insertText: `${sysAttr.name}="$1"$0`,
                                        insertTextFormat: 2,
                                        sortText: '0_' + sysAttr.name.toLowerCase()
                                    });
                                }
                            }

                            for (const [propName, propDef] of currentSchema.Properties) {
                                let displayProp = propName.toUpperCase().replace(/\s+/g, '');
                                let insertText = '';
                                
                                if (propDef.IsComplex) {
                                    if (!displayProp.endsWith('.LIST')) {
                                        displayProp += '.LIST';
                                    }
                                    insertText = `${displayProp}>\n\t$0\n</${displayProp}>`;
                                } else if (propDef.IsRepeated) {
                                    if (!displayProp.endsWith('.LIST')) {
                                        displayProp += '.LIST';
                                    }
                                    const innerTag = propName.toUpperCase().replace(/\s+/g, '');
                                    const cleanType = propDef.DataType ? propDef.DataType.split(' ')[0] : '';
                                    const typeAttr = cleanType ? ` TYPE="${cleanType}"` : '';
                                    insertText = `${displayProp}${typeAttr}>\n\t<${innerTag}>$0</${innerTag}>\n</${displayProp}>`;
                                } else {
                                    insertText = `${displayProp}>$0</${displayProp}>`;
                                }

                                if (context.partial === '' || displayProp.toLowerCase().includes(context.partial.toLowerCase()) || propName.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: displayProp,
                                        kind: CompletionItemKind.Property,
                                        detail: `Schema Property (${propDef.DataType || 'String'})`,
                                        insertText: insertText,
                                        insertTextFormat: 2,
                                        documentation: { kind: MarkupKind.Markdown, value: `Type: ${propDef.DataType || 'String'}\nOriginal Name: ${propName}` },
                                        sortText: displayProp,
                                    });
                                }
                            }
                        }
                    }
                }
                break;

            case 'schema_type':
                const schemas = md.primarySchemaNames;
                const normalizedSchemaPartial = normalizeTypeName(context.partial);
                for (const schema of schemas) {
                    if (normalizedSchemaPartial === '' || normalizeTypeName(schema).includes(normalizedSchemaPartial)) {
                        const displayType = schema.toUpperCase().replace(/\s+/g, '');
                        items.push({
                            label: displayType,
                            kind: CompletionItemKind.Class,
                            detail: 'TDL Schema Type',
                            insertText: `${displayType}>\n\t$0\n</${displayType}>`,
                            insertTextFormat: 2,
                            sortText: schema.toLowerCase(),
                        });
                    }
                }
                break;

            case 'definition_type':
                // Suggest definition types from metadata
                const defTypes = getDefinitionTypes(md);
                const normalizedPartial = normalizeTypeName(context.partial);

                for (const defType of defTypes) {
                    if (normalizedPartial === '' || normalizeTypeName(defType).includes(normalizedPartial)) {
                        const displayType = isXml ? defType.toUpperCase().replace(/\s+/g, '') : defType;
                        items.push({
                            label: displayType,
                            kind: CompletionItemKind.Class,
                            detail: 'TDL Definition Type',
                            insertText: isXml ? `${displayType} NAME="$1">\n\t$0\n</${displayType}>` : `${displayType} : `,
                            insertTextFormat: isXml ? 2 : undefined,
                            sortText: defType.toLowerCase(),
                        });
                    }
                }
                break;

            case 'definition_name':
                // Suggest existing definition names when modifier is present (# or !)
                if (context.hasModifier && context.defType) {
                    const normalizedNamePartial = normalizeTypeName(context.partial);

                    items.push(...getSuggestionsForDefinitionType(context.defType, context.partial, md, symbolTable));
                }
                break;

            case 'function':
                // Function completion after $$
                for (const func of md.functions) {
                    if (func.Name.toLowerCase().includes(context.partial.toLowerCase())) {
                        items.push({
                            label: func.Name,
                            kind: CompletionItemKind.Function,
                            insertText: func.Name,
                            documentation: {
                                kind: MarkupKind.Markdown,
                                value: func.Description || ''
                            },
                        });
                    }
                }
                break;

            case 'variable':
                // 1. Local variables from scope
                const scope = manager.scopeManager.getScopeAt(params.textDocument.uri, offset);
                if (scope && scope.symbols) {
                    for (const [varName, varInfo] of scope.symbols.entries()) {
                        if (context.partial === '' || varName.toLowerCase().includes(context.partial.toLowerCase())) {
                            items.push({
                                label: varName,
                                kind: CompletionItemKind.Variable,
                                detail: `Local Variable`,
                                insertText: varName,
                                sortText: '0_' + varName.toLowerCase()
                            });
                        }
                    }
                }
                
                // 2. Global definitions
                items.push(...getSuggestionsForDefinitionType('Variable', context.partial, md, symbolTable));
                items.push(...getSuggestionsForDefinitionType('System Variable', context.partial, md, symbolTable));
                break;
                


            case 'function_action':
                for (const act of md.actions) {
                    if (context.partial === '' || act.Name.toLowerCase().includes(context.partial.toLowerCase())) {
                        items.push({
                            label: act.Name,
                            kind: CompletionItemKind.Keyword,
                            detail: act.Description || 'Procedural Action',
                            insertText: act.Name,
                            documentation: {
                                kind: MarkupKind.Markdown,
                                value: act.Description || ''
                            },
                            sortText: '0_' + act.Name
                        });
                    }
                }
                break;

            case 'function_action_parameter':
                if (currentDef && context.actionName && context.paramIndex !== undefined) {
                    const actionName = context.actionName.toLowerCase();
                    const actionDef = md.actions.find(a => 
                        a.Name.toLowerCase() === actionName || 
                        (a.Aliases && a.Aliases.toLowerCase().split(',').map(al => al.trim()).includes(actionName))
                    );

                    if (actionDef && actionDef.Parameters && actionDef.Parameters.length > context.paramIndex) {
                        const param = actionDef.Parameters[context.paramIndex];

                        // 1. If parameter has Keywords, suggest them
                        if (param.Keywords) {
                            const keywords = param.Keywords.split(',').map(k => k.trim());
                            for (const keyword of keywords) {
                                if (context.partial === '' || keyword.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: keyword,
                                        kind: CompletionItemKind.EnumMember,
                                        detail: `Keyword: ${param.KeywordSet || 'Value'}`,
                                        insertText: keyword,
                                        sortText: '0_' + keyword.toLowerCase(),
                                    });
                                }
                            }
                        }
                        // 2. If Datatype is Logical, suggest Yes/No/True/False
                        else if (param.DataType?.toLowerCase() === 'logical') {
                            const logicalValues = ['Yes', 'No'];
                            for (const val of logicalValues) {
                                if (context.partial === '' || val.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: val,
                                        kind: CompletionItemKind.Value,
                                        detail: 'Logical value',
                                        insertText: val,
                                        sortText: '0_' + val.toLowerCase(),
                                    });
                                }
                            }
                        }
                        // 3. If parameter refers to a definition, suggest matching definitions
                        else if (param.RefersTo) {
                            const refersToType = param.RefersTo.trim();
                            items.push(...getSuggestionsForDefinitionType(refersToType, context.partial, md, symbolTable));
                        }
                        // 4. If Datatype is String, add a hint
                        else if (param.DataType?.toLowerCase() === 'string') {
                            items.push({
                                label: '"..."',
                                kind: CompletionItemKind.Snippet,
                                detail: 'Expects a quoted string',
                                insertText: '"$0"',
                                insertTextFormat: 2, // Snippet
                                sortText: '0_string',
                            });
                        }

                        // 5. Add function suggestions
                        if (context.partial.startsWith('$$') || context.partial === '$') {
                            const funcPartial = context.partial.startsWith('$$')
                                ? context.partial.substring(2)
                                : '';
                            const expectedType = param.DataType;
                            items.push(...getFunctionSuggestions(md, funcPartial, expectedType));
                        }
                    }
                }
                break;

            case 'modifier_value':
                if (currentDef && context.modifierName && context.paramIndex !== undefined) {
                    const modName = context.modifierName.toLowerCase();
                    const partial = context.partial.toLowerCase();
                    
                    if (modName === 'local') {
                        // Local : <Definition Type> : <Definition Name> : <Attribute> : <Value>
                        if (context.paramIndex === 0) {
                            // Typing <Definition Type>
                            const defTypes = getDefinitionTypes(md);
                            const normalizedPartial = normalizeTypeName(partial);
            
                            for (const defType of defTypes) {
                                if (normalizedPartial === '' || normalizeTypeName(defType).includes(normalizedPartial)) {
                                    items.push({
                                        label: defType,
                                        kind: CompletionItemKind.Class,
                                        detail: 'TDL Definition Type',
                                        insertText: `${defType} : `,
                                        sortText: defType.toLowerCase(),
                                    });
                                }
                            }
                        } else if (context.paramIndex === 1) {
                            // Typing <Definition Name>
                            const targetDefType = context.modifierParts?.[0];
                            if (targetDefType) {
                                items.push(...getSuggestionsForDefinitionType(targetDefType, context.partial, md, symbolTable));
                            }
                        } else if (context.paramIndex === 2) {
                            // Typing <Attribute>
                            const targetDefType = context.modifierParts?.[0];
                            if (targetDefType) {
                                const normalizedTargetType = normalizeTypeName(targetDefType);
                                let matchingDefAttributes: TDLDefinition[] | undefined;
                                for (const [defType, attributes] of md.definitions) {
                                    if (normalizeTypeName(defType) === normalizedTargetType) {
                                        matchingDefAttributes = attributes;
                                        break;
                                    }
                                }
                                if (matchingDefAttributes) {
                                    for (const attr of matchingDefAttributes) {
                                        const names = [attr.Name];
                                        if (attr.Aliases) names.push(...attr.Aliases.split(',').map(a => a.trim()));
                                        if (partial === '' || names.some(n => n.toLowerCase().includes(partial))) {
                                            const displayAttr = isXml ? attr.Name.toUpperCase().replace(/\s+/g, '') : attr.Name;
                                            items.push({
                                                label: displayAttr,
                                                kind: CompletionItemKind.Property,
                                                detail: `${targetDefType} attribute`,
                                                insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr} : `,
                                                insertTextFormat: isXml ? 2 : undefined,
                                                documentation: { kind: MarkupKind.Markdown, value: buildAttributeDocumentation(attr) },
                                                sortText: attr.Name.toLowerCase(),
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    } else if (['add', 'delete', 'replace'].includes(modName)) {
                        if (context.paramIndex === 0) {
                            // Suggest attributes of the current definition
                            const defTypeName = currentDef.type.text;
                            const normalizedDefType = normalizeTypeName(defTypeName);

                            let matchingDefAttributes: TDLDefinition[] | undefined;
                            for (const [defType, attributes] of md.definitions) {
                                if (normalizeTypeName(defType) === normalizedDefType) {
                                    matchingDefAttributes = attributes;
                                    break;
                                }
                            }
                            if (matchingDefAttributes) {
                                for (const attr of matchingDefAttributes) {
                                    const names = [attr.Name];
                                    if (attr.Aliases) names.push(...attr.Aliases.split(',').map(a => a.trim()));
                                    if (partial === '' || names.some(n => n.toLowerCase().includes(partial))) {
                                        const displayAttr = isXml ? attr.Name.toUpperCase().replace(/\s+/g, '') : attr.Name;
                                        items.push({
                                            label: displayAttr,
                                            kind: CompletionItemKind.Property,
                                            detail: `${defTypeName} attribute`,
                                            insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr} : `,
                                            insertTextFormat: isXml ? 2 : undefined,
                                            documentation: { kind: MarkupKind.Markdown, value: buildAttributeDocumentation(attr) },
                                            sortText: attr.Name.toLowerCase(),
                                        });
                                    }
                                }
                            }
                        } else if (context.paramIndex === 1 && modName === 'add') {
                            // Position modifiers for Add
                            const positions = ['Before', 'After', 'At Beginning', 'At End'];
                            for (const pos of positions) {
                                if (partial === '' || pos.toLowerCase().includes(partial)) {
                                    items.push({
                                        label: pos,
                                        kind: CompletionItemKind.Keyword,
                                        detail: 'Position modifier',
                                        insertText: `${pos} : `,
                                        sortText: '0_' + pos.toLowerCase(),
                                    });
                                }
                            }
                        }
                    } else if (modName === 'use') {
                        // Use : <Definition Name>
                        if (context.paramIndex === 0) {
                            const defTypeName = currentDef.type.text;
                            items.push(...getSuggestionsForDefinitionType(defTypeName, context.partial, md, symbolTable));
                        }
                    }
                }
                break;

            case 'attribute':
                if (isXml && context.tagPath && context.tagPath.length > 0) {
                    let rootTagIdx = -1;
                    let rootTag = '';
                    for (let i = context.tagPath.length - 1; i >= 0; i--) {
                        if (md.primarySchemaNames.some(s => s.toUpperCase() === context.tagPath![i].toUpperCase())) {
                            rootTagIdx = i;
                            rootTag = context.tagPath[i];
                            break;
                        }
                    }

                    if (rootTagIdx !== -1) {
                        const rootKey = Array.from(md.schemas.keys()).find(k => k.toUpperCase() === rootTag.toUpperCase());
                        let currentSchema = rootKey ? md.schemas.get(rootKey) : undefined;
                        
                        if (currentSchema) {
                            const systemAttributes = [
                                { name: 'Action', type: 'String', values: ['Create', 'Alter', 'Delete'] },
                                { name: 'NAME', type: 'String' }
                            ];
                            
                            if (currentSchema.Name.toUpperCase() === 'VOUCHER') {
                                systemAttributes.push(
                                    { name: 'VCHTYPE', type: 'String' },
                                    { name: 'OBJVIEW', type: 'String', values: ['Accounting Voucher View', 'Invoice Voucher View'] }
                                );
                            }

                            for (const sysAttr of systemAttributes) {
                                if (context.partial === '' || sysAttr.name.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: sysAttr.name,
                                        kind: CompletionItemKind.Property,
                                        detail: `System Attribute (${sysAttr.type})`,
                                        insertText: `${sysAttr.name}="$1"$0`,
                                        insertTextFormat: 2,
                                        sortText: '0_' + sysAttr.name.toLowerCase()
                                    });
                                }
                            }

                            for (const [propName, propDef] of currentSchema.Properties) {
                                let displayProp = propName.toUpperCase().replace(/\s+/g, '');
                                let insertText = '';
                                
                                if (propDef.IsComplex) {
                                    if (!displayProp.endsWith('.LIST')) {
                                        displayProp += '.LIST';
                                    }
                                    insertText = `${displayProp}>\n\t$0\n</${displayProp}>`;
                                } else if (propDef.IsRepeated) {
                                    if (!displayProp.endsWith('.LIST')) {
                                        displayProp += '.LIST';
                                    }
                                    const innerTag = propName.toUpperCase().replace(/\s+/g, '');
                                    const cleanType = propDef.DataType ? propDef.DataType.split(' ')[0] : '';
                                    const typeAttr = cleanType ? ` TYPE="${cleanType}"` : '';
                                    insertText = `${displayProp}${typeAttr}>\n\t<${innerTag}>$0</${innerTag}>\n</${displayProp}>`;
                                } else {
                                    insertText = `${displayProp}>$0</${displayProp}>`;
                                }

                                if (context.partial === '' || displayProp.toLowerCase().includes(context.partial.toLowerCase()) || propName.toLowerCase().includes(context.partial.toLowerCase())) {
                                    items.push({
                                        label: displayProp,
                                        kind: CompletionItemKind.Property,
                                        detail: `Schema Property (${propDef.DataType || 'String'})`,
                                        insertText: insertText,
                                        insertTextFormat: 2,
                                        documentation: { kind: MarkupKind.Markdown, value: `Type: ${propDef.DataType || 'String'}\nOriginal Name: ${propName}` },
                                        sortText: displayProp,
                                    });
                                }
                            }
                        }
                        break; // Stop here, don't show normal definition attributes for schema
                    }
                }

                // Attribute completion within a definition
                if (currentDef) {
                    const defTypeName = currentDef.type.text;
                    const normalizedDefType = normalizeTypeName(defTypeName);

                    let matchingDefAttributes: TDLDefinition[] | undefined;
                    for (const [defType, attributes] of md.definitions) {
                        if (normalizeTypeName(defType) === normalizedDefType) {
                            matchingDefAttributes = attributes;
                            break;
                        }
                    }

                    if (matchingDefAttributes) {
                        const partial = context.partial.toLowerCase();
                        for (const attr of matchingDefAttributes) {
                            const names = [attr.Name];
                            if (attr.Aliases) {
                                names.push(...attr.Aliases.split(',').map(a => a.trim()));
                            }

                            const nameMatches = partial === '' || names.some(n => n.toLowerCase().includes(partial));

                            if (nameMatches) {
                                const displayAttr = isXml ? attr.Name.toUpperCase().replace(/\s+/g, '') : attr.Name;
                                items.push({
                                    label: displayAttr,
                                    kind: CompletionItemKind.Property,
                                    detail: `${defTypeName} attribute`,
                                    insertText: isXml ? `${displayAttr}>$0</${displayAttr}>` : `${displayAttr} : `,
                                    insertTextFormat: isXml ? 2 : undefined,
                                    documentation: {
                                        kind: MarkupKind.Markdown,
                                        value: buildAttributeDocumentation(attr)
                                    },
                                    sortText: '1_' + attr.Name.toLowerCase(),
                                });
                            }
                        }
                    }
                }
                break;

            case 'attribute_value':
                if (isXml && context.tagPath && context.tagPath.length > 0 && context.attributeName) {
                    let rootTagIdx = -1;
                    let rootTag = '';
                    for (let i = context.tagPath.length - 1; i >= 0; i--) {
                        if (md.primarySchemaNames.some(s => s.toUpperCase() === context.tagPath![i].toUpperCase())) {
                            rootTagIdx = i;
                            rootTag = context.tagPath[i];
                            break;
                        }
                    }

                    if (rootTagIdx !== -1) {
                        const rootKey = Array.from(md.schemas.keys()).find(k => k.toUpperCase() === rootTag.toUpperCase());
                        let currentSchema = rootKey ? md.schemas.get(rootKey) : undefined;
                        
                        // tagPath gives us the path to the parent. We are typing the value of `context.attributeName`
                        // Since tagPath includes the attributeName as its last element, we loop up to length - 1
                        // But wait! rootTagIdx is the index of the primary schema.
                        for (let i = rootTagIdx + 1; i < context.tagPath.length - 1; i++) {
                            const step = context.tagPath[i];
                            const normalizedStep = step.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
                            const complexPropKey = Array.from(currentSchema?.ComplexProperties.keys() || []).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedStep);
                            if (complexPropKey) {
                                const nextSchemaName = currentSchema!.ComplexProperties.get(complexPropKey)!;
                                const nextKey = Array.from(md.schemas.keys()).find(k => k.toUpperCase() === nextSchemaName.toUpperCase());
                                currentSchema = nextKey ? md.schemas.get(nextKey) : undefined;
                            } else {
                                currentSchema = undefined;
                                break;
                            }
                        }

                        if (currentSchema) {
                            const normalizedAttrName = context.attributeName!.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '');
                            
                            if (normalizedAttrName === 'ACTION') {
                                const actions = ['Create', 'Alter', 'Delete'];
                                for (const action of actions) {
                                    if (context.partial === '' || action.toLowerCase().includes(context.partial.toLowerCase())) {
                                        items.push({
                                            label: action,
                                            kind: CompletionItemKind.Value,
                                            insertText: action,
                                            sortText: '0_' + action.toLowerCase()
                                        });
                                    }
                                }
                            } else if (normalizedAttrName === 'OBJVIEW' && currentSchema.Name.toUpperCase() === 'VOUCHER') {
                                const views = ['Accounting Voucher View', 'Invoice Voucher View'];
                                for (const view of views) {
                                    if (context.partial === '' || view.toLowerCase().includes(context.partial.toLowerCase())) {
                                        items.push({
                                            label: view,
                                            kind: CompletionItemKind.Value,
                                            insertText: view,
                                            sortText: '0_' + view.toLowerCase()
                                        });
                                    }
                                }
                            }

                            const propKey = Array.from(currentSchema.Properties.keys()).find(k => k.toUpperCase().replace(/\s+/g, '').replace(/\.LIST$/, '') === normalizedAttrName);
                            if (propKey) {
                                const propDef = currentSchema.Properties.get(propKey)!;
                                if (propDef.DataType?.toLowerCase() === 'logical') {
                                    const logicalValues = ['Yes', 'No'];
                                    for (const val of logicalValues) {
                                        if (context.partial === '' || val.toLowerCase().includes(context.partial.toLowerCase())) {
                                            items.push({
                                                label: val,
                                                kind: CompletionItemKind.Value,
                                                detail: 'Logical value',
                                                insertText: val,
                                                sortText: '0_' + val.toLowerCase(),
                                            });
                                        }
                                    }
                                }
                            }
                        }
                        break; // Stop here, no normal attribute completion
                    }
                }

                if (currentDef && context.attributeName && context.paramIndex !== undefined) {
                    const defTypeName = currentDef.type.text;
                    const normalizedDefType = normalizeTypeName(defTypeName);
                    const attrName = context.attributeName.toLowerCase();

                    // Find definition metadata
                    let matchingDefAttributes: TDLDefinition[] | undefined;
                    for (const [defType, attributes] of md.definitions) {
                        if (normalizeTypeName(defType) === normalizedDefType) {
                            matchingDefAttributes = attributes;
                            break;
                        }
                    }

                    if (matchingDefAttributes) {
                        // Find the specific attribute
                        const attrDef = matchingDefAttributes.find(a =>
                            a.Name.toLowerCase() === attrName ||
                            a.Aliases?.split(',').map(x => x.trim().toLowerCase()).includes(attrName)
                        );

                        if (attrDef && attrDef.Parameters && attrDef.Parameters.length > context.paramIndex) {
                            const param = attrDef.Parameters[context.paramIndex];

                            // 1. If parameter has Keywords, suggest them
                            if (param.Keywords) {
                                const keywords = param.Keywords.split(',').map(k => k.trim());
                                for (const keyword of keywords) {
                                    if (context.partial === '' || keyword.toLowerCase().includes(context.partial.toLowerCase())) {
                                        items.push({
                                            label: keyword,
                                            kind: CompletionItemKind.EnumMember,
                                            detail: `Keyword: ${param.KeywordSet || 'Value'}`,
                                            insertText: keyword,
                                            sortText: '0_' + keyword.toLowerCase(),
                                        });
                                    }
                                }
                            }
                            // 2. If Datatype is Logical, suggest Yes/No/True/False
                            else if (param.DataType?.toLowerCase() === 'logical') {
                                const logicalValues = ['Yes', 'No'];
                                for (const val of logicalValues) {
                                    if (context.partial === '' || val.toLowerCase().includes(context.partial.toLowerCase())) {
                                        items.push({
                                            label: val,
                                            kind: CompletionItemKind.Value,
                                            detail: 'Logical value',
                                            insertText: val,
                                            sortText: '0_' + val.toLowerCase(),
                                        });
                                    }
                                }
                            }
                            // 3. If parameter refers to a definition, suggest matching definitions
                            else if (param.RefersTo) {
                                const refersToType = param.RefersTo.trim();
                                items.push(...getSuggestionsForDefinitionType(refersToType, context.partial, md, symbolTable));
                            }
                            // 4. If Datatype is String, add a hint
                            else if (param.DataType?.toLowerCase() === 'string') {
                                items.push({
                                    label: '"..."',
                                    kind: CompletionItemKind.Snippet,
                                    detail: 'Expects a quoted string',
                                    insertText: '"$0"',
                                    insertTextFormat: 2, // Snippet
                                    sortText: '0_string',
                                });
                            }

                            // 5. Add function suggestions sorted by return type matching expected datatype
                            // Check if user typed $$ to trigger function completion
                            if (context.partial.startsWith('$$') || context.partial === '$') {
                                const funcPartial = context.partial.startsWith('$$')
                                    ? context.partial.substring(2)
                                    : '';
                                const expectedType = param.DataType;
                                items.push(...getFunctionSuggestions(md, funcPartial, expectedType));
                            }
                        }
                    }
                }
                break;
        }

        return { items, isIncomplete: true };
    });
}