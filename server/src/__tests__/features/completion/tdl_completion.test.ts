import { describe, it, expect } from 'vitest';
import { detectXmlCompletionContext, registerCompletion } from '../../../features/completion';

describe('XML Completion Context Detection', () => {

    describe('detectXmlCompletionContext', () => {
        it('should detect schema_type context inside TALLYMESSAGE', () => {
            const xml = `<ENVELOPE>
                <BODY>
                    <TALLYMESSAGE>
                        <
                    </TALLYMESSAGE>
                </BODY>
            </ENVELOPE>`;
            
            // Cursor is after the < inside TALLYMESSAGE
            const offset = xml.indexOf('<', xml.indexOf('<TALLYMESSAGE>') + 10) + 1;
            
            const context = detectXmlCompletionContext(xml, offset, undefined);
            
            expect(context.type).toBe('schema_type');
            expect(context.hasModifier).toBe(false);
        });

        it('should detect xml_schema_attribute context for primary schema tags', () => {
            const xml = `<ENVELOPE>
                <BODY>
                    <TALLYMESSAGE>
                        <VOUCHER>
                            <
                        </VOUCHER>
                    </TALLYMESSAGE>
                </BODY>
            </ENVELOPE>`;
            
            const offset = xml.indexOf('<', xml.indexOf('<VOUCHER>') + 5) + 1;
            
            const context = detectXmlCompletionContext(xml, offset, undefined);
            
            expect(context.type).toBe('xml_schema_attribute');
            expect((context as any).tagPath).toEqual(['ENVELOPE', 'BODY', 'TALLYMESSAGE', 'VOUCHER']);
        });

        it('should detect deeply nested xml_schema_attribute context', () => {
            const xml = `<TALLYMESSAGE>
                <VOUCHER>
                    <ALLLEDGERENTRIES.LIST>
                        <
                    </ALLLEDGERENTRIES.LIST>
                </VOUCHER>
            </TALLYMESSAGE>`;
            
            const offset = xml.indexOf('<', xml.indexOf('<ALLLEDGERENTRIES.LIST>') + 10) + 1;
            
            const context = detectXmlCompletionContext(xml, offset, undefined);
            
            expect(context.type).toBe('xml_schema_attribute');
            expect((context as any).tagPath).toEqual(['TALLYMESSAGE', 'VOUCHER', 'ALLLEDGERENTRIES.LIST']);
        });

        it('should detect attribute_value context', () => {
            const xml = `<VOUCHER>
                <PARTYLEDGERNAME>Cash</
            </VOUCHER>`;
            
            // Cursor after Cash
            const offset = xml.indexOf('Cash') + 4;
            
            const context = detectXmlCompletionContext(xml, offset, undefined);
            
            expect(context.type).toBe('attribute_value');
            expect((context as any).attributeName).toBe('PARTYLEDGERNAME');
            expect((context as any).tagPath).toEqual(['VOUCHER', 'PARTYLEDGERNAME']);
        });
    });

    it('suggests strictly in-scope targets for Local chains', async () => {
        const { TextDocument } = await import('vscode-languageserver-textdocument');
        const { ScopeManager } = await import('../../../semantics/scopeManager');
        const { Parser } = await import('../../../core/parser/parser');

        const tdlContent = '[Form: MyForm]\n    Local : Part : ';
        
        let completionCb: Function = () => {};
        const mockConn = {
            onCompletion: (cb: any) => { completionCb = cb; },
            onCompletionResolve: () => {},
            console: { log: () => {}, error: () => {} }
        };
        
        const doc = TextDocument.create('untitled:Untitled-3', 'tdl', 1, tdlContent);
        const mockDocs = { get: () => doc };
        const scopeManager = new ScopeManager();
        scopeManager.initializeGlobalScope();
        
        const parser = new Parser(tdlContent);
        const mockSourceFile = parser.parse();
        //mockSourceFile.uri = 'untitled:Untitled-3';
        
        // Setup scopes
        const fileScope = scopeManager.buildFileScope('untitled:Untitled-3', mockSourceFile);
        
        const myFormScope = fileScope.childScopes.find(s => s.id === 'form:myform') || scopeManager.createDefinitionScope('form:myform', fileScope, { start: 0, end: tdlContent.length }, 'untitled:Untitled-3');
        const myPartScope = scopeManager.createDefinitionScope('part:mypart', myFormScope, { start: 0, end: 0 }, 'untitled:Untitled-3');
        myPartScope.definition = { name: 'mypart' } as any;
        
        const otherPartScope = scopeManager.createDefinitionScope('part:otherpart', fileScope, { start: 0, end: 0 }, 'untitled:Untitled-3'); // Not in myform!
        otherPartScope.definition = { name: 'otherpart' } as any;

        scopeManager.indexScope(fileScope);

        // Hook up structural relationships directly for test
        scopeManager.childDefinitions.set('form:myform', new Set(['part:mypart']));
        
        // Mock global scope attributes
        scopeManager.globalScope.attributes.set('form', new Map([['part', {}]] as any));
        scopeManager.globalScope.attributes.set('part', new Map() as any);
        
        const mockMgr = {
            get: () => ({ sourceFile: mockSourceFile }),
            getScopeManager: () => scopeManager,
            getProjectNodes: () => new Set(['untitled:Untitled-3']),
            tdlScopeManager: scopeManager
        };
        
        registerCompletion(mockConn as any, mockDocs as any, mockMgr as any);
        
        const result = await completionCb({
            textDocument: { uri: 'untitled:Untitled-3' },
            position: doc.positionAt(tdlContent.length)
        });
        
        const myPartItem = result.items.find((i: any) => i.label === 'mypart');
        const otherPartItem = result.items.find((i: any) => i.label === 'otherpart');

        if (!myPartItem) {
            console.log('Completion Items returned: ', JSON.stringify(result.items, null, 2));
            console.log('FileScope:', fileScope.id, 'children:', fileScope.childScopes.map(c => c.id));
            const myFormScopeLocal = fileScope.childScopes.find(s => s.id === 'form:myform');
            console.log('MyFormScope found in file:', !!myFormScopeLocal);
            if (myFormScopeLocal) {
                console.log('MyFormScope children:', myFormScopeLocal.childScopes.map(c => c.id));
            }
            console.log('Is myPartScope indexed?', !!scopeManager.findDefinitionScope('part:mypart'));
            //console.log('MyPartScope definition:', scopeManager.findDefinitionScope('part:mypart')?.definition);
            console.log('Effective scope at offset 31:', scopeManager.getScopeAt('untitled:Untitled-3', tdlContent.length)?.id);
            console.log('Reachable parts from fileScope:', scopeManager.getDefinitionsInScope(fileScope, 'part').map(s => s.name));
            if (myFormScopeLocal) {
                console.log('Reachable parts from myFormScope:', scopeManager.getDefinitionsInScope(myFormScopeLocal, 'part').map(s => s.name));
            }
            console.log('childDefinitions for form:myform:', scopeManager.childDefinitions.get('form:myform'));
        }

        // Should ONLY suggest definitions in scope!
        expect(myPartItem).toBeDefined();
        expect(otherPartItem).toBeUndefined(); 
    });
});
