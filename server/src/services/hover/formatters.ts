import { DefinitionNode } from '../../parser/ast';
import { TDLParameter } from '../../tdlMetaData';
import { TDLFunction, TDLFunctionParameter } from '../../models/tdlFunction';
import { ScopeManager } from '../scopeManager';

/**
 * Create hover content for a definition
 * @param def Definition node
 * @param scopeManager Optional ScopeManager to resolve scope info
 * @param uri Optional document URI
 * @returns Markdown formatted hover content
 */
export function createHoverContent(def: DefinitionNode, scopeManager?: ScopeManager, uri?: string): string {
    const lines: string[] = [];

    // Header
    const prefix = def.modifier ? '#' : '';
    lines.push(`**${prefix}${def.type.text}**: ${def.name?.text}`);

    // If it's a modifier
    if (def.modifier) {
        lines.push('*Modified Definition*');
    }

    if (scopeManager && uri) {
        const scope = scopeManager.getScopeAt(uri, def.start);
        if (scope) {
            lines.push(`*Scope: ${scope.kind}*`);
        }
    }

    // List attributes (first few)
    if (def.attributes.length > 0) {
        lines.push('');
        lines.push('Attributes:');
        def.attributes.slice(0, 5).forEach(attr => {
            lines.push(`- ${attr.name.text}`);
        });
        if (def.attributes.length > 5) {
            lines.push(`- ... (${def.attributes.length - 5} more)`);
        }
    }

    return lines.join('\n');
}

/**
 * Create hover content for an attribute
 * @param attrDef Attribute definition from metadata
 * @returns Markdown formatted hover content
 */
export function createAttributeHover(attrDef: any): string {
    const lines: string[] = [];

    lines.push(`**${attrDef.Name}**`);

    if (attrDef.Description) {
        lines.push('');
        lines.push(attrDef.Description);
    }

    if (attrDef.Type) {
        lines.push('');
        lines.push(`*Type: ${attrDef.Type}*`);
    }

    if (attrDef.Parameters && attrDef.Parameters.length > 0) {
        lines.push('');
        lines.push('**Parameters:**');
        attrDef.Parameters.forEach((param: TDLParameter, idx: number) => {
            const parts: string[] = [];
            if (param.IsMandatory) parts.push('**Required**');
            if (param.DataType) parts.push(`Type: ${param.DataType}`);
            if (param.RefersTo) parts.push(`Refers to: ${param.RefersTo.trim()}`);
            if (param.Keywords) parts.push(`Keywords: ${param.Keywords}`);
            lines.push(`${idx + 1}. ${parts.join(', ') || 'Value'}`);
        });
    }

    if (attrDef.Aliases && attrDef.Aliases !== attrDef.Name) {
        lines.push('');
        lines.push(`*Aliases: ${attrDef.Aliases}*`);
    }

    return lines.join('\n');
}

/**
 * Create hover content for a parameter
 * @param param Parameter definition from metadata
 * @param paramIndex 0-based index of the parameter
 * @returns Markdown formatted hover content
 */
export function createParameterHover(param: TDLParameter, paramIndex: number): string {
    const lines: string[] = [];

    lines.push(`**Parameter ${paramIndex + 1}**`);
    lines.push('');

    const infoLines: string[] = [];
    if (param.IsMandatory) {
        infoLines.push('- **Required**');
    } else {
        infoLines.push('- Optional');
    }

    if (param.DataType) {
        infoLines.push(`- Type: \`${param.DataType}\``);
    }

    if (param.RefersTo) {
        infoLines.push(`- Refers to: \`${param.RefersTo.trim()}\` definition`);
    }

    if (param.KeywordSet) {
        infoLines.push(`- Keyword Set: ${param.KeywordSet}`);
    }

    if (param.Keywords) {
        infoLines.push(`- Valid values: ${param.Keywords}`);
    }

    if (param.DataType?.toLowerCase() === 'logical') {
        infoLines.push('- Valid values: `Yes`, `No`');
    }

    lines.push(...infoLines);
    return lines.join('\n');
}

/**
 * Create hover content for a TDL function
 * @param func Function definition from metadata
 * @returns Markdown formatted hover content
 */
export function createFunctionHover(func: TDLFunction): string {
    const lines: string[] = [];

    // Generate signature for code block
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
 * Create hover content for a function parameter
 * @param param Function parameter definition
 * @param paramIndex 0-based index of the parameter
 * @returns Markdown formatted hover content
 */
export function createFunctionParameterHover(param: TDLFunctionParameter, paramIndex: number): string {
    const lines: string[] = [];

    lines.push(`**Parameter ${paramIndex + 1}**`);
    lines.push('');

    const infoLines: string[] = [];
    if (param.IsMandatory) {
        infoLines.push('- **Required**');
    } else {
        infoLines.push('- Optional');
    }

    if (param.DataType) {
        infoLines.push(`- Type: \`${param.DataType}\``);
    }

    if (param.RefersTo) {
        infoLines.push(`- Refers to: \`${param.RefersTo.trim()}\` definition`);
    }

    if (param.KeywordSet) {
        infoLines.push(`- Keyword Set: ${param.KeywordSet}`);
    }

    if (param.Keywords) {
        infoLines.push(`- Valid values: ${param.Keywords}`);
    }

    if (param.DataType?.toLowerCase() === 'logical') {
        infoLines.push('- Valid values: `Yes`, `No`');
    }

    lines.push(...infoLines);
    return lines.join('\n');
}
