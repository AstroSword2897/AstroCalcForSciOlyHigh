'use client';

import { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { safeEvaluate } from '../lib/safeExpressionEvaluator';

const DEFAULT_EXPR = 'sin(x)';

export default function GraphPanel() {
  const [expression, setExpression] = useState(DEFAULT_EXPR);
  const [range, setRange] = useState({ min: -10, max: 10 });
  const [samples, setSamples] = useState(120);

  const computeSeries = () => {
    const list = [];
    let nextError = null;
    const step = (range.max - range.min) / samples;
    for (let i = 0; i <= samples; i++) {
      const x = range.min + i * step;
      const y = safeEvaluate(expression, { x });
      if (y === null || Number.isNaN(y) || !Number.isFinite(y)) {
        nextError = 'Expression could not be graphed for all x.';
        return { points: [], error: nextError };
      }
      list.push({ x, y });
    }
    return { points: list, error: nextError };
  };

  const { points, error } = computeSeries();

  const chartData = useMemo(
    () => ({
      labels: points.map((p) => p.x.toFixed(2)),
      datasets: [
        {
          label: `y = ${expression}`,
          data: points.map((p) => p.y),
          borderColor: 'rgb(14, 165, 233)',
          backgroundColor: 'rgba(14, 165, 233, 0.2)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.25,
        },
      ],
    }),
    [points, expression],
  );

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: 'x' },
          ticks: { maxTicksLimit: 8 },
        },
        y: {
          title: { display: true, text: 'y' },
          ticks: { maxTicksLimit: 6 },
        },
      },
      plugins: {
        legend: { display: true },
        tooltip: { intersect: false },
      },
    }),
    [],
  );

  return (
    <section id="graph" className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Graphing Sandbox</p>
          <h2>Plot f(x)</h2>
        </div>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Expression in x</span>
          <input value={expression} onChange={(e) => setExpression(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Min X</span>
          <input
            type="number"
            value={range.min}
            onChange={(e) => setRange((prev) => ({ ...prev, min: Number(e.target.value) }))}
          />
        </label>
        <label className="form-field">
          <span>Max X</span>
          <input
            type="number"
            value={range.max}
            onChange={(e) => setRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
          />
        </label>
        <label className="form-field">
          <span>Samples</span>
          <input
            type="number"
            min={10}
            max={400}
            value={samples}
            onChange={(e) => setSamples(Number(e.target.value))}
          />
        </label>
      </div>

      {error ? (
        <div className="pill error">
          <span>Error</span>
          <strong>{error}</strong>
        </div>
      ) : (
        <div className="graph chart">
          <Line data={chartData} options={chartOptions} />
          <p className="muted small">
            Powered by Chart.js with safe expression sampling. Use Math.* functions; variables beyond x can
            be inlined (e.g., <code>sin(x) * exp(-0.1 * x)</code>).
          </p>
        </div>
      )}
    </section>
  );
}
