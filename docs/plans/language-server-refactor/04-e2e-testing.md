# Two-Tier End-to-End Testing Plan

> [!IMPORTANT]
> **Status: pending/deferred.** Both E2E tiers are outside the current language-server refactor scope. This document is retained unchanged as a future implementation reference; its requirements do not gate Phases 1–9 or current acceptance.
>
> During the current round, do not create `server/vitest.e2e.config.ts`, `server/src/__tests__/e2e/`, or `e2e/vscode/`; do not add `test:e2e:*` scripts, E2E dependencies, or Extension Host CI infrastructure. `ServerTestHarness` is the primary testing mechanism.

## 1. Objective

Add two complementary E2E tiers:

1. in-process LSP/JSON-RPC tests that exercise real protocol serialization, handler registration, document notifications, and service composition quickly;
2. real VS Code Extension Host tests that verify extension activation, language-client startup, server bundling, document synchronization, and user-visible language features.

Neither tier replaces service integration tests. The test pyramid is:

```text
many pure unit tests
many ServerTestHarness service tests
focused in-process LSP/JSON-RPC E2E tests
small VS Code Extension Host smoke suite
```

## 2. Current Build and Client Integration Points

The E2E design uses the repository’s current production path:

- root `esbuild.js` bundles `server/src/server.ts` to `dist/server.js`;
- `client/src/extension.ts` creates `LanguageClient` instances in `startClient` using the bundled server module;
- the extension supports multi-root clients and selects TDL/XML documents through its existing client options;
- root `package.json` currently runs Vitest projects for server, client, and webview but has no E2E scripts;
- `server/package.json` has Vitest and coverage scripts but no JSON-RPC E2E configuration;
- the extension engine minimum is VS Code `1.96.0`.

Tier one tests the runtime/registration path before bundling. Tier two runs root `npm run compile`, loads the extension from the repository root, and therefore covers the actual `dist/extension` and `dist/server.js` artifacts.

## 3. Tier One: In-Process LSP/JSON-RPC

### 3.1 Coverage Boundary

This tier validates:

- JSON-RPC request/response and notification flow;
- LSP parameter/result serialization;
- handler registration;
- initialize/initialized/shutdown sequencing;
- text-document synchronization into `TextDocuments`;
- runtime creation and disposal;
- standard and custom method names;
- server-to-client diagnostics and notifications.

It does not launch VS Code and does not validate extension activation or VS Code command wiring.

### 3.2 Files to Add

```text
server/src/__tests__/e2e/lsp/
  lspTestClient.ts
  lspTestServer.ts
  lifecycle.e2e.test.ts
  completion.e2e.test.ts
  navigation.e2e.test.ts
  diagnostics.e2e.test.ts
  customProtocol.e2e.test.ts
  fixtures/
server/vitest.e2e.config.ts
```

`server/vitest.e2e.config.ts` includes only `server/src/__tests__/e2e/lsp/**/*.e2e.test.ts`, uses the existing test setup only where real metadata is requested, and runs sessions serially if shared process resources make concurrency unsafe.

### 3.3 Transport

Create paired in-memory Node streams. The server side uses the actual `vscode-languageserver` connection and `TextDocuments`; the client side uses `vscode-jsonrpc` message connection.

Both sides must pass through JSON-RPC framing and serialization. Calling registered callbacks directly does not qualify as E2E.

If `vscode-jsonrpc` is imported directly, add it as an explicit server development dependency rather than relying on a transitive dependency.

### 3.4 Server Construction

Expose a transport-neutral startup function:

```ts
function startLanguageServer(options: {
    connection: Connection;
    documents: TextDocuments<TextDocument>;
    dependencies?: Partial<ServerRuntimeDependencies>;
}): RunningLanguageServer;
```

Production calls it with the stdio connection. Protocol tests call it with the in-memory connection. Both paths use `createServerRuntime` and `registerLspHandlers`.

`RunningLanguageServer.dispose()` must unregister/dispose runtime resources and stop both message connections.

### 3.5 LSP Test Client API

Provide a reusable client helper:

```ts
const session = await createLspTestSession({
    files,
    workspaceFolders,
    metadata: 'minimal' | 'real'
});

await session.initialize();
await session.openDocument(document);
const completion = await session.requestCompletion(uri, position);
await session.shutdown();
```

The helper must support:

- requests with timeouts and actionable failure messages;
- notifications;
- diagnostics collection by URI/version;
- server custom notifications;
- client responses for configuration and workspace-folder requests;
- orderly initialize, shutdown, exit, and forced cleanup after failure.

