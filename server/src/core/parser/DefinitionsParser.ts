import {
    AttributeNode,
    DefinitionNode,
    IdentifierNode,
    DirectiveNode,
    InUseDirectiveNode,
    DefTypeDirectiveNode,
    UnknownDirectiveNode,
    InUseTargetNode
} from "../ast/ast";
import { Token } from "../lexer/token";
import { TokenKind } from "../lexer/tokenKind";

import { StatementsParser } from "./StatementsParser";

/**
 * DefinitionsParser handles the parsing of top-level TDL Definitions (e.g., [Report: ...]).
 * It extends StatementsParser to allow parsing statements within a definition body.
 */
export class DefinitionsParser extends StatementsParser {
    /**
       * Parse a definition statement with error recovery.
       * Creates partial DefinitionNode even if input is incomplete.
       * The `isIncomplete` flag will be set to true for invalid/partial definitions.
    */
    protected ParseDefinitionStatement(): DefinitionNode | undefined {
        const start = this.CurrentToken.Start;

        const openBracket = this.Expect(
            TokenKind.OpenSquareBracketToken,
            "Expected [ to start definition",
        );

        if (!openBracket) {
            return undefined;
        }

        let isIncomplete = false;

        let modifier: Token | undefined;

        // Check for modifier tokens: #, !, *

        if (
            this.CurrentToken.Kind === TokenKind.HashToken ||
            this.CurrentToken.Kind === TokenKind.ExclamationToken ||
            this.CurrentToken.Kind === TokenKind.AsteriskToken
        ) {
            modifier = this.EatToken();
        }

        // Parse definition type (required, but use recovery if missing)

        let defType: IdentifierNode;
        
        if (
            this.CurrentToken.Kind === TokenKind.DoubleAtTheRateToken &&
            this.peek(1).Kind === TokenKind.IdentifierToken &&
            this.peek(1).Text.toLowerCase() === 'include'
        ) {
            const doubleAt = this.EatToken();
            const includeToken = this.EatToken();
            defType = new IdentifierNode([doubleAt, includeToken], doubleAt.Text + includeToken.Text);
        } else {
            defType = this.ExpectIdentifierAndRecover(false, true, "Expected Definition Type");
        }

        if (defType.isIncomplete) {
            isIncomplete = true;
        }

        // Parse colon (optional in incomplete state)

        let colonToken: Token | undefined;

        if (this.match(TokenKind.ColonToken)) {
            colonToken = this.EatToken();
        } else if (
            !this.match(TokenKind.CloseSquareBracketToken) &&
            !this.isAtEnd()
        ) {
            // Expected colon but found something else

            this.addError(
                "Expected : after Definition type",
                this.CurrentToken.Start,
                this.CurrentToken.Start,
            );

            isIncomplete = true;
        }

        // Parse definition name (optional)

        let defName: IdentifierNode | undefined;

        defName = this.ParseFileNameWithSpaces();

        // Parse close bracket (use recovery token if missing)

        let closeBracketToken: Token;

        closeBracketToken = this.ExpectAndRecover(
            TokenKind.CloseSquareBracketToken,
            "Expected ] after Definition name"
        );

        if (closeBracketToken.Length === 0) {
            isIncomplete = true;
        }

        // Always create DefinitionNode (error recovery)

        const end =
            closeBracketToken.Kind !== TokenKind.MissingToken
                ? closeBracketToken.Start + 1
                : this.CurrentToken.Start;

        const defNode = new DefinitionNode(
            start,
            end,
            openBracket,
            defType,
            closeBracketToken,
        );

        defNode.colon = colonToken;

        defNode.name = defName;

        defNode.modifier = modifier;

        defNode.isIncomplete = isIncomplete;

        // Always attempt to parse body for error recovery
        if (defType.text === "Function") {
            this.ParseFunctionBody(defNode);
        } else {
            this.ParseAttributes(defNode);
        }

        // Apply Block Grouping to statements
        if (defNode.statements.length > 0) {
            defNode.statements = this.GroupStatements(defNode.statements);
        }

        // Update definition end to include body
        if (defNode.attributes.length > 0) {
            defNode.end = defNode.attributes[defNode.attributes.length - 1].end;
        }

        if (defNode.statements.length > 0) {
            const lastStmt = defNode.statements[defNode.statements.length - 1];

            if (lastStmt.end > defNode.end) {
                defNode.end = lastStmt.end;
            }
        }

        return defNode;
    }

