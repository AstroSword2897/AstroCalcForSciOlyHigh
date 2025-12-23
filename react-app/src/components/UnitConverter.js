'use client';

import { useState } from 'react';
import { convert } from '../lib/unitConverter';

const unitOptions = [
  'm',
  'km',
  'cm',
  'mm',
  'AU',
  'pc',
  'ly',
  'kg',
  'g',
  'M☉',
  'M⊕',
  's',
  'min',
  'hr',
  'day',
  'yr',
  'K',
  '°C',
  '°F',
  'rad',
  '°',
];

export default function UnitConverter() {
  const [value, setValue] = useState('1');
  const [fromUnit, setFromUnit] = useState('m');
  const [toUnit, setToUnit] = useState('km');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleConvert = () => {
    setError(null);
    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      setError('Enter a numeric value');
      setResult(null);
      return;
    }
    const converted = convert(numeric, fromUnit, toUnit);
    if (converted === null) {
      setError('Units are incompatible or unsupported');
      setResult(null);
      return;
    }
    setResult(converted);
  };

  return (
    <section id="converter" className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">Unit Converter</p>
          <h2>Quick conversions</h2>
        </div>
      </div>

      <div className="form-grid">
        <label className="form-field">
          <span>Value</span>
          <input value={value} onChange={(e) => setValue(e.target.value)} />
        </label>
        <label className="form-field">
          <span>From</span>
          <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
            {unitOptions.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>To</span>
          <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
            {unitOptions.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
        </label>
        <button className="primary" onClick={handleConvert}>
          Convert
        </button>
      </div>

      <div className="result">
        {result !== null && (
          <div className="pill success">
            <span>Result</span>
            <strong>
              {result} {toUnit}
            </strong>
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
