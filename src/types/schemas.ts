import { z } from 'zod';

const JsonRecordSchema = z.record(z.string(), z.unknown());
export const maybe = <T extends z.ZodTypeAny>(schema: T) => schema.nullable().optional();

type UnknownRecord = Record<string, unknown>;

function isUnknownRecord(value: unknown): value is UnknownRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function extractStringValue(value: unknown): string | null | undefined {
    if (value == null) {
        return value;
    }

    if (typeof value === 'string') {
        return value;
    }

    if (isUnknownRecord(value)) {
        const code = value.code;
        const abbreviation = value.abbreviation;
        const description = value.description;

        if (typeof code === 'string') {
            return code;
        }

        if (typeof abbreviation === 'string') {
            return abbreviation;
        }

        if (typeof description === 'string') {
            return description;
        }
    }

    return undefined;
}

function firstPresentString(values: unknown[]): string | null | undefined {
    for (const value of values) {
        const stringValue = extractStringValue(value);

        if (stringValue != null && stringValue.trim() !== '') {
            return stringValue;
        }
    }

    return undefined;
}

function normalizeBatterInput(input: unknown): unknown {
    if (!isUnknownRecord(input)) {
        return input;
    }

    const batHand = firstPresentString([
        input.batHand,
        input.bat_hand,
        input.batSide,
        input.bat_side,
        input.stand,
    ]);

    if (batHand == null) {
        return input;
    }

    return {
        ...input,
        batHand,
    };
}

export const ScheduleTeamSchema = z.object({
    team: z.object({
        id: z.number().positive(),
        name: z.string(),
    }),
    leagueRecord: z.object({
        wins: z.number().nonnegative(),
        losses: z.number().nonnegative(),
        pct: z.string(),
    }),
    splitSquad: z.boolean(),
    seriesNumber: z.number().positive()
});

export const ScheduleSchema = z.array(
    z.object({
        gamePk: z.number().positive(),
        gameDate: z.string(),
        officialDate: maybe(z.string()),
        scheduledStartUtc: maybe(z.string()),
        scheduledStartTimeUtc: maybe(z.string()),
        teams: z.object({
            home: ScheduleTeamSchema,
            away: ScheduleTeamSchema,
        }),
        venue: z.object({
            id: z.number().positive(),
            name: z.string(),
        }),
    })
);

export const PlayerInfoSchema = z.object({
    id: z.number().int(),
    fullName: maybe(z.string()),
    boxscoreName: maybe(z.string()),
});

export const BasicTeamInfoSchema = z.object({
    id: z.number().int(),
    name: maybe(z.string()),
});

export const VenueInfoSchema = z.object({
    id: maybe(z.number().int()),
    name: maybe(z.string()),
    link: maybe(z.string()),
});

export const PositionSchema = z.object({
    code: maybe(z.string()),
    name: maybe(z.string()),
    type: maybe(z.string()),
    abbreviation: maybe(z.string()),
});

export const PlayerStatusSchema = z.object({
    code: maybe(z.string()),
    description: maybe(z.string()),
});

export const PlayerGameStatusSchema = z.object({
    isCurrentBatter: maybe(z.boolean()),
    isCurrentPitcher: maybe(z.boolean()),
    isOnBench: maybe(z.boolean()),
    isSubstitute: maybe(z.boolean()),
});

export const MatchupSideSchema = z.object({
    code: maybe(z.string()),
    description: maybe(z.string()),
});

export const InningStatsSchema = z.object({
    runs: maybe(z.number().int()),
    hits: maybe(z.number().int()),
    errors: maybe(z.number().int()),
    leftOnBase: maybe(z.number().int()),
});

export const InningSchema = z.object({
    num: maybe(z.number().int()),
    ordinalNum: maybe(z.string()),
    home: maybe(InningStatsSchema),
    away: maybe(InningStatsSchema),
});

export const ScoreboardTeamsSchema = z.object({
    home: maybe(InningStatsSchema),
    away: maybe(InningStatsSchema),
});

