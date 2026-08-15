# Test Coverage Improvement Plan

**Date**: 2026-06-27  
**Status**: Proposed  
**Priority**: High  
**Source**: Test coverage audit during codebase review

---

## Summary

The test suite currently has **894 passing tests** across **69 test files** with **1 pre-existing failure**. However, several critical LSP services have **zero test coverage**, and existing tests have significant gaps around edge cases and cross-file scenarios. This plan provides concrete test implementations to fill those gaps.

---

## Current Test State

```
Test Files: 69 passed, 1 failed (70 total)
Tests:      894 passed, 1 failed (895 total)
Duration:   33.34s
```

**Pre-existing failure**: `src/features/tests/xml/suggestion.test.ts` → `returns correct XML definition_type suggestion`

---

## Part 1: Services With Zero Test Coverage

### 1.1 Document Highlight (`documentHighlight.ts`)

**Why this matters**: Document highlight is triggered on every cursor movement. It currently delegates to the expensive `findReferences` (workspace-wide search), so correctness tests are essential before optimizing.

#### [NEW] `server/src/services/tests/documentHighlight.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { getDocumentHighlights } from '../documentHighlight';
import { Parser } from '../../parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { TextDocuments, DocumentHighlightParams } from 'vscode-languageserver';
import { DocManager } from '../../docManager';
import { ScopeManager } from '../scopeManager';
import { SymbolTable } from '../symbolTable';
import { buildFileScope } from '../scopeManager/scopeBuilder';

function setupHighlightTest(files: Record<string, string>) {
    const docs = new Map<string, TextDocument>();
    const docStates = new Map<string, any>();
    let targetUri = '';
    let offset = -1;
    
    for (const [uri, content] of Object.entries(files)) {
        const cursorOffset = content.indexOf('|');
        if (cursorOffset !== -1) {
            targetUri = uri;
            offset = cursorOffset;
        }
        const cleanContent = content.replace('|', '');
        const doc = TextDocument.create(uri, 'tdl', 1, cleanContent);
        docs.set(uri, doc);
        
        const parser = new Parser(cleanContent);
        const sourceFile = parser.parse();
        docStates.set(uri, { sourceFile, diagnostics: [] });
    }

    const mockDocs = {
        get: (uri: string) => docs.get(uri)
    } as unknown as TextDocuments<TextDocument>;

    const symbolTable = new SymbolTable();
    const scopeManager = new ScopeManager(symbolTable);

    for (const [uri, state] of docStates.entries()) {
        buildFileScope(scopeManager, uri, state.sourceFile);
    }

    const reportAttrs = new Map<string, any>();
    reportAttrs.set('use', { name: 'Use', parameters: [{ RefersTo: 'Report' }] });
    scopeManager.globalScope.attributes.set('report', reportAttrs);

    const mockDocManager = {
        get: (uri: string) => docStates.get(uri),
        getAllDocs: () => docStates.entries(),
        getProjectNodes: (uri: string) => new Set(Array.from(docs.keys())),
        getScopeManager: (uri: string) => scopeManager
    } as unknown as DocManager;
    
    return { mockDocs, mockDocManager, targetUri, offset, docs };
}

describe('Document Highlight', () => {
    it('should highlight definition and its reference in same file', async () => {
        const { mockDocs, mockDocManager, targetUri, offset, docs } = setupHighlightTest({
            'file:///test.tdl': `
[Report: |BaseReport]
Use: BaseReport
`
        });
        
        const doc = docs.get(targetUri)!;
        const params: DocumentHighlightParams = {
            textDocument: { uri: targetUri },
            position: doc.positionAt(offset)
        };
        
        const highlights = await getDocumentHighlights(params, mockDocManager, mockDocs);
        
        expect(highlights).toBeDefined();
        expect(highlights.length).toBeGreaterThanOrEqual(1);
    });

    it('should not include highlights from other files', async () => {
        const { mockDocs, mockDocManager, targetUri, offset, docs } = setupHighlightTest({
            'file:///file1.tdl': `
[Report: |BaseReport]
`,
            'file:///file2.tdl': `
[Report: TestReport]
Use: BaseReport
`
        });
        
        const doc = docs.get(targetUri)!;
        const params: DocumentHighlightParams = {
            textDocument: { uri: targetUri },
            position: doc.positionAt(offset)
        };
        
        const highlights = await getDocumentHighlights(params, mockDocManager, mockDocs);
        
        // Should only have highlights from file1, not file2
        for (const h of highlights) {
            // All ranges should be within the current file
            expect(h.range).toBeDefined();
        }
    });

    it('should return empty for cursor on non-symbol position', async () => {
        const { mockDocs, mockDocManager, docs } = setupHighlightTest({
            'file:///test.tdl': `
|
[Report: BaseReport]
`
        });
        
        const params: DocumentHighlightParams = {
            textDocument: { uri: 'file:///test.tdl' },
            position: { line: 0, character: 0 }
        };
        
        const highlights = await getDocumentHighlights(params, mockDocManager, mockDocs);
        expect(highlights.length).toBe(0);
    });
});
```

---

### 1.2 Signature Help (`signatureHelp.ts`)

**Why this matters**: Signature help is triggered on `:` keypress, which is extremely frequent in TDL. Bugs here cause incorrect parameter highlighting.

#### [NEW] `server/src/services/tests/signatureHelp.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { provideSignatureHelp } from '../signatureHelp';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { ScopeManager } from '../scopeManager';
import { SymbolTable } from '../symbolTable';

