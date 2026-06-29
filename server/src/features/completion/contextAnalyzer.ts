import { DefinitionNode, SourceFile } from '../../parser/ast';

/**
 * Context for completion
 */
export interface CompletionContext {
    type: 'schema_type' | 'definition_type' | 'definition_name' | 'attribute' | 'attribute_value' | 'function' | 'variable' | 'formula' | 'local_formula' | 'global_formula' | 'field' | 'field_reference' | 'function_action' | 'function_action_parameter' | 'modifier_value' | 'xml_schema_attribute' | 'directive_file_level' | 'directive_def_level' | 'unknown';
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
    isInUse?: boolean;
    directiveName?: string;
    hasTrailingColon?: boolean;
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

    if (!currentDef || (currentDef.isIncomplete && offset < currentDef.start + 5)) {
        // Outside definition or typing a new one

        // Check for file-level directive context: `<`
        const openDirectiveIdx = textBefore.lastIndexOf('<');
        const closeDirectiveIdx = textBefore.lastIndexOf('>');
        if (openDirectiveIdx !== -1 && openDirectiveIdx > closeDirectiveIdx) {
            const content = textBefore.slice(openDirectiveIdx + 1).trimStart();
            const lastCommaIdx = content.lastIndexOf(',');
            
            // If there's a comma, we are in a subsequent item, which skips the directive name
            const currentItem = lastCommaIdx !== -1 ? content.slice(lastCommaIdx + 1).trimStart() : content;
            const colonsCount = (currentItem.match(/:/g) || []).length;
            
            if (lastCommaIdx === -1) {
                // First item (e.g. `<System: Formula: Name`)
                if (colonsCount === 0) {
                    return { type: 'directive_file_level', partial: currentItem.trim(), hasModifier: false };
                } else if (colonsCount === 1) {
                    const colonIdx = currentItem.indexOf(':');
                    const directiveName = currentItem.slice(0, colonIdx).trim().toLowerCase();
                    return { type: 'definition_type', partial: currentItem.slice(colonIdx + 1).trimStart(), hasModifier: false, directiveName };
                } else if (colonsCount === 2) {
                    const firstColon = currentItem.indexOf(':');
                    const secondColon = currentItem.indexOf(':', firstColon + 1);
                    const defType = currentItem.slice(firstColon + 1, secondColon).trim();
                    const partial = currentItem.slice(secondColon + 1).trimStart();
                    return { type: 'definition_name', partial, hasModifier: false, defType, isInUse: true };
                }
            } else {
                // Subsequent items (e.g. `... , Form: MixinF`)
                if (colonsCount === 0) {
                    // For subsequent items, we don't strictly have a directiveName on THIS segment,
                    // but we might want to extract it from the very first segment if needed. 
                    // However, for Deftype there are no subsequent items, so it's mainly for InUse.
                    return { type: 'definition_type', partial: currentItem.trim(), hasModifier: false };
                } else if (colonsCount === 1) {
                    const colonIdx = currentItem.indexOf(':');
                    const defType = currentItem.slice(0, colonIdx).trim();
                    const partial = currentItem.slice(colonIdx + 1).trimStart();
                    return { type: 'definition_name', partial, hasModifier: false, defType, isInUse: true };
                }
            }
        }
    }

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

    // 2.5. Check for # (field reference context)
    const singleHashIdx = trimmed.lastIndexOf('#');
    if (singleHashIdx !== -1 && 
        (hashIdx === -1 || singleHashIdx > hashIdx + 1) && 
        (dollarIdx === -1 || singleHashIdx > dollarIdx)) {
        
        // Ensure it's not part of ##
        if (singleHashIdx === 0 || trimmed[singleHashIdx - 1] !== '#') {
            const afterHash = trimmed.slice(singleHashIdx + 1);
            if (!afterHash.includes(':')) {
                return { type: 'field_reference', partial: afterHash.trim(), hasModifier: false };
            }
        }
    }

    // 3. Check for @@ or @ (formula context)
    const atAtIdx = trimmed.lastIndexOf('@@');
    const singleAtIdx = trimmed.lastIndexOf('@');
    
    if (atAtIdx !== -1 && (dollarIdx === -1 || atAtIdx > dollarIdx) && (hashIdx === -1 || atAtIdx > hashIdx)) {
        const afterAt = trimmed.slice(atAtIdx + 2);
        if (!afterAt.includes(':')) {
            return { type: 'global_formula', partial: afterAt.trim(), hasModifier: false };
        }
    } else if (singleAtIdx !== -1 && (dollarIdx === -1 || singleAtIdx > dollarIdx) && (hashIdx === -1 || singleAtIdx > hashIdx)) {
        const afterAt = trimmed.slice(singleAtIdx + 1);
        if (!afterAt.includes(':')) {
            return { type: 'local_formula', partial: afterAt.trim(), hasModifier: false };
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

        // Check for definition-level directive context: `<`
        const openDirectiveIdx = trimmedLine.lastIndexOf('<');
        const closeDirectiveIdx = trimmedLine.lastIndexOf('>');
        if (openDirectiveIdx !== -1 && openDirectiveIdx > closeDirectiveIdx) {
            const content = trimmedLine.slice(openDirectiveIdx + 1).trimStart();
            const lastCommaIdx = content.lastIndexOf(',');
            
            // If there's a comma, we are in a subsequent item, which skips the directive name
            const currentItem = lastCommaIdx !== -1 ? content.slice(lastCommaIdx + 1).trimStart() : content;
            const colonsCount = (currentItem.match(/:/g) || []).length;
            
            if (lastCommaIdx === -1) {
                // First item (e.g. `<InUse: Report: Name` or `<Deftype: Report`)
                if (colonsCount === 0) {
                    return { type: 'directive_def_level', partial: currentItem.trim(), hasModifier: false };
                } else if (colonsCount === 1) {
                    const colonIdx = currentItem.indexOf(':');
                    const directiveName = currentItem.slice(0, colonIdx).trim().toLowerCase();
                    return { type: 'definition_type', partial: currentItem.slice(colonIdx + 1).trimStart(), hasModifier: false, directiveName };
                } else if (colonsCount === 2) {
                    const firstColon = currentItem.indexOf(':');
                    const secondColon = currentItem.indexOf(':', firstColon + 1);
                    const defType = currentItem.slice(firstColon + 1, secondColon).trim();
                    const partial = currentItem.slice(secondColon + 1).trimStart();
                    return { type: 'definition_name', partial, hasModifier: true, defType, isInUse: true };
                }
            } else {
                // Subsequent items (e.g. `... , Form: MixinF`)
                if (colonsCount === 0) {
                    return { type: 'definition_type', partial: currentItem.trim(), hasModifier: false };
                } else if (colonsCount === 1) {
                    const colonIdx = currentItem.indexOf(':');
                    const defType = currentItem.slice(0, colonIdx).trim();
                    const partial = currentItem.slice(colonIdx + 1).trimStart();
                    return { type: 'definition_name', partial, hasModifier: true, defType, isInUse: true };
                }
            }
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
            const paramIndex = (valuePart.match(/,/g) || []).length;
            const lastCommaIndex = valuePart.lastIndexOf(',');
            const partial = valuePart.slice(lastCommaIndex + 1).trimStart(); 

            return {
                type: 'attribute_value',
                partial: partial.trim(),
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
                tagPath,
                defType: currentDef ? currentDef.type.text : undefined
            };
        }
    }
    
    return { type: 'unknown', partial: '', hasModifier: false };
}
