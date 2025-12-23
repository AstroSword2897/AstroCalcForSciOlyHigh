'use client';

import { MathJax } from 'better-react-mathjax';

export default function MathBlock({ tex }) {
  if (!tex) return null;
  return (
    <div className="math">
      <MathJax dynamic inline={false}>
        {`\\(${tex}\\)`}
      </MathJax>
    </div>
  );
}
