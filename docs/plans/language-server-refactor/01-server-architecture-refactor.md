# Server Architecture Refactor

## 1. Objective

Move all language-server behavior out of LSP registration callbacks and into directly callable services. The production LSP adapter and tests must call the same service methods.

The completed architecture must:

- preserve the current wire protocol and feature behavior;
- support TDL and XML documents through the same service composition used in production;
- make all feature orchestration testable without VS Code or callback capture;
- remove repeated document, parsed-state, scope, filesystem, range, logging, and error-handling code;
- isolate connection, client-notification, configuration, and workspace APIs behind adapters;
- leave a transport-neutral composition seam that a future JSON-RPC client or VS Code Extension Host suite can exercise without another architecture rewrite.

## 2. Concrete Problems Being Fixed

### `server/src/server.ts`

The file currently combines six responsibilities that will be separated:

1. process startup (`createConnection`, `listen`);
2. dependency construction (`TextDocuments`, `DocManager`, logger connection);
3. server lifecycle state (`initParams`, `globalWorkspaceFolders`, workspace capability, target version);
4. metadata/configuration/workspace orchestration;
5. feature request implementation;
6. LSP/custom protocol registration.

After the refactor, it will retain only responsibilities 1 and 2 plus calls to the runtime and registration factories.

### `server/src/features/completion/index.ts`

`registerCompletion` currently mixes registration, context calculation, provider dispatch, file-path I/O, project/scope resolution, and completion-item resolution. The callback body moves unchanged into `CompletionService.complete`; resolution moves into `CompletionService.resolve`. The file becomes a feature barrel exporting the service, providers, analyzers, and utilities. It no longer imports `Connection` or `TextDocuments`.

### `server/src/docManager.ts`

The constructor currently registers `onDidOpen`, `onDidChangeContent`, and `onDidClose`; it also stores a `Connection` used for diagnostics and notifications. These callbacks move into `DocumentLifecycleService`. Calls to `connection.sendDiagnostics` become `DiagnosticPublisher.publish`, and `sendNotification('tdl/activeUrisChanged', ...)` becomes `ClientGateway.notify` through an injected publisher.

### Feature modules with server-environment coupling

- `features/references.ts` keeps reference algorithms but receives a `DocumentLoader`/context service instead of raw document collections.
- `features/rename.ts` keeps rename-edit calculation but stops reading closed files directly.
- `features/workspaceSymbol.ts` uses the shared document loader for range mapping.
- `features/codeLens.ts` uses the shared context resolver during lens resolution.
- `features/completion/providers/pathProvider.ts` receives `FileAccess` instead of importing Node `fs` directly.
- `features/xmlGenerator.ts` receives `FileAccess` for included-file reads.

Pure AST, parser, scope, validation, formatting, hover-formatting, context-analysis, and completion-provider logic does not become connection-aware and is not rewritten merely to fit a class structure.

## 3. Target Dependency Direction

```text
server.ts
  -> createServerRuntime
  -> registerLspHandlers
       -> language services
            -> document context and shared application services
                 -> DocManager / scope managers / parsers / providers
                 -> dependency interfaces
                      <- production LSP and Node adapters
                      <- test harness adapters
```

Dependencies must point inward. A feature provider must not import the registration adapter or production connection. `server.ts` must not contain feature decisions.

## 4. Suggested Module Organization

The following layout is implementation guidance so production code and tests share one vocabulary. Exact paths, filenames, and grouping may change during implementation when the resulting structure is more cohesive. The contracts are the dependency direction in section 3, no `Connection` dependency in feature logic, directly callable production behavior, and shared production/test composition.

```text
server/src/
  server.ts
  runtime/
    createServerRuntime.ts
    serverRuntime.ts
  protocol/
    registerLspHandlers.ts
    capabilities.ts
    customProtocol.ts
    requestGuard.ts
  services/
    completionService.ts
    navigationService.ts
    documentLifecycleService.ts
    workspaceLifecycleService.ts
    documentContextResolver.ts
    documentLoader.ts
    includePathResolver.ts
  handlers/
    documentFeatures/
    customRequests/
  ports/
    documentRepository.ts
    clientGateway.ts
    diagnosticPublisher.ts
    fileAccess.ts
    scheduler.ts
    serviceLogger.ts
  adapters/
    lspDocumentRepository.ts
    lspClientGateway.ts
    nodeFileAccess.ts
    nodeScheduler.ts
```

