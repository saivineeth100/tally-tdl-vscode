# Bugs & Code Quality Improvements Discovered During Review

**Date**: 2026-06-27  
**Status**: Proposed  
**Priority**: High  
**Source**: Independent codebase audit during `symbolinfo_improvement_plan.md` verification

---

## Summary

During the review of the codebase to verify the SymbolInfo improvement plan, I discovered additional bugs, code quality issues, and missing test coverage. This document catalogs each finding.

---

## Bug 1: `fs.readFileSync` Blocks the Event Loop in `onDefinition`

### Location
[`server/src/server.ts` line 380](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/server.ts#L380)

### Description
The `onDefinition` handler uses **synchronous** `fs.readFileSync()` instead of `fs.promises.readFile()` or the project's own `readFileWithEncoding()`. This blocks Node.js's single-threaded event loop, freezing ALL other LSP requests (hover, completion, diagnostics) while reading from disk.

### Evidence
```typescript
// server.ts line 380
const content = fs.readFileSync(filePath, 'utf-8');
```

Meanwhile, every other file reader in the codebase uses `readFileWithEncoding()` which is async and handles UTF-16LE encoding.

### Fix
Replace `fs.readFileSync` with `readFileWithEncoding` or eliminate the disk read entirely (covered in symbolinfo performance plan).

### Additional Issue
The handler also doesn't handle UTF-16LE encoded files (Tally TDL files can be UTF-16LE), since `readFileSync` hardcodes `'utf-8'`.

---

## Bug 2: `documentHighlight` Triggers Full Workspace Search

### Location
[`server/src/services/documentHighlight.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/documentHighlight.ts#L18)

### Description
`getDocumentHighlights` calls `findReferences(docManager, docs, uri, offset, true)` which performs a **workspace-wide** brute-force search. Document Highlight should only highlight occurrences within the **current file**, but the implementation searches all project files and then filters to the current URI.

### Evidence
```typescript
// documentHighlight.ts line 18
const locations = await findReferences(docManager, docs, uri, offset, true);

// Line 22-28: Filter for current file only AFTER searching everywhere
for (const loc of locations) {
    if (loc.uri === uri) {
        highlights.push({ ... });
    }
}
```

### Fix
Create a `findReferencesInFile()` function that only searches within the given URI, or add a `scope` parameter to `findReferences` that limits the search to a single file.

### Tests Needed
- **New**: `documentHighlight.test.ts` — Currently NO dedicated tests exist for document highlighting. Add:
  - Test that highlights are only returned for the current file.
  - Test that highlight doesn't trigger workspace-wide search (mock `getProjectNodes` to verify it's not called).

---

## Bug 3: Pre-existing Test Failure in XML Suggestion

### Location
[`server/src/features/tests/xml/suggestion.test.ts` line 45](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/features/tests/xml/suggestion.test.ts#L45)

### Description
The test `returns correct XML definition_type suggestion` is failing. Test results show:
```
Test Files  1 failed | 69 passed (70)
Tests       1 failed | 894 passed (895)
```

### Fix
Investigate and fix the XML suggestion test failure. This is a pre-existing issue.

---

## Bug 4: `positionUtils.offsetToPosition` Doesn't Handle `\r\n` Correctly

### Location
[`server/src/utils/positionUtils.ts` lines 4-18](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/utils/positionUtils.ts#L4-L18)

### Description
The `offsetToPosition` utility (used by workspaceSymbol for closed files) only checks for `\n` when counting lines, but TDL files often use `\r\n` line endings (especially on Windows). This causes the `character` count to be off by 1 for every line on Windows because `\r` is counted as a character.

### Evidence
```typescript
for (let i = 0; i < limit; i++) {
    if (doc[i] === '\n') {   // Only checks \n, not \r\n
        line++;
        character = 0;
    } else {
        character++;          // \r counted as a character!
    }
}
```

### Fix
Handle `\r\n` line endings:
```typescript
if (doc[i] === '\n') {
    line++;
    character = 0;
} else if (doc[i] === '\r') {
    // Skip \r (it will be followed by \n in \r\n)
    continue;
} else {
    character++;
}
```

### Tests Needed
- **New**: `positionUtils.test.ts` — Currently NO tests exist for `positionUtils`. Add:
  - Test `offsetToPosition` with `\n` line endings.
  - Test `offsetToPosition` with `\r\n` line endings.
  - Test `positionToOffset` round-trip consistency.

---

## Bug 5: `resolveCodeLens` Fails Silently When Offset is 0

### Location
[`server/src/services/codeLens.ts` line 62-63](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/codeLens.ts#L62-L63)

### Description
```typescript
const offset = docManager.get(lens.data.uri)?.sourceFile 
    ? docs.get(lens.data.uri)?.offsetAt(lens.data.position) 
    : 0;
if (!offset) return lens;  // BUG: 0 is falsy!
```

If a definition starts at offset 0 (e.g., the first definition in a file), `offset` is `0`, which is falsy, causing `resolveCodeLens` to return early without resolving. Definitions at the beginning of a file will never show reference counts.

### Fix
```typescript
if (offset === undefined || offset === null) return lens;
```

### Tests Needed
- **Update**: [`codeLens.test.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/tests/codeLens.test.ts) — Add test for definition at offset 0.

---

## Bug 6: Duplicate Diagnostic Filtering Logic

### Location
- [`server/src/docManager.ts` lines 437-460](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/docManager.ts#L437-L460) (in `indexFile`)
- [`server/src/docManager.ts` lines 718-742](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/docManager.ts#L718-L742) (in `rebuild`)

### Description
The diagnostic severity filtering logic (check individual overrides, treat warnings as errors, hide warnings) is **copy-pasted identically** in two places: `indexFile()` and `rebuild()`. This violates DRY and is a maintenance hazard — changes to filtering logic must be made in both places.

### Fix
Extract into a shared utility function:
```typescript
function applyDiagnosticFilters(diagnostics: Diagnostic[]): Diagnostic[] { ... }
```

---

## Improvement 1: Missing Test Coverage for Critical Services

### Current Test Coverage Gaps

| Service | Test File | Tests | Gap |
|---------|-----------|-------|-----|
| `documentHighlight.ts` | None | 0 | ❌ No tests at all |
| `signatureHelp.ts` | None | 0 | ❌ No tests at all |
| `documentLinks.ts` | None | 0 | ❌ No tests at all |
| `inlayHints.ts` | None | 0 | ❌ (currently returns empty, but should test that) |
| `positionUtils.ts` | None | 0 | ❌ No tests at all |
| `resolveCodeLens` | `codeLens.test.ts` | 4 | ⚠️ Only tests `provideCodeLens`, not `resolveCodeLens` |
| `workspaceSymbol.ts` | `workspaceSymbol.test.ts` | 4 | ⚠️ No test for closed-file disk read path |
| `references.ts` | `references.test.ts` | 6 | ⚠️ No test for performance/caching |

### New Test Files Needed

#### [NEW] `server/src/services/tests/documentHighlight.test.ts`
```typescript
describe('Document Highlight', () => {
    it('should highlight occurrences within same file');
    it('should not return highlights from other files');
    it('should highlight definition and references');
    it('should highlight variable references with # and ## prefixes');
});
```

#### [NEW] `server/src/services/tests/signatureHelp.test.ts`
```typescript
describe('Signature Help', () => {
    it('should provide signature for $$FunctionName:param1:param2');
    it('should track active parameter based on colon count');
    it('should provide signature for Action statements');
    it('should return null when not inside a function call');
    it('should handle nested parentheses correctly');
});
```

#### [NEW] `server/src/services/tests/documentLinks.test.ts`
```typescript
describe('Document Links', () => {
    it('should create links for Include definitions');
    it('should create links for Import definitions');
    it('should handle quoted and unquoted file paths');
    it('should return empty for files with no includes');
});
```

#### [NEW] `server/src/utils/positionUtils.test.ts`
```typescript
describe('Position Utils', () => {
    it('offsetToPosition with LF line endings');
    it('offsetToPosition with CRLF line endings');
    it('positionToOffset with LF line endings');
    it('positionToOffset with CRLF line endings');
    it('round-trip offset → position → offset');
});
```

---

## Improvement 2: `inlayHints.ts` Is a Dead Feature

### Location
[`server/src/services/inlayHints.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/inlayHints.ts)

### Description
The entire `provideInlayHints` function is a no-op that returns `[]` with a comment explaining why. However, the server still registers `inlayHintProvider: { resolveProvider: false }` in its capabilities (server.ts line 114), meaning VS Code will still send inlay hint requests that do nothing.

### Fix
Either:
1. Remove `inlayHintProvider` from server capabilities to avoid unnecessary LSP traffic.
2. Or implement basic inlay hints for useful cases (e.g., showing definition type labels).

---

## Improvement 3: Rename Service Has Redundant Disk Reads

### Location
[`server/src/services/rename.ts` lines 65-89](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/rename.ts#L65-L89)

### Description
The rename service reads closed files from disk (line 69) to reconstruct `TextDocument` objects for prefix detection (# and ##). This is the same pattern as the definition handler — reading full files just to do text operations. The `findReferences` call (line 26) already reads closed files, so `rename` triggers **double disk reads** for each closed file.

### Fix
1. Use pre-computed ranges from SymbolInfo (after Plan 1 from performance plan).
2. Store the prefix information in the reference data itself.

---

## Improvement 4: `clearFolderSymbols` Has Excessive URI Parsing

### Location
[`server/src/docManager.ts` lines 223-267](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/docManager.ts#L223-L267)

### Description
`clearFolderSymbols` calls `URI.parse(uri).fsPath` inside multiple loops, resulting in the same URI being parsed multiple times. URI parsing involves URL decoding and is not free.

### Fix
Cache the `fsPath` results:
```typescript
const uriToPath = new Map<string, string>();
const getFsPath = (uri: string) => {
    let p = uriToPath.get(uri);
    if (!p) { p = URI.parse(uri).fsPath; uriToPath.set(uri, p); }
    return p;
};
```

---

## Verification Plan

### Automated Tests
```bash
npm run test
```
- All 894 existing passing tests must continue to pass.
- New test files listed in Improvement 1 must be created and pass.
- The pre-existing XML suggestion test failure (Bug 3) should be investigated.

### Manual Verification
- Open a TDL project on Windows, verify `\r\n` handling is correct for position calculations.
- Place a definition at the start of a file, verify CodeLens shows reference count (Bug 5 fix).
- Trigger Document Highlight, verify no noticeable lag (Bug 2 fix).
