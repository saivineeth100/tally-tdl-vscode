# Incremental Migration Plan

## 1. Migration Strategy

Implement the architecture through vertical, compile-safe slices. Each phase must preserve the production entrypoint and migrate affected tests before moving to the next phase.

Do not create a second independent implementation of a feature. During a transition, compatibility functions may delegate to the new service or handler function, but there must be one source of business behavior.

The current implementation scope is Phases 1–9. Phase 10 is intentionally deferred and is not required to complete this refactor.

## 2. Confirmed Handler Migration Matrix

The server inventory is already complete. Implementation starts with Phase 1; it does not repeat an exploratory inventory phase.

| Current registration | Target runtime callable | Current empty/error result |
|---|---|---|
| `onInitialize` | `workspaceLifecycle.initialize` | initialization error propagated by LSP |
| `onInitialized` | `workspaceLifecycle.initialized` | errors logged by lifecycle boundary |
| workspace-folder changes | `workspaceLifecycle.changeWorkspaceFolders` | no response |
| `onDidChangeWatchedFiles` | `workspaceLifecycle.changeWatchedFiles` | no response |
| document open/change/close | `documentLifecycle.open/change/close` | diagnostics/lifecycle effects only |
| `onDidChangeConfiguration` | `workspaceLifecycle.changeConfiguration` | no response |
| `onDocumentSymbol` | `documentFeatures.documentSymbols` | `[]` |
| `onHover` | `documentFeatures.hover` | `null` |
| `onFoldingRanges` | `documentFeatures.foldingRanges` | `null` |
| `onSignatureHelp` | `documentFeatures.signatureHelp` | `null` |
| inlay hint `on` | `documentFeatures.inlayHints` | `null` |
| `onCodeLens` | `documentFeatures.codeLens` | `null` |
| `onCodeLensResolve` | `documentFeatures.resolveCodeLens` | unchanged lens where unresolved |
| semantic tokens `on` | `documentFeatures.semanticTokens` | `{ data: [] }` |
| semantic tokens `onDelta` | `documentFeatures.semanticTokensDelta` | `{ edits: [] }` |
| `onDocumentFormatting` | `documentFeatures.formatDocument` | `[]` |
| `onDocumentOnTypeFormatting` | `documentFeatures.formatOnType` | `[]` |
| `onDocumentLinks` | `documentFeatures.documentLinks` | `[]` |
| `onCodeAction` | `documentFeatures.codeActions` | preserve provider result |
| `onCompletion` | `completion.complete` | empty complete `CompletionList` |
| `onCompletionResolve` | `completion.resolve` | unchanged item |
| `onDefinition` | `navigation.definition` | `null` |
| `onReferences` | `navigation.references` | `null` |
| `onPrepareRename` | `navigation.prepareRename` | preserve current result |
| `onRenameRequest` | `navigation.rename` | `null` on handled error |
| `onWorkspaceSymbol` | `navigation.workspaceSymbols` | preserve provider result |
| `onDocumentHighlight` | `navigation.documentHighlights` | preserve provider result |
| `tdl/getScopeTreeDebug` | `customRequests.getScopeTree` | preserve viewer result |
| `tdl/getScopeChildren` | `customRequests.getScopeChildren` | preserve viewer result |
| `tdl/getScopeNode` | `customRequests.getScopeNode` | preserve viewer result |
| `tdl/getScopeSymbols` | `customRequests.getScopeSymbols` | preserve paginated result |
| `tdl/resolveGlobalSymbol` | `customRequests.resolveGlobalSymbol` | preserve resolver result |
| `tdl/convertToXml` | `customRequests.convertToXml` | `null` when document/state is missing |
| `tdl/buildCustomLibraryCache` | `customRequests.buildCustomLibraryCache` | existing information/error message |

Known pre-existing failing tests will be listed by name only when the relevant slice is implemented; they do not require another architecture-discovery phase.

## 3. Phase 1: Ports, Adapters, and Runtime Skeleton

### Implementation changes

