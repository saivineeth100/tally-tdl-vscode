import { describe, it, expect } from 'vitest';
import { buildFolderTree } from '../utils/treeUtils';
import { ScopeNode } from '../types';

describe('buildFolderTree', () => {
  it('returns empty array for empty input', () => {
    expect(buildFolderTree([])).toEqual([]);
    expect(buildFolderTree(null as any)).toEqual([]);
  });

  it('builds a simple tree from single file', () => {
    const files = [{ id: 'C:\\project\\file.tdl', kind: 'File' }];
    const tree = buildFolderTree(files);
    
    // commonPrefix is 'C:/project/' so it should just return the file itself
    expect(tree.length).toBe(1);
    expect(tree[0].name).toBe('file.tdl');
  });

  it('builds a folder structure for multiple files', () => {
    const files = [
      { id: 'project/src/main.tdl', kind: 'File' },
      { id: 'project/src/utils/helper.tdl', kind: 'File' },
      { id: 'project/docs/readme.txt', kind: 'File' }
    ];
    
    const tree = buildFolderTree(files);
    
    // commonPrefix is 'project/'
    expect(tree.length).toBe(2);
    
    const srcNode = tree.find(n => n.name === 'src')!;
    expect(srcNode).toBeDefined();
    expect(srcNode.kind).toBe('Folder');
    expect(srcNode.children?.length).toBe(2);
    
    const docsNode = tree.find(n => n.name === 'docs')!;
    expect(docsNode).toBeDefined();
    expect(docsNode.kind).toBe('Folder');
    expect(docsNode.children?.length).toBe(1);
  });
});