Existing parsers, AST utilities, providers, validation logic, scope managers, and pure feature functions remain in their current feature/core locations unless moving them is necessary to break an invalid dependency.

## 5. Dependency Interfaces

### 5.1 DocumentRepository

Owns access to open LSP documents without exposing handler registration.

```ts
interface DocumentRepository {
    get(uri: string): TextDocument | undefined;
    all(): readonly TextDocument[];
}
```

The production adapter wraps `TextDocuments<TextDocument>`. The test adapter stores documents in memory. Document lifecycle events are passed explicitly to `DocumentLifecycleService`; they are not part of this read interface.

### 5.2 ClientGateway

Contains all server-to-client effects currently performed through `Connection`.

```ts
interface ClientGateway {
    notify<T>(method: string, params: T): void;
    showInformationMessage(message: string): void;
    showErrorMessage(message: string): void;
    refreshSemanticTokens(): Promise<void> | void;
    getConfiguration<T>(section: string): Promise<T | undefined>;
    getWorkspaceFolders(): Promise<WorkspaceFolder[] | null>;
}
```

Feature services receive this gateway only when they genuinely produce client effects. Read-only feature requests must not depend on it.

### 5.3 DiagnosticPublisher

Owns only diagnostic publication:

```ts
interface DiagnosticPublisher {
    publish(uri: string, diagnostics: Diagnostic[]): void;
}
```

`DocManager` depends on this interface. Production delegates to `connection.sendDiagnostics`; the test implementation records the latest and historical diagnostics by URI.

### 5.4 FileAccess

Centralizes filesystem operations needed by workspace indexing, include resolution, path completion, closed-document loading, rename, references, symbols, XML conversion, and cache generation.

The interface exposes intent-level operations for existence checks, encoded text reading, directory reading, stat information, and canonical paths. Production uses Node. Tests use an in-memory filesystem or a temporary-directory adapter when native path behavior is under test.

### 5.5 Scheduler

Controls debounce and deferred work. Production uses Node timers. Tests use a deterministic scheduler and explicitly flush queued work.

### 5.6 ServiceLogger

Provides `error`, `warn`, `info`, `debug`, and `trace`. Production routes through the LSP console adapter. Tests collect entries and remain quiet unless an assertion fails.

The current singleton may remain as a compatibility export during migration, but services must receive a logger through runtime dependencies.

## 6. Shared Application Services

### 6.1 DocumentContextResolver

Eliminates repeated combinations of document lookup, parsed-state lookup, source-file checks, URI normalization, scope-manager selection, position-to-offset conversion, and project-node resolution.

It exposes explicit methods rather than one option-heavy method:

```ts
resolveOpen(uri: string): OpenDocumentContext | undefined;
resolveParsed(uri: string): ParsedDocumentContext | undefined;
resolveAtPosition(uri: string, position: Position): PositionedDocumentContext | undefined;
```

Each service remains responsible for returning its protocol-defined fallback when resolution fails.

### 6.2 DocumentLoader

Returns an open document when available and otherwise reads it through `FileAccess`, detects the appropriate language identifier, and creates a temporary `TextDocument`.

Definition, references, rename, workspace symbols, and code-lens resolution use this service. They must not duplicate disk fallback or encoding logic.

### 6.3 IncludePathResolver

Owns workspace roots and resolves includes in this order:

1. relative to the current file;
2. relative to each active workspace root.

It uses `FileAccess`, returns canonical paths when possible, and has no dependency on global variables.

### 6.4 Request guard function

The registration adapter uses one small wrapper function for tracing, exception logging, and protocol-safe fallback values. It is not a class, configurable framework, or dependency container. The fallback remains endpoint-specific and must preserve current behavior; business logic must not be hidden in the wrapper.

An illustrative shape is:

```ts
function guardRequest<P, R>(
    logger: ServiceLogger,
    fallback: R,
    handler: (params: P) => R | Promise<R>
): (params: P) => Promise<R>;
```

## 7. Document and Workspace Lifecycle

### 7.1 DocManager changes

`DocManager` remains operational during Phase 1–2 but is decomposed in Phase 3 alongside the `Connection` decoupling. Performing both changes in one phase avoids a second rewiring pass after services are already built.

Its constructor must no longer accept an LSP `Connection`, register document callbacks, or directly call `sendDiagnostics` or `sendNotification`. Diagnostics and active-URI effects use injected publishers. Document open/change/close behavior becomes explicit callable operations coordinated by `DocumentLifecycleService`.

