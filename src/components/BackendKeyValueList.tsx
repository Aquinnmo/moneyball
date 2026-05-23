export type BackendKeyValue = string | number | boolean | null | undefined;

export interface BackendKeyValueRow {
  /** Human-readable stat label shown on the left side of the row. */
  label: string;
  /** Backend-provided stat value shown on the right side of the row. */
  value: BackendKeyValue;
}

export interface BackendKeyValueListProps {
  /** Section title for this backend key/value group. */
  title: string;
  /** Flat list of backend key/value rows to render. */
  rows: BackendKeyValueRow[];
}

function formatBackendKeyValue(value: BackendKeyValue): string {
  if (value == null || value === '') {
    return '--';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? value.toString() : value.toFixed(3);
  }

  return value;
}

/**
 * BackendKeyValueList Component
 *
 * Renders simple backend metadata as one label/value pair per row.
 *
 * @param props.title - Display title for the key/value group.
 * @param props.rows - Backend key/value rows to show.
 */
export function BackendKeyValueList({ title, rows }: BackendKeyValueListProps) {
  return (
    <section className="backend-stats-section" aria-label={title}>
      <h3>{title}</h3>
      <dl className="backend-key-value-list">
        {rows.map((row) => (
          <div className="backend-key-value-row" key={row.label}>
            <dt>{row.label}</dt>
            <dd>{formatBackendKeyValue(row.value)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
