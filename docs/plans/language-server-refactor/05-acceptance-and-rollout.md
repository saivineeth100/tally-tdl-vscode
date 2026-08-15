# Acceptance and Rollout Plan

## 1. Purpose

Define when the refactor is complete and how regressions are distinguished from known pre-existing failures.

This repository currently has known failing tests, so “run the entire suite and require green” is not a sufficient regression rule. Each implementation slice must pass its new/migrated tests and type checking, then compare any remaining relevant failures with the failures recorded before that slice.

Current acceptance covers migration Phases 1–9 and uses `ServerTestHarness` as the primary integration mechanism. In-process JSON-RPC and VS Code Extension Host E2E testing are both deferred; neither is required for a slice or for final completion of this round.

## 2. Verification Matrix

Every row must have at least one service/harness-level test. The E2E columns preserve intended future coverage only; all entries in those columns are **deferred and non-blocking** for current acceptance. Registration behavior in the current round is covered by registration contract tests against the centralized adapter.

| Area | Service/harness (required now) | LSP E2E (deferred) | VS Code E2E (deferred) |
|---|---:|---:|---:|
| Initialize/initialized | Yes | Yes | Activation smoke |
| Document open/change/close | Yes | Yes | Diagnostics smoke |
| Completion/resolve | Yes | Yes | TDL and XML smoke |
| Hover | Yes | Sample | Smoke |
| Definition | Yes | Cross-file | Cross-file smoke |
| References/rename | Yes | Sample | Optional |
| Symbols/folding/signature/inlay | Yes | Registration sample | Optional |
| Code lens/actions/links/highlights | Yes | Registration sample | Optional |
| Semantic tokens full/delta | Yes | Yes | Indirect |
| Formatting/on-type formatting | Yes | Sample | Optional |
| Workspace symbols/folders/watchers | Yes | Yes | Minimal |
| Configuration/metadata reload | Yes | Yes | Startup path |
| Scope custom requests | Yes | Sample | Optional |
| XML conversion | Yes | Yes | One command/request |
| Cache generation | Yes | Failure mapping | No external Tally |
| Diagnostics/active URI notifications | Yes | Yes | Diagnostics smoke |

## 3. Regression Policy

- Before changing a feature slice, record its currently failing relevant tests.
- Do not disable, skip, weaken, or broadly update assertions to make the refactor pass.
- A failure introduced in a migrated path is a regression even if the full repository suite already contains unrelated failures.
- An unrelated pre-existing defect is documented with reproduction, expected behavior, current behavior, and affected test; it is not silently fixed within this refactor.
- A defect that prevents service extraction or deterministic testing may be fixed in the same slice, but must be isolated and explicitly described.

## 4. Per-Slice Acceptance Checklist

- Production callback delegates to the service with no feature logic.
- Service has no `Connection` dependency.
- Shared context/file/lifecycle helpers are used instead of duplicated code.
- Existing wire inputs, outputs, fallbacks, and error handling remain.
- Existing tests are migrated without algorithm duplication.
- New tests use `ServerTestHarness` rather than private server mocks.
- Pure function tests remain focused and fast.
- Type checking succeeds for affected workspaces.
- Targeted tests for the slice pass apart from recorded pre-existing failures.
- Documentation migration matrix is updated.

## 5. Required Commands

Use the repository’s existing scripts. For a normal feature slice, run:

```powershell
npm run typecheck
npm test -w server -- <migrated-test-files>
```

Run compilation when the slice changes composition, registration, packaging, or shared types:

```powershell
npm run compile
```

Before final rollout, run the broadest currently available checks:

```powershell
npm run typecheck
npm test -w server
npm run compile
```

Do not add or invoke `test:e2e:*` scripts during this round. The final full-test output may still contain documented unrelated failures. The implementation report must identify them by test name and show that all new/migrated tests passed.

## 6. Final Architecture Checks

Use static searches or lint restrictions to verify:

- `createConnection` appears only in the production entrypoint;
- `connection.on*` registration appears only in `registerLspHandlers`;
- services do not import `server.ts`;
- services do not access VS Code extension APIs;
- `DocManager` no longer exists as a monolithic class; its responsibilities are split into `DocumentStateStore`, `IncludeGraphManager`, and `WorkspaceScanner`;
- none of the decomposed components register events or hold a connection;
- no completion test captures an `onCompletion` callback;
- no feature test contains “simulate handler logic” equivalents;
- repeated open-or-disk document loading is removed from feature modules.

