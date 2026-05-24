import { useState } from 'react';
import type { Batter, GameData, GraphDataPoint, GraphSortDirection, GraphValueMode, Pitcher } from '../types';
import { formatNumber } from './format';
import { Graph } from './Graph';
import './GameGraphs.css';

export interface GameGraphsProps {
  /** Processed game payload returned by the API. */
  game: GameData | null | undefined;
}

interface PlayerGraphMetric<TPlayer extends Batter | Pitcher> {
  key: string;
  title: string;
  optionLabel: string;
  roundTo: number;
  valueMode: GraphValueMode;
  getValue: (player: TPlayer) => number | null;
  getTooltipData: (player: TPlayer, value: number, teamLabel: string) => GraphDataPoint['tooltipData'];
}

type SideOfBall = 'batting' | 'pitching';
type TeamFilter = 'both' | 'away' | 'home';
type GraphPlayer = Batter | Pitcher;

const BATTER_DEFAULT_METRIC_KEY = 'expected.xRunsCreated';
const PITCHER_DEFAULT_METRIC_KEY = 'expected.expectedRunsAllowed';

const skippedStatKeys = new Set([
  'id',
  'fullName',
  'firstName',
  'lastName',
  'primaryNumber',
  'position',
  'batHand',
  'pitchHand',
  'onHomeTeam',
]);

const pathLabelOverrides: Record<string, string> = {
  nPA: 'PA',
  xBa: 'xBA',
  wOBA: 'wOBA',
  xSLG: 'xSLG',
  wOPS: 'wOPS',
  tOPS: 'tOPS',
  expTimesOnBase: 'Exp Times On Base',
  expBases: 'Exp Bases',
  avgBatSpeed: 'Avg Bat Speed',
  avgExitVelo: 'Avg Exit Velo',
  avgLA: 'Avg LA',
  maxBatSpeed: 'Max Bat Speed',
  maxExitVelo: 'Max Exit Velo',
  expectedRunsAllowed: 'xRuns Against',
  xBA: 'xBA',
  xOBP: 'xOBP',
  xWOBA: 'xWOBA',
  xWOBAAllowed: 'xWOBA Allowed',
  xOPS: 'xOPS',
  xRunsCreated: 'xRC',
  xRunsCreatedPerPA: 'xRC / PA',
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function playerName(player: Batter | Pitcher): string {
  return player.fullName || `Player ${player.id}`;
}

function getTeamLabel(game: GameData, onHomeTeam: boolean): string {
  const team = onHomeTeam ? game.teams.home : game.teams.away;
  return team?.abbreviation || team?.name || (onHomeTeam ? 'Home' : 'Away');
}

function getPlateAppearances(batter: Batter): number | null {
  const plateAppearances = batter.batting?.plateAppearances ?? batter.nPA;
  return isFiniteNumber(plateAppearances) ? plateAppearances : null;
}

function getBattersFaced(pitcher: Pitcher): number | null {
  const battersFaced = pitcher.pitching?.battersFaced ?? pitcher.battersFaced;
  return isFiniteNumber(battersFaced) ? battersFaced : null;
}

function getPitcherOuts(pitcher: Pitcher): number | null {
  const outs = pitcher.pitching?.outs ?? pitcher.outs;
  return isFiniteNumber(outs) ? outs : null;
}

function getPathKey(path: readonly string[]): string {
  return path.join('.');
}

function formatPathSegment(segment: string): string {
  const override = pathLabelOverrides[segment];

  if (override) {
    return override;
  }

  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/^./, (char) => char.toUpperCase());
}

function formatMetricLabel(path: readonly string[]): string {
  const key = getPathKey(path);
  const override = pathLabelOverrides[key] ?? pathLabelOverrides[path[path.length - 1]];

  return override ?? formatPathSegment(path[path.length - 1]);
}

function getValueAtPath(player: GraphPlayer, path: readonly string[]): unknown {
  let current: unknown = player;

  for (const segment of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[segment];
  }

  return current;
}

function getNumberAtPath(player: GraphPlayer, path: readonly string[]): number | null {
  const value = getValueAtPath(player, path);
  return isFiniteNumber(value) ? value : null;
}

function isGraphableLeafValue(value: unknown): boolean {
  return value == null || isFiniteNumber(value);
}

function collectGraphStatPaths(players: GraphPlayer[]): string[][] {
  const paths = new Map<string, string[]>();

  function visit(value: unknown, path: string[]) {
    if (path.some((segment) => skippedStatKeys.has(segment))) {
      return;
    }

    if (isRecord(value)) {
      Object.entries(value).forEach(([key, child]) => {
        visit(child, [...path, key]);
      });
      return;
    }

    if (path.length > 0 && isGraphableLeafValue(value)) {
      paths.set(getPathKey(path), path);
    }
  }

  players.forEach((player) => visit(player, []));

  return Array.from(paths.values()).sort((a, b) => formatMetricLabel(a).localeCompare(formatMetricLabel(b)));
}

