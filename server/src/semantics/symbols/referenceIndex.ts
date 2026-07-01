import { SourceFile, SyntaxKind, IdentifierNode } from '../../core/ast/ast';
import { walkAST } from '../../core/ast/astQuery';
import { normalizeTypeName } from '../../utils/normalizeUtils';

/**
 * An inverted index that maps exact TDL identifiers to the set of URIs
 * that contain them. This is used as a highly optimized O(1) filter for
 * Find All References, drastically reducing disk reads.
 */
export class ReferenceIndex {
    // Maps normalized identifier -> Set of URIs
    public identifierToUris = new Map<string, Set<string>>();
    // Maps URI -> Set of normalized identifiers in that file (used for cleanup)
    public uriToIdentifiers = new Map<string, Set<string>>();

    /**
     * Extracts identifiers from a parsed SourceFile and adds them to the index.
     * @param uri The URI of the file being indexed.
     * @param sourceFile The parsed AST of the file.
     */
    public indexFile(uri: string, sourceFile: SourceFile) {
        // Clear any old index entries for this file
        this.clearFile(uri);

        const identifiers = new Set<string>();

        // Walk the AST and collect every identifier
        walkAST(sourceFile, (node) => {
            if (node.kind === SyntaxKind.Identifier) {
                const text = (node as IdentifierNode).text;
                if (text) {
                    identifiers.add(normalizeTypeName(text));
                }
            }
        });

        this.uriToIdentifiers.set(uri, identifiers);
        
        for (const id of identifiers) {
            let uris = this.identifierToUris.get(id);
            if (!uris) {
                uris = new Set();
                this.identifierToUris.set(id, uris);
            }
            uris.add(uri);
        }
    }

    /**
     * Checks if a target identifier exists in the index, and returns the set of URIs
     * that contain it.
     * @param targetName The identifier to search for.
     * @returns A Set of URIs containing the identifier, or undefined if the identifier is not found.
     */
    public getCandidateUris(targetName: string): Set<string> | undefined {
        return this.identifierToUris.get(normalizeTypeName(targetName));
    }
    
    /**
     * Removes a file from the index, cleaning up any unused identifiers.
     * @param uri The URI of the file to remove.
     */
    public clearFile(uri: string) {
        const identifiers = this.uriToIdentifiers.get(uri);
        if (identifiers) {
            for (const id of identifiers) {
                const uris = this.identifierToUris.get(id);
                if (uris) {
                    uris.delete(uri);
                    if (uris.size === 0) {
                        this.identifierToUris.delete(id);
                    }
                }
            }
            this.uriToIdentifiers.delete(uri);
        }
    }
}
