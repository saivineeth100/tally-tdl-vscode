import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";
import { TextDocument } from 'vscode-languageserver-textdocument';
import { SourceFile, DefinitionNode, SyntaxKind, IdentifierNode, LiteralNode, FunctionCallNode, BinaryExpressionNode, UnaryExpressionNode, Node } from "../parser/ast";
import { TokenKind } from "../parser/tokenKind";

import { TdlMetadata, TDLDefinition } from "../tdlMetaData";
import { SymbolTable, definitionTypeToSymbolKind } from "./symbolTable";
import { normalizeTypeName } from "./utils";
import { ScopeManager } from "./scopeManager";
import { validateLabelSequences } from "./sequenceValidator";
import * as fs from 'fs';
import { URI } from 'vscode-uri';

export const MISSING_DEFINITION_DIAGNOSTIC_CODE = 'missing_definition';

/**
 * Check if an attribute name matches a definition (by name or alias)
 */
export function attributeMatches(attrName: string, def: TDLDefinition): boolean {
    const normalizedAttr = normalizeTypeName(attrName);

    // Check primary name
    if (normalizeTypeName(def.Name) === normalizedAttr) {
        return true;
    }

    // Check aliases
    if (def.Aliases) {
        const aliases = def.Aliases.split(',').map(a => normalizeTypeName(a.trim()));
        if (aliases.includes(normalizedAttr)) {
            return true;
        }
    }

    return false;
}

/**
 * Get allowed attributes for a definition type from metadata
 */
export function getAllowedAttributes(defTypeName: string, metadata: TdlMetadata): TDLDefinition[] | undefined {
    const normalizedDefType = normalizeTypeName(defTypeName);

    for (const [defType, attributes] of metadata.definitions) {
        if (normalizeTypeName(defType) === normalizedDefType) {
            return attributes;
        }
    }
    return undefined;
}

/**
 * Check if two TDL datatypes are compatible
 * Some types can be used interchangeably or are subsets of others
 */
function areTypesCompatible(expected: string, actual: string): boolean {
    // Same type after normalization
    if (expected === actual) return true;

    // Compatible type pairs (expected -> allowed actuals)
    const compatibleTypes: { [key: string]: string[] } = {
        'string': ['number', 'amount', 'quantity', 'date', 'datetime', 'logical', 'long'],
        'number': ['amount', 'quantity', 'rate', 'long'],
        'datetime': ['date'],
        'date': ['datetime'],
        'long': ['number'],
        'amount': ['number'],
        'quantity': ['number'],
    };

    const allowed = compatibleTypes[expected];
    if (allowed && allowed.includes(actual)) {
        return true;
    }

    return false;
}

/**
 * Recursively validate function calls - checks return type and validates nested function arguments
 * @param funcNode The function call AST node to validate
 * @param expectedType The expected return type (if any)
 * @param doc The text document for position calculation
 * @param metadata TDL metadata containing function definitions
 * @param diagnostics Array to push diagnostics into
 */
function validateFunctionCall(
    funcNode: FunctionCallNode,
    expectedType: string | undefined,
    doc: TextDocument,
    metadata: TdlMetadata,
    diagnostics: Diagnostic[]
): void {
    const funcName = funcNode.functionName?.text;
    if (!funcName) return;

    const func = metadata.functions.find(f => f.Name.toLowerCase() === funcName.toLowerCase());
    if (!func) return;

    // 1. Validate return type if expected type is provided
    if (expectedType && func.ReturnType) {
        const normalizedExpected = normalizeTypeName(expectedType);
        const normalizedReturn = normalizeTypeName(func.ReturnType);

        if (normalizedExpected !== normalizedReturn && !areTypesCompatible(normalizedExpected, normalizedReturn)) {
            const startPos = doc.positionAt(funcNode.start);
            const endPos = doc.positionAt(funcNode.end);
            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: { start: startPos, end: endPos },
                message: `Function '$$${funcName}' returns '${func.ReturnType}' but expected '${expectedType}'`,
                source: 'tdl'
            });
        }
    }

    // 2. Recursively validate function arguments
    if (funcNode.arguments && func.Parameters) {
        for (let i = 0; i < funcNode.arguments.length; i++) {
            const argNode = funcNode.arguments[i];
            const paramDef = func.Parameters[i];

            if (!paramDef) continue;

            // If argument is a nested function call, recursively validate
            if (argNode.kind === SyntaxKind.FunctionCall) {
                validateFunctionCall(
                    argNode as FunctionCallNode,
                    paramDef.DataType,
                    doc,
                    metadata,
                    diagnostics
                );
            }
        }
    }
}

