'use client';

import { useMemo, useState } from 'react';
import { parseExpression } from '../lib/expressionParser';

export default function ExpressionCalculator() {
  const [expression, setExpression] = useState('2 * pi * 6371000');
  const [unit, setUnit] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const hasResult = useMemo(() => result !== null && error === null, [result, error]);

  const handleCalculate = () => {
    try {
      setError(null);
      const value = parseExpression(expression, unit || undefined);
      setResult(value);
    } catch (err) {
      setResult(null);
      setError(err.message || 'Unable to evaluate expression');
    }
  };

  return (
    <section id="calculator" className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Core Calculator</p>
          <h2>Evaluate an expression</h2>
        </div>
        <button className="ghost" onClick={() => setExpression('')}>
          Clear
        </button>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Expression</span>
          <input
            value={expression}
            onChange={(e) => setExpression(e.target.value)}
            placeholder="e.g. 2 * pi * r"
          />
        </label>
        <label className="form-field">
          <span>Expected Unit (optional)</span>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="m, s, rad, K"
          />
        </label>
        <button className="primary" onClick={handleCalculate}>
          Calculate
        </button>
      </div>

      <div className="result">
        {hasResult && (
          <div className="pill success">
            <span>Result</span>
            <strong>{result}</strong>
            {unit ? <code>{unit}</code> : null}
          </div>
        )}
        {error && (
          <div className="pill error">
            <span>Error</span>
            <strong>{error}</strong>
          </div>
        )}
        {!hasResult && !error && <p className="muted">Enter an expression to evaluate.</p>}
      </div>
    </section>
  );
}
