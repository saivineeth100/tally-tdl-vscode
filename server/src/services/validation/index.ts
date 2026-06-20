import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile, SyntaxKind, IdentifierNode, FunctionCallNode, BinaryExpressionNode, Node, BreakNode, ContinueNode, ReturnNode, SetNode, ExchangeNode, IncrementNode, DecrementNode, WhileNode, WalkNode, ForNode, DoIfNode, BlockStatementNode } from "../../parser/ast";
import { SymbolTable, definitionTypeToSymbolKind } from "../symbolTable";
import { normalizeTypeName } from "../utils";
import { ScopeManager } from "../scopeManager";
import { validateLabelSequences } from "../sequenceValidator";
import { validateDefinitionAttributes, validateSchemaObject } from "./attributeValidation";
import { DiagnosticRules, createDiagnostic, createDiagnosticWithData, MissingEndStatementData } from "../../diagnostics";

export * from '../../diagnostics';
export * from './validationUtils';
export * from './attributeValidation';
export * from './expressionValidation';
import { validateActionArity } from './arityValidation';

/**
 * Validate an entire source file
 * Runs all metadata-based validations
 */
export async function validateSourceFile(
    sourceFile: SourceFile,
    doc: TextDocument,
    symbolTable?: SymbolTable,
    scopeManager?: ScopeManager,
    resolveIncludePath?: (currentPath: string, name: string) => string | null,
    docManager?: import('../../docManager').DocManager
): Promise<Diagnostic[]> {
    const diagnostics: Diagnostic[] = [];
    const isXml = doc.languageId === 'xml' || doc.languageId === 'tdlxml' || doc.uri.toLowerCase().endsWith('.xml') || doc.uri.toLowerCase().endsWith('.tdlxml');

    let projectNodes: Set<string> | undefined;
    if (docManager) {
        projectNodes = docManager.getProjectNodes(doc.uri);
    }

    if (!scopeManager) {
        return diagnostics;
    }

    for (const def of sourceFile.definitions) {
        if (def.type) {
            const normalizedType = normalizeTypeName(def.type.text);
            
            if (scopeManager.globalScope.schemas.has(normalizedType)) {
                validateSchemaObject(def, def.type.text, doc, scopeManager, diagnostics);
                continue;
            }
            
            // Check for circular includes
            if (normalizedType === 'include' || normalizedType === 'import') {
                if (def.name && docManager) {
                    if (docManager.hasCircularIncludes(doc.uri)) {
                        diagnostics.push(createDiagnostic(
                            DiagnosticRules.CircularInclude,
                            { start: doc.positionAt(def.name.start), end: doc.positionAt(def.name.end) },
                            def.name.text
                        ));
                    }
                }
            }

            // System definitions use a different attribute structure, skip them
            if (normalizedType === 'system') {
                continue;
            }
        }

        // Validate attributes
        diagnostics.push(...validateDefinitionAttributes(def, doc, scopeManager, symbolTable, projectNodes));

        // Validate duplicate definitions and modifiers
        if (!isXml && !def.isIncomplete && def.name && def.type) {
            const defType = def.type.text;
            const defName = def.name.text;
            const kind = definitionTypeToSymbolKind(defType);
            const lowerDefType = defType.toLowerCase();

            // Skip duplicate checks for Include and Import
            if (lowerDefType !== 'include' && lowerDefType !== 'import') {
                const typeMap = scopeManager.existingDefinitions.get(normalizeTypeName(defType));
                const existsInMetadata = typeMap ? typeMap.has(normalizeTypeName(defName)) : false;

                if (!def.modifier) {
                // Rule 1: No duplicate new definitions allowed
                // Check against Default TDL
                if (existsInMetadata) {
                    const startPos = doc.positionAt(def.name.start);
                    const endPos = doc.positionAt(def.name.end);

                    diagnostics.push(createDiagnostic(
                        DiagnosticRules.DuplicateDefinition,
                        { start: startPos, end: endPos },
                        defName
                    ));
                } else if (scopeManager) {
                    // Check against Workspace (excluding modifiers)
                    const existingDefMap = scopeManager.projectScope.definitions.get(normalizeTypeName(defType));
                    const existingDef = existingDefMap?.get(normalizeTypeName(defName));
                    
                    // projectScope.definitions only contains original definitions (no modifiers/incomplete)
                    const isDuplicateInWorkspace = existingDef && (existingDef.uri !== doc.uri || existingDef.start !== def.start);
                    
                    if (isDuplicateInWorkspace) {
                        const startPos = doc.positionAt(def.name.start);
                        const endPos = doc.positionAt(def.name.end);

                        diagnostics.push(createDiagnostic(
                            DiagnosticRules.DuplicateDefinition,
                            { start: startPos, end: endPos },
                            defName
                        ));
                    }
                }
            } else {
                // Rule 2: Modifiers must modify an existing definition
                if (scopeManager) {
                    const existingDefMap = scopeManager.projectScope.definitions.get(normalizeTypeName(defType));
                    const existsInWorkspace = existingDefMap ? existingDefMap.has(normalizeTypeName(defName)) : false;
                    
                    if (!existsInMetadata && !existsInWorkspace) {
                        diagnostics.push(createDiagnostic(
                            DiagnosticRules.ModifierMissingTarget,
                            { start: doc.positionAt(def.name.start), end: doc.positionAt(def.name.end) },
                            defName
                        ));
                    }
                }
            }
            }
        }
        
        // Check for undefined variables in attributes and statements
        if (scopeManager) {
            const scope = scopeManager.getScopeAt(doc.uri, def.start);
            if (scope) {
                const checkVariable = (node: Node) => {
                    if (node.kind === SyntaxKind.Identifier) {
                        const ident = node as IdentifierNode;
                        if (ident.text.startsWith('##') || ident.text.startsWith('#')) {
                            const varName = ident.text.replace(/^##?/, '');
                            const resolved = scopeManager.resolve(varName, scope);
                            if (!resolved) {
                                diagnostics.push(createDiagnostic(
                                    DiagnosticRules.UndefinedVariable,
                                    { start: doc.positionAt(node.start), end: doc.positionAt(node.end) },
                                    ident.text
                                ));
                            }
                        }
                    } else if (node.kind === SyntaxKind.FunctionCall) {
                        for (const arg of (node as FunctionCallNode).arguments) {
                            checkVariable(arg);
                        }
                    } else if (node.kind === SyntaxKind.Statement && 'operator' in node) {
                        const binExpr = node as BinaryExpressionNode;
                        if (binExpr.left) checkVariable(binExpr.left);
                        if (binExpr.right) checkVariable(binExpr.right);
                    }
                };

                for (const attr of def.attributes) {
                    for (const val of attr.value) {
                        checkVariable(val);
                    }
                }

                const labels = new Set<string>();
                const checkStatement = (stmt: any, inLoop: boolean = false) => {
                    if (stmt instanceof BreakNode || stmt instanceof ContinueNode) {
                        if (!inLoop) {
                            diagnostics.push(createDiagnostic(
                                DiagnosticRules.InvalidLoopStatement,
                                { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                stmt.action?.text
                            ));
                        }
                    }

                    if (stmt instanceof ReturnNode) {
                        if (def.type.text.toUpperCase() !== "FUNCTION") {
                            diagnostics.push(createDiagnostic(
                                DiagnosticRules.InvalidReturn,
                                { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) }
                            ));
                        }
                    }

                    if (stmt instanceof SetNode || stmt instanceof ExchangeNode || stmt instanceof IncrementNode || stmt instanceof DecrementNode) {
                        if (stmt.args.length < 1) {
                            diagnostics.push(createDiagnostic(
                                DiagnosticRules.MissingTargetVariable,
                                { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                stmt.action?.text
                            ));
                        } else {
                            const arg1 = stmt.args[0];
                            if (arg1.kind !== SyntaxKind.VariableReference && arg1.kind !== SyntaxKind.Identifier && arg1.kind !== SyntaxKind.FieldReference) {
                                diagnostics.push(createDiagnostic(
                                    DiagnosticRules.InvalidTargetVariable,
                                    { start: doc.positionAt(arg1.start || stmt.start), end: doc.positionAt(arg1.end || stmt.end) },
                                    stmt.action?.text
                                ));
                            }
                        }

                        if (stmt instanceof SetNode || stmt instanceof ExchangeNode) {
                            if (stmt.args.length < 2) {
                                diagnostics.push(createDiagnostic(
                                    DiagnosticRules.MissingArgument,
                                    { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                    stmt.action?.text,
                                    2
                                ));
                            }
                            if (stmt instanceof ExchangeNode && stmt.args.length >= 2) {
                                const arg2 = stmt.args[1];
                                if (arg2.kind !== SyntaxKind.VariableReference && arg2.kind !== SyntaxKind.Identifier && arg2.kind !== SyntaxKind.FieldReference) {
                                    diagnostics.push(createDiagnostic(
                                        DiagnosticRules.InvalidExchangeArgument,
                                        { start: doc.positionAt(arg2.start || stmt.start), end: doc.positionAt(arg2.end || stmt.end) }
                                    ));
                                }
                            }
                        }
                    }

                    if (stmt.label) {
                        let labelText = '';
                        if (stmt.label.kind === SyntaxKind.Identifier) {
                            labelText = stmt.label.text;
                        } else if (stmt.label.kind === SyntaxKind.Literal) {
                            labelText = stmt.label.value?.toString();
                        }

                        if (labelText) {
                            const normalizedLabel = labelText.toLowerCase();
                            if (labels.has(normalizedLabel)) {
                                diagnostics.push(createDiagnostic(
                                    DiagnosticRules.DuplicateLabel,
                                    { start: doc.positionAt(stmt.label.start), end: doc.positionAt(stmt.label.end) },
                                    labelText
                                ));
                            } else {
                                labels.add(normalizedLabel);
                            }
                        }
                    }

                    if (stmt.action) {
                        const actionName = stmt.action.text;
                        // Actions are already indexed by alias key in metadataLoader
                        const foundAction = scopeManager.globalScope.actions.get(normalizeTypeName(actionName));

                        if (!foundAction) {
                            diagnostics.push(createDiagnostic(
                                DiagnosticRules.UnknownAction,
                                { start: doc.positionAt(stmt.action.start), end: doc.positionAt(stmt.action.end) },
                                actionName
                            ));
                        } else {
                            validateActionArity(stmt, doc, scopeManager, diagnostics);
                        }
                    }
                    
                    if (stmt.args) {
                        for (const arg of stmt.args) {
                            checkVariable(arg);
                        }
                    }

                    const isLoop = stmt instanceof WhileNode || stmt instanceof WalkNode || stmt instanceof ForNode;
                    if (stmt.statements) {
                        for (const s of stmt.statements) checkStatement(s, inLoop || isLoop);
                    }
                    if (stmt.elseStatements) {
                        for (const s of stmt.elseStatements) checkStatement(s, inLoop || isLoop);
                    }
                    if (stmt.endStatement) {
                        checkStatement(stmt.endStatement, inLoop || isLoop);
                    }
                    if (stmt instanceof DoIfNode && stmt.actionStatement) {
                        checkStatement(stmt.actionStatement, inLoop);
                    }
                    if (stmt instanceof BlockStatementNode) {
                        const blockStmt = stmt;
                        if (!blockStmt.endStatement) {
                            let expectedEnd = 'End Block';
                            const actText = stmt.action.text.toLowerCase();
                            if (actText === 'if') expectedEnd = 'End If';
                            else if (actText === 'while') expectedEnd = 'End While';
                            else if (actText === 'walk collection') expectedEnd = 'End Walk';
                            else if (actText.startsWith('for ')) expectedEnd = 'End For';
                            else if (actText === 'start block') expectedEnd = 'End Block';
                            
                            const diag = createDiagnosticWithData<MissingEndStatementData>(
                                DiagnosticRules.MissingEndStatement,
                                { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                { expectedEnd },
                                expectedEnd.replace('End ', '')
                            );
                            diagnostics.push(diag);
                        }
                    }
                };

                if (def.statements) {
                    for (const stmt of def.statements) {
                        checkStatement(stmt);
                    }
                }
            }
        }
    }
    
    // Add sequence validation
    diagnostics.push(...validateLabelSequences(sourceFile, doc));

    return diagnostics;
}