Phase 3 splits the current ~921-line class into three focused components:

- **`DocumentStateStore`** — owns the `docs` and `indexedDocs` maps, `get()`, `getOpen()`, `getIndexed()`, `set()`, `delete()`, scope manager access (`getScopeManager()`), and the `isMetadataLoaded` flag. This is the read/write interface that most services depend on.
- **`IncludeGraphManager`** — owns `includeGraph`, `parentGraph`, `projectNodesCache`, `tpjFiles`, `getProjectNodes()`, `isUriActive()`, active/inactive URI tracking, `getChildren()`, `getParent()`, and `findRootFile()`. Navigation and lifecycle services depend on this; completion does not.
- **`WorkspaceScanner`** — owns `scanWorkspaceFolders()`, `scanDirectory()`, `indexFile()`, `revalidateAll()`, `clearFolderSymbols()`, `setExcludePaths()`, workspace folder state, and the scan queue. Only `WorkspaceLifecycleService` (Phase 7) depends on this directly.

Services built in Phases 4–8 receive only the component they need rather than the entire former `DocManager`. This keeps dependency lists honest and avoids rewiring later.

### 7.2 DocumentLifecycleService

Responsibilities:

- open: remove stale indexed state and rebuild immediately;
- change: cancel the prior document timer and schedule a rebuild;
- close: remove open state, clear references, re-index from disk, remove the file scope, and clear diagnostics;
- dispose: cancel all outstanding scheduled work.

The debounce delay remains unchanged. Tests flush the deterministic scheduler instead of waiting.

### 7.3 WorkspaceLifecycleService

Owns initialization parameters, client workspace-folder capability, current target version, active workspace folders, and initialization completion state.

It produces the existing initialization result; loads configuration, metadata, exclusions, and external libraries; resolves initial workspace folders using the current precedence; handles added/removed folders and deleted files; reloads metadata after target-version changes; revalidates documents; and refreshes semantic tokens at the current lifecycle points.

## 8. Feature Services and Handlers

### 8.1 CompletionService

```ts
complete(params: CompletionParams, token?: CancellationToken): Promise<CompletionList>;
resolve(item: CompletionItem): CompletionItem;
```

`complete` owns the complete production path: document and scope resolution, offset and cursor text, parsed state/current definition, TDL/XML context detection, trailing-colon detection, provider dispatch, and final list construction.

The current providers and context analyzers remain directly unit-testable. `registerCompletion` is removed after tests and registration use `CompletionService`.

### 8.2 NavigationService

Public methods cover definition, references, prepare rename, rename, document highlights, and workspace symbols.

Definition behavior moved from `server.ts` includes reference detection, include navigation, scope/project resolution, duplicate and modifier filtering, metadata exclusion, base-TDL virtual locations, and open/closed target range conversion.

### 8.3 Individual document-feature handlers

Document symbols, hover, folding, signature help, inlay hints, code lens/resolve, semantic tokens full/delta, formatting/on-type formatting, document links, and code actions remain individual handler functions. They do not become a 14-method `DocumentFeatureService` class because they share no cohesive state or behavior beyond document-context lookup.

Each handler receives `DocumentContextResolver` and only the additional provider/collaborators it needs. Repeated document and parsed-state preambles are removed with a shared higher-order function:

```ts
function withDocContext<
    P extends { textDocument: { uri: string } },
    R
>(
    resolver: DocumentContextResolver,
    fallback: R,
    handler: (ctx: ParsedDocumentContext, params: P) => R
): (params: P) => R;
```

Use a promise-aware overload or equivalent wrapper for asynchronous providers. Handlers whose inputs do not carry `textDocument.uri`, such as code-lens resolution when the URI is stored in lens data, resolve their context directly through the same resolver. Every handler preserves its current missing-document, missing-AST, cancellation, and fallback behavior.

The runtime may expose these functions under a `documentFeatures` object for convenient registration and harness calls. That object is a typed function map, not a class or a new business-logic layer.

### 8.4 Individual custom-request handlers

Scope tree serialization, scope children/node/symbols, global-symbol resolution, TDL-to-XML conversion, and custom-library cache generation should default to individual handler functions. A narrow group may be introduced where functions genuinely share invariants or lifecycle, but a `CustomRequestService` class must not be created merely to collect unrelated custom methods.

