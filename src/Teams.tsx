import { useEffect, useMemo, useState } from 'react';
import { getSeasonTeams, getExpectedStandings, ApiError } from './api';
import {
  getTeamByAbbreviation,
  MLB_DIVISIONS,
  type MlbLeague,
  type MlbTeam,
  type SeasonTeamLine,
  type TeamStandingLine,
} from './types';
import { buildLeagueStandings, WILD_CARD_SPOTS, type StandingsBasis } from './standings.ts';
import {
  BackendStatsTable,
  BaseballDiamondSpinner,
  ModeToggle,
  NavBar,
  StatGlossary,
  sortBackendStatsRows,
  SeasonControls,
  type BackendStatsTableColumn,
  type BackendStatsTableRow,
  type BackendStatsTableValue,
  type ModeToggleOption,
} from './components';
import './Teams.css';

type TeamsView = 'division' | 'wildcard' | 'overall';

const teamViewOptions = [
  { value: 'division', label: 'Division' },
  { value: 'wildcard', label: 'Wild Card' },
  { value: 'overall', label: 'Overall' },
] as const satisfies readonly ModeToggleOption<TeamsView>[];

/** Offered on the wild card view only: which record decides leaders, seeding and the cut line. */
const standingsBasisOptions = [
  { value: 'actual', label: 'Actual' },
  { value: 'expected', label: 'Expected' },
] as const satisfies readonly ModeToggleOption<StandingsBasis>[];

/**
 * The backend only carries expected standings for the season in progress, so the
 * season picker is shown locked rather than offering years that render empty.
 */
const SEASON = new Date().getFullYear();

/** The teams endpoint returns all 30 clubs regardless of `min`; nothing here uses it. */
const TEAM_LIST_MIN = 'q';

const LEAGUES: readonly MlbLeague[] = ['AL', 'NL'];

interface JoinedTeamRow {
  /** Row identity, and the key both games-back lookups are cut by. */
  id: string;
  season: SeasonTeamLine;
  standing: TeamStandingLine | undefined;
  team: MlbTeam | undefined;
  name: string;
  /** Games behind the division leader on actual record; filled in by `buildGroups`. */
  gamesBack?: string;
  /** Games behind the last wild card berth on actual record; filled in by `buildGroups`. */
  wildCardGamesBack?: string;
  /** The same two measures resolved on expected record instead. */
  expectedGamesBack?: string;
  expectedWildCardGamesBack?: string;
}

interface TeamsResult {
  key: string;
  teams: SeasonTeamLine[];
  standings: TeamStandingLine[];
  error: string | null;
}

interface TeamsTableGroup {
  title: string;
  rows: BackendStatsTableRow[];
  /** Row ids preceded by a divider, used for the wild card cut line. */
  sectionStartRowIds?: string[];
  /** Whether column headers sort this group. */
  sortable: boolean;
}

type TeamField = BackendStatsTableColumn & {
  getValue: (row: JoinedTeamRow) => BackendStatsTableValue;
};

const teamField = (
  key: string,
  label: string,
  group: string,
  getValue: (row: JoinedTeamRow) => BackendStatsTableValue,
  sectionStart = false,
): TeamField => ({ key, label, group, getValue, sectionStart });

const teamFields: TeamField[] = [
  teamField('name', 'Name', 'Team', (row) => row.name, true),
  teamField('gamesPlayed', 'G', 'Record', (row) => row.standing?.gamesPlayed, true),
  teamField('wins', 'W', 'Record', (row) => row.standing?.wins),
  teamField('losses', 'L', 'Record', (row) => row.standing?.losses),
  teamField('winPct', 'PCT', 'Record', (row) => row.standing?.winPct),
  teamField('gamesBack', 'GB', 'Record', (row) => row.gamesBack),
  teamField('wildCardGamesBack', 'WCGB', 'Record', (row) => row.wildCardGamesBack),
  teamField('expectedWins', 'xW', 'Expected', (row) => row.standing?.expectedWins, true),
  teamField('expectedLosses', 'xL', 'Expected', (row) => row.standing?.expectedLosses),
  teamField('expectedWinPct', 'xPCT', 'Expected', (row) => row.standing?.expectedWinPct),
  teamField('expectedGamesBack', 'xGB', 'Expected', (row) => row.expectedGamesBack),
  teamField('expectedWildCardGamesBack', 'xWCGB', 'Expected', (row) => row.expectedWildCardGamesBack),
  teamField('luck', 'Luck', 'Expected', (row) => row.standing?.luck),
];

