import type { Batter, GameData, LeaderEntry, Pitcher } from '../types';
import { formatNumber, getNumber } from './format';
import './AdvancedGameAnalysis.css';

export interface AdvancedGameAnalysisProps {
  /** The processed game payload returned by the API. */
  game: GameData | null | undefined;
}

interface StoryShare {
  key: string;
  title: string;
  statLabel: string;
  away: number | null | undefined;
  home: number | null | undefined;
}

interface LeaderGroup {
  key: string;
  title: string;
  entries: LeaderEntry[];
  description: string;
}

function getTeamLabel(game: GameData, side: 'away' | 'home'): string {
  const team = game.teams[side];
  return team?.abbreviation || team?.name || side.toUpperCase();
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasMeaningfulShare(row: StoryShare): boolean {
  return getNumber(row.away) > 0 || getNumber(row.home) > 0;
}

function playerName(player: Batter | Pitcher): string {
  return player.fullName || `Player ${player.id}`;
}

function teamSide(onHomeTeam: boolean): LeaderEntry['teamSide'] {
  return onHomeTeam ? 'home' : 'away';
}

function getBatterXslg(batter: Batter): number | null {
  const xslg = batter.expected?.xSLG ?? batter.xSLG;
  return isFiniteNumber(xslg) ? xslg : null;
}

function getBatterXba(batter: Batter): number | null {
  const xba = batter.expected?.xBA ?? batter.xBa;
  return isFiniteNumber(xba) ? xba : null;
}

function getBatterXrc(batter: Batter): number | null {
  const xrc = batter.expected?.xRunsCreated;
  return isFiniteNumber(xrc) ? xrc : null;
}

function getBatterPlateAppearances(batter: Batter): number | null {
  const plateAppearances = batter.batting?.plateAppearances ?? batter.nPA;
  return isFiniteNumber(plateAppearances) && plateAppearances > 0 ? plateAppearances : null;
}

function getBatterXrcPerPa(batter: Batter): number | null {
  const xrcPerPa = batter.expected?.xRunsCreatedPerPA;

  if (isFiniteNumber(xrcPerPa)) {
    return xrcPerPa;
  }

  const xrc = getBatterXrc(batter);
  const plateAppearances = getBatterPlateAppearances(batter);

  if (xrc == null || plateAppearances == null) {
    return null;
  }

  return xrc / plateAppearances;
}

function getPitcherXra(pitcher: Pitcher): number | null {
  const xra = pitcher.expected?.expectedRunsAllowed ?? pitcher.expRunsAgainst;
  return isFiniteNumber(xra) ? xra : null;
}

function getPitcherXwobaAllowed(pitcher: Pitcher): number | null {
  const xwobaAllowed = pitcher.expected?.xWOBAAllowed ?? pitcher.wOBA;
  return isFiniteNumber(xwobaAllowed) ? xwobaAllowed : null;
}

function getPitcherOuts(pitcher: Pitcher): number | null {
  const outs = pitcher.pitching?.outs ?? pitcher.outs;
  return isFiniteNumber(outs) && outs > 0 ? outs : null;
}

function getBatterXslgLeaders(batters: Batter[]): LeaderEntry[] {
  return batters
    .map((batter) => {
      const value = getBatterXslg(batter);

      if (value == null) {
        return null;
      }

      return {
        id: batter.id,
        fullName: playerName(batter),
        teamSide: teamSide(batter.onHomeTeam),
        value,
        label: 'xSLG',
      };
    })
    .filter((entry): entry is LeaderEntry => entry != null)
    .sort((a, b) => b.value - a.value);
}

function getBatterXrcLeaders(batters: Batter[]): LeaderEntry[] {
  return batters
    .map((batter) => {
      const value = getBatterXrc(batter);

      if (value == null) {
        return null;
      }

      return {
        id: batter.id,
        fullName: playerName(batter),
        teamSide: teamSide(batter.onHomeTeam),
        value,
        label: 'xRC',
      };
    })
    .filter((entry): entry is LeaderEntry => entry != null)
    .sort((a, b) => b.value - a.value);
}

function getBatterXrcPerPaLeaders(batters: Batter[]): LeaderEntry[] {
  return batters
    .map((batter) => {
      const value = getBatterXrcPerPa(batter);

      if (value == null) {
        return null;
      }

      return {
        id: batter.id,
        fullName: playerName(batter),
        teamSide: teamSide(batter.onHomeTeam),
        value,
        label: 'xRC / PA',
      };
    })
    .filter((entry): entry is LeaderEntry => entry != null)
    .sort((a, b) => b.value - a.value);
}

function getBatterXbaLeaders(batters: Batter[]): LeaderEntry[] {
  return batters
    .map((batter) => {
      const value = getBatterXba(batter);

      if (value == null) {
        return null;
      }

      return {
        id: batter.id,
        fullName: playerName(batter),
        teamSide: teamSide(batter.onHomeTeam),
        value,
        label: 'xBA',
      };
    })
    .filter((entry): entry is LeaderEntry => entry != null)
    .sort((a, b) => b.value - a.value);
}

function getPitcherXwobaAllowedLeaders(pitchers: Pitcher[]): LeaderEntry[] {
  return pitchers
    .map((pitcher) => {
      const value = getPitcherXwobaAllowed(pitcher);

      if (value == null) {
        return null;
      }

      return {
        id: pitcher.id,
        fullName: playerName(pitcher),
        teamSide: teamSide(pitcher.onHomeTeam),
        value,
        label: 'xWOBA allowed',
      };
    })
    .filter((entry): entry is LeaderEntry => entry != null)
    .sort((a, b) => a.value - b.value);
}

function getPitcherXraPerOutLeaders(pitchers: Pitcher[], sortDirection: 'best' | 'worst'): LeaderEntry[] {
  return pitchers
    .map((pitcher) => {
      const xra = getPitcherXra(pitcher);
      const outs = getPitcherOuts(pitcher);

      if (xra == null || outs == null) {
        return null;
      }

      return {
        id: pitcher.id,
        fullName: playerName(pitcher),
        teamSide: teamSide(pitcher.onHomeTeam),
        value: xra / outs,
        label: 'xRA / out',
      };
    })
    .filter((entry): entry is LeaderEntry => entry != null)
    .sort((a, b) => (sortDirection === 'best' ? a.value - b.value : b.value - a.value));
}

/**
 * AdvancedGameAnalysis Component
 *
 * Shows the game model evidence as share meters and top-three stat leaderboards.
 *
 * @param props.game - The processed game data for one MLB game.
 */
export function AdvancedGameAnalysis({ game }: AdvancedGameAnalysisProps) {
  const summary = game?.summary;

  if (!game || !summary) {
    return null;
  }

  const awayName = getTeamLabel(game, 'away');
  const homeName = getTeamLabel(game, 'home');
  const shares = summary.shares;
  const leaders = summary.leaders;
  const batterXslgLeaders = leaders?.topBattersByXSLG?.length
    ? leaders.topBattersByXSLG
    : getBatterXslgLeaders(game.batters);
  const batterXrcLeaders = getBatterXrcLeaders(game.batters);
  const batterXrcPerPaLeaders = getBatterXrcPerPaLeaders(game.batters);
  const batterXbaLeaders = getBatterXbaLeaders(game.batters);
  const pitcherXwobaAllowedLeaders = getPitcherXwobaAllowedLeaders(game.pitchers);

  const storyShares: StoryShare[] = [
    {
      key: 'expected-run-differential',
      title: 'Expected run edge',
      statLabel: 'expected edge share',
      away: shares?.expectedRunDifferential?.away,
      home: shares?.expectedRunDifferential?.home,
    },
    {
      key: 'total-bases',
      title: 'Total base share',
      statLabel: 'total base share',
      away: shares?.totalBases?.away,
      home: shares?.totalBases?.home,
    },
  ].filter(hasMeaningfulShare);

  const leaderGroups: LeaderGroup[] = [
    {
      key: 'xrc',
      title: 'Offensive value',
      entries: batterXrcLeaders,
      description: 'expected Runs Created',
    },
    {
      key: 'xrc-per-pa',
      title: 'Offensive Efficiency',
      entries: batterXrcPerPaLeaders,
      description: 'Runs per PA',
    },
    {
      key: 'xba',
      title: 'Expected contact',
      entries: batterXbaLeaders,
      description: 'xBA',
    },
    {
      key: 'xslg',
      title: 'Expected power',
      entries: batterXslgLeaders,
      description: 'xSLG',
    },
    {
      key: 'xra',
      title: 'Pitching Effiency',
      entries: getPitcherXraPerOutLeaders(game.pitchers, 'best'),
      description: 'xRA / out',
    },
    {
      key: 'worst-xra',
      title: 'Worst Pitching Efficiency',
      entries: getPitcherXraPerOutLeaders(game.pitchers, 'worst'),
      description: 'xRA / out',
    },
    {
      key: 'xwoba-allowed',
      title: 'Contact allowed',
      entries: pitcherXwobaAllowedLeaders,
      description: 'xWOBA against',
    },
    {
      key: 'whiff',
      title: 'Strikeout potential',
      entries: leaders?.topPitchersByWhiffRate ?? [],
      description: 'Whiff Rate',
    },
  ].filter((group) => group.entries.length > 0);

  if (storyShares.length === 0 && leaderGroups.length === 0) {
    return null;
  }

  return (
    <section className="advanced-analysis" id="leaders" aria-labelledby="advanced-analysis-title">
      <div className="analysis-heading">
        <h2 className="section-title" id="advanced-analysis-title">The Leaders</h2>
      </div>

      {leaderGroups.length > 0 && (
        <div className="analysis-layout">
          {leaderGroups.map((group) => (
            <article className="analysis-panel hologram-bracket" key={group.key}>
              <h3>{group.title}</h3>
              <ol className="leader-story-list">
                {group.entries.slice(0, 3).map((entry) => (
                  <li key={`${group.key}-${entry.id}`}>
                    <span>{entry.fullName}</span>
                    <strong>{entry.teamSide === 'home' ? homeName : awayName}</strong>
                    <small>{formatNumber(entry.value, 3)} {group.description}</small>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
