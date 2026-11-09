// Sélecteur de période (contrôle segmenté iOS).
import { PERIODS } from '../../domain/dashboard.js'

export default function PeriodControl({ value, onChange }) {
  return (
    <div className="segmented" role="radiogroup" aria-label="Période">
      {PERIODS.map((p) => (
        <button
          key={p.key}
          role="radio"
          aria-checked={value === p.key}
          className={'segmented-item' + (value === p.key ? ' is-selected' : '')}
          onClick={() => onChange(p.key)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
