import './GameQuickLinks.css';

export interface GameQuickLink {
  /** Hash target for a major game-page section. */
  href: `#${string}`;
  /** User-facing section label. */
  label: string;
}

export interface GameQuickLinksProps {
  /** Ordered list of major page sections available from the game overview. */
  links: readonly GameQuickLink[];
}

/**
 * GameQuickLinks Component
 *
 * Renders compact in-page navigation for the major sections on the game view.
 *
 * @param props.links - Ordered hash links for the current game page.
 */
export function GameQuickLinks({ links }: GameQuickLinksProps) {
  return (
    <nav className="game-quick-links" aria-label="Game page sections">
      {links.map((link) => (
        <h3 key={link.href}>
          <a href={link.href}>{link.label}</a>
        </h3>
      ))}
    </nav>
  );
}