/** Wild-card-only columns: everything measured against a wild card berth, plus both expected-basis measures. */
const WILD_CARD_ONLY_COLUMNS = ['wildCardGamesBack', 'expectedGamesBack', 'expectedWildCardGamesBack'];

/**
 * GB needs a division leader to measure against, so it is dropped from the
 * mixed-league overall list. The rest only mean anything on the wild card page,
 * which is the only view that offers the actual/expected basis.
 */
function isColumnVisible(key: string, view: TeamsView): boolean {
  if (key === 'gamesBack') return view !== 'overall';
  if (WILD_CARD_ONLY_COLUMNS.includes(key)) return view === 'wildcard';
  return true;
}

function getColumns(view: TeamsView): BackendStatsTableColumn[] {
  return teamFields
    .filter((field) => isColumnVisible(field.key, view))
    .map(({ key, label, group, sectionStart }) => ({ key, label, group, sectionStart }));
}

function getRows(rows: JoinedTeamRow[]): BackendStatsTableRow[] {
  return rows.map((row) => {
    const cells: Record<string, BackendStatsTableValue> = {};

    teamFields.forEach((field) => {
      cells[field.key] = field.getValue(row);
    });

    return { id: row.id, cells };
  });
}

function joinRows(teams: SeasonTeamLine[], standings: TeamStandingLine[]): JoinedTeamRow[] {
  return teams.map((season) => {
    const team = season.teamAbbreviation ? getTeamByAbbreviation(season.teamAbbreviation) : undefined;
    const standing = team ? standings.find((s) => s.teamId === team.id) : undefined;
    const id = season.teamAbbreviation ?? season.team;

    return { id, season, standing, team, name: team?.name ?? season.team };
  });
}

function buildGroups(
  view: TeamsView,
  joined: JoinedTeamRow[],
  sortKey: string,
  sortDirection: 'asc' | 'desc',
  basis: StandingsBasis,
): TeamsTableGroup[] {
  // Games back is a property of a team's league, not of the group it is shown in,
  // and both bases are always displayed — so each league is resolved twice and
  // the four measures are looked up by row id. Thirty rows; not worth caching.
  const leagues = LEAGUES.map((league) => ({
    league,
    actual: buildLeagueStandings(league, joined, 'actual'),
    expected: buildLeagueStandings(league, joined, 'expected'),
  }));
  const measure = (
    pick: (entry: typeof leagues[number]) => Map<string, string>,
  ) => new Map(leagues.flatMap((entry) => [...pick(entry)]));

  const gamesBack = measure((entry) => entry.actual.gamesBack);
  const wildCardGamesBack = measure((entry) => entry.actual.wildCardGamesBack);
  const expectedGamesBack = measure((entry) => entry.expected.gamesBack);
  const expectedWildCardGamesBack = measure((entry) => entry.expected.wildCardGamesBack);

  const withGamesBack = (row: JoinedTeamRow): JoinedTeamRow => ({
    ...row,
    gamesBack: gamesBack.get(row.id),
    wildCardGamesBack: wildCardGamesBack.get(row.id),
    expectedGamesBack: expectedGamesBack.get(row.id),
    expectedWildCardGamesBack: expectedWildCardGamesBack.get(row.id),
  });

  const sorted = (rows: JoinedTeamRow[]) => {
    const built = getRows(rows.map(withGamesBack));
    return sortKey ? sortBackendStatsRows(built, sortKey, sortDirection) : built;
  };

  if (view === 'division') {
    return MLB_DIVISIONS.map((division) => ({
      title: `${division.league} ${division.division}`,
      rows: sorted(joined.filter((row) => (
        row.team?.league === division.league && row.team?.division === division.division
      ))),
      sortable: true,
    }));
  }

  // Three stacked sections on the chosen basis: the division leaders who are
  // already in, then the teams holding a wild card berth, then everyone chasing.
  // Ranking is fixed, not the display sort.
  if (view === 'wildcard') {
    return leagues.map((entry) => {
      const { leaders, contenders } = basis === 'expected' ? entry.expected : entry.actual;
      const dividers = [contenders[0], contenders[WILD_CARD_SPOTS]]
        .filter((row) => row !== undefined)
        .map((row) => row.id);

      return {
        title: `${entry.league} Wild Card`,
        rows: getRows([...leaders, ...contenders].map(withGamesBack)),
        sectionStartRowIds: dividers.length ? dividers : undefined,
        sortable: false,
      };
    });
  }

  return [{ title: 'Season Standings', rows: sorted(joined), sortable: true }];
}

