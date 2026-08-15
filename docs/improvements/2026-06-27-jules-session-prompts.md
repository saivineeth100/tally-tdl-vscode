# Google Jules Session Prompts

These are self-contained prompts designed for Google Jules. Each session is a focused, independent task with clear scope and acceptance criteria.

**Assignment order**: Sessions are ordered by dependency — later sessions may depend on earlier ones. Assign in order, or assign independent sessions in parallel where noted.

---

## Session 1: Fix Critical Bugs (Quick Wins)
**Priority**: 🔴 Critical  
**Estimated scope**: Small  
**Dependencies**: None  
**Can run in parallel with**: Session 2, Session 5, Session 6

```
Fix the following 3 bugs in the TDL Language Server. These are independent, isolated fixes.

**Bug 1: Synchronous disk read blocks event loop**
File: `server/src/server.ts` around line 380
In the `onDefinition` handler, `fs.readFileSync(filePath, 'utf-8')` is used to read closed files. This is synchronous and blocks the entire Node.js event loop, freezing all other LSP requests. Additionally, it hardcodes 'utf-8' but TDL files can be UTF-16LE.

Fix: Replace with the project's existing async `readFileWithEncoding()` utility from `docManager.ts`. The handler already supports async (it returns a Promise). Import and use `readFileWithEncoding` instead of `fs.readFileSync`. Handle the case where the file read fails by returning null.

**Bug 2: resolveCodeLens fails for definitions at offset 0**
File: `server/src/services/codeLens.ts` around line 62-63
The code does:
```typescript
const offset = docManager.get(lens.data.uri)?.sourceFile ? docs.get(lens.data.uri)?.offsetAt(lens.data.position) : 0;
if (!offset) return lens;
```
`0` is falsy in JavaScript, so definitions at the beginning of a file (offset 0) silently skip resolution and never show reference counts.

Fix: Change `if (!offset)` to `if (offset === undefined || offset === null)`.

**Bug 3: positionUtils doesn't handle \r\n line endings**
File: `server/src/utils/positionUtils.ts`
The `offsetToPosition` function only checks for `\n` when counting lines. On Windows, TDL files often use `\r\n`. The `\r` is counted as a regular character, making the `character` position off by 1 on every line.

Fix: Add a check for `\r` — if `doc[i] === '\r'`, skip it (continue) since it will be followed by `\n`. Apply the same fix in `positionToOffset` if it has the same issue.

**Acceptance criteria:**
- All 3 bugs are fixed
- Run `npm test` from the project root — all 894 previously passing tests must still pass
- The 1 pre-existing failure in `src/features/tests/xml/suggestion.test.ts` is expected and should NOT be fixed in this session
```

---

## Session 2: Add Missing Test Files (Zero-Coverage Services)
**Priority**: 🟡 High  
**Estimated scope**: Medium  
**Dependencies**: None  
**Can run in parallel with**: Session 1, Session 5, Session 6

