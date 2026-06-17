/**
 * Normalize a definition type name for matching
 * Removes spaces and converts to lowercase
 */
export function normalizeTypeName(name: string): string {
    if (!name) return '';
    return name.replace(/\s+/g, '').toLowerCase();
}
/**
 * Normalize a definition type name for matching
 * Removes spaces and converts to lowercase
 */
export function normalizeXMLTypeName(name: string): string {
    if (!name) return '';
    return name.replace(/\s+/g, '').toUpperCase();
}

/**
 * Map of interchangeable TDL types
 */
const INTERCHANGEABLE_TYPES_MAP: Record<string, string[]> = {
    'variable': ['variable', 'variables'],
    'variables': ['variable', 'variables']
};

/**
 * Register interchangeable types dynamically.
 */
export function registerInterchangeableTypes(types: string[]) {
    const normalized = types.map(t => normalizeTypeName(t));
    for (const t of normalized) {
        if (!INTERCHANGEABLE_TYPES_MAP[t]) {
            INTERCHANGEABLE_TYPES_MAP[t] = [];
        }
        for (const alias of normalized) {
            if (!INTERCHANGEABLE_TYPES_MAP[t].includes(alias)) {
                INTERCHANGEABLE_TYPES_MAP[t].push(alias);
            }
        }
    }
}

/**
 * Returns an array of interchangeable types for a given type.
 * If the type has no interchangeable types, returns an array containing just the type itself.
 */
export function getInterchangeableTypes(normalizedType: string): string[] {
    return INTERCHANGEABLE_TYPES_MAP[normalizedType] || [normalizedType];
}