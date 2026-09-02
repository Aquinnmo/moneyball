/**
 * Self-check for the standings math. No framework: `npm run check`.
 *
 * The tie cases are the point — before deterministic ordering existed, the AL
 * West leader was whichever tied team the API listed first. The expected-basis
 * cases are the second point: the same fixture must produce a different set of
 * division leaders and a different wild card field.
 */
import assert from 'node:assert/strict';
import {
  buildLeagueStandings,
  byRecord,
  formatGamesBack,
  gamesBehind,
  WILD_CARD_SPOTS,
  type StandingsRow,
} from './standings.ts';

const pct = (wins: number, losses: number) => wins / (wins + losses);

const row = (
  id: string,
  division: 'East' | 'Central' | 'West',
  wins?: number,
  losses?: number,
  /** Expected record; defaults to the actual one when a case doesn't care. */
  expected: [number, number] = [wins ?? 0, losses ?? 0],
): StandingsRow => ({
  id,
  team: { league: 'AL', division },
  standing: wins === undefined || losses === undefined
    ? undefined
    : {
      wins,
      losses,
      winPct: pct(wins, losses),
      expectedWins: expected[0],
      expectedLosses: expected[1],
      expectedWinPct: pct(expected[0], expected[1]),
    },
});

/**
 * The live 2026 AL, whose West is a genuine three-way tie at 16-16. Expected
 * records are set so the two bases disagree: TB coasts on luck and slips behind
 * NYY, while TEX's underlying play makes it the West leader over ATH.
 */
const al: StandingsRow[] = [
  row('NYY', 'East', 22, 11, [21, 12]), row('TB', 'East', 19, 12, [14, 17]),
  row('TOR', 'East', 16, 17, [16, 17]), row('BAL', 'East', 15, 18, [18, 15]),
  row('BOS', 'East', 13, 20, [13, 20]),
  row('CLE', 'Central', 18, 16, [19, 15]), row('DET', 'Central', 16, 17, [18, 15]),
  row('CWS', 'Central', 15, 17, [15, 17]), row('MIN', 'Central', 14, 20, [14, 20]),
  row('KC', 'Central', 13, 19, [13, 19]),
  row('SEA', 'West', 16, 16, [15, 17]), row('ATH', 'West', 16, 16, [14, 18]),
  row('TEX', 'West', 16, 16, [20, 12]), row('HOU', 'West', 13, 21, [13, 21]),
  row('LAA', 'West', 12, 21, [12, 21]),
];

const ids = (rows: StandingsRow[]) => rows.map((r) => r.id);

// --- ordering -------------------------------------------------------------

// Ranking is independent of input order — the bug this file exists for.
const shuffled = [...al].reverse();
assert.deepEqual(
  ids([...al].sort(byRecord('actual'))),
  ids([...shuffled].sort(byRecord('actual'))),
  'tied teams must rank the same whatever order the API returns them in',
);
assert.deepEqual(
  ids([...al].sort(byRecord('expected'))),
  ids([...shuffled].sort(byRecord('expected'))),
  'the expected basis is order-independent too',
);

// Equal pct falls through to wins, then to id.
const compare = byRecord('actual');
assert.ok(compare(row('A', 'East', 10, 10), row('B', 'East', 9, 9)) < 0, 'more wins at equal pct ranks first');
assert.ok(compare(row('AAA', 'East', 10, 10), row('BBB', 'East', 10, 10)) < 0, 'id breaks a full tie');
assert.ok(compare(row('X', 'East'), row('Y', 'East', 0, 30)) > 0, 'a team with no record ranks last');

// The basis actually changes the answer.
const lucky = row('LUCKY', 'East', 20, 10, [10, 20]);
const unlucky = row('UNLUCKY', 'East', 10, 20, [20, 10]);
assert.ok(byRecord('actual')(lucky, unlucky) < 0, 'actual basis ranks on games won');
assert.ok(byRecord('expected')(lucky, unlucky) > 0, 'expected basis ranks on games earned');

// --- games back -----------------------------------------------------------

// Two back in the win column plus three in the loss column is 2.5 games.
const leader = row('L', 'East', 20, 10);
assert.equal(gamesBehind(leader, row('T', 'East', 18, 13), 'actual'), 2.5);
assert.equal(gamesBehind(leader, leader, 'actual'), 0);
assert.ok(gamesBehind(leader, row('U', 'East', 22, 8), 'actual')! < 0, 'a better record is ahead, not behind');
assert.equal(gamesBehind(leader, row('N', 'East'), 'actual'), undefined);

