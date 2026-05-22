import * as sax from 'sax';
import { 
    SourceFile, DefinitionNode, AttributeNode, StatementNode, 
    IdentifierNode, CommentNode
} from './ast';
import { Token } from './token';
import { TokenKind } from './tokenKind';
import { Parser } from './parser';

export function parseXmlToAst(xmlText: string): SourceFile {
    const sourceFile = new SourceFile(0, xmlText.length);
    sourceFile.lineOffsets = computeLineOffsets(xmlText);

    const parser = sax.parser(false, { position: true, lowercase: false });
    
    let activeDefinition: DefinitionNode | null = null;
    let activePropertyTag: string | null = null;
    let activePropertyStartTagEnd = 0;
    
    const definitionWrappers = new Set(['TDLMESSAGE', 'TALLYMESSAGE', 'TDL']);
    const structuralWrappers = new Set(['ENVELOPE', 'HEADER', 'BODY', 'DATA']);
    const knownDefTypes = new Set([
        'FORM', 'PART', 'LINE', 'FIELD', 'MENU', 'REPORT', 'COLLECTION', 
        'BUTTON', 'KEY', 'SYSTEM', 'VARIABLE', 'STYLE', 'BORDER', 'COLOR',
        'OBJECT', 'FUNCTION', 'RULE', 'RULESET'
    ]);

    let insideTdlMessage = 0;
    
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
            if (insideTdlMessage > 0 || hasName || knownDefTypes.has(tagUpper)) {
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
                
                if (node.attributes['NAME'] !== undefined) {
                    const nameAttrVal = (node.attributes['NAME'] as string) || '';
                    // The position includes the tag parsing up to current state.
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
                
                return;
            }
        }
        if (knownDefTypes.has(tagUpper) && node.attributes['NAME'] !== undefined) {
            if (activeDefinition) {
                // Force close the old definition
                activeDefinition.end = parser.position - 3;
                if (activeDefinition.statements.length > 0) {
                    const tempParser = new Parser("");
                    activeDefinition.statements = (tempParser as any).GroupStatements(activeDefinition.statements);
                }
                sourceFile.definitions.push(activeDefinition);
                activeDefinition = null;
                activePropertyTag = null;
                
                // Recursively call onopentag for the new definition
                parser.onopentag(node);
                return;
            }
        }
        
        if (activeDefinition && !activePropertyTag) {
            activePropertyTag = node.name;
            activePropertyStartTagEnd = parser.position - 3;
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
        
        if (activePropertyTag && tagName === activePropertyTag) {
            let propertyCloseTagStart = parser.startTagPosition - 4;
            if (propertyCloseTagStart < activePropertyStartTagEnd) {
                propertyCloseTagStart = activePropertyStartTagEnd; 
            }
            
            const rawInnerText = xmlText.substring(activePropertyStartTagEnd, propertyCloseTagStart);
            const actualStart = activePropertyStartTagEnd;
            
            if (rawInnerText.trim()) {
                const paddedInnerText = padEntities(rawInnerText);
                
                if (activePropertyTag.toUpperCase() === 'ACTION') {
                    const stmtText = paddedInnerText;
                    const tempParser = new Parser(stmtText);
                    const stmts = tempParser.parseStandaloneStatements();
                    if (stmts.length > 0) {
                        const stmt = stmts[0];
                        adjustNodeOffsets(stmt, actualStart);
                        activeDefinition!.statements.push(stmt);
                    }
                } else {
                    const attrText = `${activePropertyTag} : ${paddedInnerText}`;
                    const tempParser = new Parser(attrText);
                    const attrs = tempParser.parseStandaloneAttributes();
                    if (attrs.length > 0) {
                        const attr = attrs[0];
                        
                        let openTagStart = xmlText.lastIndexOf('<', activePropertyStartTagEnd - 1);
                        if (openTagStart < activeDefinition!.start) {
                            openTagStart = activeDefinition!.start;
                        }
                        
                        const nameDelta = openTagStart !== -1 ? openTagStart + 1 : actualStart;
                        const valueDelta = actualStart - (activePropertyTag.length + 3);
                        
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
                        
                        const closeStart = parser.startTagPosition - 4;
                        if (xmlText.substring(closeStart, closeStart + 2) === '</') {
                            const closeNameStart = closeStart + 2;
                            const nameToken = new Token(TokenKind.IdentifierToken, closeNameStart, closeNameStart, tagName.length);
                            nameToken.Text = tagName;
                            attr.closeName = new IdentifierNode([nameToken], tagName);
                        }
                        
                        activeDefinition!.attributes.push(attr);
                    }
                }
            }
            activePropertyTag = null;
            return;
        }
        
        // Force close active property tag if we see the definition closing tag
        if (activeDefinition && tagName.toUpperCase() === activeDefinition.type.text.toUpperCase()) {
            activePropertyTag = null;
        }
        
        if (activeDefinition && !activePropertyTag) {
            activeDefinition.end = parser.position - 3;
            
            const closeStart = parser.startTagPosition - 4;
            if (xmlText.substring(closeStart, closeStart + 2) === '</') {
                const closeNameStart = closeStart + 2;
                const typeToken = new Token(TokenKind.DefinitionTypeToken, closeNameStart, closeNameStart, tagName.length);
                typeToken.Text = tagName;
                activeDefinition.closeType = new IdentifierNode([typeToken], tagName);
            }
            
            if (activeDefinition.statements.length > 0) {
                const tempParser = new Parser("");
                activeDefinition.statements = (tempParser as any).GroupStatements(activeDefinition.statements);
            }
            
            sourceFile.definitions.push(activeDefinition);
            activeDefinition = null;
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
