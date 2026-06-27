import { AttributeSymbol, FunctionSymbol } from '../../models/symbols';
import { ScopeManager } from '../../services/scopeManager';

/**
 * Build markdown documentation for an attribute
 */
export function buildAttributeDocumentation(attr: AttributeSymbol): string {
    let doc = attr.description || '';

    if (attr.parameters && attr.parameters.length > 0) {
        doc += '\n\n**Parameters:**\n';
        attr.parameters.forEach((param, idx) => {
            const parts: string[] = [];
            if (param.DataType) parts.push(`Type: ${param.DataType}`);
            if (param.IsMandatory) parts.push('Required');
            else parts.push('Optional');
            if (param.RefersTo) parts.push(`Refers to: ${param.RefersTo.trim()}`);
            if (param.KeywordSet) parts.push(`Keywords: ${param.Keywords}`);
            doc += `- Param ${idx + 1}: ${parts.join(', ')}\n`;
        });
    }

    if (attr.type) {
        doc += `\n**Type:** ${attr.type}`;
    }

    if (attr.aliases && attr.aliases !== attr.name) {
        doc += `\n\n**Aliases:** ${attr.aliases}`;
    }

    return doc;
}

/**
 * Build markdown documentation for a function
 * @param func Function metadata
 * @returns Markdown documentation string
 */
export function buildFunctionDocumentation(func: FunctionSymbol): string {
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

            lines.push(`- \`${param.ParameterType || 'param' + (idx + 1)}\` &mdash; ${parts.join(', ')}`);
        });
    }

    return lines.join('\n');
}

/**
 * Get definition types from metadata
 */
export function getDefinitionTypes(scopeManager: ScopeManager): string[] {
    const types = scopeManager.getDefinitionTypes();
    // Include and Import are special system directives parsed as definition types
    types.push('Include');
    return types;
}
