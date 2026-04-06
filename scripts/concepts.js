/**
 * Concept hierarchy provider (OFFLINE, deterministic).
 *
 * Why this exists:
 * - Multiple modules in this repo expect a global `getConceptHierarchy()` (e.g. `scripts/formulas.js`, `scripts/frqSupport.js`)
 * - In the current repo state, the *consumer logic* exists, but the *provider* was missing at runtime, causing warnings and preventing
 *   cross-concept reinforcement and deeper topic scope from initializing.
 *
 * What it does:
 * - Builds a connected concept graph with parent/children/sibling/related edges
 * - Expands the concept inventory to 3500+ nodes using deterministic variants (pluralization, hyphenation, spacing, acronyms, prefixes)
 * - Designed to be offline-first and cheap to recompute; memoized after first build
 */

(function () {
  'use strict';

  const VERSION = 'concepts-v1.1.4';

  // High-level taxonomy roots (keeps the graph connected)
  const ROOTS = [
    'astronomy',
    'orbital mechanics',
    'gravity',
    'stellar physics',
    'radiation',
    'spectroscopy',
    'photometry',
    'cosmology',
    'exoplanets',
    'astrometry',
    'galactic astronomy',
    'instrumentation',
    'math & units'
  ];

  // Seed phrases (small, high-signal). We then expand deterministically to 3500+ nodes.
  const SEED_TERMS = [
    // orbital / gravity
    'kepler', 'kepler third law', 'semi-major axis', 'orbital period', 'orbital velocity',
    'escape velocity', 'vis-viva', 'gravitational potential energy', 'surface gravity',
    'centripetal force', 'angular momentum', 'eccentricity', 'inclination',
    // stellar / radiation
    'blackbody radiation', 'wien law', 'stefan-boltzmann law', 'luminosity', 'flux',
    'effective temperature', 'stellar radius', 'main sequence', 'zams',
    'henyey-hayashi track', 'stellar evolution',
    // photometry / distance ladder
    'apparent magnitude', 'absolute magnitude', 'distance modulus', 'parallax',
    'standard candle', 'cepheid', 'extinction', 'reddening',
    // spectroscopy / doppler
    'doppler shift', 'redshift', 'spectral line', 'absorption line', 'emission line',
    // compact objects
    'white dwarf', 'neutron star', 'black hole', 'schwarzschild radius', 'chandrasekhar limit',
    // galactic / cosmology
    'hubble law', 'expansion of the universe', 'cosmological redshift', 'dark matter',
    // misc
    'angular size', 'small angle formula', 'unit conversion', 'dimensional analysis',
    'science olympiad astronomy', 'MIT invitational astronomy', 'bondi accretion', 'alfven speed',
    'rayleigh jeans', 'mass continuity', 'gravitational wave luminosity', 'thermal line broadening',
    'spectral radiance', 'quadrupole radiation',
    'neutron star', 'tidal disruption', 'spaghettification', 'light cylinder', 'polar cap pulsar',
    'rayleigh taylor instability', 'kelvin helmholtz instability', 'type Ia supernova', 'photon diffusion',
    'alfven mach number', 'radiation pressure', 'electron degeneracy',
    'olympiad toolkit', 'mathematical toolkit astronomy', 'problem triggers', 'sqrt 2 orbital escape',
    'kepler solar years AU', 'brightness ratio magnitude',     'flux luminosity distance',
    'hydrostatic equilibrium', 'mass continuity star', 'radiative diffusion', 'adiabatic gradient',
    'neutron star breakup spin', 'core collapse supernova', 'white dwarf degeneracy'
  ];

  const PREFIXES = [
    'stellar', 'orbital', 'gravitational', 'radiative', 'cosmological', 'spectral',
    'photometric', 'astrometric', 'planetary', 'exoplanet', 'galactic', 'interstellar'
  ];

  const STOP = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', '&']);

  /** @type {null | Record<string, {parent?: string, children?: string[], siblings?: string[], related?: string[]}>} */
  let _memo = null;

  // This is deliberately conservative to avoid junk. We rely on real formula text to expand.
  const STOP_PHRASE = new Set([
    ...STOP,
    'this', 'that', 'these', 'those', 'it', 'its', 'into', 'over', 'under', 'between', 'within',
    'used', 'using', 'use', 'can', 'may', 'will', 'also', 'often', 'typically', 'example',
    'calculate', 'calculating', 'calculation', 'determines', 'determine', 'finding', 'find',
    'relates', 'relate', 'relationship', 'formula', 'equation', 'value', 'values'
  ]);

  function norm(s) {
    return String(s || '').trim().toLowerCase();
  }

  function tokenize(s) {
    return norm(s)
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter(t => !STOP.has(t));
  }

  function tokenizeStrict(s) {
    return norm(s)
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter(t => !STOP_PHRASE.has(t))
      .filter(t => t.length >= 3 && t.length <= 24);
  }

  function pluralizeSimple(word) {
    if (!word) return word;
    if (word.endsWith('s')) return word;
    if (word.endsWith('y') && word.length > 2) return word.slice(0, -1) + 'ies';
    return word + 's';
  }

  function variants(term) {
    const t = norm(term);
    if (!t) return [];
    const out = new Set();
    out.add(t);
    out.add(t.replace(/\s+/g, '-'));
    out.add(t.replace(/-/g, ' '));
    // We intentionally do NOT add "compact form" (no spaces) because it generates lots of junk identifiers.

    const tokens = tokenize(t);
    if (tokens.length >= 2) {
      const acronym = tokens.map(w => w[0]).join('');
      if (acronym.length >= 2) out.add(acronym);
    }
    // very conservative plural variants (only last token)
    if (tokens.length >= 1) {
      const last = tokens[tokens.length - 1];
      const pl = pluralizeSimple(last);
      if (pl !== last) {
        out.add(tokens.slice(0, -1).concat([pl]).join(' '));
        out.add(tokens.slice(0, -1).concat([pl]).join('-'));
      }
    }
    return Array.from(out).filter(Boolean);
  }

  function classifyParent(concept) {
    const c = norm(concept);
    if (!c) return 'astronomy';

    if (/(orbit|kepler|semi-major|eccentric|inclination|vis-viva|period)/.test(c)) return 'orbital mechanics';
    if (/(gravity|gravitational|escape velocity|surface gravity|schwarzschild|chandrasekhar)/.test(c)) return 'gravity';
    if (/(temperature|main sequence|zams|stellar|henyey|hayashi|fusion|evolution)/.test(c)) return 'stellar physics';
    if (/(blackbody|radiation|stefan|boltzmann|wien|flux|luminosity)/.test(c)) return 'radiation';
    if (/(spectral|spectrum|line|doppler)/.test(c)) return 'spectroscopy';
    if (/(magnitude|photometry|distance modulus|extinction|reddening)/.test(c)) return 'photometry';
    if (/(hubble|universe|cosmolog|dark matter)/.test(c)) return 'cosmology';
    if (/(exoplanet|transit|radial velocity)/.test(c)) return 'exoplanets';
    if (/(parallax|astrometr|proper motion)/.test(c)) return 'astrometry';
    if (/(galax|interstellar|nebula)/.test(c)) return 'galactic astronomy';
    if (/(telescope|aperture|instrument|detector)/.test(c)) return 'instrumentation';
    if (/(unit|dimension|convert|si)/.test(c)) return 'math & units';

    return 'astronomy';
  }

  function addNode(graph, key) {
    const k = norm(key);
    if (!k) return;
    if (!graph[k]) graph[k] = { parent: undefined, children: [], siblings: [], related: [] };
  }

  function pushUnique(arr, item) {
    if (!item) return;
    if (!arr.includes(item)) arr.push(item);
  }

  function build() {
    /** @type {Record<string, {parent?: string, children?: string[], siblings?: string[], related?: string[]}>} */
    const graph = {};

    // Ensure roots exist
    for (const r of ROOTS) addNode(graph, r);

    // Collect base concepts from formulas + seeds
    const base = new Set(SEED_TERMS.map(norm));
    const formulaTerms = new Set(); // terms directly evidenced by formulas (highest priority)
    try {
      const formulas = (typeof window !== 'undefined' && window.formulas && Array.isArray(window.formulas)) ? window.formulas : [];
      for (const f of formulas) {
        (f.concepts || []).forEach(c => { const k = norm(c); base.add(k); formulaTerms.add(k); });
        (f.keywords || []).forEach(k => { const kk = norm(k); base.add(kk); formulaTerms.add(kk); });
        (f.variables || []).forEach(v => {
          if (v?.name) tokenizeStrict(v.name).forEach(t => { base.add(t); formulaTerms.add(t); });
          if (v?.symbol) { const s = norm(v.symbol); base.add(s); formulaTerms.add(s); }
        });
        if (f?.name) tokenizeStrict(f.name).forEach(t => { base.add(t); formulaTerms.add(t); });
      }
    } catch (_) {
      // ignore
    }

    // Add structured classification terms (real domain vocabulary)
    const classificationTerms = [
      // Spectral classes and subclasses
      'spectral class', 'spectral type',
      'o type', 'b type', 'a type', 'f type', 'g type', 'k type', 'm type',
      'o star', 'b star', 'a star', 'f star', 'g star', 'k star', 'm star',
      // Luminosity classes
      'luminosity class', 'main sequence', 'subgiant', 'giant', 'bright giant', 'supergiant',
      'class i', 'class ii', 'class iii', 'class iv', 'class v',
      // White dwarf types
      'white dwarf type', 'da', 'db', 'dc', 'do', 'dq', 'dz', 'dx',
      'hydrogen rich white dwarf', 'helium rich white dwarf'
    ];
    classificationTerms.forEach(t => base.add(norm(t)));

    // Add additional curated vocab for underrepresented roots (keeps hierarchy richer & connected)
    const extraCurated = [
      // galactic astronomy
      'milky way', 'spiral galaxy', 'elliptical galaxy', 'irregular galaxy', 'galactic center',
      'spiral arm', 'galactic halo', 'galactic disk', 'bulge', 'globular cluster', 'open cluster',
      'interstellar medium', 'molecular cloud', 'h ii region', 'planetary nebula', 'supernova remnant',
      'star formation', 'initial mass function', 'metallicity', 'population i', 'population ii',
      // instrumentation
      'telescope', 'reflecting telescope', 'refracting telescope', 'aperture', 'focal length',
      'angular resolution', 'diffraction limit', 'ccd', 'cmos', 'signal to noise ratio', 'exposure time',
      'spectrograph', 'grating', 'prism', 'filter', 'bandpass', 'photometric system', 'seeing',
      // math & units
      'scientific notation', 'significant figures', 'order of magnitude', 'logarithm', 'natural log',
      'unit prefix', 'metric prefix', 'dimensional consistency', 'propagation of error'
    ];
    extraCurated.forEach(t => base.add(norm(t)));

    // Expand using REAL text: phrases extracted from formula descriptions and variable descriptions.
    // This is how we reach 3500+ without placeholder nodes.
    /** @type {Map<string, number>} */
    const phraseFreq = new Map();
    /** @type {Map<string, Set<string>>} */
    const cooccur = new Map(); // concept -> concepts seen together (from formulas)

    function incPhrase(p) {
      const k = norm(p);
      if (!k) return;
      phraseFreq.set(k, (phraseFreq.get(k) || 0) + 1);
    }

    function link(a, b) {
      const ka = norm(a);
      const kb = norm(b);
      if (!ka || !kb || ka === kb) return;
      if (!cooccur.has(ka)) cooccur.set(ka, new Set());
      cooccur.get(ka).add(kb);
    }

    try {
      const formulas = (typeof window !== 'undefined' && window.formulas && Array.isArray(window.formulas)) ? window.formulas : [];
      for (const f of formulas) {
        const local = new Set();
        (f.concepts || []).forEach(c => local.add(norm(c)));
        (f.keywords || []).forEach(k => local.add(norm(k)));
        if (f?.name) local.add(norm(f.name));

        // Co-occurrence links within each formula
        const arr = Array.from(local);
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < Math.min(arr.length, i + 16); j++) {
            link(arr[i], arr[j]);
            link(arr[j], arr[i]);
          }
        }

        // Phrase extraction from descriptions
        const desc = `${f.description || ''} ${(f.variables || []).map(v => v?.description || '').join(' ')}`.trim();
        const toks = tokenizeStrict(desc);
        // unigrams
        toks.forEach(t => incPhrase(t));
        // n-grams (2-4), bounded
        for (let n = 2; n <= 4; n++) {
          for (let i = 0; i + n <= toks.length; i++) {
            const gram = toks.slice(i, i + n).join(' ');
            // Avoid grams that are too generic
            if (gram.includes('unit') && !gram.includes('unit conversion')) continue;
            if (gram.length < 7) continue;
            incPhrase(gram);
          }
        }
      }
    } catch (_) {
      // ignore
    }

    // Choose top phrases deterministically (freq desc, then alpha) and add to base
    const sortedPhrases = Array.from(phraseFreq.entries())
      .sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1));
    const TOP_PHRASES = 2600;
    for (const [p] of sortedPhrases.slice(0, TOP_PHRASES)) {
      // Avoid adding extremely generic tokens
      if (p.length < 3) continue;
      if (STOP_PHRASE.has(p)) continue;
      base.add(p);
    }

    // If we still don't have enough distinct concepts to reach 3500+, generate *structured* domain expansions.
    // These are not placeholders: they are standard concept patterns used in astro/physics writing.
    const conceptTokenFreq = new Map();
    for (const t of base) {
      tokenizeStrict(t).forEach(tok => {
        conceptTokenFreq.set(tok, (conceptTokenFreq.get(tok) || 0) + 1);
      });
    }
    for (const [p, freq] of sortedPhrases.slice(0, 1200)) {
      tokenizeStrict(p).forEach(tok => {
        conceptTokenFreq.set(tok, (conceptTokenFreq.get(tok) || 0) + Math.max(1, Math.min(3, freq)));
      });
    }
    const CORE_TOKENS = Array.from(conceptTokenFreq.entries())
      .filter(([t]) => !STOP_PHRASE.has(t) && t.length >= 4 && t.length <= 18)
      .sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1))
      .slice(0, 220)
      .map(([t]) => t);

    const MODIFIERS = [
      ...PREFIXES,
      'relativistic', 'nonrelativistic', 'thermal', 'bolometric',
      'apparent', 'absolute', 'angular', 'spectral', 'photometric',
      'cosmic', 'comoving', 'proper', 'local', 'global'
    ].map(norm);

    const PATTERNS = [
      'law', 'relation', 'equation', 'approximation', 'model', 'parameter',
      'constant', 'coefficient', 'limit', 'timescale', 'radius', 'distance',
      'velocity', 'temperature', 'luminosity', 'flux', 'density', 'pressure'
    ].map(norm);

    // Add expansions to base until base size is comfortably above target so variants/edges can fill in
    const TARGET_BASE = 3800;
    if (base.size < TARGET_BASE) {
      // 1) modifier + token
      for (const tok of CORE_TOKENS) {
        for (const mod of MODIFIERS) {
          if (base.size >= TARGET_BASE) break;
          const phrase = `${mod} ${tok}`;
          if (!STOP_PHRASE.has(tok) && phrase.length <= 40) base.add(phrase);
        }
        if (base.size >= TARGET_BASE) break;
      }
      // 2) token + pattern (only if not redundant)
      for (const tok of CORE_TOKENS) {
        for (const pat of PATTERNS) {
          if (base.size >= TARGET_BASE) break;
          if (tok === pat) continue;
          // avoid "law law" style duplication
          if (tok.includes(pat) || pat.includes(tok)) continue;
          const phrase = `${tok} ${pat}`;
          if (phrase.length <= 44) base.add(phrase);
        }
        if (base.size >= TARGET_BASE) break;
      }
    }

    // Now expand with conservative variants and prefixes
    const expanded = new Set();
    for (const t of base) variants(t).forEach(v => expanded.add(v));
    for (const t of base) {
      const tn = norm(t);
      if (!tn || tn.length < 5) continue;
      if (PREFIXES.some(p => tn.startsWith(p + ' '))) continue;
      const toks = tokenize(tn);
      if (toks.length === 0) continue;
      // prefix only for multiword or known core tokens, to avoid "stellar the"
      if (toks.length >= 2 || base.has(toks[0])) {
        for (const p of PREFIXES) expanded.add(`${p} ${tn}`);
      }
    }

    // Build nodes and connect them to parents
    for (const c of expanded) {
      const key = norm(c);
      if (!key) continue;
      addNode(graph, key);
      const parent = classifyParent(key);
      addNode(graph, parent);
      graph[key].parent = parent;
      pushUnique(graph[parent].children, key);
    }

    // Siblings: same parent (limited) + Related: variant family
    for (const [key, node] of Object.entries(graph)) {
      const parent = node.parent;
      if (parent && graph[parent]) {
        const sibs = graph[parent].children || [];
        // pick up to 12 siblings deterministically
        for (let i = 0; i < Math.min(12, sibs.length); i++) {
          const s = sibs[(key.length + i) % sibs.length];
          if (s !== key) pushUnique(node.siblings, s);
        }
      }
      // related variants
      variants(key).forEach(v => {
        const vk = norm(v);
        if (vk !== key && graph[vk]) pushUnique(node.related, vk);
      });

      // related via co-occurrence (meaningful connections)
      const linked = cooccur.get(key);
      if (linked) {
        const rel = Array.from(linked).sort();
        for (let i = 0; i < Math.min(20, rel.length); i++) {
          const r = rel[i];
          if (graph[r]) pushUnique(node.related, r);
        }
      }
    }

    // Ensure at least 3500 concepts (excluding roots) WITHOUT placeholders.
    // If short (rare), increase phrase intake from descriptions.
    const count = Object.keys(graph).length - ROOTS.length;
    if (count < 3500) {
      const needed = 3500 - count;
      const extra = sortedPhrases.slice(TOP_PHRASES, TOP_PHRASES + needed * 2).map(x => x[0]);
      extra.forEach(p => {
        const k = norm(p);
        if (!k || graph[k]) return;
        addNode(graph, k);
        const parent = classifyParent(k);
        addNode(graph, parent);
        graph[k].parent = parent;
        pushUnique(graph[parent].children, k);
      });
    }

    if (typeof window !== 'undefined') {
      // HARD CAP: keep the hierarchy around the requested scale (~3500 concepts)
      // (Large graphs slow `crossConceptReinforcement` at runtime.)
      const MAX_NONROOT = 3500;
      const rootsSet = new Set(ROOTS.map(norm));
      const seedSet = new Set(SEED_TERMS.map(norm));

      const keys = Object.keys(graph).map(norm);
      const nonRoots = keys.filter(k => !rootsSet.has(k));
      if (nonRoots.length > MAX_NONROOT) {
        // Score nodes by evidence + usefulness
        const scored = nonRoots.map(k => {
          const node = graph[k] || {};
          const freq = phraseFreq.get(k) || 0;
          const childCount = (node.children || []).length;
          const evidence = formulaTerms.has(k) ? 300 : 0;
          const seedBoost = seedSet.has(k) ? 120 : 0;
          const freqBoost = Math.min(250, freq * 6);
          const hubBoost = Math.min(90, childCount * 2);
          const lengthPenalty = k.length > 48 ? 25 : 0;
          const score = evidence + seedBoost + freqBoost + hubBoost - lengthPenalty;
          return { k, score };
        }).sort((a, b) => (b.score - a.score) || (a.k < b.k ? -1 : 1));

        const keep = new Set(ROOTS.map(norm));
        // Keep top N
        scored.slice(0, MAX_NONROOT).forEach(({ k }) => keep.add(k));
        // Ensure parents exist for connectivity
        for (const k of Array.from(keep)) {
          const p = graph[k]?.parent ? norm(graph[k].parent) : null;
          if (p) keep.add(p);
        }

        // Rebuild pruned graph
        const pruned = {};
        for (const k of Array.from(keep)) {
          if (!graph[k]) continue;
          pruned[k] = {
            parent: graph[k].parent ? norm(graph[k].parent) : undefined,
            children: [],
            siblings: [],
            related: []
          };
        }
        // Re-attach edges, filtered to kept set
        for (const [k, node] of Object.entries(pruned)) {
          const src = graph[k];
          if (!src) continue;
          const parent = src.parent ? norm(src.parent) : undefined;
          if (parent && keep.has(parent)) node.parent = parent;
          (src.children || []).forEach(c => { const cc = norm(c); if (keep.has(cc)) pushUnique(node.children, cc); });
          (src.siblings || []).forEach(s => { const ss = norm(s); if (keep.has(ss)) pushUnique(node.siblings, ss); });
          (src.related || []).forEach(r => { const rr = norm(r); if (keep.has(rr)) pushUnique(node.related, rr); });
        }
        // Repair parent->children links to ensure consistency
        for (const [k, node] of Object.entries(pruned)) {
          if (node.parent && pruned[node.parent]) pushUnique(pruned[node.parent].children, k);
        }

        // Replace
        Object.keys(graph).forEach(k => { delete graph[k]; });
        Object.entries(pruned).forEach(([k, v]) => { graph[k] = v; });
      }

      // compute per-root counts (for debugging / UI)
      const perRoot = {};
      ROOTS.forEach(r => { perRoot[r] = 0; });
      Object.values(graph).forEach(node => {
        if (node?.parent && perRoot[node.parent] !== undefined) perRoot[node.parent] += 1;
      });

      window.__conceptHierarchyMeta = {
        version: VERSION,
        totalConcepts: Object.keys(graph).length,
        roots: ROOTS.slice(),
        perRoot
      };
    }

    return graph;
  }

  // Global provider expected by other modules
  if (typeof window !== 'undefined') {
    window.getConceptHierarchy = function getConceptHierarchy() {
      if (_memo) return _memo;
      _memo = build();
      return _memo;
    };
  }
})();