```
The TDL Language Server has 4 services with ZERO test coverage. Create test files for each.

The project uses Vitest (v4) for testing. Test setup is in `server/src/test-setup.ts` which provides `testScopeManager` (pre-loaded with metadata) and `createTestScopeManager()` for isolated tests.

Existing test patterns to follow: see `server/src/services/tests/definition.test.ts` and `server/src/services/tests/rename.test.ts` for how to set up mocks.

**Test File 1: `server/src/services/tests/signatureHelp.test.ts`**
Test `provideSignatureHelp()` from `server/src/services/signatureHelp.ts`.
- Test: provides signature for `$$FunctionName:param1` syntax (TDL function calls use $$ prefix and : separator)
- Test: tracks active parameter based on colon count
- Test: returns null when cursor is not inside a function call
- Test: provides signature for Action statements (e.g., `Set:MyVar:value`)
Setup: Create a ScopeManager, add mock functions to `globalScope.functions` and actions to `globalScope.actions` with parameter metadata.

**Test File 2: `server/src/services/tests/documentLinks.test.ts`**
Test `provideDocumentLinks()` from `server/src/services/documentLinks.ts`.
- Test: creates a link for `[Include: "common.tdl"]` definitions
- Test: returns empty array for files with no Include/Import definitions  
- Test: handles unresolvable include paths gracefully (returns no link or link without target)
Setup: Parse TDL text with `new Parser(text).parse()`, create a `TextDocument`, provide a mock `resolveIncludePath` function.

**Test File 3: `server/src/utils/positionUtils.test.ts`**
Test `offsetToPosition()` and `positionToOffset()` from `server/src/utils/positionUtils.ts`.
- Test: offsetToPosition with LF (`\n`) line endings
- Test: offsetToPosition with CRLF (`\r\n`) line endings
- Test: positionToOffset with LF line endings
- Test: empty string edge case
- Test: offset at exact end of string
- Test: round-trip consistency (offset → position → offset)
Note: CRLF tests may fail if Bug 3 from Session 1 isn't fixed yet — that's OK, the test documents the bug.

**Test File 4: `server/src/services/tests/documentHighlight.test.ts`**
Test `getDocumentHighlights()` from `server/src/services/documentHighlight.ts`.
- Test: returns highlights for a definition name and its references within the same file
- Test: does NOT return highlights from other files (mock a multi-file setup where only the current file should have highlights)
- Test: returns empty array when cursor is on whitespace/non-symbol position
Setup: Similar to rename.test.ts — create mock DocManager with `get()`, `getAllDocs()`, `getProjectNodes()`, `getScopeManager()`. Build scopes with `buildFileScope()`.

**Acceptance criteria:**
- All 4 test files are created in the correct directories
- Run `npm test` — new tests should pass (except possibly CRLF test if Bug 3 isn't fixed)
- Minimum 12 new test cases across all files
```

---

## Session 3: Add SymbolInfo LSP Range Metadata
**Priority**: 🔴 Critical  
**Estimated scope**: Medium  
**Dependencies**: None (but Sessions 4 benefits from this)  
**Can run in parallel with**: Session 1, Session 2

```
The `SymbolInfo` interface in `shared/src/index.ts` only stores raw character offsets (`start: number`, `end: number`). Every LSP handler that needs line/column positions must convert offsets using the full file text — forcing disk reads for closed files.

**Task: Add pre-computed LSP range properties to SymbolInfo and populate them during indexing.**

**Step 1: Update the SymbolInfo interface**
File: `shared/src/index.ts` (around line 27-46)
Add these optional properties to the `SymbolInfo` interface:
```typescript
/** Pre-computed LSP range for the full definition */
range?: { start: { line: number; character: number }; end: { line: number; character: number } };
/** Pre-computed LSP range for just the symbol name (for selection/highlight) */
selectionRange?: { start: { line: number; character: number }; end: { line: number; character: number } };
/** Human-readable detail string */
detail?: string;
```

**Step 2: Populate ranges during indexing**
File: `server/src/docManager.ts`
In the `indexFile()` method (around line 391-401) and `rebuild()` method (around line 681-691), when SymbolInfo objects are created for definitions, add the pre-computed ranges. The `TextDocument` (`doc`) is available at these points, so use `doc.positionAt()`:
```typescript
range: {
    start: doc.positionAt(def.start),
    end: doc.positionAt(def.end)
},
selectionRange: {
    start: doc.positionAt(def.name.start),
    end: doc.positionAt(def.name.end)
},
detail: `${def.type.text}: ${def.name.text}`
```

Also populate ranges in the `scopeBuilder.ts` where SymbolInfo is created (search for `definitionType:` assignments that create symbol-like objects and add range data where a TextDocument is available). If no TextDocument is available at a creation site, leave the fields undefined — consumers will fall back to offset-based conversion.

**Step 3: Add tests**
File: `server/src/services/tests/symbolTable.test.ts`
Add tests verifying that SymbolInfo objects created during indexing have correct `range` and `selectionRange` properties. Parse a simple TDL file, run indexFile logic, and verify the stored ranges match expected line/column values.

**Acceptance criteria:**
- `SymbolInfo` interface has the new optional fields
- During `indexFile()` and `rebuild()`, the fields are populated
- All existing tests pass (894 passing)
- New tests verify the range population
```

---

## Session 4: Eliminate Disk Reads Using Pre-computed Ranges
**Priority**: 🔴 Critical  
**Estimated scope**: Medium  
**Dependencies**: Session 3 (SymbolInfo must have range fields)

