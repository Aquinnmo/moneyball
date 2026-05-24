import { useState } from 'react';
import type {
  Batter,
  GameData,
  GraphDataPoint,
  GraphDisplayMode,
  GraphSortDirection,
  GraphStatSource,
  GraphStatType,
  GraphValueMode,
  Pitcher,
} from '../types';
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
  statSource: GraphStatSource;
  statType: GraphStatType;
  valueMode: GraphValueMode;
  displayMode?: GraphDisplayMode;
  getValue: (player: TPlayer) => number | null;
  getTooltipData: (player: TPlayer, value: number, teamLabel: string) => GraphDataPoint['tooltipData'];
}

interface ShareMetricConfig {
  paths: string[][];
  optionLabel?: string;
  titleLabel?: string;
  valueLabel?: string;
  key?: string;
  roundTo?: number;
}

type SideOfBall = 'batting' | 'pitching';
type TeamFilter = 'both' | 'away' | 'home';
type GraphPlayer = Batter | Pitcher;

const graphStatTypes: GraphStatType[] = ['totals', 'averages', 'share'];
const graphStatSources: GraphStatSource[] = ['expected', 'actual'];

const graphStatTypeLabels: Record<GraphStatType, string> = {
  totals: 'Totals',
  averages: 'Averages',
  share: 'Share',
};

const graphStatSourceLabels: Record<GraphStatSource, string> = {
  expected: 'Expected',
  actual: 'Actual',
};

const BATTER_DEFAULT_METRIC_KEY = 'expected.xRunsCreated';
const BATTER_SHARE_METRIC_KEY = 'share.expected.xRunsCreated';
const PITCHER_DEFAULT_METRIC_KEY = 'expected.expectedRunsAllowed';
const PITCHER_SHARE_METRIC_KEY = 'share.expected.expectedRunsAllowed';

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
  ballsInPlay: 'Balls In Play',
  battersFaced: 'Batters Faced',
  calledStrikesPlusWhiffs: 'CSW',
  contactRunValue: 'Contact Run Value',
  contactRunValueAllowed: 'Contact Run Value Allowed',
  disciplineRunValue: 'Discipline Run Value',
  disciplineRunValueAllowed: 'Discipline Run Value Allowed',
  hardHitBalls: 'Hard Hit Balls',
  hitsAllowed: 'Hits Allowed',
  maxBatSpeed: 'Max Bat Speed',
  maxExitVelo: 'Max Exit Velo',
  expectedRunsAllowed: 'xRuns Against',
  qualityAdjustedRuns: 'Quality Adjusted Runs',
  qualityAdjustedRunsAllowed: 'Quality Adjusted Runs Allowed',
  sweetSpotBalls: 'Sweet Spot Balls',
  totalBases: 'Total Bases',
  xBA: 'xBA',
  xOBP: 'xOBP',
  xWOBA: 'xWOBA',
  xWOBAAllowed: 'xWOBA Allowed',
  xHits: 'xHits',
  xHitsAllowed: 'xHits Allowed',
  xHomeRuns: 'xHome Runs',
  xHomeRunsAllowed: 'xHome Runs Allowed',
  xLinearWeightRuns: 'xLinear Weight Runs',
  xOPS: 'xOPS',
  xRunsCreated: 'xRC',
  xRunsCreatedPerPA: 'xRC / PA',
  xTotalBases: 'xTotal Bases',
  xTotalBasesAllowed: 'xTotal Bases Allowed',
  xWeightedTimesOnBase: 'xWeighted Times On Base',
  xWeightedTimesOnBaseAllowed: 'xWeighted Times On Base Allowed',
};

const batterShareMetricConfigs: ShareMetricConfig[] = [
  { paths: [['batting', 'totalBases']] },
  { paths: [['expected', 'xHits']] },
  { paths: [['expected', 'xTotalBases']] },
  { paths: [['expected', 'xWeightedTimesOnBase']] },
  {
    paths: [['expected', 'xRunsCreated']],
    optionLabel: 'xRC Share',
    titleLabel: 'xRC',
    valueLabel: 'xRC',
    key: BATTER_SHARE_METRIC_KEY,
    roundTo: 2,
  },
  { paths: [['expected', 'xLinearWeightRuns']] },
  { paths: [['expected', 'qualityAdjustedRuns']] },
  { paths: [['expected', 'contactRunValue']] },
  { paths: [['expected', 'disciplineRunValue']] },
  { paths: [['expected', 'xHomeRuns']] },
  { paths: [['battedBall', 'ballsInPlay']] },
  { paths: [['battedBall', 'hardHitBalls']] },
  { paths: [['battedBall', 'barrels']] },
  { paths: [['battedBall', 'sweetSpotBalls']] },
  { paths: [['plateDiscipline', 'pitches']] },
  { paths: [['plateDiscipline', 'strikes']] },
  { paths: [['plateDiscipline', 'balls']] },
  { paths: [['plateDiscipline', 'swings']] },
  { paths: [['plateDiscipline', 'whiffs']] },
  { paths: [['plateDiscipline', 'calledStrikesPlusWhiffs']] },
];

