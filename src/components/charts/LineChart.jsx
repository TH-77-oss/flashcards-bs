// Courbe d'un pourcentage (0–100) dans le temps.
// points : [{ key, value }] où value peut être null (jour sans révision).
// Toucher le graphique sélectionne le jour le plus proche (onSelect).
const W = 320
const PAD = 8

export default function LineChart({ points, selectedKey, onSelect, height = 140, color = 'var(--chart-blue)', ariaLabel }) {
  const n = points.length
  const x = (i) => (n > 1 ? PAD + (i * (W - 2 * PAD)) / (n - 1) : W / 2)
  const y = (v) => PAD + (1 - v / 100) * (height - 2 * PAD)
  const coords = points.map((p, i) => (p.value === null ? null : { key: p.key, x: x(i), y: y(p.value) })).filter(Boolean)
  const selected = coords.find((c) => c.key === selectedKey)

  return (
    <div className="chart" style={{ height }}>
      {/* preserveAspectRatio="none" : la courbe s'étire sur toute la largeur.
          Les points sont dessinés en HTML par-dessus pour rester bien ronds. */}
      <svg viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="chart-svg" role="img" aria-label={ariaLabel}>
        {[100, 50, 0].map((v) => (
          <line key={v} x1="0" x2={W} y1={y(v)} y2={y(v)} className={v === 0 ? 'chart-axis' : 'chart-grid'} vectorEffect="non-scaling-stroke" />
        ))}
        <polyline
          points={coords.map((c) => `${c.x},${c.y}`).join(' ')}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="chart-ylabel" style={{ top: y(100) - 7 }}>100 %</span>
      <span className="chart-ylabel" style={{ top: y(50) - 7 }}>50 %</span>
      {coords.map((c) => (
        <span
          key={c.key}
          className={'chart-dot' + (c === selected ? ' is-selected' : '')}
          style={{ left: `${(c.x / W) * 100}%`, top: c.y, background: color }}
        />
      ))}
      <div className="chart-hits">
        {points.map((p) => (
          <button
            key={p.key}
            className={'chart-hit' + (p.key === selectedKey ? ' is-selected' : '')}
            onClick={() => onSelect(p.key === selectedKey ? null : p.key)}
            aria-label={`Voir le ${p.key}`}
          />
        ))}
      </div>
    </div>
  )
}
