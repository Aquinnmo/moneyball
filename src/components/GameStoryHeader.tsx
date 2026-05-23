import type { GameData } from '../types';
import { formatInteger, formatNumber, getNumber } from './format';
import './GameStoryHeader.css';

export interface GameStoryHeaderProps {
  /** The processed game payload used to tell the primary game story. */
  game: GameData | null | undefined;
}

function teamLabel(game: GameData, side: 'away' | 'home'): string {
  const team = game.teams[side];
  return team?.abbreviation || team?.name || side.toUpperCase();
}

function fullTeamName(game: GameData, side: 'away' | 'home'): string {
  const team = game.teams[side];
  return team?.name || team?.abbreviation || side;
}

function winningSide(awayValue: number, homeValue: number): 'away' | 'home' | 'even' {
  if (awayValue === homeValue) {
    return 'even';
  }

  return awayValue > homeValue ? 'away' : 'home';
}

/**
 * GameStoryHeader Component
 *
 * Turns the final score and expected outcome model into one concise headline
 * before exposing supporting evidence.
 *
 * @param props.game - Processed game payload with teams and summary outcome.
 */
export function GameStoryHeader({ game }: GameStoryHeaderProps) {
  const outcome = game?.summary?.expectedOutcome;

  if (!game || !game.teams.away || !game.teams.home) {
    return null;
  }

  const awayName = fullTeamName(game, 'away');
  const homeName = fullTeamName(game, 'home');
  const awayShort = teamLabel(game, 'away');
  const homeShort = teamLabel(game, 'home');
  const awayRuns = getNumber(game.teams.away.runs);
  const homeRuns = getNumber(game.teams.home.runs);
  const awayWinMetric = outcome?.awayExpectedWinPercentage ?? game.teams.away.expWin;
  const homeWinMetric = outcome?.homeExpectedWinPercentage ?? game.teams.home.expWin;
  const awayWin = getNumber(awayWinMetric);
  const homeWin = getNumber(homeWinMetric);
  const actualWinner = winningSide(awayRuns, homeRuns);
  const expectedWinner = winningSide(awayWin, homeWin);
  const qualityLeader = expectedWinner === 'away' ? awayName : expectedWinner === 'home' ? homeName : 'Neither side';
  const headline = `The ${qualityLeader} win this game ${expectedWinner === 'away' ? (awayWin * 100).toFixed(1) : (homeWin * 100).toFixed(1)}% of the time.`

  return (
    <section className="game-story-header hologram-bracket" id="game-story" aria-labelledby="game-story-title">
      <div>
        <h2 id="game-story-title">{headline}</h2>
      </div>
      <div className="story-evidence-strip">
        <article>
          <h3>Final Score</h3>
          <p>{actualWinner === 'away' ? awayShort : homeShort} {actualWinner === 'away' ? formatInteger(game.teams.away.runs) : formatInteger(game.teams.home.runs)} - {actualWinner === 'home' ? awayShort : homeShort} {actualWinner === 'home' ? formatInteger(game.teams.away.runs) : formatInteger(game.teams.home.runs)}</p>
        </article>
        <article>
          <h3>Quality Adjusted Runs</h3>
          <p>{homeShort} {formatNumber(outcome?.homeQualityAdjustedRuns, 2)} - {awayShort} {formatNumber(outcome?.awayQualityAdjustedRuns, 2)}</p>
        </article>
      </div>
    </section>
  );
}