/**
 * Validate binary expressions for type compatibility
 */
function validateBinaryExpression(
    exprNode: Node,
    doc: TextDocument,
    metadata: TdlMetadata,
    diagnostics: Diagnostic[]
) {
    if (exprNode.kind === SyntaxKind.Statement && 'operator' in exprNode && 'left' in exprNode && 'right' in exprNode) {
        const binExpr = exprNode as BinaryExpressionNode;
        const leftType = inferExpressionType(binExpr.left, metadata);
        const rightType = inferExpressionType(binExpr.right, metadata);
        
        if (leftType && rightType) {
            const normalizedLeft = normalizeTypeName(leftType);
            const normalizedRight = normalizeTypeName(rightType);
            if (normalizedLeft !== normalizedRight && !areTypesCompatible(normalizedLeft, normalizedRight) && !areTypesCompatible(normalizedRight, normalizedLeft)) {
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: { start: doc.positionAt(exprNode.start), end: doc.positionAt(exprNode.end) },
                    message: `Type mismatch in binary expression: Cannot combine '${leftType}' and '${rightType}'`,
                    source: 'tdl'
                });
            }
        }
        
        validateBinaryExpression(binExpr.left, doc, metadata, diagnostics);
        validateBinaryExpression(binExpr.right, doc, metadata, diagnostics);
    } else if (exprNode.kind === SyntaxKind.FunctionCall) {
        const funcNode = exprNode as FunctionCallNode;
        if (funcNode.arguments) {
            for (const arg of funcNode.arguments) {
                validateBinaryExpression(arg, doc, metadata, diagnostics);
            }
        }
    }
}

/**
 * Infer the return type of an expression
 */
export function inferExpressionType(exprNode: Node, metadata: TdlMetadata): string | undefined {
    if (exprNode.kind === SyntaxKind.Literal) {
        const lit = exprNode as LiteralNode;
        return typeof lit.value === 'number' ? 'Number' : 'String';
    }
    
    if (exprNode.kind === SyntaxKind.FunctionCall) {
        const funcNode = exprNode as FunctionCallNode;
        const funcName = funcNode.functionName?.text;
        if (funcName) {
            const func = metadata.functions.find(f => f.Name.toLowerCase() === funcName.toLowerCase());
            if (func && func.ReturnType) {
                return func.ReturnType;
            }
        }
        return undefined;
    }
    
    // BinaryExpressionNode
    if ('operator' in exprNode && 'left' in exprNode) {
        const binExpr = exprNode as BinaryExpressionNode;
        const opKind = binExpr.operator.Kind;
        // Arithmetic
        if (opKind === TokenKind.PlusToken || opKind === TokenKind.MinusToken || opKind === TokenKind.MultiplyToken || opKind === TokenKind.DivisionToken || opKind === TokenKind.PercentToken) {
            return 'Number';
        }
        // Comparison & Logical & String operators
        if (opKind === TokenKind.EqualsToken || opKind === TokenKind.NotEqualsToken || 
            opKind === TokenKind.LessThanToken || opKind === TokenKind.GreaterThanToken || 
            opKind === TokenKind.LessThanEqualsToken || opKind === TokenKind.GreaterThanEqualsToken ||
            opKind === TokenKind.InToken || opKind === TokenKind.BetweenToken || opKind === TokenKind.NullToken ||
            opKind === TokenKind.AndToken || opKind === TokenKind.OrToken || 
            opKind === TokenKind.ContainsToken || opKind === TokenKind.ContainingToken ||
            opKind === TokenKind.StartingToken || opKind === TokenKind.StartingWithToken ||
            opKind === TokenKind.EndingToken || opKind === TokenKind.EndingWithToken ||
            opKind === TokenKind.LikeToken) {
            return 'Logical';
        }
    }
    
    // UnaryExpressionNode
    if ('operator' in exprNode && !('left' in exprNode)) {
        const unExpr = exprNode as UnaryExpressionNode;
        const opKind = unExpr.operator.Kind;
        if (opKind === TokenKind.NotToken) {
            return 'Logical';
        }
        if (opKind === TokenKind.MinusToken || opKind === TokenKind.PlusToken) {
            return 'Number';
        }
    }
    
    return undefined;
}


