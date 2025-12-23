/**
 * astro-verifier.js
 * Production verification harness for "ANY astrophysics question"
 * 
 * Multi-Signal, Domain-Weighted, Production-Grade Classifier
 * 
 * Run: node tests/astro-verifier.js
 * 
 * Requirements:
 * - Node >= 16 (for fs/promises)
 * - Your formula-search function must be available
 * 
 * Output:
 * - ./reports/astro-verification-<ts>.json
 * - ./reports/astro-failures-<ts>.csv
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ---------------------------
   Configuration / Thresholds
   --------------------------- */

const CONFIG = {
  topK: 5,
  matchTopN: 3,
  reportDir: path.resolve(__dirname, '../reports'),
  weights: {
    keywordDensity: 0.22,
    conceptDependency: 0.18,
    unitDimension: 0.15,
    equationForm: 0.15,
    scientificDepth: 0.12,
    coherence: 0.10,
    intent: 0.08
  },
  thresholds: {
    research: 0.85,
    strong: 0.7,
    possible: 0.5,
    weak: 0.3
  },
  levThreshold: 2
};

/* ---------------------------
   Utilities
   --------------------------- */

function levenshtein(a = '', b = '') {
  const la = a.length, lb = b.length;
  if (!la) return lb;
  if (!lb) return la;
  const v0 = new Array(lb + 1).fill(0);
  const v1 = new Array(lb + 1).fill(0);
  for (let j = 0; j <= lb; j++) v0[j] = j;
  for (let i = 0; i < la; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < lb; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= lb; j++) v0[j] = v1[j];
  }
  return v1[lb];
}

function normScore(x) { return Math.max(0, Math.min(1, x)); }

function nowTs() { return new Date().toISOString().replace(/[:.]/g, '-'); }

/* ---------------------------
   Domain Resources
   --------------------------- */

// Comprehensive keyword weights from actual formula database
const KEYWORD_WEIGHTS = {
  // Celestial Mechanics
  orbital: 1.0, period: 0.9, kepler: 1.0, orbit: 0.9, periapsis: 0.95,
  inclination: 0.9, eccentricity: 0.9, semi: 0.8, major: 0.7, axis: 0.7,
  escape: 0.9, velocity: 0.85, vis: 0.85, viva: 0.85, tidal: 0.8,
  roche: 0.85, limit: 0.7, synodic: 0.85, binary: 0.9, system: 0.6,
  
  // Astrophysics
  luminosity: 1.0, flux: 0.9, redshift: 1.0, parallax: 1.0, magnitude: 0.9,
  apparent: 0.85, absolute: 0.85, bolometric: 0.9, color: 0.8, index: 0.7,
  stefan: 1.0, boltzmann: 1.0, wien: 0.95, displacement: 0.85,
  temperature: 0.8, wavelength: 0.8, peak: 0.7, blackbody: 0.9,
  
  // Stellar Physics
  fusion: 0.9, core: 0.8, collapse: 0.85, metallicity: 0.9, hr: 0.85,
  diagram: 0.7, main: 0.8, sequence: 0.8, giant: 0.8, dwarf: 0.8,
  supergiant: 0.85, lifetime: 0.9, stellar: 0.9, mass: 0.85,
  
  // Cosmology
  expansion: 0.9, hubble: 1.0, dark: 0.9, matter: 0.8, baryon: 0.85,
  acoustic: 0.85, oscillation: 0.8, cmb: 0.9, cosmic: 0.9, microwave: 0.85,
  background: 0.7, universe: 0.8, age: 0.8, critical: 0.85, density: 0.8,
  friedmann: 0.9, equation: 0.7,
  
  // Black Holes & Relativity
  schwarzschild: 1.0, black: 0.9, hole: 0.9, event: 0.9, horizon: 0.9,
  isco: 0.85, innermost: 0.8, stable: 0.7, circular: 0.7, time: 0.8,
  dilation: 0.85, gravitational: 0.9, redshift: 1.0, hawking: 0.9,
  temperature: 0.8, relativistic: 0.9, doppler: 0.9,
  
  // Exoplanets
  transit: 0.9, depth: 0.8, exoplanet: 0.9, planet: 0.8, radial: 0.9,
  velocity: 0.85, semi: 0.8, amplitude: 0.8, equilibrium: 0.85,
  habitable: 0.9, zone: 0.7,
  
  // Telescopes & Observations
  angular: 0.85, resolution: 0.85, rayleigh: 0.9, criterion: 0.8,
  magnification: 0.8, light: 0.7, gathering: 0.7, power: 0.6,
  plate: 0.7, scale: 0.6, telescope: 0.8,
  
  // Galactic Dynamics
  rotation: 0.85, curve: 0.8, tully: 0.9, fisher: 0.9, virial: 0.9,
  mass: 0.85, faber: 0.9, jackson: 0.9, dark: 0.9, matter: 0.8,
  
  // High Energy
  synchrotron: 0.95, radiation: 0.8, compton: 0.9, scattering: 0.8,
  bremsstrahlung: 0.9, accretion: 0.9, luminosity: 1.0,
  
  // Atomic Physics
  boltzmann: 1.0, saha: 0.95, rydberg: 0.9, partition: 0.85, function: 0.7,
  electron: 0.8, density: 0.8, ionization: 0.85, excitation: 0.85
};