- Add dependency interfaces for documents, client effects, filesystem, scheduler, and logging.
- Add production adapters without changing current handler behavior.
- Add `ServerRuntime` and `createServerRuntime`; each subsequent slice adds its production service to this single composition path rather than creating temporary alternate runtimes.
- Centralize capabilities and typed custom protocol constants.
- Add the shared test harness skeleton using test adapters.

### Compatibility Rule

The existing `server.ts` may continue registering handlers in this phase, but new adapters must already be usable by tests.

### Tests

- Adapter unit tests for repository and gateway behavior.
- Runtime construction test proving it requires no active VS Code instance.
- Capability snapshot/equality test.

### Exit Criteria

- Runtime and test harness can be constructed and disposed.
- No production behavior has moved yet.

## 4. Phase 2: Document Context and File Access

### Implementation changes

- Implement `DocumentContextResolver`, `DocumentLoader`, and `IncludePathResolver`.
- Move encoded file reading behind `FileAccess`.
- Replace repeated open-or-disk document creation and offset/range conversion in migrated feature paths.
- Keep compatibility exports such as `readFileWithEncoding` delegating to the production file adapter until all imports are migrated.

### Tests

- Open document lookup and normalized URI behavior.
- Parsed-state and source-file requirements.
- TDL/XML scope-manager selection.
- Open-document preference over disk.
- UTF-8 and UTF-16LE disk loading.
- Relative and workspace-root include resolution.
- Missing and non-canonical path behavior.

### Exit Criteria

- New services no longer repeat document/state lookup.
- File fallback semantics are covered independently.

## 5. Phase 3: Document Lifecycle and DocManager Decoupling and Decomposition

### Implementation changes

- Remove `Connection` from the `DocManager` constructor and replace direct `sendDiagnostics`/`sendNotification` calls with injected publishers.
- Remove document callback registration from the constructor.
- Split `DocManager` into three focused components:
  - **`DocumentStateStore`** — `docs`/`indexedDocs` maps, `get()`/`getOpen()`/`getIndexed()`/`set()`/`delete()`, `getScopeManager()`, `isMetadataLoaded`.
  - **`IncludeGraphManager`** — `includeGraph`, `parentGraph`, `projectNodesCache`, `tpjFiles`, `getProjectNodes()`, `isUriActive()`, active/inactive URI tracking.
  - **`WorkspaceScanner`** — `scanWorkspaceFolders()`, `scanDirectory()`, `indexFile()`, `revalidateAll()`, `clearFolderSymbols()`, `setExcludePaths()`, workspace folder state, scan queue.
- Add explicit document lifecycle operations in `DocumentLifecycleService`, which depends on `DocumentStateStore` and `IncludeGraphManager` (not the full former `DocManager`).
- Move rebuild debounce and timer ownership to `DocumentLifecycleService`.
- Add deterministic disposal.
- Change production document event callbacks to delegate to the lifecycle service.

Performing the decomposition here avoids a second rewiring pass after Phases 4–8 build services against the monolithic `DocManager`. Each sub-piece (Connection removal, event extraction, class split) can be separate commits within this phase.

### Compatibility Rule

Preserve rebuild delay, close/reindex order, scope cleanup, diagnostics clearing, and active-URI notification timing.

### Tests

- Open triggers immediate rebuild.
- Rapid changes collapse into one rebuild containing the latest text.
- Different documents use independent debounce jobs.
- Close cancels pending rebuild, clears open state/references/diagnostics, and re-indexes from disk.
- Disposal cancels scheduled work.
- Diagnostics and active-URI events use the test gateway.
- `DocumentStateStore` get/set/delete and scope-manager selection.
- `IncludeGraphManager` graph operations and project-node resolution.
- `WorkspaceScanner` scan/index operations using in-memory file access.

### Exit Criteria

- `DocManager` no longer exists as a single class; its responsibilities live in three focused components.
- None of the three components has a `Connection` dependency or registers events.
- Lifecycle tests contain no hand-written connection mocks.

## 6. Phase 4: Simple Document Features

### Implementation changes