const pitcherShareMetricConfigs: ShareMetricConfig[] = [
  { paths: [['pitching', 'battersFaced'], ['battersFaced']] },
  { paths: [['pitching', 'outs'], ['outs']] },
  { paths: [['pitching', 'pitches'], ['plateDiscipline', 'pitches']] },
  { paths: [['pitching', 'strikes'], ['plateDiscipline', 'strikes']] },
  { paths: [['pitching', 'balls'], ['plateDiscipline', 'balls']] },
  { paths: [['pitching', 'hitsAllowed'], ['hitsAgainst']] },
  { paths: [['pitching', 'strikeouts'], ['strikeouts']] },
  {
    paths: [['expected', 'expectedRunsAllowed'], ['expRunsAgainst']],
    optionLabel: 'xRuns Allowed Share',
    titleLabel: 'xRuns Allowed',
    valueLabel: 'xRuns Allowed',
    key: PITCHER_SHARE_METRIC_KEY,
    roundTo: 2,
  },
  { paths: [['expected', 'qualityAdjustedRunsAllowed']] },
  { paths: [['expected', 'xHitsAllowed']] },
  { paths: [['expected', 'xTotalBasesAllowed']] },
  { paths: [['expected', 'xWeightedTimesOnBaseAllowed']] },
  { paths: [['expected', 'xHomeRunsAllowed']] },
  { paths: [['expected', 'contactRunValueAllowed']] },
  { paths: [['expected', 'disciplineRunValueAllowed']] },
  { paths: [['contactAllowed', 'ballsInPlay']] },
  { paths: [['contactAllowed', 'hardHitBalls']] },
  { paths: [['contactAllowed', 'barrels']] },
  { paths: [['contactAllowed', 'sweetSpotBalls']] },
];

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

function getNumberAtFirstPath(player: GraphPlayer, paths: readonly string[][]): number | null {
  for (const path of paths) {
    const value = getNumberAtPath(player, path);

    if (value != null) {
      return value;
    }
  }

  return null;
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

function getMetricStatSource(path: readonly string[]): GraphStatSource {
  const key = getPathKey(path);
  const leaf = path[path.length - 1];

  if (
    path.includes('expected')
    || /^x[A-Z]/.test(leaf)
    || /^exp[A-Z]/.test(leaf)
    || /expected|AboveExpected|qualityAdjusted/i.test(key)
  ) {
    return 'expected';
  }

  return 'actual';
}

function getMetricStatType(path: readonly string[]): GraphStatType {
  const leaf = path[path.length - 1];

  if (/rate|percentage|average|avg|per|oba|ops|slg|babip|isolatedPower|^xBA|^xOBP|^xWOBA|^xSLG|^xOPS|max/i.test(leaf)) {
    return 'averages';
  }

  return 'totals';
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
    statSource: getMetricStatSource(path),
    statType: getMetricStatType(path),
    valueMode: getMetricValueMode(path, values),
    getValue: (player) => getNumberAtPath(player, path),
    getTooltipData: (player, value, teamLabel) => ({
      Team: teamLabel,
      [optionLabel]: formatNumber(value, getMetricRoundTo(path, values)),
      ...getSupportTooltipData(player, sideOfBall),
    }),
  };
}

function createShareMetric<TPlayer extends GraphPlayer>(
  players: TPlayer[],
  config: ShareMetricConfig,
  sideOfBall: SideOfBall,
): PlayerGraphMetric<TPlayer> | null {
  const values = players
    .map((player) => getNumberAtFirstPath(player, config.paths))
    .filter((value): value is number => value != null);

  if (!values.some((value) => value > 0)) {
    return null;
  }

  const primaryPath = config.paths[0];
  const baseLabel = config.valueLabel ?? formatMetricLabel(primaryPath);
  const optionLabel = config.optionLabel ?? `${baseLabel} Share`;
  const roundTo = config.roundTo ?? getMetricRoundTo(primaryPath, values);

  return {
    key: config.key ?? `share.${getPathKey(primaryPath)}`,
    title: `${sideOfBall === 'batting' ? 'Batter' : 'Pitcher'} ${config.titleLabel ?? baseLabel} Share`,
    optionLabel,
    roundTo,
    statSource: getMetricStatSource(primaryPath),
    statType: 'share',
    valueMode: 'non-negative',
    displayMode: 'pie',
    getValue: (player) => getNumberAtFirstPath(player, config.paths),
    getTooltipData: (player, value, teamLabel) => ({
      Team: teamLabel,
      [baseLabel]: formatNumber(value, roundTo),
      ...getSupportTooltipData(player, sideOfBall),
    }),
  };
}

