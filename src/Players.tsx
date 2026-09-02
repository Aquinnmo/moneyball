import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { getSeasonBatters, getSeasonPitchers, ApiError } from './api';
import type { SeasonBatterLine, SeasonPitcherLine } from './types';
import {
  BackendStatsTable,
  BaseballDiamondSpinner,
  ModeToggle,
  NavBar,
  StatGlossary,
  formatSavantName,
  formatSigned,
  sortBackendStatsRows,
  SeasonControls,
  type BackendStatsTableColumn,
  type ModeToggleOption,
  type BackendStatsTableRow,
  type BackendStatsTableValue,
} from './components';
import './Players.css';

type PlayerMode = 'batters' | 'pitchers';

const playerModeOptions = [
  { value: 'batters', label: 'Batters' },
  { value: 'pitchers', label: 'Pitchers' },
] as const satisfies readonly ModeToggleOption<PlayerMode>[];

interface SeasonResult {
  key: string;
  data: SeasonBatterLine[] | SeasonPitcherLine[];
  error: string | null;
}

type SeasonField<TRow> = BackendStatsTableColumn & {
  getValue: (row: TRow) => BackendStatsTableValue;
};

const batterField = (
  key: string,
  label: string,
  group: string,
  getValue: (row: SeasonBatterLine) => BackendStatsTableValue,
  sectionStart = false,
): SeasonField<SeasonBatterLine> => ({ key, label, group, getValue, sectionStart });

const pitcherField = (
  key: string,
  label: string,
  group: string,
  getValue: (row: SeasonPitcherLine) => BackendStatsTableValue,
  sectionStart = false,
): SeasonField<SeasonPitcherLine> => ({ key, label, group, getValue, sectionStart });

const batterFields: SeasonField<SeasonBatterLine>[] = [
  batterField('name', 'Name', 'Player', (row) => formatSavantName(row.name), true),
  batterField('pa', 'PA', 'Playing Time', (row) => row.pa, true),
  batterField('bip', 'BIP', 'Playing Time', (row) => row.bip),
  batterField('ba', 'BA', 'Average', (row) => row.ba, true),
  batterField('estBa', 'xBA', 'Average', (row) => row.estBa),
  batterField('baMinusEstBaDiff', 'BA − xBA', 'Average', (row) => formatSigned(row.baMinusEstBaDiff, 3)),
  batterField('slg', 'SLG', 'Slugging', (row) => row.slg, true),
  batterField('estSlg', 'xSLG', 'Slugging', (row) => row.estSlg),
  batterField('slgMinusEstSlgDiff', 'SLG − xSLG', 'Slugging', (row) => formatSigned(row.slgMinusEstSlgDiff, 3)),
  batterField('woba', 'wOBA', 'wOBA', (row) => row.woba, true),
  batterField('estWoba', 'xwOBA', 'wOBA', (row) => row.estWoba),
  batterField('wobaMinusEstWobaDiff', 'wOBA − xwOBA', 'wOBA', (row) => formatSigned(row.wobaMinusEstWobaDiff, 3)),
];

const pitcherFields: SeasonField<SeasonPitcherLine>[] = [
  pitcherField('name', 'Name', 'Player', (row) => formatSavantName(row.name), true),
  pitcherField('pa', 'PA', 'Playing Time', (row) => row.pa, true),
  pitcherField('bip', 'BIP', 'Playing Time', (row) => row.bip),
  pitcherField('ba', 'BA', 'Average', (row) => row.ba, true),
  pitcherField('estBa', 'xBA', 'Average', (row) => row.estBa),
  pitcherField('baMinusEstBaDiff', 'BA − xBA', 'Average', (row) => formatSigned(row.baMinusEstBaDiff, 3)),
  pitcherField('slg', 'SLG', 'Slugging', (row) => row.slg, true),
  pitcherField('estSlg', 'xSLG', 'Slugging', (row) => row.estSlg),
  pitcherField('slgMinusEstSlgDiff', 'SLG − xSLG', 'Slugging', (row) => formatSigned(row.slgMinusEstSlgDiff, 3)),
  pitcherField('woba', 'wOBA', 'wOBA', (row) => row.woba, true),
  pitcherField('estWoba', 'xwOBA', 'wOBA', (row) => row.estWoba),
  pitcherField('wobaMinusEstWobaDiff', 'wOBA − xwOBA', 'wOBA', (row) => formatSigned(row.wobaMinusEstWobaDiff, 3)),
  pitcherField('era', 'ERA', 'Runs', (row) => row.era, true),
  pitcherField('xEra', 'xERA', 'Runs', (row) => row.xEra),
  pitcherField('eraMinusXEraDiff', 'ERA − xERA', 'Runs', (row) => formatSigned(row.eraMinusXEraDiff, 3)),
];

