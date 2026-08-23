import './SeasonControls.css';

const EARLIEST_SEASON = 2015;
const MIN_OPTIONS: { value: string; label: string }[] = [
  { value: 'q', label: 'Qualified' },
  { value: '100', label: '100+ BIP' },
  { value: '250', label: '250+ BIP' },
];

export interface SeasonControlsProps {
  /** Currently selected season year. */
  year: number;
  /** Called with the newly selected season year. */
  onYearChange: (year: number) => void;
  /** Currently selected minimum-qualifier value, passed straight through to the backend's `min` param. */
  min: string;
  /** Called with the newly selected minimum-qualifier value. */
  onMinChange: (min: string) => void;
}

/**
 * SeasonControls Component
 *
 * Shared season/qualifier control strip used by the Players and Teams leaderboard pages.
 *
 * @param props.year - Currently selected season year.
 * @param props.onYearChange - Called with the newly selected season year.
 * @param props.min - Currently selected minimum-qualifier value.
 * @param props.onMinChange - Called with the newly selected minimum-qualifier value.
 */
export function SeasonControls({ year, onYearChange, min, onMinChange }: SeasonControlsProps) {
  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear; y >= EARLIEST_SEASON; y--) {
    years.push(y);
  }

  return (
    <div className="season-controls">
      <label className="season-controls__field">
        <span>Season</span>
        <select
          className="season-controls__select"
          onChange={(e) => onYearChange(Number(e.target.value))}
          value={year}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>
      <label className="season-controls__field">
        <span>Minimum</span>
        <select
          className="season-controls__select"
          onChange={(e) => onMinChange(e.target.value)}
          value={min}
        >
          {MIN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
