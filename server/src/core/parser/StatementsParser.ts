import {
  DefinitionNode,
  IdentifierNode,
  StatementNode,
  SyntaxKind,
  ListNode,
  BlockStatementNode,
  IfNode,
  WhileNode,
  ForNode,
  WalkNode,
  BatchPostNode,
  MsgBoxNode,
  ZipNode,
  UnzipNode,
  StartBlockNode,
  DoIfNode,
  ReturnNode,
  BreakNode,
  ContinueNode,
  SetNode,
  ExchangeNode,
  IncrementNode,
  DecrementNode,
  SwitchNode,
  CaseNode,
  DefaultNode} from "../ast/ast";
import { TokenKind } from "../lexer/tokenKind";

import { ExpressionsParser } from "./ExpressionsParser";

/**
 * StatementsParser handles the parsing of procedural statements and control flow blocks
 * (e.g., IF, WHILE, FOR, WALK) inside TDL definitions.
 * It extends ExpressionsParser since statements are often composed of expressions.
 */
export class StatementsParser extends ExpressionsParser {
  protected ParseStatement(defNode: DefinitionNode) {
    const start = this.CurrentToken.Start;

    const label = this.ParseIdentifierWithSpaces(false, true); // Can be "01" or "Start"

    if (!label) {
      this.addError("Expected Statement Label", this.CurrentToken.Start, this.CurrentToken.Start);
      if (this.CurrentToken.Kind !== TokenKind.EndOfFileToken) {
          this.MoveToNextToken();
      }
      this.sync();
      return;
    }

    if (this.CurrentToken.Kind === TokenKind.ColonToken) {
      this.EatToken(); // Consume colon after label

      let action = this.ExpectIdentifierAndRecover(false, true, "Expected Action Name");
      if (action.isIncomplete) {
        if (!this.isAtEnd()) {
            this.MoveToNextToken();
        }
        this.sync();
      }


      if (action) {
        let rawArgs: any[] = [];

        if (this.CurrentToken.Kind === TokenKind.ColonToken) {
          this.EatToken(); // Consume colon after action

          rawArgs = this.ParseValues(this.PreviousToken);
        }

        const args: any[] = [];

        for (const arg of rawArgs) {
          if (arg.kind === SyntaxKind.List) {
            args.push(...(arg as ListNode).values);
          } else {
            args.push(arg);
          }
        }

        const stmt = new StatementNode(label, action, args);

        defNode.statements.push(stmt);
      }
    }
  }

