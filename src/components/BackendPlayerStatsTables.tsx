import type { Batter, GameData, Pitcher } from '../types';
import {
  BackendStatsTable,
  type BackendStatsTableColumn,
  type BackendStatsTableRow,
  type BackendStatsTableValue,
} from './BackendStatsTable';

export interface BackendPlayerStatsTablesProps {
  /** Processed game payload returned by the backend. */
  game: GameData;
}

type PlayerField<TPlayer> = BackendStatsTableColumn & {
  getValue: (player: TPlayer) => BackendStatsTableValue;
};

const POSITION_ABBREVIATIONS: Record<string, string> = {
  '1': 'P',
  '2': 'C',
  '3': '1B',
  '4': '2B',
  '5': '3B',
  '6': 'SS',
  '7': 'LF',
  '8': 'CF',
  '9': 'RF',
  '10': 'DH',
};

function playerName(player: Batter | Pitcher): string {
  const name = player.fullName || [player.firstName, player.lastName].filter(Boolean).join(' ');

  return name || `Player ${player.id}`;
}

function formatPosition(position: Batter['position']): BackendStatsTableValue {
  if (position == null || position === '') {
    return position;
  }

  return POSITION_ABBREVIATIONS[position.trim()] ?? position;
}

const batterField = (
  key: string,
  label: string,
  group: string,
  getValue: (batter: Batter) => BackendStatsTableValue,
  sectionStart = false,
): PlayerField<Batter> => ({ key, label, group, getValue, sectionStart });

const pitcherField = (
  key: string,
  label: string,
  group: string,
  getValue: (pitcher: Pitcher) => BackendStatsTableValue,
  sectionStart = false,
): PlayerField<Pitcher> => ({ key, label, group, getValue, sectionStart });

