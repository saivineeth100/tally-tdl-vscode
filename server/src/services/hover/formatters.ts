import { DefinitionNode } from '../../parser/ast';
import { ScopeManager } from '../scopeManager';
import { AttributeSymbol, FunctionSymbol, ActionSymbol, TDLParameter } from '../../models/symbols';

/**
 * Create hover content for a definition
 */
export function createHoverContent(def: DefinitionNode, scopeManager?: ScopeManager, uri?: string): string {
    const lines: string[] = [];

    const prefix = def.modifier ? '#' : '';
    lines.push(`**${prefix}${def.type.text}**: ${def.name?.text}`);

    if (def.modifier) {
        lines.push('*Modified Definition*');
    }

    if (scopeManager && uri) {
        const scope = scopeManager.getScopeAt(uri, def.start);
        if (scope) {
            lines.push(`*Scope: ${scope.kind}*`);
        }
    }

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
 */
export function createAttributeHover(attrSym: AttributeSymbol): string {
    const lines: string[] = [];

    lines.push(`**${attrSym.name}**`);

    if (attrSym.description) {
        lines.push('');
        lines.push(attrSym.description);
    }

    if (attrSym.type) {
        lines.push('');
        lines.push(`*Type: ${attrSym.type}*`);
    }

    if (attrSym.parameters && attrSym.parameters.length > 0) {
        lines.push('');
        lines.push('**Parameters:**');
        attrSym.parameters.forEach((param, idx) => {
            const parts: string[] = [];
            if (param.IsMandatory) parts.push('**Required**');
            if (param.DataType) parts.push(`Type: ${param.DataType}`);
            if (param.RefersTo) parts.push(`Refers to: ${param.RefersTo.trim()}`);
            if (param.Keywords) parts.push(`Keywords: ${param.Keywords}`);
            lines.push(`${idx + 1}. ${parts.join(', ') || 'Value'}`);
        });
    }

    if (attrSym.aliases && attrSym.aliases !== attrSym.name) {
        lines.push('');
        lines.push(`*Aliases: ${attrSym.aliases}*`);
    }

    return lines.join('\n');
}

/**
 * Create hover content for a parameter (works for both function and attribute parameters)
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
 * Create hover content for a TDL function or action
 */
export function createFunctionHover(func: FunctionSymbol | ActionSymbol): string {
    const lines: string[] = [];

    const paramStrings = (func.parameters || []).map((p, index) => {
        let pName = p.ParameterType || 'param' + index;
        let pStr = `${pName}: ${p.DataType || 'Any'}`;
        if (!p.IsMandatory) pStr = `[${pStr}]`;
        return pStr;
    });
    
    const sig = `$$${func.name}(${paramStrings.join(', ')})${func.returnType ? ': ' + func.returnType : ''}`;
    
    lines.push('```tdl');
    lines.push(sig);
    lines.push('```');

    if (func.description) {
        lines.push('___');
        lines.push(func.description);
    }

    if (func.parameters && func.parameters.length > 0) {
        lines.push('___');
        lines.push('**Parameters:**');
        func.parameters.forEach((param, idx) => {
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
    const actionFunc = func as ActionSymbol;
    if (actionFunc.category) metaParts.push(`Category: **${actionFunc.category}**`);
    if (actionFunc.mode) metaParts.push(`Mode: **${actionFunc.mode}**`);
    
    if (metaParts.length > 0) {
        lines.push('___');
        lines.push(metaParts.join(' | '));
    }

    return lines.join('\n');
}
