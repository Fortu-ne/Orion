import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Picture of the day' },
    { to: '/launches', label: 'Launches' },
  { to: '/iss', label: 'ISS tracker' },
  { to: '/asteroids', label: 'Asteroids' },
  // { to: '/earth', label: 'Earth' },
  // { to: '/search', label: 'Search' },

]

export default function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-hairline">
      <div className="flex items-center gap-2.5">
        {/* Live dot — the small signature detail */}
        <span className="w-2 h-2 rounded-full bg-glow animate-pulse" />
        <span className="font-display font-semibold tracking-widest text-body">
          ORION
        </span>
      </div>

      <nav className="flex gap-6 text-sm">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              isActive
                ? 'text-glow'
                : 'text-dim hover:text-body transition-colors'
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}