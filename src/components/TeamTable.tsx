import type { GameTeam } from '../types';
import { formatInteger, formatNumber, formatPercent, getNumber } from './format';

export interface TeamTableProps {
  /** The team data containing actual, expected, contact, discipline, and outcome stats to display. */
  team: GameTeam | null | undefined;
  /** The opposing team, used only to frame the team story. */
  opponent?: GameTeam | null | undefined;
}

interface StoryPoint {
  label: string;
  metric: string;
  tag: string;
}

function teamName(team: GameTeam): string {
  return team.abbreviation || team.name || 'Team';
}

/**
 * TeamTable Component
 *
 * Renders a stat-led team profile with compact story cards and deeper metrics
 * available as collapsible evidence.
 *
 * @param props.team - Parsed team stats from the API.
 * @param props.opponent - Opposing team used to contextualize run prevention.
 */
export function TeamTable({ team, opponent }: TeamTableProps) {
  if (!team) {
    return null;
  }

  const opponentName = opponent ? teamName(opponent) : 'their opponent';
  const expectedTotalBases = team.expectedBatting?.xTotalBases ?? team.batting?.totalBases;
  const expectedRunsAllowed = getNumber(team.expectedOutcome?.expectedRunsAgainst, getNumber(team.expRunsAgainst));
  const actualRunsAllowed = getNumber(team.runsAgainst);
  const runPreventionGap = expectedRunsAllowed - actualRunsAllowed;
  const whiffRate = team.plateDiscipline?.whiffRate;
  const contactRate = typeof whiffRate === 'number' && Number.isFinite(whiffRate) ? 1 - whiffRate : undefined;
  const scoringChanceRate = team.scoringChanceConversionRate
    ?? (getNumber(team.scoringChances) > 0 ? getNumber(team.scoringChanceConversions) / getNumber(team.scoringChances) : undefined);
  const scoringChanceTag = getNumber(team.scoringChances) > 0
    ? `${formatPercent(scoringChanceRate)} of scoring chances converted`
    : 'no scoring chances';

  const stories: StoryPoint[] = [
    {
      label: 'Scoring Chances',
      metric: `${formatInteger(team.scoringChanceConversions)} / ${formatInteger(team.scoringChances)}`,
      tag: scoringChanceTag,
    },
    {
      label: 'Contact Rate',
      metric: formatPercent(contactRate),
      tag: `${formatPercent(whiffRate)} whiff rate`,
    },
    {
      label: 'Expected Power',
      metric: formatNumber(expectedTotalBases, 2),
      tag: 'expected total bases',
    },
    {
      label: 'Run prevention',
      metric: `${formatInteger(team.runsAgainst)} / ${formatNumber(expectedRunsAllowed, 2)}`,
      tag: runPreventionGap >= 0 ? `${opponentName} held under xRA` : `${opponentName} beat xRA`,
    },
    {
      label: 'Good Approach percentage',
      metric: team.plateDiscipline?.cswRate ? formatPercent(1 - team.plateDiscipline?.cswRate) : "Cannot be calculated :(",
      tag: `inverted team CSW rate`,
    },
  ];

  return (
    <section className="team-block team-story-panel">
      <h3 className="block-title">{team.name || team.abbreviation}</h3>
      <div className="team-story-list">
        {stories.map((story) => (
          <article className="team-story-card" key={story.label}>
            <span>{story.label}</span>
            <strong>{story.metric}</strong>
            <em>{story.tag}</em>
          </article>
        ))}
      </div>
    </section>
  );
}