// Concept dependency graph (from actual formula relationships)
const CONCEPT_GRAPH = {
  luminosity: ['stefan_boltzmann', 'absolute_magnitude', 'mass_luminosity_relation'],
  parallax: ['parallax_distance'],
  kepler: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary', 'orbital_period'],
  redshift: ['redshift', 'hubble_law', 'doppler_shift'],
  schwarzschild: ['schwarzschild_radius', 'event_horizon'],
  temperature: ['wiens_law', 'stefan_boltzmann', 'blackbody_radiation'],
  wavelength: ['wiens_law', 'planck_relation', 'photon_energy'],
  orbital: ['orbital_velocity', 'kepler_third_law', 'vis_viva_equation'],
  escape: ['escape_velocity'],
  magnitude: ['apparent_magnitude', 'absolute_magnitude', 'distance_modulus'],
  distance: ['parallax_distance', 'distance_modulus', 'luminosity_distance'],
  hubble: ['hubble_law', 'universe_age'],
  mass: ['mass_luminosity_relation', 'virial_mass', 'binary_total_mass'],
  stellar: ['stellar_lifetime', 'mass_luminosity_relation', 'hr_diagram']
};

const UNIT_KEYWORDS = [
  'km/s', 'm/s', 'm/s²', 'AU', 'ly', 'pc', 'pc.', 'K', 'J', 'W', 'M☉', 'Msun',
  'erg', 'Hz', 'G', 'Gauss', 'eV', 'MeV', 'GeV', 'parsec', 'lightyear',
  'solar', 'mass', 'kg', 'g', 'cm', 'm', 'km', 's', 'yr', 'year', 'days'
];

const EQUATION_PATTERNS = [
  '=', '√', '^2', '^', 'π', 'G', 'c²', 'c^2', 'T²', 'T^2', 'r²', 'r^2',
  'v²', 'v^2', 'M²', 'M^2', 'L=', 'P=', 'T=', 'a=', 'd=', 'z=',
  'λ=', 'ν=', 'f=', 'E=', 'F=', 'σ', 'α', 'β', 'γ', 'δ', 'ε'
];

const HIGH_DEPTH_KEYWORDS = [
  'tensor', 'lorentz', 'relativistic', 'synchrotron', 'spectral',
  'boltzmann', 'saha', 'rydberg', 'partition', 'virial', 'friedmann',
  'schwarzschild', 'hawking', 'compton', 'bremsstrahlung', 'accretion',
  'tully', 'fisher', 'faber', 'jackson', 'isco', 'gravitational',
  'redshift', 'dilation', 'metallicity', 'oscillation', 'baryon'
];

/* ---------------------------
   Feature Extractors
   --------------------------- */

