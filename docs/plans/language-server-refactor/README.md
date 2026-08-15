# Language Server Refactor Plans

## Purpose

This folder contains the implementation plans for making the Tally TDL language server modular, directly testable, and independent of VS Code runtime APIs.

The refactor is behavior-preserving. Existing LSP capabilities, request names, notification names, payloads, completion results, diagnostics, and client behavior remain compatible unless a separate feature change is approved.

Standard Language Server Protocol types and `TextDocument` remain valid service inputs and outputs. The dependency being removed is the direct use of `Connection`, handler registration callbacks, VS Code extension APIs, and global transport state inside feature logic.

## Current Repository State

This plan is based on the current implementation, specifically:

- `server/src/server.ts` creates the connection, creates `TextDocuments`, creates `DocManager`, stores initialization/workspace/version state, implements most handlers inline, registers custom requests, starts document listening, and starts the connection.
- `server/src/features/completion/index.ts` is the only feature module that registers its own handlers. Its `registerCompletion` callback contains the complete completion orchestration and resolution logic.
- `server/src/docManager.ts` accepts `Connection` and `TextDocuments` in its constructor, subscribes to document events, publishes diagnostics, and emits `tdl/activeUrisChanged` directly.
- `server/src/features/references.ts`, `rename.ts`, `codeLens.ts`, and `workspaceSymbol.ts` accept `DocManager` plus document collections and duplicate parts of document lookup or closed-file handling.
- `server/src/server.ts`, `rename.ts`, and `references.ts` independently perform parts of open-versus-disk document resolution and range conversion.
- Completion tests in `server/src/__tests__/features/completion/basic.test.ts`, `tdl_completion.test.ts`, and XML suggestion/schema tests capture callbacks from fake connections.
- `server/src/__tests__/features/onDefinitionMultiple.test.ts` simulates handler logic rather than calling the production definition path.
- Several `DocManager` and XML/reference tests construct custom connection/document mocks because no standard server test environment exists.

The documents in this folder specify how those concrete problems are removed. They are not a request for another discovery or inventory phase.

## Plan Documents

1. [Server architecture refactor](./01-server-architecture-refactor.md)
   - Target architecture, service boundaries, dependency interfaces, handler mapping, error policy, and public APIs.
2. [Incremental migration](./02-incremental-migration.md)
   - Compile-safe implementation phases, migration order, compatibility rules, and per-phase exit criteria.
3. [Shared test harness](./03-shared-test-harness.md)
   - A reusable `ServerTestHarness` that replaces per-test connection, document, manager, and gateway mocks.
4. [Two-tier E2E testing](./04-e2e-testing.md) — **pending/deferred**
   - Future reference for in-process LSP/JSON-RPC tests and a small real VS Code Extension Host suite; neither tier is part of the current implementation scope.
5. [Acceptance and rollout](./05-acceptance-and-rollout.md)
   - Verification matrix, regression handling, documentation requirements, and final completion criteria.

## Intended Reading Order

Read the architecture plan first. Implement the migration and test-harness plans together, one feature slice at a time. The current effort ends after migration Phase 9 and the non-E2E acceptance checks. The E2E plan is retained for a separately approved future effort.

## Non-Goals

- Redesigning completion, navigation, validation, or scope semantics.
- Replacing LSP DTOs with custom domain DTOs.
- Changing existing custom protocol method names.
- Fixing unrelated feature defects discovered during the refactor.
- Making every pure provider a class.
- Requiring full metadata loading for every unit test.

## Architectural Rules

- `server.ts` is a composition and startup module only.
- Only the LSP adapter layer may register handlers or depend on `Connection`.
- Feature services and handler functions must be callable directly without registering callbacks.
- Side effects are accessed through explicit interfaces.
- Repeated document/state lookup and open-or-disk loading use shared services.
- Existing pure functions remain pure and are called by orchestration services.
- Tests use the shared harness unless a lower-level pure unit test needs no harness.
- New ad hoc connection and document-manager mocks are not permitted when the harness can represent the scenario.
- Proposed module paths and names are guidance that gives the plan a shared vocabulary, not fixed contracts. Implementation may reorganize them when a clearer structure emerges, provided dependency direction, behavior, testability, and the prohibition on `Connection` inside feature logic remain intact.

## Delivery Principle

The implementation is incremental but the target covers every standard handler, custom request, notification, and lifecycle callback currently registered in `server/src/server.ts` or registered indirectly by a feature module.

Completion of the current refactor is based on service/harness coverage and Phases 1–9. Deferred E2E work is not a completion gate.