### 3.6 Required Protocol Scenarios

#### Lifecycle

- initialize returns all existing capabilities and trigger characters;
- initialized loads configuration/metadata and scans supplied workspace folders;
- shutdown and exit release pending work;
- invalid request order receives protocol-appropriate handling.

#### Document synchronization

- `didOpen` produces parsed state and diagnostics;
- incremental/full content changes reach the latest document version;
- `didClose` clears diagnostics and follows close/reindex behavior;
- two open documents remain isolated.

#### Completion

- open a TDL document and request full completion through `textDocument/completion`;
- request XML completion;
- resolve one function or attribute item;
- verify a completion path that depends on real parsed state and metadata.

#### Navigation

- cross-file definition through an include graph;
- duplicate/modifier locations;
- references across open and closed files.

#### Diagnostics and semantic tokens

- malformed text publishes diagnostics;
- corrected text updates/clears them;
- semantic full and delta requests return serializable results.

#### Custom protocol

- one scope-tree request;
- TDL-to-XML conversion;
- active-URI notification;
- cache generation failure mapped to the expected client message.

### 3.7 Metadata Policy

Most protocol tests use deterministic minimal metadata injected through runtime dependencies. One completion/hover smoke test uses bundled real metadata to catch production-loader integration problems.

### 3.8 Reliability Rules

- Never use fixed sleeps.
- Await a specific response, diagnostic version, notification, or deterministic runtime-ready signal.
- Every request has a bounded timeout.
- Each test owns one isolated session.
- `afterEach` forcibly disposes a failed session.
- Message traces are attached only on failure.

## 4. Tier Two: VS Code Extension Host

### 4.1 Coverage Boundary

This tier validates the environment a user actually runs:

- extension discovery and activation;
- compiled/bundled client and server entrypoints;
- `LanguageClient` startup and selector configuration;
- stdio/IPC transport selected by the extension;
- VS Code document synchronization;
- built-in provider commands returning server results;
- diagnostics appearing in VS Code;
- selected custom commands/requests;
- clean extension deactivation.

It must not require a running Tally executable or external service.

### 4.2 Dependencies and Runner

Add explicit development dependencies:

- `@vscode/test-electron`;
- `mocha` if the Extension Host suite uses the conventional Mocha runner;
- matching types where required.

Pin the minimum supported VS Code version (`1.96.0`, matching the extension engine) for deterministic required CI. A separate scheduled compatibility job may test the current stable version.

### 4.3 Files to Add

```text
e2e/vscode/
  runTest.ts
  suite/
    index.ts
    activation.test.ts
    languageFeatures.test.ts
    diagnostics.test.ts
    customCommands.test.ts
    helpers/
      vscodeTestHarness.ts
      waitFor.ts
      fixtureWorkspace.ts
  fixtures/
    workspace.code-workspace
    project/
      main.tdl
      included.tdl
      sample.tdlxml
  tsconfig.json
```

Generated output belongs under the build output or temporary directories and must be ignored by Git.

### 4.4 Build and Scripts

Add scripts with clear responsibilities:

```json
{
  "test:e2e:lsp": "vitest run --config server/vitest.e2e.config.ts",
  "test:e2e:vscode:compile": "npm run compile && tsc -p e2e/vscode/tsconfig.json",
  "test:e2e:vscode": "npm run test:e2e:vscode:compile && node e2e/vscode/out/runTest.js",
  "test:e2e": "npm run test:e2e:lsp && npm run test:e2e:vscode"
}
```

The VS Code suite must test the compiled/bundled artifacts, not TypeScript source imported directly.

`runTest.ts` resolves the repository root as `extensionDevelopmentPath`, resolves the compiled suite entry as `extensionTestsPath`, passes the copied fixture workspace as a launch argument, disables unrelated extensions, and pins the VS Code download version through a constant or `VSCODE_E2E_VERSION` defaulting to `1.96.0`.

### 4.5 VS Code Test Harness

Provide a helper for:

- locating fixture URIs;
- opening and closing editors;
- applying text changes;
- executing built-in provider commands;
- waiting for specific diagnostics without sleeps;
- waiting for extension activation and provider readiness;
- restoring fixture contents after each test;
- collecting extension-host logs on failure.

Do not add a production-only “test ready” protocol unless polling observable provider behavior proves insufficient. Prefer waiting for extension activation and a bounded provider request that demonstrates readiness.

### 4.6 Required Extension Host Scenarios

#### Activation and startup

