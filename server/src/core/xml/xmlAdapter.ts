import * as sax from 'sax';
import { 
    SourceFile, DefinitionNode, AttributeNode, StatementNode, 
    IdentifierNode, CommentNode, ComplexObjectNode, SyntaxKind
} from '../ast/ast';
import { Token } from '../lexer/token';
import { TokenKind } from '../lexer/tokenKind';
import { Parser } from '../parser/parser';
import { ScopeManager } from '../../semantics/scopeManager/index';

function astNodeToText(node: any): string {
    if (!node) return '';
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);

    if (node.kind === SyntaxKind.BinaryExpression) {
        const left = astNodeToText(node.left);
        const op = node.operator?.Text || '';
        const right = astNodeToText(node.right);
        return `${left} ${op} ${right}`.trim();
    }

    if (node.kind === SyntaxKind.UnaryExpression) {
        const op = node.operator?.Text || '';
        const right = astNodeToText(node.right);
        return `${op}${right}`.trim();
    }

    if (node.kind === SyntaxKind.MethodReference) {
        const method = astNodeToText(node.methodName);
        return method.startsWith('$') ? method : `$${method}`;
    }

    if (node.kind === SyntaxKind.FieldReference) {
        const field = astNodeToText(node.fieldName);
        return field.startsWith('#') ? field : `#${field}`;
    }

    if (node.kind === SyntaxKind.VariableReference) {
        const v = astNodeToText(node.variableName);
        return v.startsWith('##') ? v : `##${v}`;
    }

    if (node.kind === SyntaxKind.FormulaReference) {
        const f = astNodeToText(node.formulaName);
        return node.isGlobal ? `@${f}` : `@@${f}`;
    }

    if (node.kind === SyntaxKind.FunctionCall) {
        const fn = astNodeToText(node.functionName);
        const args = (node.arguments || []).map((a: any) => astNodeToText(a)).join(':');
        const prefix = fn.startsWith('$$') ? fn : `$$${fn}`;
        return args ? `${prefix}:${args}` : prefix;
    }

    if (node.tokens && Array.isArray(node.tokens) && node.tokens.length > 0) {
        const fullTokensText = node.tokens.map((t: any) => t.Text || '').join('');
        if (fullTokensText.length >= (node.text || '').length) {
            return fullTokensText;
        }
    }

    if (node.text !== undefined) return node.text;
    if (node.name?.text !== undefined) return node.name.text;
    if (node.value !== undefined) {
        if (typeof node.value === 'string' || typeof node.value === 'number') {
            return String(node.value);
        }
        if (Array.isArray(node.value)) {
            return node.value.map((item: any) => astNodeToText(item)).join(', ');
        }
    }

    return '';
}

interface TagState {
    name: string;
    start: number;
    hasChildren: boolean;
    startTagEnd: number;
    node: ComplexObjectNode;
}

