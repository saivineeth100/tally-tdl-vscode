import { TokenKind } from "./tokenKind";

export class TokenStringMaps {

    static KEYWORDS = new Map<string, TokenKind>([
        ["Border", TokenKind.BorderDefTypeToken],
        ["Button", TokenKind.ButtonDefTypeToken],
        ["Collection", TokenKind.CollectionDefTypeToken],
        ["Color", TokenKind.ColorDefTypeToken],
        ["Colour", TokenKind.ColourDefTypeToken],
        ["COMInterface", TokenKind.COMInterfaceDefTypeToken],
        ["Field", TokenKind.FieldDefTypeToken],
        ["Form", TokenKind.FormDefTypeToken],
        ["Function", TokenKind.FunctionDefTypeToken],
        ["ImportFile", TokenKind.ImportFileDefTypeToken],
        ["ImportObject", TokenKind.ImportObjectDefTypeToken],
        ["Key", TokenKind.KeyDefTypeToken],
        ["Line", TokenKind.LineDefTypeToken],
        ["Menu", TokenKind.MenuDefTypeToken],
        ["NameSet", TokenKind.NameSetDefTypeToken],
        ["Object", TokenKind.ObjectDefTypeToken],
        ["Part", TokenKind.PartDefTypeToken],
        ["QueryBox", TokenKind.QueryBoxDefTypeToken],
        ["Report", TokenKind.ReportDefTypeToken],
        ["Resource", TokenKind.ResourceDefTypeToken],
        ["RuleSet", TokenKind.RuleSetDefTypeToken],
        ["Style", TokenKind.StyleDefTypeToken],
        ["Table", TokenKind.TableDefTypeToken],
        ["Variable", TokenKind.VariableDefTypeToken],

    ]);
    static RESERVED_WORDS = new Map<string, TokenKind>([
        ["TRUE", TokenKind.TrueToken],
        ["ON", TokenKind.OnToken],
        ["YES", TokenKind.YesToken],
        ["FALSE", TokenKind.FalseToken],
        ["OFF", TokenKind.OffToken],
        ["NO", TokenKind.NoToken],

        ["In", TokenKind.InToken],
        ["Null", TokenKind.NullToken],
        ["Between", TokenKind.BetweenToken],
        ["And", TokenKind.AndToken],
        ["Contains", TokenKind.ContainsToken],
        ["Containing", TokenKind.ContainingToken],
        ["Starting", TokenKind.StartingToken],
        ["Starting With", TokenKind.StartingWithToken],
        ["Ending", TokenKind.EndingToken],
        ["Ending With", TokenKind.EndingWithToken],
        ["Like", TokenKind.LikeToken],
        ["OR", TokenKind.OrToken],
        ["NOT", TokenKind.NotToken],
    ]);
    static OPERATORS_AND_PUNCTUATORS = new Map<string, TokenKind>([
        ["[", TokenKind.OpenSquareBracketToken],
        ["]", TokenKind.CloseSquareBracketToken],
        ["!", TokenKind.ExclamationToken],
        ["#", TokenKind.HashToken],
        ["##", TokenKind.DoubleHashToken],
        ["$", TokenKind.DollarToken],
        ["$$", TokenKind.DoubleDollarToken],
        ["@@", TokenKind.DoubleAtTheRateToken],
        ["@", TokenKind.AtTheRateToken],
        [":", TokenKind.ColonToken],
        ["/*", TokenKind.OpenCommentSlashToken],
        ["*/", TokenKind.CloseCommentSlashToken],
        ["/", TokenKind.SlashToken],
        ["_", TokenKind.UnderScoreToken],



        ["+", TokenKind.PlusToken],
        ["-", TokenKind.MinusToken],
        ["/", TokenKind.DivisionToken],
        ["*", TokenKind.AsteriskToken],
        ["=", TokenKind.EqualsToken],
        ["<", TokenKind.LessThanToken],
        [">", TokenKind.GreaterThanToken],

    ]);
}