export const LinescoreSchema = z.object({
    currentInning: maybe(z.number().int()),
    currentInningOrdinal: maybe(z.string()),
    inningState: maybe(z.string()),
    inningHalf: maybe(z.string()),
    isTopInning: maybe(z.boolean()),
    scheduledInnings: maybe(z.number().int()),
    innings: maybe(z.array(InningSchema)),
});

export const PlayResultSchema = z.object({
    type: maybe(z.string()),
    event: maybe(z.string()),
    eventType: maybe(z.string()),
    description: maybe(z.string()),
    rbi: maybe(z.number().int()),
    awayScore: maybe(z.number().int()),
    homeScore: maybe(z.number().int()),
    isOut: maybe(z.boolean()),
});

export const PlayAboutSchema = z.object({
    atBatIndex: maybe(z.number().int()),
    halfInning: maybe(z.string()),
    isTopInning: maybe(z.boolean()),
    inning: maybe(z.number().int()),
    startTime: maybe(z.string()),
    endTime: maybe(z.string()),
    isComplete: maybe(z.boolean()),
    isScoringPlay: maybe(z.boolean()),
    hasOut: maybe(z.boolean()),
    captivatingIndex: maybe(z.number().int()),
});

export const PlayCountSchema = z.object({
    balls: maybe(z.number().int()),
    strikes: maybe(z.number().int()),
    outs: maybe(z.number().int()),
});

export const MatchupSchema = z.object({
    batter: maybe(PlayerInfoSchema),
    batSide: maybe(MatchupSideSchema),
    pitcher: maybe(PlayerInfoSchema),
    pitchHand: maybe(MatchupSideSchema),
});

export const CurrentPlaySchema = z.object({
    result: maybe(PlayResultSchema),
    about: maybe(PlayAboutSchema),
    count: maybe(PlayCountSchema),
    matchup: maybe(MatchupSchema),
    playEvents: maybe(z.array(JsonRecordSchema)),
});

export const ProbablePitchersSchema = z.object({
    away: maybe(PlayerInfoSchema),
    home: maybe(PlayerInfoSchema),
});

export const GameStatsSchema = z.object({
    wpa: maybe(z.object({
        gameWpa: maybe(z.array(JsonRecordSchema)),
        lastPlays: maybe(z.array(JsonRecordSchema)),
        topWpaPlayers: maybe(z.array(JsonRecordSchema)),
    })),
    exitVelocity: maybe(z.object({
        top: maybe(z.array(JsonRecordSchema)),
        lastEV: maybe(z.array(JsonRecordSchema)),
        topDistance: maybe(z.array(JsonRecordSchema)),
    })),
    pitchVelocity: maybe(z.object({
        topPitches: maybe(z.array(JsonRecordSchema)),
        currentPitcher: maybe(z.array(JsonRecordSchema)),
    })),
});

export const TeamStatsSchema = z.object({
    batting: maybe(JsonRecordSchema),
    pitching: maybe(JsonRecordSchema),
    fielding: maybe(JsonRecordSchema),
});

export const BoxscorePlayerSchema = z.object({
    person: maybe(PlayerInfoSchema),
    jerseyNumber: maybe(z.string()),
    position: maybe(PositionSchema),
    status: maybe(PlayerStatusSchema),
    parentTeamId: maybe(z.number().int()),
    battingOrder: maybe(z.string()),
    stats: maybe(TeamStatsSchema),
    seasonStats: maybe(TeamStatsSchema),
    gameStatus: maybe(PlayerGameStatusSchema),
    allPositions: maybe(z.array(PositionSchema)),
});

export const BoxscoreTeamSchema = z.object({
    team: maybe(BasicTeamInfoSchema),
    teamStats: maybe(TeamStatsSchema),
    players: maybe(z.record(z.string(), BoxscorePlayerSchema)),
    batters: maybe(z.array(z.number().int())),
    pitchers: maybe(z.array(z.number().int())),
    bench: maybe(z.array(z.number().int())),
    bullpen: maybe(z.array(z.number().int())),
    battingOrder: maybe(z.array(z.number().int())),
});

