import type { ReactNode } from 'react';
import './BackendStatsDropdown.css';

export interface BackendStatsDropdownProps {
  /** Main dropdown label. */
  title: string;
  /** Backend stat content displayed when the dropdown is expanded. */
  children: ReactNode;
}

/**
 * BackendStatsDropdown Component
 *
 * Provides a single collapsed bottom panel for backend stat tables.
 *
 * @param props.title - Main dropdown label.
 * @param props.children - Stat content rendered inside the expanded dropdown.
 */
export function BackendStatsDropdown({ title, children }: BackendStatsDropdownProps) {
  return (
    <section className="backend-stats-panel hologram-bracket" id="backend-stats" aria-labelledby="backend-stats-title">
      <details className="backend-stats-dropdown">
        <summary>
          <span id="backend-stats-title">{title}</span>
        </summary>
        <div className="backend-stats-content">{children}</div>
      </details>
    </section>
  );
}
