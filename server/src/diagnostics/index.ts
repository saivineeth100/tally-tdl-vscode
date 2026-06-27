import { SyntaxRules } from './syntaxRules';
import { DefinitionRules } from './definitionRules';
import { SchemaRules } from './schemaRules';
import { StatementRules } from './statementRules';
import { ArityRules } from './arityRules';
import { AttributeRules } from './attributeRules';

export * from './utils';
export * from './types';
export * from './syntaxRules';
export * from './definitionRules';
export { MissingDefinitionData, DefinitionNotInScopeData, UnknownAttributeData, UnknownDefinitionTypeData, MissingEndStatementData, UnknownSchemaPropertyData } from './types';
export * from './schemaRules';
export * from './statementRules';
export * from './arityRules';
export * from './attributeRules';

export const DiagnosticRules = {
    ...SyntaxRules,
    ...DefinitionRules,
    ...SchemaRules,
    ...StatementRules,
    ...ArityRules,
    ...AttributeRules
} as const;