```
After Session 3 added pre-computed `range` and `selectionRange` to SymbolInfo, update the LSP handlers to USE these ranges instead of reading files from disk.

**Change 1: Go-to-Definition handler**
File: `server/src/server.ts` (around line 360-402, the `onDefinition` handler)
Currently reads the entire file from disk with `fs.readFileSync` to call `positionAt()`. Change to:
1. First check if `resolved.selectionRange` exists — if so, return it directly (zero I/O)
2. If not, try `docs.get(resolved.uri)` for open files
3. As last resort, use the existing disk read (now async via `readFileWithEncoding` if Session 1 was applied, otherwise make it async)

**Change 2: Workspace Symbols**
File: `server/src/services/workspaceSymbol.ts` (around line 46-70)
Currently reads closed files from disk via `readFileWithEncoding` to convert offsets. Change to:
1. First check if `sym.selectionRange` exists — if so, use it directly
2. If not, try open document via `docs.get()`
3. As last resort, fall back to `{ line: 0, character: 0 }` instead of reading from disk

**Change 3: Rename service**
File: `server/src/services/rename.ts` (around line 65-89)
Similar pattern — reads closed files for text operations. Use pre-computed ranges where available.

**Acceptance criteria:**
- No `fs.readFileSync` calls remain in LSP request handlers
- `workspaceSymbol.ts` no longer calls `readFileWithEncoding` for offset conversion when ranges are available
- All existing tests pass
- Manually verify: searching for a workspace symbol that exists in a closed file returns correct location data
```

---

## Session 5: Fix Document Highlight Performance
**Priority**: 🔴 High  
**Estimated scope**: Small  
**Dependencies**: None  
**Can run in parallel with**: Session 1, Session 2, Session 3

```
The `documentHighlight` service in `server/src/services/documentHighlight.ts` has a performance bug: it calls `findReferences(docManager, docs, uri, offset, true)` which performs a WORKSPACE-WIDE brute-force search across ALL project files. Document Highlight should only highlight occurrences within the CURRENT file.

The current code searches all files and then filters to only the current URI:
```typescript
const locations = await findReferences(docManager, docs, uri, offset, true);
for (const loc of locations) {
    if (loc.uri === uri) {  // Filters AFTER searching everywhere
        highlights.push({ range: loc.range, kind: DocumentHighlightKind.Read });
    }
}
```

**Fix: Create a single-file reference finder.**

Option A (preferred): Add an optional `scopeUri` parameter to `findReferences()` in `server/src/services/references.ts`. When provided, only search within that single file instead of iterating all project nodes. Then call it from `documentHighlight.ts` with the current URI.

Option B: In `documentHighlight.ts`, instead of calling `findReferences`, directly:
1. Get the document text and sourceFile from docManager
2. Find the symbol at the offset (use `findReferenceAtOffset` or the definition service)  
3. Do a text search ONLY within that single file's text
4. Validate each match with `findReferenceAtOffset`

**Acceptance criteria:**
- `getDocumentHighlights` no longer triggers workspace-wide search
- Highlighting still works correctly for definitions and references within the same file
- All existing tests pass
- If you added tests for documentHighlight in Session 2, those should still pass
```

---

## Session 6: Build Script and Repo Cleanup
**Priority**: 🟢 Medium  
**Estimated scope**: Small  
**Dependencies**: None  
**Can run in parallel with**: Any session