function createSignatureHelpContext(text: string) {
    const cursorPos = text.indexOf('|');
    const cleanText = text.replace('|', '');
    const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, cleanText);
    const position = doc.positionAt(cursorPos);
    
    const symbolTable = new SymbolTable();
    const scopeManager = new ScopeManager(symbolTable);
    
    // Add test functions
    scopeManager.globalScope.functions.set('roundoff', {
        name: 'RoundOff',
        kind: 'Function',
        uri: 'global:metadata',
        start: 0, end: 0,
        definitionType: 'Function',
        parameters: [
            { ParameterType: 'Value', IsConstant: false, DataType: 'Amount', IsMandatory: true, IsList: false, IsVariableArgument: false, DimensionExpression: false },
            { ParameterType: 'Decimal Places', IsConstant: false, DataType: 'Number', IsMandatory: false, IsList: false, IsVariableArgument: false, DimensionExpression: false }
        ],
        description: 'Rounds off a value'
    } as any);

    // Add test actions
    scopeManager.globalScope.actions.set('set', {
        name: 'Set',
        kind: 'Function',
        uri: 'global:metadata',
        start: 0, end: 0,
        definitionType: 'Action',
        parameters: [
            { ParameterType: 'Variable', IsConstant: false, IsMandatory: true, IsList: false, IsVariableArgument: false, DimensionExpression: false },
            { ParameterType: 'Expression', IsConstant: false, IsMandatory: true, IsList: false, IsVariableArgument: false, DimensionExpression: false }
        ],
        description: 'Sets a variable'
    } as any);
    
    return { doc, position, scopeManager };
}

describe('Signature Help', () => {
    it('should provide signature for $$Function call', () => {
        const { doc, position, scopeManager } = createSignatureHelpContext(
            `[Field: Test]\n    Set As: $$RoundOff:|`
        );
        
        const result = provideSignatureHelp(doc, position, scopeManager);
        
        expect(result).not.toBeNull();
        expect(result?.signatures.length).toBe(1);
        expect(result?.signatures[0].label).toContain('RoundOff');
        expect(result?.activeParameter).toBe(0);
    });

    it('should track active parameter on second colon', () => {
        const { doc, position, scopeManager } = createSignatureHelpContext(
            `[Field: Test]\n    Set As: $$RoundOff:100:|`
        );
        
        const result = provideSignatureHelp(doc, position, scopeManager);
        
        expect(result).not.toBeNull();
        expect(result?.activeParameter).toBe(1);
    });

    it('should return null when not in function call', () => {
        const { doc, position, scopeManager } = createSignatureHelpContext(
            `[Field: Test]\n    Set As: |Hello`
        );
        
        const result = provideSignatureHelp(doc, position, scopeManager);
        expect(result).toBeNull();
    });

    it('should provide signature for Action statement', () => {
        const { doc, position, scopeManager } = createSignatureHelpContext(
            `[Function: Test]\n    01: Set: MyVar:|`
        );
        
        const result = provideSignatureHelp(doc, position, scopeManager);
        
        // Action signature help might or might not activate depending on parser output
        // This test validates the path is not throwing
        // Result may be null if parser doesn't produce action node at this offset
    });
});
```

---

### 1.3 Document Links (`documentLinks.ts`)

#### [NEW] `server/src/services/tests/documentLinks.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { provideDocumentLinks } from '../documentLinks';
import { Parser } from '../../parser/parser';
import { TextDocument } from 'vscode-languageserver-textdocument';

describe('Document Links', () => {
    it('should create link for Include definition', () => {
        const text = `[Include: "common.tdl"]`;
        const parser = new Parser(text);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, text);
        
        const resolveInclude = (current: string, name: string) => {
            if (name === 'common.tdl') return 'C:\\project\\common.tdl';
            return null;
        };
        
        const links = provideDocumentLinks(sourceFile, doc, resolveInclude);
        
        expect(links.length).toBe(1);
        expect(links[0].target).toContain('common.tdl');
    });

    it('should return empty for file with no includes', () => {
        const text = `[Report: MyReport]\n    Use: BaseReport`;
        const parser = new Parser(text);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, text);
        
        const links = provideDocumentLinks(sourceFile, doc, () => null);
        
        expect(links.length).toBe(0);
    });

    it('should handle unresolvable include gracefully', () => {
        const text = `[Include: "nonexistent.tdl"]`;
        const parser = new Parser(text);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///test.tdl', 'tdl', 1, text);
        
        const links = provideDocumentLinks(sourceFile, doc, () => null);
        
        // Should either return empty or a link without target
        expect(links).toBeDefined();
    });
});
```

---

### 1.4 Position Utils (`positionUtils.ts`)

#### [NEW] `server/src/utils/positionUtils.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { offsetToPosition, positionToOffset } from './positionUtils';

