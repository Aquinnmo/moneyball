import './StatGlossary.css';

interface StatGlossaryEntry {
  term: string;
  aliases?: string[];
  group: string;
  description: string;
  reading?: string;
}

const glossaryEntries: StatGlossaryEntry[] = [
  {
    term: 'Runs',
    aliases: ['R', 'Final Score'],
    group: 'Linescore',
    description: 'Actual runs scored by the team or charged to the pitcher.',
    reading: 'Higher for offense; lower for pitching.',
  },
  {
    term: 'Hits',
    aliases: ['H', 'Hits Allowed', 'H Against'],
    group: 'Linescore',
    description: 'Batted balls that safely produce a base hit.',
  },
  {
    term: 'Errors',
    aliases: ['E'],
    group: 'Linescore',
    description: 'Defensive miscues that allow a batter or runner to advance.',
    reading: 'Lower is better.',
  },
  {
    term: 'Left On Base',
    aliases: ['LOB'],
    group: 'Linescore',
    description: 'Runners stranded on base when an inning ends.',
  },
  {
    term: 'Runs Against',
    group: 'Team',
    description: 'Runs allowed by a team or pitcher.',
    reading: 'Lower is better.',
  },
  {
    term: 'Plate Appearances',
    aliases: ['PA'],
    group: 'Batting',
    description: 'Completed batter trips to the plate, including walks, hit by pitch, and sacrifices.',
  },
  {
    term: 'At Bats',
    aliases: ['AB', 'AB Count'],
    group: 'Batting',
    description: 'Official batting chances, excluding walks, hit by pitch, and most sacrifices.',
  },
  {
    term: 'Singles',
    aliases: ['1B'],
    group: 'Batting',
    description: 'Hits where the batter reaches first base safely.',
  },
  {
    term: 'Doubles',
    aliases: ['2B'],
    group: 'Batting',
    description: 'Hits where the batter reaches second base safely.',
  },
  {
    term: 'Triples',
    aliases: ['3B'],
    group: 'Batting',
    description: 'Hits where the batter reaches third base safely.',
  },
  {
    term: 'Home Runs',
    aliases: ['HR', 'HR Allowed'],
    group: 'Batting',
    description: 'Hits that score the batter and all runners.',
  },
  {
    term: 'Walks',
    aliases: ['BB', 'BB Allowed'],
    group: 'Batting',
    description: 'Free bases awarded after four balls.',
  },
  {
    term: 'Hit By Pitch',
    aliases: ['HBP', 'HBP Allowed'],
    group: 'Batting',
    description: 'Times a batter reaches after being hit by a pitch.',
  },
  {
    term: 'Strikeouts',
    aliases: ['K', 'SO'],
    group: 'Batting',
    description: 'Plate appearances ending with strike three.',
  },
  {
    term: 'Sac Flies',
    aliases: ['SF'],
    group: 'Batting',
    description: 'Fly outs that score a runner and do not count as at-bats.',
  },
  {
    term: 'Total Bases',
    aliases: ['TB'],
    group: 'Batting',
    description: 'Base count from hits: singles count one, doubles two, triples three, homers four.',
  },
  {
    term: 'Batting Average',
    aliases: ['AVG'],
    group: 'Batting',
    description: 'Hits divided by at-bats.',
  },
  {
    term: 'On Base Percentage',
    aliases: ['OBP'],
    group: 'Batting',
    description: 'Share of plate appearances where a hitter reaches base by hit, walk, or hit by pitch.',
  },
  {
    term: 'Slugging Percentage',
    aliases: ['SLG'],
    group: 'Batting',
    description: 'Total bases per at-bat.',
  },
  {
    term: 'OPS',
    group: 'Batting',
    description: 'On-base percentage plus slugging percentage.',
  },
  {
    term: 'Isolated Power',
    aliases: ['ISO'],
    group: 'Batting',
    description: 'Extra-base power measured as slugging percentage minus batting average.',
  },
  {
    term: 'BABIP',
    group: 'Batting',
    description: 'Batting average on balls hit into the field of play, excluding homers.',
  },
  {
    term: 'Walk Rate',
    aliases: ['BB%'],
    group: 'Batting',
    description: 'Walks divided by plate appearances or batters faced.',
  },
  {
    term: 'Strikeout Rate',
    aliases: ['K%'],
    group: 'Batting',
    description: 'Strikeouts divided by plate appearances or batters faced.',
  },
  {
    term: 'RISP Plate Appearances',
    aliases: ['RISP PA'],
    group: 'Scoring',
    description: 'Plate appearances with runners in scoring position.',
  },
  {
    term: 'RISP Conversions',
    aliases: ['RISP Conv'],
    group: 'Scoring',
    description: 'Runners-in-scoring-position chances converted into run-scoring production.',
  },
  {
    term: 'RISP Conversion Rate',
    aliases: ['RISP Conv%', 'Scoring Chance Conversion Rate'],
    group: 'Scoring',
    description: 'Converted scoring chances divided by total scoring chances.',
  },
  {
    term: 'Scoring Chances',
    group: 'Scoring',
    description: 'Backend-counted run-scoring opportunities created by the offense.',
  },
  {
    term: 'Scoring Chance Conversions',
    group: 'Scoring',
    description: 'Scoring chances that turned into actual run production.',
  },
  {
    term: 'Expected Win Percentage',
    aliases: ['Expected Win', 'Exp Win'],
    group: 'Expected Outcome',
    description: 'Model estimate of how often the team wins from the quality of its game profile.',
  },
  {
    term: 'Expected Win Batting',
    group: 'Expected Outcome',
    description: 'Win estimate from the team batting profile alone.',
  },
  {
    term: 'Expected Win Pitching',
    group: 'Expected Outcome',
    description: 'Win estimate from the team pitching profile alone.',
  },
  {
    term: 'Expected Runs For',
    aliases: ['Expected Runs'],
    group: 'Expected Outcome',
    description: 'Model-estimated runs a team deserved to score from its offensive events.',
  },
  {
    term: 'Expected Runs Against',
    aliases: ['Exp Runs Against', 'Expected Runs Allowed', 'xRA'],
    group: 'Expected Outcome',
    description: 'Model-estimated runs a team or pitcher deserved to allow.',
    reading: 'Lower is better for run prevention.',
  },
  {
    term: 'Expected Run Differential',
    group: 'Expected Outcome',
    description: 'Expected runs for minus expected runs against.',
  },
  {
    term: 'Quality Adjusted Runs',
    aliases: ['QAR'],
    group: 'Expected Outcome',
    description: 'Run estimate adjusted for quality of contact, discipline, and game events.',
  },
  {
    term: 'Quality Adjusted Runs For',
    group: 'Expected Outcome',
    description: 'Quality-adjusted run value created by a team offense.',
  },
  {
    term: 'Quality Adjusted Runs Against',
    aliases: ['QAR Allowed'],
    group: 'Expected Outcome',
    description: 'Quality-adjusted run value allowed by a team or pitcher.',
    reading: 'Lower is better for pitching.',
  },
  {
    term: 'Quality Adjusted Run Differential',
    group: 'Expected Outcome',
    description: 'Quality-adjusted runs for minus quality-adjusted runs against.',
  },
  {
    term: 'Contact Advantage Runs',
    group: 'Expected Outcome',
    description: 'Run edge created by contact quality compared with the opponent.',
  },
  {
    term: 'Discipline Advantage Runs',
    group: 'Expected Outcome',
    description: 'Run edge created by swing decisions, strikes, whiffs, and count control.',
  },
  {
    term: 'Deserved Runs Above Actual',
    group: 'Expected Outcome',
    description: 'Expected or quality-adjusted runs minus actual runs scored.',
  },
  {
    term: 'Actual Runs Above Expected',
    group: 'Expected Outcome',
    description: 'Actual runs scored minus expected runs scored.',
  },
  {
    term: 'Actual Runs Allowed Above Expected',
    group: 'Expected Outcome',
    description: 'Actual runs allowed minus expected runs allowed.',
  },
  {
    term: 'Expected Edge Share',
    aliases: ['Expected Run Edge Share'],
    group: 'Shares',
    description: 'Team share of the expected run differential edge in the game model.',
  },
  {
    term: 'Total Base Share',
    group: 'Shares',
    description: 'Team share of total bases produced in the game.',
  },
  {
    term: 'Hard-Hit Share',
    group: 'Shares',
    description: 'Team share of hard-hit balls in play.',
  },
  {
    term: 'xBA',
    aliases: ['xBA Allowed'],
    group: 'Expected Batting',
    description: 'Expected batting average from batted-ball quality and strikeout/contact outcomes.',
  },
  {
    term: 'xOBP',
    aliases: ['xOBP Allowed'],
    group: 'Expected Batting',
    description: 'Expected on-base percentage from the underlying plate appearance profile.',
  },
  {
    term: 'wOBA',
    aliases: ['wOBA Count'],
    group: 'Expected Batting',
    description: 'Weighted on-base average, giving each offensive event run-value weight.',
  },
  {
    term: 'xWOBA',
    aliases: ['xWOBA Allowed', 'xWOBA Against'],
    group: 'Expected Batting',
    description: 'Expected weighted on-base average from contact and discipline quality.',
    reading: 'Higher for hitters; lower for pitchers.',
  },
  {
    term: 'xSLG',
    aliases: ['xSLG Allowed'],
    group: 'Expected Batting',
    description: 'Expected slugging percentage from batted-ball quality.',
  },
  {
    term: 'wOPS',
    group: 'Expected Batting',
    description: 'Weighted OPS-style production score from the processed game model.',
  },
  {
    term: 'tOPS',
    group: 'Expected Batting',
    description: 'Team-relative OPS-style production score from the processed game model.',
  },
  {
    term: 'xOPS',
    aliases: ['xOPS Allowed'],
    group: 'Expected Batting',
    description: 'Expected on-base percentage plus expected slugging percentage.',
  },
  {
    term: 'Expected Times On Base',
    aliases: ['Exp TOB'],
    group: 'Expected Batting',
    description: 'Estimated times a hitter or team deserved to reach base.',
  },
  {
    term: 'Expected Bases',
    aliases: ['Exp Bases'],
    group: 'Expected Batting',
    description: 'Estimated total-base output from the underlying contact profile.',
  },
  {
    term: 'xHits',
    aliases: ['xH', 'xH Allowed'],
    group: 'Expected Batting',
    description: 'Expected hits from batted-ball quality and plate appearance results.',
  },
  {
    term: 'xTotal Bases',
    aliases: ['xTB', 'xTB Allowed'],
    group: 'Expected Batting',
    description: 'Expected total bases from contact quality.',
  },
  {
    term: 'xWeighted Times On Base',
    aliases: ['xwTOB', 'xwTOB Allowed'],
    group: 'Expected Batting',
    description: 'Expected times on base weighted by event run value.',
  },
  {
    term: 'xRuns Created',
    aliases: ['xRC'],
    group: 'Expected Batting',
    description: 'Expected offensive runs created by a hitter or team.',
  },
  {
    term: 'xRuns Created Per PA',
    aliases: ['xRC / PA', 'xRC/PA'],
    group: 'Expected Batting',
    description: 'Expected runs created divided by plate appearances.',
  },
  {
    term: 'xLinear Weight Runs',
    aliases: ['xLWR'],
    group: 'Expected Batting',
    description: 'Expected run value using linear weights for offensive events.',
  },
  {
    term: 'Contact Run Value',
    aliases: ['Contact RV', 'Contact RV Allowed'],
    group: 'Expected Batting',
    description: 'Run value assigned to quality of contact.',
  },
  {
    term: 'Discipline Run Value',
    aliases: ['Discipline RV', 'Discipline RV Allowed'],
    group: 'Expected Batting',
    description: 'Run value assigned to plate discipline outcomes.',
  },
  {
    term: 'xHome Runs',
    aliases: ['xHR', 'xHR Allowed'],
    group: 'Expected Batting',
    description: 'Expected home runs from batted-ball quality.',
  },
  {
    term: 'Hits Above Expected',
    aliases: ['H Above Exp'],
    group: 'Expected Batting',
    description: 'Actual hits minus expected hits.',
  },
  {
    term: 'Total Bases Above Expected',
    aliases: ['TB Above Exp'],
    group: 'Expected Batting',
    description: 'Actual total bases minus expected total bases.',
  },
  {
    term: 'OPS Above Expected',
    aliases: ['OPS Above Exp'],
    group: 'Expected Batting',
    description: 'Actual OPS minus expected OPS.',
  },
  {
    term: 'Runs Created Above Expected',
    aliases: ['RC Above Exp'],
    group: 'Expected Batting',
    description: 'Actual run creation minus expected run creation.',
  },
  {
    term: 'Balls In Play',
    aliases: ['BIP'],
    group: 'Batted Ball',
    description: 'Batted balls that enter the field of play.',
  },
  {
    term: 'Hard Hit Balls',
    aliases: ['Hard Hit'],
    group: 'Batted Ball',
    description: 'Batted balls meeting the hard-contact threshold used by the backend.',
  },
  {
    term: 'Barrels',
    group: 'Batted Ball',
    description: 'Premium contact events with strong exit velocity and launch angle.',
  },
  {
    term: 'Sweet Spot Balls',
    aliases: ['Sweet Spot'],
    group: 'Batted Ball',
    description: 'Batted balls launched in the productive angle window.',
  },
  {
    term: 'Average Exit Velocity',
    aliases: ['Avg EV'],
    group: 'Batted Ball',
    description: 'Average speed of batted balls off the bat.',
  },
  {
    term: 'Max Exit Velocity',
    aliases: ['Max EV'],
    group: 'Batted Ball',
    description: 'Hardest batted ball by exit velocity.',
  },
  {
    term: 'Average Launch Angle',
    aliases: ['Avg LA'],
    group: 'Batted Ball',
    description: 'Average vertical angle of batted balls off the bat.',
  },
  {
    term: 'Hard Hit Rate',
    aliases: ['HH%'],
    group: 'Batted Ball',
    description: 'Hard-hit balls divided by balls in play.',
  },
  {
    term: 'Barrel Rate',
    aliases: ['Barrel%'],
    group: 'Batted Ball',
    description: 'Barrels divided by balls in play or plate appearances.',
  },
  {
    term: 'Sweet Spot Rate',
    aliases: ['Sweet Spot%'],
    group: 'Batted Ball',
    description: 'Sweet-spot balls divided by balls in play.',
  },
  {
    term: 'Average Bat Speed',
    aliases: ['Avg Bat Speed'],
    group: 'Bat Tracking',
    description: 'Average bat speed on tracked swings.',
  },
  {
    term: 'Max Bat Speed',
    group: 'Bat Tracking',
    description: 'Fastest tracked swing by a hitter or team.',
  },
  {
    term: 'Pitches',
    group: 'Plate Discipline',
    description: 'Total pitches seen by hitters or thrown by pitchers.',
  },
  {
    term: 'Strikes',
    group: 'Plate Discipline',
    description: 'Pitches counted as strikes, including called strikes, swinging strikes, and fouls.',
  },
  {
    term: 'Balls',
    group: 'Plate Discipline',
    description: 'Pitches taken or called outside the strike zone.',
  },
  {
    term: 'Swings',
    group: 'Plate Discipline',
    description: 'Pitches where the hitter offered at the ball.',
  },
  {
    term: 'Whiffs',
    group: 'Plate Discipline',
    description: 'Swings that miss.',
  },
  {
    term: 'Called Strikes',
    aliases: ['Called K'],
    group: 'Plate Discipline',
    description: 'Taken pitches called as strikes.',
  },
  {
    term: 'Called Strikes Plus Whiffs',
    aliases: ['CSW'],
    group: 'Plate Discipline',
    description: 'Called strikes plus swinging misses.',
  },
  {
    term: 'First Pitch Strikes',
    aliases: ['FPS'],
    group: 'Plate Discipline',
    description: 'Plate appearances that start with strike one.',
  },
  {
    term: 'Strike Rate',
    aliases: ['Strike%'],
    group: 'Plate Discipline',
    description: 'Strikes divided by total pitches.',
  },
  {
    term: 'Swing Rate',
    aliases: ['Swing%'],
    group: 'Plate Discipline',
    description: 'Swings divided by total pitches.',
  },
  {
    term: 'Whiff Rate',
    aliases: ['Whiff%'],
    group: 'Plate Discipline',
    description: 'Whiffs divided by swings or tracked pitch chances.',
  },
  {
    term: 'CSW Rate',
    aliases: ['CSW%', 'Called Strike plus Whiff rate'],
    group: 'Plate Discipline',
    description: 'Called strikes plus whiffs divided by total pitches.',
  },
  {
    term: 'First Pitch Strike Rate',
    aliases: ['FPS%'],
    group: 'Plate Discipline',
    description: 'First-pitch strikes divided by plate appearances or batters faced.',
  },
  {
    term: 'Contact Rate',
    group: 'Plate Discipline',
    description: 'Share of swings that produce contact, shown as the inverse of whiff rate.',
  },
  {
    term: 'Good Approach Percentage',
    group: 'Plate Discipline',
    description: 'Team approach callout currently shown as the inverse of team CSW rate.',
  },
  {
    term: 'Batters Faced',
    aliases: ['BF'],
    group: 'Pitching',
    description: 'Total hitters faced by a pitcher or pitching staff.',
  },
  {
    term: 'Outs',
    group: 'Pitching',
    description: 'Recorded defensive outs credited to a pitcher or team.',
  },
  {
    term: 'Innings Pitched',
    aliases: ['IP'],
    group: 'Pitching',
    description: 'Outs recorded expressed as baseball innings.',
  },
  {
    term: 'xRA Per Out',
    aliases: ['xRA / out'],
    group: 'Pitching',
    description: 'Expected runs allowed divided by outs recorded.',
    reading: 'Lower is better.',
  },
  {
    term: 'Run Prevention Value',
    group: 'Pitching',
    description: 'Expected pitching value saved or lost compared with the run model.',
  },
  {
    term: 'Contact Allowed',
    group: 'Pitching',
    description: 'Batted-ball quality surrendered by a pitcher or staff.',
    reading: 'Lower rates and weaker contact are better.',
  },
  {
    term: 'Stolen Game',
    group: 'Game Model',
    description: 'Flag for games where the final score winner differs from the expected-quality winner.',
  },
];

/**
 * StatGlossary Component
 *
 * Provides a collapsible bottom-of-page reference for the stats rendered across
 * the game page and raw backend tables.
 */
export function StatGlossary() {
  return (
    <details className="stat-glossary hologram-bracket" id="stat-glossary">
      <summary className="stat-glossary-summary">
        <span>Stat Glossary</span>
        <strong>{glossaryEntries.length} stats</strong>
      </summary>
      <div className="stat-glossary-grid" aria-label="Game page stat definitions">
        {glossaryEntries.map((entry) => (
          <article className="stat-glossary-card" key={`${entry.group}-${entry.term}`}>
            <div className="stat-glossary-card-heading">
              <span>{entry.group}</span>
              <h3>{entry.term}</h3>
            </div>
            {entry.aliases && entry.aliases.length > 0 && (
              <p className="stat-glossary-aliases">{entry.aliases.join(' / ')}</p>
            )}
            <p>{entry.description}</p>
            {entry.reading && <small>{entry.reading}</small>}
          </article>
        ))}
      </div>
    </details>
  );
}
