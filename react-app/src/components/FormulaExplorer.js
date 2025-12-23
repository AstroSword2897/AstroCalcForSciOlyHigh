'use client';

import { useMemo, useState } from 'react';
import MathBlock from './MathBlock';
import { evaluateFormula, listFormulas } from '../lib/calculator';

export default function FormulaExplorer() {
  const formulas = useMemo(() => listFormulas(), []);
  const [selectedId, setSelectedId] = useState(formulas[0]?.id || '');
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const visibleFormulas = useMemo(() => {
    if (!search.trim()) return formulas;
    const q = search.toLowerCase();
    return formulas.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q),
    );
  }, [formulas, search]);

  const selectedFormula = useMemo(
    () => formulas.find((f) => f.id === selectedId),
    [formulas, selectedId],
  );

  const updateInput = (symbol, value) => {
    setInputs((prev) => ({ ...prev, [symbol]: value }));
  };

  const handleCalculate = () => {
    if (!selectedFormula) return;
    try {
      setError(null);
      const next = evaluateFormula(selectedFormula.id, inputs);
      setResult(next);
    } catch (err) {
      setResult(null);
      setError(err.message || 'Unable to evaluate formula');
    }
  };

  return (
    <section id="formulas" className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Formula Explorer</p>
          <h2>Browse and solve</h2>
        </div>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Search</span>
          <input
            placeholder="Search formulas"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Formula</span>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {visibleFormulas.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.category}
              </option>
            ))}
          </select>
        </label>
      </div>

      {selectedFormula ? (
        <div className="stack">
          <p className="muted">{selectedFormula.description}</p>
          <MathBlock tex={selectedFormula.latex} />
          <div className="form-grid">
            {selectedFormula.variables.map((variable) => (
              <label className="form-field" key={variable.symbol}>
                <span>
                  {variable.name} ({variable.symbol}) — <code>{variable.unit}</code>
                </span>
                <input
                  value={inputs[variable.symbol] || ''}
                  onChange={(e) => updateInput(variable.symbol, e.target.value)}
                  placeholder={`Enter ${variable.name}`}
                />
              </label>
            ))}
            <button className="primary" onClick={handleCalculate}>
              Solve
            </button>
          </div>
        </div>
      ) : (
        <p className="muted">No formula selected.</p>
      )}

      <div className="result">
        {result && (
          <div className="pill success">
            <span>Result</span>
            <strong>{result.value}</strong>
            {result.unit ? <code>{result.unit}</code> : null}
          </div>
        )}
        {error && (
          <div className="pill error">
            <span>Error</span>
            <strong>{error}</strong>
          </div>
        )}
      </div>
    </section>
  );
}