function getMetricRoundTo(path: readonly string[], values: number[]): number {
  const key = getPathKey(path);
  const leaf = path[path.length - 1];

  if (key === BATTER_DEFAULT_METRIC_KEY || key === PITCHER_DEFAULT_METRIC_KEY) {
    return 2;
  }

  if (/rate|percentage|average|avg|oba|ops|slg|xba|xobp|xwoba|xops/i.test(leaf)) {
    return 3;
  }

  if (values.length > 0 && values.every((value) => Number.isInteger(value))) {
    return 0;
  }

  return 2;
}

function getMetricValueMode(path: readonly string[], values: number[]): GraphValueMode {
  const key = getPathKey(path);

  if (
    values.some((value) => value < 0)
    || /above|differential|runValue|advantage|linearWeight|prevention/i.test(key)
  ) {
    return 'signed';
  }

  return 'non-negative';
}

function getSupportTooltipData(player: GraphPlayer, sideOfBall: SideOfBall): GraphDataPoint['tooltipData'] {
  if (sideOfBall === 'batting') {
    const batter = player as Batter;
    return {
      PA: getPlateAppearances(batter),
      Hits: batter.hits,
    };
  }

  const pitcher = player as Pitcher;
  return {
    'Batters Faced': getBattersFaced(pitcher),
    Outs: getPitcherOuts(pitcher),
  };
}

function createPathMetric<TPlayer extends GraphPlayer>(
  players: TPlayer[],
  path: string[],
  sideOfBall: SideOfBall,
): PlayerGraphMetric<TPlayer> {
  const values = players
    .map((player) => getNumberAtPath(player, path))
    .filter((value): value is number => value != null);
  const optionLabel = formatMetricLabel(path);

  return {
    key: getPathKey(path),
    title: `${sideOfBall === 'batting' ? 'Batter' : 'Pitcher'} ${optionLabel}`,
    optionLabel,
    roundTo: getMetricRoundTo(path, values),
    valueMode: getMetricValueMode(path, values),
    getValue: (player) => getNumberAtPath(player, path),
    getTooltipData: (player, value, teamLabel) => ({
      Team: teamLabel,
      [optionLabel]: formatNumber(value, getMetricRoundTo(path, values)),
      ...getSupportTooltipData(player, sideOfBall),
    }),
  };
}

function setMetricOverride<TPlayer extends GraphPlayer>(
  metrics: PlayerGraphMetric<TPlayer>[],
  override: PlayerGraphMetric<TPlayer>,
): PlayerGraphMetric<TPlayer>[] {
  const nextMetrics = metrics.filter((metric) => metric.key !== override.key);
  return [override, ...nextMetrics];
}

function createBatterMetrics(batters: Batter[]): PlayerGraphMetric<Batter>[] {
  const metrics = collectGraphStatPaths(batters).map((path) => createPathMetric(batters, path, 'batting'));

  return setMetricOverride(metrics, {
    key: BATTER_DEFAULT_METRIC_KEY,
    title: 'Batter xRC',
    optionLabel: 'xRC',
    roundTo: 2,
    valueMode: 'non-negative',
    getValue: (batter) => {
      const xrc = batter.expected?.xRunsCreated;
      return isFiniteNumber(xrc) ? xrc : null;
    },
    getTooltipData: (batter, value, teamLabel) => ({
      Team: teamLabel,
      xRC: formatNumber(value, 2),
      PA: getPlateAppearances(batter),
      Hits: batter.hits,
    }),
  });
}

function createPitcherMetrics(pitchers: Pitcher[]): PlayerGraphMetric<Pitcher>[] {
  const metrics = collectGraphStatPaths(pitchers).map((path) => createPathMetric(pitchers, path, 'pitching'));

  return setMetricOverride(metrics, {
    key: PITCHER_DEFAULT_METRIC_KEY,
    title: 'Pitcher xRuns Against',
    optionLabel: 'xRuns Against',
    roundTo: 2,
    valueMode: 'non-negative',
    getValue: (pitcher) => {
      const xRunsAgainst = pitcher.expected?.expectedRunsAllowed ?? pitcher.expRunsAgainst;
      return isFiniteNumber(xRunsAgainst) ? xRunsAgainst : null;
    },
    getTooltipData: (pitcher, value, teamLabel) => ({
      Team: teamLabel,
      'xRuns Against': formatNumber(value, 2),
      'Batters Faced': getBattersFaced(pitcher),
      Outs: getPitcherOuts(pitcher),
    }),
  });
}

function isSelectedTeam(onHomeTeam: boolean, teamFilter: TeamFilter): boolean {
  if (teamFilter === 'both') {
    return true;
  }

  return teamFilter === 'home' ? onHomeTeam : !onHomeTeam;
}

function getPlayerGraphData<TPlayer extends Batter | Pitcher>(
  game: GameData,
  players: TPlayer[],
  metric: PlayerGraphMetric<TPlayer>,
  teamFilter: TeamFilter,
): GraphDataPoint[] {
  return players
    .filter((player) => isSelectedTeam(player.onHomeTeam, teamFilter))
    .map((player): GraphDataPoint | null => {
      const value = metric.getValue(player);

      if (value == null) {
        return null;
      }

      const teamLabel = getTeamLabel(game, player.onHomeTeam);

      return {
        id: `${metric.key}-${player.id}`,
        label: playerName(player),
        value,
        isHomeTeam: player.onHomeTeam,
        tooltipData: metric.getTooltipData(player, value, teamLabel),
      };
    })
    .filter((point): point is GraphDataPoint => point != null);
}