  protected GroupStatements(statements: StatementNode[]): StatementNode[] {
    const result: StatementNode[] = [];

    const stack: { node: any; targetArray: StatementNode[] }[] = [];

    for (const stmt of statements) {
      const actionText = ((stmt as any).action?.text || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "");

      let targetArray =
        stack.length > 0 ? stack[stack.length - 1].targetArray : result;

      let handled = true;

      switch (actionText) {
        case "IF": {
          const ifNode = new IfNode(stmt);
          ifNode.condition = stmt.args.length > 0 ? stmt.args[0] : undefined;
          targetArray.push(ifNode);
          stack.push({ node: ifNode, targetArray: ifNode.statements });
          break;
        }
        case "ELSE": {
          if (stack.length > 0 && stack[stack.length - 1].node instanceof IfNode) {
            const parentIf = stack[stack.length - 1].node as IfNode;
            parentIf.elseStatements.push(stmt);
            stack[stack.length - 1].targetArray = parentIf.elseStatements;
          } else {
            targetArray.push(stmt);
          }
          break;
        }
        case "DOIF": {
          const doIfNode = new DoIfNode(stmt);
          doIfNode.condition = stmt.args.length > 0 ? stmt.args[0] : undefined;
          if (stmt.args.length > 1 && stmt.args[1].kind === SyntaxKind.Identifier) {
            const nestedAction = stmt.args[1] as IdentifierNode;
            const nestedArgs = stmt.args.slice(2);
            const nestedStmt = new StatementNode(undefined, nestedAction, nestedArgs);
            const groupedNested = this.GroupStatements([nestedStmt]);
            doIfNode.actionStatement = groupedNested.length > 0 ? groupedNested[0] : nestedStmt;
          }
          targetArray.push(doIfNode);
          break;
        }
        case "WHILE": {
          const whileNode = new WhileNode(stmt);
          whileNode.condition = stmt.args.length > 0 ? stmt.args[0] : undefined;
          targetArray.push(whileNode);
          stack.push({ node: whileNode, targetArray: whileNode.statements });
          break;
        }
        case "FORTOKEN":
        case "FORCOLLECTION":
        case "FORRANGE":
        case "FOREACH":
        case "FORIN":
        case "FOR": {
          const forNode = new ForNode(stmt);
          forNode.iteratorVariable =
            stmt.args.length > 0 && stmt.args[0].kind === SyntaxKind.Identifier
              ? (stmt.args[0] as IdentifierNode)
              : undefined;
          forNode.collectionName = stmt.args.length > 1 ? stmt.args[1] : undefined;
          targetArray.push(forNode);
          stack.push({ node: forNode, targetArray: forNode.statements });
          break;
        }
        case "WALKCOLLECTION":
        case "WALK": {
          const walkNode = new WalkNode(stmt);
          walkNode.collectionName = stmt.args.length > 0 ? stmt.args[0] : undefined;
          targetArray.push(walkNode);
          stack.push({ node: walkNode, targetArray: walkNode.statements });
          break;
        }
        case "STARTBLOCK": {
          const blockNode = new StartBlockNode(stmt);
          targetArray.push(blockNode);
          stack.push({ node: blockNode, targetArray: blockNode.statements });
          break;
        }
        case "STARTBATCHPOST": {
          const batchNode = new BatchPostNode(stmt);
          batchNode.batchSize = stmt.args.length > 0 ? stmt.args[0] : undefined;
          targetArray.push(batchNode);
          stack.push({ node: batchNode, targetArray: batchNode.statements });
          break;
        }
        case "STARTMSGBOX": {
          const msgNode = new MsgBoxNode(stmt);
          msgNode.title = stmt.args.length > 0 ? stmt.args[0] : undefined;
          msgNode.message = stmt.args.length > 1 ? stmt.args[1] : undefined;
          targetArray.push(msgNode);
          stack.push({ node: msgNode, targetArray: msgNode.statements });
          break;
        }
        case "STARTPROGRESS": {
          const progNode = new StartBlockNode(stmt);
          targetArray.push(progNode);
          stack.push({ node: progNode, targetArray: progNode.statements });
          break;
        }
        case "STARTZIP": {
          const zipNode = new ZipNode(stmt);
          zipNode.targetFile = stmt.args.length > 0 ? stmt.args[0] : undefined;
          zipNode.overwrite = stmt.args.length > 1 ? stmt.args[1] : undefined;
          targetArray.push(zipNode);
          stack.push({ node: zipNode, targetArray: zipNode.statements });
          break;
        }
        case "STARTUNZIP": {
          const unzipNode = new UnzipNode(stmt);
          unzipNode.sourceFile = stmt.args.length > 0 ? stmt.args[0] : undefined;
          unzipNode.password = stmt.args.length > 1 ? stmt.args[1] : undefined;
          targetArray.push(unzipNode);
          stack.push({ node: unzipNode, targetArray: unzipNode.statements });
          break;
        }
        case "RETURN": {
          const retNode = new ReturnNode(stmt);
          retNode.returnValue = stmt.args.length > 0 ? stmt.args[0] : undefined;
          targetArray.push(retNode);
          break;
        }
        case "BREAK": {
          targetArray.push(new BreakNode(stmt));
          break;
        }
        case "CONTINUE": {
          targetArray.push(new ContinueNode(stmt));
          break;
        }
        case "SET": {
          const setNode = new SetNode(stmt);
          setNode.targetVariable = stmt.args.length > 0 ? stmt.args[0] : undefined;
          setNode.valueExpression = stmt.args.length > 1 ? stmt.args[1] : undefined;
          targetArray.push(setNode);
          break;
        }
        case "SWITCH": {
          const switchNode = new SwitchNode(stmt);
          switchNode.condition = stmt.args.length > 0 ? stmt.args[0] : undefined;
          targetArray.push(switchNode);
          stack.push({ node: switchNode, targetArray: switchNode.statements });
          break;
        }
        case "CASE": {
          const caseNode = new CaseNode(stmt);
          caseNode.value = stmt.args.length > 0 ? stmt.args[0] : undefined;
          if (stack.length > 0 && stack[stack.length - 1].node instanceof SwitchNode) {
            const parentSwitch = stack[stack.length - 1].node as SwitchNode;
            parentSwitch.cases.push(caseNode);
            stack[stack.length - 1].targetArray = caseNode.statements;
          } else {
            targetArray.push(caseNode);
          }
          break;
        }
        case "DEFAULT": {
          const defaultNode = new DefaultNode(stmt);
          if (stack.length > 0 && stack[stack.length - 1].node instanceof SwitchNode) {
            const parentSwitch = stack[stack.length - 1].node as SwitchNode;
            parentSwitch.defaultCase = defaultNode;
            stack[stack.length - 1].targetArray = defaultNode.statements;
          } else {
            targetArray.push(defaultNode);
          }
          break;
        }
        case "EXCHANGE": {
          const exNode = new ExchangeNode(stmt);
          exNode.var1 = stmt.args.length > 0 ? stmt.args[0] : undefined;
          exNode.var2 = stmt.args.length > 1 ? stmt.args[1] : undefined;
          targetArray.push(exNode);
          break;
        }
        case "INCREMENT": {
          const incNode = new IncrementNode(stmt);
          incNode.targetVariable = stmt.args.length > 0 ? stmt.args[0] : undefined;
          incNode.stepValue = stmt.args.length > 1 ? stmt.args[1] : undefined;
          targetArray.push(incNode);
          break;
        }
        case "DECREMENT": {
          const decNode = new DecrementNode(stmt);
          decNode.targetVariable = stmt.args.length > 0 ? stmt.args[0] : undefined;
          decNode.stepValue = stmt.args.length > 1 ? stmt.args[1] : undefined;
          targetArray.push(decNode);
          break;
        }
        default:
          handled = false;
          break;
      }

      if (!handled) {
        if (actionText.startsWith("END") && actionText.length > 3) {
          if (stack.length > 0) {
            const popped = stack.pop();

            if (popped) {
              popped.node.end = stmt.end;

              if (popped.node instanceof BlockStatementNode) {
                popped.node.endStatement = stmt;
              }

              const poppedActionText = ((popped.node as any).action?.text || "")
                .replace(/\s+/g, "")
                .toUpperCase();

              const expectedEnd = "END" + poppedActionText;

              let isMatch = actionText === expectedEnd;

              // Handle special cases where block starts with a complex name but ends with a generic name
              if (!isMatch) {
                if (
                  (actionText === "ENDFOR" && poppedActionText.startsWith("FOR")) ||
                  (actionText === "ENDWALK" && poppedActionText.startsWith("WALK")) ||
                  (actionText.startsWith("END") && poppedActionText === "START" + actionText.substring(3))
                ) {
                  isMatch = true;
                }
              }

              // Check for mismatch
              if (!isMatch) {
                const expectedFriendly =
                  "END " + ((popped.node as any).action?.text || "").toUpperCase();

                const foundFriendly = (stmt.action?.text || "").toUpperCase();

                this.addError(
                  `Mismatched block terminator: Expected ${expectedFriendly}, found ${foundFriendly}`,
                  stmt.start,
                  stmt.end,
                );
              }
            }
          } else {
            this.addError(
              `Unmatched ${(stmt.action?.text || "").toUpperCase()} without opening block`,
              stmt.start,
              stmt.end,
            );
            targetArray.push(stmt);
          }
        } else {
          targetArray.push(stmt);
        }
      }
    }

    // Any remaining items in the stack are unclosed blocks

    for (const unclosed of stack) {
      this.addError(
        `Unclosed block: Missing END ${((unclosed.node as any).action?.text || "").toUpperCase()}`,
        unclosed.node.start,
        unclosed.node.end,
      );
    }

    return result;
  }
}

