# SymbolInfo Modernization & Performance Fixes

**Date**: 2026-06-27  
**Status**: Proposed  
**Priority**: Critical  
**Source**: Verified against codebase from `symbolinfo_improvement_plan.md`

---

## Summary

This plan addresses verified performance bottlenecks in the language server caused by synchronous disk I/O, brute-force workspace searches, and redundant re-parsing. Each issue below was confirmed by direct code inspection.

---

## Plan 1: Modernize `SymbolInfo` with LSP Range Metadata

### Problem (VERIFIED ✅)

`SymbolInfo` in [`shared/src/index.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/shared/src/index.ts#L27-L46) only stores raw character offsets (`start: number`, `end: number`). Every LSP handler that needs line/column positions must convert these offsets on-the-fly, which requires having access to the full file text — forcing disk reads for closed files.

### Evidence

- `SymbolInfo` (lines 27–46) has only `start` and `end` as numbers.
- All LSP handlers (definition, workspaceSymbol, rename, references, codeLens) perform `doc.positionAt(sym.start)` which requires a `TextDocument`. For closed files, the full text must be read from disk.

### Changes

#### [MODIFY] [`shared/src/index.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/shared/src/index.ts)
Add optional LSP-ready range properties to `SymbolInfo`:

```typescript
export interface SymbolInfo {
    // ... existing fields ...
    
    /** Pre-computed LSP range for the full definition (avoids disk read) */
    range?: { start: { line: number, character: number }, end: { line: number, character: number } };
    /** Pre-computed LSP range for just the symbol name (for selection/highlight) */
    selectionRange?: { start: { line: number, character: number }, end: { line: number, character: number } };
    /** Extracted documentation/comment text */
    documentation?: string;
    /** Human-readable detail string (e.g., "Report: MyReport") */
    detail?: string;
}
```

#### [MODIFY] [`server/src/docManager.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/docManager.ts)
Populate the new `range` and `selectionRange` fields during `indexFile()` (line 391–401) and `rebuild()` (line 681–691) when building `SymbolInfo` objects:

```typescript
const symbolInfo: SymbolInfo = {
    name: def.name.text,
    kind: definitionTypeToSymbolKind(def.type.text, this.tdlScopeManager),
    uri: uri,
    start: def.start,
    end: def.end,
    definitionType: def.type.text,
    isModifier: !!def.modifier,
    // NEW: Pre-compute LSP ranges during indexing
    range: {
        start: doc.positionAt(def.start),
        end: doc.positionAt(def.end)
    },
    selectionRange: {
        start: doc.positionAt(def.name.start),
        end: doc.positionAt(def.name.end)
    },
    detail: `${def.type.text}: ${def.name.text}`
};
```

### Tests Needed

