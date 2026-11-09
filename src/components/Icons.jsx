// Icônes en SVG. stroke="currentColor" : l'icône prend la couleur du texte
// qui l'entoure, donc elle devient bleue automatiquement dans l'onglet actif.
const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function IconHome() {
  return (
    <svg {...base}>
      <path d="M3 10.5L12 3l9 7.5V21h-6v-6H9v6H3z" />
    </svg>
  )
}

export function IconChapters() {
  return (
    <svg {...base}>
      <rect x="4" y="6" width="13" height="15" rx="2" />
      <path d="M8 3h10a2 2 0 0 1 2 2v12" />
    </svg>
  )
}

export function IconStats() {
  return (
    <svg {...base}>
      <path d="M5 20v-8M12 20V5M19 20v-9" />
    </svg>
  )
}

export function IconCalendar() {
  return (
    <svg {...base}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  )
}

export function IconChevron() {
  return (
    <svg {...base} width={8} height={14} viewBox="0 0 8 14" strokeWidth={2}>
      <path d="M1 1l6 6-6 6" />
    </svg>
  )
}
