// Request and Notification types for custom methods

export namespace CustomRequests {
    export const GetScopeTreeDebug = "tdl/getScopeTreeDebug";
    export const GetScopeChildren = "tdl/getScopeChildren";
    export const GetScopeNode = "tdl/getScopeNode";
    export const GetScopeSymbols = "tdl/getScopeSymbols";
    export const ResolveGlobalSymbol = "tdl/resolveGlobalSymbol";
    export const ConvertToXml = "tdl/convertToXml";
}

export namespace CustomNotifications {
    export const BuildCustomLibraryCache = "tdl/buildCustomLibraryCache";
    export const ActiveUrisChanged = "tdl/activeUrisChanged";
}