```
Fix issues in the build cache script and clean up repo artifacts.

**Fix 1: Remove Vite timestamp file from repo**
Delete `webview-ui/vite.config.ts.timestamp-1782455151801-f35e2654080cc8.mjs` — this is a Vite build artifact that should not be committed.
Add this pattern to `.gitignore`:
```
webview-ui/vite.config.ts.timestamp-*
```

**Fix 2: UTF-8 hardcoding in buildVersionCache.ts**
File: `server/src/scripts/buildVersionCache.ts` line 25
Currently: `const content = await fs.promises.readFile(fullPath, 'utf-8');`
TDL files can be UTF-16LE encoded. The rest of the codebase uses `readFileWithEncoding()` from `docManager.ts` which detects UTF-16LE BOM.

However, `readFileWithEncoding` is a method on DocManager and may not be easily importable in the standalone script. Instead, extract the encoding detection logic into a standalone utility or inline it:
```typescript
async function readFileWithEncoding(filePath: string): Promise<string> {
    const buffer = await fs.promises.readFile(filePath);
    // Check for UTF-16LE BOM (0xFF, 0xFE)
    if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
        return buffer.toString('utf16le');
    }
    return buffer.toString('utf-8');
}
```

**Fix 3: Replace process.argv[2] non-null assertion**
File: `server/src/scripts/buildVersionCache.ts` line 42
Pass `baseTdlDir` as a parameter to `scanAndParse()` instead of reading from `process.argv[2]!` inside the function. The value is already available as a local variable in `buildCacheForVersion()`.

**Fix 4: Use async readdir in main()**
File: `server/src/scripts/buildVersionCache.ts` line 158
Replace `fs.readdirSync` with `await fs.promises.readdir` for consistency.

**Fix 5: Remove inlayHintProvider from server capabilities**
File: `server/src/server.ts` — find where server capabilities are registered (around line 114).
`inlayHints.ts` returns an empty array and has a comment explaining the feature is disabled. Remove `inlayHintProvider` from the server capabilities to avoid unnecessary LSP traffic. Keep the `inlayHints.ts` file for future use.

**Acceptance criteria:**
- Vite timestamp file is deleted and gitignored
- buildVersionCache.ts handles UTF-16LE files
- No non-null assertions on process.argv in buildVersionCache.ts
- All existing tests pass
```

---

## Session 7: Webview UI Type Safety and Error Handling
**Priority**: 🟡 Medium  
**Estimated scope**: Medium  
**Dependencies**: None

```
The webview-ui (Scope Tree Viewer) has pervasive TypeScript `any` types and no error handling. Improve type safety and resilience.

**Task 1: Create shared types file**
Create `webview-ui/src/types.ts` with interfaces for all data structures:

```typescript
export interface ScopeNode {
    id: string;
    name?: string;
    kind: string;
    children?: ScopeNode[];
    hasChildren?: boolean;
    _childrenLoaded?: boolean;
    symbolGroups?: SymbolGroup[];
    structuralChildren?: string[];
    structuralParents?: string[];
    usedDefinitions?: string[];
    objectScope?: string;
    collectionScope?: string;
    definitionType?: string;
    uri?: string;
    start?: number;
    end?: number;
}

export interface SymbolGroup {
    kind: string;
    count: number;
}

export interface SymbolsResult {
    symbols: SymbolEntry[];
    totalCount: number;
    page: number;
    limit: number;
}

export interface SymbolEntry {
    name: string;
    kind?: string;
    definitionType?: string;
    description?: string;
    parameters?: any[];
    returnType?: string;
    structuralChildren?: string[];
    structuralParents?: string[];
    usedDefinitions?: string[];
    modifiersCount?: number;
    serializedProperties?: any[];
    serializedComplexProperties?: any[];
    uri?: string;
    start?: number;
    end?: number;
}

export interface WebviewMessage {
    command: string;
    data?: any;
    scopeId?: string;
    children?: ScopeNode[];
    reqId?: string;
}
```

**Task 2: Apply types to components**
Update `App.tsx`, `ScopeTree.tsx`, `DetailsPanel.tsx`, and `SchemaTreeNode.tsx` to use these types instead of `any`. Replace `useState<any>` with proper typed state.

**Task 3: Add React Error Boundary**
Create `webview-ui/src/components/ErrorBoundary.tsx` — a class component that catches render errors and shows a recovery message instead of crashing the webview. Wrap the main App content with it.

**Task 4: Replace JSON deep clone**
In `App.tsx` line 94, replace `JSON.parse(JSON.stringify(prev))` with `structuredClone(prev)`.

**Task 5: Cap pagination limits**
In `DetailsPanel.tsx` line 22, replace `Number.MAX_SAFE_INTEGER` with `5000`. Same in `SchemaTreeNode.tsx` line 31 and `App.tsx` line 157.

**Acceptance criteria:**
- New `types.ts` file exists with all interfaces
- Components use proper types instead of `any` (some `any` for complex nested metadata objects is acceptable)
- ErrorBoundary wraps the main content
- `JSON.parse(JSON.stringify())` is replaced with `structuredClone()`
- No `Number.MAX_SAFE_INTEGER` as pagination limit
- Run `cd webview-ui && npm run build` — build succeeds with no type errors
```