const batterFields: PlayerField<Batter>[] = [
  batterField('player', 'Player', 'Player', (batter) => playerName(batter)),
  batterField('primaryNumber', '#', 'Info', (batter) => batter.primaryNumber),
  batterField('position', 'Pos', 'Info', (batter) => formatPosition(batter.position)),
  batterField('batHand', 'Bat Hand', 'Info', (batter) => batter.batHand),
  batterField('hits', 'Hits', 'Game', (batter) => batter.hits, true),
  batterField('runs', 'Runs', 'Game', (batter) => batter.runs),
  batterField('errors', 'Errors', 'Game', (batter) => batter.errors),
  batterField('nPA', 'PA', 'Game', (batter) => batter.nPA),
  batterField('xBa', 'xBA', 'Game', (batter) => batter.xBa),
  batterField('wOBA', 'wOBA', 'Game', (batter) => batter.wOBA),
  batterField('xSLG', 'xSLG', 'Game', (batter) => batter.xSLG),
  batterField('wOPS', 'wOPS', 'Game', (batter) => batter.wOPS),
  batterField('tOPS', 'tOPS', 'Game', (batter) => batter.tOPS),
  batterField('expTimesOnBase', 'Exp TOB', 'Game', (batter) => batter.expTimesOnBase),
  batterField('expBases', 'Exp Bases', 'Game', (batter) => batter.expBases),
  batterField('maxExitVelo', 'Max EV', 'Game', (batter) => batter.maxExitVelo),
  batterField('avgBatSpeed', 'Avg Bat Speed', 'Game', (batter) => batter.avgBatSpeed),
  batterField('maxBatSpeed', 'Max Bat Speed', 'Game', (batter) => batter.maxBatSpeed),
  batterField('avgExitVelo', 'Avg EV', 'Game', (batter) => batter.avgExitVelo),
  batterField('rispPlateAppearances', 'RISP PA', 'Game', (batter) => batter.rispPlateAppearances),
  batterField('rispConversions', 'RISP Conv', 'Game', (batter) => batter.rispConversions),
  batterField('rispConversionRate', 'RISP Conv%', 'Game', (batter) => batter.rispConversionRate),
  batterField('abCount', 'AB Count', 'Game', (batter) => batter.abCount),
  batterField('wobaCount', 'wOBA Count', 'Game', (batter) => batter.wobaCount),
  batterField('battingPlateAppearances', 'PA', 'Batting', (batter) => batter.batting?.plateAppearances, true),
  batterField('battingAtBats', 'AB', 'Batting', (batter) => batter.batting?.atBats),
  batterField('battingHits', 'H', 'Batting', (batter) => batter.batting?.hits),
  batterField('battingSingles', '1B', 'Batting', (batter) => batter.batting?.singles),
  batterField('battingDoubles', '2B', 'Batting', (batter) => batter.batting?.doubles),
  batterField('battingTriples', '3B', 'Batting', (batter) => batter.batting?.triples),
  batterField('battingHomeRuns', 'HR', 'Batting', (batter) => batter.batting?.homeRuns),
  batterField('battingWalks', 'BB', 'Batting', (batter) => batter.batting?.walks),
  batterField('battingHitByPitch', 'HBP', 'Batting', (batter) => batter.batting?.hitByPitch),
  batterField('battingStrikeouts', 'K', 'Batting', (batter) => batter.batting?.strikeouts),
  batterField('battingSacFlies', 'SF', 'Batting', (batter) => batter.batting?.sacFlies),
  batterField('battingTotalBases', 'TB', 'Batting', (batter) => batter.batting?.totalBases),
  batterField('battingAverage', 'AVG', 'Batting', (batter) => batter.batting?.battingAverage),
  batterField('battingOnBasePercentage', 'OBP', 'Batting', (batter) => batter.batting?.onBasePercentage),
  batterField('battingSluggingPercentage', 'SLG', 'Batting', (batter) => batter.batting?.sluggingPercentage),
  batterField('battingOps', 'OPS', 'Batting', (batter) => batter.batting?.ops),
  batterField('battingIsolatedPower', 'ISO', 'Batting', (batter) => batter.batting?.isolatedPower),
  batterField('battingBabip', 'BABIP', 'Batting', (batter) => batter.batting?.babip),
  batterField('expectedXBA', 'xBA', 'Expected', (batter) => batter.expected?.xBA, true),
  batterField('expectedXOBP', 'xOBP', 'Expected', (batter) => batter.expected?.xOBP),
  batterField('expectedXWOBA', 'xWOBA', 'Expected', (batter) => batter.expected?.xWOBA),
  batterField('expectedXSLG', 'xSLG', 'Expected', (batter) => batter.expected?.xSLG),
  batterField('expectedXOPS', 'xOPS', 'Expected', (batter) => batter.expected?.xOPS),
  batterField('expectedXHits', 'xH', 'Expected', (batter) => batter.expected?.xHits),
  batterField('expectedXTotalBases', 'xTB', 'Expected', (batter) => batter.expected?.xTotalBases),
  batterField('expectedXWeightedTimesOnBase', 'xwTOB', 'Expected', (batter) => batter.expected?.xWeightedTimesOnBase),
  batterField('expectedXRunsCreated', 'xRC', 'Expected', (batter) => batter.expected?.xRunsCreated),
  batterField('expectedXRunsCreatedPerPA', 'xRC/PA', 'Expected', (batter) => batter.expected?.xRunsCreatedPerPA),
  batterField('expectedXLinearWeightRuns', 'xLWR', 'Expected', (batter) => batter.expected?.xLinearWeightRuns),
  batterField('expectedQualityAdjustedRuns', 'QAR', 'Expected', (batter) => batter.expected?.qualityAdjustedRuns),
  batterField('expectedContactRunValue', 'Contact RV', 'Expected', (batter) => batter.expected?.contactRunValue),
  batterField('expectedDisciplineRunValue', 'Discipline RV', 'Expected', (batter) => batter.expected?.disciplineRunValue),
  batterField('expectedXHomeRuns', 'xHR', 'Expected', (batter) => batter.expected?.xHomeRuns),
  batterField('expectedHitsAboveExpected', 'H Above Exp', 'Expected', (batter) => batter.expected?.hitsAboveExpected),
  batterField('expectedTotalBasesAboveExpected', 'TB Above Exp', 'Expected', (batter) => batter.expected?.totalBasesAboveExpected),
  batterField('expectedOpsAboveExpected', 'OPS Above Exp', 'Expected', (batter) => batter.expected?.opsAboveExpected),
  batterField('expectedRunsCreatedAboveExpected', 'RC Above Exp', 'Expected', (batter) => batter.expected?.runsCreatedAboveExpected),
  batterField('battedBallBallsInPlay', 'BIP', 'Batted Ball', (batter) => batter.battedBall?.ballsInPlay, true),
  batterField('battedBallHardHitBalls', 'Hard Hit', 'Batted Ball', (batter) => batter.battedBall?.hardHitBalls),
  batterField('battedBallBarrels', 'Barrels', 'Batted Ball', (batter) => batter.battedBall?.barrels),
  batterField('battedBallSweetSpotBalls', 'Sweet Spot', 'Batted Ball', (batter) => batter.battedBall?.sweetSpotBalls),
  batterField('battedBallAvgExitVelo', 'Avg EV', 'Batted Ball', (batter) => batter.battedBall?.avgExitVelo),
  batterField('battedBallMaxExitVelo', 'Max EV', 'Batted Ball', (batter) => batter.battedBall?.maxExitVelo),
  batterField('battedBallAvgLaunchAngle', 'Avg LA', 'Batted Ball', (batter) => batter.battedBall?.avgLaunchAngle),
  batterField('plateDisciplinePitches', 'Pitches', 'Plate Discipline', (batter) => batter.plateDiscipline?.pitches, true),
  batterField('plateDisciplineStrikes', 'Strikes', 'Plate Discipline', (batter) => batter.plateDiscipline?.strikes),
  batterField('plateDisciplineBalls', 'Balls', 'Plate Discipline', (batter) => batter.plateDiscipline?.balls),
  batterField('plateDisciplineSwings', 'Swings', 'Plate Discipline', (batter) => batter.plateDiscipline?.swings),
  batterField('plateDisciplineWhiffs', 'Whiffs', 'Plate Discipline', (batter) => batter.plateDiscipline?.whiffs),
  batterField('plateDisciplineCalledStrikes', 'Called K', 'Plate Discipline', (batter) => batter.plateDiscipline?.calledStrikes),
  batterField('plateDisciplineCalledStrikesPlusWhiffs', 'CSW', 'Plate Discipline', (batter) => batter.plateDiscipline?.calledStrikesPlusWhiffs),
  batterField('plateDisciplineFirstPitchStrikes', 'FPS', 'Plate Discipline', (batter) => batter.plateDiscipline?.firstPitchStrikes),
  batterField('plateDisciplineStrikeRate', 'Strike%', 'Plate Discipline', (batter) => batter.plateDiscipline?.strikeRate),
  batterField('plateDisciplineSwingRate', 'Swing%', 'Plate Discipline', (batter) => batter.plateDiscipline?.swingRate),
  batterField('plateDisciplineWhiffRate', 'Whiff%', 'Plate Discipline', (batter) => batter.plateDiscipline?.whiffRate),
  batterField('plateDisciplineCswRate', 'CSW%', 'Plate Discipline', (batter) => batter.plateDiscipline?.cswRate),
  batterField('plateDisciplineFirstPitchStrikeRate', 'FPS%', 'Plate Discipline', (batter) => batter.plateDiscipline?.firstPitchStrikeRate),
];

