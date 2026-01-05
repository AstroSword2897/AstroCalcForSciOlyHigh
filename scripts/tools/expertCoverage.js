/**
 * ExpertSystem coverage heatmap
 * Iterates every formula and generates simple canonical questions
 * Reports formulas that are not reachable by ExpertSystem.
 *
 * Run with: node scripts/tools/expertCoverage.js
 */
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
import { AstrophysicsExpertSystem } from '../ui/ui/modules/expert/ExpertSystem.js';
import { SearchEngine } from '../ui/ui/modules/search/SearchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadFormulas() {
  const formulasPath = path.resolve(__dirname, '../formulas.js');
  const code = fs.readFileSync(formulasPath, 'utf8');
  const sandbox = { window: {}, console, formulas: undefined, formulaCategories: undefined };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { timeout: 5000 });
  if (!sandbox.formulas || !sandbox.formulaCategories) {
    throw new Error('Failed to load formulas or categories from formulas.js');
  }
  return { formulas: sandbox.formulas, formulaCategories: sandbox.formulaCategories };
}

function buildQuestions(formula) {
  const questions = [];
  const name = formula.name || formula.id;
  const primaryConcept = (formula.concepts && formula.concepts[0]) || '';
  const primaryVar = (formula.variables && formula.variables[0]?.name) || (formula.variables && formula.variables[0]?.symbol) || '';

  // Simple heuristics for canonical questions
  questions.push(`What is ${name}?`);
  if (primaryConcept) questions.push(`How to calculate ${primaryConcept}?`);
  if (primaryVar) questions.push(`How to find ${primaryVar} using ${name}?`);

  return questions;
}

function main() {
  const { formulas, formulaCategories } = loadFormulas();
  const searchEngine = new SearchEngine({
    formulas,
    formulaCategories,
    cache: new Map(),
    performanceOptimizer: null,
    semanticSearchSystem: null,
    version: 'v2.1.0'
  });
  const expert = new AstrophysicsExpertSystem(formulas, searchEngine);

  const unreachable = [];
  const report = [];

  formulas.forEach(f => {
    const questions = buildQuestions(f);
    let hit = false;
    for (const q of questions) {
      const r = expert.solveQuestion(q);
      if (r.success && r.formula.id === f.id) {
        hit = true;
        report.push({ id: f.id, name: f.name, question: q, confidence: r.confidence });
        break;
      }
    }
    if (!hit) {
      unreachable.push({ id: f.id, name: f.name });
    }
  });

  console.log(`Coverage: ${formulas.length - unreachable.length}/${formulas.length} formulas reachable`);
  if (unreachable.length) {
    console.log('Unreachable formulas:');
    unreachable.slice(0, 50).forEach(u => console.log(`- ${u.id}: ${u.name}`));
    if (unreachable.length > 50) console.log(`... and ${unreachable.length - 50} more`);
  }
}

main();

