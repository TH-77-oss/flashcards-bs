// Barres verticales. Les hauteurs sont proportionnelles aux valeurs réelles
// (une valeur deux fois plus grande = une barre deux fois plus haute).
// bars : [{ key, value, color? }] ; toucher une barre appelle onSelect(key).
export default function BarChart({
  bars,
  selectedKey,
  onSelect,
  height = 120,
  color = 'var(--chart-blue)',
  selectedColor = '#a9bdff',
  showValues = false,
  ariaLabel,
}) {
  const max = Math.max(1, ...bars.map((b) => b.value))

  return (
    <div className="bar-chart" style={{ height }} role="img" aria-label={ariaLabel}>
      {bars.map((b) => {
        const h = b.value > 0 ? Math.max(3, (b.value / max) * (height - (showValues ? 16 : 0))) : 0
        const isSel = b.key === selectedKey
        return (
          <button
            key={b.key}
            className="bar-hit"
            onClick={() => onSelect?.(isSel ? null : b.key)}
            aria-label={`${b.label || b.key} : ${b.value}`}
          >
            {showValues && <span className="bar-value">{b.value}</span>}
            <span className="bar" style={{ height: h, background: isSel ? selectedColor : b.color || color }} />
          </button>
        )
      })}
    </div>
  )
}
