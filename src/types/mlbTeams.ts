/**
 * Bridge between the two team DTOs that don't share a key: `TeamStandingLine`
 * (numeric `teamId`, no name) and `SeasonTeamLine` (Savant `teamAbbreviation`
 * / `team`, no numeric id). Ids and full names come from the schedule
 * endpoint (`ParsedGame.teams.{home,away}.team`); abbreviations come from
 * `GET /season/{year}/teams` — Savant's abbreviations differ from MLB
 * StatsAPI's for several clubs (AZ, CWS, KC, SD, SF, TB, Athletics).
 *
 * League and division are static alignment data — the backend exposes neither
 * on `TeamStandingLine` nor on `SeasonTeamLine`.
 */
export type MlbLeague = 'AL' | 'NL';
export type MlbDivision = 'East' | 'Central' | 'West';

export interface MlbTeam {
    id: number;
    abbreviation: string;
    name: string;
    league: MlbLeague;
    division: MlbDivision;
}

/** League/division pairs in the order standings pages conventionally show them. */
export const MLB_DIVISIONS: readonly { league: MlbLeague; division: MlbDivision }[] = [
    { league: 'AL', division: 'East' },
    { league: 'AL', division: 'Central' },
    { league: 'AL', division: 'West' },
    { league: 'NL', division: 'East' },
    { league: 'NL', division: 'Central' },
    { league: 'NL', division: 'West' },
];

export const MLB_TEAMS: readonly MlbTeam[] = [
    { id: 108, abbreviation: 'LAA', name: 'Los Angeles Angels' , league: 'AL', division: 'West' },
    { id: 109, abbreviation: 'AZ', name: 'Arizona Diamondbacks' , league: 'NL', division: 'West' },
    { id: 110, abbreviation: 'BAL', name: 'Baltimore Orioles' , league: 'AL', division: 'East' },
    { id: 111, abbreviation: 'BOS', name: 'Boston Red Sox' , league: 'AL', division: 'East' },
    { id: 112, abbreviation: 'CHC', name: 'Chicago Cubs' , league: 'NL', division: 'Central' },
    { id: 113, abbreviation: 'CIN', name: 'Cincinnati Reds' , league: 'NL', division: 'Central' },
    { id: 114, abbreviation: 'CLE', name: 'Cleveland Guardians' , league: 'AL', division: 'Central' },
    { id: 115, abbreviation: 'COL', name: 'Colorado Rockies' , league: 'NL', division: 'West' },
    { id: 116, abbreviation: 'DET', name: 'Detroit Tigers' , league: 'AL', division: 'Central' },
    { id: 117, abbreviation: 'HOU', name: 'Houston Astros' , league: 'AL', division: 'West' },
    { id: 118, abbreviation: 'KC', name: 'Kansas City Royals' , league: 'AL', division: 'Central' },
    { id: 119, abbreviation: 'LAD', name: 'Los Angeles Dodgers' , league: 'NL', division: 'West' },
    { id: 120, abbreviation: 'WSH', name: 'Washington Nationals' , league: 'NL', division: 'East' },
    { id: 121, abbreviation: 'NYM', name: 'New York Mets' , league: 'NL', division: 'East' },
    { id: 133, abbreviation: 'ATH', name: 'Athletics' , league: 'AL', division: 'West' },
    { id: 134, abbreviation: 'PIT', name: 'Pittsburgh Pirates' , league: 'NL', division: 'Central' },
    { id: 135, abbreviation: 'SD', name: 'San Diego Padres' , league: 'NL', division: 'West' },
    { id: 136, abbreviation: 'SEA', name: 'Seattle Mariners' , league: 'AL', division: 'West' },
    { id: 137, abbreviation: 'SF', name: 'San Francisco Giants' , league: 'NL', division: 'West' },
    { id: 138, abbreviation: 'STL', name: 'St. Louis Cardinals' , league: 'NL', division: 'Central' },
    { id: 139, abbreviation: 'TB', name: 'Tampa Bay Rays' , league: 'AL', division: 'East' },
    { id: 140, abbreviation: 'TEX', name: 'Texas Rangers' , league: 'AL', division: 'West' },
    { id: 141, abbreviation: 'TOR', name: 'Toronto Blue Jays' , league: 'AL', division: 'East' },
    { id: 142, abbreviation: 'MIN', name: 'Minnesota Twins' , league: 'AL', division: 'Central' },
    { id: 143, abbreviation: 'PHI', name: 'Philadelphia Phillies' , league: 'NL', division: 'East' },
    { id: 144, abbreviation: 'ATL', name: 'Atlanta Braves' , league: 'NL', division: 'East' },
    { id: 145, abbreviation: 'CWS', name: 'Chicago White Sox' , league: 'AL', division: 'Central' },
    { id: 146, abbreviation: 'MIA', name: 'Miami Marlins' , league: 'NL', division: 'East' },
    { id: 147, abbreviation: 'NYY', name: 'New York Yankees' , league: 'AL', division: 'East' },
    { id: 158, abbreviation: 'MIL', name: 'Milwaukee Brewers' , league: 'NL', division: 'Central' },
];

const byId = new Map(MLB_TEAMS.map((team) => [team.id, team]));
const byAbbreviation = new Map(MLB_TEAMS.map((team) => [team.abbreviation, team]));

/** Looks up an MLB team by its numeric StatsAPI id (e.g. from `TeamStandingLine.teamId`). */
export function getTeamById(id: number): MlbTeam | undefined {
    return byId.get(id);
}

/** Looks up an MLB team by its Savant abbreviation (e.g. from `SeasonTeamLine.teamAbbreviation`). */
export function getTeamByAbbreviation(abbreviation: string): MlbTeam | undefined {
    return byAbbreviation.get(abbreviation);
}
