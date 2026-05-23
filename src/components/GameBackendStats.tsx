import type { GameData, GameTeam } from '../types';
import { formatGameDateTime } from '../utils/dateTime';
import { BackendKeyValueList, type BackendKeyValueRow } from './BackendKeyValueList';
import { BackendPlayerStatsTables } from './BackendPlayerStatsTables';
import { BackendStatCardGrid, type BackendStatCard } from './BackendStatCardGrid';
import { BackendStatsDropdown } from './BackendStatsDropdown';

export interface GameBackendStatsProps {
  /** Processed game payload returned by the backend. */
  game: GameData | null | undefined;
}

function teamLabel(team: GameData['teams']['home']): string {
  return team?.abbreviation || team?.name || 'Unknown';
}

function getGameDetailRows(game: GameData): BackendKeyValueRow[] {
  return [
    { label: 'Game ID', value: game.gamePk },
    { label: 'Status', value: game.status },
    { label: 'Date / Time', value: formatGameDateTime(game.dateTime) },
    { label: 'Venue ID', value: game.venue },
    { label: 'Stolen Game', value: game.isStolenGame },
    { label: 'Away Team', value: teamLabel(game.teams.away) },
    { label: 'Home Team', value: teamLabel(game.teams.home) },
  ];
}

function getTeamStatCards(team: GameTeam | null | undefined): BackendStatCard[] {
  return [
    {
      title: 'Team',
      rows: [
        { label: 'ID', value: team?.id },
        { label: 'Name', value: team?.name },
        { label: 'Abbreviation', value: team?.abbreviation },
        { label: 'Runs', value: team?.runs },
        { label: 'Runs Against', value: team?.runsAgainst },
        { label: 'Hits', value: team?.hits },
        { label: 'Errors', value: team?.errors },
        { label: 'Left On Base', value: team?.leftOnBase },
        { label: 'xBA', value: team?.xBA },
        { label: 'wOBA', value: team?.wOBA },
        { label: 'xSLG', value: team?.xSLG },
        { label: 'wOPS', value: team?.wOPS },
        { label: 'Plate Appearances', value: team?.nPA },
        { label: 'Expected Runs For', value: team?.expRunsFor },
        { label: 'Expected Win', value: team?.expWin },
        { label: 'Expected Win Batting', value: team?.expWinBat },
        { label: 'Expected Win Pitching', value: team?.expWinPitch },
        { label: 'Expected Times On', value: team?.expTimesOn },
        { label: 'Expected Runs Against', value: team?.expRunsAgainst },
        { label: 'Scoring Chances', value: team?.scoringChances },
        { label: 'Scoring Chance Conversions', value: team?.scoringChanceConversions },
        { label: 'Scoring Chance Conversion Rate', value: team?.scoringChanceConversionRate },
      ],
    },
    {
      title: 'Batting',
      rows: [
        { label: 'Plate Appearances', value: team?.batting?.plateAppearances },
        { label: 'At Bats', value: team?.batting?.atBats },
        { label: 'Hits', value: team?.batting?.hits },
        { label: 'Singles', value: team?.batting?.singles },
        { label: 'Doubles', value: team?.batting?.doubles },
        { label: 'Triples', value: team?.batting?.triples },
        { label: 'Home Runs', value: team?.batting?.homeRuns },
        { label: 'Walks', value: team?.batting?.walks },
        { label: 'Hit By Pitch', value: team?.batting?.hitByPitch },
        { label: 'Strikeouts', value: team?.batting?.strikeouts },
        { label: 'Sac Flies', value: team?.batting?.sacFlies },
        { label: 'Total Bases', value: team?.batting?.totalBases },
        { label: 'Batting Average', value: team?.batting?.battingAverage },
        { label: 'On Base Percentage', value: team?.batting?.onBasePercentage },
        { label: 'Slugging Percentage', value: team?.batting?.sluggingPercentage },
        { label: 'OPS', value: team?.batting?.ops },
        { label: 'Isolated Power', value: team?.batting?.isolatedPower },
        { label: 'BABIP', value: team?.batting?.babip },
        { label: 'Walk Rate', value: team?.batting?.walkRate },
        { label: 'Strikeout Rate', value: team?.batting?.strikeoutRate },
      ],
    },
    {
      title: 'Expected Batting',
      rows: [
        { label: 'xBA', value: team?.expectedBatting?.xBA },
        { label: 'xOBP', value: team?.expectedBatting?.xOBP },
        { label: 'xWOBA', value: team?.expectedBatting?.xWOBA },
        { label: 'xSLG', value: team?.expectedBatting?.xSLG },
        { label: 'xOPS', value: team?.expectedBatting?.xOPS },
        { label: 'xHits', value: team?.expectedBatting?.xHits },
        { label: 'xTotal Bases', value: team?.expectedBatting?.xTotalBases },
        { label: 'xWeighted Times On Base', value: team?.expectedBatting?.xWeightedTimesOnBase },
        { label: 'xRuns Created', value: team?.expectedBatting?.xRunsCreated },
        { label: 'xRuns Created Per PA', value: team?.expectedBatting?.xRunsCreatedPerPA },
        { label: 'xLinear Weight Runs', value: team?.expectedBatting?.xLinearWeightRuns },
        { label: 'Quality Adjusted Runs', value: team?.expectedBatting?.qualityAdjustedRuns },
        { label: 'Contact Run Value', value: team?.expectedBatting?.contactRunValue },
        { label: 'Discipline Run Value', value: team?.expectedBatting?.disciplineRunValue },
        { label: 'xHome Runs', value: team?.expectedBatting?.xHomeRuns },
        { label: 'Hits Above Expected', value: team?.expectedBatting?.hitsAboveExpected },
        { label: 'Total Bases Above Expected', value: team?.expectedBatting?.totalBasesAboveExpected },
        { label: 'OPS Above Expected', value: team?.expectedBatting?.opsAboveExpected },
        { label: 'Runs Created Above Expected', value: team?.expectedBatting?.runsCreatedAboveExpected },
      ],
    },
    {
      title: 'Batted Ball',
      rows: [
        { label: 'Balls In Play', value: team?.battedBall?.ballsInPlay },
        { label: 'Hard Hit Balls', value: team?.battedBall?.hardHitBalls },
        { label: 'Barrels', value: team?.battedBall?.barrels },
        { label: 'Sweet Spot Balls', value: team?.battedBall?.sweetSpotBalls },
        { label: 'Average Exit Velocity', value: team?.battedBall?.avgExitVelo },
        { label: 'Max Exit Velocity', value: team?.battedBall?.maxExitVelo },
        { label: 'Average Launch Angle', value: team?.battedBall?.avgLaunchAngle },
        { label: 'Hard Hit Rate', value: team?.battedBall?.hardHitRate },
        { label: 'Barrel Rate', value: team?.battedBall?.barrelRate },
        { label: 'Sweet Spot Rate', value: team?.battedBall?.sweetSpotRate },
      ],
    },
    {
      title: 'Plate Discipline',
      rows: [
        { label: 'Pitches', value: team?.plateDiscipline?.pitches },
        { label: 'Strikes', value: team?.plateDiscipline?.strikes },
        { label: 'Balls', value: team?.plateDiscipline?.balls },
        { label: 'Swings', value: team?.plateDiscipline?.swings },
        { label: 'Whiffs', value: team?.plateDiscipline?.whiffs },
        { label: 'Called Strikes', value: team?.plateDiscipline?.calledStrikes },
        { label: 'Called Strikes Plus Whiffs', value: team?.plateDiscipline?.calledStrikesPlusWhiffs },
        { label: 'First Pitch Strikes', value: team?.plateDiscipline?.firstPitchStrikes },
        { label: 'Strike Rate', value: team?.plateDiscipline?.strikeRate },
        { label: 'Swing Rate', value: team?.plateDiscipline?.swingRate },
        { label: 'Whiff Rate', value: team?.plateDiscipline?.whiffRate },
        { label: 'CSW Rate', value: team?.plateDiscipline?.cswRate },
        { label: 'First Pitch Strike Rate', value: team?.plateDiscipline?.firstPitchStrikeRate },
      ],
    },
    {
      title: 'Pitching',
      rows: [
        { label: 'Batters Faced', value: team?.pitching?.battersFaced },
        { label: 'Outs', value: team?.pitching?.outs },
        { label: 'Innings Pitched', value: team?.pitching?.inningsPitched },
        { label: 'Pitches', value: team?.pitching?.pitches },
        { label: 'Strikes', value: team?.pitching?.strikes },
        { label: 'Balls', value: team?.pitching?.balls },
        { label: 'Hits Allowed', value: team?.pitching?.hitsAllowed },
        { label: 'Walks Allowed', value: team?.pitching?.walksAllowed },
        { label: 'Hit By Pitch Allowed', value: team?.pitching?.hitByPitchAllowed },
        { label: 'Strikeouts', value: team?.pitching?.strikeouts },
        { label: 'Home Runs Allowed', value: team?.pitching?.homeRunsAllowed },
        { label: 'Strike Rate', value: team?.pitching?.strikeRate },
        { label: 'Strikeout Rate', value: team?.pitching?.strikeoutRate },
        { label: 'Walk Rate', value: team?.pitching?.walkRate },
      ],
    },
    {
      title: 'Expected Pitching',
      rows: [
        { label: 'xBA Allowed', value: team?.expectedPitching?.xBAAllowed },
        { label: 'xOBP Allowed', value: team?.expectedPitching?.xOBPAllowed },
        { label: 'xWOBA Allowed', value: team?.expectedPitching?.xWOBAAllowed },
        { label: 'xSLG Allowed', value: team?.expectedPitching?.xSLGAllowed },
        { label: 'xOPS Allowed', value: team?.expectedPitching?.xOPSAllowed },
        { label: 'xHits Allowed', value: team?.expectedPitching?.xHitsAllowed },
        { label: 'xTotal Bases Allowed', value: team?.expectedPitching?.xTotalBasesAllowed },
        { label: 'xWeighted Times On Base Allowed', value: team?.expectedPitching?.xWeightedTimesOnBaseAllowed },
        { label: 'Expected Runs Allowed', value: team?.expectedPitching?.expectedRunsAllowed },
        { label: 'Quality Adjusted Runs Allowed', value: team?.expectedPitching?.qualityAdjustedRunsAllowed },
        { label: 'xHome Runs Allowed', value: team?.expectedPitching?.xHomeRunsAllowed },
        { label: 'Contact Run Value Allowed', value: team?.expectedPitching?.contactRunValueAllowed },
        { label: 'Discipline Run Value Allowed', value: team?.expectedPitching?.disciplineRunValueAllowed },
        { label: 'Run Prevention Value', value: team?.expectedPitching?.runPreventionValue },
      ],
    },
    {
      title: 'Contact Allowed',
      rows: [
        { label: 'Balls In Play', value: team?.contactAllowed?.ballsInPlay },
        { label: 'Hard Hit Balls', value: team?.contactAllowed?.hardHitBalls },
        { label: 'Barrels', value: team?.contactAllowed?.barrels },
        { label: 'Sweet Spot Balls', value: team?.contactAllowed?.sweetSpotBalls },
        { label: 'Average Exit Velocity', value: team?.contactAllowed?.avgExitVelo },
        { label: 'Max Exit Velocity', value: team?.contactAllowed?.maxExitVelo },
        { label: 'Average Launch Angle', value: team?.contactAllowed?.avgLaunchAngle },
        { label: 'Hard Hit Rate', value: team?.contactAllowed?.hardHitRate },
        { label: 'Barrel Rate', value: team?.contactAllowed?.barrelRate },
        { label: 'Sweet Spot Rate', value: team?.contactAllowed?.sweetSpotRate },
      ],
    },
    {
      title: 'Expected Outcome',
      rows: [
        { label: 'Expected Runs For', value: team?.expectedOutcome?.expectedRunsFor },
        { label: 'Expected Runs Against', value: team?.expectedOutcome?.expectedRunsAgainst },
        { label: 'Quality Adjusted Runs For', value: team?.expectedOutcome?.qualityAdjustedRunsFor },
        { label: 'Quality Adjusted Runs Against', value: team?.expectedOutcome?.qualityAdjustedRunsAgainst },
        { label: 'Expected Run Differential', value: team?.expectedOutcome?.expectedRunDifferential },
        { label: 'Quality Adjusted Run Differential', value: team?.expectedOutcome?.qualityAdjustedRunDifferential },
        { label: 'Expected Win Percentage', value: team?.expectedOutcome?.expectedWinPercentage },
        { label: 'Contact Advantage Runs', value: team?.expectedOutcome?.contactAdvantageRuns },
        { label: 'Discipline Advantage Runs', value: team?.expectedOutcome?.disciplineAdvantageRuns },
        { label: 'Deserved Runs Above Actual', value: team?.expectedOutcome?.deservedRunsAboveActual },
        { label: 'Actual Runs Above Expected', value: team?.expectedOutcome?.actualRunsAboveExpected },
        { label: 'Actual Runs Allowed Above Expected', value: team?.expectedOutcome?.actualRunsAllowedAboveExpected },
      ],
    },
  ];
}

/**
 * GameBackendStats Component
 *
 * Encapsulates backend game, team, and player stats in the bottom dropdown.
 *
 * @param props.game - Processed game payload returned by the backend.
 */
export function GameBackendStats({ game }: GameBackendStatsProps) {
  if (!game) {
    return null;
  }

  const gameRows = getGameDetailRows(game);
  const homeTeamCards = getTeamStatCards(game.teams.home);
  const awayTeamCards = getTeamStatCards(game.teams.away);

  return (
    <BackendStatsDropdown title="Raw Stats">
      <BackendKeyValueList title="Game Details" rows={gameRows} />
      <BackendStatCardGrid cards={homeTeamCards} title="Home Team Stats" />
      <BackendStatCardGrid cards={awayTeamCards} title="Away Team Stats" />
      <BackendPlayerStatsTables game={game} />
    </BackendStatsDropdown>
  );
}
