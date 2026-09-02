import './ModeToggle.css';

export interface ModeToggleOption<TValue extends string> {
  /** Value applied when this option is picked. */
  value: TValue;
  /** User-facing option label. */
  label: string;
}

export interface ModeToggleProps<TValue extends string> {
  /** Accessible name for the toggle group. */
  ariaLabel: string;
  /** Options offered by this toggle. */
  options: readonly ModeToggleOption<TValue>[];
  /** Currently selected value. */
  value: TValue;
  /** Called with the newly selected value. */
  onChange: (value: TValue) => void;
}

/**
 * ModeToggle Component
 *
 * Renders a single-select button group used to switch a page between views.
 *
 * @param props.ariaLabel - Accessible name for the toggle group.
 * @param props.options - Options offered by this toggle.
 * @param props.value - Currently selected value.
 * @param props.onChange - Called with the newly selected value.
 */
export function ModeToggle<TValue extends string>({
  ariaLabel,
  options,
  value,
  onChange,
}: ModeToggleProps<TValue>) {
  return (
    <div className="mode-toggle" role="group" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          aria-pressed={option.value === value}
          className={option.value === value ? 'mode-toggle__btn mode-toggle__btn--active' : 'mode-toggle__btn'}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
