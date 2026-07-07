---
name: writing-tests
description: >
  Rules and patterns for writing server-side tests using Vitest.
  Activated when creating, modifying, or reviewing test files under `server/src/__tests__/`.
  Ensures all tests use the project's shared test harness and mock adapters instead of ad-hoc inline mocks.
---

# Writing Server Tests

## Test Framework

This project uses **Vitest** as the test runner. The Vitest config lives at `server/vitest.config.ts`.

A global setup file at `server/src/__tests__/test-setup.ts` runs automatically before all tests (configured via `setupFiles` in vitest config). It:
- Loads TDL metadata and initializes a shared `testScopeManager` instance.
- Exports `createTestScopeManager()` for isolated scope manager instances.
- Exports `ensureBaseTdlLoaded()` for tests needing Base TDL definitions.

---

## Test File Organization

All server tests live under `server/src/__tests__/` organized into folders that mirror the source structure. **Place test files in the correct folder based on what they test.**

```
server/src/__tests__/
├── harness/              # Shared test infrastructure (DO NOT put tests here)
│   ├── serverTestHarness.ts   # ServerTestHarness class
│   └── testAdapters.ts        # Mock/in-memory port implementations
├── test-setup.ts         # Global setup (auto-run before all tests)
│
├── core/                 # Tests for server/src/core/
│   ├── ast/              #   AST node queries, tree structure
│   ├── parser/           #   TDL parser tests
│   ├── scanner/          #   Lexer/scanner token tests
│   └── xml/              #   XML adapter tests
│
├── features/             # Tests for server/src/features/
│   ├── completion/       #   Auto-completion tests
│   ├── semanticTokens/   #   Semantic token highlighting tests
│   ├── xml/              #   XML-specific feature tests
│   ├── hover.test.ts     #   Hover provider tests
│   ├── definition.test.ts #  Go-to-definition tests
│   ├── references.test.ts #  Find-references tests
│   ├── rename.test.ts    #   Rename refactoring tests
│   └── ...               #   Other LSP feature tests
│
├── semantics/            # Tests for server/src/semantics/
│                         #   Scope manager, symbol resolution, workspace scanning
│
├── validation/           # Tests for server/src/validation/ and server/src/diagnostics/
│                         #   Diagnostic rules, attribute/arity/schema validation
│
├── architecture/         # Tests for server/src/runtime/ and server/src/services/
│                         #   Runtime composition, service wiring, document lifecycle
│
└── utils/                # Tests for server/src/utils/
                          #   Pure utility function tests
```

### Placement Rules

| Source file location | Test goes in |
|---|---|
| `server/src/core/parser/*.ts` | `__tests__/core/parser/` |
| `server/src/features/hover/*.ts` | `__tests__/features/hover.test.ts` or `__tests__/features/hover/` |
| `server/src/features/completion/providers/*.ts` | `__tests__/features/completion/` |
| `server/src/services/*.ts` | `__tests__/architecture/` (for lifecycle/runtime) or `__tests__/semantics/` (for state/scope) |
| `server/src/validation/*.ts` | `__tests__/validation/` |
| `server/src/utils/*.ts` | `__tests__/utils/` |

**When a feature has multiple test files, group them in a subdirectory** (e.g., `features/completion/`, `features/semanticTokens/`).

### Naming Conventions

