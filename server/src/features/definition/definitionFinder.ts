import { DefinitionNode, SourceFile } from '../../core/ast/ast';

/**
 * Find the definition that owns the given offset
 * optimized for TDL structure where definitions are sequential blocks
 */
export function getDefinitionAtOffset(sourceFile: SourceFile, offset: number): DefinitionNode | undefined {
    for (let i = 0; i < sourceFile.definitions.length; i++) {
        const def = sourceFile.definitions[i];
        const nextDef = sourceFile.definitions[i + 1];

        // Start of this definition
        const start = def.openBracket?.Start ?? def.start;
        const endLimit = nextDef ? (nextDef.openBracket?.Start ?? nextDef.start) : Number.MAX_SAFE_INTEGER;

        if (offset >= start && offset < endLimit) {
            return def;
        }
    }
    return undefined;
}

/**
 * Find a definition by name and optionally type
 * @param sourceFile Parsed source file
 * @param name Definition name to find (case-insensitive)
 * @param type Optional definition type to filter by
 * @param skipModifiers If true, skip definitions with modifiers (#, !, *)
 * @returns DefinitionNode if found, undefined otherwise
 */
export function findDefinitionByName(
    sourceFile: SourceFile,
    name: string,
    type?: string,
    skipModifiers: boolean = false
): DefinitionNode | undefined {
    const lowerName = name.toLowerCase().replace(/\s+/g, '');

    for (const def of sourceFile.definitions) {
        // Skip modifier definitions if requested
        if (skipModifiers && def.modifier) {
            continue;
        }

        const defName = def.name?.text?.toLowerCase().replace(/\s+/g, '');
        if (defName === lowerName) {
            // If type specified, check it matches
            if (type) {
                if (def.type.text.toLowerCase() === type.toLowerCase()) {
                    return def;
                }
            } else {
                return def;
            }
        }
    }
    return undefined;
}

/**
 * Find all definitions matching a name across multiple source files
 * @param sourceFiles Array of parsed source files
 * @param name Definition name to find
 * @param type Optional definition type to filter by
 * @returns Array of matching definitions
 */
export function findAllDefinitionsByName(
    sourceFiles: SourceFile[],
    name: string,
    type?: string
): DefinitionNode[] {
    const results: DefinitionNode[] = [];
    for (const sf of sourceFiles) {
        const def = findDefinitionByName(sf, name, type);
        if (def) {
            results.push(def);
        }
    }
    return results;
}

/**
 * Get the location (start, end) of a definition for jump-to-definition
 * @param def Definition node
 * @returns Object with start and end offsets
 */
export function getDefinitionLocation(def: DefinitionNode): { start: number; end: number } {
    return {
        start: def.openBracket.Start,
        end: def.closeBracket.Start + def.closeBracket.Length
    };
}
