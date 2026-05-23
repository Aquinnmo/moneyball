import type { GameData } from '../types';
import { formatNumber, formatPercent, formatSigned, getNumber } from './format';
import './KeyInsights.css';

export interface KeyInsightsProps {
  /** The processed game data used to derive narrative insight cards. */
  game: GameData | null | undefined;
}

interface Insight {
  id: string;
  label: string;
  subject: string;
  metric: string;
  tag: string;
}

function teamLabel(game: GameData, side: 'away' | 'home'): string {
  const team = game.teams[side];
  return team?.abbreviation || team?.name || side.toUpperCase();
}

/**
 * KeyInsights Component
 *
 * Selects a few API-backed takeaways and presents them as compact stat callouts.
 *
 * @param props.game - The processed game payload returned by the API.
 */
export function KeyInsights({ game }: KeyInsightsProps) {
  if (!game) return null;

  const awayShort = teamLabel(game, 'away');
  const homeShort = teamLabel(game, 'home');
  const outcome = game.summary?.expectedOutcome;
  const differentials = game.summary?.differentials;
  const shares = game.summary?.shares;
  const insights: Insight[] = [];

  if (game.isStolenGame) {
    const awayWinMetric = outcome?.awayExpectedWinPercentage ?? game.teams.away?.expWin;
    const homeWinMetric = outcome?.homeExpectedWinPercentage ?? game.teams.home?.expWin;
    const awayWin = getNumber(awayWinMetric);
    const homeWin = getNumber(homeWinMetric);
    const expectedLeader = awayWin >= homeWin ? awayShort : homeShort;
    const expectedWin = awayWin >= homeWin ? awayWinMetric : homeWinMetric;

    insights.push({
      id: 'stolen-game',
      label: 'Score vs quality',
      subject: 'Stolen',
      metric: `${expectedLeader} ${formatPercent(expectedWin)}`,
      tag: 'final beat model',
    });
  } else if (differentials?.awayQualityAdjustedRunDifferential != null || differentials?.homeQualityAdjustedRunDifferential != null) {
    const awayDiff = getNumber(differentials?.awayQualityAdjustedRunDifferential);
    const homeDiff = getNumber(differentials?.homeQualityAdjustedRunDifferential);
    const leader = awayDiff >= homeDiff ? awayShort : homeShort;
    const diff = awayDiff >= homeDiff ? differentials?.awayQualityAdjustedRunDifferential : differentials?.homeQualityAdjustedRunDifferential;

    insights.push({
      id: 'quality-adjusted-edge',
      label: 'Quality edge',
      subject: leader,
      metric: formatSigned(diff, 2),
      tag: 'Quality Adjusted run differential',
    });
  }

  if (shares?.hardHitBalls?.away != null || shares?.hardHitBalls?.home != null) {
    const awayShare = getNumber(shares?.hardHitBalls?.away);
    const homeShare = getNumber(shares?.hardHitBalls?.home);
    const leader = awayShare >= homeShare ? awayShort : homeShort;
    const share = awayShare >= homeShare ? shares?.hardHitBalls?.away : shares?.hardHitBalls?.home;

    insights.push({
      id: 'hard-hit-share',
      label: 'Power edge',
      subject: leader,
      metric: formatPercent(share),
      tag: 'hard-hit share',
    });
  }

  if (outcome?.awayExpectedRuns != null || outcome?.homeExpectedRuns != null) {
    const awayRuns = getNumber(outcome?.awayExpectedRuns);
    const homeRuns = getNumber(outcome?.homeExpectedRuns);
    const leader = awayRuns >= homeRuns ? awayShort : homeShort;
    const expectedRuns = awayRuns >= homeRuns ? outcome?.awayExpectedRuns : outcome?.homeExpectedRuns;

    insights.push({
      id: 'expected-runs',
      label: 'Run creation',
      subject: leader,
      metric: formatNumber(expectedRuns, 2),
      tag: 'expected runs',
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'balanced-game',
      label: 'Profile',
      subject: 'Even',
      metric: `${awayShort} / ${homeShort}`,
      tag: 'no clear edge for either team',
    });
  }

  return (
    <section className="key-insights-container" id="game-insights" aria-labelledby="key-insights-title">
      <div className="insights-header">
        <h2 id="key-insights-title">Game Insights</h2>
      </div>
      <div className="insights-list">
        {insights.map((insight) => (
          <article key={insight.id} className="insight-card hologram-bracket">
            <span className="insight-label">{insight.label}</span>
            <strong>{insight.subject}</strong>
            <span className="insight-metric">{insight.metric}</span>
            <small>{insight.tag}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
