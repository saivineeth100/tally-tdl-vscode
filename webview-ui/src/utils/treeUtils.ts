import { ScopeNode } from "../types";

export const buildFolderTree = (files: any[]): ScopeNode[] => {
  if (!files || files.length === 0) return [];

  const getPath = (file: any) => {
    let p = file.id;
    if (p.startsWith('file:')) p = p.substring(5);
    if (p.startsWith('file:///')) p = p.substring(8);
    try { p = decodeURIComponent(p); } catch {}
    return p.replace(/\\/g, '/');
  };
  
  const paths = files.map(f => getPath(f));
  let commonPrefix = '';
  if (paths.length > 0) {
    const splitPaths = paths.map(p => p.split('/'));
    const minLen = Math.min(...splitPaths.map(p => p.length));
    let i = 0;
    while (i < minLen - 1) { // -1 to not include the filename itself
      const part = splitPaths[0][i];
      if (splitPaths.every(p => p[i] === part)) {
        i++;
      } else {
        break;
      }
    }
    if (i > 0) {
      commonPrefix = splitPaths[0].slice(0, i).join('/') + '/';
    }
  }
  
  const root = { id: 'root', kind: 'Folder', children: [], symbolGroups: [] } as ScopeNode;
  
  for (const file of files) {
    const normalizedPath = getPath(file);
    const relPath = normalizedPath.startsWith(commonPrefix) ? normalizedPath.substring(commonPrefix.length) : normalizedPath;
    
    const parts = relPath.split('/').filter((p: string) => p.length > 0);
    const fileName = parts.pop()!;
    
    file.name = fileName; 
    
    let current = root;
    for (const part of parts) {
      let existing = current.children?.find((c: ScopeNode) => c.kind === 'Folder' && c.name === part);
      if (!existing) {
        existing = {
          id: current.id ? `${current.id}/${part}` : part,
          name: part,
          kind: 'Folder',
          children: [],
          symbolGroups: [],
          hasChildren: true,
          _childrenLoaded: true
        } as ScopeNode;
        if (!current.children) current.children = [];
        current.children.push(existing);
      }
      current = existing;
    }
    if (!current.children) current.children = [];
    current.children.push(file);
  }
  
  return root.children || [];
};
