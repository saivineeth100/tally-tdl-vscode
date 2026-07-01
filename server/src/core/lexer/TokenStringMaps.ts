import { TokenKind } from "../lexer/tokenKind";

export class TokenStringMaps {

    static KEYWORDS = new Map<string, TokenKind>([]);
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
        ["Ending", TokenKind.EndingToken],
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