function tokenList(q) {
  return q
    .toLowerCase()
    .replace(/[^\w\s°μΩ☉\/\.]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function keywordDensityScore(queryTokens) {
  let score = 0;
  let totalWeight = 0;
  for (const t of queryTokens) {
    const w = KEYWORD_WEIGHTS[t] || 0;
    score += w;
    totalWeight += 1;
  }
  return totalWeight === 0 ? 0 : normScore(score / Math.max(1, totalWeight));
}

function conceptDependencyScore(queryTokens) {
  const found = new Set();
  for (const t of queryTokens) {
    if (CONCEPT_GRAPH[t]) found.add(t);
  }
  if (found.size === 0) return 0;
  
  let interlinked = 0;
  let total = 0;
  for (const c of found) {
    total++;
    if ((CONCEPT_GRAPH[c] || []).length > 0) interlinked++;
  }
  return normScore(interlinked / total);
}

function unitDimensionScore(query) {
  const found = UNIT_KEYWORDS.filter(u => 
    query.toLowerCase().includes(u.toLowerCase())
  );
  return normScore(found.length / Math.max(1, 3));
}

function equationFormScore(query) {
  const hits = EQUATION_PATTERNS.filter(p => query.includes(p)).length;
  return normScore(hits / 4);
}

function scientificDepthScore(queryTokens) {
  const hits = HIGH_DEPTH_KEYWORDS.filter(h => 
    queryTokens.some(t => t.includes(h))
  ).length;
  return normScore(0.2 + (hits / Math.max(1, HIGH_DEPTH_KEYWORDS.length)));
}

function coherenceScore(query) {
  const tokens = tokenList(query);
  const hasKeyword = tokens.some(t => KEYWORD_WEIGHTS[t]);
  const hasUnit = UNIT_KEYWORDS.some(u => query.toLowerCase().includes(u.toLowerCase()));
  const hasConcept = tokens.some(t => CONCEPT_GRAPH[t]);
  
  // Coherent if has at least one strong signal
  if (hasKeyword && (hasUnit || hasConcept)) return 1.0;
  if (hasKeyword) return 0.8;
  if (hasConcept) return 0.6;
  if (hasUnit) return 0.4;
  return 0.2;
}

function intentScore(query) {
  const q = query.toLowerCase();
  const intents = [
    { name: 'compute', words: ['calculate', 'compute', 'what is', 'how much', 'how many', 'find', 'determine'] },
    { name: 'explain', words: ['why', 'explain', 'why does', 'how come', 'what causes'] },
    { name: 'derive', words: ['derive', 'show that', 'proof', 'prove', 'demonstrate'] },
    { name: 'observe', words: ['observe', 'how to measure', 'measurement', 'telescope', 'detect'] },
    { name: 'theory', words: ['theory', 'principle', 'law', 'relationship', 'relation'] }
  ];
  
  let best = 0;
  for (const it of intents) {
    const hit = it.words.some(w => q.includes(w)) ? 1 : 0;
    if (hit) best = Math.max(best, 1);
  }
  return best;
}

/* ---------------------------
   Composite Scorer
   --------------------------- */

function compositeAstroScore(query) {
  const tokens = tokenList(query);
  const k = keywordDensityScore(tokens);
  const cdep = conceptDependencyScore(tokens);
  const u = unitDimensionScore(query);
  const eq = equationFormScore(query);
  const sd = scientificDepthScore(tokens);
  const coh = coherenceScore(query);
  const intent = intentScore(query);

  const s = (
    CONFIG.weights.keywordDensity * k +
    CONFIG.weights.conceptDependency * cdep +
    CONFIG.weights.unitDimension * u +
    CONFIG.weights.equationForm * eq +
    CONFIG.weights.scientificDepth * sd +
    CONFIG.weights.coherence * coh +
    CONFIG.weights.intent * intent
  );

  return {
    raw: s,
    normalized: normScore(s),
    components: {
      keywordDensity: k,
      conceptDependency: cdep,
      unitDimension: u,
      equationForm: eq,
      scientificDepth: sd,
      coherence: coh,
      intent
    },
    classification: classifyScore(normScore(s))
  };
}

function classifyScore(score) {
  if (score >= CONFIG.thresholds.research) return 'Research-Level Astrophysics';
  if (score >= CONFIG.thresholds.strong) return 'Strong Astrophysics / Physics';
  if (score >= CONFIG.thresholds.possible) return 'Possibly Astro/General Physics';
  if (score >= CONFIG.thresholds.weak) return 'Weakly Related';
  return 'Not Astro At All (reject)';
}

/* ---------------------------
   Fuzzing & Paraphrase Utilities
   --------------------------- */

function generateParaphrases(base) {
  const variants = new Set();
  base = base.trim();
  variants.add(base);
  variants.add(base.toLowerCase());
  variants.add(base.replace(/what is/gi, 'wut is'));
  variants.add(base.replace(/calculate/gi, 'calc'));
  variants.add(base + ' pls');
  variants.add('quick: ' + base);
  variants.add(base.replace(/\s+/g, ''));
  variants.add(base.replace(/[aeiou]/gi, ''));
  variants.add(base.split('').reverse().join(''));
  
  const toks = base.split(/\s+/);
  if (toks.length > 1) {
    const swapped = toks.slice().reverse().join(' ');
    variants.add(swapped);
  }
  return Array.from(variants);
}

/* ---------------------------
   Matching Utilities
   --------------------------- */

function robustIdMatch(expectedId, actualId) {
  if (!expectedId || !actualId) return false;
  if (expectedId === actualId) return true;
  if (actualId.includes(expectedId) || expectedId.includes(actualId)) return true;
  return levenshtein(expectedId, actualId) <= CONFIG.levThreshold;
}

/* ---------------------------
   Evaluation Harness
   --------------------------- */

async function runVerification({ testCases, indexQuery }) {
  await fs.mkdir(CONFIG.reportDir, { recursive: true });
  const ts = nowTs();
  
  const report = {
    meta: {
      ts,
      totalCases: 0,
      passed: 0,
      failed: 0,
      config: CONFIG,
      summaryByCategory: {}
    },
    failures: []
  };

  let totalQueried = 0;
  
  for (const tc of testCases) {
    const variants = generateParaphrases(tc.base || tc.question);
    
    for (const variant of variants) {
      totalQueried++;
      const astro = compositeAstroScore(variant);
      
      const results = await indexQuery(variant, CONFIG.topK) || [];
      const topN = (results.slice(0, CONFIG.matchTopN).map(r => r.id)).filter(Boolean);
      
      const matched = (tc.expected || []).some(expId =>
        topN.some(resId => robustIdMatch(expId, resId))
      );
      
      const caseResult = {
        base: tc.base || tc.question,
        variant,
        category: tc.category || 'Unknown',
        astroScore: astro,
        topResults: results.slice(0, CONFIG.topK).map(r => ({
          id: r.id,
          name: r.name,
          confidence: r.confidence || r.score
        })),
        matched,
        expected: tc.expected
      };
      
      report.meta.totalCases++;
      if (!report.meta.summaryByCategory[caseResult.category]) {
        report.meta.summaryByCategory[caseResult.category] = { total: 0, passed: 0 };
      }
      report.meta.summaryByCategory[caseResult.category].total++;
      
      if (matched) {
        report.meta.passed++;
        report.meta.summaryByCategory[caseResult.category].passed++;
      } else {
        report.meta.failed++;
        report.failures.push(caseResult);
      }
    }
  }
  
  report.meta.totalQueried = totalQueried;
  report.meta.overallAccuracy = (report.meta.passed / Math.max(1, report.meta.totalCases));
  report.meta.byCategory = Object.entries(report.meta.summaryByCategory).map(([cat, s]) => ({
    category: cat,
    total: s.total,
    passed: s.passed,
    accuracy: s.passed / Math.max(1, s.total)
  }));
  
  const outJson = path.join(CONFIG.reportDir, `astro-verification-${ts}.json`);
  await fs.writeFile(outJson, JSON.stringify(report, null, 2), 'utf8');
  
  const csvLines = ['base,variant,category,expected,topResults,astroScore,classification'];
  for (const f of report.failures) {
    const top = f.topResults.map(t => `${t.id}|${t.name}|${t.confidence}`).join(';').replace(/,/g, ' ');
    csvLines.push(`"${f.base.replace(/"/g, '""')}","${f.variant.replace(/"/g, '""')}","${f.category}","${(f.expected||[]).join(';')}","${top}","${f.astroScore.normalized.toFixed(3)}","${f.astroScore.classification}"`);
  }
  const outCsv = path.join(CONFIG.reportDir, `astro-failures-${ts}.csv`);
  await fs.writeFile(outCsv, csvLines.join('\n'), 'utf8');
  
  return { reportPath: outJson, failuresCsv: outCsv, report };
}

export { compositeAstroScore, runVerification, CONFIG, classifyScore };
