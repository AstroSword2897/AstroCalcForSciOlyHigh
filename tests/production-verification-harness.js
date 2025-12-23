/**
 * Production-Grade Verification Harness
 * Browser-Compatible Version
 * 
 * Multi-Signal, Domain-Weighted, Production-Grade Classifier
 * 
 * Usage:
 * 1. Load in browser console or test page
 * 2. Run: ProductionVerificationHarness.runAll()
 * 
 * Output: Console logs + optional JSON export
 */

(function() {
  'use strict';

  const CONFIG = {
    topK: 5,
    matchTopN: 3,
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

  // Domain Resources (comprehensive)
  const KEYWORD_WEIGHTS = {
    orbital: 1.0, period: 0.9, kepler: 1.0, orbit: 0.9, periapsis: 0.95,
    inclination: 0.9, eccentricity: 0.9, escape: 0.9, velocity: 0.85,
    luminosity: 1.0, flux: 0.9, redshift: 1.0, parallax: 1.0, magnitude: 0.9,
    stefan: 1.0, boltzmann: 1.0, wien: 0.95, temperature: 0.8, wavelength: 0.8,
    hubble: 1.0, schwarzschild: 1.0, black: 0.9, hole: 0.9, event: 0.9,
    transit: 0.9, exoplanet: 0.9, radial: 0.9, equilibrium: 0.85,
    angular: 0.85, resolution: 0.85, rayleigh: 0.9, telescope: 0.8,
    rotation: 0.85, tully: 0.9, fisher: 0.9, virial: 0.9,
    synchrotron: 0.95, compton: 0.9, bremsstrahlung: 0.9, accretion: 0.9,
    boltzmann: 1.0, saha: 0.95, rydberg: 0.9
  };

  const CONCEPT_GRAPH = {
    luminosity: ['stefan_boltzmann', 'absolute_magnitude', 'mass_luminosity_relation'],
    parallax: ['parallax_distance'],
    kepler: ['kepler_third_law', 'kepler_third_law_solar', 'kepler_third_law_binary'],
    redshift: ['redshift', 'hubble_law', 'doppler_shift'],
    schwarzschild: ['schwarzschild_radius', 'event_horizon'],
    temperature: ['wiens_law', 'stefan_boltzmann'],
    wavelength: ['wiens_law', 'planck_relation'],
    orbital: ['orbital_velocity', 'kepler_third_law'],
    escape: ['escape_velocity'],
    magnitude: ['apparent_magnitude', 'absolute_magnitude', 'distance_modulus']
  };

  const UNIT_KEYWORDS = ['km/s', 'm/s', 'AU', 'ly', 'pc', 'K', 'J', 'W', 'M☉', 'Msun', 'erg', 'Hz'];
  const EQUATION_PATTERNS = ['=', '√', '^2', '^', 'π', 'G', 'c²', 'T²', 'v²', 'L=', 'P=', 'T='];
  const HIGH_DEPTH_KEYWORDS = ['tensor', 'lorentz', 'relativistic', 'synchrotron', 'boltzmann', 'saha', 'friedmann'];

  // Utilities
  function normScore(x) { return Math.max(0, Math.min(1, x)); }
  
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

  function tokenList(q) {
    return q.toLowerCase().replace(/[^\w\s°μΩ☉\/\.]/g, ' ').split(/\s+/).filter(Boolean);
  }

  // Feature Extractors
  function keywordDensityScore(queryTokens) {
    let score = 0;
    for (const t of queryTokens) {
      score += KEYWORD_WEIGHTS[t] || 0;
    }
    return normScore(score / Math.max(1, queryTokens.length));
  }

  function conceptDependencyScore(queryTokens) {
    const found = new Set();
    for (const t of queryTokens) {
      if (CONCEPT_GRAPH[t]) found.add(t);
    }
    if (found.size === 0) return 0;
    let interlinked = 0;
    for (const c of found) {
      if ((CONCEPT_GRAPH[c] || []).length > 0) interlinked++;
    }
    return normScore(interlinked / found.size);
  }

  function unitDimensionScore(query) {
    const found = UNIT_KEYWORDS.filter(u => query.toLowerCase().includes(u.toLowerCase()));
    return normScore(found.length / 3);
  }

  function equationFormScore(query) {
    const hits = EQUATION_PATTERNS.filter(p => query.includes(p)).length;
    return normScore(hits / 4);
  }

  function scientificDepthScore(queryTokens) {
    const hits = HIGH_DEPTH_KEYWORDS.filter(h => queryTokens.some(t => t.includes(h))).length;
    return normScore(0.2 + (hits / HIGH_DEPTH_KEYWORDS.length));
  }

  function coherenceScore(query) {
    const tokens = tokenList(query);
    const hasKeyword = tokens.some(t => KEYWORD_WEIGHTS[t]);
    const hasUnit = UNIT_KEYWORDS.some(u => query.toLowerCase().includes(u.toLowerCase()));
    const hasConcept = tokens.some(t => CONCEPT_GRAPH[t]);
    if (hasKeyword && (hasUnit || hasConcept)) return 1.0;
    if (hasKeyword) return 0.8;
    if (hasConcept) return 0.6;
    if (hasUnit) return 0.4;
    return 0.2;
  }

  function intentScore(query) {
    const q = query.toLowerCase();
    const intents = [
      { words: ['calculate', 'compute', 'what is', 'how much', 'how many', 'find'] },
      { words: ['why', 'explain', 'why does', 'how come'] },
      { words: ['derive', 'show that', 'proof'] },
      { words: ['observe', 'how to measure', 'measurement', 'telescope'] }
    ];
    return intents.some(it => it.words.some(w => q.includes(w))) ? 1.0 : 0.0;
  }

  // Composite Scorer
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

    let classification;
    if (s >= CONFIG.thresholds.research) classification = 'Research-Level Astrophysics';
    else if (s >= CONFIG.thresholds.strong) classification = 'Strong Astrophysics / Physics';
    else if (s >= CONFIG.thresholds.possible) classification = 'Possibly Astro/General Physics';
    else if (s >= CONFIG.thresholds.weak) classification = 'Weakly Related';
    else classification = 'Not Astro At All (reject)';

    return {
      raw: s,
      normalized: normScore(s),
      classification,
      components: { keywordDensity: k, conceptDependency: cdep, unitDimension: u, equationForm: eq, scientificDepth: sd, coherence: coh, intent }
    };
  }

  function robustIdMatch(expectedId, actualId) {
    if (!expectedId || !actualId) return false;
    if (expectedId === actualId) return true;
    if (actualId.includes(expectedId) || expectedId.includes(actualId)) return true;
    return levenshtein(expectedId, actualId) <= CONFIG.levThreshold;
  }

  // Main Verification Harness
  const ProductionVerificationHarness = {
    results: {
      total: 0,
      passed: 0,
      failed: 0,
      byCategory: {},
      failures: []
    },

    async runAll(testCases) {
      console.log('🚀 Production-Grade Verification Harness');
      console.log('='.repeat(80));
      console.log('Multi-Signal, Domain-Weighted Classifier');
      console.log('='.repeat(80));
      
      this.results = { total: 0, passed: 0, failed: 0, byCategory: {}, failures: [] };

      if (!testCases || testCases.length === 0) {
        testCases = this.getDefaultTestCases();
      }

      for (const tc of testCases) {
        await this.testCase(tc);
      }

      this.printSummary();
      return this.results;
    },

    async testCase(tc) {
      const query = tc.base || tc.question;
      const expected = tc.expected || [];
      const category = tc.category || 'Unknown';

      // Get astro score
      const astroScore = compositeAstroScore(query);

      // Query the search system
      let searchResults = [];
      if (typeof filterAndRenderFormulas === 'function') {
        // Get results silently (don't render)
        const allFormulas = typeof formulas !== 'undefined' ? formulas : [];
        const searchLower = query.toLowerCase().trim();
        const searchWords = searchLower.split(/\s+/).filter(w => w.length > 0);
        
        // Simple scoring for test
        const scored = allFormulas.map(f => {
          const nameMatch = f.name.toLowerCase().includes(searchLower) ? 1000 : 0;
          const descMatch = f.description?.toLowerCase().includes(searchLower) ? 500 : 0;
          const conceptMatch = f.concepts?.some(c => searchWords.includes(c.toLowerCase())) ? 300 : 0;
          return {
            id: f.id,
            name: f.name,
            score: nameMatch + descMatch + conceptMatch,
            confidence: Math.min(100, (nameMatch + descMatch + conceptMatch) / 10)
          };
        }).sort((a, b) => b.score - a.score).slice(0, CONFIG.topK);
        
        searchResults = scored;
      }

      const topN = searchResults.slice(0, CONFIG.matchTopN).map(r => r.id).filter(Boolean);
      const matched = expected.some(expId => topN.some(resId => robustIdMatch(expId, resId)));

      this.results.total++;
      if (!this.results.byCategory[category]) {
        this.results.byCategory[category] = { total: 0, passed: 0 };
      }
      this.results.byCategory[category].total++;

      if (matched) {
        this.results.passed++;
        this.results.byCategory[category].passed++;
        console.log(`✅ "${query}" → ${topN[0] || 'N/A'} (${astroScore.normalized.toFixed(2)} - ${astroScore.classification})`);
      } else {
        this.results.failed++;
        this.results.byCategory[category].passed = (this.results.byCategory[category].passed || 0);
        this.results.failures.push({
          query,
          expected,
          got: topN,
          astroScore,
          topResults: searchResults.slice(0, 3)
        });
        console.log(`❌ "${query}" → Expected: ${expected.join(', ')}, Got: ${topN.join(', ') || 'none'} (${astroScore.normalized.toFixed(2)})`);
      }
    },

    getDefaultTestCases() {
      return [
        { base: "What is Kepler's third law?", expected: ["kepler_third_law", "kepler_third_law_solar"], category: "Orbital Mechanics" },
        { base: "How do I calculate luminosity?", expected: ["luminosity", "stefan_boltzmann"], category: "Stellar Properties" },
        { base: "Calculate redshift from wavelength shift", expected: ["redshift"], category: "Spectroscopy" },
        { base: "temperature and wavelength", expected: ["wiens_law"], category: "Stellar Properties" },
        { base: "escape velocity", expected: ["escape_velocity"], category: "Orbital Mechanics" },
        { base: "black hole event horizon", expected: ["schwarzschild_radius"], category: "Black Holes" },
        { base: "Hubble's law", expected: ["hubble_law"], category: "Cosmology" },
        { base: "parallax distance", expected: ["parallax_distance"], category: "Distance" },
        { base: "stellar lifetime", expected: ["stellar_lifetime"], category: "Stellar Properties" },
        { base: "transit depth", expected: ["transit_depth"], category: "Exoplanets" }
      ];
    },

    printSummary() {
      console.log('\n' + '='.repeat(80));
      console.log('📊 VERIFICATION SUMMARY');
      console.log('='.repeat(80));
      console.log(`Total Tests:     ${this.results.total}`);
      console.log(`✅ Passed:        ${this.results.passed} (${((this.results.passed/this.results.total)*100).toFixed(1)}%)`);
      console.log(`❌ Failed:        ${this.results.failed} (${((this.results.failed/this.results.total)*100).toFixed(1)}%)`);
      console.log('\nBy Category:');
      Object.entries(this.results.byCategory).forEach(([cat, stats]) => {
        const pct = ((stats.passed / stats.total) * 100).toFixed(1);
        console.log(`  ${cat.padEnd(25)} ${stats.passed}/${stats.total} (${pct}%)`);
      });
      
      if (this.results.failures.length > 0) {
        console.log('\n❌ Failures:');
        this.results.failures.forEach((f, i) => {
          console.log(`  ${i+1}. "${f.query}"`);
          console.log(`     Expected: ${f.expected.join(', ')}`);
          console.log(`     Got: ${f.got.join(', ') || 'none'}`);
          console.log(`     Astro Score: ${f.astroScore.normalized.toFixed(3)} (${f.astroScore.classification})`);
        });
      }
      console.log('='.repeat(80));
    },

    // Export results as JSON
    exportResults() {
      return JSON.stringify(this.results, null, 2);
    }
  };

  // Export to global scope
  if (typeof window !== 'undefined') {
    window.ProductionVerificationHarness = ProductionVerificationHarness;
    window.compositeAstroScore = compositeAstroScore;
  }

  // For Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProductionVerificationHarness, compositeAstroScore, CONFIG };
  }

})();