function createShareMetrics<TPlayer extends GraphPlayer>(
  players: TPlayer[],
  configs: ShareMetricConfig[],
  sideOfBall: SideOfBall,
): PlayerGraphMetric<TPlayer>[] {
  return configs
    .map((config) => createShareMetric(players, config, sideOfBall))
    .filter((metric): metric is PlayerGraphMetric<TPlayer> => metric != null);
}

function createBatterMetrics(batters: Batter[]): PlayerGraphMetric<Batter>[] {
  const metrics = collectGraphStatPaths(batters).map((path) => createPathMetric(batters, path, 'batting'));
  const shareMetrics = createShareMetrics(batters, batterShareMetricConfigs, 'batting');

  const xrcMetric: PlayerGraphMetric<Batter> = {
    key: BATTER_DEFAULT_METRIC_KEY,
    title: 'Batter xRC',
    optionLabel: 'xRC',
    roundTo: 2,
    statSource: 'expected',
    statType: 'totals',
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
  };

  const nextMetrics = metrics.filter((metric) => metric.key !== xrcMetric.key);
  return [xrcMetric, ...shareMetrics, ...nextMetrics];
}

function createPitcherMetrics(pitchers: Pitcher[]): PlayerGraphMetric<Pitcher>[] {
  const metrics = collectGraphStatPaths(pitchers).map((path) => createPathMetric(pitchers, path, 'pitching'));
  const shareMetrics = createShareMetrics(pitchers, pitcherShareMetricConfigs, 'pitching');

  const xRunsAllowedMetric: PlayerGraphMetric<Pitcher> = {
    key: PITCHER_DEFAULT_METRIC_KEY,
    title: 'Pitcher xRuns Against',
    optionLabel: 'xRuns Against',
    roundTo: 2,
    statSource: 'expected',
    statType: 'totals',
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
  };

  const nextMetrics = metrics.filter((metric) => metric.key !== xRunsAllowedMetric.key);
  return [xRunsAllowedMetric, ...shareMetrics, ...nextMetrics];
}

function getAvailableStatSources(metrics: readonly { statSource: GraphStatSource }[]): GraphStatSource[] {
  return graphStatSources.filter((source) => metrics.some((metric) => metric.statSource === source));
}

function getAvailableStatTypes(
  metrics: readonly { statSource: GraphStatSource; statType: GraphStatType }[],
  statSource: GraphStatSource,
): GraphStatType[] {
  return graphStatTypes.filter((statType) => (
    metrics.some((metric) => metric.statSource === statSource && metric.statType === statType)
  ));
}

function getEffectiveStatSource(selectedStatSource: GraphStatSource, availableSources: GraphStatSource[]): GraphStatSource {
  if (availableSources.includes(selectedStatSource)) {
    return selectedStatSource;
  }

  return availableSources[0] ?? 'expected';
}

function getEffectiveStatType(selectedStatType: GraphStatType, availableTypes: GraphStatType[]): GraphStatType {
  if (availableTypes.includes(selectedStatType)) {
    return selectedStatType;
  }

  return availableTypes[0] ?? 'totals';
}

function getPreferredMetricKey(sideOfBall: SideOfBall, statType: GraphStatType): string | null {
  if (statType === 'share') {
    return sideOfBall === 'pitching' ? PITCHER_SHARE_METRIC_KEY : BATTER_SHARE_METRIC_KEY;
  }

  if (statType === 'totals') {
    return sideOfBall === 'pitching' ? PITCHER_DEFAULT_METRIC_KEY : BATTER_DEFAULT_METRIC_KEY;
  }

  return null;
}

