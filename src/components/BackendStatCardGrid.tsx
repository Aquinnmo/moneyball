export type BackendStatCardValue = string | number | boolean | null | undefined;

export interface BackendStatCardRow {
  /** Human-readable stat label shown inside the card. */
  label: string;
  /** Backend-provided stat value shown opposite the label. */
  value: BackendStatCardValue;
}

export interface BackendStatCard {
  /** Card title for a backend stat family. */
  title: string;
  /** Rows displayed inside this card. */
  rows: BackendStatCardRow[];
}

export interface BackendStatCardGridProps {
  /** Section title for the card grid. */
  title: string;
  /** Backend stat cards to render. */
  cards: BackendStatCard[];
}

function formatBackendStatCardValue(value: BackendStatCardValue): string {
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
 * BackendStatCardGrid Component
 *
 * Renders grouped backend stats as compact cards.
 *
 * @param props.title - Display title for the stat card section.
 * @param props.cards - Backend stat cards to show.
 */
export function BackendStatCardGrid({ title, cards }: BackendStatCardGridProps) {
  return (
    <section className="backend-stats-section" aria-label={title}>
      <h3>{title}</h3>
      <div className="backend-stat-card-grid">
        {cards.map((card) => (
          <article className="backend-stat-card" key={card.title}>
            <h4>{card.title}</h4>
            <dl>
              {card.rows.map((row) => (
                <div className="backend-stat-card-row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{formatBackendStatCardValue(row.value)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