---

## Session 8: Extract Duplicate Diagnostic Filtering Logic
**Priority**: 🟢 Low  
**Estimated scope**: Small  
**Dependencies**: None

```
In `server/src/docManager.ts`, the diagnostic severity filtering logic is copy-pasted in two places:
1. `indexFile()` method around lines 437-460
2. `rebuild()` method around lines 718-742

Both blocks do the same thing: check individual diagnostic overrides, treat warnings as errors, and hide warnings based on settings.

**Task: Extract into a shared utility function.**

1. Create a private method on DocManager (or a standalone function):
```typescript
private applyDiagnosticFilters(diagnostics: Diagnostic[], uri: string): Diagnostic[] {
    // Move the shared filtering logic here
}
```

2. Replace both copies with a call to this method.

3. Ensure the function has access to whatever settings/state it needs (check what variables the filtering blocks reference — likely `this.diagnosticOverrides`, warning-as-error settings, etc.)

**Acceptance criteria:**
- The filtering logic exists in exactly ONE place
- Both `indexFile()` and `rebuild()` call the shared function
- All 894 existing tests pass
- No behavioral change (same diagnostics produced before and after)
```

---

## Session 9: Add CodeLens Resolve Tests and Reference Cache
**Priority**: 🟡 Medium  
**Estimated scope**: Medium  
**Dependencies**: Session 1 (Bug 2 fix for offset 0)

```
The `resolveCodeLens` function in `server/src/services/codeLens.ts` has ZERO test coverage. The existing `codeLens.test.ts` only tests `provideCodeLens` (4 tests).

**Task 1: Add resolveCodeLens tests**
File: `server/src/services/tests/codeLens.test.ts`

Add a new `describe('resolveCodeLens', ...)` block with tests:
- Test: resolves with correct reference count for a definition that is referenced
- Test: handles definition at offset 0 (regression test for the falsy check bug)
- Test: returns lens unchanged when document is not found
- Test: returns "0 references" when definition has no references

Setup: Create a mock with at least 2 files — one with a definition, another with a reference to it. Use the same mock pattern as `rename.test.ts`: create TextDocuments, parse them, build scopes, mock DocManager.

**Task 2: Add a simple reference count cache to resolveCodeLens**
CodeLens resolve is called for EVERY visible definition. Each call currently triggers a full workspace-wide `findReferences` search.

Add a simple in-memory cache:
```typescript
const refCountCache = new Map<string, { count: number; timestamp: number }>();
const CACHE_TTL_MS = 5000; // 5 seconds

export async function resolveCodeLens(...) {
    const cacheKey = `${lens.data.uri}:${lens.data.name}`;
    const cached = refCountCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        lens.command = { title: `${cached.count} references`, command: '', arguments: [] };
        return lens;
    }
    // ... existing logic ...
    refCountCache.set(cacheKey, { count, timestamp: Date.now() });
}
```

Add a function to invalidate the cache (to be called on document change):
```typescript
export function invalidateRefCountCache(uri?: string) {
    if (uri) {
        for (const key of refCountCache.keys()) {
            if (key.startsWith(uri)) refCountCache.delete(key);
        }
    } else {
        refCountCache.clear();
    }
}
```

**Acceptance criteria:**
- At least 4 new tests for `resolveCodeLens`
- Reference count cache is implemented with TTL
- Cache invalidation function exists
- All tests pass
```

---

## Quick Reference: Parallel Assignment

Sessions that can be assigned **simultaneously** (no dependencies between them):

**Batch 1** (assign all at once):
- Session 1 (Critical bugs)
- Session 2 (Missing tests)
- Session 5 (Document highlight perf)
- Session 6 (Build script cleanup)

**Batch 2** (after Batch 1):
- Session 3 (SymbolInfo ranges)
- Session 7 (Webview types)
- Session 8 (Diagnostic dedup)

**Batch 3** (after Session 3):
- Session 4 (Eliminate disk reads)
- Session 9 (CodeLens tests + cache)
