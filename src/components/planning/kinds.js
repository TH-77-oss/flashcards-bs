// Couleurs et libellés des types de session (mêmes couleurs que les graphiques).
export const KIND_COLOR = {
  decouverte: 'var(--chart-blue)',
  revision: 'var(--chart-violet)',
  consolidation: 'var(--chart-amber)',
  globale: 'var(--chart-amber)',
}

export function sessionTitle(p, titles) {
  return p.chapterId ? titles.get(p.chapterId) || `Chapitre ${p.chapterId}` : 'Tous les chapitres'
}