// Same two rows, different basis, different number.
assert.equal(gamesBehind(lucky, unlucky, 'actual'), 10);
assert.equal(gamesBehind(lucky, unlucky, 'expected'), -10);

assert.equal(formatGamesBack(0), '0.0');
assert.equal(formatGamesBack(2.5), '2.5');
assert.equal(formatGamesBack(-2.5), '+2.5');
assert.equal(formatGamesBack(undefined), undefined);

// --- actual basis (unchanged behaviour) -----------------------------------

const actual = buildLeagueStandings('AL', al, 'actual');

// The three division leaders head the table as their own section, ranked against
// each other; none of them also appears in the field below.
const actualLeaders = ['NYY', 'CLE', 'ATH'];
assert.deepEqual(ids(actual.leaders), actualLeaders, 'leaders come back ranked, best record first');
assert.deepEqual(ids(actual.contenders).filter((id) => actualLeaders.includes(id)), []);
assert.equal(actual.leaders.length + actual.contenders.length, al.length, 'every team lands in exactly one section');
assert.equal(actual.contenders.length, al.length - actualLeaders.length);
assert.deepEqual(ids(actual.contenders).slice(0, WILD_CARD_SPOTS), ['TB', 'SEA', 'TEX']);
assert.equal(actual.contenders[WILD_CARD_SPOTS].id, 'DET', 'cut line falls before the first team out');

// GB runs against the team's own division leader, WCGB against the last berth (TEX, 16-16).
// A leader is level with itself and gets no WCGB, so its cell renders blank.
assert.equal(actual.gamesBack.get('NYY'), '0.0');
assert.equal(actual.gamesBack.get('TB'), '2.0', 'NYY 22-11 over TB 19-12 is three wins and one loss, so 2.0');
assert.equal(actual.wildCardGamesBack.get('TEX'), '0.0');
assert.equal(actual.wildCardGamesBack.get('TB'), '+3.5', 'a team above the cut is ahead of it');
assert.equal(actual.wildCardGamesBack.get('DET'), '0.5');
assert.equal(actual.wildCardGamesBack.get('NYY'), undefined, 'division leaders get no WCGB');

// --- expected basis -------------------------------------------------------

const expected = buildLeagueStandings('AL', al, 'expected');

// TB's luck evaporates and TEX takes the West: one of the three leaders changes.
const expectedLeaders = ['NYY', 'TEX', 'CLE'];
assert.deepEqual(ids(expected.leaders), expectedLeaders, 'leaders re-rank on expected record too');
assert.deepEqual(ids(expected.contenders).filter((id) => expectedLeaders.includes(id)), []);
assert.notDeepEqual(
  [...actualLeaders].sort(),
  [...expectedLeaders].sort(),
  'the two bases must name a different set of leaders here',
);
assert.notDeepEqual(
  ids(actual.contenders).slice(0, WILD_CARD_SPOTS),
  ids(expected.contenders).slice(0, WILD_CARD_SPOTS),
  'the two bases must seed the wild card differently here',
);

// Ranked on expectedWinPct: BAL .545, DET .545 (BAL first on id), then TOR .485.
assert.deepEqual(ids(expected.contenders).slice(0, WILD_CARD_SPOTS), ['BAL', 'DET', 'TOR']);
assert.equal(expected.contenders[WILD_CARD_SPOTS].id, 'CWS');

// xGB against the expected division leader; xWCGB against the expected last berth (TOR, 16-17).
assert.equal(expected.gamesBack.get('BAL'), '3.0', 'NYY 21-12 over BAL 18-15 is three wins and three losses');
assert.equal(expected.gamesBack.get('ATH'), '6.0', 'TEX 20-12 leads the West over ATH 14-18');
assert.equal(expected.wildCardGamesBack.get('TOR'), '0.0');
assert.equal(expected.wildCardGamesBack.get('BAL'), '+2.0');
assert.equal(expected.wildCardGamesBack.get('NYY'), undefined, 'division leaders get no xWCGB either');

// TB is in on actual record and out on expected — the whole reason for the toggle.
assert.ok(ids(actual.contenders).indexOf('TB') < WILD_CARD_SPOTS);
assert.ok(ids(expected.contenders).indexOf('TB') >= WILD_CARD_SPOTS);

// --- missing data ---------------------------------------------------------

// A team the standings payload skipped never takes a berth, on either basis.
const ghost = [...al, row('GHOST', 'East')];
assert.equal(ids(buildLeagueStandings('AL', ghost, 'actual').contenders).includes('GHOST'), false);
assert.equal(ids(buildLeagueStandings('AL', ghost, 'expected').contenders).includes('GHOST'), false);

console.log('standings: all checks passed');
