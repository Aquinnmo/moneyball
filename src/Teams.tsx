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

type TeamsView = 'overall' | 'division' | 'wildcard';

const teamViewOptions = [
  { value: 'overall', label: 'Overall' },
  { value: 'division', label: 'Division' },
  { value: 'wildcard', label: 'Wild Card' },
] as const satisfies readonly ModeToggleOption<TeamsView>[];

/** Wild card berths available to each league. */
const WILD_CARD_SPOTS = 3;

const LEAGUES: readonly MlbLeague[] = ['AL', 'NL'];

interface JoinedTeamRow {
  season: SeasonTeamLine;
  standing: TeamStandingLine | undefined;
  team: MlbTeam | undefined;
  name: string;
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
  teamField('name', 'Team', 'Team', (row) => row.name, true),
  teamField('gamesPlayed', 'G', 'Record', (row) => row.standing?.gamesPlayed, true),
  teamField('wins', 'W', 'Record', (row) => row.standing?.wins),
  teamField('losses', 'L', 'Record', (row) => row.standing?.losses),
  teamField('winPct', 'PCT', 'Record', (row) => row.standing?.winPct),
  teamField('expectedWins', 'xW', 'Expected', (row) => row.standing?.expectedWins, true),
  teamField('expectedLosses', 'xL', 'Expected', (row) => row.standing?.expectedLosses),
  teamField('expectedWinPct', 'xPCT', 'Expected', (row) => row.standing?.expectedWinPct),
  teamField('luck', 'Luck', 'Expected', (row) => row.standing?.luck),
  teamField('pa', 'PA', 'Offense', (row) => row.season.pa, true),
  teamField('ba', 'BA', 'Offense', (row) => row.season.ba),
  teamField('estBa', 'xBA', 'Offense', (row) => row.season.estBa),
  teamField('slg', 'SLG', 'Offense', (row) => row.season.slg),
  teamField('estSlg', 'xSLG', 'Offense', (row) => row.season.estSlg),
  teamField('woba', 'wOBA', 'Offense', (row) => row.season.woba),
  teamField('estWoba', 'xwOBA', 'Offense', (row) => row.season.estWoba),
  teamField('paAllowed', 'PA', 'Defense', (row) => row.season.paAllowed, true),
  teamField('baAllowed', 'BA', 'Defense', (row) => row.season.baAllowed),
  teamField('estBaAllowed', 'xBA', 'Defense', (row) => row.season.estBaAllowed),
  teamField('slgAllowed', 'SLG', 'Defense', (row) => row.season.slgAllowed),
  teamField('estSlgAllowed', 'xSLG', 'Defense', (row) => row.season.estSlgAllowed),
  teamField('wobaAllowed', 'wOBA', 'Defense', (row) => row.season.wobaAllowed),
  teamField('estWobaAllowed', 'xwOBA', 'Defense', (row) => row.season.estWobaAllowed),
];

function getColumns(): BackendStatsTableColumn[] {
  return teamFields.map(({ key, label, group, sectionStart }) => ({ key, label, group, sectionStart }));
}

function getRowId(row: JoinedTeamRow): string {
  return row.season.teamAbbreviation ?? row.season.team;
}

function getRows(rows: JoinedTeamRow[]): BackendStatsTableRow[] {
  return rows.map((row) => {
    const cells: Record<string, BackendStatsTableValue> = {};

    teamFields.forEach((field) => {
      cells[field.key] = field.getValue(row);
    });

    return { id: getRowId(row), cells };
  });
}

function joinRows(teams: SeasonTeamLine[], standings: TeamStandingLine[]): JoinedTeamRow[] {
  return teams.map((season) => {
    const team = season.teamAbbreviation ? getTeamByAbbreviation(season.teamAbbreviation) : undefined;
    const standing = team ? standings.find((s) => s.teamId === team.id) : undefined;

    return { season, standing, team, name: team?.name ?? season.team };
  });
}

/** Seasons the backend has not ingested have no record, so those teams sort last. */
function getWinPct(row: JoinedTeamRow): number {
  return row.standing?.winPct ?? -1;
}

function byRecordDescending(rows: JoinedTeamRow[]): JoinedTeamRow[] {
  return [...rows].sort((a, b) => getWinPct(b) - getWinPct(a));
}

/**
 * Builds the wild card standings for one league: division leaders are removed,
 * and everyone else is ranked by actual record with a cut line after the last
 * berth. Leaders are decided on real record, independent of the display sort.
 */
function buildWildCardGroup(league: MlbLeague, joined: JoinedTeamRow[]): TeamsTableGroup {
  const leagueRows = joined.filter((row) => row.team?.league === league);
  const leaderIds = new Set(
    MLB_DIVISIONS
      .filter((division) => division.league === league)
      .map((division) => byRecordDescending(
        leagueRows.filter((row) => row.team?.division === division.division),
      )[0])
      .filter((row) => row !== undefined)
      .map((row) => getRowId(row)),
  );
  const contenders = byRecordDescending(leagueRows.filter((row) => !leaderIds.has(getRowId(row))));
  const firstTeamOut = contenders[WILD_CARD_SPOTS];

  return {
    title: `${league} Wild Card`,
    rows: getRows(contenders),
    sectionStartRowIds: firstTeamOut ? [getRowId(firstTeamOut)] : undefined,
    sortable: false,
  };
}

function buildGroups(
  view: TeamsView,
  joined: JoinedTeamRow[],
  sortKey: string,
  sortDirection: 'asc' | 'desc',
): TeamsTableGroup[] {
  const sorted = (rows: JoinedTeamRow[]) => {
    const built = getRows(rows);
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

  if (view === 'wildcard') {
    return LEAGUES.map((league) => buildWildCardGroup(league, joined));
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
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [min, setMin] = useState('q');
  const [view, setView] = useState<TeamsView>('overall');
  const [result, setResult] = useState<TeamsResult | null>(null);
  const [sortKey, setSortKey] = useState('expectedWinPct');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const requestKey = `${year}:${min}`;
  const loading = result?.key !== requestKey;
  const error = loading ? null : result?.error ?? null;

  useEffect(() => {
    let cancelled = false;
    const key = `${year}:${min}`;

    Promise.all([getSeasonTeams(year, min), getExpectedStandings(year)])
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
  }, [year, min]);

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const columns = useMemo(() => getColumns(), []);

  const groups = useMemo(() => {
    if (loading || error || !result) {
      return [];
    }

    return buildGroups(view, joinRows(result.teams, result.standings), sortKey, sortDirection);
  }, [loading, error, result, view, sortKey, sortDirection]);

  return (
    <main className="teams-page">
      <div className="teams-header">
        <h1>Teams</h1>
        <NavBar />
      </div>
      <ModeToggle ariaLabel="Standings view" onChange={setView} options={teamViewOptions} value={view} />
      <SeasonControls min={min} onMinChange={setMin} onYearChange={setYear} year={year} />
      {error ? (
        <p className="teams-error" role="alert">{error}</p>
      ) : loading ? (
        <BaseballDiamondSpinner message="Loading season standings..." />
      ) : (
        groups.map((group) => (
          <BackendStatsTable
            columns={columns}
            key={group.title}
            onSortChange={group.sortable ? handleSortChange : undefined}
            rows={group.rows}
            scrollable={view === 'overall'}
            sectionStartRowIds={group.sectionStartRowIds}
            sortDirection={group.sortable ? sortDirection : undefined}
            sortKey={group.sortable ? sortKey : undefined}
            title={group.title}
          />
        ))
      )}
      <StatGlossary />
    </main>
  );
}
