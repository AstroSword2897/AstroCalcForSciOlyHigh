'use client';

import { MathJaxContext } from 'better-react-mathjax';

const config = {
  loader: { load: ['input/tex', 'output/chtml'] },
  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] },
};

export default function MathProvider({ children }) {
  return <MathJaxContext config={config}>{children}</MathJaxContext>;
}
