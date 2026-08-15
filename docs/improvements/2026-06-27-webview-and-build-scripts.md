# Webview UI & Build Scripts — Bugs and Improvements

**Date**: 2026-06-27  
**Status**: Proposed  
**Priority**: Medium  
**Source**: Code review of `webview-ui/` and `server/src/scripts/buildVersionCache.ts`

---

## Summary

The Scope Tree Viewer webview (`webview-ui/`) and the build cache script (`buildVersionCache.ts`) were reviewed separately. This document covers bugs, code quality issues, and improvements found.

---

## Webview UI

### Bug W1: Vite Timestamp File Committed to Source Control

**Location**: [`webview-ui/vite.config.ts.timestamp-1782455151801-f35e2654080cc8.mjs`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/webview-ui/vite.config.ts.timestamp-1782455151801-f35e2654080cc8.mjs)

**Description**: This is a Vite build artifact (an auto-generated temp file). It should not be committed to version control. It's not in `.gitignore`.

**Fix**: 
1. Add to `.gitignore`:
   ```
   webview-ui/vite.config.ts.timestamp-*
   ```
2. Remove the file from the repo:
   ```bash
   git rm --cached webview-ui/vite.config.ts.timestamp-*.mjs
   ```

---

### Bug W2: `JSON.parse(JSON.stringify())` Deep Clone on Every Message

