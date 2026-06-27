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