/**
 * Normalize a definition type name for matching
 * Removes spaces and converts to lowercase
 */
export function normalizeTypeName(name: string): string {
    return name.replace(/\s+/g, '').toLowerCase();
}
