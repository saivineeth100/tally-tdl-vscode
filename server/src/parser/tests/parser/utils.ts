export function cleanAST(node: any): any {
    if (Array.isArray(node)) {
        return node.map(cleanAST);
    }
    if (node !== null && typeof node === 'object') {
        const copy: any = {};
        for (const key in node) {
            // Remove parent to avoid circular references
            // Optional: remove start/end if you don't want positional data in snapshots,
            // but usually start/end are good for verifying boundaries.
            if (key === 'parent') continue;
            copy[key] = cleanAST(node[key]);
        }
        return copy;
    }
    return node;
}