- open the fixture workspace and a `.tdl` document;
- verify the extension activates;
- verify a language provider responds, proving the client and bundled server started;
- verify an XML fixture is covered by the configured selector.

#### Completion

- invoke `vscode.executeCompletionItemProvider` at a marker in a TDL document;
- assert selected expected labels and insertion data;
- repeat for TDL XML;
- ensure the result comes after real document synchronization, not static fixture inspection.

#### Hover and definition

- invoke the VS Code hover provider and assert meaningful markdown content;
- invoke the definition provider on a cross-file reference and assert the included-file URI/range.

#### Diagnostics

- introduce a known parse/validation error through a `WorkspaceEdit`;
- wait for the expected diagnostic code;
- correct the text and wait for diagnostic removal.

#### Workspace behavior

- verify symbols from an included closed file are available;
- verify a watched-file deletion/change scenario if it can be made reliable across CI platforms;
- keep multi-root coverage in protocol/service tests unless a specific client regression requires it here.

#### Custom integration

- invoke one safe custom command backed by a server request, preferably XML conversion or scope inspection;
- assert its observable result without opening interactive UI.

### 4.7 Fixture Isolation

Treat committed fixtures as immutable templates. Before the suite:

1. copy the fixture workspace to a unique temporary directory;
2. launch VS Code against the copy;
3. modify only the copy;
4. close documents and delete the temporary workspace after completion.

Do not run tests against the repository’s real source files.

### 4.8 Extension Host Reliability

- Run tests serially unless isolation is proven.
- Use bounded polling of observable VS Code state; no fixed startup sleeps.
- Close all documents and editors between tests.
- Disable unrelated installed extensions using the test runner’s isolated environment.
- Capture Extension Host and language-client/server logs on failure.
- Use a generous suite timeout but short operation-specific timeouts.
- Retry only the readiness probe, never the assertion or entire test.

## 5. CI Plan

### Pull requests

- Run service/unit tests and in-process LSP E2E tests on every pull request.
- Build the extension and run the VS Code Extension Host smoke suite on Ubuntu using `xvfb-run`.
- Cache the downloaded pinned VS Code build and package manager dependencies.

### Main branch or scheduled job

- Run the VS Code suite on Windows to cover native path/URI behavior.
- Optionally run against current VS Code stable in addition to pinned minimum.

### Failure artifacts

Upload:

- JSON-RPC trace for failed protocol tests;
- Extension Host logs;
- language-client/server output;
- fixture workspace copy when safe and useful;
- test result reports.

## 6. Ownership Between Test Tiers

| Concern | Service harness | LSP JSON-RPC | VS Code Host |
|---|---:|---:|---:|
| Provider branch coverage | Primary | Sample | No |
| Document lifecycle behavior | Primary | Required | Smoke |
| Handler registration | No | Primary | Indirect |
| JSON-RPC serialization | No | Primary | Indirect |
| Extension activation | No | No | Primary |
| Bundled server startup | No | No | Primary |
| VS Code diagnostics UI state | No | No | Primary |
| Metadata breadth | Selected | One real smoke | One real smoke |

## 7. Exact First Test Set

The initial E2E implementation is complete only when these tests exist:

### LSP JSON-RPC

1. `lifecycle.e2e.test.ts`: initialize capabilities, initialized, open/change/close, shutdown.
2. `completion.e2e.test.ts`: TDL completion, XML completion, completion resolve, one real-metadata completion.
3. `navigation.e2e.test.ts`: include-based cross-file definition and references into a closed file.
4. `diagnostics.e2e.test.ts`: publish an error, change the document, observe its removal, request semantic full/delta.
5. `customProtocol.e2e.test.ts`: scope request, XML conversion, and active-URI notification.

### VS Code Extension Host

1. `activation.test.ts`: opening `main.tdl` activates the extension and yields a provider response.
2. `languageFeatures.test.ts`: TDL/XML completion plus cross-file definition and hover.
3. `diagnostics.test.ts`: edit fixture, observe diagnostic, fix fixture, observe removal.
4. `customCommands.test.ts`: exercise one non-interactive command backed by a server request.

Broader branch coverage stays in `ServerTestHarness` tests; it is not duplicated in Extension Host tests.

## 8. Completion Criteria

- Both tiers are independently runnable.
- Protocol tests use real JSON-RPC framing and centralized handler registration.
- VS Code tests execute compiled extension artifacts in an isolated Extension Host.
- No E2E test uses arbitrary sleeps.
- Failures retain enough logs to diagnose client, transport, server, or feature-layer faults.
- The total VS Code smoke suite remains intentionally small and stable.
