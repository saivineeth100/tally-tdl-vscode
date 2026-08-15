# Shared Server Test Harness Plan

## 1. Objective

Provide one reusable test environment that composes the actual server services with controlled dependencies. Feature tests describe documents, workspace state, and requests rather than rebuilding connection/document/manager mocks.

The harness is used for service integration tests. Pure parsers, context analyzers, and providers may continue using direct unit tests when no server environment is required.

`ServerTestHarness` is the primary testing mechanism for the current refactor. Both E2E tiers are deferred and are not required to accept a feature slice or complete Phases 1–9.

The immediate purpose is to remove the patterns already present in the repository:

- callback variables assigned by fake `onCompletion` methods;
- repeated objects implementing `onDidOpen`, `onDidChangeContent`, `onDidClose`, `get`, `all`, and `keys` differently in each test;
- `DocManager` construction with partial fake connections used only for diagnostics or notification assertions;
- tests that create their own scope/document environment and then reproduce what a production handler would have done.

## 2. Proposed Location

```text
server/src/__tests__/harness/
  serverTestHarness.ts
  createServerTestHarness.ts
  inMemoryDocumentRepository.ts
  inMemoryFileAccess.ts
  deterministicScheduler.ts
  testClientGateway.ts
  testLogger.ts
  metadataFixtures.ts
  workspaceFixtures.ts
  assertions.ts
```

Test fixtures specific to a feature remain beside that feature’s tests. Only reusable setup belongs in the harness folder.

## 3. Primary API

Use a harness class returned by a factory. Tests should not subclass it; composition and options make scenarios easier to understand and isolate.

```ts
interface ServerTestHarnessOptions {
    metadata?: 'minimal' | 'real' | TestMetadataFixture;
    workspaceFolders?: TestWorkspaceFolder[];
    files?: Record<string, string | TestFile>;
    configuration?: Partial<TallyTdlSettings>;
    dependencies?: Partial<ServerRuntimeDependencies>;
    autoInitialize?: boolean;
}

function createServerTestHarness(
    options?: ServerTestHarnessOptions
): Promise<ServerTestHarness>;
```

Unspecified dependencies always receive safe standard test implementations. A test overrides only the dependency relevant to its scenario.

`createServerTestHarness` constructs these real production components in order:

1. test document/file/client/scheduler/logger adapters;
2. `DocManager` with TDL and XML scope managers;
3. document context, loading, and include-resolution services;
4. document and workspace lifecycle services;
5. completion and navigation services plus individual document-feature and custom-request handler functions;
6. the same `ServerRuntime` facade returned in production.

The harness never imports `server.ts` and never opens an LSP connection. Protocol registration is tested separately.

## 4. Harness Components

### 4.1 InMemoryDocumentRepository

- Stores real `TextDocument` instances.
- Supports get/all operations required by services.
- Tracks monotonically increasing document versions.
- Does not independently rebuild state; harness lifecycle methods call the same `DocumentLifecycleService` used by production.

### 4.2 InMemoryFileAccess

- Stores files using normalized absolute test paths and file URIs.
- Supports encoded text, directories, canonical paths, stat results, and missing-file errors.
- Allows explicit UTF-16LE fixtures.
- Exposes read counters for assertions such as “open document avoided disk access.”
- Can be replaced by a temporary native filesystem adapter for tests requiring actual Windows/Unix path semantics.

### 4.3 DeterministicScheduler

- Queues timers without wall-clock waiting.
- Supports flushing the next timer, timers for one document, all timers, and microtasks created by timer callbacks.
- Preserves cancellation behavior.
- Fails disposal assertions when work remains unexpectedly queued.

### 4.4 TestClientGateway

Records:

- published diagnostics by URI;
- notifications by method and payload;
- information and error messages;
- semantic-token refresh requests;
- configuration queries;
- workspace-folder queries.

It exposes typed accessors and reset methods. Tests assert outcomes, not internal mock-call syntax wherever practical.

### 4.5 TestLogger

Collects structured log entries. It remains silent by default and can attach logs to a failed assertion. Tests can verify expected error handling without polluting output.

### 4.6 Metadata Fixtures

Provide three modes:

