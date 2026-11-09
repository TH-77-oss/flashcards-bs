// Barre d'onglets du bas. NavLink sait si son onglet correspond à la page
// affichée (isActive) : on s'en sert pour colorer l'onglet actif.
import { NavLink } from 'react-router'
import { IconHome, IconChapters, IconStats, IconCalendar } from './Icons.jsx'

const TABS = [
  { to: '/', label: 'Accueil', Icon: IconHome, end: true },
  { to: '/chapitres', label: 'Chapitres', Icon: IconChapters },
  { to: '/stats', label: 'Stats', Icon: IconStats },
  { to: '/planning', label: 'Planning', Icon: IconCalendar },
]

export default function TabBar() {
  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => 'tabbar-item' + (isActive ? ' is-active' : '')}
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
