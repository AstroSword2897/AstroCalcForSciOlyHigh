'use client';

import { useState } from 'react';

export default function FRQHelper() {
  const [prompt, setPrompt] = useState('');
  const [steps, setSteps] = useState([]);
  const [note, setNote] = useState('');

  const addStep = () => {
    if (!note.trim()) return;
    setSteps((prev) => [...prev, note.trim()]);
    setNote('');
  };

  return (
    <section id="frq" className="card">
      <div className="card-header">
        <div>
          <p className="eyebrow">FRQ Helper</p>
          <h2>Outline your response</h2>
        </div>
      </div>

      <div className="stack">
        <label className="form-field">
          <span>Question / prompt</span>
          <textarea
            rows={3}
            placeholder="Paste the FRQ stem here"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>

        <div className="form-grid">
          <label className="form-field">
            <span>Step / note</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="State knowns, assumptions, or next step"
            />
          </label>
          <button className="primary" onClick={addStep}>
            Add step
          </button>
        </div>

        {steps.length === 0 ? (
          <p className="muted">Draft steps to track your reasoning.</p>
        ) : (
          <ol className="list">
            {steps.map((s, idx) => (
              <li key={idx}>{s}</li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}
