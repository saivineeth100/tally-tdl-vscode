import { Diagnostic } from 'vscode-languageserver';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { FunctionCallNode, StatementNode, SyntaxKind } from '../../parser/ast';
import { ScopeManager } from '../scopeManager';
import { normalizeTypeName } from '../utils';
import { DiagnosticRules, createDiagnostic } from '../../diagnostics';
import { TDLParameter } from '../../models/symbols';

/**
 * Compute minimum required arguments for a parameter list.
 * Accounts for IsList/IsVariableArgument: the last mandatory param
 * defines the minimum; IsList/IsVariableArgument means no upper bound.
 */
export function getArityBounds(params: TDLParameter[]): { min: number, max: number | null } {
    let lastMandatory = -1;
    let hasVarArgs = false;
    for (let i = 0; i < params.length; i++) {
        if (params[i].IsMandatory) lastMandatory = i;
        if (params[i].IsList || params[i].IsVariableArgument) hasVarArgs = true;
    }
    return {
        min: lastMandatory + 1,
        max: hasVarArgs ? null : params.length
    };
}

/**
 * Validate function call arity
 */
export function validateFunctionArity(
    funcNode: FunctionCallNode,
    doc: TextDocument,
    scopeManager: ScopeManager,
    diagnostics: Diagnostic[],
    projectScope?: Set<string>
): void {
    const funcName = funcNode.functionName?.text?.replace(/^\$\$/, '');
    if (!funcName) return;

    const scope = scopeManager.getScopeAt(doc.uri, funcNode.start);
    if (!scope) return;
    
    const func = scopeManager.resolveFunction(funcName, scope, projectScope);
    if (!func || !func.parameters || func.parameters.length === 0) return;

    const { min, max } = getArityBounds(func.parameters);
    const actual = funcNode.arguments?.length ?? 0;

    if (actual < min) {
        diagnostics.push(createDiagnostic(
            DiagnosticRules.MissingParameters,
            { start: doc.positionAt(funcNode.start), end: doc.positionAt(funcNode.end) },
            `$$${func.name}`, min, actual
        ));
    }
}

/**
 * Validate action statement arity
 */
export function validateActionArity(
    stmt: StatementNode,
    doc: TextDocument,
    scopeManager: ScopeManager,
    diagnostics: Diagnostic[]
): void {
    if (!stmt.action) return;
    const actionName = stmt.action.text;
    const action = scopeManager.globalScope.actions.get(normalizeTypeName(actionName));
    if (!action || !action.parameters) return;

    const { min, max } = getArityBounds(action.parameters);
    const actual = stmt.args?.length ?? 0;

    if (actual < min) {
        diagnostics.push(createDiagnostic(
            DiagnosticRules.MissingParameters,
            { start: doc.positionAt(stmt.action.start), end: doc.positionAt(stmt.action.end) },
            actionName, min, actual
        ));
    }
    // Don't warn on too many — TDL is lenient with trailing args
}