export const BoxscoreTeamsSchema = z.object({
    away: maybe(BoxscoreTeamSchema),
    home: maybe(BoxscoreTeamSchema),
});

export const BoxscoreSchema = z.object({
    teams: maybe(BoxscoreTeamsSchema),
    info: maybe(z.array(JsonRecordSchema)),
    note: maybe(z.array(JsonRecordSchema)),
});

export const OfficialSchema = z.object({
    official: maybe(PlayerInfoSchema),
    officialType: maybe(z.string()),
});

export const GameInfoSchema = z.object({
    label: maybe(z.string()),
    value: maybe(z.string()),
});

export const DefenseSchema = z.object({
    pitcher: maybe(PlayerInfoSchema),
    catcher: maybe(PlayerInfoSchema),
    first: maybe(PlayerInfoSchema),
    second: maybe(PlayerInfoSchema),
    third: maybe(PlayerInfoSchema),
    shortstop: maybe(PlayerInfoSchema),
    left: maybe(PlayerInfoSchema),
    center: maybe(PlayerInfoSchema),
    right: maybe(PlayerInfoSchema),
    batter: maybe(PlayerInfoSchema),
    onDeck: maybe(PlayerInfoSchema),
    inHole: maybe(PlayerInfoSchema),
    battingOrder: maybe(z.number().int()),
    team: maybe(BasicTeamInfoSchema),
});

export const OffenseSchema = z.object({
    batter: maybe(PlayerInfoSchema),
    onDeck: maybe(PlayerInfoSchema),
    inHole: maybe(PlayerInfoSchema),
    pitcher: maybe(PlayerInfoSchema),
    battingOrder: maybe(z.number().int()),
    team: maybe(BasicTeamInfoSchema),
    balls: maybe(z.number().int()),
    strikes: maybe(z.number().int()),
    outs: maybe(z.number().int()),
});

export const TeamDataSchema = z.object({
    id: maybe(z.number().int()),
    name: maybe(z.string()),
    link: maybe(z.string()),
    season: maybe(z.number().int()),
    venue: maybe(VenueInfoSchema),
    teamCode: maybe(z.string()),
    fileCode: maybe(z.string()),
    abbreviation: maybe(z.string()),
    teamName: maybe(z.string()),
    locationName: maybe(z.string()),
    firstYearOfPlay: maybe(z.string()),
    shortName: maybe(z.string()),
    franchiseName: maybe(z.string()),
    clubName: maybe(z.string()),
    active: maybe(z.boolean()),
});

export const ScoreboardSchema = z.object({
    gamePk: maybe(z.number().int()),
    linescore: maybe(LinescoreSchema),
    teams: ScoreboardTeamsSchema,
    defense: maybe(DefenseSchema),
    offense: maybe(OffenseSchema),
    stats: maybe(GameStatsSchema),
    currentPlay: maybe(CurrentPlaySchema),
    datetime: maybe(z.object({
        dateTime: maybe(z.string()),
        originalDate: maybe(z.string()),
        officialDate: maybe(z.string()),
        dayNight: maybe(z.string()),
        time: maybe(z.string()),
        ampm: maybe(z.string()),
    })),
    probablePitchers: maybe(ProbablePitchersSchema),
});

export const TopPerformerSchema = z.object({
    player: maybe(BoxscorePlayerSchema),
    type: maybe(z.string()),
    gameScore: maybe(z.number().int()),
    hittingGameScore: maybe(z.number().int()),
});