/**
 * GameGraphs Component
 *
 * Renders bottom-of-page game visualizations from processed player data.
 *
 * @param props.game - The processed game data for one MLB game.
 */
export function GameGraphs({ game }: GameGraphsProps) {
  const [sideOfBall, setSideOfBall] = useState<SideOfBall>('batting');
  const [teamFilter, setTeamFilter] = useState<TeamFilter>('both');
  const [sortDirection, setSortDirection] = useState<GraphSortDirection>('des');
  const [batterMetricKey, setBatterMetricKey] = useState<string>(BATTER_DEFAULT_METRIC_KEY);
  const [pitcherMetricKey, setPitcherMetricKey] = useState<string>(PITCHER_DEFAULT_METRIC_KEY);

  if (!game) {
    return null;
  }

  const batterGraphMetrics = createBatterMetrics(game.batters);
  const pitcherGraphMetrics = createPitcherMetrics(game.pitchers);
  const activeMetricKey = sideOfBall === 'pitching' ? pitcherMetricKey : batterMetricKey;
  const metricOptions = sideOfBall === 'pitching' ? pitcherGraphMetrics : batterGraphMetrics;
  const fallbackMetric = metricOptions[0];
  const activeMetric = metricOptions.find((metric) => metric.key === activeMetricKey) ?? fallbackMetric;
  const graphData = activeMetric
    ? sideOfBall === 'pitching'
      ? getPlayerGraphData(game, game.pitchers, activeMetric as PlayerGraphMetric<Pitcher>, teamFilter)
      : getPlayerGraphData(game, game.batters, activeMetric as PlayerGraphMetric<Batter>, teamFilter)
    : [];
  const awayLabel = getTeamLabel(game, false);
  const homeLabel = getTeamLabel(game, true);
  const selectedTeamLabel = teamFilter === 'both' ? `${awayLabel} + ${homeLabel}` : teamFilter === 'home' ? homeLabel : awayLabel;
  const emptyMetricLabel = activeMetric?.optionLabel ?? 'stat';
  const selectedMetricKey = activeMetric?.key ?? '';

  return (
    <section className="game-graphs-section" id="graphs" aria-labelledby="game-graphs-title">
      <h2 className="section-title" id="game-graphs-title">Graphs</h2>
      <div className="game-graphs-panel hologram-bracket">
        <div className="game-graphs-toolbar">
          <div className="game-graphs-field">
            <label htmlFor="game-graphs-side-of-ball">SIDE OF BALL</label>
            <select
              id="game-graphs-side-of-ball"
              value={sideOfBall}
              onChange={(event) => setSideOfBall(event.target.value as SideOfBall)}
            >
              <option value="batting">Batting</option>
              <option value="pitching">Pitching</option>
            </select>
          </div>

          <div className="game-graphs-field">
            <label htmlFor="game-graphs-stat">STAT</label>
            <select
              id="game-graphs-stat"
              value={selectedMetricKey}
              onChange={(event) => {
                if (sideOfBall === 'pitching') {
                  setPitcherMetricKey(event.target.value);
                } else {
                  setBatterMetricKey(event.target.value);
                }
              }}
            >
              {metricOptions.map((metric) => (
                <option value={metric.key} key={metric.key}>
                  {metric.optionLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="game-graphs-field">
            <label htmlFor="game-graphs-team">TEAM</label>
            <select
              id="game-graphs-team"
              value={teamFilter}
              onChange={(event) => setTeamFilter(event.target.value as TeamFilter)}
            >
              <option value="both">BOTH</option>
              <option value="away">{awayLabel}</option>
              <option value="home">{homeLabel}</option>
            </select>
          </div>

          <div className="game-graphs-field game-graphs-field-compact">
            <label htmlFor="game-graphs-sort">ORDER</label>
            <select
              id="game-graphs-sort"
              value={sortDirection}
              onChange={(event) => setSortDirection(event.target.value as GraphSortDirection)}
            >
              <option value="des">des</option>
              <option value="asc">asc</option>
            </select>
          </div>

          <div className="game-graphs-legend" aria-label="Team color key">
            <span>
              <i className="game-graphs-swatch away" aria-hidden="true" />
              {awayLabel}
            </span>
            <span>
              <i className="game-graphs-swatch home" aria-hidden="true" />
              {homeLabel}
            </span>
          </div>
        </div>

        {activeMetric && graphData.length > 0 ? (
          <Graph
            title={activeMetric.title}
            data={graphData}
            roundTo={activeMetric.roundTo}
            valueMode={activeMetric.valueMode}
            sortDirection={sortDirection}
          />
        ) : (
          <p className="game-graphs-empty">No {selectedTeamLabel} {emptyMetricLabel} data available.</p>
        )}
      </div>
    </section>
  );
}