    protected ParseFunctionBody(defNode: DefinitionNode) {
        while (!this.isAtEnd()) {
            if (this.CurrentToken.Kind === TokenKind.OpenSquareBracketToken) {
                if (
                    this.HasNewLine(this.PreviousToken, true) ||
                    this.HasNewLine(this.CurrentToken, false) ||
                    this.PreviousToken.Kind === TokenKind.Unknown
                ) {
                    break;
                }
            }

            if (this.isAtEnd()) {
                break;
            }

            const k = this.CurrentToken.Kind;
            if (k === TokenKind.LineFeed || k === TokenKind.CarriageReturn || k === TokenKind.CarriageReturnLineFeed || k === TokenKind.SpaceToken) {
                this.MoveToNextToken();
                continue;
            }

            // Handle Inline Directives

            if (this.CurrentToken.Kind === TokenKind.LessThanToken) {
                const directiveNode = this.ConsumeDirective();
                if (directiveNode) {
                    defNode.directives.push(directiveNode);
                }

                continue;
            }

            const start = this.CurrentToken.Start;

            // Check if it's an Attribute (Parameter, Variable, Returns, Object, List Variable, Local Formula)
            
            const savedIndex = this._currentTokenIndex;
            const attrName = this.ParseIdentifierWithSpaces(true, true);
            const text = attrName ? attrName.text.replace(/\s+/g, "").toUpperCase() : "";

            const isAttribute = [
                "ACTION",
                "FETCHOBJECT",
                "LISTVAR",
                "LISTVARIABLE",
                "LOCALFORMULA",
                "OBJECT",
                "OBJECTS",
                "PARAMETER",
                "PARAMETERS",
                "RETURN",
                "RETURNS",
                "STATICVARIABLE",
                "VARIABLE",
                "VARIABLES"
            ].includes(text);

            if (isAttribute) {
                // Skip spaces before checking for colon
                while (!this.isAtEnd() && this.CurrentToken.Kind === TokenKind.SpaceToken) {
                    this.MoveToNextToken();
                }

                if (this.CurrentToken.Kind === TokenKind.ColonToken) {
                    const colon = this.EatToken();
                    const values = this.ParseValues(colon);
                    
                    let end = colon.Start + 1;
                    if (values.length > 0) {
                        end = values[values.length - 1].end;
                    }

                    const attrNode = new AttributeNode(start, end, attrName!, colon, values);
                    const attrNameLower = attrName!.text.toLowerCase();
                    if (['add', 'delete', 'replace', 'local', 'option', 'switch', 'use'].includes(attrNameLower)) {
                        attrNode.isAttributeModifier = true;
                        attrNode.modifierType = attrNameLower as any;
                    }
                    defNode.attributes.push(attrNode);
                } else {
                    this.addError("Expected Attribute Name and :", this.CurrentToken.Start, this.CurrentToken.Start);
                    this.sync(); // Panic mode recovery
                }
            } else {
                // Backtrack
                this._currentTokenIndex = savedIndex;
                this._currentToken = null;

                // Parse Statement
                this.ParseStatement(defNode);
            }
        }
    }

