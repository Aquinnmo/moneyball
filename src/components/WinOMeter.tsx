import type { GameTeam } from '../types';
import { formatPercent } from './format';
import './WinOMeter.css';

export interface WinOMeterProps {
  /** Home team model splits. */
  home: GameTeam | null | undefined;
  /** Away team model splits. */
  away: GameTeam | null | undefined;
}

interface MeterRow {
  label: string;
  away: number | null | undefined;
  home: number | null | undefined;
}

interface MeterSplit {
  away: number;
  home: number;
}

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

function splitWidth(value: number): number {
  return Math.min(Math.max(value * 100, 0), 100);
}

/**
 * WinOMeter Component
 *
 * Renders a focused expected-win meter across overall, pitching, and batting
 * splits for the two teams in the game view.
 *
 * @param props.home - Home team expected-win split data.
 * @param props.away - Away team expected-win split data.
 */
export function WinOMeter({ home, away }: WinOMeterProps) {
  if (!home && !away) {
    return null;
  }

  const awayLabel = getTeamLabel(away, 'AWAY');
  const homeLabel = getTeamLabel(home, 'HOME');
  const rows: MeterRow[] = [
    { label: 'Expected Win', away: away?.expWin, home: home?.expWin },
    { label: 'Pitching Split', away: away?.expWinPitch, home: home?.expWinPitch },
    { label: 'Batting Split', away: away?.expWinBat, home: home?.expWinBat },
  ];

  return (
    <section className="win-panel hologram-bracket" id="win-o-meter" aria-labelledby="win-o-meter-title">
      <div className="win-panel-header">
        <h2 id="win-o-meter-title">Win-O-Meter</h2>
      </div>

      <div className="win-o-meter-stack">
        {rows.map((row) => {
          const split = getSplit(row.away, row.home);
          const awayPercent = formatPercent(split.away);
          const homePercent = formatPercent(split.home);

          return (
            <div className="win-o-meter-container" key={row.label}>
              <span className="win-o-meter-split-label">{row.label}</span>
              <div className="win-o-meter-row">
                <span className="win-o-meter-label away-label">{awayLabel} ({awayPercent})</span>
                <div className="win-o-meter-bar" aria-label={`${row.label}: ${awayLabel} ${awayPercent}, ${homeLabel} ${homePercent}`}>
                  <div className="win-o-meter-fill away-fill" style={{ flexBasis: `${splitWidth(split.away)}%` }} />
                  <div className="win-o-meter-fill home-fill" style={{ flexBasis: `${splitWidth(split.home)}%` }} />
                </div>
                <span className="win-o-meter-label home-label">{homeLabel} ({homePercent})</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
