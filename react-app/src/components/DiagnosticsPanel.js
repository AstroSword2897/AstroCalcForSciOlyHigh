'use client';

import { constants } from '../lib/data/formulas';

export default function DiagnosticsPanel() {
  const rows = [
    { label: 'Gravitational constant (G)', value: constants.G, unit: 'm^3 kg^-1 s^-2' },
    { label: 'Speed of light (c)', value: constants.c, unit: 'm/s' },
    { label: 'Stefan-Boltzmann (σ)', value: constants.sigma, unit: 'W·m−2·K−4' },
  ];

  return (
    <section id="diagnostics" className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Diagnostics</p>
          <h2>Environment snapshot</h2>
        </div>
      </div>

      <div className="table">
        {rows.map((row) => (
          <div className="table-row" key={row.label}>
            <div className="table-cell">{row.label}</div>
            <div className="table-cell strong">{row.value}</div>
            <div className="table-cell muted">{row.unit}</div>
          </div>
        ))}
      </div>
      <p className="muted small">
        Values are bundled locally. Add your own constants in <code>src/lib/data/formulas.js</code>.
      </p>
    </section>
  );
}