Use implementation judgment after extraction: keep scope-viewer operations together only if their shared traversal/pagination behavior warrants it; keep XML conversion and cache generation separate unless a real cohesive dependency emerges. Method names and payloads remain centralized as typed constants in `customProtocol.ts` without changing the wire protocol.

The runtime may expose a `customRequests` typed function map so the registration adapter and harness have one stable access point.

### 8.5 Dependency summary

| Component | Required collaborators |
|---|---|
| `CompletionService` | `DocumentContextResolver`, `DocumentStateStore`, `FileAccess` for path completion, logger |
| `NavigationService` | `DocumentContextResolver`, `DocumentLoader`, `IncludePathResolver`, `DocumentStateStore`, `IncludeGraphManager`, logger |
| Individual document-feature handlers | `DocumentContextResolver` plus only the provider, loader, state store, logger, or cancellation support needed by that endpoint |
| `DocumentLifecycleService` | mutable test/production document repository adapter, `DocumentStateStore`, `IncludeGraphManager`, `Scheduler`, diagnostics publisher, logger |
| `WorkspaceLifecycleService` | `DocumentStateStore`, `WorkspaceScanner`, `IncludeGraphManager`, document repository, client gateway, metadata/external-library loaders, include resolver, logger |
| Individual custom-request handlers | Only the resolver, state store, include graph, XML generator, cache builder, client gateway, or logger required by that request |

Cohesive services receive collaborators in constructors. Individual handlers receive them through small factories or closures. Neither form constructs production adapters internally.

## 9. Runtime Composition

`createServerRuntime` receives production or test dependencies and returns all constructed services plus lifecycle disposal.

```ts
interface ServerRuntimeDependencies {
    documents: DocumentRepository;
    client: ClientGateway;
    diagnostics: DiagnosticPublisher;
    files: FileAccess;
    scheduler: Scheduler;
    logger: ServiceLogger;
    metadataLoader: MetadataLoader;
    externalLibraryLoader: ExternalLibraryLoader;
    cacheBuilder: CustomLibraryCacheBuilder;
}
```

Production dependencies are assembled in `runtime/createServerRuntime.ts`. Tests use the standard adapters in `server/src/__tests__/harness` and override only the collaborator relevant to the scenario.

```ts
interface ServerRuntime {
    completion: CompletionService;
    navigation: NavigationService;
    documentFeatures: DocumentFeatureHandlers;
    documentLifecycle: DocumentLifecycleService;
    workspaceLifecycle: WorkspaceLifecycleService;
    customRequests: CustomRequestHandlers;
    dispose(): Promise<void> | void;
}
```

Construction order is dependency adapters, scope/document state, shared application services, feature/lifecycle services, then runtime facade. No service may fetch a hidden global connection or document collection.

## 10. LSP Registration Adapter

`registerLspHandlers` registers every standard handler, custom request, notification, workspace listener, configuration listener, and document lifecycle event.

Callbacks contain delegation only:

```ts
connection.onCompletion((params, token) => runtime.completion.complete(params, token));
connection.onCompletionResolve(item => runtime.completion.resolve(item));
```

Registration returns a disposable where supported. Capabilities move to a named constant or builder and remain equivalent to the current response.

The final `server/src/server.ts` has this shape:

```ts
const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
const runtime = createServerRuntime(createProductionDependencies(connection, documents));

registerLspHandlers(connection, documents, runtime);
documents.listen(connection);
connection.listen();
```

Shutdown/disposal registration may add one line, but feature imports and feature-specific branching do not return to this file.

## 11. Compatibility and Error Policy

- No standard or custom method is renamed.
- No request or notification payload changes.
- Existing trigger characters and capability flags remain.
- Existing endpoint-specific empty and `null` fallbacks remain.
- Existing errors continue to be logged and converted to safe results where currently applicable.
- Cancellation tokens are forwarded to providers that support them.
- Unrelated correctness defects are recorded separately rather than silently changed.

## 12. Completion Criteria

- `server.ts` contains no feature logic.
- Feature services and handler functions can be constructed without a `Connection`.
- `DocManager` registers no LSP callbacks and sends no messages through a connection.
- Every current handler delegates to a directly callable service method or handler function.
- Callback-capture and simulated-handler tests have been replaced.
- The shared harness uses the same runtime factory as production, and that factory remains reusable by the deferred E2E tiers.
