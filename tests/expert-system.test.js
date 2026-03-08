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
    expect(['kepler_third_law', 'orbital_period_general']).toContain(result.formula.id);
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
    const result = expert.solveQuestion('How do I compute luminosity distance from luminosity and observed flux?');
    expect(result.success).toBeTruthy();
    expect(result.formula.id).toBe('luminosity_distance');
  });

  test('should map blackbody radiation question correctly', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('What is the blackbody radiation formula for spectral radiance?');
    expect(result.success).toBeTruthy();
    expect(result.formula.id).toContain('blackbody');
  });

  test('should handle paraphrased distance questions consistently', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('Which formula gives the luminosity distance if I know luminosity and observed flux?');
    expect(result.success).toBeTruthy();
    expect(result.formula.id).toBe('luminosity_distance');
  });

  const sciOlyParaphraseCases = [
    {
      q: 'A Type Ia supernova looks dimmer because of 0.4 magnitudes of extinction. Which formula should I use to get the real distance?',
      expected: ['distance_modulus_with_extinction', 'distance_modulus']
    },
    {
      q: 'If a star is 70 parsecs away, how do I get the parallax angle in arcseconds?',
      expected: ['parallax_from_distance']
    },
    {
      q: 'I know the linear separation and the distance to the binary. What gives me the angular separation in arcseconds?',
      expected: ['angular_separation_arcsec', 'angular_size']
    },
    {
      q: 'What relation gives the physical separation in AU from an angular separation in arcseconds?',
      expected: ['linear_separation_from_angular']
    },
    {
      q: 'A cloud is in virial equilibrium. Which formula gives the virial temperature from mass, radius, mean particle mass, and k_B?',
      expected: ['virial_temperature_gas']
    },
    {
      q: 'How do I estimate the virial velocity dispersion of a spherical gas cloud?',
      expected: ['virial_velocity_dispersion']
    },
    {
      q: 'For a Cepheid with known absolute magnitude, which formula should I use to estimate the pulsation period?',
      expected: ['period_luminosity_cepheid_classical']
    },
    {
      q: 'If brightness drops to 75 percent, what formula converts the flux ratio into a magnitude change?',
      expected: ['magnitude_change_flux_ratio']
    },
    {
      q: 'Which formula gives recessional speed when I know a galaxy distance and the Hubble constant?',
      expected: ['hubble_law']
    },
    {
      q: 'I have a peak wavelength of 400 nm and need the stellar temperature. What formula applies?',
      expected: ['wiens_law']
    }
  ];

  for (const { q, expected } of sciOlyParaphraseCases) {
    test(`SciOly paraphrase maps correctly: "${q}"`, async () => {
      const { expert } = createExpert();
      const result = expert.solveQuestion(q);
      expect(result.success).toBeTruthy();
      expect(expected).toContain(result.formula.id);
      expect(result.confidence).toBeGreaterThanOrEqual(45);
    });
  }

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

  test('hostile HTML-like input is normalized safely', async () => {
    const { expert } = createExpert();
    const result = expert.solveQuestion('<script>alert(1)</script> what is the orbital period of Earth around the Sun?');
    expect(result.success).toBeTruthy();
    expect(['kepler_third_law', 'orbital_period_general']).toContain(result.formula.id);
    expect(result.explanation).not.toContain('<script>');
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

