import { NavLink } from 'react-router';
import './NavBar.css';

interface MainNavigationLink {
  /** User-facing page label. */
  label: string;
  /** Route used by this primary page link. */
  to: `/${string}/`;
  /** Whether this page is currently available from navigation. */
  isEnabled: boolean;
}

const mainNavigationLinks = [
  { label: 'Games', to: '/games-picker/', isEnabled: true },
  { label: 'Teams', to: '/teams/', isEnabled: false },
  { label: 'Players', to: '/players/', isEnabled: false },
] as const satisfies readonly MainNavigationLink[];

/**
 * MainNavigation Component
 *
 * Renders primary navigation between top-level app pages.
 */
export function NavBar() {
  return (
    <nav className="main-navigation" aria-label="Primary pages">
      {mainNavigationLinks.map((link) => (
        link.isEnabled ? (
          <NavLink
            className={({ isActive }) => (
              `main-navigation__control${isActive ? ' main-navigation__control--active' : ''}`
            )}
            end
            key={link.label}
            to={link.to}
          >
            {link.label}
          </NavLink>
        ) : (
          <button
            className="main-navigation__control"
            disabled
            key={link.label}
            type="button"
          >
            {link.label}
          </button>
        )
      ))}
    </nav>
  );
}