export const GameSchema = z.object({
    game_status_code: maybe(z.string()),
    game_status: z.string(),
    gamedayType: maybe(z.string()),
    gameDate: maybe(z.string()),
    hasAbs: maybe(z.boolean()),
    scoreboard: maybe(ScoreboardSchema),
    venue_id: z.number().int(),
    home_team_data: maybe(TeamDataSchema),
    away_team_data: maybe(TeamDataSchema),
    team_home_id: maybe(z.number().int()),
    team_away_id: maybe(z.number().int()),
    away_lineup: maybe(z.array(z.number().int())),
    home_lineup: maybe(z.array(z.number().int())),
    away_pitcher_lineup: maybe(z.array(z.number().int())),
    home_pitcher_lineup: maybe(z.array(z.number().int())),
    boxscore: maybe(BoxscoreSchema),
    officials: maybe(z.array(OfficialSchema)),
    info: maybe(z.array(GameInfoSchema)),
    topPerformers: maybe(z.array(TopPerformerSchema)),
});

export function processSchedule(schedule : unknown): Schedule {
    const data = ScheduleSchema.parse(schedule);
    return data;
}

export function processGame(game : unknown): Game {
    const data = GameSchema.parse(game);
    return data;
}

export type Schedule = z.infer<typeof ScheduleSchema>;
export type Game = z.infer<typeof GameSchema>;

export const DateTimeSchema = z.object({
    originalDate: maybe(z.string()),
    officialDate: maybe(z.string()),
    dayNight: maybe(z.string()),
    time: maybe(z.string()),
    ampm: maybe(z.string())
});

export const GameTeamSchema = z.object({
    id: maybe(z.number().int()),
    name: maybe(z.string()),
    abbreviation: maybe(z.string()),
    runs: maybe(z.number().int()),
    runsAgainst: maybe(z.number().int()),
    hits: maybe(z.number().int()),
    errors: maybe(z.number().int()),
    leftOnBase: maybe(z.number().int()),
    xBA: maybe(z.number()),
    wOBA: maybe(z.number()),
    xSLG: maybe(z.number()),
    wOPS: maybe(z.number()),
    nPA: maybe(z.number().int()),
    expRunsFor: maybe(z.number()),
    expWin: maybe(z.number()),
    expWinBat: maybe(z.number()),
    expWinPitch: maybe(z.number()),
    expTimesOn: maybe(z.number()),
    expRunsAgainst: maybe(z.number()),
    scoringChances: maybe(z.number()),
    scoringChanceConversions: maybe(z.number()),
    scoringChanceConversionRate: maybe(z.number()),
});

export const BattingLineSchema = z.object({
    plateAppearances: maybe(z.number()),
    atBats: maybe(z.number()),
    hits: maybe(z.number()),
    singles: maybe(z.number()),
    doubles: maybe(z.number()),
    triples: maybe(z.number()),
    homeRuns: maybe(z.number()),
    walks: maybe(z.number()),
    hitByPitch: maybe(z.number()),
    strikeouts: maybe(z.number()),
    sacFlies: maybe(z.number()),
    totalBases: maybe(z.number()),
    battingAverage: maybe(z.number()),
    onBasePercentage: maybe(z.number()),
    sluggingPercentage: maybe(z.number()),
    ops: maybe(z.number()),
    isolatedPower: maybe(z.number()),
    babip: maybe(z.number()),
    walkRate: maybe(z.number()),
    strikeoutRate: maybe(z.number()),
});

export const ExpectedBattingLineSchema = z.object({
    xBA: maybe(z.number()),
    xOBP: maybe(z.number()),
    xWOBA: maybe(z.number()),
    xSLG: maybe(z.number()),
    xOPS: maybe(z.number()),
    xHits: maybe(z.number()),
    xTotalBases: maybe(z.number()),
    xWeightedTimesOnBase: maybe(z.number()),
    xRunsCreated: maybe(z.number()),
    xRunsCreatedPerPA: maybe(z.number()),
    xLinearWeightRuns: maybe(z.number()),
    qualityAdjustedRuns: maybe(z.number()),
    contactRunValue: maybe(z.number()),
    disciplineRunValue: maybe(z.number()),
    xHomeRuns: maybe(z.number()),
    hitsAboveExpected: maybe(z.number()),
    totalBasesAboveExpected: maybe(z.number()),
    opsAboveExpected: maybe(z.number()),
    runsCreatedAboveExpected: maybe(z.number()),
});

