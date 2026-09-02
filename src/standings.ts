import { MLB_DIVISIONS, type MlbDivision, type MlbLeague } from './types/mlbTeams.ts';

/** Wild card berths available to each league. */
export const WILD_CARD_SPOTS = 3;

/** Which record standings are resolved from: games actually won, or games xW says were earned. */
export type StandingsBasis = 'actual' | 'expected';

/**
 * The slice of a team row the standings math needs. `Teams.tsx`'s `JoinedTeamRow`
 * satisfies this structurally, so nothing has to be mapped into it.
 */
export interface StandingsRow {
  id: string;
  team: { league: MlbLeague; division: MlbDivision } | undefined;
  standing: {
    wins: number;
    losses: number;
    winPct: number;
    expectedWins: number;
    expectedLosses: number;
    expectedWinPct: number;
  } | undefined;
}

interface TeamRecord {
  wins: number;
  losses: number;
  winPct: number;
}

/**
 * The one place a basis turns into numbers — everything below reads through it,
 * so the actual and expected paths cannot drift apart. Seasons the backend has
 * not ingested have no record at all.
 */
function record(row: StandingsRow, basis: StandingsBasis): TeamRecord | undefined {
  const standing = row.standing;

  if (!standing) {
    return undefined;
  }

  return basis === 'expected'
    ? { wins: standing.expectedWins, losses: standing.expectedLosses, winPct: standing.expectedWinPct }
    : { wins: standing.wins, losses: standing.losses, winPct: standing.winPct };
}

/**
 * Orders teams for standings on the given basis: win pct, then wins, then id.
 * Teams with no record sort last.
 *
 * ponytail: MLB breaks ties on head-to-head record, then intradivision record.
 * Neither `/expected-standings/{year}` nor `/season/{year}/teams` carries game
 * results, so this only guarantees a stable, reproducible order rather than
 * whatever order the API happened to answer in. Upgrade path: derive
 * head-to-head from the schedule endpoint, or have the backend rank the tie.
 */
export function byRecord(basis: StandingsBasis) {
  return (a: StandingsRow, b: StandingsRow): number => {
    const left = record(a, basis);
    const right = record(b, basis);

    return (
      (right?.winPct ?? -1) - (left?.winPct ?? -1)
      || (right?.wins ?? -1) - (left?.wins ?? -1)
      || a.id.localeCompare(b.id)
    );
  };
}

/** Games `row` sits behind `reference` on the given basis; negative when it is ahead. */
export function gamesBehind(
  reference: StandingsRow,
  row: StandingsRow,
  basis: StandingsBasis,
): number | undefined {
  const target = record(reference, basis);
  const team = record(row, basis);

  if (!target || !team) {
    return undefined;
  }

  return ((target.wins - team.wins) + (team.losses - target.losses)) / 2;
}

/**
 * Standings convention: "2.5" games behind the reference, "+2.5" ahead of it,
 * "0.0" level. Kept as a string so the table renders halves as `2.5` rather
 * than the three decimals it gives raw numbers; `toSortValue` reads it back as
 * a number either way.
 */
export function formatGamesBack(gb: number | undefined): string | undefined {
  if (gb === undefined) {
    return undefined;
  }

  return gb < 0 ? `+${(-gb).toFixed(1)}` : gb.toFixed(1);
}

export interface LeagueStandings<T extends StandingsRow> {
  /** Games behind the team's own division leader, by row id. */
  gamesBack: Map<string, string>;
  /** Games behind the last wild card berth, by row id. Division leaders are omitted. */
  wildCardGamesBack: Map<string, string>;
  /** The three division leaders, ranked against each other — already in, ahead of the field. */
  leaders: T[];
  /** Non-leaders with a record, ranked; the first `WILD_CARD_SPOTS` hold a berth. */
  contenders: T[];
}

/**
 * Resolves one league's standings on a single basis: the three division leaders
 * on that record, the wild card field ranked behind them, and both games-back
 * measures. Leaders and contenders are returned separately because the wild card
 * table stacks them as two sections. Call it once per basis to compare the two.
 *
 * Teams without a standings row are dropped from the wild card field entirely —
 * they have no record to rank and must not occupy a berth.
 */
export function buildLeagueStandings<T extends StandingsRow>(
  league: MlbLeague,
  rows: T[],
  basis: StandingsBasis,
): LeagueStandings<T> {
  const rank = byRecord(basis);
  const leagueRows = rows.filter((row) => row.team?.league === league);
  const leaders = MLB_DIVISIONS
    .filter((division) => division.league === league)
    .map((division) => leagueRows
      .filter((row) => row.team?.division === division.division)
      .sort(rank)[0])
    .filter((row) => row !== undefined)
    .sort(rank);
  const leaderIds = new Set(leaders.map((row) => row.id));

  const contenders = leagueRows
    .filter((row) => !leaderIds.has(row.id) && row.standing)
    .sort(rank);
  const lastBerth = contenders[WILD_CARD_SPOTS - 1];

  const gamesBack = new Map<string, string>();
  const wildCardGamesBack = new Map<string, string>();

  leagueRows.forEach((row) => {
    const leader = leaders.find((candidate) => candidate.team?.division === row.team?.division);
    const gb = leader && formatGamesBack(gamesBehind(leader, row, basis));
    if (gb) {
      gamesBack.set(row.id, gb);
    }

    // Division leaders are already in; games back of a wild card says nothing about them.
    if (leaderIds.has(row.id) || !lastBerth) {
      return;
    }

    const wcgb = formatGamesBack(gamesBehind(lastBerth, row, basis));
    if (wcgb) {
      wildCardGamesBack.set(row.id, wcgb);
    }
  });

  return { gamesBack, wildCardGamesBack, leaders, contenders };
}