/**
 * Teams Component
 *
 * Season-level team leaderboard: produced/allowed stat lines joined against
 * expected-standings record data, shown as overall, divisional, or wild card
 * standings. Client-side sort and grouping only.
 */
export function Teams() {
  const [view, setView] = useState<TeamsView>('division');
  const [basis, setBasis] = useState<StandingsBasis>('actual');
  const [result, setResult] = useState<TeamsResult | null>(null);
  const [sortKey, setSortKey] = useState('expectedWinPct');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const requestKey = `${SEASON}`;
  const loading = result?.key !== requestKey;
  const error = loading ? null : result?.error ?? null;

  useEffect(() => {
    let cancelled = false;
    const key = `${SEASON}`;

    Promise.all([getSeasonTeams(SEASON, TEAM_LIST_MIN), getExpectedStandings(SEASON)])
      .then(([teams, expectedStandings]) => {
        if (!cancelled) {
          setResult({ key, teams, standings: expectedStandings.teams, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key,
            teams: [],
            standings: [],
            error: err instanceof ApiError ? `Couldn't load season data (${err.status})` : 'Couldn\'t reach the Moneyball API.',
          });
        }
        console.error('Error fetching season teams', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const columns = useMemo(() => getColumns(view), [view]);

  const groups = useMemo(() => {
    if (loading || error || !result) {
      return [];
    }

    return buildGroups(view, joinRows(result.teams, result.standings), sortKey, sortDirection, basis);
  }, [loading, error, result, view, sortKey, sortDirection, basis]);

  return (
    <main className={`teams-page teams-page--${view}`}>
      <NavBar />

      <header className="teams-header">
        <h1>Teams</h1>
      </header>

      <SeasonControls year={SEASON} />
      <ModeToggle ariaLabel="Standings view" onChange={setView} options={teamViewOptions} value={view} />
      {view === 'wildcard' && (
        <ModeToggle
          ariaLabel="Wild card basis"
          onChange={setBasis}
          options={standingsBasisOptions}
          value={basis}
        />
      )}
      {error ? (
        <p className="teams-error" role="alert">{error}</p>
      ) : loading ? (
        <BaseballDiamondSpinner message="Loading season standings..." />
      ) : (
        <div className="teams-groups">
          {groups.map((group) => (
            <BackendStatsTable
              columns={columns}
              key={group.title}
              onSortChange={group.sortable ? handleSortChange : undefined}
              rows={group.rows}
              scrollable={view === 'overall'}
              sectionStartRowIds={group.sectionStartRowIds}
              sortDirection={group.sortable ? sortDirection : undefined}
              sortKey={group.sortable ? sortKey : undefined}
              tableClassName="teams-standings-table"
              title={group.title}
            />
          ))}
        </div>
      )}
      <StatGlossary />
    </main>
  );
}