- Test files: `<featureName>.test.ts` (e.g., `hover.test.ts`, `definition.test.ts`)
- Test files with sub-categories: `<featureName>.<category>.test.ts` (e.g., `formatting.comments.test.ts`)
- Helper/setup files in test dirs: no `.test.ts` suffix (they won't be auto-discovered)

---

## CRITICAL: Use the Shared Test Harness — DO NOT Create Ad-Hoc Mocks

The project has a **shared test harness** located at `server/src/__tests__/harness/`. You **MUST** use it when writing any test that needs server runtime dependencies (documents, client, diagnostics, files, scheduler, logger).

### What the Harness Provides

#### `ServerTestHarness` (from `server/src/__tests__/harness/serverTestHarness.ts`)

A fully configured `ServerRuntime` using mock/in-memory adapters. Instantiate it to get a complete runtime environment:

```typescript
import { ServerTestHarness } from '../harness/serverTestHarness';
// or from '../../harness/serverTestHarness' depending on test depth

const harness = new ServerTestHarness();
```

The harness exposes these mock instances as public properties:
- `harness.documents` — `InMemoryDocumentRepository`
- `harness.client` — `MockClientGateway`
- `harness.diagnostics` — `MockDiagnosticPublisher`
- `harness.files` — `InMemoryFileAccess`
- `harness.scheduler` — `DeterministicScheduler`
- `harness.logger` — `MockServiceLogger`
- `harness.runtime` — The fully composed `ServerRuntime` with all services

The harness also provides **document lifecycle simulation methods** that mirror the production flow in `server.ts`:
- `harness.simulateOpen(uri, languageId, content)` — Opens a document (updates repo + triggers `onDidOpen`)
- `harness.simulateChange(uri, content)` — Changes document content (updates repo + triggers `onDidChangeContent`)
- `harness.simulateClose(uri)` — Closes a document (triggers `onDidClose` + removes from repo)

These methods keep `InMemoryDocumentRepository` and `DocumentLifecycleService` in sync, just like VS Code's `TextDocuments` class does in production.

You can override specific dependencies via the constructor:
```typescript
const harness = new ServerTestHarness({ files: myCustomFileAccess });
```

#### Mock Adapters (from `server/src/__tests__/harness/testAdapters.ts`)

These implement the port interfaces from `server/src/ports/`:

| Adapter Class | Implements Port | Purpose |
|---|---|---|
| `InMemoryDocumentRepository` | `DocumentRepository` | In-memory document storage with `get`, `set`, `delete`, `all` |
| `MockClientGateway` | `ClientGateway` | Records notifications, messages, config, workspace folders |
| `MockDiagnosticPublisher` | `DiagnosticPublisher` | Captures published diagnostics in a Map |
| `InMemoryFileAccess` | `FileAccess` | In-memory filesystem with `set`, `exists`, `readFile`, `readDirectory`, `stat` |
| `DeterministicScheduler` | `Scheduler` | Controllable timer queue with `flush()` to execute all pending callbacks |
| `MockServiceLogger` | `ServiceLogger` | Captures log entries (error, warn, info, debug, trace) |

### Architecture Context

The server uses a **Ports & Adapters** (hexagonal) architecture:
- **Ports** are interfaces defined in `server/src/ports/` (e.g., `DocumentRepository`, `ClientGateway`, `FileAccess`).
- **Production adapters** wire to VS Code's LSP connection.
- **Test adapters** in the harness provide in-memory/mock implementations of the same interfaces.
- `ServerRuntimeDependencies` (from `server/src/runtime/serverRuntime.ts`) bundles all port implementations. The `ServerTestHarness` satisfies this interface using test adapters.

---

## CRITICAL: No `any` — Use Correct Types

**NEVER use `as any` in tests.** Always use the correct, properly-typed values. The `any` type defeats type checking and hides bugs.

### Common `any` Patterns and Their Correct Replacements

#### ❌ WRONG: Casting objects to `any` for `DocState`
```typescript
// ❌ WRONG
stateStore.setOpen(uri, {} as any);
stateStore.setOpen(uri, { sourceFile: {} as any, diagnostics: [] });
```

#### ✅ CORRECT: Create a proper `DocState` with a real parsed `SourceFile`
```typescript
import { Parser } from '../../core/parser/parser';
import { DocState } from '../../services/documentStateStore';

// Parse real TDL to get a valid SourceFile
const parser = new Parser('[Report: Test]\n    Title: Test Report');
const sourceFile = parser.parse();
const docState: DocState = { sourceFile, diagnostics: [] };
stateStore.setOpen(uri, docState);
```

#### ❌ WRONG: Casting scope entries to `any`
```typescript
// ❌ WRONG
scopeManager.fileMap.set('file:///test.tdl', {} as any);
scopeManager.globalScope.attributes.set('field', fieldAttrs as any);
```

#### ✅ CORRECT: Use proper types from `tally-tdl-shared`
```typescript
import { DefinitionSymbol, AttributeSymbol, SymbolKind } from 'tally-tdl-shared';

// Create properly-typed attribute maps
const reportAttrs = new Map<string, AttributeSymbol>();
reportAttrs.set('use', {
    name: 'Use',
    parameters: [{ RefersTo: 'Report' }]
} as AttributeSymbol);
scopeManager.globalScope.attributes.set('report', reportAttrs);

// Create properly-typed definition symbols
const symbol: DefinitionSymbol = {
    name: 'MyReport',
    kind: SymbolKind.Report,
    uri: 'file:///test.tdl',
    start: 0,
    end: 50,
    definitionType: 'Report'
};
```

#### ❌ WRONG: Casting constructor arguments to `any`
```typescript
// ❌ WRONG
const contextResolver = new DocumentContextResolver(mockDocs as any, mockMgr as any, mockMgr as any);
const completionService = new CompletionService(mockMgr as any, mockMgr as any, contextResolver, () => []);
```

#### ✅ CORRECT: Use the ServerTestHarness instead
```typescript
// ✅ CORRECT — The harness provides properly-typed instances
const harness = new ServerTestHarness();
// Access services through harness.runtime instead of constructing them manually
```

#### ❌ WRONG: Casting AST node types to `any` to access properties
```typescript
// ❌ WRONG
const action = (statement as any).action;
expect((stmt.label as any)?.text).toBe('01');
```

#### ✅ CORRECT: Use type guards or proper AST node types
```typescript
import { BlockStatementNode, IfNode, SimpleStatementNode } from '../../core/ast/ast';

// Use instanceof checks for specific node types
if (statement instanceof BlockStatementNode) {
    const action = statement.action;
}

// Use specific node types from the AST
const ifNode = statement as IfNode;
expect(ifNode.action.text).toBe('IF');
```

### When `as` Casts Are Acceptable

The **only** acceptable cast pattern is when narrowing from a union type or interface to a known subtype:
```typescript
// ✅ OK — narrowing to a known concrete type after a type check
const harness = new ServerTestHarness({ files: customFiles as InMemoryFileAccess });
```

---

## Prohibited Patterns

When writing tests, **DO NOT**:

1. **Use `as any` casts** — always use correct types (see section above).

2. **Create inline mock objects** for ports that the harness already covers:
   ```typescript
   // ❌ WRONG — Don't do this
   const mockDocuments = { get: vi.fn(), set: vi.fn(), all: vi.fn() };
   const mockClient = { notify: vi.fn(), showErrorMessage: vi.fn() };
   ```

3. **Use `vi.mock()` or `vi.fn()` to mock port interfaces** that have harness adapters:
   ```typescript
   // ❌ WRONG — Don't mock the module
   vi.mock('../../ports/documentRepository');
   ```

4. **Create temporary one-off mock classes** that duplicate what the harness already provides.

5. **Manually construct `ServerRuntime`** or call `createServerRuntime()` directly in tests — let the harness do it.

6. **Put test files in the wrong folder** — match the source structure (see organization section).

7. **Manually sync documents with lifecycle** — use `simulateOpen`/`simulateChange`/`simulateClose` instead:
   ```typescript
   // ❌ WRONG — Two-step pattern leaves repo and lifecycle out of sync
   const doc = TextDocument.create(uri, 'tdl', 1, content);
   harness.documents.set(uri, doc);
   harness.runtime.documentLifecycle.onDidOpen(doc);

   // ✅ CORRECT — Single call mirrors the production TextDocuments flow
   harness.simulateOpen(uri, 'tdl', content);
   harness.runtime.documentLifecycle.processPendingDocuments();
   ```

---

## Commenting Guidelines for Tests

### File-Level Comments

Every test file should start with a brief JSDoc comment explaining **what** is being tested:

```typescript
/**
 * Tests for the hover feature provider.
 * Validates hover content generation for TDL definitions, attributes,
 * functions, and metadata-driven documentation.
 */
import { describe, it, expect } from 'vitest';
```

### Describe Block Comments

Use descriptive `describe()` labels that read as a noun phrase identifying the unit under test:

```typescript
describe('Hover Provider', () => {
    describe('getHoverInfo', () => {
        // ...
    });

    describe('createHoverContent', () => {
        // ...
    });
});
```

### Test Case Comments

Use `it()` descriptions that complete the sentence "it should...". Add inline comments only when the **intent is non-obvious**:

```typescript
it('should return hover content for a Report definition header', () => {
    // Position cursor on "MyReport" — should show the definition type and name
    const offset = tdl.indexOf('MyReport');
    // ...
});
```

### Setup Helper Comments

Document setup helper functions that prepare test fixtures:

```typescript
/**
 * Creates a test harness pre-loaded with the given files.
 * Each file entry maps a URI to its TDL content.
 * The `|` character in content marks the cursor position for the test.
 */
async function setupHarness(files: Record<string, string>) {
    // ...
}
```

---

## Correct Test Patterns

### Pattern 1: Feature Test Using Harness (Most Common)

```typescript
/**
 * Tests for the document highlight feature.
 * Validates that all references to a symbol are highlighted
 * when the cursor is on one occurrence.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { ServerTestHarness } from '../harness/serverTestHarness';

describe('Document Highlight', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        harness = new ServerTestHarness();
    });

    it('should highlight all occurrences of a definition name', () => {
        // Simulate opening a document (mirrors VS Code's TextDocuments flow)
        const content = '[Report: MyReport]\n    Use: MyReport';
        harness.simulateOpen('file:///test.tdl', 'tdl', content);
        harness.runtime.documentLifecycle.processPendingDocuments();

        // Add to in-memory filesystem if needed for cross-file features
        harness.files.set('/workspace/test.tdl', content);

        // Assert on mock captures
        expect(harness.diagnostics.publishedDiagnostics.size).toBeGreaterThan(0);
    });
});
```

### Pattern 2: Test Needing Scope Manager (Parser/Semantic Tests)

For tests that only need the parser and scope manager (no full runtime):

```typescript
/**
 * Tests for TDL parser definition extraction.
 * Validates that the parser correctly builds AST nodes
 * for various definition types and modifier combinations.
 */
import { describe, it, expect } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { ScopeManager } from '../../semantics/scopeManager';
import { testScopeManager, createTestScopeManager } from '../test-setup';

describe('Parser - Definition Extraction', () => {
    it('should parse a Report definition with attributes', () => {
        const tdl = `[Report: MyReport]\n    Title: Test`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();

        expect(sourceFile.definitions).toHaveLength(1);
        expect(sourceFile.definitions[0].name?.text).toBe('MyReport');
    });
});
```

### Pattern 3: Spying on Harness Mock Methods

```typescript
/**
 * Tests for client notification delivery.
 * Verifies that the server correctly sends IPC notifications
 * through the ClientGateway when active URIs change.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServerTestHarness } from '../harness/serverTestHarness';

describe('Active URIs IPC', () => {
    let harness: ServerTestHarness;

    beforeEach(() => {
        harness = new ServerTestHarness();
        vi.spyOn(harness.client, 'notify');
    });

    it('should notify client with active URI list', () => {
        // ... trigger the action
        expect(harness.client.notify).toHaveBeenCalledWith(
            'tdl/activeUrisChanged',
            expect.objectContaining({ activeUris: expect.any(Array) })
        );
    });
});
```

### Pattern 4: Cross-File Tests with In-Memory Filesystem

```typescript
/**
 * Sets up a test harness with multiple files loaded into the
 * in-memory filesystem and document repository.
 * The `|` character in file content marks the cursor position.
 *
 * @returns The configured harness and the cursor position info.
 */
async function setupHarness(files: Record<string, string>) {
    const harness = new ServerTestHarness();

    for (const [uri, content] of Object.entries(files)) {
        const cleanContent = content.replace('|', '');
        const fsPath = uri.replace('file:///', '');
        const canonicalPath = harness.files.canonicalize(fsPath);
        harness.files.files.set(canonicalPath, cleanContent);

        harness.simulateOpen(uri, 'tdl', cleanContent);
        harness.runtime.documentLifecycle.processPendingDocuments();
    }

    return harness;
}
```

---

## Summary

| Need | Use |
|---|---|
| Full server runtime for integration-style tests | `new ServerTestHarness()` |
| Opening a document (production-faithful) | `harness.simulateOpen(uri, languageId, content)` |
| Changing a document's content | `harness.simulateChange(uri, newContent)` |
| Closing a document | `harness.simulateClose(uri)` |
| In-memory documents | `harness.documents` (InMemoryDocumentRepository) |
| Mock client notifications/messages | `harness.client` (MockClientGateway) |
| In-memory filesystem | `harness.files` (InMemoryFileAccess) |
| Controlled timers | `harness.scheduler` (DeterministicScheduler) |
| Log capture | `harness.logger` (MockServiceLogger) |
| Diagnostic assertions | `harness.diagnostics` (MockDiagnosticPublisher) |
| Parser-only tests (no runtime) | `new Parser(tdl).parse()` directly |
| Scope manager with metadata | `testScopeManager` from test-setup.ts |
| Isolated scope manager | `createTestScopeManager()` from test-setup.ts |
| Proper types for `DocState` | `import { DocState } from '../../services/documentStateStore'` |
| Symbol types for scope setup | `import { DefinitionSymbol, AttributeSymbol, SymbolKind } from 'tally-tdl-shared'` |
| AST node type guards | `import { BlockStatementNode, IfNode } from '../../core/ast/ast'` |