function getColumns<TRow>(fields: SeasonField<TRow>[]): BackendStatsTableColumn[] {
  return fields.map(({ key, label, group, sectionStart }) => ({ key, label, group, sectionStart }));
}

function getRows<TRow extends { playerId: number }>(
  players: TRow[],
  fields: SeasonField<TRow>[],
): BackendStatsTableRow[] {
  return players.map((player) => {
    const cells: Record<string, BackendStatsTableValue> = {};

    fields.forEach((field) => {
      cells[field.key] = field.getValue(player);
    });

    return { id: `${player.playerId}`, cells };
  });
}

function matchesSearch(name: string, search: string): boolean {
  if (!search.trim()) {
    return true;
  }

  const needle = search.trim().toLowerCase();
  return name.toLowerCase().includes(needle) || formatSavantName(name).toLowerCase().includes(needle);
}

/**
 * Players Component
 *
 * Season-level batter/pitcher leaderboard fed by the backend's season endpoints.
 * Client-side search and sort only — the API has no pagination or sort params.
 */
export function Players() {
  const [mode, setMode] = useState<PlayerMode>('batters');
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [min, setMin] = useState('q');
  const [result, setResult] = useState<SeasonResult | null>(null);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const requestKey = `${mode}:${year}:${min}`;
  const loading = result?.key !== requestKey;
  const error = loading ? null : result?.error ?? null;

  useEffect(() => {
    let cancelled = false;
    const key = `${mode}:${year}:${min}`;
    const request = mode === 'batters' ? getSeasonBatters(year, min) : getSeasonPitchers(year, min);

    request
      .then((data) => {
        if (!cancelled) {
          setResult({ key, data, error: null });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setResult({
            key,
            data: [],
            error: err instanceof ApiError ? `Couldn't load season data (${err.status})` : 'Couldn\'t reach the Moneyball API.',
          });
        }
        console.error('Error fetching season players', err);
      });

    return () => {
      cancelled = true;
    };
  }, [mode, year, min]);

  const handleModeChange = (nextMode: PlayerMode) => {
    setMode(nextMode);
    setSortKey('');
  };

  const handleSortChange = (key: string) => {
    if (key === sortKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const columns = useMemo(
    () => (mode === 'batters' ? getColumns(batterFields) : getColumns(pitcherFields)),
    [mode],
  );

  const rows = useMemo(() => {
    if (loading || error) {
      return [];
    }

    const built = mode === 'batters'
      ? getRows((result?.data as SeasonBatterLine[]).filter((row) => matchesSearch(row.name, search)), batterFields)
      : getRows((result?.data as SeasonPitcherLine[]).filter((row) => matchesSearch(row.name, search)), pitcherFields);

    return sortKey ? sortBackendStatsRows(built, sortKey, sortDirection) : built;
  }, [mode, result, loading, error, search, sortKey, sortDirection]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <main className="players-page">
      <div className="players-header">
        <h1>Players</h1>
        <NavBar />
      </div>
      <ModeToggle
        ariaLabel="Stat type"
        onChange={handleModeChange}
        options={playerModeOptions}
        value={mode}
      />
      <SeasonControls min={min} onMinChange={setMin} onYearChange={setYear} year={year} />
      <label className="players-search">
        <span>Search by name</span>
        <input
          onChange={handleSearchChange}
          placeholder="e.g. Jarren Duran"
          type="text"
          value={search}
        />
      </label>
      {error ? (
        <p className="players-error" role="alert">{error}</p>
      ) : loading ? (
        <BaseballDiamondSpinner message="Loading season stats..." />
      ) : (
        <BackendStatsTable
          columns={columns}
          onSortChange={handleSortChange}
          rows={rows}
          scrollable
          sortDirection={sortDirection}
          sortKey={sortKey}
          title={mode === 'batters' ? 'Season Batters' : 'Season Pitchers'}
        />
      )}
      <StatGlossary />
    </main>
  );
}