export const BattedBallProfileSchema = z.object({
    ballsInPlay: maybe(z.number()),
    hardHitBalls: maybe(z.number()),
    barrels: maybe(z.number()),
    sweetSpotBalls: maybe(z.number()),
    avgExitVelo: maybe(z.number()),
    maxExitVelo: maybe(z.number()),
    avgLaunchAngle: maybe(z.number()),
    hardHitRate: maybe(z.number()),
    barrelRate: maybe(z.number()),
    sweetSpotRate: maybe(z.number()),
});

export const PlateDisciplineSchema = z.object({
    pitches: maybe(z.number()),
    strikes: maybe(z.number()),
    balls: maybe(z.number()),
    swings: maybe(z.number()),
    whiffs: maybe(z.number()),
    calledStrikes: maybe(z.number()),
    calledStrikesPlusWhiffs: maybe(z.number()),
    firstPitchStrikes: maybe(z.number()),
    strikeRate: maybe(z.number()),
    swingRate: maybe(z.number()),
    whiffRate: maybe(z.number()),
    cswRate: maybe(z.number()),
    firstPitchStrikeRate: maybe(z.number()),
});

export const PitchingLineSchema = z.object({
    battersFaced: maybe(z.number()),
    outs: maybe(z.number()),
    inningsPitched: maybe(z.string()),
    pitches: maybe(z.number()),
    strikes: maybe(z.number()),
    balls: maybe(z.number()),
    hitsAllowed: maybe(z.number()),
    walksAllowed: maybe(z.number()),
    hitByPitchAllowed: maybe(z.number()),
    strikeouts: maybe(z.number()),
    homeRunsAllowed: maybe(z.number()),
    strikeRate: maybe(z.number()),
    strikeoutRate: maybe(z.number()),
    walkRate: maybe(z.number()),
});

export const ExpectedPitchingLineSchema = z.object({
    xBAAllowed: maybe(z.number()),
    xOBPAllowed: maybe(z.number()),
    xWOBAAllowed: maybe(z.number()),
    xSLGAllowed: maybe(z.number()),
    xOPSAllowed: maybe(z.number()),
    xHitsAllowed: maybe(z.number()),
    xTotalBasesAllowed: maybe(z.number()),
    xWeightedTimesOnBaseAllowed: maybe(z.number()),
    expectedRunsAllowed: maybe(z.number()),
    qualityAdjustedRunsAllowed: maybe(z.number()),
    xHomeRunsAllowed: maybe(z.number()),
    contactRunValueAllowed: maybe(z.number()),
    disciplineRunValueAllowed: maybe(z.number()),
    runPreventionValue: maybe(z.number()),
});

export const TeamExpectedOutcomeSchema = z.object({
    expectedRunsFor: maybe(z.number()),
    expectedRunsAgainst: maybe(z.number()),
    qualityAdjustedRunsFor: maybe(z.number()),
    qualityAdjustedRunsAgainst: maybe(z.number()),
    expectedRunDifferential: maybe(z.number()),
    qualityAdjustedRunDifferential: maybe(z.number()),
    expectedWinPercentage: maybe(z.number()),
    contactAdvantageRuns: maybe(z.number()),
    disciplineAdvantageRuns: maybe(z.number()),
    deservedRunsAboveActual: maybe(z.number()),
    actualRunsAboveExpected: maybe(z.number()),
    actualRunsAllowedAboveExpected: maybe(z.number()),
});