    protected ConsumeDirective(): DirectiveNode | undefined {
        const start = this.CurrentToken.Start;

        // Consume <

        this.EatToken();

        // Consume until > or EOF

        while (!this.isAtEnd()) {
            if (this.CurrentToken.Kind === TokenKind.GreaterThanToken) {
                const end = this.CurrentToken.Start + 1;
                const directiveContent = this._text.substring(start + 1, this.CurrentToken.Start);

                this.EatToken();

                let directiveNode: DirectiveNode | undefined;

                if (directiveContent.trim().length > 0) {
                    const contentTrimmed = directiveContent.trim();
                    const firstColon = contentTrimmed.indexOf(":");
                    const name = firstColon !== -1 ? contentTrimmed.substring(0, firstColon).trim() : contentTrimmed;
                    const value = firstColon !== -1 ? contentTrimmed.substring(firstColon + 1).trim() : "";
                    const baseOffset = start + 1;

                    if (name.toLowerCase() === "inuse") {
                        const targets: InUseTargetNode[] = [];
                        if (value) {
                            const parts = value.split(',');
                            let currentOffset = baseOffset + directiveContent.indexOf(value);

                            for (const part of parts) {
                                const partTrimmed = part.trim();
                                if (partTrimmed) {
                                    const partStart = baseOffset + directiveContent.indexOf(part, currentOffset - baseOffset);
                                    const partEnd = partStart + part.length;

                                    const colonIdx = part.indexOf(':');
                                    if (colonIdx !== -1) {
                                        const tType = part.substring(0, colonIdx);
                                        const tName = part.substring(colonIdx + 1);

                                        const tTypeTrimmed = tType.trim();
                                        const tNameTrimmed = tName.trim();

                                        const typeStart = partStart + part.indexOf(tTypeTrimmed);
                                        const typeEnd = typeStart + tTypeTrimmed.length;

                                        const nameStart = partStart + colonIdx + 1 + tName.indexOf(tNameTrimmed);
                                        const nameEnd = nameStart + tNameTrimmed.length;

                                        targets.push(new InUseTargetNode(
                                            partStart, partEnd,
                                            tTypeTrimmed, typeStart, typeEnd,
                                            tNameTrimmed, nameStart, nameEnd
                                        ));
                                    } else {
                                        const typeStart = partStart;
                                        const typeEnd = partStart;
                                        const nameStart = partStart + part.indexOf(partTrimmed);
                                        const nameEnd = nameStart + partTrimmed.length;
                                        
                                        targets.push(new InUseTargetNode(
                                            partStart, partEnd,
                                            '', typeStart, typeEnd,
                                            partTrimmed, nameStart, nameEnd
                                        ));
                                    }
                                }
                                currentOffset += part.length + 1;
                            }
                        }
                        directiveNode = new InUseDirectiveNode(start, end, name, targets, directiveContent);
                    } else if (name.toLowerCase() === "deftype") {
                        const colonIdx = value.indexOf(':');
                        let defType = value;
                        let defName: string | undefined = undefined;
                        let defTypeStart = 0; let defTypeEnd = 0;
                        let defNameStart: number | undefined = undefined; let defNameEnd: number | undefined = undefined;

                        if (colonIdx !== -1) {
                            defType = value.substring(0, colonIdx).trim();
                            defName = value.substring(colonIdx + 1).trim();
                        } else {
                            defType = value.trim();
                        }

                        const valueStartOffset = baseOffset + directiveContent.indexOf(value);
                        
                        if (defType) {
                            defTypeStart = valueStartOffset + value.indexOf(defType);
                            defTypeEnd = defTypeStart + defType.length;
                        }

                        if (defName) {
                            defNameStart = valueStartOffset + colonIdx + 1 + value.substring(colonIdx + 1).indexOf(defName);
                            defNameEnd = defNameStart + defName.length;
                        }

                        directiveNode = new DefTypeDirectiveNode(start, end, name, defType, defTypeStart, defTypeEnd, defName, defNameStart, defNameEnd, directiveContent);
                    } else {
                        directiveNode = new UnknownDirectiveNode(start, end, name, value, directiveContent);
                    }
                }

                return directiveNode;
            }

            this.MoveToNextToken();
        }
        return undefined;
    }

    protected ParseAttributes(defNode: DefinitionNode) {
        while (!this.isAtEnd()) {
            if (this.CurrentToken.Kind === TokenKind.OpenSquareBracketToken) {
                if (
                    this.HasNewLine(this.PreviousToken, true) ||
                    this.HasNewLine(this.CurrentToken, false) ||
                    this.PreviousToken.Kind === TokenKind.Unknown
                ) {
                    break;
                }
            }

            if (this.isAtEnd()) {
                break;
            }

            const k = this.CurrentToken.Kind;
            if (k === TokenKind.LineFeed || k === TokenKind.CarriageReturn || k === TokenKind.CarriageReturnLineFeed || k === TokenKind.SpaceToken) {
                this.MoveToNextToken();
                continue;
            }

            if (k === TokenKind.LessThanToken) {
                const directiveNode = this.ConsumeDirective();
                if (directiveNode) {
                    defNode.directives.push(directiveNode);
                }
                continue;
            }

            const start = this.CurrentToken.Start;

            const attrName = this.ParseIdentifierWithSpaces(true, true);

            if (!attrName) {
                this.addError("Expected Attribute Name", this.CurrentToken.Start, this.CurrentToken.Start);
                if (!this.isAtEnd()) {
                    this.MoveToNextToken();
                }
                this.sync(); // Panic mode recovery
                continue;
            }

            // Skip spaces before checking for colon
            while (this.CurrentToken.Kind === TokenKind.SpaceToken) {
                this.MoveToNextToken();
            }

            if (this.CurrentToken.Kind === TokenKind.ColonToken) {
                const colon = this.EatToken();

                const isMenuItem = attrName.text.toLowerCase() === 'item' || attrName.text.toLowerCase() === 'key item';
                const values = this.ParseValues(colon, isMenuItem);

                let end = colon.Start + 1;

                if (values.length > 0) {
                    end = values[values.length - 1].end;
                }

                const attrNode = new AttributeNode(start, end, attrName, colon, values);
                const attrNameLower = attrName.text.toLowerCase();
                if (['add', 'delete', 'replace', 'local', 'option', 'switch', 'use'].includes(attrNameLower)) {
                    attrNode.isAttributeModifier = true;
                    attrNode.modifierType = attrNameLower as any;
                }
                defNode.attributes.push(attrNode);
            } else {
                this.addError("Expected : after Attribute Name", this.CurrentToken.Start, this.CurrentToken.Start);
                this.sync(); // Panic mode recovery
            }
        }
    }
}