/**
 * Validate a single attribute against allowed attributes
 * @returns true if the attribute is valid (allowed or no metadata available)
 */
export function isValidAttribute(attrName: string, defTypeName: string, metadata: TdlMetadata): boolean {
    const allowedAttrs = getAllowedAttributes(defTypeName, metadata);
    if (!allowedAttrs) return true; // No metadata = assume valid
    return allowedAttrs.some(allowed => attributeMatches(attrName, allowed));
}
export function validateDefinitionAttributes(
    def: DefinitionNode,
    doc: TextDocument,
    metadata: TdlMetadata,
    symbolTable?: SymbolTable,
    scopeManager?: ScopeManager
): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const defTypeName = def.type.text;
    const allowedAttrs = getAllowedAttributes(defTypeName, metadata);

    // Skip validation if we don't have metadata for this definition type
    if (!allowedAttrs) {
        return diagnostics;
    }

    for (const attr of def.attributes) {
        const attrName = attr.name.text;

        // Check if this attribute is allowed for the definition type
        const attrDef = allowedAttrs.find(allowed => attributeMatches(attrName, allowed));

        if (!attrDef) {
            const startPos = doc.positionAt(attr.name.start);
            const endPos = doc.positionAt(attr.name.end);

            diagnostics.push({
                severity: DiagnosticSeverity.Warning,
                range: { start: startPos, end: endPos },
                message: `Unknown attribute '${attrName}' for ${defTypeName} definition`,
                source: 'tdl'
            });
            continue;
        }

        // Validate Parameters
        if (attrDef.Parameters && attrDef.Parameters.length > 0) {
            // 1. Mandatory Parameter Validation
            let lastMandatoryIndex = -1;
            for (let i = 0; i < attrDef.Parameters.length; i++) {
                if (attrDef.Parameters[i].IsMandatory) {
                    lastMandatoryIndex = i;
                }
            }
            const minRequired = lastMandatoryIndex + 1;
            const providedCount = attr.value.length;

            if (providedCount < minRequired) {
                const startPos = doc.positionAt(attr.name.start);
                const endPos = doc.positionAt(attr.name.end);
                diagnostics.push({
                    severity: DiagnosticSeverity.Warning,
                    range: { start: startPos, end: endPos },
                    message: `Attribute '${attrDef.Name}' expects at least ${minRequired} parameter(s). Provided: ${providedCount}`,
                    source: 'tdl'
                });
            } else {
                // Check if any mandatory parameter is skipped (EmptyNode)
                for (let i = 0; i <= lastMandatoryIndex; i++) {
                    if (i < attr.value.length) {
                        const node = attr.value[i];
                        if (node.kind === SyntaxKind.Empty) {
                            const startPos = doc.positionAt(node.start);
                            const endPos = doc.positionAt(node.end);
                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: { start: startPos, end: endPos },
                                message: `Missing mandatory parameter: ${attrDef.Parameters[i].ParameterType || `at position ${i + 1}`}`,
                                source: 'tdl'
                            });
                        }
                    }
                }
            }

            // 2. Datatype Validation (always runs)
            for (let i = 0; i < attr.value.length; i++) {
                if (i >= attrDef.Parameters.length) break;

                const paramDef = attrDef.Parameters[i];
                const paramNode = attr.value[i];

                if (paramNode.kind === SyntaxKind.Empty) continue;

                // Expression Type Validation
                const inferredType = inferExpressionType(paramNode, metadata);
                if (inferredType && paramDef.DataType) {
                    const normalizedExpected = normalizeTypeName(paramDef.DataType);
                    const normalizedInferred = normalizeTypeName(inferredType);

                    if (normalizedExpected !== normalizedInferred && !areTypesCompatible(normalizedExpected, normalizedInferred)) {
                        const startPos = doc.positionAt(paramNode.start);
                        const endPos = doc.positionAt(paramNode.end);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: startPos, end: endPos },
                            message: `Expected '${paramDef.DataType}' but provided expression evaluates to '${inferredType}'`,
                            source: 'tdl'
                        });
                    }
                }

                // Validate nested binary expressions
                validateBinaryExpression(paramNode, doc, metadata, diagnostics);

                // If it's a function call, validate arguments recursively
                if (paramNode.kind === SyntaxKind.FunctionCall) {
                    validateFunctionCall(
                        paramNode as FunctionCallNode,
                        undefined, // Return type is already checked above, just validate arguments
                        doc,
                        metadata,
                        diagnostics
                    );
                    continue; // Function handled, skip other validations for this node
                }

                // If it's another expression (binary/unary), we skip keyword/logical validation for the node itself
                if ('operator' in paramNode) {
                    continue;
                }

                let paramValue = '';
                if (paramNode.kind === SyntaxKind.Identifier) {
                    paramValue = (paramNode as IdentifierNode).text;
                } else if (paramNode.kind === SyntaxKind.Literal) {
                    paramValue = (paramNode as LiteralNode).value.toString();
                } else {
                    continue;
                }

                if (!paramValue || paramValue.startsWith('##') || paramValue.startsWith('$') || paramValue.startsWith('@')) continue;

                const cleanValue = paramValue.replace(/^["']|["']$/g, '');
                if (!cleanValue) continue;

                // Keyword Validation
                if (paramDef.ParameterType === 'Keyword' && paramDef.Keywords) {
                    const validKeywords = paramDef.Keywords.split(',').map(k => k.trim().toLowerCase());
                    if (!validKeywords.includes(cleanValue.toLowerCase())) {
                        const startPos = doc.positionAt(paramNode.start);
                        const endPos = doc.positionAt(paramNode.end);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: startPos, end: endPos },
                            message: `Invalid keyword '${cleanValue}'. Expected one of: ${paramDef.Keywords}`,
                            source: 'tdl'
                        });
                    }
                }

                // Logical Datatype Validation
                if (paramDef.DataType?.toLowerCase() === 'logical') {
                    const validLogical = ['yes', 'no', 'true', 'false', 'on', 'off', '0', '1'];
                    if (!validLogical.includes(cleanValue.toLowerCase())) {
                        const startPos = doc.positionAt(paramNode.start);
                        const endPos = doc.positionAt(paramNode.end);
                        diagnostics.push({
                            severity: DiagnosticSeverity.Warning,
                            range: { start: startPos, end: endPos },
                            message: `Invalid logical value '${cleanValue}'. Expected: Yes, No, True, False`,
                            source: 'tdl'
                        });
                    }
                }

                // Reference Validation (requires symbolTable)
                if (symbolTable && paramDef.RefersTo && !paramDef.KeywordSet) {
                    // Skip reference validation for Function Parameters as they define the variable
                    if (defTypeName.toLowerCase() === 'function' && attrDef.Name.toLowerCase() === 'parameter' && i === 0) {
                        continue;
                    }

                    const refersToType = paramDef.RefersTo.trim();
                    const refersToNormalized = normalizeTypeName(refersToType);

                    const kind = definitionTypeToSymbolKind(refersToType);
                    const userDefs = symbolTable.getNamesByKind(kind);
                    const isUserDef = userDefs.some(n => normalizeTypeName(n) === normalizeTypeName(cleanValue));

                    if (!isUserDef) {
                        let isRefFound = false;
                        const defTypeKey = Array.from(metadata.existingDefinitions.keys()).find(k => normalizeTypeName(k) === refersToNormalized);
                        if (defTypeKey) {
                            const defaultNames = metadata.existingDefinitions.get(defTypeKey) || [];
                            isRefFound = defaultNames.some(n => normalizeTypeName(n) === normalizeTypeName(cleanValue));
                        }

                        if (!isRefFound) {
                            const startPos = doc.positionAt(paramNode.start);
                            const endPos = doc.positionAt(paramNode.end);

                            diagnostics.push({
                                severity: DiagnosticSeverity.Error,
                                range: { start: startPos, end: endPos },
                                message: `Definition '${cleanValue}' of type '${refersToType}' not found`,
                                source: 'tdl',
                                code: MISSING_DEFINITION_DIAGNOSTIC_CODE,
                                data: { name: cleanValue, type: refersToType }
                            });
                        }
                    }
                }
            }
        }
    }

    return diagnostics;
}

