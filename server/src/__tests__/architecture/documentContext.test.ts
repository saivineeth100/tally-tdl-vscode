import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentContextResolver } from '../../services/documentContextResolver';
import { DocumentLoader } from '../../services/documentLoader';
import { IncludePathResolver } from '../../services/includePathResolver';
import { InMemoryDocumentRepository, InMemoryFileAccess } from '../harness/testAdapters';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver/node';
import * as path from 'path';
import { normalizeUri } from '../../utils/uri';

// Mock dependencies since we only need getters
const mockStateStore = {
    get: vi.fn(),
    getScopeManager: vi.fn()
} as any;

const mockIncludeGraph = {
    getProjectNodes: vi.fn()
} as any;

describe('Document Context and File Access', () => {
    let repo: InMemoryDocumentRepository;
    let fileAccess: InMemoryFileAccess;

    beforeEach(() => {
        repo = new InMemoryDocumentRepository();
        fileAccess = new InMemoryFileAccess();
        vi.clearAllMocks();
    });

    describe('DocumentContextResolver', () => {
        it('resolveOpen() finds existing documents and normalizes URIs', () => {
            const resolver = new DocumentContextResolver(repo, mockStateStore, mockIncludeGraph);
            const doc = TextDocument.create('file:///Test.tdl', 'tally', 1, 'text');
            // InMemoryDocumentRepository doesn't automatically normalize when setting.
            // We'll set it with the URI we expect the resolver to query.
            const normUri = normalizeUri('file:///Test.tdl');
            repo.set(normUri, doc);

            const ctx = resolver.resolveOpen('file:///Test.tdl');
            expect(ctx).toBeDefined();
            expect(ctx?.uri).toBe(normUri);
            expect(ctx?.document).toBe(doc);
        });

        it('resolveParsed() returns context with AST and scope', () => {
            const resolver = new DocumentContextResolver(repo, mockStateStore, mockIncludeGraph);
            const doc = TextDocument.create('file:///test.tdl', 'tally', 1, 'text');
            repo.set('file:///test.tdl', doc);

            const mockSourceFile = {} as any;
            const mockScopeManager = {} as any;
            const mockProjectNodes = new Set(['file:///test.tdl']);

            vi.spyOn(mockStateStore, 'get').mockReturnValue({ sourceFile: mockSourceFile, diagnostics: [] } as any);
            vi.spyOn(mockStateStore, 'getScopeManager').mockReturnValue(mockScopeManager);
            vi.spyOn(mockIncludeGraph, 'getProjectNodes').mockReturnValue(mockProjectNodes);

            const ctx = resolver.resolveParsed('file:///test.tdl');
            expect(ctx).toBeDefined();
            expect(ctx?.sourceFile).toBe(mockSourceFile);
            expect(ctx?.scopeManager).toBe(mockScopeManager);
            expect(ctx?.projectNodes).toBe(mockProjectNodes);
        });

        it('resolveAtPosition() calculates offset', () => {
            const resolver = new DocumentContextResolver(repo, mockStateStore, mockIncludeGraph);
            const doc = TextDocument.create('file:///test.tdl', 'tally', 1, 'hello world\nsecond line');
            repo.set('file:///test.tdl', doc);

            vi.spyOn(mockStateStore, 'getOpen').mockReturnValue({ sourceFile: {} as any, diagnostics: [] } as any);
            vi.spyOn(mockStateStore, 'getScopeManager').mockReturnValue({} as any);
            vi.spyOn(mockIncludeGraph, 'getProjectNodes').mockReturnValue(new Set());

            const pos = Position.create(1, 2); // 'second line', character 2 ('c')
            const ctx = resolver.resolveAtPosition('file:///test.tdl', pos);
            
            expect(ctx).toBeDefined();
            expect(ctx?.position).toEqual(pos);
            expect(ctx?.offset).toBe(14); // 11 + 1 (newline) + 2
        });
    });

    describe('DocumentLoader', () => {
        it('returns open document if available', async () => {
            const loader = new DocumentLoader(repo, fileAccess);
            const doc = TextDocument.create('file:///test.tdl', 'tally', 1, 'open text');
            repo.set('file:///test.tdl', doc);

            const loaded = await loader.loadDocument('file:///test.tdl');
            expect(loaded).toBe(doc);
            expect(loaded?.getText()).toBe('open text');
        });

        it('reads from disk if not open and sets language correctly', async () => {
            const loader = new DocumentLoader(repo, fileAccess);
            
            // Note: The loader asks fileAccess for fsPath.
            // URI.parse('file:///test.xml').fsPath -> '/test.xml' or 'C:\test.xml' depending on OS.
            // For tests, we'll use a standard path and canonicalize it the same way InMemoryFileAccess does.
            const uri = 'file:///test.xml';
            const fsPath = require('vscode-uri').URI.parse(uri).fsPath;
            const canonicalPath = fileAccess.canonicalize(fsPath);
            
            fileAccess.files.set(canonicalPath, '<xml></xml>');

            const loaded = await loader.loadDocument(uri);
            expect(loaded).toBeDefined();
            expect(loaded?.version).toBe(0);
            expect(loaded?.languageId).toBe('xml'); // Because it ends in .xml
            expect(loaded?.getText()).toBe('<xml></xml>');
        });
    });

    describe('IncludePathResolver', () => {
        it('resolves relative to current file first', async () => {
            const resolver = new IncludePathResolver(fileAccess, () => []);
            
            const currentFilePath = fileAccess.canonicalize('/workspace/folder/main.tdl');
            const includeName = 'utils.tdl';
            const expectedPath = fileAccess.canonicalize('/workspace/folder/utils.tdl');
            
            fileAccess.files.set(expectedPath, 'content');

            const result = await resolver.resolveIncludePath(currentFilePath, includeName);
            expect(result).toBe(expectedPath);
        });

        it('resolves relative to workspace roots if not found locally', async () => {
            const workspaceRoots = ['/workspace/root1', '/workspace/root2'];
            const resolver = new IncludePathResolver(fileAccess, () => workspaceRoots);
            
            const currentFilePath = fileAccess.canonicalize('/workspace/other/main.tdl');
            const includeName = 'global.tdl';
            
            // Not in /workspace/other/
            const expectedPath = fileAccess.canonicalize('/workspace/root2/global.tdl');
            fileAccess.files.set(expectedPath, 'content');

            const result = await resolver.resolveIncludePath(currentFilePath, includeName);
            expect(result).toBe(expectedPath);
        });
        
        it('returns null if file is nowhere to be found', async () => {
            const resolver = new IncludePathResolver(fileAccess, () => ['/workspace/root']);
            
            const currentFilePath = fileAccess.canonicalize('/workspace/folder/main.tdl');
            const result = await resolver.resolveIncludePath(currentFilePath, 'missing.tdl');
            
            expect(result).toBeNull();
        });
    });
});
