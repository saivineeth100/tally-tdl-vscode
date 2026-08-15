// Request and Notification types for custom methods

export namespace CustomRequests {
    export const GetScopeTreeDebug = "tdl/getScopeTreeDebug";
    export const GetScopeChildren = "tdl/getScopeChildren";
    export const GetScopeNode = "tdl/getScopeNode";
    export const GetScopeSymbols = "tdl/getScopeSymbols";
    export const GetScopeDetails = "tdl/getScopeDetails";
    export const ResolveGlobalSymbol = "tdl/resolveGlobalSymbol";
    export const ConvertToXml = "tdl/convertToXml";
    export const GetPlaygroundSuggestions = "tdl/getPlaygroundSuggestions";
    export const GetAttributesForDefType = "tdl/getAttributesForDefType";
    export const GetSchemaProperties = "tdl/getSchemaProperties";
    export const ParseEnvelopeXml = "tdl/parseEnvelopeXml";
}

export namespace CustomNotifications {
    export const BuildCustomLibraryCache = "tdl/buildCustomLibraryCache";
    export const ActiveUrisChanged = "tdl/activeUrisChanged";
}
