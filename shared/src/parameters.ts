/** Parameter metadata for Functions, Actions, and Attributes */
export interface TDLParameter {
    Description?: string;
    ParameterType?: string;
    IsConstant: boolean;
    DataType?: string;
    IsMandatory: boolean;
    RefersTo?: string;
    KeywordSet?: string;
    Keywords?: string[];
    IsList: boolean;
    IsVariableArgument: boolean;
    DimensionExpression: boolean;
}

/** Schema property metadata */
export interface TDLSchemaProperty {
    Name: string;
    IsComplex: boolean;
    IsRepeated: boolean;
    DataType?: string;
    ObjectName?: string;
}