const pitcherFields: PlayerField<Pitcher>[] = [
  pitcherField('player', 'Player', 'Player', (pitcher) => playerName(pitcher)),
  pitcherField('primaryNumber', '#', 'Info', (pitcher) => pitcher.primaryNumber),
  pitcherField('pitchHand', 'Pitch Hand', 'Info', (pitcher) => pitcher.pitchHand),
  pitcherField('hitsAgainst', 'H Against', 'Game', (pitcher) => pitcher.hitsAgainst, true),
  pitcherField('strikeouts', 'SO', 'Game', (pitcher) => pitcher.strikeouts),
  pitcherField('xBA', 'xBA', 'Game', (pitcher) => pitcher.xBA),
  pitcherField('wOBA', 'wOBA', 'Game', (pitcher) => pitcher.wOBA),
  pitcherField('xSLG', 'xSLG', 'Game', (pitcher) => pitcher.xSLG),
  pitcherField('wOPS', 'wOPS', 'Game', (pitcher) => pitcher.wOPS),
  pitcherField('expTimesOnBase', 'Exp TOB', 'Game', (pitcher) => pitcher.expTimesOnBase),
  pitcherField('expBases', 'Exp Bases', 'Game', (pitcher) => pitcher.expBases),
  pitcherField('battersFaced', 'BF', 'Game', (pitcher) => pitcher.battersFaced),
  pitcherField('outs', 'Outs', 'Game', (pitcher) => pitcher.outs),
  pitcherField('expRunsAgainst', 'Exp Runs Against', 'Game', (pitcher) => pitcher.expRunsAgainst),
  pitcherField('maxExitVelo', 'Max EV', 'Game', (pitcher) => pitcher.maxExitVelo),
  pitcherField('avgExitVelo', 'Avg EV', 'Game', (pitcher) => pitcher.avgExitVelo),
  pitcherField('avgLA', 'Avg LA', 'Game', (pitcher) => pitcher.avgLA),
  pitcherField('avgBatSpeed', 'Avg Bat Speed', 'Game', (pitcher) => pitcher.avgBatSpeed),
  pitcherField('maxBatSpeed', 'Max Bat Speed', 'Game', (pitcher) => pitcher.maxBatSpeed),
  pitcherField('pitchingBattersFaced', 'BF', 'Pitching', (pitcher) => pitcher.pitching?.battersFaced, true),
  pitcherField('pitchingOuts', 'Outs', 'Pitching', (pitcher) => pitcher.pitching?.outs),
  pitcherField('pitchingInningsPitched', 'IP', 'Pitching', (pitcher) => pitcher.pitching?.inningsPitched),
  pitcherField('pitchingPitches', 'Pitches', 'Pitching', (pitcher) => pitcher.pitching?.pitches),
  pitcherField('pitchingStrikes', 'Strikes', 'Pitching', (pitcher) => pitcher.pitching?.strikes),
  pitcherField('pitchingBalls', 'Balls', 'Pitching', (pitcher) => pitcher.pitching?.balls),
  pitcherField('pitchingHitsAllowed', 'H Allowed', 'Pitching', (pitcher) => pitcher.pitching?.hitsAllowed),
  pitcherField('pitchingWalksAllowed', 'BB Allowed', 'Pitching', (pitcher) => pitcher.pitching?.walksAllowed),
  pitcherField('pitchingHitByPitchAllowed', 'HBP Allowed', 'Pitching', (pitcher) => pitcher.pitching?.hitByPitchAllowed),
  pitcherField('pitchingStrikeouts', 'SO', 'Pitching', (pitcher) => pitcher.pitching?.strikeouts),
  pitcherField('pitchingHomeRunsAllowed', 'HR Allowed', 'Pitching', (pitcher) => pitcher.pitching?.homeRunsAllowed),
  pitcherField('pitchingStrikeRate', 'Strike%', 'Pitching', (pitcher) => pitcher.pitching?.strikeRate),
  pitcherField('pitchingStrikeoutRate', 'K%', 'Pitching', (pitcher) => pitcher.pitching?.strikeoutRate),
  pitcherField('pitchingWalkRate', 'BB%', 'Pitching', (pitcher) => pitcher.pitching?.walkRate),
  pitcherField('expectedXBAAllowed', 'xBA Allowed', 'Expected', (pitcher) => pitcher.expected?.xBAAllowed, true),
  pitcherField('expectedXOBPAllowed', 'xOBP Allowed', 'Expected', (pitcher) => pitcher.expected?.xOBPAllowed),
  pitcherField('expectedXWOBAAllowed', 'xWOBA Allowed', 'Expected', (pitcher) => pitcher.expected?.xWOBAAllowed),
  pitcherField('expectedXSLGAllowed', 'xSLG Allowed', 'Expected', (pitcher) => pitcher.expected?.xSLGAllowed),
  pitcherField('expectedXOPSAllowed', 'xOPS Allowed', 'Expected', (pitcher) => pitcher.expected?.xOPSAllowed),
  pitcherField('expectedXHitsAllowed', 'xH Allowed', 'Expected', (pitcher) => pitcher.expected?.xHitsAllowed),
  pitcherField('expectedXTotalBasesAllowed', 'xTB Allowed', 'Expected', (pitcher) => pitcher.expected?.xTotalBasesAllowed),
  pitcherField('expectedXWeightedTimesOnBaseAllowed', 'xwTOB Allowed', 'Expected', (pitcher) => pitcher.expected?.xWeightedTimesOnBaseAllowed),
  pitcherField('expectedRunsAllowed', 'Exp Runs Allowed', 'Expected', (pitcher) => pitcher.expected?.expectedRunsAllowed),
  pitcherField('expectedQualityAdjustedRunsAllowed', 'QAR Allowed', 'Expected', (pitcher) => pitcher.expected?.qualityAdjustedRunsAllowed),
  pitcherField('expectedXHomeRunsAllowed', 'xHR Allowed', 'Expected', (pitcher) => pitcher.expected?.xHomeRunsAllowed),
  pitcherField('expectedContactRunValueAllowed', 'Contact RV Allowed', 'Expected', (pitcher) => pitcher.expected?.contactRunValueAllowed),
  pitcherField('expectedDisciplineRunValueAllowed', 'Discipline RV Allowed', 'Expected', (pitcher) => pitcher.expected?.disciplineRunValueAllowed),
  pitcherField('expectedRunPreventionValue', 'Run Prevention', 'Expected', (pitcher) => pitcher.expected?.runPreventionValue),
  pitcherField('contactAllowedBallsInPlay', 'BIP', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.ballsInPlay, true),
  pitcherField('contactAllowedHardHitBalls', 'Hard Hit', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.hardHitBalls),
  pitcherField('contactAllowedBarrels', 'Barrels', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.barrels),
  pitcherField('contactAllowedSweetSpotBalls', 'Sweet Spot', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.sweetSpotBalls),
  pitcherField('contactAllowedAvgExitVelo', 'Avg EV', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.avgExitVelo),
  pitcherField('contactAllowedMaxExitVelo', 'Max EV', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.maxExitVelo),
  pitcherField('contactAllowedAvgLaunchAngle', 'Avg LA', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.avgLaunchAngle),
  pitcherField('contactAllowedHardHitRate', 'HH%', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.hardHitRate),
  pitcherField('contactAllowedBarrelRate', 'Barrel%', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.barrelRate),
  pitcherField('contactAllowedSweetSpotRate', 'Sweet Spot%', 'Contact Allowed', (pitcher) => pitcher.contactAllowed?.sweetSpotRate),
  pitcherField('plateDisciplinePitches', 'Pitches', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.pitches, true),
  pitcherField('plateDisciplineStrikes', 'Strikes', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.strikes),
  pitcherField('plateDisciplineBalls', 'Balls', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.balls),
  pitcherField('plateDisciplineSwings', 'Swings', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.swings),
  pitcherField('plateDisciplineWhiffs', 'Whiffs', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.whiffs),
  pitcherField('plateDisciplineCalledStrikes', 'Called K', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.calledStrikes),
  pitcherField('plateDisciplineCalledStrikesPlusWhiffs', 'CSW', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.calledStrikesPlusWhiffs),
  pitcherField('plateDisciplineFirstPitchStrikes', 'FPS', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.firstPitchStrikes),
  pitcherField('plateDisciplineStrikeRate', 'Strike%', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.strikeRate),
  pitcherField('plateDisciplineSwingRate', 'Swing%', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.swingRate),
  pitcherField('plateDisciplineWhiffRate', 'Whiff%', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.whiffRate),
  pitcherField('plateDisciplineCswRate', 'CSW%', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.cswRate),
  pitcherField('plateDisciplineFirstPitchStrikeRate', 'FPS%', 'Plate Discipline', (pitcher) => pitcher.plateDiscipline?.firstPitchStrikeRate),
];