export const ExtendedGameTeamSchema = GameTeamSchema.extend({
    batting: maybe(BattingLineSchema),
    expectedBatting: maybe(ExpectedBattingLineSchema),
    battedBall: maybe(BattedBallProfileSchema),
    plateDiscipline: maybe(PlateDisciplineSchema),
    pitching: maybe(PitchingLineSchema),
    expectedPitching: maybe(ExpectedPitchingLineSchema),
    contactAllowed: maybe(BattedBallProfileSchema),
    expectedOutcome: maybe(TeamExpectedOutcomeSchema),
});

export const BatterSchema = z.preprocess(normalizeBatterInput, z.object({
    id: z.number().int(),
    fullName: maybe(z.string()),
    firstName: maybe(z.string()),
    lastName: maybe(z.string()),
    primaryNumber: maybe(z.string()),
    position: maybe(z.string()),
    batHand: maybe(z.string()),
    hits: maybe(z.number().int()),
    runs: maybe(z.number().int()),
    errors: maybe(z.number().int()),
    nPA: maybe(z.number().int()),
    xBa: maybe(z.number()),
    wOBA: maybe(z.number()),
    xSLG: maybe(z.number()),
    wOPS: maybe(z.number()),
    tOPS: maybe(z.number()),
    expTimesOnBase: maybe(z.number()),
    expBases: maybe(z.number()),
    maxExitVelo: maybe(z.number()),
    avgBatSpeed: maybe(z.number()),
    maxBatSpeed: maybe(z.number()),
    avgExitVelo: maybe(z.number()),
    rispPlateAppearances: maybe(z.number()),
    rispConversions: maybe(z.number()),
    rispConversionRate: maybe(z.number()),
    onHomeTeam: z.boolean(),
    abCount: maybe(z.number()),
    wobaCount: maybe(z.number()),
    batting: maybe(BattingLineSchema),
    expected: maybe(ExpectedBattingLineSchema),
    battedBall: maybe(BattedBallProfileSchema),
    plateDiscipline: maybe(PlateDisciplineSchema),
}));

export const PitcherSchema = z.object({
    id: z.number().int(),
    fullName: maybe(z.string()),
    firstName: maybe(z.string()),
    lastName: maybe(z.string()),
    primaryNumber: maybe(z.string()),
    hitsAgainst: maybe(z.number().int()),
    strikeouts: maybe(z.number().int()),
    pitchHand: maybe(z.string()),
    xBA: maybe(z.number()),
    wOBA: maybe(z.number()),
    xSLG: maybe(z.number()),
    wOPS: maybe(z.number()),
    expTimesOnBase: maybe(z.number()),
    expBases: maybe(z.number()),
    battersFaced: maybe(z.number().int()),
    outs: maybe(z.number().int()),
    runsAgainst: maybe(z.number()),
    expRunsAgainst: maybe(z.number()),
    maxExitVelo: maybe(z.number()),
    avgExitVelo: maybe(z.number()),
    avgLA: maybe(z.number()),
    avgBatSpeed: maybe(z.number()),
    maxBatSpeed: maybe(z.number()),
    onHomeTeam: z.boolean(),
    pitching: maybe(PitchingLineSchema),
    expected: maybe(ExpectedPitchingLineSchema),
    contactAllowed: maybe(BattedBallProfileSchema),
    plateDiscipline: maybe(PlateDisciplineSchema),
});

export const SummaryLineScoreInningSchema = z.object({
    inning: maybe(z.number()),
    ordinal: maybe(z.string()),
    homeRuns: maybe(z.number()),
    awayRuns: maybe(z.number()),
});

export const SummaryLineScoreSchema = z.object({
    currentInning: maybe(z.number()),
    currentInningOrdinal: maybe(z.string()),
    inningState: maybe(z.string()),
    isTopInning: maybe(z.boolean()),
    scheduledInnings: maybe(z.number()),
    home: maybe(InningStatsSchema),
    away: maybe(InningStatsSchema),
    innings: maybe(z.array(SummaryLineScoreInningSchema)),
});

export const TeamShareSchema = z.object({
    home: maybe(z.number()),
    away: maybe(z.number()),
});

