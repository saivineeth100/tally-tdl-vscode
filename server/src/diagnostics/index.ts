import { SyntaxRules } from './syntaxRules';
import { DefinitionRules } from './definitionRules';
import { SchemaRules } from './schemaRules';
import { StatementRules } from './statementRules';

export * from './utils';
export * from './syntaxRules';
export * from './definitionRules';
export * from './schemaRules';
export * from './statementRules';

export const DiagnosticRules = {
    ...SyntaxRules,
    ...DefinitionRules,
    ...SchemaRules,
    ...StatementRules
} as const;

