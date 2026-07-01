//https://github.com/microsoft/tolerant-php-parser/blob/main/src/TokenKind.php

export enum TokenKind {
    Unknown = 0,
    EndOfFileToken = 1,
    SkippedToken = 3,
    MissingToken = 4,
    CarriageReturnLineFeed = 5,
    LineFeed = 6,
    CarriageReturn = 7,

    SingleLineComment = 50,
    MultiLineComment = 51,

    SlashToken = 16,
    OpenCommentSlashToken = 17,
    CloseCommentSlashToken = 18,

    OpenSquareBracketToken = 100,
    CloseSquareBracketToken = 101,

    ExclamationToken = 102,
    AsteriskToken = 103,
    HashToken = 104,
    MultiplyToken = 28,
    UnderScoreToken = 29,

    AtTheRateToken = 200,
    DoubleAtTheRateToken = 201,
    DoubleHashToken = 202,
    DollarToken = 203,
    DoubleDollarToken = 204,
    ColonToken = 205,
    PlusToken = 209,
    LineContinuationToken = 210,
    CommaToken = 211,
    DotToken = 212,
    OpenParenToken = 213,
    CloseParenToken = 214,


    MinusToken = 300,
    DivisionToken = 301,
    PercentToken = 303,

    GreaterThanEqualsToken = 510,
    LessThanEqualsToken = 511,
    NotEqualsToken = 512,
    StringLiteralToken = 604,

    OrToken = 400,
    AndToken = 401,
    NotToken = 402,
    TrueToken = 403,
    OnToken = 404,
    YesToken = 405,
    FalseToken = 406,
    OffToken = 407,
    NoToken = 408,


    EqualsToken = 500,
    LessThanToken = 501,
    GreaterThanToken = 502,
    InToken = 503,
    NullToken = 504,
    BetweenToken = 505,

    ContainsToken = 550,
    ContainingToken = 551,
    StartingToken = 552,
    StartingWithToken = 553,
    EndingToken = 554,
    EndingWithToken = 555,
    LikeToken = 556,




    IdentifierToken = 600,
    SpaceToken = 601,
    StringToken = 602,
    NumberToken = 603,
    DefinitionTypeToken = 801,
    DefinitionNameToken = 802}

