"use client";

import { notFound } from "next/navigation";
import Navigation from "../../components/Navigation";
import ExpressionCalculator from "../../components/ExpressionCalculator";
import FormulaExplorer from "../../components/FormulaExplorer";
import UnitConverter from "../../components/UnitConverter";
import GraphPanel from "../../components/GraphPanel";
import FRQHelper from "../../components/FRQHelper";
import DiagnosticsPanel from "../../components/DiagnosticsPanel";

const sectionMap = {
  calculator: { title: "Calculator", component: <ExpressionCalculator /> },
  formulas: { title: "Formulas", component: <FormulaExplorer /> },
  converter: { title: "Unit Converter", component: <UnitConverter /> },
  graph: { title: "Graphing", component: <GraphPanel /> },
  frq: { title: "FRQ Helper", component: <FRQHelper /> },
  diagnostics: { title: "Diagnostics", component: <DiagnosticsPanel /> },
};

export default function SectionPage({ params }) {
  const entry = sectionMap[params.section];
  if (!entry) return notFound();

  return (
    <div className="page">
      <Navigation />
      <main className="content">
        <section className="card">
          <p className="eyebrow">Section</p>
          <h1>{entry.title}</h1>
        </section>
        {entry.component}
      </main>
    </div>
  );
}
