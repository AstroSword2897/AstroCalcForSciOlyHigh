/**
 * Formula Knowledge Graph (offline-first, deterministic)
 *
 * Provides per-formula:
 * - 10 concise "topics" with specific details
 * - 3-level related formula hierarchy computed via confidence scores
 *
 * Level rules (per user request):
 * - Level 1: 5 closest connected formulas
 * - Level 2: formulas connected to Level 1 formulas (moderate)
 * - Level 3: all remaining formulas with scored connection detail
 *
 * Exposes:
 * - window.formulaKnowledgeGraph.get(formulaId)
 * - window.displayRelatedFormulas(formula) -> renders topics + relationship layers
 */

(function () {
  'use strict';

  const VERSION = 'fkg-v1.0.0';

  /** @type {Map<string, any>} */
  const memo = new Map();
  /** @type {Map<string, Set<string>>} */
  const expandedConceptCache = new Map();
  /** @type {Map<string, Set<string>>} */
  const variableSigCache = new Map();
  /** @type {Map<string, string[]>} */
  const formulaCategoryCache = new Map();

  const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'from', 'by',
    'this', 'that', 'these', 'those', 'used', 'using', 'use', 'can', 'may', 'will',
    'calculate', 'calculating', 'calculation', 'determine', 'determines', 'finding', 'find'
  ]);

  function norm(s) {
    return String(s || '').trim().toLowerCase();
  }

  function uniq(arr) {
    const out = [];
    const seen = new Set();
    for (const x of arr || []) {
      const k = norm(x);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(k);
    }
    return out;
  }

  function tokenize(text) {
    return norm(text)
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .filter(t => t.length >= 3 && t.length <= 24)
      .filter(t => !STOP_WORDS.has(t));
  }

  function getFormulas() {
    if (typeof window !== 'undefined' && Array.isArray(window.formulas)) return window.formulas;
    if (typeof formulas !== 'undefined' && Array.isArray(formulas)) return formulas; // eslint-disable-line no-undef
    return [];
  }

  function getHierarchy() {
    if (typeof window !== 'undefined' && typeof window.getConceptHierarchy === 'function') {
      return window.getConceptHierarchy();
    }
    return {};
  }

  function getFormulaCategoriesFor(id) {
    if (formulaCategoryCache.has(id)) return formulaCategoryCache.get(id);
    const cats = [];
    const fc = (typeof window !== 'undefined' && window.formulaCategories) ? window.formulaCategories : null;
    if (fc) {
      for (const [cat, ids] of Object.entries(fc)) {
        if (Array.isArray(ids) && ids.includes(id)) cats.push(cat);
      }
    }
    formulaCategoryCache.set(id, cats);
    return cats;
  }

  function getVariableSignature(formula) {
    const id = formula?.id;
    if (!id) return new Set();
    const cached = variableSigCache.get(id);
    if (cached) return cached;
    const sig = new Set();
    (formula.variables || []).forEach(v => {
      if (v?.symbol) sig.add(norm(v.symbol));
      if (v?.name) tokenize(v.name).forEach(t => sig.add(t));
    });
    variableSigCache.set(id, sig);
    return sig;
  }

  function expandConcepts(formula) {
    const id = formula?.id;
    if (!id) return new Set();
    const cached = expandedConceptCache.get(id);
    if (cached) return cached;

    const h = getHierarchy();
    const base = new Set();
    uniq(formula.concepts).forEach(c => base.add(c));
    uniq(formula.keywords).forEach(k => base.add(k));
    if (formula.name) tokenize(formula.name).forEach(t => base.add(t));
    if (formula.description) tokenize(formula.description).slice(0, 40).forEach(t => base.add(t));
    (formula.variables || []).forEach(v => {
      if (v?.name) tokenize(v.name).forEach(t => base.add(t));
      if (v?.description) tokenize(v.description).slice(0, 12).forEach(t => base.add(t));
    });

    // Expand through hierarchy with strict caps to keep it meaningful
    const expanded = new Set(base);
    for (const c of Array.from(base)) {
      const node = h[norm(c)];
      if (!node) continue;
      if (node.parent) expanded.add(norm(node.parent));
      (node.children || []).slice(0, 6).forEach(x => expanded.add(norm(x)));
      (node.siblings || []).slice(0, 6).forEach(x => expanded.add(norm(x)));
      (node.related || []).slice(0, 14).forEach(x => expanded.add(norm(x)));
    }

    // Add category tags as concepts for better connectivity
    getFormulaCategoriesFor(id).forEach(cat => expanded.add(norm(cat)));

    // Hard cap (deterministic): keep smallest lexicographically after sorting by length+alpha
    const arr = Array.from(expanded)
      .filter(Boolean)
      .sort((a, b) => (a.length - b.length) || (a < b ? -1 : 1));
    const capped = new Set(arr.slice(0, 380));
    expandedConceptCache.set(id, capped);
    return capped;
  }

  function jaccard(aSet, bSet) {
    if (!aSet.size || !bSet.size) return 0;
    let inter = 0;
    const [small, big] = aSet.size <= bSet.size ? [aSet, bSet] : [bSet, aSet];
    for (const x of small) if (big.has(x)) inter++;
    const union = aSet.size + bSet.size - inter;
    return union > 0 ? inter / union : 0;
  }

  function hasDirectRelationship(a, b) {
    try {
      const ra = a?.relationships?.relatedTo || [];
      const rb = b?.relationships?.relatedTo || [];
      if (ra.includes(b.id) || rb.includes(a.id)) return true;
      // formulaRelationships (if present) includes auto-discovered links too
      if (typeof window !== 'undefined' && window.formulaRelationships?.getRelatedFormulas) {
        const relA = window.formulaRelationships.getRelatedFormulas(a.id);
        return Array.isArray(relA?.all) && relA.all.includes(b.id);
      }
    } catch (_) {
      // ignore
    }
    return false;
  }

  function computeConnectionConfidence(source, target) {
    const aC = expandConcepts(source);
    const bC = expandConcepts(target);
    const aV = getVariableSignature(source);
    const bV = getVariableSignature(target);

    const conceptSim = jaccard(aC, bC);
    const varSim = jaccard(aV, bV);

    const aCats = getFormulaCategoriesFor(source.id);
    const bCats = getFormulaCategoriesFor(target.id);
    const catMatch = aCats.some(c => bCats.includes(c)) ? 1 : 0;

    const relBoost = hasDirectRelationship(source, target) ? 1 : 0;

    // Weighted “pure confidence score” (0..100)
    const confidenceRaw =
      100 * (
        0.62 * conceptSim +
        0.16 * varSim +
        0.10 * catMatch +
        0.12 * relBoost
      );

    const confidence = Math.max(0, Math.min(100, Math.round(confidenceRaw)));

    // Reasons (top shared concepts)
    const shared = [];
    for (const c of aC) {
      if (bC.has(c)) shared.push(c);
      if (shared.length >= 8) break;
    }

    return {
      id: target.id,
      name: target.name,
      confidence,
      reasons: {
        sharedConcepts: shared.slice(0, 5),
        conceptSim: Number(conceptSim.toFixed(3)),
        varSim: Number(varSim.toFixed(3)),
        categoryMatch: !!catMatch,
        directRelationship: !!relBoost
      }
    };
  }

  // Topic quality validation
  const GENERIC_TERMS = new Set([
    'astronomy', 'astrophysics', 'physics', 'space', 'science', 
    'math', 'universe', 'cosmic', 'celestial', 'observation'
  ]);
  
  function isQualityTopic(topic) {
    const t = norm(topic);
    if (!t || t.length < 2) return false; // Must be at least 2 chars
    
    // Reject generic terms
    if (GENERIC_TERMS.has(t)) return false;
    
    // Must have at least 2 words OR be a compound term with hyphen/underscore
    const wordCount = t.split(/\s+/).length;
    const isCompound = t.includes('-') || t.includes('_');
    
    if (wordCount < 2 && !isCompound) {
      // Allow single words only if they're very specific (e.g., "kepler", "doppler")
      // Check if it's in the formula name or is a unique identifier
      return false;
    }
    
    return true;
  }

  function buildTopics(formula) {
    const concepts = uniq(formula.concepts);
    const keywords = uniq(formula.keywords);
    const vars = (formula.variables || []).map(v => v?.symbol).filter(Boolean).slice(0, 6);

    const cats = getFormulaCategoriesFor(formula.id);
    const h = getHierarchy();

    const candidates = new Map(); // topic -> score
    function add(topic, score) {
      const t = norm(topic);
      if (!t) return;
      
      // Apply quality filter (but allow some flexibility for core terms)
      if (!isQualityTopic(t) && score < 9) {
        // Only reject low-scoring generic terms
        return;
      }
      
      candidates.set(t, (candidates.get(t) || 0) + score);
    }

    cats.forEach(c => add(c, 8));
    concepts.slice(0, 18).forEach(c => add(c, 10));
    keywords.slice(0, 18).forEach(k => add(k, 6));

    // Add parents of concepts for better "topic" framing (but penalized)
    concepts.slice(0, 18).forEach(c => {
      const node = h[norm(c)];
      if (node?.parent) add(node.parent, 3.5); // Reduced from 7 (50% penalty)
    });

    // Add top phrases from description (2-3 grams), conservative
    const toks = tokenize(formula.description || '');
    for (let i = 0; i + 2 <= toks.length; i++) {
      add(`${toks[i]} ${toks[i + 1]}`, 2);
      if (i + 3 <= toks.length) add(`${toks[i]} ${toks[i + 1]} ${toks[i + 2]}`, 1);
    }

    // Sort and pick top 10, avoiding near-duplicates
    const ranked = Array.from(candidates.entries())
      .sort((a, b) => (b[1] - a[1]) || (a[0] < b[0] ? -1 : 1))
      .map(([t]) => t);

    const topics = [];
    const used = new Set();
    for (const t of ranked) {
      if (topics.length >= 10) break;
      if (used.has(t)) continue;
      // avoid “topic contained within topic”
      if (topics.some(x => (x.topic && (x.topic.includes(t) || t.includes(x.topic))))) continue;
      used.add(t);

      const detail =
        `Used in ${cats[0] ? cats[0] : 'astronomy'}; connects to ${concepts.slice(0, 2).join(', ') || 'core concepts'}` +
        `${vars.length ? `; typical variables: ${vars.join(', ')}` : ''}.`;

      topics.push({ topic: t, detail });
    }

    // Ensure exactly 10 by padding with category/variable-derived topics (still real)
    while (topics.length < 10) {
      const fallback = topics.length < cats.length
        ? cats[topics.length]
        : (vars[topics.length - cats.length] ? `variable: ${vars[topics.length - cats.length]}` : null);
      if (!fallback) break;
      const t = norm(fallback);
      if (!t || topics.some(x => x.topic === t)) break;
      topics.push({ topic: t, detail: `Directly relevant to ${formula.name}.` });
    }

    return topics.slice(0, 10);
  }

  // Helper: check if two formulas share at least one topic
  function hasSharedTopic(f1, f2) {
    const topics1 = new Set(buildTopics(f1).map(t => t.topic));
    const topics2 = new Set(buildTopics(f2).map(t => t.topic));
    for (const t of topics1) {
      if (topics2.has(t)) return true;
    }
    return false;
  }

  function buildHierarchyForFormula(formula, allFormulas) {
    const scored = [];
    for (const other of allFormulas) {
      if (other.id === formula.id) continue;
      scored.push(computeConnectionConfidence(formula, other));
    }
    scored.sort((a, b) => b.confidence - a.confidence);

    // Level 1: top 5, confidence ≥ 60%
    const level1Threshold = 60;
    const level1 = scored
      .filter(x => x.confidence >= level1Threshold)
      .slice(0, 5);
    const level1Ids = new Set(level1.map(x => x.id));

    // Level2: confidence ≥ 35% AND shared topic AND connected via Level1
    const level2Candidates = new Map(); // id -> best confidence object
    const moderateThreshold = 35;
    
    for (const l1 of level1) {
      const l1Formula = allFormulas.find(f => f.id === l1.id);
      if (!l1Formula) continue;
      const rels = (l1Formula.relationships?.relatedTo || []).slice(0, 25);
      
      for (const id of rels) {
        if (!id || id === formula.id || level1Ids.has(id)) continue;
        const f2 = allFormulas.find(f => f.id === id);
        if (!f2) continue;
        const conf = computeConnectionConfidence(formula, f2);
        if (conf.confidence < moderateThreshold) continue;
        
        // STRICT: Must have shared topic
        if (!hasSharedTopic(formula, f2)) continue;
        
        const prev = level2Candidates.get(id);
        if (!prev || conf.confidence > prev.confidence) level2Candidates.set(id, conf);
      }
      
      // also add top few of l1 by similarity (without relying on relationships)
      for (const c of scored.slice(0, 25)) {
        if (c.id === formula.id || level1Ids.has(c.id)) continue;
        if (c.confidence < moderateThreshold) continue;
        
        const f2 = allFormulas.find(f => f.id === c.id);
        if (!f2) continue;
        
        // STRICT: Must have shared topic
        if (!hasSharedTopic(formula, f2)) continue;
        
        if (!level2Candidates.has(c.id)) level2Candidates.set(c.id, c);
        if (level2Candidates.size >= 24) break;
      }
    }
    const level2 = Array.from(level2Candidates.values())
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 24);
    const level2Ids = new Set(level2.map(x => x.id));

    // Level3: everything else, with connection detail (sorted)
    const level3 = scored
      .filter(x => !level1Ids.has(x.id) && !level2Ids.has(x.id))
      .map(x => ({
        ...x,
        // "in depth" reason: include up to 5 shared concepts
        reasons: {
          ...x.reasons,
          sharedConcepts: (x.reasons.sharedConcepts || []).slice(0, 5)
        }
      }));

    return { 
      level1: {
        formulas: level1,
        threshold: level1Threshold,
        description: 'Closest - top 5 by confidence ≥60%'
      },
      level2: {
        formulas: level2,
        threshold: moderateThreshold,
        description: 'Moderate - confidence ≥35% AND shared topic, via Level 1',
        requiresSharedTopic: true
      },
      level3: {
        formulas: level3,
        threshold: 0,
        description: 'All remaining - shown on demand only'
      }
    };
  }

  function escapeHtml(str) {
    const s = String(str ?? '');
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderFormulaKnowledge(formula) {
    const topicsEl = document.getElementById('formula-topics-container');
    const relatedEl = document.getElementById('related-formulas-container');
    if (!topicsEl || !relatedEl) {
      console.warn('[FormulaKnowledgeGraph] Containers not found', {
        topicsEl: !!topicsEl,
        relatedEl: !!relatedEl
      });
      return;
    }

    const data = window.formulaKnowledgeGraph.get(formula.id);

    // Ensure visible (legacy CSS hides related container by default)
    topicsEl.style.display = 'block';
    relatedEl.style.display = 'block';

    // Topics
    topicsEl.innerHTML = `
      <div class="formula-topics">
        <h4>🧠 Topics (10)</h4>
        <div class="topics-grid">
          ${data.topics.map(t => `
            <div class="topic-chip">
              <div class="topic-title">${escapeHtml(t.topic)}</div>
              <div class="topic-detail">${escapeHtml(t.detail)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    function renderList(items, label) {
      return `
        <div class="related-layer">
          <div class="related-layer-header">
            <h5>${escapeHtml(label)}</h5>
          </div>
          <div class="related-items">
            ${items.map(item => `
              <button class="related-formula-btn" data-formula-id="${escapeHtml(item.id)}" title="${escapeHtml(item.name)}">
                <div class="rf-name">${escapeHtml(item.name)}</div>
                <div class="rf-meta">
                  <span class="rf-confidence">${item.confidence}%</span>
                  ${item.reasons?.sharedConcepts?.length ? `<span class="rf-concepts">${escapeHtml(item.reasons.sharedConcepts.join(', '))}</span>` : ''}
                </div>
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Extract formulas from level objects (v2.1.0+ structure)
    const level1 = data.connections.level1.formulas || data.connections.level1;
    const level2 = data.connections.level2.formulas || data.connections.level2;
    const level3 = data.connections.level3.formulas || data.connections.level3;
    const level1Desc = data.connections.level1.description || 'Level 1 — Closest (Top 5)';
    const level2Desc = data.connections.level2.description || 'Level 2 — Moderate via Level 1';
    const level3Desc = data.connections.level3.description || 'All Remaining';
    
    const l3Preview = level3.slice(0, 25);
    relatedEl.innerHTML = `
      <div class="related-formulas">
        <h4>🔗 Connected Formulas (Confidence Hierarchy)</h4>
        ${renderList(level1, level1Desc)}
        ${renderList(level2, level2Desc)}
        <details class="related-layer-details">
          <summary>Level 3 — ${level3Desc} (${level3.length})</summary>
          ${renderList(l3Preview, 'Top of Level 3 (preview)')}
          <div class="related-note">Showing first 25. Use search to find any formula; all are scored in this layer.</div>
        </details>
      </div>
    `;

    // click handler for related buttons
    relatedEl.querySelectorAll('.related-formula-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-formula-id');
        const target = getFormulas().find(f => f.id === id);
        if (target && typeof window.selectFormula === 'function') {
          window.selectFormula(target);
        }
      });
    });
  }

  function buildForFormulaId(formulaId) {
    const all = getFormulas();
    const formula = all.find(f => f.id === formulaId);
    if (!formula) return null;

    const topics = buildTopics(formula);
    const connections = buildHierarchyForFormula(formula, all);
    return { version: VERSION, formulaId, topics, connections };
  }

  function init() {
    // Ensure relationship discovery has run (improves connectivity)
    try {
      if (typeof window !== 'undefined' && window.formulaRelationships?.autoDiscoverRelationships) {
        window.formulaRelationships.autoDiscoverRelationships();
      }
    } catch (_) {
      // ignore
    }

    if (typeof window !== 'undefined') {
      console.log('[FormulaKnowledgeGraph] ✅ Loaded', { version: VERSION });
      window.formulaKnowledgeGraph = {
        version: VERSION,
        get: (formulaId) => {
          const key = String(formulaId || '');
          if (!key) return null;
          if (memo.has(key)) return memo.get(key);
          const data = buildForFormulaId(key);
          memo.set(key, data);
          return data;
        },
        invalidate: () => {
          memo.clear();
          expandedConceptCache.clear();
          variableSigCache.clear();
          formulaCategoryCache.clear();
        }
      };

      // Hook used by FormulaSelector via UIModuleOrchestrator
      window.displayRelatedFormulas = function (formula) {
        if (!formula?.id) return;
        try {
          console.log('[FormulaKnowledgeGraph] Rendering for', formula.id, formula.name);
          renderFormulaKnowledge(formula);
        } catch (e) {
          console.error('[FormulaKnowledgeGraph] render error:', e);
        }
      };

      // Optional: prewarm minimal caches for snappy first click
      window.addEventListener('DOMContentLoaded', () => {
        const all = getFormulas();
        if (all.length) {
          // warm first few only
          all.slice(0, 8).forEach(f => {
            try { expandConcepts(f); } catch (_) {}
          });
        }
      });
    }
  }

  init();
})();