- `minimal`: fast deterministic definitions, attributes, functions, actions, schemas, keyword sets, and structural mappings needed by most feature tests;
- custom fixture: a test supplies only its special symbols;
- `real`: loads the bundled production metadata for selected integration coverage; the deferred E2E effort may reuse this mode later.

Real metadata must not be loaded globally for every test file.

## 5. Harness Operations

### 5.1 Lifecycle

```ts
await harness.initialize(params?);
await harness.initialized();
await harness.openDocument({ uri, languageId, text });
await harness.changeDocument(uri, newText);
await harness.closeDocument(uri);
await harness.flushDebounce(uri?);
await harness.flushAsyncWork();
await harness.dispose();
```

`openDocument`, `changeDocument`, and `closeDocument` update the repository and invoke production lifecycle services in the same order as the adapter.

### 5.2 Workspace

```ts
harness.addFile(pathOrUri, content);
harness.removeFile(pathOrUri);
await harness.indexFile(pathOrUri);
await harness.setWorkspaceFolders(folders);
await harness.changeWorkspaceFolders(event);
await harness.changeConfiguration(settings);
await harness.fireWatchedFiles(changes);
```

### 5.3 Feature Convenience Methods

Convenience methods construct correct LSP params and call services:

- `complete(uri, positionOrMarker)`;
- `resolveCompletion(item)`;
- `hover(uri, positionOrMarker)`;
- `definition(uri, positionOrMarker)`;
- `references(uri, positionOrMarker, includeDeclaration)`;
- `prepareRename(uri, positionOrMarker)`;
- `rename(uri, positionOrMarker, newName)`;
- equivalents for symbols, formatting, semantic tokens, code actions, links, lens, signature help, and custom requests.

The complete runtime remains available as `harness.runtime` for uncommon calls.

Convenience methods are thin parameter builders only. They must not calculate expected results, invoke providers directly, or duplicate service branching.

### 5.4 Marker-Based Positions

Fixture text may contain a cursor marker such as `¦` and named markers for multi-position cases. The harness removes markers before opening the document and records their LSP positions.

Example:

```ts
const doc = await harness.openDocument({
    uri: 'file:///workspace/main.tdl',
    languageId: 'tdl',
    text: '[Report: Sample]\n    For¦'
});

const result = await harness.complete(doc.uri, doc.marker());
```

This removes repeated manual offset and position calculations.

## 6. Reusable Workspace Fixtures

Provide builders for:

- single TDL document;
- single TDL XML document;
- root file with one or more includes;
- `.tpj` project root;
- isolated standalone files;
- duplicate definitions;
- base definition with `#`, `!`, and `*` modifiers;
- open source with closed target;
- circular includes;
- multi-root workspace;
- metadata-backed and base-TDL virtual definitions.

Builders return URIs and named markers so tests do not depend on array ordering or repeated string literals.

## 7. Shared Assertions

Add intent-level assertions for common outcomes:

- completion labels/details;
- location target URIs and ranges;
- workspace edit contents;
- diagnostics by code and URI;
- notifications and semantic refreshes;
- parsed/indexed/open document state;
- scope existence and symbol resolution.

Assertions must include useful failure output and avoid hiding important protocol fields.

## 8. Test Isolation Rules

- Every test creates its own harness unless a read-only real-metadata fixture is intentionally shared.
- Mutable scope managers, repositories, files, timers, gateway calls, and logs are never shared across tests.
- `afterEach` disposes the harness and verifies no unexpected scheduled work remains.
- Tests use unique workspace roots and URIs.
- Fake timers from the test framework are not mixed with the deterministic scheduler.
- Tests do not mutate bundled metadata.

## 9. Migration Rules for Existing Tests

- Replace fake connection callback capture with direct harness service calls.
- Replace repeated `TextDocuments` and `DocManager` mocks with harness defaults.
- Replace manually simulated handler behavior with actual service requests.
- Keep pure function tests direct and small.
- If the harness lacks a scenario, extend the shared harness rather than adding another private server mock.
- A feature-specific fake is allowed only for a dependency unique to that feature and must be supplied through `dependencies` overrides.

## 10. Existing Test Migration Map

### Completion