**Location**: [`App.tsx` line 94](file:///d:/SourceCode/OpenSource/tally-tdl-latest/webview-ui/src/App.tsx#L94)

**Description**: On every `childrenResult` message from the extension host, the **entire tree state** is deep-cloned using JSON serialization:

```typescript
const newTree = JSON.parse(JSON.stringify(prev));
```

For workspaces with hundreds of files, this is an O(n) operation on every lazy-load expansion. JSON serialization is also the slowest deep clone method available.

**Fix**: Use `structuredClone(prev)` (native, faster) or better yet, use immutable update patterns that only clone the path to the changed node:

```typescript
function updateNodeInTree(nodes: any[], targetId: string, updater: (node: any) => any): any[] {
    return nodes.map(node => {
        if (node.id === targetId) return updater({ ...node });
        if (node.children) {
            return { ...node, children: updateNodeInTree(node.children, targetId, updater) };
        }
        return node;
    });
}
```

---

### Bug W3: `Number.MAX_SAFE_INTEGER` Defeats Pagination

**Location**: 
- [`DetailsPanel.tsx` line 22](file:///d:/SourceCode/OpenSource/tally-tdl-latest/webview-ui/src/components/DetailsPanel.tsx#L22)
- [`SchemaTreeNode.tsx` line 31](file:///d:/SourceCode/OpenSource/tally-tdl-latest/webview-ui/src/components/SchemaTreeNode.tsx#L31)
- [`App.tsx` line 157](file:///d:/SourceCode/OpenSource/tally-tdl-latest/webview-ui/src/App.tsx#L157)

**Description**: Multiple places pass `Number.MAX_SAFE_INTEGER` as the pagination `limit`, which requests ALL items at once. For large metadata sets (e.g., thousands of attributes), this defeats pagination entirely and can cause the webview to freeze while rendering everything at once.

```typescript
// DetailsPanel.tsx line 22
const limit = (node.kind === 'AttributesCategory' || ...) ? Number.MAX_SAFE_INTEGER : 100;

// App.tsx line 157 - hash navigation requests ALL items
limit: Number.MAX_SAFE_INTEGER,
```

**Fix**: Use a reasonable maximum (e.g., `10000`) or implement virtual scrolling for large lists. At minimum, add a guard:

```typescript
const limit = (node.kind === 'AttributesCategory' || ...) ? 5000 : 100;
```

---

### Improvement W4: Pervasive `any` Types — No TypeScript Safety

**Location**: All component files

**Description**: Every component uses `any` extensively, completely defeating TypeScript's purpose:

| File | Examples |
|------|----------|
| `App.tsx` | `useState<any[] \| null>(null)`, `useState<any>(null)`, `(node: any, path: string[])` |
| `DetailsPanel.tsx` | `interface DetailsPanelProps { node: any; }`, `useState<any>(null)` ×3 |
| `ScopeTree.tsx` | `node: any` in every prop, `(child: any)`, `(group: any)` |
| `SchemaTreeNode.tsx` | `prop: any`, `useState<any>(null)` |

**Fix**: Create proper TypeScript interfaces:

```typescript
// types.ts
export interface ScopeNode {
    id: string;
    name?: string;
    kind: string;
    children?: ScopeNode[];
    hasChildren?: boolean;
    _childrenLoaded?: boolean;
    symbolGroups?: SymbolGroup[];
    structuralChildren?: string[];
    structuralParents?: string[];
    usedDefinitions?: string[];
}

export interface SymbolGroup {
    kind: string;
    count: number;
}

export interface SymbolResult {
    symbols: SymbolInfo[];
    totalCount: number;
    page: number;
    limit: number;
}
```

---

### Improvement W5: No Error Boundary

**Location**: [`App.tsx`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/webview-ui/src/App.tsx)

**Description**: If any component throws a rendering error, the entire webview crashes with no recovery. React Error Boundaries should wrap critical sections.

**Fix**: Add an `ErrorBoundary` component:

```tsx
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {error?: Error}> {
    state = { error: undefined as Error | undefined };
    static getDerivedStateFromError(error: Error) { return { error }; }
    render() {
        if (this.state.error) {
            return <div className="empty-state">Something went wrong: {this.state.error.message}</div>;
        }
        return this.props.children;
    }
}
```

---

### Improvement W6: Extensive Inline Styles

**Location**: [`DetailsPanel.tsx`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/webview-ui/src/components/DetailsPanel.tsx) (throughout)

**Description**: `DetailsPanel.tsx` has ~50 inline `style={{}}` objects. These are:
- Re-created on every render (GC pressure)
- Harder to maintain than CSS classes
- Not reusable

**Examples**:
```tsx
// Line 226 - Long inline style
style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', 
         background: 'rgba(0,0,0,0.1)', padding: '6px 10px', borderRadius: '4px', 
         borderLeft: '2px solid var(--border-color)' }}
```

**Fix**: Extract into CSS classes in `App.css`. The existing CSS already has good patterns; these inline styles should follow the same pattern.

---

### Improvement W7: Outdated Dependencies

**Location**: [`webview-ui/package.json`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/webview-ui/package.json)

**Description**: Dependencies are significantly outdated:

| Package | Current | Latest (approx.) |
|---------|---------|-------------------|
| `react` | `^18.2.0` | `19.x` |
| `react-dom` | `^18.2.0` | `19.x` |
| `vite` | `^4.4.5` | `6.x` |
| `@vitejs/plugin-react` | `^4.0.3` | `4.5.x` |
| `typescript` | `^5.0.2` | `5.8.x` |

**Fix**: Run `npm update` or manually bump versions. Vite 4 → 5/6 migration may require config changes.

---

### Improvement W8: Zero Test Coverage

**Description**: The `webview-ui` directory has **no test files at all**. No unit tests for utility functions, no component render tests.

**Fix**: At minimum, add tests for:
- `buildFolderTree()` in `App.tsx` (pure function, easy to test)
- `VSCodeAPIWrapper` state management
- Hash navigation logic

---

## Build Script: `buildVersionCache.ts`

### Bug B1: Hardcoded UTF-8 Encoding

**Location**: [`buildVersionCache.ts` line 25](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/scripts/buildVersionCache.ts#L25)

**Description**: The script hardcodes `'utf-8'` encoding when reading TDL files:

```typescript
const content = await fs.promises.readFile(fullPath, 'utf-8');
```

However, the rest of the codebase handles UTF-16LE encoded TDL files via [`readFileWithEncoding()`](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/docManager.ts) in `docManager.ts`. Base TDL files shipped by Tally could be in UTF-16LE, which would cause silent corruption when read as UTF-8 (garbled characters, wrong offsets).

**Fix**: Use the same `readFileWithEncoding` utility, or at minimum detect the BOM:

```typescript
import { readFileWithEncoding } from '../docManager';
// ...
const content = await readFileWithEncoding(fullPath);
```

---

### Bug B2: Non-null Assertion on `process.argv[2]`

**Location**: [`buildVersionCache.ts` line 42](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/scripts/buildVersionCache.ts#L42)

**Description**: The script uses `process.argv[2]!` (non-null assertion) inside `scanAndParse()` to compute relative paths:

```typescript
const relativePath = path.relative(process.argv[2]!, fullPath).replace(/\\/g, '/');
```

If `process.argv[2]` is provided and valid at line 95 (the guard check), it's fine. But `scanAndParse` is called from `buildCacheForVersion` which only checks `fs.existsSync(baseTdlDir)`. If the path is a symlink that resolves differently, `path.relative` could produce unexpected results. More importantly, this couples an inner function to a global.

**Fix**: Pass `baseTdlDir` as a parameter to `scanAndParse` instead of reading from `process.argv`:

```typescript
async function scanAndParse(
    dirPath: string, 
    baseTdlDir: string,  // NEW: passed in instead of process.argv
    scopeManager: ScopeManager, 
    version: string, 
    stats: { parsed: number, errors: number }
) {
    // ...
    const relativePath = path.relative(baseTdlDir, fullPath).replace(/\\/g, '/');
}
```

---

### Improvement B3: Inconsistent Sync/Async I/O

**Location**: [`buildVersionCache.ts` line 158](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/scripts/buildVersionCache.ts#L158)

**Description**: `main()` uses synchronous `fs.readdirSync` while everything else is async:

```typescript
const entries = fs.readdirSync(dataPath, { withFileTypes: true });
```

**Fix**: Use `await fs.promises.readdir(dataPath, { withFileTypes: true })` for consistency.

---

### Improvement B4: No Usage Instructions or Validation

**Description**: The script has no `--help` output, no argument validation, and no usage message. A developer running `ts-node buildVersionCache.ts` with wrong or missing args gets cryptic errors.

**Fix**: Add argument validation at the top of `main()`:

```typescript
async function main() {
    const baseTdlDir = process.argv[2];
    if (baseTdlDir && !fs.existsSync(baseTdlDir)) {
        console.error(`Error: Base TDL directory not found: ${baseTdlDir}`);
        console.error(`Usage: ts-node buildVersionCache.ts [path/to/base/tdl/files]`);
        process.exit(1);
    }
    // ...
}
```

---

### Improvement B5: Error Parsing is Silently Swallowed

**Location**: [`buildVersionCache.ts` lines 58-61](file:///d:/SourceCode/OpenSource/tally-tdl-latest/server/src/scripts/buildVersionCache.ts#L58-L61)

**Description**: Parse errors are caught and counted, but the build continues and produces a cache with potentially incomplete data. If many files fail to parse, the cache will be missing critical definitions, but the script still reports "Successfully built caches."

**Fix**: Add a threshold check:

```typescript
if (stats.errors > 0 && stats.errors > stats.parsed * 0.1) {
    console.error(`\nWarning: ${stats.errors} files failed to parse (${(stats.errors / (stats.parsed + stats.errors) * 100).toFixed(1)}% error rate)`);
    console.error(`The generated cache may be incomplete.`);
}
```

---

## Verification Plan

### Webview UI
```bash
# Verify build succeeds
cd webview-ui && npm run build

# After adding tests:
cd webview-ui && npx vitest run
```

### Build Script
```bash
# Run the cache builder
cd server && npx ts-node src/scripts/buildVersionCache.ts

# Verify generated caches load correctly
npm test
```