Create individual handler functions that receive `DocumentContextResolver` plus only their endpoint-specific collaborators. Add the shared `withDocContext` higher-order function to remove repeated document/parsed-state lookup while preserving each endpoint’s fallback. Do not create a `DocumentFeatureService` class.

Migrate in this order:

1. document symbols;
2. folding ranges;
3. signature help;
4. inlay hints;
5. formatting and on-type formatting;
6. document links;
7. hover;
8. code actions;
9. code lens and resolution;
10. semantic tokens full and delta.

The order starts with stateless features and leaves cached/cancellation-aware behavior until shared mechanics are proven. Async handlers use a promise-aware context wrapper or resolve through `DocumentContextResolver` directly when their input does not contain `textDocument.uri`. The runtime exposes a typed `documentFeatures` function map for registration and harness convenience; it is not a class.

### Tests

- Move orchestration tests to the harness.
- Retain pure provider tests unchanged.
- Add missing-document, missing-state, and missing-source-file cases using each endpoint’s current fallback.
- Verify cancellation is forwarded where supported.

### Exit Criteria

- Corresponding callbacks in `server.ts` delegate only.
- Each handler owns its provider invocation and uses the shared resolver/context wrapper instead of repeating lookup boilerplate.

## 7. Phase 5: Completion Service

### Implementation changes

- Move the complete `onCompletion` callback body into `CompletionService.complete`.
- Move completion resolution into `CompletionService.resolve`.
- Keep context analyzers and completion providers as pure collaborators.
- Change `registerCompletion` into a temporary delegating adapter or remove it when the central registration adapter is ready.

### Tests

- Convert all callback-capture completion tests to `ServerTestHarness.complete`.
- Cover complete TDL and XML flows, not only context detection.
- Cover each completion context dispatch family.
- Verify the current empty result for missing documents.
- Verify resolve documentation for functions and attributes.
- Retain focused context/provider unit tests for algorithm diagnostics.

### Exit Criteria

- No test obtains a completion callback from a fake connection.
- Production and tests invoke the same `complete` and `resolve` methods.

## 8. Phase 6: Navigation Service

### Implementation changes

- Move definition orchestration out of `server.ts` first.
- Migrate references, prepare rename, rename, highlights, and workspace symbols.
- Use `DocumentLoader` and shared range conversion for closed targets.
- Preserve duplicate/modifier ordering and filtering behavior.

### Tests

- Replace `onDefinitionMultiple.test.ts`’s simulated logic with an actual service call.
- Cover same-file and cross-file definitions.
- Cover duplicate definitions, modifiers, modifier-origin navigation, includes, metadata exclusions, virtual base-TDL URIs, closed files, and missing files.
- Cover references with and without declarations.
- Cover rename edits across open and closed files.

### Exit Criteria

- Navigation tests do not duplicate production algorithms.
- All navigation handlers delegate only.

## 9. Phase 7: Workspace Lifecycle

### Implementation changes

- Move initialization state and capability response into `WorkspaceLifecycleService`.
- Move initialized/configuration/workspace-folder/watched-file behavior.
- Inject metadata and external-library loaders so lifecycle branches can be tested without slow real metadata loading.
- Keep a production loader that executes current metadata behavior.
- Remove global workspace folders, initialization parameters, target version, and capability flags from `server.ts`.

### Tests

- Workspace folders supplied in initialize parameters.
- Client workspace-folder lookup.
- `rootUri` and `rootPath` fallback.
- Added and removed folders.
- Deleted watched files.
- initial metadata load and delayed revalidation.
- target-version reload and semantic refresh.
- exclusions and external-library updates.

### Exit Criteria

- `server.ts` owns no mutable lifecycle state.
- Lifecycle services are deterministic under the harness.

## 10. Phase 8: Custom Requests and Notifications

### Implementation changes

