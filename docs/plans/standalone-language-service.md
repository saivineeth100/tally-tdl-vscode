# Standalone Language-ID Support Plan

## Goal

Make `.tpj` optional for Tally TDL language features. Every open document whose
VS Code language ID is `tdl` or `xml` must receive language-server support,
whether it is a saved file, outside a workspace, untitled, unsaved, or assigned
one of those language IDs despite having a nonstandard extension.

## Current Problem

The extension only activates for XML, and its XML client selector is restricted
to `.xml` and `.tdlxml` file names. The server also derives a document's scope
manager from its URI extension in several paths. Finally, when the client has
no workspace folder, no initial scan runs and open documents can remain queued
without being parsed, validated, or made available to completion and navigation
requests.

## Intended Behavior

| Situation | Expected behavior |
| --- | --- |
| A workspace contains a `.tpj` | The `.tpj` root and include graph remain the active project authority. |
| A workspace folder has no `.tpj` | Each open TDL/XML document and its reachable include/import graph are active. |
| A saved file is opened outside a workspace | Start a client for its containing folder and provide normal features. |
| An untitled or unsaved TDL/XML buffer is opened | Start/use the default client and provide content-based features immediately after server initialization. |
| A nonstandard file is assigned `tdl` or `xml` | Use the assigned language ID, not the filename extension, to choose parser and scope. |

Filesystem-dependent behavior such as resolving an include relative to an
untitled buffer must fail gracefully until that buffer has a file path.

## Implementation Plan

### 1. Activate and select documents by language ID

- Add `onLanguage:tdl` alongside the existing XML activation event in the
  extension manifest.
- Keep `onLanguage:xml` and ensure the client starts for already-open matching
  documents after activation.
- Change folder-client selectors in `client/src/extension.ts` so both `tdl`
  and `xml` match all files beneath that client folder. Do not restrict XML to
  `.xml` or `.tdlxml` patterns.
- Retain the default client selectors for `untitled:` TDL/XML documents and
  the existing dynamic client creation for saved files outside a workspace.

### 2. Complete startup without a workspace scan

- Extract the common end-of-initial-scan work from `WorkspaceScanner`:
  process pending opens, revalidate open documents, publish active URI state,
  and refresh editor-facing features through the scan-complete callback.
- Add an explicit scanner completion method for the no-workspace case. It must
  mark the initial scan as started/completed before processing queued documents.
- In `WorkspaceLifecycleService.initialized`, invoke that completion method
  after metadata has loaded when neither workspace folders nor a root URI/root
  path are available.
- Keep the normal workspace scan flow unchanged except for reusing the common
  completion routine.

### 3. Make scope selection language-aware

- Extend `DocumentStateStore.getScopeManager` with an optional language-ID
  argument. Explicit `xml` selects the XML scope manager and explicit `tdl`
  selects the TDL scope manager.
- When no language ID is supplied, first use the tracked open document's
  language ID; retain extension-based detection only for closed, disk-scanned
  documents.
- Pass the live document language ID through document lifecycle parsing,
  validation, close/reindex handling, and document-context resolution.
- Update feature paths that resolve a scope by URI (completion, semantic
  tokens, code actions, navigation, references, rename, custom requests, and
  formatting-related context) to use the open document's language-aware scope
  selection.
- Keep workspace scanning extension-based because it only handles closed files
  from disk. Opening an otherwise unrecognized file with language ID `tdl` or
  `xml` must immediately override that fallback.

### 4. Preserve project activation semantics

- Do not change `.tpj` parsing or its root/include graph behavior.
- With no `.tpj`, continue using the active open-document roots and their
  ancestors/descendants to calculate project membership and diagnostics.
- Ensure the no-workspace completion path triggers the same active-URI update
  as a completed workspace scan.

## Regression Tests

Use `ServerTestHarness` and the shared in-memory adapters for all server tests;
do not introduce ad-hoc connection, document, or filesystem mocks.

- Saved standalone TDL without a `.tpj`: the no-workspace completion path
  parses the file, builds its scope, makes it active, and publishes diagnostics.
- Saved XML with a non-XML filename and language ID `xml`: assert XML parsing
  and the XML scope manager are selected.
- A nonstandard filename assigned language ID `tdl`: assert the TDL scope
  manager and context/completion path are selected.
- Untitled TDL and XML buffers: assert pending opens are processed after
  no-workspace initialization and requests use their current unsaved text.
- A TDL root with an include/import and no `.tpj`: assert the reachable graph
  becomes active.
- Existing `.tpj` fixtures: assert root/include project scoping remains
  unchanged.
- Add a lightweight client/manifest regression check for both activation events
  and language-ID-based selectors.

Run the targeted Vitest suites, the full test suite, and TypeScript compilation
after implementation.

## Acceptance Criteria

- Opening a `tdl` or `xml` language-mode document no longer depends on a
  `.tpj`, file extension, workspace folder, or saved file path.
- Suggestions, validation, navigation, semantic tokens, formatting, hover, and
  other document features receive a parsed, language-correct document context.
- `.tpj` projects retain their existing active-root and include-graph behavior.
