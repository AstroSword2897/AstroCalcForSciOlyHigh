import { test, expect } from '@playwright/test';
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';
import { AstrophysicsExpertSystem } from '../scripts/ui/ui/modules/expert/ExpertSystem.js';
import { SearchEngine } from '../scripts/ui/ui/modules/search/SearchEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadFormulas() {
  const formulasPath = path.resolve(__dirname, '../scripts/formulas.js');
  const code = fs.readFileSync(formulasPath, 'utf8');
  const sandbox = { window: {}, console, formulas: undefined, formulaCategories: undefined };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { timeout: 5000 });
  if (!sandbox.formulas || !sandbox.formulaCategories) {
    throw new Error('Failed to load formulas or categories from formulas.js');
  }
  return { formulas: sandbox.formulas, formulaCategories: sandbox.formulaCategories };
}

function createExpert() {
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
  return { expert, formulas };
}

test.describe('AstrophysicsExpertSystem - Determinism & Correctness', () => {
  test('should reject calculus questions', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('What is the derivative of flux with respect to time?');
    expect(result.success).toBeFalsy();
    expect(result.hasCalculus).toBeTruthy();
  });

  test('should map orbital period question to Kepler third law', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('What is the orbital period of a satellite 7000 km above Earth?');
    expect(result.success).toBeTruthy();
    expect(result.formula.id).toContain('kepler_third');
    expect(result.confidence).toBeGreaterThanOrEqual(60);
  });

  test('should map escape velocity question correctly', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('What is the escape velocity from Earth surface?');
    expect(result.success).toBeTruthy();
    expect(result.formula.id).toContain('escape_velocity');
    expect(result.confidence).toBeGreaterThanOrEqual(60);
  });

  test('should map gravitational force question correctly', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('What is the gravitational force between two masses 5 kg and 10 kg separated by 2 m?');
    expect(result.success).toBeTruthy();
    expect(result.formula.id).toContain('newton_gravitational_force');
    expect(result.confidence).toBeGreaterThanOrEqual(60);
  });

  test('should map luminosity distance question correctly', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('How do I compute luminosity distance from redshift?');
    expect(result.success).toBeTruthy();
    expect(result.formula.id).toContain('luminosity_distance');
  });

  test('should map blackbody radiation question correctly', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('What is the blackbody radiation formula for spectral radiance?');
    expect(result.success).toBeTruthy();
    expect(result.formula.id).toContain('blackbody');
  });

  test('determinism: same input yields same formula', async () => {
    const { expert } = createExpert();
    const q = 'orbital period for Earth around Sun';
    const r1 = expert.solveQuestion(q);
    const r2 = expert.solveQuestion(q);
    expect(r1.formula.id).toBe(r2.formula.id);
    expect(r1.confidence).toBe(r2.confidence);
  });
});

test.describe('AstrophysicsExpertSystem - Negative Authority & Refusal', () => {
  test('ambiguous question should refuse with suggestions', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('calculate orbital velocity and escape velocity');
    expect(result.success).toBeFalsy();
    expect(result.error).toBeTruthy();
  });

  test('vague conceptual question should refuse', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('why are stars hot');
    expect(result.success).toBeFalsy();
  });

  test('non-physics math should refuse', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('solve x^2 + 3x = 0');
    expect(result.success).toBeFalsy();
  });
});

test.describe('AstrophysicsExpertSystem - Confidence Calibration', () => {
  const cases = [
    { q: 'orbital period of Earth around Sun', min: 80, max: 100 },
    { q: 'how to find escape velocity', min: 60, max: 100 },
    { q: 'period from orbit distance', min: 40, max: 100 },
    { q: 'distance stuff', min: 0, max: 60 }, // ambiguous/partial
  ];

  for (const c of cases) {
    test(`confidence calibration: "${c.q}"`, async () => {
      const { expert } = createExpert();
      const result = expert.solveQuestion(c.q);
      if (result.success) {
        expect(result.confidence).toBeGreaterThanOrEqual(c.min);
        expect(result.confidence).toBeLessThanOrEqual(c.max);
      } else {
        // If refused, ensure it falls into low/ambiguous band
        expect(c.max).toBeLessThanOrEqual(60);
      }
    });
  }
});

test.describe('AstrophysicsExpertSystem - Explanation Determinism', () => {
  test('same input yields identical explanation text', async () => {
    const { expert } = createExpert();
    const q = 'compute escape velocity from Earth';
    const r1 = expert.solveQuestion(q);
    const r2 = expert.solveQuestion(q);
    expect(r1.explanation).toBe(r2.explanation);
  });
});

