import type { GameTeam } from '../types';
import { formatPercent } from './format';
import './WinOMeterExplainer.css';

export interface WinOMeterExplainerProps {
  /** Home team model inputs used by the Win-O-Meter. */
  home: GameTeam | null | undefined;
  /** Away team model inputs used by the Win-O-Meter. */
  away: GameTeam | null | undefined;
}

type WinOMeterMetricKey = 'expWin' | 'expWinPitch' | 'expWinBat';

interface WinOMeterMetric {
  label: string;
  source: WinOMeterMetricKey;
  description: string;
  reading: string;
}

interface MeterSplit {
  away: number;
  home: number;
}

const winOMeterMetrics: WinOMeterMetric[] = [
  {
    label: 'Expected Win',
    source: 'expWin',
    description: 'Overall expected win chance from the processed game model.',
    reading: 'This is the main quality-of-game result, separate from the final score.',
  },
  {
    label: 'Pitching Split',
    source: 'expWinPitch',
    description: 'Expected win share from run prevention and pitching quality.',
    reading: 'Higher means the staff carried more of the model edge.',
  },
  {
    label: 'Batting Split',
    source: 'expWinBat',
    description: 'Expected win share from offensive quality and run creation.',
    reading: 'Higher means the lineup carried more of the model edge.',
  },
];

function getTeamLabel(team: GameTeam | null | undefined, fallback: string): string {
  return team?.abbreviation || team?.name || fallback;
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function getSplit(away: number | null | undefined, home: number | null | undefined): MeterSplit {
  if (isFiniteNumber(away) && isFiniteNumber(home)) {
    const total = away + home;

    if (total > 0) {
      return {
        away: away / total,
        home: home / total,
      };
    }
  }

  if (isFiniteNumber(away)) {
    return {
      away,
      home: 1 - away,
    };
  }

  if (isFiniteNumber(home)) {
    return {
      away: 1 - home,
      home,
    };
  }

  return {
    away: 0.5,
    home: 0.5,
  };
}

/**
 * WinOMeterExplainer Component
 *
 * Provides a collapsible, data-first explanation of how the Win-O-Meter reads
 * the current game's expected-win inputs before rendering the meter itself.
 *
 * @param props.home - Home team model inputs used by the meter.
 * @param props.away - Away team model inputs used by the meter.
 */
export function WinOMeterExplainer({ home, away }: WinOMeterExplainerProps) {
  const awayLabel = getTeamLabel(away, 'AWAY');
  const homeLabel = getTeamLabel(home, 'HOME');

  return (
    <details className="win-o-meter-explainer hologram-bracket" id="win-o-meter-guide">
      <summary className="win-o-meter-explainer-summary">
        <span>Win-O-Meter Guide</span>
        <strong>{winOMeterMetrics.length} model inputs</strong>
      </summary>

      <div className="win-o-meter-explainer-body">
        <article className="win-o-meter-rule-card">
          <span>Bar logic</span>
          <p>
            Each row compares the away and home model values, normalizes them into a
            two-team split, then fills the red and cyan sides of the bar.
          </p>
          <small>Missing model values default to an even 50 / 50 display.</small>
        </article>

        <div className="win-o-meter-metric-grid" aria-label="Win-O-Meter metric definitions">
          {winOMeterMetrics.map((metric) => {
            const awayValue = away?.[metric.source];
            const homeValue = home?.[metric.source];
            const split = getSplit(awayValue, homeValue);

            return (
              <article className="win-o-meter-metric-card" key={metric.source}>
                <div className="win-o-meter-metric-heading">
                  <span>{metric.source}</span>
                  <h3>{metric.label}</h3>
                </div>

                <div className="win-o-meter-metric-values">
                  <div>
                    <span>{awayLabel}</span>
                    <strong>{formatPercent(split.away)}</strong>
                  </div>
                  <div>
                    <span>{homeLabel}</span>
                    <strong>{formatPercent(split.home)}</strong>
                  </div>
                </div>

                <p>{metric.description}</p>
                <small>{metric.reading}</small>
              </article>
            );
          })}
        </div>
      </div>
    </details>
  );
}