export function parseXmlToAst(xmlText: string, scopeManager?: ScopeManager): SourceFile {
    const sourceFile = new SourceFile(0, xmlText.length);
    sourceFile.lineOffsets = computeLineOffsets(xmlText);

    const parser = sax.parser(false, { position: true, lowercase: false });
    
    let activeDefinition: DefinitionNode | null = null;
    const tagStack: TagState[] = [];
    
    const definitionWrappers = new Set(['TDLMESSAGE', 'TALLYMESSAGE', 'TDL']);
    const structuralWrappers = new Set(['ENVELOPE', 'HEADER', 'BODY', 'DATA', 'DESC', 'IMPORTDATA', 'EXPORTDATA', 'REQUESTDESC', 'REQUESTDATA', 'STATICVARIABLES']);
    const knownDefTypes = new Set([
        'FORM', 'PART', 'LINE', 'FIELD', 'MENU', 'REPORT', 'COLLECTION', 
        'BUTTON', 'KEY', 'SYSTEM', 'VARIABLE', 'STYLE', 'BORDER', 'COLOR',
        'OBJECT', 'FUNCTION', 'RULE', 'RULESET'
    ]);

    let insideTdlMessage = 0;
    let activeDefinitionStartTagEnd = 0;
    
    function padEntities(text: string): string {
        return text
            .replace(/&quot;/g, '"    ')
            .replace(/&apos;/g, "'     ")
            .replace(/&amp;/g, '&    ')
            .replace(/&lt;/g, '<   ')
            .replace(/&gt;/g, '>   ');
    }

    parser.onopentag = (node) => {
        const tagUpper = node.name.toUpperCase();
        if (tagUpper === 'W' && !activeDefinition) return;
        
        if (definitionWrappers.has(tagUpper)) {
            insideTdlMessage++;
            return;
        }
        
        if (structuralWrappers.has(tagUpper) && !activeDefinition) {
            return;
        }
        
        if (!activeDefinition) {
            const hasName = node.attributes['NAME'] !== undefined;
            
            // Check if it's a primary schema
            let isPrimarySchema = false;
            if (scopeManager) {
                // TODO: Maybe use globalScope.schemas instead
                isPrimarySchema = scopeManager.globalScope.schemas.has(tagUpper);
            }

            if (insideTdlMessage > 0 || hasName || knownDefTypes.has(tagUpper) || isPrimarySchema) {
                let startPos = parser.startTagPosition - 4;
                if (startPos < 0) startPos = 0;
                
                const openBracketToken = new Token(TokenKind.OpenSquareBracketToken, startPos, startPos, 1);
                openBracketToken.Text = '[';
                
                const typeToken = new Token(TokenKind.DefinitionTypeToken, startPos + 1, startPos + 1, node.name.length);
                typeToken.Text = node.name;
                const typeIdent = new IdentifierNode([typeToken], node.name);
                
                const closeBracketToken = new Token(TokenKind.CloseSquareBracketToken, startPos + node.name.length + 1, startPos + node.name.length + 1, 1);
                closeBracketToken.Text = ']';
                
                activeDefinition = new DefinitionNode(startPos, startPos, openBracketToken, typeIdent, closeBracketToken);
                
                const isSystemTag = node.name.toUpperCase() === 'SYSTEM';
                const systemTypeVal = isSystemTag ? (node.attributes['TYPE'] as string) : undefined;
                
                if (isSystemTag && systemTypeVal) {
                    const typeToken = new Token(TokenKind.IdentifierToken, startPos + 1, startPos + 1, systemTypeVal.length);
                    typeToken.Text = systemTypeVal;
                    activeDefinition.name = new IdentifierNode([typeToken], systemTypeVal);
                    if (node.attributes['NAME'] !== undefined) {
                        (activeDefinition as any).systemItemName = node.attributes['NAME'] as string;
                    }
                } else if (node.attributes['NAME'] !== undefined) {
                    const nameAttrVal = (node.attributes['NAME'] as string) || '';
                    const currentPos = parser.position;
                    const openingTagText = xmlText.substring(startPos, currentPos);
                    
                    let nameStartInTag = 0;
                    const nameAttrIndex = openingTagText.indexOf('NAME');
                    if (nameAttrIndex !== -1) {
                        const equalIndex = openingTagText.indexOf('=', nameAttrIndex);
                        if (equalIndex !== -1) {
                            const quoteIndex = openingTagText.indexOf('"', equalIndex);
                            if (quoteIndex !== -1) {
                                nameStartInTag = quoteIndex + 1;
                            } else {
                                const singleQuoteIndex = openingTagText.indexOf("'", equalIndex);
                                if (singleQuoteIndex !== -1) {
                                    nameStartInTag = singleQuoteIndex + 1;
                                 }
                            }
                        }
                    }
                    
                    const nameAbsStart = startPos + nameStartInTag;
                    const nameToken = new Token(TokenKind.IdentifierToken, nameAbsStart, nameAbsStart, nameAttrVal.length);
                    nameToken.Text = nameAttrVal;
                    activeDefinition.name = new IdentifierNode([nameToken], nameAttrVal);
                }
                
                if (node.attributes['ISMODIFY'] === 'Yes') {
                    const mod = new Token(TokenKind.HashToken, startPos, startPos, 1);
                    mod.Text = '#';
                    activeDefinition.modifier = mod;
                } else if (node.attributes['ISOPTION'] === 'Yes') {
                    const mod = new Token(TokenKind.ExclamationToken, startPos, startPos, 1);
                    mod.Text = '!';
                    activeDefinition.modifier = mod;
                } else if (node.attributes['ISINITIALIZE'] === 'Yes') {
                    const mod = new Token(TokenKind.AsteriskToken, startPos, startPos, 1);
                    mod.Text = '*';
                    activeDefinition.modifier = mod;
                }
                
                (activeDefinition as any).xmlAttributes = node.attributes;
                
                // Parse other attributes as TDL attributes
                for (const attrKey of Object.keys(node.attributes)) {
                    const upperKey = attrKey.toUpperCase();
                    if (upperKey === 'NAME' || upperKey === 'ACTION' || upperKey === 'ISMODIFY' || upperKey === 'ISOPTION' || upperKey === 'ISINITIALIZE' || upperKey === 'ISFIXED' || upperKey === 'ISINTERNAL' || (isSystemTag && upperKey === 'TYPE')) continue;
                    
                    const attrVal = node.attributes[attrKey] as string;
                    const attrText = `${attrKey} : ${attrVal}`;
                    const tempParser = new Parser(attrText);
                    const attrs = tempParser.parseStandaloneAttributes();
                    if (attrs.length > 0) {
                        const attr = attrs[0];
                        adjustNodeOffsets(attr, startPos);
                        activeDefinition.attributes.push(attr);
                    }
                }
                
                activeDefinitionStartTagEnd = parser.position - 3;
                return;
            }
        }

        let isNewDef = false;
        if (scopeManager && !scopeManager.globalScope.schemas.has(tagUpper)) {
            if (knownDefTypes.has(tagUpper) && node.attributes['NAME'] !== undefined) {
                isNewDef = true;
            }
        } else if (knownDefTypes.has(tagUpper) && node.attributes['NAME'] !== undefined) {
            isNewDef = true;
        }

        if (isNewDef && activeDefinition) {
            // Force close the old definition
            activeDefinition.end = parser.position - 3;
            if (activeDefinition.statements.length > 0) {
                const tempParser = new Parser("");
                activeDefinition.statements = (tempParser as any).GroupStatements(activeDefinition.statements);
            }
            sourceFile.definitions.push(activeDefinition);
            activeDefinition = null;
            tagStack.length = 0; // clear stack
            
            // Recursively call onopentag for the new definition
            parser.onopentag(node);
            return;
        }
        
        if (activeDefinition) {
            const startPos = parser.startTagPosition - 4;
            const nameToken = new Token(TokenKind.IdentifierToken, startPos, startPos, node.name.length);
            nameToken.Text = node.name;
            const ident = new IdentifierNode([nameToken], node.name);
            
            const newTag: TagState = {
                name: node.name,
                start: startPos,
                hasChildren: false,
                startTagEnd: parser.position - 3,
                node: new ComplexObjectNode(startPos, startPos, ident)
            };
            
            if (tagStack.length > 0) {
                tagStack[tagStack.length - 1].hasChildren = true;
            }
            
            tagStack.push(newTag);
            return;
        }
    };
    
    parser.onclosetag = (tagName) => {
        const tagUpper = tagName.toUpperCase();
        if (tagUpper === 'W') return;
        
        if (definitionWrappers.has(tagUpper)) {
            insideTdlMessage--;
            return;
        }
        
        if (activeDefinition) {
            // Check if this closes the active property
            if (tagStack.length > 0 && tagStack[tagStack.length - 1].name === tagName) {
                const popped = tagStack.pop()!;
                let propertyCloseTagStart = parser.startTagPosition - 4;
                if (propertyCloseTagStart < popped.startTagEnd) {
                    propertyCloseTagStart = popped.startTagEnd;
                }
                
                const closeNameStart = propertyCloseTagStart + 2;
                const closeNameToken = new Token(TokenKind.IdentifierToken, closeNameStart, closeNameStart, tagName.length);
                closeNameToken.Text = tagName;
                popped.node.closeName = new IdentifierNode([closeNameToken], tagName);
                popped.node.end = parser.position - 3;
                
                if (!popped.hasChildren) {
                    // Treat as simple attribute
                    const rawInnerText = xmlText.substring(popped.startTagEnd, propertyCloseTagStart);
                    const actualStart = popped.startTagEnd;
                    
                    if (rawInnerText.trim() || popped.node.name.text.toUpperCase() === 'ACTION') {
                        const paddedInnerText = padEntities(rawInnerText);
                        
                        if (popped.node.name.text.toUpperCase() === 'ACTION') {
                            const stmtText = paddedInnerText;
                            const tempParser = new Parser(stmtText);
                            const stmts = tempParser.parseStandaloneStatements();
                            if (stmts.length > 0) {
                                const stmt = stmts[0];
                                adjustNodeOffsets(stmt, actualStart);
                                activeDefinition.statements.push(stmt);
                            }
                        } else {
                            const attrText = `${popped.node.name.text} : ${paddedInnerText}`;
                            const tempParser = new Parser(attrText);
                            const attrs = tempParser.parseStandaloneAttributes();
                            if (attrs.length > 0) {
                                const attr = attrs[0];
                                
                                let openTagStart = xmlText.lastIndexOf('<', popped.startTagEnd - 1);
                                if (openTagStart < activeDefinition.start) {
                                    openTagStart = activeDefinition.start;
                                }
                                
                                const nameDelta = openTagStart !== -1 ? openTagStart + 1 : actualStart;
                                const valueDelta = actualStart - (popped.node.name.text.length + 3);
                                
                                if (attr.name) adjustNodeOffsets(attr.name, nameDelta);
                                
                                if (attr.colon) {
                                    attr.colon.Start += valueDelta;
                                    attr.colon.FullStart += valueDelta;
                                }
                                
                                for (const val of attr.value) {
                                    adjustNodeOffsets(val, valueDelta);
                                }
                                
                                attr.start = attr.name ? attr.name.start : nameDelta;
                                attr.end = attr.value.length > 0 ? attr.value[attr.value.length - 1].end : actualStart;
                                attr.closeName = popped.node.closeName;
                                
                                if (tagStack.length > 0) {
                                    tagStack[tagStack.length - 1].node.attributes.push(attr);
                                } else {
                                    activeDefinition.attributes.push(attr);
                                    if (popped.node.name.text.toUpperCase() === 'NAME' && !activeDefinition.name) {
                                        const nameAttrVal = paddedInnerText.trim();
                                        const nameTokenStart = actualStart;
                                        const nameToken = new Token(TokenKind.IdentifierToken, nameTokenStart, nameTokenStart, nameAttrVal.length);
                                        nameToken.Text = nameAttrVal;
                                        activeDefinition.name = new IdentifierNode([nameToken], nameAttrVal);
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // It's a complex object
                    if (tagStack.length > 0) {
                        tagStack[tagStack.length - 1].node.complexObjects.push(popped.node);
                    } else {
                        activeDefinition.complexObjects.push(popped.node);
                    }
                }
                return;
            }
            
            // If it matches the active definition type, close it
            if (tagName.toUpperCase() === activeDefinition.type.text.toUpperCase() && tagStack.length === 0) {
                activeDefinition.end = parser.position - 3;
                
                const closeStart = parser.startTagPosition - 4;
                if (xmlText.substring(closeStart, closeStart + 2) === '</') {
                    const closeNameStart = closeStart + 2;
                    const typeToken = new Token(TokenKind.DefinitionTypeToken, closeNameStart, closeNameStart, tagName.length);
                    typeToken.Text = tagName;
                    activeDefinition.closeType = new IdentifierNode([typeToken], tagName);
                }
                
                // If it has inner text and no complex objects (e.g. <SYSTEM TYPE="Formulae" NAME="TSPLSmpConfirmTextString"> "Save Ledger ?" </SYSTEM>)
                if (activeDefinition.complexObjects.length === 0 && activeDefinition.attributes.length === 0 && activeDefinition.statements.length === 0) {
                    const rawInnerText = xmlText.substring(activeDefinitionStartTagEnd, closeStart);
                    const sysItemName = (activeDefinition as any).systemItemName;
                    if (sysItemName) {
                        const trimmedVal = rawInnerText.trim();
                        const attrText = `${sysItemName} : ${trimmedVal}`;
                        const tempParser = new Parser(attrText);
                        const attrs = tempParser.parseStandaloneAttributes();
                        if (attrs.length > 0) {
                            activeDefinition.attributes.push(attrs[0]);
                        } else {
                            const nameToken = new Token(TokenKind.IdentifierToken, 0, 0, sysItemName.length);
                            nameToken.Text = sysItemName;
                            const identNode = new IdentifierNode([nameToken], sysItemName);
                            const valToken = new Token(TokenKind.StringLiteralToken, 0, 0, trimmedVal.length);
                            valToken.Text = trimmedVal;
                            const valNode = new IdentifierNode([valToken], trimmedVal);
                            const attrNode = new AttributeNode(0, 0, identNode, undefined as any, [valNode]);
                            activeDefinition.attributes.push(attrNode);
                        }
                    } else if (rawInnerText.trim()) {
                        const paddedInnerText = padEntities(rawInnerText);
                        const stmtText = paddedInnerText;
                        const tempParser = new Parser(stmtText);
                        const stmts = tempParser.parseStandaloneStatements();
                        if (stmts.length > 0) {
                            const stmt = stmts[0];
                            adjustNodeOffsets(stmt, activeDefinitionStartTagEnd);
                            activeDefinition.statements.push(stmt);
                        }
                    }
                }
                
                if (activeDefinition.statements.length > 0) {
                    const tempParser = new Parser("");
                    activeDefinition.statements = (tempParser as any).GroupStatements(activeDefinition.statements);
                }
                
                sourceFile.definitions.push(activeDefinition);
                activeDefinition = null;
            }
        }
    };
    
    try {
        parser.write('<W>' + xmlText + '</W>').close();
    } catch (e) {
        // XML might be malformed, but we return whatever we managed to parse
    }
    
    const finalDef = activeDefinition as DefinitionNode | null;
    if (finalDef) {
        finalDef.end = xmlText.length;
        if (finalDef.statements.length > 0) {
            const tempParser = new Parser("");
            finalDef.statements = (tempParser as any).GroupStatements(finalDef.statements);
        }
        sourceFile.definitions.push(finalDef);
    }
    
    return sourceFile;
}

function computeLineOffsets(text: string): number[] {
    const offsets = [0];
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '\n') offsets.push(i + 1);
    }
    return offsets;
}

function adjustNodeOffsets(node: any, delta: number) {
    if (!node) return;
    if (typeof node.start === 'number') node.start += delta;
    if (typeof node.end === 'number') node.end += delta;
    
    if (node.tokens && Array.isArray(node.tokens)) {
        for (const t of node.tokens) {
            t.Start += delta;
            t.FullStart += delta;
        }
    }
    
    for (const key of Object.keys(node)) {
        if (key === 'parent') continue;
        const val = node[key];
        if (Array.isArray(val)) {
            for (const item of val) {
                if (item && typeof item === 'object') {
                    adjustNodeOffsets(item, delta);
                }
            }
        } else if (val && typeof val === 'object') {
            if (typeof val.kind !== 'undefined') {
                adjustNodeOffsets(val, delta);
            } else if (typeof val.Kind !== 'undefined' && typeof val.Start === 'number') {
                val.Start += delta;
                if (typeof val.FullStart === 'number') {
                    val.FullStart += delta;
                }
            }
        }
    }
}

/**
 * Parses a Tally XML envelope into PlaygroundStateDTO by reusing the SAX parser and AST generator.
 */
export function parseXmlEnvelopeToPlaygroundState(xmlText: string, scopeManager?: ScopeManager): import('tally-tdl-shared').PlaygroundStateDTO {
    const result: import('tally-tdl-shared').PlaygroundStateDTO = {
        tallyRequest: 'Export',
        type: 'Collection',
        id: '',
        staticVariables: [],
        definitions: []
    };

    if (!xmlText || typeof xmlText !== 'string') return result;

    // 1. Extract Header & StaticVariables with SAX parser
    const parser = sax.parser(false, { position: true, lowercase: false });
    const tagStack: string[] = [];

    parser.onopentag = (node) => {
        tagStack.push(node.name.toUpperCase());
    };

    parser.ontext = (text) => {
        const trimmed = text.trim();
        if (!trimmed) return;
        const currentTag = tagStack.length > 0 ? tagStack[tagStack.length - 1] : '';

        if (currentTag === 'TALLYREQUEST' && tagStack.includes('HEADER')) {
            result.tallyRequest = trimmed.toLowerCase() === 'import' ? 'Import' : 'Export';
        } else if (currentTag === 'TYPE' && tagStack.includes('HEADER')) {
            result.type = trimmed.toLowerCase() === 'data' ? 'Data' : 'Collection';
        } else if (currentTag === 'ID' && tagStack.includes('HEADER')) {
            result.id = trimmed;
        } else if (tagStack.includes('STATICVARIABLES')) {
            result.staticVariables.push({
                name: currentTag,
                value: trimmed
            });
        }
    };

    parser.onclosetag = () => {
        tagStack.pop();
    };

    try {
        parser.write(xmlText).close();
    } catch {
        // Continue even if envelope tags are partial
    }

    if (result.staticVariables.length === 0) {
        result.staticVariables = [
            { name: 'SVEXPORTFORMAT', value: '$$SysName:XML' },
            { name: 'SVCURRENTCOMPANY', value: '' }
        ];
    }

    // 2. Parse definitions to AST using parseXmlToAst
    const sourceFile = parseXmlToAst(xmlText, scopeManager);
    if (sourceFile && sourceFile.definitions) {
        for (const def of sourceFile.definitions) {
            const defType = def.type?.text || 'Collection';
            const name = def.name?.text || '';
            const rawXmlAttrs = (def as any).xmlAttributes || {};
            const isModify = def.modifier?.Text === '#' || def.modifier?.Text === '*' || rawXmlAttrs['ISMODIFY'] === 'Yes';
            const isFixed = rawXmlAttrs['ISFIXED'] === 'Yes';
            const isInitialize = def.modifier?.Text === '*' || rawXmlAttrs['ISINITIALIZE'] === 'Yes';
            const isOption = def.modifier?.Text === '!' || rawXmlAttrs['ISOPTION'] === 'Yes';
            const isInternal = rawXmlAttrs['ISINTERNAL'] === 'Yes';

            const attributes: import('tally-tdl-shared').PlaygroundAttributeDTO[] = [];
            for (const attr of def.attributes) {
                const attrName = attr.name?.text || '';
                const vals: string[] = [];
                if (attr.value && Array.isArray(attr.value)) {
                    for (const v of attr.value) {
                        const t = astNodeToText(v);
                        if (t) {
                            vals.push(t);
                        }
                    }
                }
                attributes.push({
                    name: attrName,
                    values: vals.length > 0 ? vals : ['']
                });
            }

            result.definitions.push({
                defType,
                name,
                attributes,
                isModify,
                isFixed,
                isInitialize,
                isOption,
                isInternal
            });
        }
    }

    // 3. Parse TallyMessage objects (for Import requests)
    if (xmlText.toUpperCase().includes('<TALLYMESSAGE') || result.tallyRequest === 'Import') {
        const tallyObjects = parseTallyMessageObjects(xmlText);
        if (tallyObjects.length > 0) {
            result.tallyObjects = tallyObjects;
        }
    }

    return result;
}

interface GenericXmlNode {
    name: string;
    attributes: Record<string, string>;
    text: string;
    children: GenericXmlNode[];
}

function parseTallyMessageObjects(xmlText: string): import('tally-tdl-shared').PlaygroundTallyObjectDTO[] {
    const objects: import('tally-tdl-shared').PlaygroundTallyObjectDTO[] = [];
    const saxParser = sax.parser(false, { position: true, lowercase: false });
    
    let inTallyMessage = false;
    const nodeStack: GenericXmlNode[] = [];

    saxParser.onopentag = (node) => {
        const upper = node.name.toUpperCase();
        if (upper === 'TALLYMESSAGE') {
            inTallyMessage = true;
            return;
        }
        if (inTallyMessage) {
            const xmlNode: GenericXmlNode = {
                name: node.name,
                attributes: node.attributes as Record<string, string>,
                text: '',
                children: []
            };
            if (nodeStack.length > 0) {
                nodeStack[nodeStack.length - 1].children.push(xmlNode);
            }
            nodeStack.push(xmlNode);
        }
    };

    saxParser.ontext = (text) => {
        if (inTallyMessage && nodeStack.length > 0) {
            const trimmed = text.trim();
            if (trimmed) {
                nodeStack[nodeStack.length - 1].text += (nodeStack[nodeStack.length - 1].text ? ' ' : '') + trimmed;
            }
        }
    };

    saxParser.onclosetag = (tagName) => {
        const upper = tagName.toUpperCase();
        if (upper === 'TALLYMESSAGE') {
            inTallyMessage = false;
            return;
        }
        if (inTallyMessage && nodeStack.length > 0) {
            const popped = nodeStack.pop();
            // If top-level inside TALLYMESSAGE
            if (nodeStack.length === 0 && popped) {
                const attrs = popped.attributes || {};
                const actionRaw = attrs['ACTION'] || attrs['Action'] || attrs['action'] || 'Create';
                const action = (['Create', 'Alter', 'Delete'].find(
                    a => a.toLowerCase() === actionRaw.toLowerCase()
                ) || 'Create') as 'Create' | 'Alter' | 'Delete';

                let name = attrs['NAME'] || attrs['Name'] || attrs['name'] || '';
                if (!name) {
                    const directNameNode = popped.children.find(c => c.name.toUpperCase() === 'NAME');
                    if (directNameNode && directNameNode.text) {
                        name = directNameNode.text;
                    } else {
                        const langNode = popped.children.find(c => c.name.toUpperCase() === 'LANGUAGENAME.LIST');
                        const nameListNode = langNode?.children.find(c => c.name.toUpperCase() === 'NAME.LIST');
                        const firstChildName = nameListNode?.children.find(c => c.name.toUpperCase() === 'NAME');
                        if (firstChildName && firstChildName.text) {
                            name = firstChildName.text;
                        }
                    }
                }

                const objView = attrs['OBJVIEW'] || attrs['ObjView'] || attrs['objview'] || '';
                const vchType = attrs['VCHTYPE'] || attrs['VchType'] || attrs['vchtype'] || '';

                const properties = convertXmlNodesToProperties(popped.children);

                objects.push({
                    objectType: popped.name,
                    action,
                    name: name || undefined,
                    objView: objView || undefined,
                    vchType: vchType || undefined,
                    properties
                });
            }
        }
    };

    try {
        saxParser.write(xmlText).close();
    } catch {
        // Parse as much as possible
    }

    return objects;
}

function convertXmlNodesToProperties(nodes: GenericXmlNode[]): import('tally-tdl-shared').PlaygroundTallyPropertyDTO[] {
    const props: import('tally-tdl-shared').PlaygroundTallyPropertyDTO[] = [];
    for (const node of nodes) {
        const isList = node.name.toUpperCase().endsWith('.LIST') || node.children.length > 0;
        if (isList) {
            props.push({
                name: node.name,
                isList: true,
                children: convertXmlNodesToProperties(node.children)
            });
        } else {
            props.push({
                name: node.name,
                value: node.text || ''
            });
        }
    }
    return props;
}