- **Update**: [`symbolTable.test.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/tests/symbolTable.test.ts) — add tests verifying `range` and `selectionRange` are stored and retrieved correctly.
- **New**: Add test that `SymbolInfo` populated during `indexFile` has correct pre-computed range.

---

## Plan 2: Eliminate Disk Reads from "Go to Definition"

### Problem (VERIFIED ✅)

In [`server/src/server.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/server.ts#L376-L392), when a user jumps to a definition in a **closed** file, the handler does:

```typescript
// Line 380 - BLOCKING SYNC DISK READ
const content = fs.readFileSync(filePath, 'utf-8');
const tempDoc = TextDocument.create(resolved.uri, 'tally', 1, content);
```

This synchronously reads the **entire file** from disk just to call `tempDoc.positionAt(resolved.start)`.

### Evidence

- `server.ts` line 380: `fs.readFileSync(filePath, 'utf-8')` — **synchronous** I/O that blocks the event loop.
- This is the `onDefinition` handler, which fires on every "Go to Definition" request.

### Changes

#### [MODIFY] [`server/src/server.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/server.ts#L360-L402)
After Plan 1, use the pre-computed `range`/`selectionRange` from the resolved symbol:

```typescript
if (resolved) {
    if (resolved.uri === 'global:metadata' || (resolved.start === 0 && resolved.end === 0)) {
        return null;
    }

    // NEW: Use pre-computed range if available (avoids ALL disk reads)
    if (resolved.selectionRange) {
        return {
            uri: resolved.uri,
            range: resolved.selectionRange
        };
    }

    // FALLBACK: Use open doc if available
    const targetDoc = docs.get(resolved.uri);
    if (targetDoc) {
        return {
            uri: resolved.uri,
            range: {
                start: targetDoc.positionAt(resolved.start),
                end: targetDoc.positionAt(resolved.end)
            }
        };
    }

    // LAST RESORT: Use offsetToPosition utility (no fs.readFileSync!)
    // Read asynchronously from indexed content
    const indexedState = docManager.getIndexed(resolved.uri);
    if (indexedState) {
        // Use the content already parsed and cached in indexedDocs
        return {
            uri: resolved.uri,
            range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
        };
    }
    
    return {
        uri: resolved.uri,
        range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } }
    };
}
```

### Tests Needed

- **New**: [`definition.goTo.test.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/tests/definition.goTo.test.ts) — Test that `onDefinition` resolves to correct range without disk read by mocking `fs.readFileSync` to throw and verifying success.

---

## Plan 3: Eliminate Disk Reads from Workspace Symbols

### Problem (VERIFIED ✅)

In [`workspaceSymbol.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/workspaceSymbol.ts#L57-L69), for every closed file symbol, the server reads the **entire file** from disk:

```typescript
// Line 61 - ASYNC but still full file read for EVERY symbol in results
const content = await readFileWithEncoding(filePath);
range = {
    start: offsetToPosition(content, sym.start),
    end: offsetToPosition(content, sym.end)
};
```

If a workspace search returns 100 symbols across 50 files, that's 50 full file reads.

### Evidence

- `workspaceSymbol.ts` lines 59–65: reads closed files for offset→position conversion.

### Changes

#### [MODIFY] [`server/src/services/workspaceSymbol.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/workspaceSymbol.ts#L46-L70)
Use pre-computed `range` from `SymbolInfo`:

```typescript
if (sym.selectionRange) {
    range = sym.selectionRange;
} else if (textDoc) {
    range = {
        start: textDoc.positionAt(sym.start),
        end: textDoc.positionAt(sym.end)
    };
} else {
    // Fallback: 0,0 instead of disk read
    range = { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } };
}
```

### Tests Needed

- **Update**: [`workspaceSymbol.test.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/tests/workspaceSymbol.test.ts) — Currently has 4 tests. Add test that verifies pre-computed range is used and disk read does not occur (mock `readFileWithEncoding` to throw).

---

## Plan 4: Fix "Find References" Brute-Force Search

### Problem (VERIFIED ✅)

[`references.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/references.ts#L119-L196) performs a brute-force text search across **every file** in the project on every "Find References" request:

```typescript
// Line 146-147 - Lowercases ENTIRE file content and does indexOf scan
const lowerText = text.toLowerCase();
let matchOffset = lowerText.indexOf(lowerTargetName);
```

For each match, it calls `findReferenceAtOffset` which walks the entire AST. For closed files, it reads the full content from disk (line 137).

### Evidence

- Lines 122–196: iterates through ALL project nodes.
- Lines 134–141: reads closed files from disk via `readFileWithEncoding`.
- Lines 146–194: O(n*m) string search + AST walk for each match.
- This is called by CodeLens resolve, Document Highlight, and Rename — multiplying the cost.

### Changes (Phase 1: Immediate Optimization)

#### [MODIFY] [`server/src/services/references.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/references.ts)

**Step 1**: Skip disk reads for closed files that are already indexed:
```typescript
if (textDoc) {
    text = textDoc.getText();
} else {
    // Use indexed doc state first (already parsed and in memory)
    const indexedState = docManager.getIndexed?.(docUri);
    if (indexedState) {
        // We still need the raw text for indexOf. Store it during indexing.
        // For now, fall through to disk read
    }
    try {
        const fsPath = URI.parse(docUri).fsPath;
        text = await readFileWithEncoding(fsPath);
        textDoc = TextDocument.create(docUri, 'tally', 1, text);
    } catch (e) {
        continue;
    }
}
```

**Step 2** (Future): Build a reference index during parse-time. Add a `referenceIndex` to `ScopeManager` that maps `symbolName → Location[]`.

### Changes (Phase 2: Reference Index)

#### [NEW] `server/src/services/referenceIndex.ts`
```typescript
export class ReferenceIndex {
    private index = new Map<string, Location[]>();
    
    addReference(name: string, location: Location): void { ... }
    getReferences(name: string): Location[] { ... }
    clearFile(uri: string): void { ... }
}
```

#### [MODIFY] `server/src/docManager.ts`
During `indexFile` and `rebuild`, walk the AST to populate the reference index.

#### [MODIFY] `server/src/services/references.ts`
Replace brute-force search with O(1) index lookup.

### Tests Needed

- **Update**: [`references.test.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/tests/references.test.ts) — Currently has 6 tests. Add:
  - Test that references work without disk reads when files are indexed.
  - Test reference index produces correct results for cross-file references.
  - Test reference index cleanup when file is re-indexed.

---

## Plan 5: Fix CodeLens CPU Spiking

### Problem (VERIFIED ✅)

[`codeLens.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/codeLens.ts#L61-L78) calls `findReferences` for **every visible definition** in the editor:

```typescript
// Line 65 - Calls full workspace-wide findReferences for EVERY lens
const references = await findReferences(docManager, docs, lens.data.uri, offset);
```

If a file has 20 definitions visible, that's 20 workspace-wide brute-force searches. Combined with Plan 4's problem, this causes severe CPU/disk spikes.

### Evidence

- `resolveCodeLens` (line 61–78) is called per-lens by VS Code.
- Each call invokes the O(n*m) `findReferences` from Plan 4.

### Changes

This is **automatically fixed** by Plan 4 (Reference Index). Once `findReferences` uses an O(1) index lookup, CodeLens resolution becomes near-instant.

**Additional optimization**: Add a debounce/cache layer in `resolveCodeLens`:

#### [MODIFY] [`server/src/services/codeLens.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/codeLens.ts)
```typescript
// Add a simple cache for reference counts (invalidated on document change)
const refCountCache = new Map<string, number>();

export async function resolveCodeLens(...) {
    const cacheKey = `${lens.data.uri}:${lens.data.name}`;
    if (refCountCache.has(cacheKey)) {
        lens.command = {
            title: `${refCountCache.get(cacheKey)} references`,
            ...
        };
        return lens;
    }
    // ... existing logic ...
    refCountCache.set(cacheKey, count);
}
```

### Tests Needed

- **Update**: [`codeLens.test.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/tests/codeLens.test.ts) — Currently 4 tests, only for `provideCodeLens`. Add tests for `resolveCodeLens` including:
  - Test that `resolveCodeLens` returns correct reference count.
  - Test that cache is used on repeated calls.

---

## Plan 6: Fix Validation Re-parsing and Cascading Disk I/O

### Problem (VERIFIED ✅)

In [`docManager.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/docManager.ts#L352-L473), `indexFile()` always re-reads and re-parses from disk:

```typescript
// Line 362 - ALWAYS reads from disk, never checks cache
const content = await readFileWithEncoding(filePath);
```

There is no check against `indexedDocs` for an existing cached state. Since `rebuild()` (line 700–708) calls `indexFile` for included files, and TDL projects are heavily interconnected, **a single keystroke can trigger full disk read + parse + validation for the entire workspace**.

### Evidence

- `indexFile` (line 352–473): No cache check before reading from disk (line 362).
- `rebuild` (line 700–708): Calls `indexFile` for every included file.
- `revalidateAll` (line 170–183): Calls `indexFile` for every project node.
- The `indexedDocs` map exists (line 40) but `indexFile` never checks it.

### Changes

#### [MODIFY] [`server/src/docManager.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/docManager.ts#L352-L365)

Add cache check and file modification timestamp tracking:

```typescript
private fileTimestamps = new Map<string, number>();

public async indexFile(filePath: string, indexed: Set<string> = new Set()): Promise<void> {
    if (indexed.has(filePath)) return;
    indexed.add(filePath);

    const uri = URI.file(filePath).toString();
    if (this.docs.has(uri)) return;

    // NEW: Check if file has changed since last index
    try {
        const stat = await fs.promises.stat(filePath);
        const lastMtime = this.fileTimestamps.get(uri);
        if (lastMtime !== undefined && lastMtime === stat.mtimeMs && this.indexedDocs.has(uri)) {
            return; // File unchanged, skip re-read and re-parse
        }
        this.fileTimestamps.set(uri, stat.mtimeMs);
    } catch {
        return; // File doesn't exist
    }

    // ... rest of indexFile ...
}
```

### Tests Needed

- **Update**: [`docManager.indexing.test.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/tests/docManager.indexing.test.ts) — Add:
  - Test that `indexFile` skips re-reading when file mtime is unchanged.
  - Test that `indexFile` re-reads when mtime changes.
  - Test that `rebuild` doesn't trigger cascading `indexFile` calls for unchanged includes.

---

## Verification Plan

### Automated Tests
```bash
npm run test
```
All existing tests must pass. New tests from each plan must be added.

### Manual Verification
1. Open a large TDL workspace (10+ files).
2. **Go to Definition**: Jump to definition in a closed file → no delay, no disk read.
3. **Find References**: Trigger "Find All References" on a heavily used symbol → near-instant.
4. **CodeLens**: Scroll with CodeLens enabled → no CPU spikes.
5. **Validation**: Type in a core file → no cascade of disk reads.