/**
 * Validate an entire source file
 * Runs all metadata-based validations
 */
export function validateSourceFile(
    sourceFile: SourceFile,
    doc: TextDocument,
    metadata: TdlMetadata,
    symbolTable?: SymbolTable,
    scopeManager?: ScopeManager,
    resolveIncludePath?: (currentPath: string, name: string) => string | null
): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    const checkCircularIncludes = (currentFsPath: string, includeName: string, visitedPaths: Set<string>): boolean => {
        if (!resolveIncludePath) return false;
        const targetPath = resolveIncludePath(currentFsPath, includeName);
        if (!targetPath) return false;

        if (visitedPaths.has(targetPath)) return true;

        try {
            const content = fs.readFileSync(targetPath, 'utf8');
            const includeRegex = /\[\s*(?:Include|Import)\s*:\s*([^\]]+)\]/gi;
            let match;
            visitedPaths.add(targetPath);
            
            while ((match = includeRegex.exec(content)) !== null) {
                let nextInclude = match[1].trim();
                if (nextInclude.startsWith('"') && nextInclude.endsWith('"')) {
                    nextInclude = nextInclude.slice(1, -1);
                }
                if (checkCircularIncludes(targetPath, nextInclude, visitedPaths)) {
                    visitedPaths.delete(targetPath);
                    return true;
                }
            }
            visitedPaths.delete(targetPath);
        } catch (e) {
            visitedPaths.delete(targetPath);
        }
        
        return false;
    };

    for (const def of sourceFile.definitions) {
        if (def.type) {
            const normalizedType = normalizeTypeName(def.type.text);
            
            // Check for circular includes
            if (normalizedType === 'include' || normalizedType === 'import') {
                if (def.name) {
                    let includeName = def.name.text;
                    if (includeName.startsWith('"') && includeName.endsWith('"')) {
                        includeName = includeName.slice(1, -1);
                    }
                    const currentFsPath = URI.parse(doc.uri).fsPath;
                    const visited = new Set<string>([currentFsPath]);
                    if (checkCircularIncludes(currentFsPath, includeName, visited)) {
                        diagnostics.push({
                            severity: DiagnosticSeverity.Error,
                            range: { start: doc.positionAt(def.name.start), end: doc.positionAt(def.name.end) },
                            message: `Circular include detected: '${includeName}' creates an infinite loop`,
                            source: 'tdl'
                        });
                    }
                }
            }

            // Disable validation for specific definition types as requested
            if (['collection', 'field', 'system'].includes(normalizedType)) {
                continue;
            }
        }

        // Validate attributes
        diagnostics.push(...validateDefinitionAttributes(def, doc, metadata, symbolTable));

        // Validate duplicate definitions and modifiers
        if (!def.isIncomplete && def.name && def.type) {
            const defType = def.type.text;
            const defName = def.name.text;
            const kind = definitionTypeToSymbolKind(defType);

            // Find matching definition type in metadata (case-insensitive)
            const defTypeKey = Array.from(metadata.existingDefinitions.keys()).find(k => normalizeTypeName(k) === normalizeTypeName(defType));
            
            let existsInMetadata = false;
            if (defTypeKey) {
                const existingNames = metadata.existingDefinitions.get(defTypeKey) || [];
                existsInMetadata = existingNames.some(n => normalizeTypeName(n) === normalizeTypeName(defName));
            }

            if (!def.modifier) {
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
                const checkStatement = (stmt: any) => {
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

                    if (stmt.statements) {
                        for (const s of stmt.statements) checkStatement(s);
                    }
                    if (stmt.elseStatements) {
                        for (const s of stmt.elseStatements) checkStatement(s);
                    }
                    if (stmt.endStatement) {
                        checkStatement(stmt.endStatement);
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
