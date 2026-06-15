import { SymbolKind } from '../services/symbolTable';

export function definitionTypeToSymbolKind(definitionType: string): SymbolKind {
    if (!definitionType) return SymbolKind.Collection;

    const lowerType = definitionType.toLowerCase();
    
    if (lowerType === 'report') return SymbolKind.Report;
    if (lowerType === 'form') return SymbolKind.Form;
    if (lowerType === 'part') return SymbolKind.Part;
    if (lowerType === 'line') return SymbolKind.Line;
    if (lowerType === 'field') return SymbolKind.Field;
    if (lowerType === 'collection') return SymbolKind.Collection;
    if (lowerType === 'menu') return SymbolKind.Menu;
    if (lowerType === 'button') return SymbolKind.Button;
    if (lowerType === 'key') return SymbolKind.Key;
    if (lowerType === 'function') return SymbolKind.Function;
    if (lowerType === 'system variable' || lowerType === 'variable') return SymbolKind.Variable;
    
    return SymbolKind.Collection;
}
