import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Parser } from '../../core/parser/parser';
import { validateSourceFile } from '../../validation';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { DiagnosticSeverity } from 'vscode-languageserver';
import { DiagnosticRules } from '../../diagnostics';
import { ScopeKind } from '../../semantics/scopeManager';
import { SymbolKind } from 'tally-tdl-shared';
import { ServerTestHarness } from '../harness/serverTestHarness';

describe('Definition Validation (Mocked)', () => {
    let harness: ServerTestHarness;
    let mockScopeManager: any;

    beforeEach(() => {
        harness = new ServerTestHarness();
        mockScopeManager = harness.runtime.services.documentStateStore.tdlScopeManager;
        
        // Add existing definitions directly to the scope manager
        mockScopeManager.globalScope.definitions = new Map([
            ['report', new Map([['balancesheet', { name: 'balancesheet', kind: 0, uri: '', start: 0, end: 0, definitionType: 'report' } as any], ['trialbalance', { name: 'trialbalance', kind: 0, uri: '', start: 0, end: 0, definitionType: 'report' } as any]])],
            ['field', new Map([['name', { name: 'name', kind: 0, uri: '', start: 0, end: 0, definitionType: 'field' } as any], ['amount', { name: 'amount', kind: 0, uri: '', start: 0, end: 0, definitionType: 'field' } as any]])],
            ['menu', new Map()],
            ['form', new Map()]
        ]);

        // Mock definitions map for attributes using attributes map in globalScope
        const reportAttrs = new Map<string, any>();
        reportAttrs.set('use', {
            name: 'Use',
            parameters: [{ RefersTo: 'Report' }]
        });
        mockScopeManager.globalScope.attributes.set('report', reportAttrs);
    });

    afterEach(() => {
        harness.dispose();
    });


    it('should detect duplicate labels within a function', async () => {
        const tdl = `[Function: MyFunction]
        01 : LOG : "Hello"
        01 : LOG : "World"
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const localScopeManager = {
            getScopeAt: () => ({}), // Return a dummy scope
            resolve: () => undefined,
            globalScope: mockScopeManager.globalScope,
            findGlobalSymbolsByName: () => [{ name: 'MyFunction', definitionType: 'Function', isModifier: false }],
            projectScope: { definitions: new Map() }
        } as any;

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, localScopeManager);
        const error = diagnostics.find(d => d.code === DiagnosticRules.DuplicateLabel.code);
        expect(error).toBeDefined();
    });

    it('should detect circular includes', async () => {
        const tdl = `[Include: other.tdl]`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///main.tdl', 'tally', 1, tdl);

        vi.spyOn(harness.runtime.services.includeGraphManager, 'hasCircularIncludes').mockReturnValue(true);
        vi.spyOn(harness.runtime.services.includeGraphManager, 'getProjectNodes').mockReturnValue(new Set<string>());

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager, undefined, harness.runtime.services.includeGraphManager);
        const error = diagnostics.find(d => d.code === DiagnosticRules.CircularInclude.code);
        expect(error).toBeDefined();
        expect(error?.severity).toBe(DiagnosticSeverity.Error);
    });

    it('should flag out of project definition usage', async () => {
        const tdl = `[Report: MyReport]
        Use: OtherReport`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('file:///main.tdl', 'tally', 1, tdl);

        vi.spyOn(harness.runtime.services.includeGraphManager, 'hasCircularIncludes').mockReturnValue(false);
        vi.spyOn(harness.runtime.services.includeGraphManager, 'getProjectNodes').mockReturnValue(new Set<string>(['file:///main.tdl']));

        let typeMap = mockScopeManager.scopeIndex.get('report');
        if (!typeMap) { typeMap = new Map(); mockScopeManager.scopeIndex.set('report', typeMap); }
        typeMap.set('otherreport', [{ kind: ScopeKind.Definition, definition: { name: 'OtherReport', definitionType: 'Report', kind: SymbolKind.Report, uri: 'file:///unlinked.tdl' } }] as any);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager, undefined, harness.runtime.services.includeGraphManager);
        const warning = diagnostics.find(d => d.message.includes('not included in the project'));
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });

    it('should emit warning for InUse directive with missing definition', async () => {
        const tdl = `[Report: ChildReport]
            <InUse: Report: MissingReport>`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code);
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });

    it('should NOT emit warning for InUse directive with valid definition', async () => {
        const tdl = `[Report: ChildReport]
            <InUse: Report: Balance Sheet>`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diagnostics.find(d => d.code === DiagnosticRules.MissingDefinition.code)).toBeUndefined();
    });

    it('should emit warning for InUse directive with unknown type', async () => {
        const tdl = `[Report: ChildReport]
            <InUse: InvalidType: Mixin>`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        const warning = diagnostics.find(d => d.code === DiagnosticRules.UnknownDefinitionType.code);
        expect(warning).toBeDefined();
        expect(warning?.severity).toBe(DiagnosticSeverity.Warning);
    });

    it('should validate multiple comma-separated definitions in InUse directive', async () => {
        const tdl = `[Report: ChildReport]
            <InUse: Report: Balance Sheet, Form: MissingForm, MixinReport>`;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        
        // Report: Balance Sheet -> valid
        // Form: MissingForm -> invalid (MissingDefinition)
        // MixinReport -> invalid (MissingDefinition for Report type)
        const warnings = diagnostics.filter(d => d.code === DiagnosticRules.MissingDefinition.code);
        expect(warnings.length).toBe(2);
        expect(warnings[0].message).toContain('MissingForm');
        expect(warnings[1].message).toContain('MixinReport');
    });

    it('should validate Notification definition attributes without treating as schema object', async () => {
        const notifAttrs = new Map<string, any>();
        notifAttrs.set('activityname', { name: 'Activity Name', parameters: [{ ParameterType: 'Value' }] });
        notifAttrs.set('activityid', { name: 'ActivityID', parameters: [{ ParameterType: 'Value' }] });
        mockScopeManager.globalScope.attributes.set('notification', notifAttrs);
        mockScopeManager.definitionTypeLabels.set('notification', 'Notification');

        // Also add a schema named 'notification' to simulate overlapping schema
        mockScopeManager.globalScope.schemas.set('notification', {
            name: 'Notification',
            kind: SymbolKind.Object,
            properties: new Map(),
            complexProperties: new Map()
        });

        const tdl = `[Notification: DueSalesOrderNotification]
            Activity Name: "Due Sales Order"
            Activity ID: 100
        `;
        const parser = new Parser(tdl);
        const sourceFile = parser.parse();
        const doc = TextDocument.create('test.tdl', 'tally', 1, tdl);

        const diagnostics = await validateSourceFile(sourceFile, doc, undefined, mockScopeManager);
        expect(diagnostics).toEqual([]);
    });

});
