// Cadre commun à tous les graphiques : titre, info à droite, graphique,
// puis la ligne de lecture des valeurs (readout) sous le graphique.
export default function ChartCard({ title, aside, readout, children }) {
  return (
    <section className="card chart-card">
      <div className="chart-head">
        <span className="chart-title">{title}</span>
        {aside && <span className="muted small">{aside}</span>}
      </div>
      {children}
      {readout && <p className="muted small chart-readout">{readout}</p>}
    </section>
  )
}
