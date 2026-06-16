import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile, SyntaxKind, IdentifierNode, FunctionCallNode, BinaryExpressionNode, Node, BreakNode, ContinueNode, ReturnNode, SetNode, ExchangeNode, IncrementNode, DecrementNode, WhileNode, WalkNode, ForNode, DoIfNode } from "../../parser/ast";
import { TdlMetadata } from "../../tdlMetaData";
import { SymbolTable, definitionTypeToSymbolKind } from "../symbolTable";
import { normalizeTypeName } from "../utils";
import { ScopeManager } from "../scopeManager";
import { validateLabelSequences } from "../sequenceValidator";
import { validateDefinitionAttributes, validateSchemaObject } from "./attributeValidation";
import { MISSING_END_STATEMENT_DIAGNOSTIC_CODE } from "./validationConstants";

export * from './validationConstants';
export * from './validationUtils';
export * from './attributeValidation';
export * from './expressionValidation';

/**
 * Validate an entire source file
 * Runs all metadata-based validations
 */
export async function validateSourceFile(
    sourceFile: SourceFile,
    doc: TextDocument,
    metadata: TdlMetadata,
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

    for (const def of sourceFile.definitions) {
        if (def.type) {
            const normalizedType = normalizeTypeName(def.type.text);
            const typeUpper = def.type.text.toUpperCase();
            
            if (metadata.primarySchemaNames && metadata.primarySchemaNames.some(s => s.toUpperCase() === typeUpper)) {
                validateSchemaObject(def, def.type.text, doc, metadata, diagnostics);
                continue;
            }
            
            // Check for circular includes
            if (normalizedType === 'include' || normalizedType === 'import') {
                if (def.name && docManager) {
                    if (docManager.hasCircularIncludes(doc.uri)) {
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: { start: doc.positionAt(def.name.start), end: doc.positionAt(def.name.end) },
                            message: `Circular include detected: '${def.name.text}' creates an infinite loop`,
                            source: 'tdl'
                        });
                    }
                }
            }

            // Disable validation for specific definition types as requested
            if (['collection', 'field', 'system','object'].includes(normalizedType)) {
                continue;
            }
        }

        // Validate attributes
        diagnostics.push(...validateDefinitionAttributes(def, doc, metadata, symbolTable, projectNodes));

        // Validate duplicate definitions and modifiers
        if (!isXml && !def.isIncomplete && def.name && def.type) {
            const defType = def.type.text;
            const defName = def.name.text;
            const kind = definitionTypeToSymbolKind(defType);

            // Find matching definition type in metadata (case-insensitive)
            let existsInMetadata = metadata.isExistingDefinition(defType, defName);

            if (!def.modifier || def.modifier.Text === '!') {
                // Rule 1: No duplicate new definitions allowed
                // Check against Default TDL
                if (existsInMetadata) {
                    const startPos = doc.positionAt(def.name.start);
                    const endPos = doc.positionAt(def.name.end);

                    diagnostics.push({
                        severity: DiagnosticSeverity.Error,
                        range: { start: startPos, end: endPos },
                        message: `Definition '${defName}' already exists in default TDL`,
                        source: 'tdl'
                    });
                } else if (symbolTable) {
                    // Check against Workspace (excluding modifiers)
                    const allSymbols = symbolTable.findAllByName(defName);
                    const originalDefs = allSymbols.filter(s => s.kind === kind && !s.isModifier);
                    
                    // If there are multiple original definitions with this name, it's a duplicate.
                    // We only flag if we aren't the *first* one (to avoid double errors, or we can just flag all).
                    // Actually, if there is ANY original definition that isn't us (different start pos or different uri), it's a duplicate.
                    const isDuplicateInWorkspace = originalDefs.some(s => s.uri !== doc.uri || s.start !== def.start);
                    
                    if (isDuplicateInWorkspace) {
                        const startPos = doc.positionAt(def.name.start);
                        const endPos = doc.positionAt(def.name.end);

                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: { start: startPos, end: endPos },
                            message: `Duplicate definition: '${defName}' is already defined in the workspace`,
                            source: 'tdl'
                        });
                    }
                }
            } else {
                // Rule 2: Modifiers must modify an existing definition
                if (symbolTable) {
                    const allSymbols = symbolTable.findAllByName(defName);
                    const existsInWorkspace = allSymbols.some(s => s.kind === kind && !s.isModifier);
                    
                    if (!existsInMetadata && !existsInWorkspace) {
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: { start: doc.positionAt(def.name.start), end: doc.positionAt(def.name.end) },
                            message: `Modified definition '${defName}' does not exist. You must define it before modifying it.`,
                            source: 'tdl'
                        });
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
                                diagnostics.push({
                                    severity: DiagnosticSeverity.Warning,
                                    range: { start: doc.positionAt(node.start), end: doc.positionAt(node.end) },
                                    message: `Undefined variable or field: '${ident.text}'`,
                                    source: 'tdl'
                                });
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
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                message: `'${stmt.action?.text}' statement can only be used inside a loop (While, Walk, For)`,
                                source: 'tdl'
                            });
                        }
                    }

                    if (stmt instanceof ReturnNode) {
                        if (def.type.text.toUpperCase() !== "FUNCTION") {
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                message: `'Return' statement can only be used inside a Function definition`,
                                source: 'tdl'
                            });
                        }
                    }

                    if (stmt instanceof SetNode || stmt instanceof ExchangeNode || stmt instanceof IncrementNode || stmt instanceof DecrementNode) {
                        if (stmt.args.length < 1) {
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                message: `'${stmt.action?.text}' statement requires at least a target variable`,
                                source: 'tdl'
                            });
                        } else {
                            const arg1 = stmt.args[0];
                            if (arg1.kind !== SyntaxKind.VariableReference && arg1.kind !== SyntaxKind.Identifier && arg1.kind !== SyntaxKind.FieldReference) {
                                diagnostics.push({
                                    severity: DiagnosticSeverity.Error,
                                    range: { start: doc.positionAt(arg1.start || stmt.start), end: doc.positionAt(arg1.end || stmt.end) },
                                    message: `First argument of '${stmt.action?.text}' must be a variable or field reference`,
                                    source: 'tdl'
                                });
                            }
                        }

                        if (stmt instanceof SetNode || stmt instanceof ExchangeNode) {
                            if (stmt.args.length < 2) {
                                diagnostics.push({
                                    severity: DiagnosticSeverity.Error,
                                    range: { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                    message: `'${stmt.action?.text}' statement requires 2 arguments`,
                                    source: 'tdl'
                                });
                            }
                            if (stmt instanceof ExchangeNode && stmt.args.length >= 2) {
                                const arg2 = stmt.args[1];
                                if (arg2.kind !== SyntaxKind.VariableReference && arg2.kind !== SyntaxKind.Identifier && arg2.kind !== SyntaxKind.FieldReference) {
                                    diagnostics.push({
                                        severity: DiagnosticSeverity.Error,
                                        range: { start: doc.positionAt(arg2.start || stmt.start), end: doc.positionAt(arg2.end || stmt.end) },
                                        message: `Second argument of 'Exchange' must be a variable or field reference`,
                                        source: 'tdl'
                                    });
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
                                diagnostics.push({
                                    severity: DiagnosticSeverity.Error,
                                    range: { start: doc.positionAt(stmt.label.start), end: doc.positionAt(stmt.label.end) },
                                    message: `Duplicate label '${labelText}' in function`,
                                    source: 'tdl'
                                });
                            } else {
                                labels.add(normalizedLabel);
                            }
                        }
                    }

                    if (stmt.action) {
                        const actionName = stmt.action.text;
                        const actionDef = metadata.actions.find(a => 
                            normalizeTypeName(a.Name) === normalizeTypeName(actionName) || 
                            (a.Aliases && a.Aliases.split(',').map(al => normalizeTypeName(al.trim())).includes(normalizeTypeName(actionName)))
                        );
                        if (!actionDef) {
                            diagnostics.push({
                                severity: DiagnosticSeverity.Warning,
                                range: { start: doc.positionAt(stmt.action.start), end: doc.positionAt(stmt.action.end) },
                                message: `Unknown action '${actionName}'`,
                                source: 'tdl'
                            });
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
                    if (stmt.statements !== undefined && 'endStatement' in stmt) {
                        const blockStmt = stmt as any;
                        if (!blockStmt.endStatement) {
                            let expectedEnd = 'End Block';
                            const actText = stmt.action.text.toLowerCase();
                            if (actText === 'if') expectedEnd = 'End If';
                            else if (actText === 'while') expectedEnd = 'End While';
                            else if (actText === 'walk collection') expectedEnd = 'End Walk';
                            else if (actText.startsWith('for ')) expectedEnd = 'End For';
                            else if (actText === 'start block') expectedEnd = 'End Block';
                            
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: { start: doc.positionAt(stmt.start), end: doc.positionAt(stmt.end) },
                                message: `Statement block must end with '${expectedEnd}'`,
                                code: MISSING_END_STATEMENT_DIAGNOSTIC_CODE,
                                source: 'tdl',
                                data: { expectedEnd }
                            });
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
