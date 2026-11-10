// Barres verticales empilées : chaque barre est la somme de plusieurs segments
// (ici : temps de lecture du cours + temps sur les flashcards).
// La hauteur totale reste proportionnelle à la valeur réelle.
// bars : [{ key, label, segments: [{ value, color, selectedColor }] }]
export default function StackedBarChart({ bars, selectedKey, onSelect, height = 120, ariaLabel }) {
  const totals = bars.map((b) => b.segments.reduce((t, s) => t + s.value, 0))
  const max = Math.max(1, ...totals)

  return (
    <div className="bar-chart" style={{ height }} role="img" aria-label={ariaLabel}>
      {bars.map((b, i) => {
        const isSel = b.key === selectedKey
        return (
          <button
            key={b.key}
            className="bar-hit stacked"
            onClick={() => onSelect?.(isSel ? null : b.key)}
            aria-label={`${b.label} : ${totals[i]}`}
          >
            {b.segments.map((s, k) =>
              s.value > 0 ? (
                <span
                  key={k}
                  className="bar-seg"
                  style={{ height: Math.max(2, (s.value / max) * height), background: isSel ? s.selectedColor : s.color }}
                />
              ) : null,
            )}
          </button>
        )
      })}
    </div>
  )
}
