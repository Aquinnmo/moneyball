import { useEffect, useState } from 'react'
import './Game.css'
import { useParams } from 'react-router';
import type { GameData } from './types'
import { formatGameDateTime } from './utils/dateTime'
import { 
  PitchZoneSpinner,
  TeamTable, 
  WinOMeter,
  WinOMeterExplainer,
  KeyInsights,
  AdvancedGameAnalysis,
  GameScoreboard,
  GameStoryHeader,
  GameQuickLinks,
  BatterDetailTable,
  PitcherDetailTable,
  GameBackendStats,
  StatGlossary,
  type GameQuickLink
} from './components'
import { getGame } from './api'

const gameQuickLinks = [
  { href: '#win-o-meter', label: 'Win-O-Meter' },
  { href: '#linescore', label: 'Linescore' },
  { href: '#game-insights', label: 'Insights' },
  { href: '#leaders', label: 'Leaders' },
  { href: '#team-metrics', label: 'Team Metrics' },
  { href: '#key-players', label: 'Key Players' },
  { href: '#backend-stats', label: 'Raw Stats' },
  { href: '#stat-glossary', label: 'Glossary' },
] satisfies GameQuickLink[];

/**
 * Game Component
 * 
 * Displays the detailed box score and advanced/expected metrics for a specific 
 * baseball game. Fetches game data using the `gamePk` route parameter bridging 
 * into the `TeamTable` and `WinOMeter` components.
 */
export function Game() {
  const { gamePk } = useParams();
  const [game, setGame] = useState<GameData | null>(null)
  const [loading, setLoading] = useState(!!gamePk);

  useEffect(() => {
    if (!gamePk) {
      return;
    }

    getGame(gamePk)
      .then((gameData) => {
        setGame(gameData);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.error("Error fetching today's games", err);
      });
  }, [gamePk]);

  return (
    <div className="game-container" id='game'>
      {loading ? (
        <PitchZoneSpinner message="Crunching game data..." />
      ) : (
        <>
          <div className="game-header">
            <h1>{`${game?.teams.away?.name} @ ${game?.teams.home?.name}`}</h1>
            <h2>{`${formatGameDateTime(game?.dateTime)}${game?.status == 'F' ? ' (F)' : ''}`}</h2>
          </div>
          <div className="game-story-stack">
            <GameQuickLinks links={gameQuickLinks} />
            <GameStoryHeader game={game} />
          </div>
          <WinOMeterExplainer home={game?.teams.home} away={game?.teams.away} />
          <WinOMeter home={game?.teams.home} away={game?.teams.away} />
          <GameScoreboard game={game} />
          <KeyInsights game={game} />
          <AdvancedGameAnalysis game={game} />
          <h2 className='section-title' id="team-metrics">Team Metrics</h2>
          <div className="teams-layout">
            <TeamTable team={game?.teams.away} opponent={game?.teams.home} />
            <TeamTable team={game?.teams.home} opponent={game?.teams.away} />
          </div>
          <h2 className='section-title' id="key-players">Key Players</h2>
          <BatterDetailTable batters={game?.batters} />
          <PitcherDetailTable pitchers={game?.pitchers} />
          <GameBackendStats game={game} />
          <StatGlossary />
        </>
      )}
    </div>
  ) 
}