function getColumns<TPlayer>(fields: PlayerField<TPlayer>[]): BackendStatsTableColumn[] {
  return fields.map(({ key, label, group, sectionStart }) => ({ key, label, group, sectionStart }));
}

function getRows<TPlayer extends { id: number }>(
  players: TPlayer[],
  fields: PlayerField<TPlayer>[],
  rowIdPrefix: string,
): BackendStatsTableRow[] {
  return players.map((player, index) => {
    const cells: Record<string, BackendStatsTableValue> = {};

    fields.forEach((field) => {
      cells[field.key] = field.getValue(player);
    });

    return {
      id: `${rowIdPrefix}-${player.id}-${index}`,
      cells,
    };
  });
}

function getSidePlayers<TPlayer extends { onHomeTeam: boolean }>(players: TPlayer[], onHomeTeam: boolean): TPlayer[] {
  return players.filter((player) => player.onHomeTeam === onHomeTeam);
}

/**
 * BackendPlayerStatsTables Component
 *
 * Renders the backend-provided batter and pitcher rows in line-score-styled,
 * scrollable stat tables split by home and away team.
 *
 * @param props.game - Processed game payload returned by the backend.
 */
export function BackendPlayerStatsTables({ game }: BackendPlayerStatsTablesProps) {
  const homeBatters = getSidePlayers(game.batters, true);
  const awayBatters = getSidePlayers(game.batters, false);
  const homePitchers = getSidePlayers(game.pitchers, true);
  const awayPitchers = getSidePlayers(game.pitchers, false);

  return (
    <>
      <BackendStatsTable
        columns={getColumns(batterFields)}
        rows={getRows(homeBatters, batterFields, 'home-batter')}
        scrollable
        tableClassName="backend-player-stats-table"
        title="Home Team Batters"
      />
      <BackendStatsTable
        columns={getColumns(batterFields)}
        rows={getRows(awayBatters, batterFields, 'away-batter')}
        scrollable
        tableClassName="backend-player-stats-table"
        title="Away Team Batters"
      />
      <BackendStatsTable
        columns={getColumns(pitcherFields)}
        rows={getRows(homePitchers, pitcherFields, 'home-pitcher')}
        scrollable
        tableClassName="backend-player-stats-table"
        title="Home Team Pitchers"
      />
      <BackendStatsTable
        columns={getColumns(pitcherFields)}
        rows={getRows(awayPitchers, pitcherFields, 'away-pitcher')}
        scrollable
        tableClassName="backend-player-stats-table"
        title="Away Team Pitchers"
      />
    </>
  );
}