Concrete checks include:

```powershell
rg -n "createConnection" server/src
rg -n "connection\.on|languages\..*\.on" server/src
rg -n "registerCompletion" server/src
rg -n "sendDiagnostics|sendNotification" server/src/docManager.ts
rg -n "mockConnection|completionCallback|Simulate .*handler logic" server/src/__tests__
```

Expected outcomes:

- `createConnection` exists only in `server.ts`; deferred E2E transport setup does not exist in the current round;
- connection registration exists only in `protocol/registerLspHandlers.ts`;
- `registerCompletion` no longer exists;
- `DocManager` contains no direct diagnostic/notification transport calls;
- migrated tests contain none of the removed mock/callback/simulation patterns.

## 7. Performance Guardrails

The refactor must not materially degrade:

- initialization response time;
- completion latency;
- incremental rebuild debounce behavior;
- workspace scanning concurrency;
- metadata memory sharing between TDL and XML scope managers;
- semantic-token delta behavior.

Add coarse timing observations to focused integration tests only where stable. Do not add brittle millisecond assertions to CI. Compare representative workspace traces before and after the migration when changing lifecycle/indexing code.

## 8. Rollout Order

1. Merge dependency interfaces, adapters, runtime skeleton, and harness.
2. Merge document-context/file-access and lifecycle decoupling.
3. Merge document feature slices.
4. Merge completion.
5. Merge navigation.
6. Merge workspace lifecycle and custom requests.
7. Centralize registration and simplify `server.ts`.
8. Remove transitional compatibility exports after the corresponding slices are stable.

### Deferred follow-up

After this refactor is accepted, a separately approved effort may implement the retained E2E plan in this order:

1. add in-process LSP/JSON-RPC coverage;
2. stabilize it before making it a required check;
3. add the VS Code Extension Host smoke suite and its CI infrastructure.

None of these deferred steps blocks the current rollout.

## 9. Rollback Strategy

Each migration slice keeps protocol behavior stable and can be reverted independently. Do not combine feature behavior changes with architectural moves. Keep transitional delegates only until the corresponding service and tests are stable; do not maintain parallel implementations.

If the centralized registration cutover fails, revert registration to the prior delegates while keeping already stable services. If lifecycle extraction fails, revert only that phase because feature services depend on interfaces rather than the concrete event wiring.

## 10. Final Artifact Checklist

The completed refactor includes:

- `server/src/runtime/createServerRuntime.ts` and `serverRuntime.ts`;
- the required ports and production adapters, with final paths chosen during implementation;
- cohesive completion, navigation, and lifecycle services; individual document-feature and custom-request handlers; shared context/loading helpers; and `DocumentStateStore`, `IncludeGraphManager`, `WorkspaceScanner` replacing `DocManager`;
- `server/src/protocol/registerLspHandlers.ts`, capabilities, custom protocol types, and request guard;
- a minimal `server/src/server.ts`;
- `server/src/__tests__/harness/` with self-tests and reusable fixtures;
- migrated completion, navigation, lifecycle, XML, and custom-request tests;
- updated contributor/testing documentation pointing to the harness and current verification commands.

The current artifact checklist explicitly excludes `server/vitest.e2e.config.ts`, `server/src/__tests__/e2e/`, `e2e/vscode/`, `test:e2e:*` scripts, E2E-only dependencies, and Extension Host CI jobs. Those belong only to the deferred E2E effort.

## 11. Final Completion Criteria

- Every server handler and lifecycle callback is represented in the migration matrix and delegated to a directly callable service method or handler function.
- `server.ts` is a minimal startup/composition module.
- Production and `ServerTestHarness` tests use the same runtime factory.
- Shared test harness replaces repeated mocks and simulated handlers.
- Targeted service/harness tests cover all endpoints, including current fallback and error behavior.
- Registration contract tests cover centralized standard/custom method delegation.
- Phases 1–9 and all non-E2E verification requirements are complete; deferred E2E work is not a completion condition.
- Client/server protocol compatibility is unchanged.
- Known unrelated failures and defects are documented separately.
- Architecture, test commands, and contributor guidance are documented for future maintainers.