| Current test | Current problem | Replacement |
|---|---|---|
| `features/completion/1.basic.test.ts` | Tests only `detectCompletionContext` | Keep focused analyzer cases; add companion full-cycle cases using `harness.complete` |
| `features/completion/basic.test.ts` | Captures `completionCallback` from a fake connection | Open fixture documents and call `harness.complete`; use `resolveCompletion` for documentation |
| `features/completion/tdl_completion.test.ts` | Registers completion against custom mock objects | Build the same scopes through fixtures and call production completion service |
| `features/completion/autocompleteIsolation.test.ts` | Creates DocManager with mock connection/documents | Replace mock construction with harness; test isolation through harness scope fixtures |
| `features/xml/suggestion.test.ts` | Repeats several connection/document/manager mocks | Use one XML harness fixture per scenario and marker-based cursor positions |
| `features/xml/schemaCompletion.test.ts` | Captures `onCompletionCallback` | Load schema symbols into minimal metadata fixture and call `harness.complete` |

Context analyzer tests remain in place because they diagnose parsing/context defects quickly. They are no longer treated as proof that completion works end to end.

### Navigation

| Current test | Current problem | Replacement |
|---|---|---|
| `features/onDefinitionMultiple.test.ts` | Reimplements definition/modifier collection in the test | Use duplicate/modifier workspace fixture and call `harness.definition` |
| `features/references.test.ts` | Mixes lower-level and environment setup | Retain pure reference-index cases; move document/workspace orchestration to harness tests |
| `features/rename.test.ts` | Manages open/closed documents locally | Use harness open documents plus in-memory closed files and call `harness.rename` |
| `features/documentHighlight.test.ts` | Uses DocManager directly | Replace with harness navigation calls |
| `features/workspaceSymbol.test.ts` | Uses DocManager directly | Replace with harness navigation calls |
| `features/xml/reference.test.ts` | Creates mock connection and DocManager | Replace with harness XML workspace fixture and navigation calls |
| XML definition/rename tests | Construct custom managers/documents | Reuse XML workspace fixtures with real XML parsing and XML scope manager selection |

### Document/workspace lifecycle

| Current test | Current problem | Replacement |
|---|---|---|
| `semantics/docManager.indexing.test.ts` | Builds a partial fake connection and document collection | Use harness filesystem, lifecycle calls, and diagnostic gateway |
| `semantics/workspaceScan.test.ts` | Recreates scanning dependencies | Use `.tpj`, include, and standalone workspace fixture builders |
| `semantics/workspacePartitioning.test.ts` | Uses a module-level custom connection | Create isolated harness per test and assert project nodes/scopes |
| `features/activeUrisIpc.test.ts` | Asserts a raw connection mock call | Assert `harness.client.notifications('tdl/activeUrisChanged')` |

### Document features

| Current test | Current problem | Replacement |
|---|---|---|
| `features/codeLens.test.ts` | Uses DocManager directly | Replace with harness document-feature calls |
| `features/codeActions.test.ts` | Uses DocManager directly | Replace with harness document-feature calls |

### Custom requests

| Current test | Current problem | Replacement |
|---|---|---|
| `semantics/scopeViewer.test.ts` | Tests viewer directly | Review during Phase 8; may remain as pure test or migrate to harness custom-request calls |

### Pure feature tests

 Tests for formatting algorithms, AST queries, scanners, parsers, validation rules, semantic token generation, and hover formatting remain direct when they do not claim to cover a server handler. Add a harness-level test for each corresponding handler separately.

## 11. Required Harness Self-Tests

- construction with minimal defaults;
- lifecycle ordering;
- document version changes;
- marker extraction;
- deterministic debounce and cancellation;
- in-memory file encoding/path behavior;
- diagnostics and notification recording;
- custom dependency override;
- disposal and isolation between consecutive harnesses;
- real metadata opt-in.

## 12. Completion Criteria

- Completion, definition, navigation, lifecycle, XML, and custom request integration tests use the harness.
- No feature test captures a callback from `onCompletion` or another registration method.
- No feature test reproduces a production handler algorithm.
- Repeated connection/document-manager mocks are deleted.
- Harness setup for a normal single-document feature test is only a few lines.
