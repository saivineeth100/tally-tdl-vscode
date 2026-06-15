import {
    AttributeNode,
    DefinitionNode,
    IdentifierNode,
    DirectiveNode,
} from "../ast";
import { Token } from "../token";
import { TokenKind } from "../tokenKind";

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

        let defType = this.ParseIdentifierWithSpaces();

        if (!defType) {
            this.addError(
                "Expected Definition Type",
                this.CurrentToken.Start,
                this.CurrentToken.Start,
            );

            defType = this.createMissingIdentifier();

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

        if (this.match(TokenKind.CloseSquareBracketToken)) {
            closeBracketToken = this.EatToken();
        } else {
            // Missing close bracket - use synthetic token and mark incomplete

            this.addError(
                "Expected ] after Definition name",
                this.CurrentToken.Start,
                this.CurrentToken.Start,
            );

            closeBracketToken = this.createMissingToken(
                TokenKind.CloseSquareBracketToken,
            );

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

        // Only parse body if definition header is complete

        if (!isIncomplete) {
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

            // Handle Inline Directives

            if (this.CurrentToken.Kind === TokenKind.LessThanToken) {
                this.ConsumeDirective(defNode);

                continue;
            }

            const start = this.CurrentToken.Start;

            // Check if it's an Attribute (Parameter, Variable, Returns, Object)

            const text = this.CurrentToken.Text;

            const isAttribute =
                text === "Parameter" ||
                text === "Variable" ||
                text === "Returns" ||
                text === "Object";

            if (isAttribute) {
                const attrName = this.ParseIdentifierWithSpaces();

                if (attrName && this.CurrentToken.Kind === TokenKind.ColonToken) {
                    const colon = this.EatToken();

                    const values = this.ParseValues(colon);

                    if (values.length > 0) {
                        const end = values[values.length - 1].end;

                        defNode.attributes.push(
                            new AttributeNode(start, end, attrName, colon, values),
                        );
                    }
                } else {
                    this.MoveToNextToken(); // Skip invalid
                }
            } else {
                // Parse Statement

                this.ParseStatement(defNode);
            }
        }
    }

    protected ConsumeDirective(defNode?: DefinitionNode) {
        const start = this.CurrentToken.Start;

        // Consume <

        this.EatToken();

        // Consume until > or EOF

        let directiveContent = "";

        while (!this.isAtEnd()) {
            if (this.CurrentToken.Kind === TokenKind.GreaterThanToken) {
                const end = this.CurrentToken.Start + 1;

                this.EatToken();

                if (defNode) {
                    const contentTrimmed = directiveContent.trim();

                    const firstColon = contentTrimmed.indexOf(":");

                    const name =
                        firstColon !== -1
                            ? contentTrimmed.substring(0, firstColon).trim()
                            : contentTrimmed;

                    const value =
                        firstColon !== -1
                            ? contentTrimmed.substring(firstColon + 1).trim()
                            : "";

                    defNode.directives.push(new DirectiveNode(start, end, name, value));
                }

                break;
            }

            directiveContent += this.CurrentToken.Text;

            this.MoveToNextToken();
        }
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

            const start = this.CurrentToken.Start;

            const attrName = this.ParseIdentifierWithSpaces();

            if (!attrName) {
                this.MoveToNextToken();

                continue;
            }

            if (this.CurrentToken.Kind === TokenKind.ColonToken) {
                const colon = this.EatToken();

                const values = this.ParseValues(colon);

                let end = colon.Start + 1;

                if (values.length > 0) {
                    end = values[values.length - 1].end;
                }

                const attrNode = new AttributeNode(start, end, attrName, colon, values);

                defNode.attributes.push(attrNode);
            } else {
                this.MoveToNextToken();
            }
        }
    }
}

