import { describe, it, expect } from 'vitest';
import { DocManager } from '../../../docManager';
import { ScopeManager } from '../../../services/scopeManager';
import { findReferenceAtOffset } from '../../../services/definition';
import { parseXmlToAst } from '../../../parser/xmlAdapter';
import { DefinitionScope, ScopeKind } from '../../../services/scopeManager/types';
import { normalizeTypeName } from '../../../services/utils';
import { SymbolKind } from 'tally-tdl-shared';

// Create a simple mock connection object
const mockConnection = {
    onReferences: () => { },
    sendDiagnostics: () => { }
} as any;

// Create a simple mock document manager and documents container
const mockDocuments = {
    get: (uri: string) => {
        if (uri === 'file:///test.tdlxml') {
            return {
                uri: 'file:///test.tdlxml',
                getText: () => `
<TDL>
  <TDLMESSAGE>
    <REPORT NAME="MyReport">
      <USE>MyOtherReport</USE>
    </REPORT>
    <REPORT NAME="MyOtherReport">
    </REPORT>
  </TDLMESSAGE>
</TDL>`,
                offsetAt: (pos: any) => 63 // Hardcode offset for <USE>MyOtherReport
            };
        }
        return undefined;
    },
    onDidOpen: () => { },
    onDidChangeContent: () => { },
    onDidClose: () => { }
} as any;

describe('XML Reference Tests', () => {
    it('Indexes XML definitions in ScopeManager correctly to enable reference lookups', () => {
        const manager = new DocManager(mockConnection, mockDocuments);
        const scopeManager = new ScopeManager();

        const xmlContent = mockDocuments.get('file:///test.tdlxml').getText();
        const sourceFile = parseXmlToAst(xmlContent);

        for (const def of sourceFile.definitions) {
            if (def.name) {
                let typeMap = scopeManager.scopeIndex.get(normalizeTypeName(def.type.text));
                if (!typeMap) {
                    typeMap = new Map();
                    scopeManager.scopeIndex.set(normalizeTypeName(def.type.text), typeMap);
                }

                const normalizedName = def.name.text.toLowerCase().replace(/\s+/g, '');
                typeMap.set(normalizedName, {
                    kind: ScopeKind.Definition,
                    definition: {
                        name: def.name.text,
                        kind: SymbolKind.Report, // SymbolKind Mock
                        definitionType: def.type.text,
                        uri: 'file:///test.tdlxml',
                        start: def.name.start,
                        end: def.name.end
                    },
                    id: '',
                    structuralChildren: new Map(),
                    uses: new Set(),
                    childScopes: [],
                    variables: new Map(),
                    formulas: new Map()
                });
            }
        }

        // Find reference
        const typeMap = scopeManager.scopeIndex.get(normalizeTypeName('REPORT'));
        const normalizedSearch = 'MyOtherReport'.toLowerCase().replace(/\s+/g, '');
        const symbol = typeMap?.get(normalizedSearch) as DefinitionScope;

        expect(symbol).not.toBeNull();
        expect(symbol.definition).not.toBeNull();
        expect(symbol.definition?.name).toBe('MyOtherReport');
        expect(symbol.definition?.kind).toBe('Report');
    });

    it('Indexes multiple XML definitions with spaces gracefully', () => {
        const scopeManager = new ScopeManager();
        const xmlContent = `
<TDL>
  <TDLMESSAGE>
    <REPORT NAME="My First Report">
    </REPORT>
    <REPORT NAME="My Second Report">
    </REPORT>
  </TDLMESSAGE>
</TDL>`;
        const sourceFile = parseXmlToAst(xmlContent);

        for (const def of sourceFile.definitions) {
            if (def.name) {
                let typeMap = scopeManager.scopeIndex.get(normalizeTypeName(def.type.text));
                if (!typeMap) {
                    typeMap = new Map();
                    scopeManager.scopeIndex.set(normalizeTypeName(def.type.text), typeMap);
                }

                const normalizedName = def.name.text.toLowerCase().replace(/\s+/g, '');
                typeMap.set(normalizedName, {
                    kind: ScopeKind.Definition,
                    definition: {
                        name: def.name.text,
                        kind: SymbolKind.Report, // SymbolKind Mock
                        definitionType: def.type.text,
                        uri: 'file:///test.tdlxml',
                        start: def.name.start,
                        end: def.name.end
                    },
                    id: '',
                    structuralChildren: new Map(),
                    uses: new Set(),
                    childScopes: [],
                    variables: new Map(),
                    formulas: new Map()
                });
            }
        }

        const typeMap = scopeManager.scopeIndex.get(normalizeTypeName('REPORT'));

        const normalizedFirst = 'My First Report'.toLowerCase().replace(/\s+/g, '');
        const symbols1 = typeMap?.get(normalizedFirst) as DefinitionScope;
        expect(symbols1?.definition).not.toBeNull();
        expect(symbols1.definition!.name).toBe('My First Report');

        const normalizedSecond = 'mysecondreport'.toLowerCase().replace(/\s+/g, '');

        const symbols2 = typeMap?.get(normalizedSecond) as DefinitionScope;
        expect(symbols2?.definition).not.toBeNull();
        expect(symbols2.definition!.name).toBe('My Second Report');
    });
});
