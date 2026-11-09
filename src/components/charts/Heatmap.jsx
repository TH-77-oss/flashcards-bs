// Calendrier de régularité façon GitHub : 12 colonnes (semaines) × 7 lignes (lundi → dimanche).
// Plus la case est claire, plus vous avez révisé de cartes ce jour-là.
const LEVEL_COLORS = ['#2c2c2e', '#26345f', '#3a55a8', '#6584ec', '#a9bdff']

export default function Heatmap({ cells, selectedKey, onSelect }) {
  return (
    <div>
      <div className="heat-months muted tiny">
        <span>nov.</span>
        <span>déc.</span>
        <span>janv.</span>
      </div>
      <div className="heat-grid">
        {cells.map((c) => (
          <button
            key={c.day}
            className={'heat-cell' + (c.day === selectedKey ? ' is-selected' : '') + (c.level < 0 ? ' is-future' : '')}
            style={{ background: c.level < 0 ? 'transparent' : LEVEL_COLORS[c.level] }}
            onClick={() => onSelect(c.day === selectedKey ? null : c.day)}
            aria-label={`${c.day} : ${c.count} cartes`}
          />
        ))}
      </div>
      <div className="heat-legend muted tiny">
        Moins
        {LEVEL_COLORS.map((col) => (
          <span key={col} className="heat-swatch" style={{ background: col }} />
        ))}
        Plus
      </div>
    </div>
  )
}