export const GameSharesSchema = z.object({
    runs: maybe(TeamShareSchema),
    expectedRuns: maybe(TeamShareSchema),
    qualityAdjustedRuns: maybe(TeamShareSchema),
    expectedRunDifferential: maybe(TeamShareSchema),
    hits: maybe(TeamShareSchema),
    totalBases: maybe(TeamShareSchema),
    hardHitBalls: maybe(TeamShareSchema),
    winProbability: maybe(TeamShareSchema),
});

export const GameDifferentialsSchema = z.object({
    homeRunDifferential: maybe(z.number()),
    awayRunDifferential: maybe(z.number()),
    homeExpectedRunDifferential: maybe(z.number()),
    awayExpectedRunDifferential: maybe(z.number()),
    homeQualityAdjustedRunDifferential: maybe(z.number()),
    awayQualityAdjustedRunDifferential: maybe(z.number()),
    homeRunsAboveExpected: maybe(z.number()),
    awayRunsAboveExpected: maybe(z.number()),
    homeRunsAllowedAboveExpected: maybe(z.number()),
    awayRunsAllowedAboveExpected: maybe(z.number()),
});

export const LeaderEntrySchema = z.object({
    id: z.number().int(),
    fullName: z.string(),
    teamSide: z.enum(['home', 'away']),
    value: z.number(),
    label: z.string(),
});

export const GameLeadersSchema = z.object({
    topBattersByWOps: maybe(z.array(LeaderEntrySchema)),
    topBattersByXSLG: maybe(z.array(LeaderEntrySchema)),
    topPitchersByWhiffRate: maybe(z.array(LeaderEntrySchema)),
    topPitchersByExpectedRunsAllowed: maybe(z.array(LeaderEntrySchema)),
});

export const GameExpectedOutcomeSchema = z.object({
    homeExpectedWinPercentage: maybe(z.number()),
    awayExpectedWinPercentage: maybe(z.number()),
    homeExpectedRuns: maybe(z.number()),
    awayExpectedRuns: maybe(z.number()),
    homeExpectedRunsAllowed: maybe(z.number()),
    awayExpectedRunsAllowed: maybe(z.number()),
    homeQualityAdjustedRuns: maybe(z.number()),
    awayQualityAdjustedRuns: maybe(z.number()),
    homeQualityAdjustedRunsAllowed: maybe(z.number()),
    awayQualityAdjustedRunsAllowed: maybe(z.number()),
    homeDeservedRunDifferential: maybe(z.number()),
    awayDeservedRunDifferential: maybe(z.number()),
    modelDescription: maybe(z.string()),
});

export const GameSummarySchema = z.object({
    linescore: maybe(SummaryLineScoreSchema),
    shares: maybe(GameSharesSchema),
    differentials: maybe(GameDifferentialsSchema),
    leaders: maybe(GameLeadersSchema),
    expectedOutcome: maybe(GameExpectedOutcomeSchema),
});

export const GameDataSchema = z.object({
    gamePk: z.number().int(),
    dateTime: maybe(DateTimeSchema),
    venue: maybe(z.number().int()),
    status: maybe(z.string()),
    teams: z.object({
        home: maybe(ExtendedGameTeamSchema),
        away: maybe(ExtendedGameTeamSchema)
    }),
    batters: z.array(BatterSchema),
    pitchers: z.array(PitcherSchema),
    isStolenGame: z.boolean(),
    summary: maybe(GameSummarySchema),
});

export function processGameData(gameData: unknown): GameData {
    return GameDataSchema.parse(gameData);
}

export type GameData = z.infer<typeof GameDataSchema>;
export type Pitcher = z.infer<typeof PitcherSchema>;
export type Batter = z.infer<typeof BatterSchema>;
export type GameTeam = z.infer<typeof ExtendedGameTeamSchema>;
export type GameSummary = z.infer<typeof GameSummarySchema>;
export type LeaderEntry = z.infer<typeof LeaderEntrySchema>;