- Extract scope-explorer requests, global symbol resolution, XML conversion, and cache generation into directly callable handler functions.
- Default to separate functions because these operations are not inherently cohesive. Group only a narrow set—such as scope-viewer traversal/pagination—if extraction reveals shared invariants or lifecycle; do not create `CustomRequestService` merely as a method bag.
- Expose the functions through a typed `customRequests` runtime map for registration and harness calls.
- Centralize custom method constants and payload/result types.
- Keep existing client-visible information and error messages.

### Tests

- Success, missing-document, invalid-scope, pagination, conversion, and cache-failure cases.
- Adapter registration uses the exact existing method strings.

### Exit Criteria

- No custom request contains business logic in the registration callback.

## 11. Phase 9: Central Registration and Entry Point Cleanup

### Implementation changes

- Implement the final `registerLspHandlers` adapter.
- Move all registrations from `server.ts` and feature registration modules.
- Reduce `server.ts` to connection creation, runtime composition, registration, document listening, connection listening, and shutdown disposal.
- Remove obsolete compatibility adapters and unused imports.
- Add an architecture-boundary check, preferably ESLint restrictions, preventing service/feature modules from importing the connection entrypoint.

### Tests

- Registration contract test checks every standard/custom method delegates to the correct service.
- Server module import test verifies importing runtime modules does not create/listen on a connection.

### Exit Criteria

- All registrations are centralized.
- `server.ts` has no feature branches.

## 12. Phase 10: Deferred E2E Follow-Up

**Status: pending and outside the current implementation scope.** Skip this phase during the present refactor. Do not create `server/vitest.e2e.config.ts`, `server/src/__tests__/e2e/`, or `e2e/vscode/`; do not add `test:e2e:*` scripts or Extension Host CI infrastructure.

The retained [E2E plan](./04-e2e-testing.md) may be implemented later as a separately approved effort. Current final verification uses the `ServerTestHarness`, targeted service/integration tests, type checking, compilation, architecture checks, and the non-E2E requirements in [the rollout plan](./05-acceptance-and-rollout.md).

## 13. Pull Request and Review Guidance

Prefer one pull request per major phase or a small group of tightly coupled phases. Each pull request must include:

- migrated production code;
- migrated/new tests using the harness;
- updated migration matrix;
- confirmation that wire contracts are unchanged;
- any newly observed pre-existing defect recorded separately.

Avoid a final large test-conversion-only pull request; tests move with their production slice.

## 14. Concrete File Change Index

This index records intended ownership and likely touch points before implementation begins. Paths and filenames are guidance rather than contracts; implementation may reorganize them while preserving dependency direction, behavior, and test coverage.