function getFallbackMetric<TMetric extends { key: string }>(
  metrics: readonly TMetric[],
  sideOfBall: SideOfBall,
  statType: GraphStatType,
): TMetric | undefined {
  const preferredMetricKey = getPreferredMetricKey(sideOfBall, statType);

  return (preferredMetricKey ? metrics.find((metric) => metric.key === preferredMetricKey) : undefined) ?? metrics[0];
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
  const [batterStatSource, setBatterStatSource] = useState<GraphStatSource>('expected');
  const [pitcherStatSource, setPitcherStatSource] = useState<GraphStatSource>('expected');
  const [batterStatType, setBatterStatType] = useState<GraphStatType>('totals');
  const [pitcherStatType, setPitcherStatType] = useState<GraphStatType>('totals');
  const [batterMetricKey, setBatterMetricKey] = useState<string>(BATTER_DEFAULT_METRIC_KEY);
  const [pitcherMetricKey, setPitcherMetricKey] = useState<string>(PITCHER_DEFAULT_METRIC_KEY);

  const handleStatSourceChange = (statSource: GraphStatSource) => {
    if (sideOfBall === 'pitching') {
      setPitcherStatSource(statSource);
      return;
    }

    setBatterStatSource(statSource);
  };

  const handleStatTypeChange = (statType: GraphStatType) => {
    if (sideOfBall === 'pitching') {
      setPitcherStatType(statType);
      return;
    }

    setBatterStatType(statType);
  };

  const handleMetricChange = (metricKey: string) => {
    if (sideOfBall === 'pitching') {
      setPitcherMetricKey(metricKey);
      return;
    }

    setBatterMetricKey(metricKey);
  };

  if (!game) {
    return null;
  }

  const batterGraphMetrics = createBatterMetrics(game.batters);
  const pitcherGraphMetrics = createPitcherMetrics(game.pitchers);
  const activeMetricKey = sideOfBall === 'pitching' ? pitcherMetricKey : batterMetricKey;
  const allMetricOptions = sideOfBall === 'pitching' ? pitcherGraphMetrics : batterGraphMetrics;
  const activeStatSourceState = sideOfBall === 'pitching' ? pitcherStatSource : batterStatSource;
  const activeStatTypeState = sideOfBall === 'pitching' ? pitcherStatType : batterStatType;
  const statSourceOptions = getAvailableStatSources(allMetricOptions);
  const selectedStatSource = getEffectiveStatSource(activeStatSourceState, statSourceOptions);
  const statTypeOptions = getAvailableStatTypes(allMetricOptions, selectedStatSource);
  const selectedStatType = getEffectiveStatType(activeStatTypeState, statTypeOptions);
  const metricOptions = allMetricOptions.filter((metric) => (
    metric.statSource === selectedStatSource && metric.statType === selectedStatType
  ));
  const fallbackMetric = getFallbackMetric(metricOptions, sideOfBall, selectedStatType);
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
            <label htmlFor="game-graphs-side-of-ball">Side Of Ball</label>
            <select
              id="game-graphs-side-of-ball"
              value={sideOfBall}
              onChange={(event) => setSideOfBall(event.target.value as SideOfBall)}
            >
              <option value="batting">Batting</option>
              <option value="pitching">Pitching</option>
            </select>
          </div>

          <div className="game-graphs-field game-graphs-field-compact">
            <label htmlFor="game-graphs-stat-source">Stat Source</label>
            <select
              id="game-graphs-stat-source"
              value={selectedStatSource}
              onChange={(event) => handleStatSourceChange(event.target.value as GraphStatSource)}
            >
              {statSourceOptions.map((statSource) => (
                <option value={statSource} key={statSource}>
                  {graphStatSourceLabels[statSource]}
                </option>
              ))}
            </select>
          </div>

          <div className="game-graphs-field game-graphs-field-compact">
            <label htmlFor="game-graphs-stat-type">Stat Type</label>
            <select
              id="game-graphs-stat-type"
              value={selectedStatType}
              onChange={(event) => handleStatTypeChange(event.target.value as GraphStatType)}
            >
              {statTypeOptions.map((statType) => (
                <option value={statType} key={statType}>
                  {graphStatTypeLabels[statType]}
                </option>
              ))}
            </select>
          </div>

          <div className="game-graphs-field game-graphs-field-wide">
            <label htmlFor="game-graphs-stat">Stat</label>
            <select
              id="game-graphs-stat"
              value={selectedMetricKey}
              onChange={(event) => handleMetricChange(event.target.value)}
            >
              {metricOptions.map((metric) => (
                <option value={metric.key} key={metric.key}>
                  {metric.optionLabel}
                </option>
              ))}
            </select>
          </div>

          <div className="game-graphs-field game-graphs-field-compact">
            <label htmlFor="game-graphs-team">Team</label>
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
            <label htmlFor="game-graphs-sort">Order</label>
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
            displayMode={activeMetric.displayMode}
            sortDirection={sortDirection}
          />
        ) : (
          <p className="game-graphs-empty">No {selectedTeamLabel} {emptyMetricLabel} data available.</p>
        )}
      </div>
    </section>
  );
}
