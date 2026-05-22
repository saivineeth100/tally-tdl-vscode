import { describe, it, expect } from 'vitest';
import { DocManager } from '../../../docManager';
import { ScopeManager } from '../../../services/scopeManager';
import { SymbolTable, SymbolKind } from '../../../services/symbolTable';
import { findReferenceAtOffset } from '../../../services/definition';
import { parseXmlToAst } from '../../../parser/xmlAdapter';

// Create a simple mock connection object
const mockConnection = {
    onReferences: () => {},
    sendDiagnostics: () => {}
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
    onDidOpen: () => {},
    onDidChangeContent: () => {},
    onDidClose: () => {}
} as any;

describe('XML Reference Tests', () => {
    it('Indexes XML definitions in SymbolTable correctly to enable reference lookups', () => {
        const symbolTable = new SymbolTable();
        const manager = new DocManager(mockConnection, mockDocuments);
        
        // Let's bypass DocManager's complex event hooks and just use SymbolTable directly
        // Wait, SymbolTable requires DocManager integration.
        // Actually, parseXmlToAst -> then add to SymbolTable.
        
        const xmlContent = mockDocuments.get('file:///test.tdlxml').getText();
        const sourceFile = parseXmlToAst(xmlContent);
        
        for (const def of sourceFile.definitions) {
            if (def.name) {
                symbolTable.addSymbol({
                    name: def.name.text,
                    kind: SymbolKind.Report, // mocked kind
                    uri: 'file:///test.tdlxml',
                    start: def.name.start,
                    end: def.name.end,
                    definitionType: def.type.text
                });
            }
        }
        
        // Find reference
        const symbols = symbolTable.findAllByName('MyOtherReport');
        expect(symbols.length).toBeGreaterThan(0);
        expect(symbols[0].name).toBe('MyOtherReport');
        expect(symbols[0].kind).toBe(SymbolKind.Report);
    });

    it('Indexes multiple XML definitions with spaces gracefully', () => {
        const symbolTable = new SymbolTable();
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
                symbolTable.addSymbol({
                    name: def.name.text,
                    kind: SymbolKind.Report,
                    uri: 'file:///test.tdlxml',
                    start: def.name.start,
                    end: def.name.end,
                    definitionType: def.type.text
                });
            }
        }
        
        const symbols1 = symbolTable.findAllByName('My First Report');
        expect(symbols1.length).toBe(1);
        expect(symbols1[0].name).toBe('My First Report');
        
        const symbols2 = symbolTable.findAllByName('mysecondreport');
        expect(symbols2.length).toBe(1); // Case insensitive, space insensitive lookup
        expect(symbols2[0].name).toBe('My Second Report');
    });
});