| Current file | Required change | Target phase |
|---|---|---:|
| `server/src/server.ts` | Remove inline lifecycle/feature/custom-request bodies; retain startup and calls to runtime/registration factories | 4-9 |
| `server/src/logger.ts` | Make `Logger` implement `ServiceLogger`; connection routing belongs in the production adapter rather than feature code | 1 |
| `server/src/docManager.ts` | Decompose into `DocumentStateStore`, `IncludeGraphManager`, and `WorkspaceScanner`; remove `Connection` storage and document event registration; inject diagnostics/events/file/scheduler collaborators | 3 |
| `server/src/features/completion/index.ts` | Replace `registerCompletion` with `CompletionService`; retain barrel exports | 5 |
| `server/src/features/completion/providers/pathProvider.ts` | Replace direct Node filesystem calls with `FileAccess` | 2/5 |
| `server/src/features/references.ts` | Replace raw document collection and disk fallback with context/loader services | 2/6 |
| `server/src/features/rename.ts` | Replace direct encoded file reads and temporary document construction with `DocumentLoader` | 2/6 |
| `server/src/features/workspaceSymbol.ts` | Use `DocumentLoader` for symbol range conversion | 2/6 |
| `server/src/features/codeLens.ts` | Resolve lens position through shared document context | 2/4 |
| `server/src/features/documentLinks.ts` | Replace `resolveIncludePath` import from `server.ts` with `IncludePathResolver` | 2/4 |
| `server/src/features/xmlGenerator.ts` | Read included files through `FileAccess` | 2/8 |
| `server/src/utils/settingsManager.ts` | Remain the settings-value store unless lifecycle extraction shows state that belongs in `WorkspaceLifecycleService`; no connection dependency is added | 7 |
| `server/src/__tests__/test-setup.ts` | Stop acting as a global server environment; retain only narrowly shared immutable metadata helpers, then migrate them into harness metadata fixtures | 1/5 |
| `server/src/__tests__/features/completion/basic.test.ts` | Remove fake connection/callback capture and call `harness.complete`/`resolveCompletion` | 5 |
| `server/src/__tests__/features/completion/tdl_completion.test.ts` | Replace registration callback flow with full service flow | 5 |
| `server/src/__tests__/features/completion/autocompleteIsolation.test.ts` | Replace mock connection/documents DocManager construction with harness | 5 |
| `server/src/__tests__/features/xml/suggestion.test.ts` | Replace repeated custom connection/document mocks with XML harness fixtures | 5 |
| `server/src/__tests__/features/xml/schemaCompletion.test.ts` | Request completion from the real service/runtime | 5 |
| `server/src/__tests__/features/xml/reference.test.ts` | Replace mock connection and manual DocManager construction with harness | 6 |
| `server/src/__tests__/features/codeLens.test.ts` | Replace direct DocManager usage with harness document-feature calls | 4 |
| `server/src/__tests__/features/codeActions.test.ts` | Replace direct DocManager usage with harness document-feature calls | 4 |
| `server/src/__tests__/features/documentHighlight.test.ts` | Replace direct DocManager usage with harness navigation calls | 6 |
| `server/src/__tests__/features/workspaceSymbol.test.ts` | Replace direct DocManager usage with harness navigation calls | 6 |
| `server/src/__tests__/features/onDefinitionMultiple.test.ts` | Delete simulated resolver algorithm and call `navigation.definition` | 6 |
| `server/src/__tests__/semantics/docManager.indexing.test.ts` | Construct the harness/lifecycle service rather than a connection mock; adapt to decomposed state store | 3 |
| `server/src/__tests__/semantics/workspaceScan.test.ts` | Use workspace fixture and injected file/client adapters; use `WorkspaceScanner` | 3/7 |
| `server/src/__tests__/semantics/workspacePartitioning.test.ts` | Use workspace fixture; remove private connection/document mocks; use `IncludeGraphManager` | 3/7 |
| `server/src/__tests__/semantics/scopeViewer.test.ts` | Review during Phase 8; may remain as pure test or migrate to harness custom-request calls | 8 |
| `server/src/__tests__/features/activeUrisIpc.test.ts` | Assert the shared test gateway's typed notification record | 3/8 |

## 15. Concrete Output of Each Phase

| Phase | Production output | Test output |
|---:|---|---|
| 1 | Ports, production adapters, runtime factory, capability/custom protocol modules | Harness can construct/dispose runtime |
| 2 | Context resolver, document loader, include resolver, encoded file adapter | Document/path/encoding tests |
| 3 | `DocumentStateStore`, `IncludeGraphManager`, `WorkspaceScanner` replacing `DocManager`; connection-free; explicit lifecycle service | Open/change/debounce/close/reindex tests; state store/graph/scanner unit tests |
| 4 | Individual document-feature handlers plus shared context wrapper; callbacks reduced to delegation | Harness/service integration tests for every migrated endpoint |
| 5 | Full `CompletionService`; no `registerCompletion` business logic | Full-cycle TDL/XML completion and resolve tests |
| 6 | `NavigationService`; definition body removed from `server.ts` | Real duplicates/modifiers/includes/closed-file tests |
| 7 | `WorkspaceLifecycleService`; globals removed from `server.ts` | Initialization/folder/settings/metadata tests |
| 8 | Granular custom-request handlers, typed runtime function map, and typed custom protocol | Scope/XML/cache/notification tests |
| 9 | One centralized registration module and minimal `server.ts` | Registration contract tests |
| 10 (deferred) | No output in the current round | Future JSON-RPC and VS Code E2E work only after separate approval |
