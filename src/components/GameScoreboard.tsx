import type { GameData } from '../types';
import { formatInteger } from './format';
import './GameScoreboard.css';

export interface GameScoreboardProps {
  /** The processed game payload containing a frontend-ready linescore. */
  game: GameData | null | undefined;
}

function getTeamLabel(game: GameData, side: 'away' | 'home'): string {
  const team = game.teams[side];
  return team?.abbreviation || team?.name || side.toUpperCase();
}

/**
 * GameScoreboard Component
 *
 * Renders the API-provided linescore without deriving inning or box-score
 * totals in the browser.
 *
 * @param props.game - Processed game payload with `summary.linescore`.
 */
export function GameScoreboard({ game }: GameScoreboardProps) {
  const linescore = game?.summary?.linescore;

  if (!game || !linescore) {
    return null;
  }

  const innings = linescore.innings ?? [];
  const awayLabel = getTeamLabel(game, 'away');
  const homeLabel = getTeamLabel(game, 'home');

  return (
    <section className="scoreboard-panel hologram-bracket" id="linescore" aria-labelledby="scoreboard-title">
      <div className="scoreboard-header">
        <h2 id="scoreboard-title">Linescore</h2>
      </div>
      <div className="scoreboard-table-wrap">
        <table className="scoreboard-table">
          <thead>
            <tr>
              <th>Team</th>
              {innings.map((inning, index) => (
                <th className={index === 0 ? 'start-board-section' : undefined} key={inning.inning ?? inning.ordinal}>
                  {inning.ordinal || inning.inning}
                </th>
              ))}
              <th className="start-board-section">R</th>
              <th>H</th>
              <th>E</th>
              <th>LOB</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>{awayLabel}</th>
              {innings.map((inning, index) => (
                <td className={index === 0 ? 'start-board-section' : undefined} key={inning.inning ?? inning.ordinal}>
                  {formatInteger(inning.awayRuns)}
                </td>
              ))}
              <td className="start-board-section">{formatInteger(linescore.away?.runs)}</td>
              <td>{formatInteger(linescore.away?.hits)}</td>
              <td>{formatInteger(linescore.away?.errors)}</td>
              <td>{formatInteger(linescore.away?.leftOnBase)}</td>
            </tr>
            <tr>
              <th>{homeLabel}</th>
              {innings.map((inning, index) => (
                <td className={index === 0 ? 'start-board-section' : undefined} key={inning.inning ?? inning.ordinal}>
                  {formatInteger(inning.homeRuns)}
                </td>
              ))}
              <td className="start-board-section">{formatInteger(linescore.home?.runs)}</td>
              <td>{formatInteger(linescore.home?.hits)}</td>
              <td>{formatInteger(linescore.home?.errors)}</td>
              <td>{formatInteger(linescore.home?.leftOnBase)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
