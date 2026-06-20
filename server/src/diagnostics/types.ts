/** Payload for MissingDefinition diagnostic */
export interface MissingDefinitionData {
    name: string;
    type: string;
}

/** Payload for UnknownAttribute diagnostic */
export interface UnknownAttributeData {
    attrName: string;
    defTypeName: string;
}

/** Payload for UnknownSchemaProperty diagnostic */
export interface UnknownSchemaPropertyData {
    attrName: string;
    schemaName: string;
}

/** Payload for MissingEndStatement diagnostic */
export interface MissingEndStatementData {
    expectedEnd: string;
}

/** Payload for label sequence diagnostics */
export interface LabelSequenceData {
    expectedLabel: string;
}

/** Payload for UnknownDefinitionType diagnostic */
export interface UnknownDefinitionTypeData {
    defTypeName: string;
}
