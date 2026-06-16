import { TDLDefinitionAttribute, TdlMetadata } from '../../tdlMetaData';
import { TDLFunction } from '../../models/tdlFunction';
import { CompletionItem, CompletionItemKind, MarkupKind } from 'vscode-languageserver/node';

/**
 * Build markdown documentation for an attribute
 */
export function buildAttributeDocumentation(attr: TDLDefinitionAttribute): string {
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
export function buildFunctionDocumentation(func: TDLFunction): string {
    const lines: string[] = [];

    const paramStrings = func.Parameters.map((p, index) => {
        let pName = p.ParameterType || 'param' + index;
        let pStr = `${pName}: ${p.DataType || 'Any'}`;
        if (!p.IsMandatory) pStr = `[${pStr}]`;
        return pStr;
    });
    
    const sig = `$$${func.Name}(${paramStrings.join(', ')})${func.ReturnType ? ': ' + func.ReturnType : ''}`;
    
    lines.push('```tdl');
    lines.push(sig);
    lines.push('```');

    if (func.Description) {
        lines.push('___');
        lines.push(func.Description);
    }

    if (func.Parameters && func.Parameters.length > 0) {
        lines.push('___');
        lines.push('**Parameters:**');
        func.Parameters.forEach((param, idx) => {
            const parts: string[] = [];
            if (param.IsMandatory) parts.push('**Required**');
            else parts.push('*Optional*');
            if (param.DataType) parts.push(`Type: \`${param.DataType}\``);
            if (param.RefersTo) parts.push(`Refers to: \`${param.RefersTo.trim()}\``);
            if (param.Keywords) parts.push(`Keywords: \`${param.Keywords}\``);
            
            lines.push(`- \`${param.ParameterType || 'param' + (idx+1)}\` &mdash; ${parts.join(', ')}`);
        });
    }

    const metaParts = [];
    if (func.Category) metaParts.push(`Category: **${func.Category}**`);
    if (func.Mode) metaParts.push(`Mode: **${func.Mode}**`);
    
    if (metaParts.length > 0) {
        lines.push('___');
        lines.push(metaParts.join(' | '));
    }

    return lines.join('\n');
}

/**
 * Get definition types from metadata
 */
export function getDefinitionTypes(md: TdlMetadata): string[] {
    return Array.from(md.definitions.keys());
}
