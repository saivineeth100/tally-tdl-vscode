export function extractVariables(xml: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = new Set<string>();
    let match;
    while ((match = regex.exec(xml)) !== null) {
        matches.add(match[1].trim());
    }
    return Array.from(matches);
}

export function extractVariableTags(xml: string): Record<string, string> {
    const regex = /<([a-zA-Z0-9_]+)[^>]*>\s*\{\{([^}]+)\}\}\s*<\/\1>/ig;
    const result: Record<string, string> = {};
    let match;
    while ((match = regex.exec(xml)) !== null) {
        const tag = match[1].toUpperCase();
        const varName = match[2].trim();
        result[varName] = tag;
    }
    return result;
}

function escapeXml(unsafe: string): string {
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
            default: return c;
        }
    });
}

export function substituteVariables(xml: string, values: Map<string, string>): string {
    return xml.replace(/\{\{([^}]+)\}\}/g, (match, p1) => {
        const varName = p1.trim();
        return values.has(varName) ? escapeXml(values.get(varName)!) : match;
    });
}