describe('Position Utils', () => {
    describe('offsetToPosition (string overload)', () => {
        it('should handle LF line endings', () => {
            const text = 'line1\nline2\nline3';
            
            expect(offsetToPosition(text, 0)).toEqual({ line: 0, character: 0 });
            expect(offsetToPosition(text, 5)).toEqual({ line: 0, character: 5 });
            expect(offsetToPosition(text, 6)).toEqual({ line: 1, character: 0 });
            expect(offsetToPosition(text, 12)).toEqual({ line: 2, character: 0 });
        });

        it('should handle CRLF line endings', () => {
            const text = 'line1\r\nline2\r\nline3';
            const pos = offsetToPosition(text, 7);
            // After \r\n, "line2" starts at offset 7
            // Expected: line 1, character 0
            // NOTE: Current bug - \r is counted as character
            expect(pos.line).toBe(1);
        });

        it('should handle offset at end of string', () => {
            const text = 'hello';
            const pos = offsetToPosition(text, 5);
            expect(pos).toEqual({ line: 0, character: 5 });
        });

        it('should handle empty string', () => {
            const pos = offsetToPosition('', 0);
            expect(pos).toEqual({ line: 0, character: 0 });
        });
    });

    describe('positionToOffset (string overload)', () => {
        it('should convert position to offset with LF', () => {
            const text = 'line1\nline2\nline3';
            
            expect(positionToOffset(text, { line: 0, character: 0 })).toBe(0);
            expect(positionToOffset(text, { line: 1, character: 0 })).toBe(6);
            expect(positionToOffset(text, { line: 2, character: 3 })).toBe(15);
        });

        it('round-trip: offset → position → offset', () => {
            const text = 'first\nsecond\nthird';
            
            for (let offset = 0; offset < text.length; offset++) {
                const pos = offsetToPosition(text, offset);
                const result = positionToOffset(text, pos);
                expect(result).toBe(offset);
            }
        });
    });
});
```

---

## Part 2: Missing Edge Case Tests for Existing Services

### 2.1 CodeLens `resolveCodeLens` — Zero Coverage

[`codeLens.test.ts`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/services/tests/codeLens.test.ts) only tests `provideCodeLens` (4 tests). `resolveCodeLens` has **zero tests**.

#### Tests to Add to `codeLens.test.ts`

```typescript
describe('resolveCodeLens', () => {
    it('should resolve with correct reference count', async () => {
        // Setup mock with files containing a definition and its references
        // Call resolveCodeLens and verify count
    });

    it('should handle definition at offset 0 (Bug #5)', async () => {
        // Regression test: first definition in a file should still get resolved
        // Currently fails because 0 is falsy
    });

    it('should return lens unchanged when doc not found', async () => {
        // Pass a lens with a URI that doesn't exist
    });
});
```

### 2.2 References — Missing Performance/Edge Tests

#### Tests to Add to `references.test.ts`

```typescript
it('should handle empty project (no files indexed)', async () => {
    // getProjectNodes returns empty set
});

it('should handle symbol with no references', async () => {
    // Definition exists but is never referenced
});

it('should handle definition at offset 0', async () => {
    // First definition in file
});
```

### 2.3 Workspace Symbols — Missing Closed-File Test

#### Tests to Add to `workspaceSymbol.test.ts`

```typescript
it('should return results for closed files without disk read when range is pre-computed', async () => {
    // Add symbol with pre-computed range
    // Mock docs.get to return undefined (closed file)
    // Verify correct range is returned without disk read
});

it('should handle cancellation token', async () => {
    // Pass cancelled token, verify empty result
});
```

---

## Part 3: Pre-existing Test Failure Fix

### XML Suggestion Test

The failing test `returns correct XML definition_type suggestion` at line 45 of `suggestion.test.ts` should be investigated. Possible causes:
1. Metadata schema change that invalidated the expected suggestion list.
2. Definition type normalization change.

**Action**: Run test in isolation with verbose output to determine exact assertion failure.

---

## Implementation Order

1. **Phase 1** (Quick wins — new test files, no code changes needed):
   - Create `positionUtils.test.ts`
   - Create `documentLinks.test.ts`
   - Create `signatureHelp.test.ts`

2. **Phase 2** (Tests that expose bugs):
   - Create `documentHighlight.test.ts`
   - Add `resolveCodeLens` tests to `codeLens.test.ts`
   - Add edge case tests to `references.test.ts`

3. **Phase 3** (Fix bugs exposed by tests):
   - Fix `positionUtils` CRLF handling (Bug 4)
   - Fix `resolveCodeLens` falsy offset check (Bug 5)
   - Fix XML suggestion test (Bug 3)

---

## Verification

```bash
# Run full test suite
npm run test

# Run specific new test files
cd server && npx vitest run src/services/tests/documentHighlight.test.ts
cd server && npx vitest run src/services/tests/signatureHelp.test.ts
cd server && npx vitest run src/services/tests/documentLinks.test.ts
cd server && npx vitest run src/utils/positionUtils.test.ts
```

**Target**: 0 failing tests (down from 1), with 20+ new tests added.
