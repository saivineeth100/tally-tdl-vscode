# Fix Performance Bottlenecks in Language Server

The TDL language server currently suffers from massive performance issues when resolving references, jumping to definitions in unopened files, and running file validation. This plan outlines the technical changes needed to eliminate blocking disk I/O, redundant parsing, and expensive workspace-wide text searches.

## User Review Required
> [!IMPORTANT]
> The changes proposed here will fundamentally alter how the Language Server indexes, validates, and queries symbols and references. Please review the proposed approaches to ensure they align with the project's memory usage and architectural goals.

## Proposed Changes

### 1. Modernize `SymbolInfo` for Language Server Features

**Problem:**
The `SymbolInfo` interface lacks the properties required for modern LSP features, relying on raw character offsets (`start` and `end`). This forces the server to do expensive recalculations (and disk reads) on-the-fly.

**Solution:**
Update `SymbolInfo` in `shared/src/index.ts` to include standard LSP metadata:
- `range?: { start: { line, character }, end: { line, character } }` for full definition bounds.
- `selectionRange?: { start: { line, character }, end: { line, character } }` for the bounds of the symbol's name.
- `documentation?: string` to store associated docstrings/comments.
- `detail?: string` for human-readable signatures.
- `deprecated?: boolean` for deprecation flags.
During indexing (`docManager.ts` -> `rebuild`), populate these properties so they are immediately available in memory.

### 2. Fix "Go to Definition" (and Workspace Symbols) Disk Reads

**Problem:** 
When a user jumps to a definition in a closed file, the server synchronously reads the entire target file from disk (`fs.readFileSync`) simply to convert the character offset into a line and column `Position`.

**Solution:**
- **Update Handlers:** Update `onDefinition` (`server.ts`), `getWorkspaceSymbols` (`workspaceSymbol.ts`), and `renameSymbol` (`rename.ts`) to immediately return the precomputed `range` and `selectionRange` properties from the new `SymbolInfo`, entirely eliminating the fallback disk read.

### 3. Fix "Find References" Workspace-Wide Search

**Problem:** 
`findReferences` in `references.ts` performs a brute-force search across the entire project for every request. For files not actively open, it asynchronously reads their entire contents from the disk, runs a string `indexOf`, and for every match, queries the AST. 

**Solution:**
- **Extract References During Indexing:** Introduce a new pass during the parsing/indexing phase. As each file is parsed, walk its AST to extract all identifiable symbol references (e.g., variables, formulas, definitions).
- **Global Reference Index:** Introduce a `ReferenceIndex` (or add to `SymbolTable`) that maps a symbol name (or symbol ID) to an array of `Location`s where it is referenced.
- **Update `findReferences`:** Change `findReferences` to simply perform an O(1) lookup in the global reference index. This will reduce execution time from seconds (or minutes in massive projects) to milliseconds.

### 4. Fix "CodeLens" CPU Spiking

**Problem:** 
In `server/src/services/codeLens.ts`, the `resolveCodeLens` function invokes `findReferences` for every definition visible in the editor. Because `findReferences` is extremely slow, VS Code's CodeLens resolution brings the language server to a crawl, spiking CPU and Disk I/O.

**Solution:**
- **Inherit Reference Fixes:** By fixing the `findReferences` bottleneck (as outlined in #3), CodeLens resolution will automatically become instantaneous.

### 5. Fix Validation Re-parsing and Disk I/O

**Problem:**
When a user types in a file, `docManager.rebuild` recursively calls `indexFile` on all included files. For files not open in the editor, `indexFile` currently **re-reads the file from disk, re-parses it, and re-validates it**. Because TDL projects are heavily interconnected via includes, a single keystroke in one file triggers disk reads, AST parsing, and full validation for nearly the entire workspace!

**Solution:**
- **Cache Parsed ASTs:** In `docManager.ts`, `indexedDocs` should be used as a cache. If a file is already in `indexedDocs` and hasn't changed on disk, skip reading and parsing it.
- **Isolate Validation:** Instead of eagerly validating the entire project on every keystroke, only re-validate files whose dependencies have meaningfully changed, or simply debounce workspace-wide validation.
- **Reuse ASTs for Validation:** When re-validation of unopened files *is* necessary, reuse the already parsed `SourceFile` from `indexedDocs` instead of reading from disk and parsing it again.

## Verification Plan

### Automated Tests
- Run existing unit tests (`npm run test`) to ensure symbol indexing and resolution logic remains correct.
- Verify `workspaceSymbol.test.ts` and `symbolTable.test.ts` pass with the modified `SymbolInfo` interface.

### Manual Verification
- Open a large TDL workspace.
- **Validation**: Type continuously in a core file. Verify that CPU usage stays low and that the server responds immediately without reading the whole workspace from disk.
- **Go to Definition**: Trigger "Go to Definition" on a symbol located in an unopened file and observe immediate resolution (no delay).
- **References & CodeLens**: Trigger "Find All References" on a heavily used definition and observe near-instant results. Scroll rapidly with CodeLens enabled and verify no CPU spikes.
