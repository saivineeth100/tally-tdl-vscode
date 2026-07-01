import { ScopeManager } from "../semantics/scopeManager";
import { normalizeTypeName } from "./normalizeUtils";


/**
 * Returns the expected 'RefersTo' type string for a Menu Item List attribute
 * like 'Item' or 'Key Item' at a specific parameter index.
 * 
 * Syntax rules:
 * - Item: <Item Name> : <Action> : <Action Parameters>
 * - Key Item: <Item Name> : <Hot Key> : <Action> : <Action Parameters>
 * 
 * @param attrName The name of the attribute (e.g. 'Item', 'Key Item')
 *    This should be un-normalized string.
 * @param paramIndex The 0-based index of the parameter being evaluated.
 * @param actionName The name of the action (e.g., 'Menu', 'Display') if the index is beyond the action.
 * @param scopeManager Used to fetch the action definition parameters.
 * @returns The expected type string (e.g., 'String', 'Action', 'Menu', 'Report') or undefined.
 */
export function getExpectedTypeForMenuItem(
    attrName: string,
    paramIndex: number,
    actionName?: string,
    scopeManager?: ScopeManager
): string | undefined {
    const normalizedAttr = normalizeTypeName(attrName);
    
    // Ignore 'indent' as per user instruction.
    if (normalizedAttr === 'indent') {
        return undefined;
    }

    const isKeyItem = normalizedAttr === 'keyitem';
    const actionIndex = isKeyItem ? 2 : 1;

    // 1. Strings (Names and Keys)
    if (paramIndex === 0) {
        return 'String'; // Item Name
    }
    
    if (isKeyItem && paramIndex === 1) {
        return 'String'; // Hot Key
    }

    // 2. Action Keyword
    if (paramIndex === actionIndex) {
        return 'Action';
    }

    // 3. Action Parameters
    if (paramIndex > actionIndex) {
        if (!actionName) return undefined;
        
        const normalizedAction = normalizeTypeName(actionName);
        
        // Special case for 'Menu' action which acts like routing
        if (normalizedAction === 'menu') {
            if (paramIndex === actionIndex + 1) {
                return 'Menu';
            }
            return undefined;
        }
        
        // General action parameter resolution
        if (scopeManager) {
            const actionDef = scopeManager.globalScope.actions.get(normalizedAction);
            if (actionDef && actionDef.parameters && actionDef.parameters.length > 0) {
                const actionParamIndex = paramIndex - (actionIndex + 1);
                
                if (actionParamIndex >= 0 && actionParamIndex < actionDef.parameters.length) {
                    const p = actionDef.parameters[actionParamIndex];
                    if (p.RefersTo) {
                        return p.RefersTo.trim();
                    } else if (p.DataType) {
                        return p.DataType.trim();
                    }
                } else if (actionParamIndex >= 0 && actionDef.parameters.length > 0) {
                    // Check if last parameter is a list/vararg
                    const lastParam = actionDef.parameters[actionDef.parameters.length - 1];
                    if (lastParam.IsList || lastParam.IsVariableArgument) {
                        if (lastParam.RefersTo) {
                            return lastParam.RefersTo.trim();
                        } else if (lastParam.DataType) {
                            return lastParam.DataType.trim();
                        }
                    }
                }
            }
        }
    }

    return undefined;
}
