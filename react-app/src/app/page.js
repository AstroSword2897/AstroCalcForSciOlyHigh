"use client";

import Navigation from "../components/Navigation";
import ExpressionCalculator from "../components/ExpressionCalculator";
import FormulaExplorer from "../components/FormulaExplorer";
import UnitConverter from "../components/UnitConverter";
import GraphPanel from "../components/GraphPanel";
import FRQHelper from "../components/FRQHelper";
import DiagnosticsPanel from "../components/DiagnosticsPanel";

export default function Home() {
  return (
    <div className="page">
      <Navigation />
      <main className="content">
        <section className="hero">
          <div>
            <p className="eyebrow">AstroCalc for SciOly</p>
            <h1>Modern React experience, same offline tools</h1>
            <p className="muted">
              Calculator, formula explorer, unit converter, FRQ helper, and graphing – rebuilt with
              Next.js and npm-managed MathJax/graphing ready to wire in.
            </p>
          </div>
          <div className="hero-actions">
            <a className="primary" href="#calculator">
              Open calculator
            </a>
            <a className="ghost" href="#formulas">
              Browse formulas
            </a>
          </div>
        </section>

        <ExpressionCalculator />
        <FormulaExplorer />
        <UnitConverter />
        <GraphPanel />
        <FRQHelper />
        <DiagnosticsPanel />
      </main>
    </div>
  );
}
